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
        <defs>
          <linearGradient id={`bar-color${this.props.color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={this.props.color} stopOpacity={1} />
            <stop offset="95%" stopColor={this.props.color} stopOpacity={0.6} />
          </linearGradient>
        </defs>
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
        <Bar
          dataKey="count"
          barSize={40}
          fill={`url(#bar-color${this.props.color})`}
        />
      </BarChart>
    );
  }
}
