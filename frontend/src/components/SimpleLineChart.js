import React, { PureComponent } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';

const data = [
  {
    name: '16.00', 'IOT': 4000, 'NON-IOT': 2400, amt: 2400,
  },
  {
    name: '17.00', 'IOT': 3000, 'NON-IOT': 1398, amt: 2210,
  },
  {
    name: '18.00', 'IOT': 2000, 'NON-IOT': 9800, amt: 2290,
  },
  {
    name: '19.00', 'IOT': 2780, 'NON-IOT': 3908, amt: 2000,
  },
  {
    name: '20.00', 'IOT': 1890, 'NON-IOT': 4800, amt: 2181,
  },
  {
    name: '21.00', 'IOT': 2390, 'NON-IOT': 3800, amt: 2500,
  },
  {
    name: '22.00', 'IOT': 3490, 'NON-IOT': 4300, amt: 2100,
  },
];

export default class Example extends PureComponent {
  static jsfiddleUrl = 'https://jsfiddle.net/alidingling/xqjtetw0/';

  render() {
    return (
      <LineChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 5, right: 30, left: 20, bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="IOT" stroke="#8884d8" activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="NON-IOT" stroke="#82ca9d" />
      </LineChart>
    );
  }
}
