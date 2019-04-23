import React from 'react'
import CountUp from 'react-countup'
import { TiWaves, TiDeviceLaptop, TiRss, TiGroup } from 'react-icons/ti';

const Card = ({ number, subTitle, color, icon, fontColor }) => {
  return (
    <div className="card" style={{ backgroundColor: color }}>
      <div>
        <div style={{ textAlign: 'center', color: fontColor }}>
          {
            icon === "flow" && <TiWaves fontSize={36} />
          }
          {
            icon === "iot" && <TiRss fontSize={30} />
          }
          {
            icon === "non-iot" && <TiDeviceLaptop fontSize={30} />
          }
          {
            icon === "device" && <TiGroup fontSize={30} />
          }
        </div>
        <p className="card-title" style={{ color: fontColor }}>
          <CountUp
            duration={2.75}
            end={parseInt(number, 10)}
          />
        </p>
        <p className="card-sub-title" style={{ color: fontColor }}>{subTitle}</p>
      </div>
    </div>
  )
}

export default Card