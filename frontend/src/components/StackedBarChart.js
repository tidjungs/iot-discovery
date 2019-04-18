import React, { PureComponent } from 'react';
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';


export default class Example extends PureComponent {
  render() {
    return (
      // <ResponsiveContainer
      //   width={500}
      //   height="100%"
      // >
      <BarChart
        height={300}
        width={500}
        data={this.props.data}
        margin={{
          top: 20, right: 30, left: 20, bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="IOT" stackId="a" fill="#8884d8" barSize={40} />
        <Bar dataKey="NON-IOT" stackId="a" fill="#82ca9d" barSize={40} />
      </BarChart>
      // </ResponsiveContainer>
    );
  }
}
