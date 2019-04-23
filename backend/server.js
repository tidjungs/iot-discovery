const mongoose = require('mongoose')
const cors = require('cors')
const fastify = require('fastify')({
  logger: true
})

fastify.use(cors())

const Flow = require('./models/Flow')

mongoose.connect("mongodb://localhost/flow_database")
  .then(() => console.log("MongoDB connected…"))
  .catch(err => console.log(err))

fastify.get('/', async (request, reply) => {
  return { 'message': 'May the force be with you.' }
})

fastify.get('/flow/time-series/:timeStampFirst/:timeStampLast', async (request, reply) => {
  const { timeStampFirst, timeStampLast } = request.params

  if ((!timeStampFirst || !timeStampLast) || timeStampLast < timeStampFirst) {
    return {
      'error': 'Wrong time stamp first or time stamp last.'
    }
  }

  const timeAggregate = await Flow.aggregate(
    [
      {
        $match: {
          $and:
            [
              {
                "time_stamp_first": {
                  '$gte': 1474500000000,
                }
              },
              {
                "time_stamp_last": {
                  '$lte': 1474800000000
                }
              },
            ]
        }
      },
      {
        $group: {
          "_id": {
            "$dateToString": {
              "format": "%m %d %Y %H:00",
              "date": {
                "$add": [
                  new Date(0),
                  "$time_stamp_first"
                ]
              }
            }
          },
          // "count": { "$sum": 1 },
          "count_iot": {
            "$sum": { $cond: [{ "$eq": ["$iot", 1] }, 1, 0] }
          },
          "iot_bytes": {
            "$sum": { $cond: [{ "$eq": ["$iot", 1] }, "$total_payload_byte", 0] }
          },
          "iot_packets": {
            "$sum": { $cond: [{ "$eq": ["$iot", 1] }, "$packet_count", 0] }
          },
          "count_non_iot": {
            "$sum": { $cond: [{ "$eq": ["$iot", 0] }, 1, 0] }
          },
          "non_iot_bytes": {
            "$sum": { $cond: [{ "$eq": ["$iot", 0] }, "$total_payload_byte", 0] }
          },
          "non_iot_packets": {
            "$sum": { $cond: [{ "$eq": ["$iot", 0] }, "$packet_count", 0] }
          },
        }
      }
    ])

  const sortedTimeAggregate = timeAggregate
    .sort((a, b) => {
      return new Date(a._id) - new Date(b._id)
    })

  return sortedTimeAggregate
    .map(t => ({
      ...t,
      _id: new Date(t._id).toUTCString(),
    }))
})

fastify.get('/flow/stat', async (request, reply) => {

  const sumByIot = await Flow.aggregate(
    [
      {
        $group: {
          _id: null,
          flow_count: { $sum: 1 },
          classify_iot: {
            $sum:
              { $cond: [{ "$eq": ["$iot", 1] }, 1, 0] }
          },
          classify_not_iot: {
            $sum:
              { $cond: [{ "$eq": ["$iot", 0] }, 1, 0] }
          },
          iot_ip_set: {
            $addToSet: {
              $cond: [{ "$eq": ["$iot", 1] }, "$src_ip", null]
            }
          },
          non_iot_ip_set: {
            $addToSet: {
              $cond: [{ "$eq": ["$iot", 0] }, "$src_ip", null]
            }
          },
          device_set: {
            $addToSet: "$device_name"
          }
        }
      },
      { $project: { _id: 0 } }
    ]
  )

  const sumByDevice = await Flow.aggregate(
    [
      {
        $group: {
          _id: "$device_name",
          count: { $sum: 1 },
        }
      }
    ]
  )
  const sumByIotReplaceIPSet = {
    ...sumByIot[0],
    iot_ip_count: sumByIot[0].iot_ip_set.length - 1,
    non_iot_ip_count: sumByIot[0].non_iot_ip_set.length - 1,
    device_count: sumByIot[0].device_set.length - 1
  }

  const sumByDeviceClean = sumByDevice.filter(device => device._id != "")
  const sortedSumByDeviceClean = sumByDeviceClean
    .sort((a, b) => {
      return b.count - a.count
    })


  return {
    ...sumByIotReplaceIPSet,
    devices: sortedSumByDeviceClean
  }
})

fastify.get('/flow/overall', async (request, reply) => {
  const response = await Flow.aggregate(
    [
      {
        $group: {
          _id: '$src_ip',
          packet_count: { $sum: "$packet_count" },
          classify_iot: {
            $sum:
              { $cond: [{ "$eq": ["$iot", 1] }, 1, 0] }
          },
          classify_not_iot: {
            $sum:
              { $cond: [{ "$eq": ["$iot", 0] }, 1, 0] }
          },
          devices: {
            $push: "$device_name"
          },
          total_payload_byte: { $sum: "$total_payload_byte" },
          count: { $sum: 1 },
          time_stamp_fisrt: { $min: "$time_stamp_first" },
          time_stamp_last: { $max: "$time_stamp_last" }
        }
      }
    ]
  )


  return response.map(r => {
    devices = {}
    for (deviceName of r.devices) {
      if (deviceName != "") {
        if (deviceName in devices) {
          devices[deviceName]++
        } else {
          devices[deviceName] = 1
        }
      }
    }
    r.devices = devices
    return r
  })
})

const start = async () => {
  try {
    await fastify.listen(8000)
    fastify.log.info(`server listening on ${fastify.server.address().port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()