const mongoose = require('mongoose')

const FlowSchema = new mongoose.Schema({
  'time_stamp_first': Number,
  'time_stamp_last': Number,
  'duration': Number,
  'network_protocol': String,
  'transport_protocol': String,
  'src_ip': String,
  'dst_ip': String,
  'src_port': String,
  'dst_port': String,
  'packet_count': Number,
  'total_payload_byte': Number,
  'application_payload_byte': Number,
  'iot': Boolean,
  'device_name': String,
})

module.exports = mongoose.model('Flow', FlowSchema)