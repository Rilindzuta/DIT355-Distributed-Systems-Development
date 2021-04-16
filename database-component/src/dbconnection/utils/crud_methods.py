from dbconnection.utils.schema_picker import *


def create(schema, data):
    try:
        document = create_document(schema, data)
        document.save()
    except Exception as e:
        raise Exception(e)
    return document.to_json()


def read(schema, data):
    try:
        result = get_documents(schema, data)
    except Exception as e:
        raise Exception(e)
    return result.to_json()


def update(schema, data):
    try:
        result = get_one_document(schema, data)
        if result:
            result.update(**data)
            result.save()
            result = result.to_json()
        else:
            # TODO: Determine what is reasonable to return if no document exists which causes update failure
            #  Also perhaps error log this.
            result = "[]"
    except Exception as e:
        raise Exception(e)
    return result


def delete(schema, data):
    try:
        # TODO: This should be reworked, currently it's not possible
        #  to differentiate between successful deletions and nothing deleted.
        result = get_documents(schema, data)
        for doc in result:
            doc.delete()
    except Exception as e:
        raise Exception(e)
    return result.to_json()
