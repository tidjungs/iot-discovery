import React, { Component } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area, Label
} from 'recharts';


export default class Chart extends Component {
  render() {
    return (
      <AreaChart
        width={1200}
        height={300}
        data={this.props.data}
        margin={{
          top: 10, right: 40, left: 40, bottom: 10,
        }}
      >
        <defs>
          {
            this.props.keys.map(key =>
              <linearGradient id={key.name} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={key.color} stopOpacity={0.8} />
                <stop offset="100%" stopColor={key.color} stopOpacity={0} />
              </linearGradient>
            )
          }
        </defs>

        <CartesianGrid strokeDasharray="3 3" />

        <XAxis
          dataKey="name"
          tick={{ fontSize: '12px', transform: 'translate(0, 12)' }}
        />

        <YAxis
          // label="flow count"
          tick={{ fontSize: '12px', transform: 'translate(-12, 0)' }}

        >
          <Label offset={10} value={this.props.yLabel} position="top" />
        </YAxis>

        <Tooltip />

        <Legend verticalAlign="top" iconSize={16} />
        {
          this.props.keys.map(key =>
            <Area
              dataKey={key.name}
              stroke={key.color}
              fillOpacity={1}
              fill={`url(#${key.name})`}
            />
          )
        }
      </AreaChart >
    );
  }
}
