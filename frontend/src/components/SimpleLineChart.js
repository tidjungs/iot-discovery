import React, { Component } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, Label
} from 'recharts';


export default class Chart extends Component {
  render() {
    return (
      <LineChart
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
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis
          dataKey="name"
          stroke="#e0e0e0"
          tick={{ fontSize: '12px', transform: 'translate(0, 12)' }}
        />

        <YAxis
          stroke="#e0e0e0"
          tick={{ fontSize: '12px', transform: 'translate(-12, 0)' }}

        >
          <Label fill="#e0e0e0" offset={20} value={this.props.yLabel} position="top" />
        </YAxis>

        <Tooltip />

        <Legend verticalAlign="top" iconSize={24} />
        {
          this.props.keys.map(key =>
            <Line
              dot={false}
              strokeWidth={3}
              dataKey={key.name}
              stroke={key.color}
              fillOpacity={1}
            />
          )
        }
      </LineChart >
    );
  }
}
