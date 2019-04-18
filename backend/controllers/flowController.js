const Flow = require('../models/Flow')

exports.getFlows = async (req, reply) => {
  // try {
  const cars = await Flow.find({}, 'src_ip iot device_name')
  return cars
  // } catch (err) {
  //   throw boom.boomify(err)
  // }
}