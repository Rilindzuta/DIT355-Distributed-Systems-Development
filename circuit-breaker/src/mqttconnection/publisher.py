import paho.mqtt.client as mqtt
import mqttconnection.blackboard


def connect(address):
    client = mqtt.Client()
    # Connect to broker
    client.connect(address)
    while True:
        payload = mqttconnection.blackboard.outgoing.get()
        client.publish(**payload)
