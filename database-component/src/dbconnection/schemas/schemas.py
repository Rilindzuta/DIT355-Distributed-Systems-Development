from mongoengine import *

KEYS = {"appointment": "requestid", "user": "userid", "dentist": "id"}


class Appointment(Document):
    userid = IntField(required=True)
    requestid = IntField(required=True, primary_key=True)
    dentistid = IntField(required=True)
    issuance = IntField(required=True)
    time = IntField(required=True)


# No idea about this but keeping it for now
class User(Document):
    userid = IntField(primary_key=True)
    name = StringField(required=True, max_length=200)
    email = EmailField(required=True)


class Dentist(Document):
    id = IntField(required=True, primary_key=True)
    name = StringField(required=True)
    owner = StringField(required=True)
    dentists = IntField(required=True)
    address = StringField(required=True)
    city = StringField(required=True)
    coordinate = DictField(required=True)
    openinghours = DictField(required=True)
