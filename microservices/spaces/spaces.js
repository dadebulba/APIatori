const express = require('express');
const http = require('http')

const bodyParser = require('body-parser');
const apiUtility = (process.env.PROD || process.env.TESTING) ? require("./utility.js") : require('../../utility.js');
const errors = (process.env.PROD || process.env.TESTING) ? require("./errorMsg.js") : require('../../errorMsg.js');
const spaceDataLayer = (process.env.PROD || process.env.TESTING) ? require("./data_layer/space_data_layer/spaceDataLayer.js") : require("../../data_layer/space_data_layer/spaceDataLayer.js");
const groupDataLayer = (process.env.PROD || process.env.TESTING) ? require("./data_layer/group_data_layer/groupDataLayer.js") : require("../../data_layer/group_data_layer/groupDataLayer.js");
const userDataLayer  = (process.env.PROD || process.env.TESTING) ? require("./data_layer/user_data_layer/userDataLayer.js") : require("../../data_layer/user_data_layer/userDataLayer.js");

const WeatherAdapter = (process.env.PROD || process.env.TESTING) ? require("./adapters/weatherAPIAdapter") : require("../../adapters/weatherAPIAdapter");
if (!process.env.TEST){
    var GoogleCalendarAdapter;
    if (process.env.PROD || process.env.TESTING)
        GoogleCalendarAdapter = require("./adapters/googleCalendarAdapter");
    else
        GoogleCalendarAdapter = require("../../adapters/googleCalendarAdapter");
}

if (process.env.PROD == undefined && process.env.TEST == undefined)
    process.env["NODE_CONFIG_DIR"] = "../../config";

const config = require('config');
const PORT = config.get('spacesPort');

const LEVELS = apiUtility.levels;
const app = express();
app.use(bodyParser.json());

const BOOKING_TYPE = {
    ACTIVITY: "attivita",
    MEETING: "riunione",
    WINE: "degustazione prosecco",
    OTHER: "altro"
}

function validateBookingType(type) {
    for(booking in BOOKING_TYPE) {
        if(BOOKING_TYPE[booking] === type)
            return false;
    }
    return true;
}

//*** ERROR AND AUTH MIDDLEWARE ***/

const mwErrorHandler = (process.env.PROD || process.env.TESTING) ? require('./middleware/mwErrorHandler') :  require('../../middleware/mwErrorHandler');
app.use(mwErrorHandler);
//*** SPACES PART ***//

app.get('/spaces', async function (req, res, next) {
    try {
        const spaces = await spaceDataLayer.getAllSpaces();
        if (spaces === undefined)
            return res.status(404).json(errors.ENTITY_NOT_FOUND);

        return res.status(200).json(spaces);
    }
    catch (err) {
        console.error(err);
        next(err);
    }
});

app.get('/spaces/:spaceId', async function (req, res, next) {
    const spaceId = req.params.spaceId;

    if (apiUtility.validateParamsUndefined(spaceId))
        return res.status(400).json(errors.PARAMS_UNDEFINED);
    try {
        if (!(apiUtility.validateAuth(req, LEVELS.EDUCATOR))&&!(apiUtility.validateAuth(req, LEVELS.COLLABORATOR)))
            return res.status(401).json(errors.ACCESS_NOT_GRANTED);

        const space = await spaceDataLayer.getSpace(spaceId);

        if (space === undefined)
            return res.status(404).json(errors.ENTITY_NOT_FOUND);

        return res.status(200).json(space);
    }
    catch (err) {
        console.error(err);
        next(err);
    }

});

app.post('/spaces', async function (req, res, next) {
    let name = req.body.name;

    if (apiUtility.validateParamsUndefined(name))
        return res.status(400).json(errors.PARAMS_UNDEFINED);
    if (apiUtility.validateParamsString(name))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);
    if (!(apiUtility.validateAuth(req, LEVELS.ADMIN)))
        return res.status(401).json(errors.ACCESS_NOT_GRANTED);

    name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(); //First letter uppercase

    try {
        const newSpace = await spaceDataLayer.createSpace(name);

        if (newSpace === undefined)
            return res.status(400).json(errors.ALREADY_PRESENT);

        return res.status(201).json(newSpace);
    }
    catch (err) {
        console.error(err);
        next(err);
    }
});

app.put('/spaces/:id', async function (req, res, next) {
    const spaceId = req.params.id;
    const name = req.body.name;

    if (apiUtility.validateParamsUndefined(spaceId, name))
        return res.status(400).json(errors.PARAMS_UNDEFINED);
    if (apiUtility.validateParamsString(spaceId, name))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);
    try {
        if (!(apiUtility.validateAuth(req, LEVELS.ADMIN)))
            return res.status(401).json(errors.ACCESS_NOT_GRANTED);

            const editedSpace = await spaceDataLayer.modifySpace(spaceId, name);

        if (editedSpace == undefined)
            return res.status(404).json(errors.ENTITY_NOT_FOUND);

        return res.status(200).json(editedSpace);
    }
    catch (err) {
        console.error(err);
        next(err);
    }

})

app.delete('/spaces/:id', async function (req, res, next) {
    const spaceId = req.params.id;

    if (apiUtility.validateParamsUndefined(spaceId))
        return res.status(400).json(errors.PARAMS_UNDEFINED);
    if (apiUtility.validateParamsString(spaceId))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);

    try {
        if (!(apiUtility.validateAuth(req, LEVELS.ADMIN)))
            return res.status(401).json(errors.ACCESS_NOT_GRANTED);

        const deletedSpace = await spaceDataLayer.deleteSpace(spaceId);

        if (!deletedSpace)
            return res.status(404).json(errors.ENTITY_NOT_FOUND);

        return res.status(200).end();
    }
    catch (err) {
        next(err);
    }

});

//*** BOOKINGS PART ***//

app.get('/spaces/:spaceId/bookings', async function (req, res, next) {
    const spaceId = req.params.spaceId;

    if (apiUtility.validateParamsUndefined(spaceId))
        return res.status(400).json(errors.PARAMS_UNDEFINED);
    if (apiUtility.validateParamsString(spaceId))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);

    try {
        const bookings = await spaceDataLayer.getAllBookingsForSpace(spaceId);
        if (!bookings)
            return res.status(404).json(errors.ENTITY_NOT_FOUND);

        return res.status(200).json(bookings)
    } catch (err) {
        next(err);
    }
});

app.get('/spaces/:spaceId/bookings/:bookingId', async function (req, res, next) {
    const spaceId = req.params.spaceId;
    const bookingId = req.params.bookingId

    if (apiUtility.validateParamsUndefined(spaceId, bookingId))
        return res.status(400).json(errors.PARAMS_UNDEFINED);
    if (apiUtility.validateParamsString(spaceId, bookingId))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);


    try {
        const singleBooking = await spaceDataLayer.getBookingForSpace(spaceId, bookingId);

        if (!singleBooking)
            return res.status(404).json(errors.ENTITY_NOT_FOUND);

        //Add weather info from the weather adapter if it isn't running tests
        if (!process.env.TEST){
            let date = singleBooking.from.split("T")[0];
            let weather = await WeatherAdapter.getLocalWeather(date);
            if (weather != undefined) 
                singleBooking.weather = weather;
        }
        
        return res.status(200).json(singleBooking)
    } catch (err) {
        next(err);
    }
});

app.post('/spaces/:spaceId/bookings', async function (req, res, next) {
    const spaceId = req.params.spaceId;
    const gid = req.body.gid;
    const from = new Date(Date.parse(req.body.from));
    const to = new Date(Date.parse(req.body.to));
    const type = req.body.type;
    const uid = req.headers.uid;

    if (apiUtility.validateParamsUndefined(spaceId, gid, from, to, type))
        return res.status(400).json(errors.PARAMS_UNDEFINED);
    if (apiUtility.validateParamsDate(from, to))
        return res.status(400).json(errors.DATETIME_INVALID);
    if (apiUtility.validateParamsString(spaceId, gid))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);
    if (validateBookingType(type))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);

    let bookingData = { uid : uid, from : from, to : to, type : type, gid : gid };
    try {
        if (!(apiUtility.validateAuth(req, LEVELS.EDUCATOR, gid) || apiUtility.validateAuth(req, LEVELS.ADMIN)))
            return res.status(401).json(errors.ACCESS_NOT_GRANTED);

        let newBooking = await spaceDataLayer.createBookingForSpace(spaceId, bookingData);

        if (newBooking === undefined)
            return res.status(404).json(errors.ENTITY_NOT_FOUND);

        //Create a new Google Calendar event if it isn't running tests
        if (!process.env.TEST){
            const group = await groupDataLayer.getGroup(gid);
            const space = await spaceDataLayer.getSpace(spaceId);
            const users = userDataLayer.getAllUsers();

            if (!group || !space)
                return res.status(400).json(errors.INVALID_DATA);

            //Build the list of the invitations to the event
            let others = [];
            for (user in users){
                if (
                    group.educators.some(id => id === user.uid) ||
                    group.collaborators.some(id => id === user.uid)
                ){
                    others.push(user.mail);
                }
            }

            const event = {
                from: from,
                to: to,
                title: type,
                description: "Space: " + space.name,
                others: others
            }

            let eventId = await GoogleCalendarAdapter.addEvent(group.calendarId, event);
            bookingData.eventId = eventId;

            //Update the booking adding the 'eventId' field
            newBooking = await spaceDataLayer.modifyBookingForSpace(spaceId, newBooking.bid, bookingData);
            if (newBooking === undefined)
                return res.status(404).json(errors.ENTITY_NOT_FOUND);
        }

        return res.status(201).json(newBooking);
    }
    catch (err) {
        next(err);
    }
})

app.put('/spaces/:spaceId/bookings/:bookingId', async function (req, res, next) {
    const spaceId = req.params.spaceId;
    const bookingId = req.params.bookingId;
    const gid = req.body.gid;
    const from = new Date(Date.parse(req.body.from));
    const to = new Date(Date.parse(req.body.to));
    const type = req.body.type;
    const uid = req.headers.uid;
    
    if (apiUtility.validateParamsUndefined(spaceId, bookingId, gid, from, to, type))
        return res.status(400).json(errors.PARAMS_UNDEFINED);
    if (apiUtility.validateParamsDate(from, to))
        return res.status(400).json(errors.DATETIME_INVALID);
    if (apiUtility.validateParamsString(spaceId, bookingId, gid))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);
    if (validateBookingType(type))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);

    const bookingData = { uid : uid, from : from, to : to, type : type, gid : gid };
    
    try {
        const singleBooking = await spaceDataLayer.getBookingForSpace(spaceId, bookingId);
        
        if (singleBooking === undefined)
            return res.status(404).json(errors.ENTITY_NOT_FOUND);

        if (!(apiUtility.validateAuth(req, LEVELS.EDUCATOR, singleBooking.gid)))
            return res.status(401).json(errors.ACCESS_NOT_GRANTED);

        //Add the eventId field
        bookingData.eventId = singleBooking.eventId;

        const editedBooking = await spaceDataLayer.modifyBookingForSpace(spaceId, bookingId, bookingData);

        if (editedBooking === undefined)
            return res.status(404).json(errors.ENTITY_NOT_FOUND);

        //Update the Google Calendar event if it isn't running tests
        if (!process.env.TEST) {
            const group = await groupDataLayer.getGroup(gid);

            const event = {
                from: from,
                to: to,
                title: type
            }

            //Do not wait the response from the API
            GoogleCalendarAdapter.modifyEvent(group.calendarId, editedBooking.eventId, event);
        }

        return res.status(200).json(editedBooking);
    }
    catch (err) {
        next(err);
    }

});

app.delete('/spaces/:spaceId/bookings/:bookingId', async function (req, res, next) {
    const spaceId = req.params.spaceId;
    const bookingId = req.params.bookingId;
    
    if (apiUtility.validateParamsUndefined(spaceId, bookingId))
        return res.status(400).json(errors.PARAMS_UNDEFINED);
    if (apiUtility.validateParamsString(spaceId, bookingId))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);
    try {
        const singleBooking = await spaceDataLayer.getBookingForSpace(spaceId, bookingId);
        
        if (singleBooking === undefined)
            return res.status(404).json(errors.ENTITY_NOT_FOUND);
        if (!(apiUtility.validateAuth(req, LEVELS.EDUCATOR, singleBooking.gid) || apiUtility.validateAuth(req, LEVELS.ADMIN)))
            return res.status(401).json(errors.ACCESS_NOT_GRANTED);

        const isDeleted = await spaceDataLayer.deleteBookingForSpace(spaceId, bookingId);

        if (!isDeleted)
            return res.status(404).json(errors.ENTITY_NOT_FOUND);

        //Delete the Google Calendar event if it isn't running tests
        if (!process.env.TEST){
            const group = await groupDataLayer.getGroup(singleBooking.gid);

            //Don't wait the response of the API
            GoogleCalendarAdapter.deleteEvent(group.calendarId, singleBooking.eventId);
        }

        return res.status(200).end();
    }
    catch (err) {
        next(err);
    }
});

let server = http.createServer(app);

let server_starting = new Promise((resolve, reject) => {
    server.listen(PORT, async () => {
        if(!process.env.TEST){
            let spaceInit = spaceDataLayer.init();
            let userInit = userDataLayer.init();
            let groupInit = groupDataLayer.init();
            let gcAdapter = GoogleCalendarAdapter.init();

            let result = await Promise.all([spaceInit, userInit, groupInit]);
            result = result.every(item => item === true);

            if (!result || !gcAdapter)
                reject();
        }
        resolve();
    });
});

module.exports = {
    server: server,
    server_starting: server_starting
}