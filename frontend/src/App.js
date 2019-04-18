import React, { Component } from 'react';
import StackedBarChart from './components/StackedBarChart'
import SimpleBarChart from './components/SimpleBarChart'
import SimpleLineChart from './components/SimpleLineChart'

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


class App extends Component {
  render() {
    return (
      <div className="graph-container">
        {/* <SimpleLineChart />
        <SimpleLineChart />
        <StackedBarChart data={dsrPortFlows} />
        <StackedBarChart data={srcPortFlows} />
        <SimpleBarChart
          data={networkProtocolFlows}
        />
        <SimpleBarChart data={transportProtocolFlows}
        /> */}

      </div>
    );
  }
}

export default App;
