from dbconnection.schemas import schemas


def create_document(schema, data):
    if schema == "appointment":
        return schemas.Appointment(**data)
    elif schema == "user":
        return schemas.User(**data)
    elif schema == "dentist":
        return schemas.Dentist(**data)


def get_documents(schema, data):
    if schema == "appointment":
        return schemas.Appointment.objects(**data)
    elif schema == "user":
        return schemas.User.objects(**data)
    elif schema == "dentist":
        return schemas.Dentist.objects(**data)


def get_one_document(schema, data):
    key = {}
    # Not great solution but it'll have to do for now.
    schema_key = schemas.KEYS[schema]
    for k, v in data.items():
        if k == schema_key:
            key[schema_key] = v
    document = None
    try:
        if schema == "appointment":
            return schemas.Appointment.objects(**key).get()
        elif schema == "user":
            return schemas.User.objects(**key).get()
        elif schema == "dentist":
            document = schemas.Dentist.objects(**key).get()
    except:
        print("No document exists")
    return document
