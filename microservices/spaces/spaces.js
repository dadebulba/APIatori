const express = require('express');
const http = require('http')

const bodyParser = require('body-parser');
//const apiUtility = (process.env.PROD != undefined) ? require("./utility.js") : require('../../utility.js');
const apiUtility = require('../../utility')
const errors = (process.env.PROD != undefined) ? require("./errorMsg.js") : require('../../errorMsg.js');
const spaceDataLayer = process.env.PROD ? require("./space_data_layer/spaceDataLayer.js") : require("../../data_layer/space_data_layer/spaceDataLayer.js");
const mwAuth = require('../../middleware/mwAuth.js');

if (process.env.PROD == undefined && process.env.TEST == undefined)
    process.env["NODE_CONFIG_DIR"] = "../../config";

const config = require('config');

const PORT = config.get('spacesPort');
const basePath = config.get("baseURL");
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
    return BOOKING_TYPE.some(p => p === type);
}

//*** ERROR AND AUTH MIDDLEWARE ***/

const mwErrorHandler = require('../../middleware/mwErrorHandler');
app.use(mwErrorHandler);
  
app.use(apiUtility.unless(mwAuth, "/spaces"));

//*** SPACES PART ***//

app.get('/spaces', async function (req, res, next) {
    try {
        const spaces = await spaceDataLayer.getAllSpaces();
        if (spaces === undefined)
            return res.status(404).json(errors.ENTITY_NOT_FOUND);

        return res.status(200).json(spaces);
    }
    catch (err) {
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
        next(err);
    }

});

app.post('/spaces', async function (req, res, next) {
    const name = req.body.name;
    if (apiUtility.validateParamsUndefined(name))
        return res.status(400).json(errors.PARAMS_UNDEFINED);
    if (apiUtility.validateParamsString(name))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);
    if (!(apiUtility.validateAuth(req, LEVELS.ADMIN)))
        return res.status(401).json(errors.ACCESS_NOT_GRANTED);

    try {
        const newSpace = await spaceDataLayer.createSpace(name);

        if (newSpace === undefined)
            return res.status(400).json(errors.ALREADY_PRESENT);

        return res.status(201).json(newSpace);
    }
    catch (err) {
        next(err);
    }
});

app.put('/spaces/:id', async function (req, res, next) {
    const spaceId = req.params.id;
    const name = req.body.name;

    if (apiUtility.validateParamsUndefined(spaceId, name))
        return res.status(400).json(errors.PARAMS_UNDEFINED);
    if (!apiUtility.validateParamsString(spaceId, name))
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
        next(err);
    }

})

app.delete('/spaces/:id', async function (req, res, next) {
    const spaceId = req.params.id;

    if (apiUtility.validateParamsUndefined(spaceId))
        return res.status(400).json(errors.PARAMS_UNDEFINED);
    if (!apiUtility.validateParamsString(spaceId))
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
    const spaceId = req.params.id;

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

app.post('/spaces/:spaceId/bookings/:bookingId', async function (req, res) {
    const spaceId = req.params.id;
    const gid = req.body.gid;
    const from = Date.parse(req.body.from);
    const to = Date.parse(req.body.to);
    const type = req.body.type;
    const uid = req.uid;

    if (apiUtility.validateParamsUndefined(spaceId, gid, from, to, type))
        return res.status(400).json(errors.PARAMS_UNDEFINED);
    if (!apiUtility.validateParamsDate(from, to))
        return res.status(400).json(errors.DATETIME_INVALID);
    if (!apiUtility.validateParamsString(spaceId, gid))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);
    if (!validateBookingType(type))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);

    const bookingData = { uid : uid, from : from, to : to, type : type, gid : gid };
    try {
        if (!(apiUtility.validateAuth(req, LEVELS.EDUCATOR, gid) || apiUtility.validateAuth(req, LEVELS.ADMIN)))
            return res.status(401).json(errors.ACCESS_NOT_GRANTED);

        const newBooking = await spaceDataLayer.createBookingForSpace(spaceId, bookingData);

        if (newBooking === undefined)
            return res.status(404).json(errors.ENTITY_NOT_FOUND);

        return res.status(201).json(newBooking);
    }
    catch (err) {
        next(err);
    }
})

app.put('/spaces/:spaceId/bookings/:bookingId', async function (req, res) {
    const spaceId = req.param.spaceId;
    const bookingId = req.params.bookingId;
    const gid = req.body.gid;
    const from = Date.parse(req.body.from);
    const to = Date.parse(req.body.to);
    const type = req.body.type;
    const uid = req.uid;

    if (apiUtility.validateParamsUndefined(spaceId, bookingId, gid, from, to, type))
        return res.status(400).json(errors.PARAMS_UNDEFINED);
    if (!apiUtility.validateParamsDate(from, to))
        return res.status(400).json(errors.DATETIME_INVALID);
    if (!apiUtility.validateParamsString(spaceId, bookingId, gid))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);
    if (!validateBookingType(type))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);

    const bookingData = { uid : uid, from : from, to : to, type : type, gid : gid };
    
    try {
        if (!(apiUtility.validateAuth(req, LEVELS.EDUCATOR, actualBookingGid) || apiUtility.validateAuth(req, LEVELS.ADMIN)))
            return res.status(401).json(errors.ACCESS_NOT_GRANTED);

        const editedBooking = await spaceDataLayer.modifyBookingForSpace(spaceId, bookingId, bookingData);

        if (editedBooking === undefined)
            return res.status(404).json(errors.ENTITY_NOT_FOUND);

        return res.status(200).json(editedBooking);
    }
    catch (err) {
        next(err);
    }

});

app.delete('/spaces/:spaceId/bookings/:bookingId', async function (req, res) {
    const spaceId = req.param.spaceId;
    const bookingId = req.params.bookingId;

    if (apiUtility.validateParamsUndefined(spaceId, bookingId))
        return res.status(400).json(errors.PARAMS_UNDEFINED);
    if (!apiUtility.validateParamsString(spaceId, bookingId))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);
    try {

        if (!(apiUtility.validateAuth(req, LEVELS.EDUCATOR, actualBookingGid) || apiUtility.validateAuth(req, LEVELS.ADMIN)))
            return res.status(401).json(errors.ACCESS_NOT_GRANTED);

        const isDeleted = await spaceDataLayer.deleteBookingForSpace(spaceId, bookingId);

        if (!isDeleted)
            return res.status(404).json(errors.ENTITY_NOT_FOUND);

        return res.status(200).end();
    }
    catch (err) {
        next(err);
    }
});

let server = http.createServer(app);

let server_starting = new Promise((resolve, reject) => {
    server.listen(PORT, async () => {
        if(!process.env.TEST)
            await spaceDataLayer.init()
        console.log("Spaces app is listening at port " + PORT);
        resolve();
    });
});

module.exports = {
    server: server,
    server_starting: server_starting
}