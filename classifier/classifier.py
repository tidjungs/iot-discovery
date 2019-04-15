import pika
import json
from sklearn.externals import joblib
from pymongo import MongoClient
client = MongoClient()
db = client.flow_database

model = joblib.load("saved_model_minimized.pkl")

credentials = pika.PlainCredentials('root', 'root')
connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost', credentials=credentials))
channel = connection.channel()
channel.queue_declare(queue='flow-queue')

features = [
  'http',
  'ntp',
  'https',
  'smtp_ssl',
  'ws_discovery',
  'upnp_evnt',
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

service_destination_port_mappers = [
  {
    'name': 'http',
    'port': '80'
  },
  {
    'name': 'ntp',
    'port': '123'
  },
  {
    'name': 'smtp_ssl',
    'port': '465'
  },
  {
    'name': 'https',
    'port': '443'
  },
  {
    'name': 'ws_discovery',
    'port': '3702'
  },
  {
    'name': 'upnp_evnt',
    'port': '5000'
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
  result = model.predict([x])
  flow["iot"] = result[0].item()
  flows = db.flows
  flows.insert_one(flow)
  print(flow['src_ip'], result[0])

channel.basic_consume(
  queue='flow-queue', on_message_callback=callback, auto_ack=True)

print(' [*] Waiting for messages. To exit press CTRL+C')
channel.start_consuming()


