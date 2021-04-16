from threading import Thread
from utils import request_generator
import random

# Address to mqtt broker
ADDRESS = "127.0.0.1"
# Topic to publish to
TOPIC = "circuitbreaker/id/appointment/create"
# Sleep time between requests in seconds
SLEEP_TIME = 10
# Number of threads to start
NUMBER_OF_THREADS = 100
# What the message payload should be
PAYLOAD = {"userid": 0, "requestid": 0, "dentistid": 1, "issuance": None, "time": "2020-12-14 14:30"}


def generate_threads():
    return map(lambda i:
               Thread(target=lambda:
               request_generator.publish(ADDRESS, TOPIC, PAYLOAD, SLEEP_TIME, random.randint(100000, 999999))),
               range(NUMBER_OF_THREADS))


if __name__ == '__main__':
    counter = 0
    random.seed(1)
    for thread in generate_threads():
        counter += 1
        print("Starting thread No.", counter)
        thread.start()
