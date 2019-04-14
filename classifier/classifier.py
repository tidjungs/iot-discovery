import pika
import json
from sklearn.externals import joblib
from pymongo import MongoClient
client = MongoClient()
db = client.flow_database

model = joblib.load("saved_model.pkl")

credentials = pika.PlainCredentials('root', 'root')
connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost', credentials=credentials))
channel = connection.channel()
channel.queue_declare(queue='flow-queue')

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
  'dst_port_25050',
  'dst_port_49152',
  'dst_port_49153',
  'src_port_49152',
  'src_port_49153',
  'well_known_dst_port',
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

def callback(ch, method, properties, body):
  data = json.loads(body)
  x = []
  for feature in features:
    x.append(data[feature])
  result = model.predict([x])
  data["iot"] = result[0].item()
  print(data['src_ip'], result[0].item())
  flows = db.flows
  flows.insert_one(data)
  # print('One post: {0}'.format(result.inserted_id))

channel.basic_consume(
  queue='flow-queue', on_message_callback=callback, auto_ack=True)

print(' [*] Waiting for messages. To exit press CTRL+C')
channel.start_consuming()


