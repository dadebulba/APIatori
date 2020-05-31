const fs = require('fs');
const {google} = require('googleapis');
const apiUtility = require("./utility");

const tokenPath = "./config/token.json";
const credentialsPath = "./config/credentials.json";
const SCOPE = ['https://www.googleapis.com/auth/calendar'];

const GoogleCalendarParameterError = require("./errors/googleCalendarParameterError");
const GoogleCalendarAlreadyInitializedError = require("./errors/googleCalendarAlreadyInitilizedError");
const GoogleCalendarNotInitializedError = require("./errors/googleCalendarNotInitializedError");

var initialized = false;
var credentials = undefined;
var auth = undefined;

/**
 * Event object required
 * {
 *  id: string [google calendar id - not required if 'group' is specified]
 *  group: string [group name equivalent to the calendar name - not required if 'id' is specified]
 *  from: Date [format yyyy-mm-ddThh:mm:ss - REQUIRED]
 *  to: Date [format as 'from' - REQUIRED]
 *  others: [String] [NOT REQUIRED]
 *  title: String [REQUIRED]
 *  description: String [NOT REQUIRED]
 *  location: String [NOT REQUIRED];
 * }
 */

async function retrieveCalendarId(calendarName){
    if (calendarName == undefined || calendarName == "")
        return undefined;

    //The first char must be uppercase
    calendarName = calendarName.charAt(0).toUpperCase() + calendarName.slice(1);

    const calendar = google.calendar({version: 'v3', auth});
    const result = await calendar.calendarList.list();
    if (result.status != 200)
        return undefined;

    const calendars = result.data.items;
    for (var i=0; i<calendars.length; i++)
        if (calendars[i].summary === calendarName)
            return calendars[i].id;

    return undefined;
}

function buildGoogleCalendarEventObject(event){
    const gcEvent = {};
    gcEvent.summary = event.title;
    if (event.description) gcEvent.description = event.description;
    if (event.location) gcEvent.location = event.location;
    gcEvent.start = {dateTime: event.from + "+02:00", timeZone: "Europe/Rome"};
    gcEvent.end = {dateTime: event.to + "+02:00", timeZone: "Europe/Rome"};
    gcEvent.reminders = {useDefault: false, overrides: [{method: 'popup', minutes: 60}]}
    gcEvent.visibility = "private";
    if (event.others){
        gcEvent.attendees = [];
        event.others.forEach(element => {
            gcEvent.attendees.push({email: element});
        });
    }

    return gcEvent;
}

module.exports = {

    validateEventObject: function (event){

        if (!event.id && !event.group) throw new GoogleCalendarParameterError("Missing 'id' or 'group' field");
        if (event.id && typeof event.id !== "string") throw new GoogleCalendarParameterError("'id' field must be a string");
        if (event.group && typeof event.group !== "string") throw new GoogleCalendarParameterError("'group' field must be a string");

        if (!event.from) throw new GoogleCalendarParameterError("Missing 'from' field");
        if (event.from && isNaN((new Date(event.from)).getTime())) throw new GoogleCalendarParameterError("'from' field is not a date");

        if (!event.to) throw new GoogleCalendarParameterError("Missing 'to' field");
        if (event.to && isNaN((new Date(event.to)).getTime())) throw new GoogleCalendarParameterError("'to' field is not a date");
        if ((new Date(event.to)).getTime() <= (new Date(event.from)).getTime()) throw new GoogleCalendarParameterError("Not valid dates");

        if (event.others && typeof event.others === "object")
            for (var i=0; i<event.others.length; i++){
                if (typeof event.others[i] !== "string")
                    throw new GoogleCalendarParameterError("'others' field does not contain only strings");
                if (!apiUtility.validateEmail(event.others[i]))
                    throw new GoogleCalendarParameterError("'others' field contains non valid emails");
            }

        if (!event.title) throw new GoogleCalendarParameterError("Missing 'title' field");
        if (event.title && typeof event.title !== "string") throw new GoogleCalendarParameterError("'title' field must be a string");

        if (event.description && typeof event.description !== "string") throw new GoogleCalendarParameterError("'description' field must be a string");

        if (event.location && typeof event.location !== "string") throw new GoogleCalendarParameterError("'location' field must be a string");

        return true;
    },

    init : function(){
        if (initialized) throw new GoogleCalendarAlreadyInitializedError();

        try {
            credentials = fs.readFileSync(credentialsPath, "utf8");
            credentials = JSON.parse(credentials);
        } catch (err){
            throw new Error("credentials.json file not exists");
        }

        //Set Google APIs authorization
        const {client_secret, client_id, redirect_uris} = credentials.installed;
        auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

        var token = undefined;
        try{
            token = fs.readFileSync(tokenPath, "utf8");
        } catch (err){
            throw new Error("token.json file not exists");
        }
        auth.setCredentials(JSON.parse(token));

        initialized = true;
    },

    addEvent : async function(event){

        if (!initialized) throw new GoogleCalendarNotInitializedError();

        this.validateEventObject(event);

        if (!event.id){
            let calendarId = await retrieveCalendarId(event.group);
            if (calendarId == undefined)
                return undefined;

            event.id = calendarId;
        }

        const gcEvent = buildGoogleCalendarEventObject(event);
        const calendar = google.calendar({version: 'v3', auth});
        try {
            let result = await calendar.events.insert({auth: auth, calendarId: event.id,resource: gcEvent});

            if (result.status != 200)
                return undefined;

            let info = {
                calendarId: event.id,
                eventId: result.data.id
            }
            return info;
        } catch (err) {
            return undefined;
        }
    },

    modifyEvent : async function(calendarId, eventId, edit){

        if (!initialized) throw new GoogleCalendarNotInitializedError();

        if (calendarId == undefined || typeof calendarId !== "string")
            return undefined;
        if (eventId == undefined || typeof eventId !== "string")
            return undefined;
        if (edit == undefined || typeof edit !== "object")
            return undefined;

        this.validateEventObject(edit);

        const gcEvent = buildGoogleCalendarEventObject(edit);
        const calendar = google.calendar({version: 'v3', auth});
        try {
            //let result = await calendar.events.insert({auth: auth, calendarId: event.id,resource: gcEvent});

            let result = await calendar.events.update({calendarId: calendarId, eventId: eventId, resource: gcEvent});
            //return (result.status == 200) ? result.data.id : undefined;
            return result;
        } catch (err) {
            return undefined;
        }
    }

}