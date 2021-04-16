import paho.mqtt.client as mqtt
import main
from mqttconnection.utils import message_parser


# Callback function
# header and message currently split by # for testing purposes
def on_message(client, userdata, message):
    # Parse the incoming message
    payload = message_parser.parse(message.topic, message.payload.decode("UTF-8"))
    # Store it in the incoming queue
    main.incoming.put(payload)


def connect(address, topic):
    client = mqtt.Client()
    client.on_message = on_message
    # Connect to broker
    client.connect(address)
    # Subscribe to a topic
    client.subscribe(topic)
    # Start the loop
    client.loop_forever()
