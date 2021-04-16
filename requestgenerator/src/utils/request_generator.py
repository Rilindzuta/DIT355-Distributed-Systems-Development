import paho.mqtt.client as mqtt
import time
from datetime import datetime
import json


def publish(address, topic, payload, sleep_time, random_value):
    client2 = mqtt.Client()
    client2.connect(address)
    client2.loop_start()
    topic = topic.replace("id", random_value.__str__())
    payload["userid"] = random_value
    while True:
        payload["issuance"] = int(datetime.timestamp(datetime.now()) * 1000)
        # By incrementing requestid and userid we simulate different requests by different users.
        payload["requestid"] += 1
        payload["userid"] += 1
        client2.publish(topic, json.dumps(payload))
        time.sleep(sleep_time)
