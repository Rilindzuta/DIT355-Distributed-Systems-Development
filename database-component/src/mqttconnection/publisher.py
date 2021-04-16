import paho.mqtt.client as mqtt
import main


def connect(address, base_topic):
    client = mqtt.Client()
    # Connect to broker
    client.connect(address)
    while True:
        payload = main.outgoing.get()
        try:
            topic = base_topic+payload[0]
            message = payload[1]
        except Exception as e:
            # TODO: Add publish to some error logger component
            topic = "tester/12345"
            message = e.__str__()
        client.publish(topic, message)
