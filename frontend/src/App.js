import React, { Component } from 'react'
// import StackedBarChart from './components/StackedBarChart'
import SimpleBarChart from './components/SimpleBarChart'
import SimpleLineChart from './components/SimpleLineChart'
import Card from './components/Card'
// import LineChart from './components/LineChart'

import './App.css'

const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
];
class App extends Component {
  state = {
    statistic: null,
    flowTimeSerieData: [],
    bytesTimeSerieData: [],
    packetTimeSerieData: [],
    deviceTimeSerieData: [],
  }

  componentDidMount() {
    this.loadData()
  }

  formatDate(date) {
    // return `${date.getHours()}:00`
    return `${date.getHours()}:00  ${date.getDate()} ${monthNames[date.getMonth()]}`
  }



  async loadData() {
    const response = await fetch("http://localhost:8000/flow/time-series")
    const data = await response.json()
    console.log(data)

    const flowTimeSerieData = data.map(d => {
      return {
        name: this.formatDate(new Date(d._id)),
        iot: d.count_iot,
        "non-iot": d.count_non_iot,
      }
    })

    const bytesTimeSerieData = data.map(d => {
      return {
        name: this.formatDate(new Date(d._id)),
        iot: d.iot_bytes / (1000 * 1000),
        "non-iot": d.non_iot_bytes / (1000 * 1000),
      }
    })

    const packetTimeSerieData = data.map(d => {
      return {
        name: this.formatDate(new Date(d._id)),
        iot: d.iot_packets,
        "non-iot": d.non_iot_packets,
      }
    })

    const responseStat = await fetch("http://localhost:8000/flow/stat")
    const jsonStat = await responseStat.json()

    const deviceTimeSerieData = jsonStat.devices.map(device => {
      return {
        name: device._id,
        count: device.count
      }
    })


    this.setState({
      statistic: {
        ...jsonStat,
        devices: undefined
      },
      flowTimeSerieData,
      bytesTimeSerieData,
      packetTimeSerieData,
      deviceTimeSerieData,
    })
  }

  getStatisticByKey = key => this.state.statistic !== null ? this.state.statistic[key] : "0"

  render() {
    return (
      <div className="main-container">
        <p className="main-title" style={{ fontSize: '24px' }}>Analytics Overview</p>
        <div className="card-container">
          <Card
            number={this.getStatisticByKey("flow_count")}
            subTitle="Total Flows"
            icon="flow"
          // color="#6C7A89"
          />
          <Card
            number={this.getStatisticByKey("classify_iot")}
            subTitle="Total IOT Flows"
            color="#1F4788"
            icon="iot"
          />
          <Card
            number={this.getStatisticByKey("classify_not_iot")}
            subTitle="Total NON-IOT Flows"
            color="#1F4788"
            icon="non-iot"
          />
          <Card
            number={this.getStatisticByKey("iot_ip_count")}
            subTitle="Total IOT IP Address"
            color="#4B77BE"
            icon="iot"
          />
          <Card
            number={this.getStatisticByKey("non_iot_ip_count")}
            subTitle="Total NON-IOT IP Address"
            color="#4B77BE"
            icon="non-iot"
          />
          <Card
            number={this.getStatisticByKey("device_count")}
            subTitle="IOT Devices Detected"
            // color="#6C7A89"
            icon="device"
          />
        </div>
        <div className="chart-container">
          <p className="main-title" >IOT & NON-IOT Flows</p>
          {
            this.state.flowTimeSerieData.length > 0 && (
              <SimpleLineChart
                width={1200}
                height={300}
                data={this.state.flowTimeSerieData}
                yLabel="flow count"
                keys={[
                  {
                    name: "iot",
                    color: "#806cfa",
                  },
                  {
                    name: "non-iot",
                    color: "#ffcc00"
                  }
                ]}
              />
            )
          }
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          < div className="chart-container" style={{ width: '580px' }}>
            <p className="main-title">IOT & NON-IOT Packets</p>
            {
              this.state.packetTimeSerieData.length > 0 && (
                <SimpleLineChart
                  width={580}
                  height={300}
                  data={this.state.packetTimeSerieData}
                  yLabel="packet count"
                  keys={[
                    {
                      name: "iot",
                      color: "#806cfa",
                    },
                    {
                      name: "non-iot",
                      color: "#f1c40f"
                    }
                  ]}
                />
              )
            }
          </div>
          <div className="chart-container" style={{ width: '580px' }}>
            <p className="main-title">IOT & NON-IOT Bytes</p>
            {
              this.state.bytesTimeSerieData.length > 0 && (
                <SimpleLineChart
                  width={580}
                  height={300}
                  data={this.state.bytesTimeSerieData}
                  yLabel="MB"
                  keys={[
                    {
                      name: "iot",
                      color: "#806cfa",
                    },
                    {
                      name: "non-iot",
                      color: "#eebb2d"
                    }
                  ]}
                />
              )
            }
          </div>
        </div >
        <div className="chart-container">
          <p className="main-title">Device Flows</p>
          {
            this.state.deviceTimeSerieData.length > 0 && (
              <SimpleBarChart
                data={this.state.deviceTimeSerieData}
                yLabel="flow count"
                color="#f1c40f"
              />
            )
          }
        </div>
      </div >
    );
  }
}

export default App;
