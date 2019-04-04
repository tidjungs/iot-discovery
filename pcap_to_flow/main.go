package main

import (
	// "encoding/csv"
	"encoding/csv"
	"fmt"
	"os"
	"strconv"

	"github.com/google/gopacket"
	"github.com/google/gopacket/pcap"
)

var csvHeaders = []string{
	"timeStampFirst",
	"timeStampLast",
	"duration",
	"linkProtocol",
	"networkProtocol",
	"transportProtocol",
	"applicationProtocol",
	"srcMac",
	"dstMac",
	"srcIP",
	"dstIP",
	"srcPort",
	"dstPort",
	"packetCount",
	"totalPayloadByte",
	"appplicationPayloadByte",
}

// Flow is ...
type Flow struct {
	timeStampFirst          int64
	timeStampLast           int64
	duration                int64
	linkProtocol            string
	networkProtocol         string
	transportProtocol       string
	applicationProtocol     string
	srcMac                  string
	dstMac                  string
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
	if linkLayer := packet.LinkLayer(); linkLayer != nil {
		flow.srcMac = linkLayer.LinkFlow().Src().String()
		flow.dstMac = linkLayer.LinkFlow().Dst().String()
		flow.linkProtocol = linkLayer.LayerType().String()
	}

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
	// param 1 target.pcap
	// param 2 target.csv
	argsWithoutProg := os.Args[1:]
	if len(argsWithoutProg) < 2 {
		panic("not enough params")
	}

	r, err := pcap.OpenOffline(argsWithoutProg[0])
	if err != nil {
		panic(err)
	}
	packetSource := gopacket.NewPacketSource(r, r.LinkType())

	var (
		net       gopacket.Flow
		transport gopacket.Flow
	)

	flowMap := map[string]Flow{}
	flowOutput := []Flow{}
	flowCounter := 0

	for packet := range packetSource.Packets() {
		if nl := packet.NetworkLayer(); nl != nil {
			net = nl.NetworkFlow()
		}

		if tl := packet.TransportLayer(); tl != nil {
			transport = tl.TransportFlow()
		}

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
						flowOutput = append(flowOutput, f)
						delete(flowMap, flowKey)
					}
				}
			}
		}
	}

	for flowKey, f := range flowMap {
		if f.timeStampLast != 0 {
			flowOutput = append(flowOutput, f)
			delete(flowMap, flowKey)
		}
	}

	file, err := os.Create(argsWithoutProg[1])
	if err != nil {
		panic(err)
	}
	defer file.Close()

	writer := csv.NewWriter(file)
	defer writer.Flush()

	writer.Write(csvHeaders)
	for _, flow := range flowOutput {
		line := []string{
			strconv.FormatInt(flow.timeStampFirst, 10),
			strconv.FormatInt(flow.timeStampLast, 10),
			strconv.FormatInt(flow.duration, 10),
			flow.linkProtocol,
			flow.networkProtocol,
			flow.transportProtocol,
			flow.applicationProtocol,
			flow.srcMac,
			flow.dstMac,
			flow.srcIP,
			flow.dstIP,
			flow.srcPort,
			flow.dstPort,
			strconv.Itoa(flow.packetCount),
			strconv.Itoa(flow.totalPayloadByte),
			strconv.Itoa(flow.appplicationPayloadByte),
		}
		writer.Write(line)
	}

	fmt.Println(len(flowOutput), "flows")
}
