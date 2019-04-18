const mongoose = require('mongoose')
const flowController = require('./controllers/flowController')
const fastify = require('fastify')({
  logger: true
})

const Flow = require('./models/Flow')

mongoose.connect("mongodb://localhost/flow_database")
  .then(() => console.log("MongoDB connected…"))
  .catch(err => console.log(err))

// fastify.register(require('./first-route'))
// fastify.route({
//   method: 'GET',
//   url: '/api/flows',
//   handler: flowController.getFlowss
// })

fastify.get('/', async (request, reply) => {
  return { 'message': 'May the force be with you.' }
})

fastify.get('/flow', async (request, reply) => {
  return flowController.getFlows()
})

fastify.get('/sum/flow', async (request, reply) => {

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

  const sumByDeviceClean = sumByDevice.filter(device => device._id != "")

  return {
    ...sumByIot[0],
    devices: sumByDeviceClean
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