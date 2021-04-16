const {publishToGUI, publishToDatabase} = require('./publisher');
const _ = require('lodash');

module.exports = {
    // This handles booking requests.
// TODO: Should probably rework this to use some sort of semaphore to lock bookings so only 1 can happen at a time,
//  this is probably too time consuming so halting this for now.
    appointmentBooker: function (messageId, message, messageStore) {
        const storedMessage = messageStore[messageId][1];
        // if the length is 2 that means we have only gotten the first part of the three messages we need
        if (messageStore[messageId].length === 2) {
            messageStore[messageId].push(message);
            const newMessage = dentistIdConverter(storedMessage);
            publishToDatabase(newMessage, messageId, "dentist", "read", messageStore);
        } else if(messageStore[messageId].length === 3) { // now we can determine if it's possible to book or not
            const result = appointmentCalculator(messageId, message[0], messageStore);
            const replyMessage = appointmentReplyForGUI(storedMessage, result);
            if (result) {
                // Time slot is available so we book it and store it in the database.
                storedMessage["time"] = Date.parse(storedMessage["time"]);
                messageStore[messageId].push(replyMessage);
                publishToDatabase(storedMessage, messageId, "appointment", "create", messageStore);
            } else {
                // Booking is not possible so we reply with that.
                publishToGUI(messageId, replyMessage, messageStore);
            }
        } else {
            //booking was possible so we reply with success message.
            publishToGUI(messageId, messageStore[messageId][3], messageStore);
        }
    },
    // This is for fetching available slots for appointments.
    getAvailableTimes: function (messageId, message, messageStore) {
    // if the length is 2 that means we have only gotten the first part of the two messages we need
        if (messageStore[messageId].length === 2) {
            messageStore[messageId].push(message);
            const newMessage = dentistIdConverter(messageStore[messageId][1]);
            publishToDatabase(newMessage, messageId, "dentist", "read", messageStore);
        } else {
            const bookedAppointments = messageStore[messageId][2];
            const time = messageStore[messageId][1]["time"]
            const dentist = message[0];
            message = calculateAvailableAppointmentSlots(bookedAppointments, time, dentist);
            publishToGUI(messageId, message, messageStore);
        }
    },
    // This is for calculating the availability of appointments for all dentists as this is needed to visualise different
    // styles of pins on the map depending on availability.
    getAvailableDentists: function (messageId, message, messageStore) {
        // if the length is 2 that means we have only gotten the first part of the multiple messages we need
        if (messageStore[messageId].length === 2) {
            messageStore[messageId].push(message);
            // We want to get the appointments for every dentist.
            for (const dentist of message) {
                const tempMessage = {};
                tempMessage["dentistid"] = dentist.id;
                tempMessage["time"] = messageStore[messageId][1]["time"];
                publishToDatabase(availableAppointmentsTimeConverter(tempMessage),
                    messageId, "appointment", "read", messageStore);
            }
            //it's 2 because that is the original length with topic, message and first reply - 1 and index 2 contains
            // the array of dentists, so if that's true that must mean we have received all messages we want and this
            // is the final reply.
        } else if(messageStore[messageId].length - messageStore[messageId][2].length === 2) {
            messageStore[messageId].push(message);
            const dentistArray = messageStore[messageId][2];
            const time = messageStore[messageId][1]["time"];
            // This checks if a dentist is fully booked, if it is then the flag is set to false.
            for (const dentist of dentistArray) {
                let hasAppointments = false;
                for (let i = 3; i < messageStore[messageId].length; i++) {
                    if (messageStore[messageId][i].length !== 0) {
                        if (messageStore[messageId][i][0]["dentistid"] === dentist.id) {
                            dentist["flag"] =
                                calculateAvailableAppointmentSlots(messageStore[messageId][i],
                                    time, dentist).length !== 0;
                            hasAppointments = true;
                        }
                    }
                }
                // Since the database sends an empty array if a dentist has no booked appointments we need to manually
                // set the flag to true for any dentist that has no appointments.
                if (!hasAppointments) {
                    dentist["flag"] = true;
                }
                hasAppointments = false;
            }
            publishToGUI(messageId,dentistArray,messageStore);
        }
        else {
            //We don't have all messages we want yet so we just store it.
            messageStore[messageId].push(message);
        }
    },
    appointmentTimeParser: function (message) {
        // Have to create a new object so we don't modify the original object.
        const newMessage = {};
        try {
            const day = Date.parse(message["time"]);
            newMessage["dentistid"] = message["dentistid"];
            newMessage["time"] = day;
        } catch (e) {
            //TODO: Add some error handler.
            console.log("Error");
        }
        return newMessage;
    },
    availableAppointmentsTimeConverter: function (message) {
        return availableAppointmentsTimeConverter(message);
    }
}
// This converts the single day that the GUI user provides and turns this into a time query for the database.
function availableAppointmentsTimeConverter(message) {
    const MILLISECONDS_IN_DAY = 86400000;
    // Have to create a new object so we don't modify the original object.
    const newMessage = {};
    try {
        const day = Date.parse(message["time"]);
        newMessage["dentistid"] = message["dentistid"];
        newMessage["time__gte"] = day;
        // This is rather ugly but it's sufficient for this use case and easier than getting a proper library for handling dates.
        newMessage["time__lte"] = day + MILLISECONDS_IN_DAY;
    } catch (e) {
        //TODO: Add some error handler.
        console.log("Error");
    }
    return newMessage;
}
// Converts hours and minutes to decimal hours.
function timeConverter(hour, minute) {
    return hour + minute/60;
}
//This converts decimal hours to hours and minutes.
function decimalHourConverter(time) {
    const hour = Math.floor(time);
    let minute = (time-hour)*60;
    if(minute === 0) {
        minute = "00";
    }
    return hour+":"+minute;
}
//This is for changing dentistid to id when using same message for getting a specific dentist
//after getting appointments for previously stated dentist, as they for some reason aren't called the same thing
//according to the specification.
function dentistIdConverter(message) {
    message = {"id": message["dentistid"]};
    return message;
}
//This is used to convert the time strings of already booked appointments to objects that can be used for comparison.
function bookedAppointmentsConverter(appointments) {
    const APPOINTMENT_LENGTH = 0.5; // this is fixed to 30 minutes according to specification.
    const bookedAppointments = [];
    // TODO: There might be issues with locale of time, is it in local or UTC
    //  investigate later when testing starts to find out if it works as it should or not.
    for (const appointment of appointments) {
        const date = new Date(appointment["time"]);
        const time = timeConverter(date.getHours(), date.getMinutes())
        bookedAppointments.push({"start": time, "end": time+APPOINTMENT_LENGTH});
    }
    return bookedAppointments;
}
// This checks that the number of bookings for the given time slot are less than numberOfDentists.
function appointmentCalculator(messageId, message, messageStore) {
    const numberOfDentists = message["dentists"];
    const bookedAppointments = messageStore[messageId][2];
    return bookedAppointments.length < numberOfDentists;
}
// This just creates a response message to booking requests that adhere to what the specification say.
function appointmentReplyForGUI(message, flag) {
    const newMessage = {};
    newMessage["userid"] = message["userid"];
    newMessage["requestid"] = message["requestid"];
    if (flag) {
        // It's returning the full date and time as honestly it seems weird that only time should be returned.
        // This can easily be changed if necessary.
        newMessage["time"] = message["time"];
    } else {
        newMessage["time"] = "none";
    }
    return newMessage;
}
//This is used to generate an array of all possible timeslots that are available for appointment bookings.
function calculateAvailableAppointmentSlots(bookedAppointments, time, dentist) {
    // since lunch and fika isn't specified anywhere when they occur so I have taken the liberty
    // to just assume that these are reasonable times.
    const lunch = "12:00";
    const fika = "14:00";
    const weekdays = {
        1: "monday",
        2: "tuesday",
        3: "wednesday",
        4: "thursday",
        5: "friday"
    };
    const times = {
        "lunch": lunch,
        "fika": fika
    };
    const date = new Date(Date.parse(time));
    let openingHours;
    try {
        openingHours = dentist["openinghours"][weekdays[date.getDay()]].split('-');
    } catch (e) {
        // Returning empty object if it's not a weekday, this is a bad solution but I caught this too late.
        return {};
    }
    const numberOfDentists = dentist["dentists"];
    times["opening"] = openingHours[0];
    times["closing"] = openingHours[1];
    const possibleAppointments = appointmentSlotsCreator(times, numberOfDentists);
    const convertedAppointments = bookedAppointmentsConverter(bookedAppointments);
    const availableAppointments = availableAppointmentSlotsCreator(convertedAppointments, possibleAppointments);
    const finalizedAppointments = [];
    for (const appointment of availableAppointments) {
        const convertedAppointment = {}
        convertedAppointment["start"] = decimalHourConverter(appointment["start"]);
        convertedAppointment["end"] = decimalHourConverter(appointment["end"]);
        finalizedAppointments.push(convertedAppointment);
    }
    return finalizedAppointments;
}
// This removes booked appointments from possible appointments so the array that is returned only contains available
// appointment slots.
function availableAppointmentSlotsCreator(booked, possible) {
    const availableAppointments = [];
    let shouldBeAdded = true;
    for (const appointment of possible) {
        for (const bookedAppointment of booked) {
            if (_.isEqual(appointment, bookedAppointment)) {
                shouldBeAdded = false;
            }
        }
        if(shouldBeAdded) {
            availableAppointments.push(appointment);
        }
        shouldBeAdded = true;
    }
    return availableAppointments; //this might need to be turned into a proper json object for consistency.
}
// This is used to generate timeslots from the opening and closing hours
// Assuming that lunch comes before fika.
function appointmentSlotsCreator(times, numberOfDentists) {
    const LUNCH_BREAK = 1;
    const FIKA_BREAK = 0.5;
    const SLOTS_PER_HOUR = 2;
    const periods = {};
    const convertedTimes = {};
    let timeSlots = [];
    let multipliedTimeSlots = [];
    for (const [key, value] of Object.entries(times)) {
        convertedTimes[key] = timeConverter(
            parseInt(value.substring(0, value.indexOf(":"))),
            parseInt(value.substring(value.indexOf(":")+1)));
    }
    // this is kinda ugly, maybe there's a better way?
    periods["period1"] = {"end":convertedTimes["lunch"],
        "numberOfSlots":(convertedTimes["lunch"]-convertedTimes["opening"])*SLOTS_PER_HOUR};
    periods["period2"] = {"end":convertedTimes["fika"],
        "numberOfSlots":(convertedTimes["fika"]-convertedTimes["lunch"]-LUNCH_BREAK)*SLOTS_PER_HOUR};
    periods["period3"] = {"end":convertedTimes["closing"],
        "numberOfSlots":(convertedTimes["closing"]-convertedTimes["fika"]-FIKA_BREAK)*SLOTS_PER_HOUR};
    for (const value of Object.values(periods)) {
        timeSlots = timeSlots.concat(timeSlotCreator(value["end"], value["numberOfSlots"]));
    }
    // multiplying the number of slots by the numberOfDentists so it's possible to book multiple appointments if there
    // are more than 1 dentist at a certain location.
    for (let i = 0; i < numberOfDentists; i++) {
        multipliedTimeSlots = multipliedTimeSlots.concat(timeSlots);
    }
    return multipliedTimeSlots;
}
// This generates numberOfSlots 30 minute slots for a specific period.
function timeSlotCreator(end, numberOfSlots) {
    let i = 0;
    const slots = [];
    const TIME_PER_SLOT = 0.5; // this is fixed to 30 minutes according to specification.
    while (i < numberOfSlots) {
        slots.push({"start": end-TIME_PER_SLOT, "end": end});
        end -= TIME_PER_SLOT;
        i++;
    }
    return slots;
}