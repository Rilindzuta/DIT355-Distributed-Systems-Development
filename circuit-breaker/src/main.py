import threading
from mqttconnection import subscriber, publisher, blackboard

# Various constants
ADDRESS_TO_BROKER = "127.0.0.1"
# TODO: publish and rejection topic might need to be changed in the future
PUBLISH_TOPIC = "backend/frontend"
REJECTION_TOPIC = "frontend"
SUBSCRIBE_TOPIC = "circuitbreaker/#"


def mqtt_subscriber():
    subscriber.connect(ADDRESS_TO_BROKER, SUBSCRIBE_TOPIC)


def mqtt_publisher():
    publisher.connect(ADDRESS_TO_BROKER)


def message_forwarder():
    blackboard.process_queue(PUBLISH_TOPIC, REJECTION_TOPIC)


# Makes sure the following only gets executed once
if __name__ == '__main__':

    t1 = threading.Thread(target=mqtt_subscriber)
    t2 = threading.Thread(target=mqtt_publisher)
    t3 = threading.Thread(target=message_forwarder)

    t1.start()
    t2.start()
    t3.start()
