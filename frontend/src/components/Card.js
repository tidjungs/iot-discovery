import React from 'react'
import CountUp from 'react-countup'

const Card = ({ number, subTitle, color }) => {
  return (
    <div className="card" style={{ backgroundColor: color }}>
      <div>
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