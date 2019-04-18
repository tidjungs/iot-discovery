import React, { PureComponent } from 'react';
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';

export default class Example extends PureComponent {

  render() {
    return (
      <BarChart
        width={500}
        height={300}
        data={this.props.data}
        margin={{
          top: 5, right: 30, left: 20, bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="IOT" fill="#8884d8" barSize={40} />
        <Bar dataKey="NON-IOT" fill="#82ca9d" barSize={40} />
      </BarChart>
    );
  }
}
