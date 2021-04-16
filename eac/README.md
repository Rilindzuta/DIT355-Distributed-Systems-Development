# External-API-Communicator

This component reads the data from https://raw.githubusercontent.com/feldob/dit355_2020/master/dentists.json to then publish to our system.
This component is part of a distruted system to handle dental appointments by using MQTT as a publisher and subscriber architectural style.

The communicator is written with Python.

## Pre-requisites to use this component
- Clone this repository
- Install Python
- Install Eclipse Mosquitto (***https://mosquitto.org/download/***)
    - Make sure to read the readme documentation after installation!
- Install mqtt-paho (***Using 'pip install paho-mqqt'***)

## Running the component
- Open a terminal at the src folder of the repository.
- Type, 'python main.py'
- A successful run will display the next line as empty.