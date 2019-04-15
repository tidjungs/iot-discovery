package main

import (
	"encoding/json"
	"fmt"
	"os"
	"time"

	"github.com/google/gopacket"
	"github.com/google/gopacket/pcap"
	"github.com/streadway/amqp"
)

var (
	device      string = "en1"
	snapshotLen int32  = 1600
	promiscuous bool   = true
	err         error
	timeout     time.Duration = 30 * time.Second
	handle      *pcap.Handle
)

// Flow is ...
type Flow struct {
	TimeStampFirst         int64  `json:"time_stamp_first"`
	TimeStampLast          int64  `json:"time_stamp_last"`
	Duration               int64  `json:"duration"`
	NetworkProtocol        string `json:"network_protocol"`
	TransportProtocol      string `json:"transport_protocol"`
	ApplicationProtocol    string `json:"application_protocol"`
	SrcIP                  string `json:"src_ip"`
	DstIP                  string `json:"dst_ip"`
	SrcPort                string `json:"src_port"`
	DstPort                string `json:"dst_port"`
	PacketCount            int    `json:"packet_count"`
	TotalPayloadByte       int    `json:"total_payload_byte"`
	ApplicationPayloadByte int    `json:"application_payload_byte"`
}

var timeOut int64 = 30 * 1000
var flushTime = 2000

func addDataFromLayerToFlow(packet gopacket.Packet, flow *Flow) {

	if networkLayer := packet.NetworkLayer(); networkLayer != nil {
		flow.SrcIP = networkLayer.NetworkFlow().Src().String()
		flow.DstIP = networkLayer.NetworkFlow().Dst().String()
		flow.NetworkProtocol = networkLayer.LayerType().String()
	}

	if transportLayer := packet.TransportLayer(); transportLayer != nil {
		flow.SrcPort = transportLayer.TransportFlow().Src().String()
		flow.DstPort = transportLayer.TransportFlow().Dst().String()
		flow.TransportProtocol = transportLayer.LayerType().String()
	}
}

func main() {

	conn, err := amqp.Dial("amqp://root:root@localhost:5672/")
	if err != nil {
		panic(err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		panic(err)
	}

	q, err := ch.QueueDeclare(
		"flow-queue", // name
		false,        // durable
		false,        // delete when unused
		false,        // exclusive
		false,        // no-wait
		nil,          // arguments
	)

	argsWithoutProg := os.Args[1:]
	if len(argsWithoutProg) < 1 {
		panic("not enough params")
	}

	r, err := pcap.OpenOffline(argsWithoutProg[0])
	if err != nil {
		panic(err)
	}
	packetSource := gopacket.NewPacketSource(r, r.LinkType())

	flowMap := map[string]Flow{}
	flowCounter := 0
	successCount := 0

L1:
	for packet := range packetSource.Packets() {

		nl := packet.NetworkLayer()
		tl := packet.TransportLayer()

		if nl != nil && tl != nil {
			net := nl.NetworkFlow()
			transport := tl.TransportFlow()
			flowID := fmt.Sprintf("%s:%s", net, transport)
			packetTimeStamp := (int64)(packet.Metadata().Timestamp.UnixNano() / (1000 * 1000))

			if flow, ok := flowMap[flowID]; ok {
				if !(flow.TimeStampFirst < packetTimeStamp) {

					if flow.TimeStampLast == 0 {
						flow.TimeStampLast = flow.TimeStampFirst
					}

					flow.TimeStampFirst = packetTimeStamp
					flow.Duration = flow.TimeStampLast - flow.TimeStampFirst
					addDataFromLayerToFlow(packet, &flow)
				}

				if flow.TimeStampLast < packetTimeStamp {
					flow.TimeStampLast = packetTimeStamp
					flow.Duration = flow.TimeStampLast - flow.TimeStampFirst
				}

				flow.PacketCount++
				flow.TotalPayloadByte += len(packet.Data())
				flowMap[flowID] = flow
			} else {
				flow := Flow{}
				flow.PacketCount = 1
				flow.TotalPayloadByte = len(packet.Data())
				flow.TimeStampFirst = packetTimeStamp

				addDataFromLayerToFlow(packet, &flow)

				if applicationLayer := packet.ApplicationLayer(); applicationLayer != nil {
					flow.ApplicationProtocol = applicationLayer.LayerType().String()
					flow.ApplicationPayloadByte = len(applicationLayer.Payload())
				}

				flowMap[flowID] = flow
				flowCounter++

				if flowCounter%flushTime == 0 {
					for flowKey, f := range flowMap {
						if f.TimeStampLast != 0 && packetTimeStamp-f.TimeStampLast > timeOut {
							b, err := json.Marshal(&f)
							if err != nil {
								panic(err)
							}

							err = ch.Publish(
								"",     // exchange
								q.Name, // routing key
								false,  // mandatory
								false,  // immediate
								amqp.Publishing{
									ContentType: "application/json",
									Body:        b,
								})
							if successCount == 20 {
								break L1
							}
							delete(flowMap, flowKey)
							successCount++
						}
					}
					// fmt.Println("%v", flowMap)
					flowCounter = 0
				}
			}

		}
	}
}
