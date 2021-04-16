const mqtt = require('mqtt');
const client = mqtt.connect("mqtt://127.0.0.1");

module.exports = {
    // This is for publishing replies to the gui/frontend.
    publishToGUI: function (messageId, message, messageStore) {
        // rebuilding the topic from the pieces that were stored when we first got a message from the GUI.
        let reconstructedTopic;
        try {
            reconstructedTopic = messageStore[messageId][0][1] +
                "/" + messageStore[messageId][0][2] + "/" + messageStore[messageId][0][3];
        } catch (e) {
            //console.log(e)
        }
        client.publish(reconstructedTopic, JSON.stringify(message));
        delete messageStore[messageId];
    },
    //This is for publishing to database when we have external-api message incoming as this needs to be processed slightly
    //differently than messages from GUI/frontend.
    publishToDatabaseFromAPI: function (operation, message, messageStore) {
        const randomMessageId = getRandomMessageId();
        messageStore[randomMessageId] = [operation, message];
        client.publish("database/"+randomMessageId+"/dentist/"+operation, JSON.stringify(message));
    },
    //This is for publishing to the database
    publishToDatabase: function (message, messageId, document, operation, messageStore) {
        const randomId = getRandomMessageId();
        // Storing the messageId so we can fetch the previously stored data when a reply comes back on this topic
        messageStore[randomId] = messageId;
        client.publish("database/"+randomId+"/"+document+"/"+operation, JSON.stringify(message));
    }
}
//Generates random number to be used as messageIds
function getRandomMessageId() {
    // there is no real meaning to these numbers, it's just to generate a number that is kinda large.
    return Math.floor(Math.random() * 1000000) + 100000;
}