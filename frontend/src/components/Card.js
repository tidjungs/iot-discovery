import React from 'react'
import CountUp from 'react-countup'
import { TiWaves, TiDeviceLaptop, TiRss, TiGroup } from 'react-icons/ti';

const Card = ({ number, subTitle, color, icon, TiCog }) => {
  return (
    <div className="card" style={{ backgroundColor: color }}>
      <div>
        <div style={{ textAlign: 'center', color: "white" }}>
          {
            icon === "flow" && <TiWaves fontSize={22} />
          }
          {
            icon === "iot" && <TiRss fontSize={22} />
          }
          {
            icon === "non-iot" && <TiDeviceLaptop fontSize={22} />
          }
          {
            icon === "device" && <TiGroup fontSize={22} />
          }
        </div>
        <p className="card-title">
          <CountUp
            duration={2.75}
            end={number}
          />
        </p>
        <p className="card-sub-title">{subTitle}</p>
      </div>
    </div>
  )
}

export default Card