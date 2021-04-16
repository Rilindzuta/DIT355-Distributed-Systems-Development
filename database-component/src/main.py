from threading import Thread
from multiprocessing import Queue
from dbconnection import database_handler
from mqttconnection import subscriber, publisher


# Various constants
ADDRESS_TO_BROKER = "127.0.0.1"
# These two should not be constants in final product
PUBLISH_BASE_TOPIC = "backend/database/"
SUBSCRIBE_TOPIC = "database/#"
DATABASE = "test"


def mongo():
    database_handler.start(DATABASE)


def mqtt_subscriber():
    subscriber.connect(ADDRESS_TO_BROKER, SUBSCRIBE_TOPIC)


def mqtt_publisher():
    publisher.connect(ADDRESS_TO_BROKER, PUBLISH_BASE_TOPIC)


incoming = Queue()
outgoing = Queue()
# Makes sure the following only gets executed once
if __name__ == '__main__':

    t1 = Thread(target=mongo)
    t2 = Thread(target=mqtt_subscriber)
    t3 = Thread(target=mqtt_publisher)

    t1.start()
    t2.start()
    t3.start()
