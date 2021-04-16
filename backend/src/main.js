const mqtt = require('mqtt');
const _ = require('lodash');
const {publishToDatabase, publishToGUI, publishToDatabaseFromAPI} = require("./modules/publisher");
const {appointmentBooker,
    getAvailableTimes,
    appointmentTimeParser,
    availableAppointmentsTimeConverter,
    getAvailableDentists
} = require("./modules/appointment_handling");

// Subscription topic
const backend_sub = "backend/#";
// Store for received messages
const messageStore = {};
// Create mqtt client
const client = mqtt.connect("mqtt://127.0.0.1");

client.on("connect", function () {
    //subscribes to all topics that start with "backend"
    client.subscribe(backend_sub, { qos: 2 });
});
client.on('message', function (topic, message) {
    //splitting the topic to get info that can be used
    const splitTopic = topic.toString().split("/");
    // id is in position 2
    const messageId = splitTopic[2];
    try {
        message = JSON.parse(message.toString());
    } catch (e) {
        //TODO: do something with error messages instead of just console.log()
        console.log(e);
    }
    // kinda garbage way to check if it's from the external-api communicator as this sends messages without
    // a messageId
    if (messageId) {
        // if the id exists, it must mean that it's a response to some previous message
        if (messageStore[messageId]) {
            onReply(messageStore[messageId], messageId, message);
            delete messageStore[messageId];
        } else {
            onMessage(splitTopic, message);
        }
    } else {
        onApiMessage(message);
    }
});
//This is to process the dentists object that gets sent from the external api
function onApiMessage(message) {
    const operation = "read";
    for (const dentist of message["dentists"]){
        publishToDatabaseFromAPI(operation, dentist, messageStore);
    }
}
//This is to handle messages that are replies to previously published messages
function onReply(stored, id, reply) {
    // if what's stored is a string that means it's a messageId that is used as key for some other previously stored
    // message and the reply should be further processed or forwarded to who asked for it.
    if (typeof stored === 'string') {
        //TODO: introduce methods that can handle whatever needs to be done with whatever data that is fetched from the
        // database. For example we need to change what is returned on attempts to book appointments.
        if (messageStore[stored][0][3] === "times") {
            // this is what happens when the GUI wants to fetch available time slots for a specific dentist.
            getAvailableTimes(stored, reply, messageStore);
        } else if (messageStore[stored][0][4] === "create" && messageStore[stored][0][3] === "appointment") {
            //this is what happens when the GUI attempts to book an appointment.
            appointmentBooker(stored, reply, messageStore);
        } else if (messageStore[stored][0][4] === "read" && messageStore[stored][0][3] === "dentist") {
            //this is what happens when the GUI wants to view the map.
            getAvailableDentists(stored, reply, messageStore);
        } else {
            publishToGUI(stored, reply, messageStore);
        }
    } else { // this else case is when we're handling reply messages from the database
            // when we have received a message from the external api as we then have stored an array containing
            // whatever state of operations we're currently at.
            // this solution will probably have to get reworked as we don't check if a dentist that exists
            // should be deleted
        if (stored[0] === "read") {
            // if it's not equal then it it either doesn't exist or has different data
            if (!_.isEqual(stored[1], reply[0])) {
                let operation;
                const dentist = stored[1];
                //empty array means nothing exists
                if (reply.length === 0) {
                    operation = "create";
                } else {
                    operation = "update";
                }
                publishToDatabaseFromAPI(operation, dentist, messageStore);
            }
        } else {
            // TODO: add things that need to happen in case of update or create.
        }
    }
}
// This is for incoming messages from the frontend/gui
function onMessage(topic, message) {
    let document = topic[3];
    const messageId = topic[2];
    let operation;
    messageStore[messageId] = [topic, message];
    if (topic[4]) {
        operation = topic[4];
    }
    switch (document) {
        case "dentist":
            // passing empty object as message since we want all dentists no matter what the GUI sends.
            message = {};
            // operation is hardcoded to read as users are not allowed to do anything else with dentists
            operation = "read";
            publishToDatabase(message, messageId, document, operation, messageStore);
            break;
        case "times":
            // to get all available times for a specific dentist.
            // frontend should send message containing the id and date of the specific dentist.
            document = "appointment";
            operation = "read";
            publishToDatabase(availableAppointmentsTimeConverter(message), messageId, document, operation, messageStore);
            break;
        case "appointment":
            if (operation === 'create') {
                // Operation gets set to read, this is because we first need to check that it hasn't already been booked
                // in whatever time that has passed since the user first loaded the page.
                operation = "read";
                publishToDatabase(appointmentTimeParser(message), messageId, document, operation, messageStore);
            } else {
                publishToDatabase(message, messageId, document, operation, messageStore);
            }
            break;
        case "user":
            publishToDatabase(message, messageId, document, operation, messageStore);
            break;
        default:
            // this is when the client sends some weird garbage that should be rejected
            // so send message back instantly and remove it
            //TODO: Implement something that does what says above.
            break;
    }
}

client.on("error", function (error) {
    console.log("Can't connect" + error);
    process.exit(1);
});