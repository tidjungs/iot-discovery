import pika
import json
from sklearn.externals import joblib
from pymongo import MongoClient
client = MongoClient()
db = client.flow_database

binary_model = joblib.load("binary_classify_model.pkl")
multiclass_model = joblib.load("multiclass_classify_model.pkl")

credentials = pika.PlainCredentials('root', 'root')
connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost', credentials=credentials))
channel = connection.channel()
channel.queue_declare(queue='flow-queue')

device_names = [
  'Belkin wemo motion sensor',
  'Belkin Wemo switch',
  'Samsung SmartCam',
  'Amazon Echo',
  'Insteon Camera',
  'Light Bulbs LiFX Smart Bulb',
  'Withings Smart Baby Monitor',
  'Netatmo Welcome',
  'Withings Aura smart sleep sensor',
  'Netatmo weather station',
  'TP-Link Day Night Cloud camera',
  'PIX-STAR Photo-frame',
  'HP Printer',
  'Triby Speaker',
]

features = [
  'dns',
  'dhcp_server',
  'http',
  'ntp',
  'https',
  'smtp_ssl',
  'imap_ssl',
  'ssdp',
  'icslap',
  'stm_pproc',
  'stun',
  'ws_discovery',
  'upnp_evnt',
  'xmpp',
  'android',
  'dstPort25050',
  'dstPort49152',
  'dstPort49153',
  'dstPort49154',
  'src_port_49152',
  'src_port_49153',
  'ephemeral_dst_port',
  'registed_dst_port',
  'ipv4',
  'ipv6',
  'tcp',
  'udp',
  'duration',
  'packet_count',
  'total_payload_byte',
  'application_payload_byte'
]
print(len(features))

service_destination_port_mappers = [
  {
    'name': 'dns',
    'port': '53'
  },
  {
    'name': 'dhcp_server',
    'port': '67'
  },
  {
    'name': 'http',
    'port': '80'
  },
  {
    'name': 'ntp',
    'port': '123'
  },
  {
    'name': 'https',
    'port': '443'
  },
  {
    'name': 'smtp_ssl',
    'port': '465'
  },
  {
    'name': 'imap_ssl',
    'port': '993'
  },
  {
    'name': 'ssdp',
    'port': '1900'
  },
  {
    'name': 'icslap',
    'port': '2869'
  },
  {
    'name': 'stm_pproc',
    'port': '3080'
  },
  {
    'name': 'stun',
    'port': '3478'
  },
  {
    'name': 'ws_discovery',
    'port': '3702'
  },
  {
    'name': 'upnp_evnt',
    'port': '5000'
  },
  {
    'name': 'xmpp',
    'port': '5222'
  },
  {
    'name': 'android',
    'port': '5228'
  },
  {
    'name': 'dstPort25050',
    'port': '25050'
  },
  {
    'name': 'dstPort49152',
    'port': '49152'
  },
  {
    'name': 'dstPort49153',
    'port': '49153'
  },
  {
    'name': 'dstPort49154',
    'port': '49154'
  }
]

service_source_port_mappers = [
  {
    'name': 'src_port_49152',
    'port': '49152'
  },
  {
    'name': 'src_port_49153',
    'port': '49153'
  }
]

def preprocessFlow(flow):
  preprocessed_flow = {}
  preprocessed_flow['duration'] = flow['duration']
  preprocessed_flow['packet_count'] = flow['packet_count']
  preprocessed_flow['total_payload_byte'] = flow['total_payload_byte']
  preprocessed_flow['application_payload_byte'] = flow['application_payload_byte']

  for m in service_destination_port_mappers:
    if flow['dst_port'] == m['port']:
      preprocessed_flow[m['name']] = 1
    else:
      preprocessed_flow[m['name']] = 0

  for m in service_source_port_mappers:
    if flow['src_port'] == m['port']:
      preprocessed_flow[m['name']] = 1
    else:
      preprocessed_flow[m['name']] = 0

  if flow['network_protocol'] == 'IPv4':
    preprocessed_flow['ipv4'] = 1
    preprocessed_flow['ipv6'] = 0
  elif flow['network_protocol'] == 'IPv6':
    preprocessed_flow['ipv4'] = 0
    preprocessed_flow['ipv6'] = 1
  else:
    preprocessed_flow['ipv4'] = 0
    preprocessed_flow['ipv6'] = 0

  if flow['transport_protocol'] == 'TCP':
    preprocessed_flow['tcp'] = 1
    preprocessed_flow['udp'] = 0
  elif flow['transport_protocol'] == 'UDP':
    preprocessed_flow['tcp'] = 0
    preprocessed_flow['udp'] = 1
  else:
    preprocessed_flow['tcp'] = 0
    preprocessed_flow['udp'] = 0

  if int(flow['dst_port']) < 1024:
    preprocessed_flow['registed_dst_port'] = 0
    preprocessed_flow['ephemeral_dst_port'] = 0
  elif int(flow['dst_port']) < 49152:
    preprocessed_flow['registed_dst_port'] = 1
    preprocessed_flow['ephemeral_dst_port'] = 0
  else:
    preprocessed_flow['registed_dst_port'] = 0
    preprocessed_flow['ephemeral_dst_port'] = 1

  return preprocessed_flow


def callback(ch, method, properties, body):
  flow = json.loads(body)
  preprocessed_flow = preprocessFlow(flow)
  x = []
  for feature in features:
    x.append(preprocessed_flow[feature])
  result_binary_model = binary_model.predict([x])

  if result_binary_model[0].item() == 1:
    result_multiclass_model = multiclass_model.predict([x])
    device_index = result_multiclass_model[0].item()
    print(flow['src_ip'], result_binary_model[0], device_names[device_index])
  else:
    print(flow['src_ip'], result_binary_model[0])

  # flow["iot"] = result[0].item()
  # flows = db.flows
  # flows.insert_one(flow)


channel.basic_consume(
  queue='flow-queue', on_message_callback=callback, auto_ack=True)

print(' [*] Waiting for messages. To exit press CTRL+C')
channel.start_consuming()


