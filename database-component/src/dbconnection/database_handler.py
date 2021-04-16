import main
from mongoengine import *
from dbconnection.utils import crud_methods
import dbconnection.schemas.schemas as schemas
import json


def method_picker(payload):
    try:
        msg = ""
        ret_payload = []
        data = payload[0]
        ret_payload.append(payload[1])
        schema = payload[2]
        method = payload[3]
        if method == "create":
            # super ugly but read and delete return lists
            msg = "["+crud_methods.create(schema, data)+"]"
        elif method == "read":
            msg = crud_methods.read(schema, data)
        elif method == "update":
            # super ugly but read and delete return lists
            msg = "["+crud_methods.update(schema, data)+"]"
        elif method == "delete":
            msg = crud_methods.delete(schema, data)
        key = schemas.KEYS[schema]
        msg = key_changer(key, msg)
        ret_payload.append(msg)
    except Exception as e:
        raise Exception(e)
    return ret_payload


def start(database):
    # Connect to db
    connect(database)
    while True:
        payload = main.incoming.get()
        if payload:
            try:
                ret = method_picker(payload)
            except Exception as e:
                # TODO: Perhaps introduce something that adds a flag so the message can be sent to some error logger too
                ret = [payload[1], e.__str__()]
            main.outgoing.put(ret)


def key_changer(key, msg):
    msg = json.loads(msg)
    if len(msg) > 0:
        for obj in msg:
            if obj["_id"]:
                obj[key] = obj.pop("_id")
    msg = json.dumps(msg)
    return msg
