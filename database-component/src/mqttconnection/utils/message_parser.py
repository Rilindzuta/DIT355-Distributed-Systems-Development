import json


# Function to parse a string to a list containing parameters and a list of dictionaries with arguments
def parse(topic, message):
    parsed = topic.split("/")
    try:
        parsed[0] = json.loads(message)
    except:
        # TODO: Pass this on to error logger in the future.
        print("Error in parser")
    return parsed
