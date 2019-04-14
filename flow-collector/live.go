package main

import (
	"fmt"
	"log"
	"time"

	"github.com/google/gopacket"
	"github.com/google/gopacket/pcap"
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
	timeStampFirst          int64
	timeStampLast           int64
	duration                int64
	networkProtocol         string
	transportProtocol       string
	applicationProtocol     string
	srcIP                   string
	dstIP                   string
	srcPort                 string
	dstPort                 string
	packetCount             int
	totalPayloadByte        int
	appplicationPayloadByte int
}

var timeOut int64 = 30 * 1000
var flushTime = 2000

func addDataFromLayerToFlow(packet gopacket.Packet, flow *Flow) {

	if networkLayer := packet.NetworkLayer(); networkLayer != nil {
		flow.srcIP = networkLayer.NetworkFlow().Src().String()
		flow.dstIP = networkLayer.NetworkFlow().Dst().String()
		flow.networkProtocol = networkLayer.LayerType().String()
	}

	if transportLayer := packet.TransportLayer(); transportLayer != nil {
		flow.srcPort = transportLayer.TransportFlow().Src().String()
		flow.dstPort = transportLayer.TransportFlow().Dst().String()
		flow.transportProtocol = transportLayer.LayerType().String()
	}
}

func main() {
	handle, err = pcap.OpenLive(device, snapshotLen, promiscuous, timeout)
	if err != nil {
		log.Fatal(err)
	}
	defer handle.Close()
	packetSource := gopacket.NewPacketSource(handle, handle.LinkType())

	flowMap := map[string]Flow{}
	flowCounter := 0
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
				if !(flow.timeStampFirst < packetTimeStamp) {

					if flow.timeStampLast == 0 {
						flow.timeStampLast = flow.timeStampFirst
					}

					flow.timeStampFirst = packetTimeStamp
					flow.duration = flow.timeStampLast - flow.timeStampFirst
					addDataFromLayerToFlow(packet, &flow)
				}

				if flow.timeStampLast < packetTimeStamp {
					flow.timeStampLast = packetTimeStamp
					flow.duration = flow.timeStampLast - flow.timeStampFirst
				}

				flow.packetCount++
				flow.totalPayloadByte += len(packet.Data())
				flowMap[flowID] = flow
			} else {
				flow := Flow{}
				flow.packetCount = 1
				flow.totalPayloadByte = len(packet.Data())
				flow.timeStampFirst = packetTimeStamp

				addDataFromLayerToFlow(packet, &flow)

				if applicationLayer := packet.ApplicationLayer(); applicationLayer != nil {
					flow.applicationProtocol = applicationLayer.LayerType().String()
					flow.appplicationPayloadByte = len(applicationLayer.Payload())
				}

				flowMap[flowID] = flow
				flowCounter++

				if flowCounter%flushTime == 0 {
					for flowKey, f := range flowMap {
						fmt.Println(packetTimeStamp, f.timeStampLast, timeOut)
						if f.timeStampLast != 0 && packetTimeStamp-f.timeStampLast > timeOut {
							fmt.Printf("%v", f)
							delete(flowMap, flowKey)
						}
					}
					break L1
					// fmt.Println("%v", flowMap)
					// flowCounter = 0
				}
			}

		}
	}
}
