import paho.mqtt.client as mqtt
import pybreaker
import mqttconnection.blackboard
import json

breaker = pybreaker.CircuitBreaker(
    fail_max=2,
    reset_timeout=5
)
breaker.close()


def on_message(client, userdata, message):
    payload = message.payload.decode("utf-8")
    msg = {"topic": message.topic, "payload": payload}
    # Store it in the incoming queue
    try:
        buffer_message(msg)
    except Exception as e:
        payload = {"message": "Sorry! An error occurred, try again later.",
                   "error": e.__str__(),
                   "payload": msg["payload"]}
        msg["error"] = True
        msg["payload"] = json.dumps(payload)
        mqttconnection.blackboard.incoming.put(msg)


def connect(address, topic):
    client = mqtt.Client()
    client.on_message = on_message
    # Connect to broker
    client.connect(address)
    # Subscribe to a topic
    client.subscribe(topic)
    # Start the loop
    client.loop_forever()


@breaker
def buffer_message(msg):
    # TODO: Discuss what this should actually be
    if mqttconnection.blackboard.incoming.qsize() < 50:
        mqttconnection.blackboard.incoming.put(msg)
    else:
        raise Exception
