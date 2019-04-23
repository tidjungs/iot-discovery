import React, { Component } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, Label, AreaChart
} from 'recharts';


export default class Chart extends Component {
  render() {
    return (
      <AreaChart
        style={{
          // background: "#34495e",
          color: "white"
        }}
        width={this.props.width}
        height={this.props.height}
        data={this.props.data}
        margin={{
          top: 20, right: 40, left: 40, bottom: 10,
        }}
      >
        <defs>
          {
            this.props.keys.map(key =>
              <linearGradient id={`color${key.color}`} key={key.name} x1="0" y1="0" x2="0" y2="1" >
                <stop offset="5%" stopColor={key.color} stopOpacity={0} />
                <stop offset="95%" stopColor={key.color} stopOpacity={0} />
              </linearGradient>
            )
          }
        </defs>
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis
          dataKey="name"
          stroke="#a5a5a5"
          tick={{ fontSize: '12px', transform: 'translate(0, 12)' }}
        />

        <YAxis
          stroke="#a5a5a5"
          tick={{ fontSize: '12px', transform: 'translate(-12, 0)' }}

        >
          <Label fill="#e0e0e0" offset={20} value={this.props.yLabel} position="top" />
        </YAxis>

        <Tooltip
          contentStyle={{ background: "#1e2b38" }}
        />

        <Legend verticalAlign="top" iconSize={24} />
        {
          this.props.keys.map(key =>
            <Area
              key={key.name}
              dot={false}
              strokeWidth={3}
              dataKey={key.name}
              stroke={key.color}
              fillOpacity={1}
              fill={`url(#color${key.color})`}
            />
          )
        }
      </AreaChart >
    );
  }
}
