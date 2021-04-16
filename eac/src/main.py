import json
import urllib.request   
import paho.mqtt.client as mqtt
from multiprocessing import Queue
from threading import Thread
import time

mqttRequest = Queue() # We create a queue for the incoming payloads, we can then pop the queue when the request is completed.

def mqtt_publisher():
    client = mqtt.Client()
    client.connect('127.0.0.1') # Connect to the broker
    while True:
        if mqttRequest.qsize() > 0:
            client.publish("backend/eac", currentData) # Publish the dentist information
            mqttRequest.get()

if __name__ == "__main__":
    
    # Creating a first data point that is saved to this component to compare with the external repository.
    currentData = ''

    # Starting the publishing thread
    pubThread = Thread(target=mqtt_publisher).start()

    while True:
        # Get external data
        with urllib.request.urlopen("https://raw.githubusercontent.com/feldob/dit355_2020/master/dentists.json") as url:
            checkData = json.dumps(json.loads(url.read().decode("UTF-8")))

        # Compare current with new data, if true create a request to publish.
        if currentData != checkData:
            currentData = checkData
            mqttRequest.put("request")

        # Wait some time to do it again.
        time.sleep(5)