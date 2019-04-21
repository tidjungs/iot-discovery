import React, { PureComponent } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Label,
} from 'recharts';

export default class Example extends PureComponent {
  render() {
    return (
      <BarChart
        width={1200}
        height={500}
        data={this.props.data}
        margin={{
          top: 40, right: 10, left: 50, bottom: 50,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          interval={0}
          stroke="#a5a5a5"
          angle={10}
          dy={15}
          tick={{ fontSize: '12px' }}
        />
        <YAxis stroke="#a5a5a5" tick={{ fontSize: '12px' }}>
          <Label fill="#e0e0e0" offset={20} value={this.props.yLabel} position="top" />
        </YAxis>
        <Tooltip
          itemStyle={{ color: "white" }}
          contentStyle={{ background: "#1e2b38", color: this.props.color }}
        />
        <Bar dataKey="count" fill={this.props.color} barSize={40} />
      </BarChart>
    );
  }
}
