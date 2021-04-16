import time
from multiprocessing import Queue

incoming = Queue()
outgoing = Queue()


def process_queue(base_topic, rejection_topic):
    while True:
        item = incoming.get()
        # This is if the error-key was appended to the dict and messages should be rejected
        if len(item) != 2:
            item.pop("error", None)
            arr = item["topic"].split("/")
            arr.insert(2, "rejected")
            arr[0] = rejection_topic
            item["topic"] = "/".join(arr)
        else:
            item["topic"] = item["topic"].replace("circuitbreaker", base_topic)
        outgoing.put(item)
        # TODO: Remove this, it's to slow it down so it actually triggers errors.
        time.sleep(0.01)
