import React, { Component } from 'react';
// import StackedBarChart from './components/StackedBarChart'
// import SimpleBarChart from './components/SimpleBarChart'
import GradientAreaChart from './components/GradientAreaChart'
// import LineChart from './components/LineChart'

import './App.css';

const dsrPortFlows = [
  {
    name: 'DNS', 'IOT': 3000, 'NON-IOT': 2400,
  },
  {
    name: 'HTTP', 'IOT': 3000, 'NON-IOT': 1398,
  },
  {
    name: 'HTTPS', 'IOT': 2000, 'NON-IOT': 9800,
  },
  {
    name: 'NTP', 'IOT': 2780, 'NON-IOT': 3908,
  },
  {
    name: 'DHCP', 'IOT': 1890, 'NON-IOT': 4800,
  },
];

const srcPortFlows = [
  {
    name: '1992', 'IOT': 2800, 'NON-IOT': 2400,
  },
  {
    name: '663', 'IOT': 3000, 'NON-IOT': 4000,
  },
  {
    name: '111', 'IOT': 1200, 'NON-IOT': 2500,
  },
  {
    name: '123', 'IOT': 2780, 'NON-IOT': 1398,
  },
  {
    name: '32132', 'IOT': 1900, 'NON-IOT': 3500,
  },
];



const networkProtocolFlows = [
  {
    name: 'IPv4', 'IOT': 4000, 'NON-IOT': 2400
  },
  {
    name: 'IPv6', 'IOT': 3000, 'NON-IOT': 1398
  },
];

const transportProtocolFlows = [
  {
    name: 'TCP', 'IOT': 2000, 'NON-IOT': 2050
  },
  {
    name: 'UDP', 'IOT': 1500, 'NON-IOT': 700
  },
];

const iotFlows = [
  {
    name: 'TCP', 'IOT': 2000
  },
  {
    name: 'UDP', 'IOT': 1500
  },
]

const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
];
class App extends Component {
  state = {
    timeSerieData: []
  }

  componentDidMount() {
    this.loadData()
  }

  formatDate(date) {
    // return `${date.getHours()}:00`
    return `${date.getHours()}:00 ${date.getDate()} ${monthNames[date.getMonth()]}`
  }

  async loadData() {
    const response = await fetch("http://localhost:8000/time")
    const data = await response.json()
    const timeSerieData = data.map(d => {
      return {
        name: this.formatDate(new Date(d._id)),
        iot: d.count_iot,
        "non-iot": d.count_non_iot,
      }
    })
    this.setState({
      timeSerieData
    })
  }

  render() {
    return (
      <div className="main-container">
        <p className="main-title">Analytics Overview</p>
        <div className="card-container">
          {/* <div className="card">
            <div>
              <p className="card-title">21.2k</p>
              <p className="card-sub-title">Total Flows</p>
            </div>
          </div> */}
          <div className="card">
            <div>
              <p className="card-title">10k</p>
              <p className="card-sub-title">Total IOT Flows</p>
            </div>
          </div>
          <div className="card">
            <div>
              <p className="card-title">1.2k</p>
              <p className="card-sub-title">Total NON-IOT Flows</p>
            </div>
          </div>
          <div className="card">
            <div>
              <p className="card-title">10</p>
              <p className="card-sub-title">Total IOT IP Address</p>
            </div>
          </div>
          <div className="card">
            <div>
              <p className="card-title">20</p>
              <p className="card-sub-title">Total NON-IOT IP Address</p>
            </div>
          </div>
        </div>
        <div className="chart-container">
          <p className="main-title">IOT & NON-IOT Flows</p>
          {
            this.state.timeSerieData.length > 0 && (
              < GradientAreaChart
                data={this.state.timeSerieData}
                yLabel="flow count"
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
        {/* <SimpleLineChart />
        <SimpleLineChart />
        <StackedBarChart data={dsrPortFlows} />
        <StackedBarChart data={srcPortFlows} />
        <SimpleBarChart
          data={networkProtocolFlows}
        />
        <SimpleBarChart data={transportProtocolFlows}
        /> */}

      </div >
    );
  }
}

export default App;
