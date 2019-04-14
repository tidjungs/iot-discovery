package main

import (
	"encoding/json"
	"fmt"
	"os"
	"strconv"
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

// OutputFlow is ...
type OutputFlow struct {
	Duration                int64 `json:"duration"`
	PacketCount             int   `json:"packet_count"`
	TotalPayloadByte        int   `json:"total_payload_byte"`
	AppplicationPayloadByte int   `json:"application_payload_byte"`
	Ipv4                    bool  `json:"ipv4"`
	Ipv6                    bool  `json:"ipv6"`
	TCP                     bool  `json:"tcp"`
	UDP                     bool  `json:"udp"`
	HTTPS                   bool  `json:"https"`
	HTTP                    bool  `json:"http"`
	DNS                     bool  `json:"dns"`
	NTP                     bool  `json:"ntp"`
	Stun                    bool  `json:"stun"`
	DstPort49152            bool  `json:"dst_port_49152"`
	DstPort49153            bool  `json:"dst_port_49153"`
	WsDiscovery             bool  `json:"ws_discovery"`
	UpnpEvnt                bool  `json:"upnp_evnt"`
	XMPP                    bool  `json:"xmpp"`
	SSDP                    bool  `json:"ssdp"`
	SMTPSSL                 bool  `json:"smtp_ssl"`
	DstPort25050            bool  `json:"dst_port_25050"`
	DstPort49154            bool  `json:"dst_port_49154"`
	Android                 bool  `json:"andriod"`
	IMAPSSL                 bool  `json:"imap_ssl"`
	StmPproc                bool  `json:"stm_pproc"`
	DHCPServer              bool  `json:"dhcp_server"`
	Icslap                  bool  `json:"icslap"`
	SrcPort49152            bool  `json:"src_port_49152"`
	SrcPort49153            bool  `json:"src_port_49153"`
	WellKnownDstPort        bool  `json:"well_known_dstPort"`
	EphemeralDstPort        bool  `json:"ephemeral_dst_port"`
	RegistedDstPort         bool  `json:"registed_dst_port"`
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

func convertFlowToOutputFlow(f *Flow) OutputFlow {
	opf := OutputFlow{}
	opf.Duration = f.duration
	opf.PacketCount = f.packetCount
	opf.TotalPayloadByte = f.totalPayloadByte
	opf.AppplicationPayloadByte = f.appplicationPayloadByte

	if f.networkProtocol == "IPv4" {
		opf.Ipv4 = true
	}

	if f.networkProtocol == "IPv6" {
		opf.Ipv6 = true
	}

	if f.transportProtocol == "TCP" {
		opf.TCP = true
	}

	if f.transportProtocol == "UDP" {
		opf.UDP = true
	}

	if f.dstPort == "53" {
		opf.DNS = true
	}

	if f.dstPort == "67" {
		opf.DHCPServer = true
	}

	if f.dstPort == "80" {
		opf.HTTP = true
	}

	if f.dstPort == "123" {
		opf.NTP = true
	}

	if f.dstPort == "443" {
		opf.HTTPS = true
	}

	if f.dstPort == "465" {
		opf.SMTPSSL = true
	}

	if f.dstPort == "993" {
		opf.IMAPSSL = true
	}

	if f.dstPort == "1900" {
		opf.SSDP = true
	}

	if f.dstPort == "2869" {
		opf.Icslap = true
	}

	if f.dstPort == "3080" {
		opf.StmPproc = true
	}

	if f.dstPort == "3478" {
		opf.Stun = true
	}

	if f.dstPort == "3702" {
		opf.WsDiscovery = true
	}

	if f.dstPort == "5000" {
		opf.UpnpEvnt = true
	}

	if f.dstPort == "5222" {
		opf.XMPP = true
	}

	if f.dstPort == "5228" {
		opf.Android = true
	}

	if f.dstPort == "25050" {
		opf.DstPort25050 = true
	}

	if f.dstPort == "49152" {
		opf.DstPort49152 = true
	}

	if f.dstPort == "49153" {
		opf.DstPort49153 = true
	}

	if f.dstPort == "49154" {
		opf.DstPort49154 = true
	}

	dstPortInt, err := strconv.Atoi(f.dstPort)
	if err != nil {
		panic(err)
	}

	if dstPortInt < 1024 {
		opf.WellKnownDstPort = true
	} else if dstPortInt < 49152 {
		opf.RegistedDstPort = true
	} else {
		opf.EphemeralDstPort = true
	}

	if f.srcPort == "49152" {
		opf.SrcPort49152 = true
	}

	if f.srcPort == "49153" {
		opf.SrcPort49153 = true
	}

	return opf
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
						if f.timeStampLast != 0 && packetTimeStamp-f.timeStampLast > timeOut {
							opf := convertFlowToOutputFlow(&f)
							b, err := json.Marshal(&opf)
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

							delete(flowMap, flowKey)
						}
					}
					// fmt.Println("%v", flowMap)
					flowCounter = 0
				}
			}

		}
	}
}
