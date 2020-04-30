const express = require('express');
const unless = require('express-unless');
const bodyParser = require('body-parser');
const spaceImpl = require('./spacesImpl.js');
const apiUtility = (process.env.PROD != undefined) ? require("./utility.js") : require('../../utility.js');
const errors = (process.env.PROD != undefined) ? require("./errorMsg.js") : require('../../errorMsg.js');

if (process.env.PROD == undefined) process.env["NODE_CONFIG_DIR"] = "../../config";
const config = require('config');

const PORT = config.get('spacesPort');
const basePath = config.get("basePath");
const LEVELS = apiUtility.levels;
const app = express();
app.use(bodyParser.json());

//*** ERROR AND AUTH MIDDLEWARE ***/
const mwErrorHandler = require('../../middleware/mwErrorHandler');
app.use(mwErrorHandler);

const mwAuth = require('../../middleware/mwAuth.js');
mwAuth.unless = unless;
app.use(mwAuth.unless({
    path: [
        {
            url: `/spaces`,
            methods: [`GET`]
        },
        {
            url: `/${basePath}/bookings/:id`,
            methods: [`GET`]
        },
    ]
}))

//*** SPACES PART ***//

app.get('/spaces', async function (req, res, next) {
    try {
        const spaces = await spaceImpl.getSpaces();
        if (spaces === undefined)
            return res.status(404).json(errors.ENTITY_NOT_FOUND);

        return res.status(200).json(spaces);
    }
    catch (err) {
        next(err);
    }
});

app.get('/spaces/:spaceId', async function (req, res, next) {
    const spaceId = req.params.id;

    if (apiUtility.validateParamsUndefined(spaceId))
        return res.status(400).json(errors.PARAMS_UNDEFINED);
    if (!apiUtility.validateParamsString(spaceId))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);
    try {
        if (await spaceImpl.validateSpaceId(spaceId))
            return res.status(404).json(errors.ENTITY_NOT_FOUND);

        if (!(apiUtility.validateAuth(req, LEVELS.ADMIN)))
            return res.status(401).json(errors.ACCESS_NOT_GRANTED);

        const space = await spaceImpl.getSpaces(spaceId);

        if (space === undefined)
            return res.status(404).json(errors.ALREADY_PRESENT);

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
    if (!apiUtility.validateParamsString(name))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);

    if (!(apiUtility.validateAuth(req, LEVELS.ADMIN)))
        return res.status(401).json(errors.ACCESS_NOT_GRANTED);

    try {
        const newSpace = await spaceImpl.createNewSpace(name);

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
        /*if (!(await spaceImpl.validateSpaceId(spaceId)))
            return res.status(404).json(errors.ENTITY_NOT_FOUND);*/

        if (!(apiUtility.validateAuth(req, LEVELS.ADMIN)))
            return res.status(401).json(errors.ACCESS_NOT_GRANTED);

        const editedSpace = await spaceImpl.editSpace(spaceId, name);

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
        /*if (!await spaceImpl.validateSpaceId(spaceId))
            return res.status(404).json(errors.ENTITY_NOT_FOUND);*/

        if (!(apiUtility.validateAuth(req, LEVELS.ADMIN)))
            return res.status(401).json(errors.ACCESS_NOT_GRANTED);

        const isDeleted = await spaceImpl.deleteSpace(spaceId);

        if (!isDeleted)
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
        /*if (await spaceImpl.validateSpaceId(spaceId) == false)
            return res.status(404).json(errors.ENTITY_NOT_FOUND);*/

        const bookings = await spaceImpl.getBookings(spaceId);
        if (apiUtility.validateParamsUndefined(bookings))
            return res.status(404).json(errors.ENTITY_NOT_FOUND);

        return res.status(200).json(bookings)
    } catch (err) {
        next(err);
    }
});

app.post('/spaces/:spaceId/bookings', async function (req, res, next) {
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
    if (!spaceImpl.validateBookingType(type))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);

    try {
        /*if (!(await spaceImpl.validateSpaceId(spaceId) && (await apiUtility.validateGroupId(gid))))
            return res.status(404).json(errors.ENTITY_NOT_FOUND);*/

        if (!(apiUtility.validateAuth(req, LEVELS.EDUCATOR, gid) || apiUtility.validateAuth(req, LEVELS.ADMIN)))
            return res.status(401).json(errors.ACCESS_NOT_GRANTED);

        const newBooking = await spaceImpl.createNewBooking(from, to, type, gid, uid, spaceId);

        if (newBooking === undefined)
            return res.status(403).json(errors.ALREADY_RESERVED);

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
    if (!spaceImpl.validateBookingType(type))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);
    try {
        if (!(await spaceImpl.validateBookingId(bookingId) &&
            await spaceImpl.validateSpaceId(spaceId) &&
            await apiUtility.validateGroupId(gid)))
            return res.status(404).json(errors.ENTITY_NOT_FOUND);

        const actualBookingGid = await spaceImpl.getBookingGid(bookingId);
        if (actualBookingGid === undefined)
            return res.status(404).json(errors.ENTITY_NOT_FOUND);

        if (!(apiUtility.validateAuth(req, LEVELS.EDUCATOR, actualBookingGid) || apiUtility.validateAuth(req, LEVELS.ADMIN)))
            return res.status(401).json(errors.ACCESS_NOT_GRANTED);

        const editedBooking = await spaceImpl.editBooking(spaceId, bookingId, from, to, type, gid, uid);

        if (editedBooking === undefined)
            return res.status(403).json(errors.ALREADY_RESERVED);

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
        if (!(await spaceImpl.validateBookingId(bookingId) && await spaceImpl.validateSpaceId(spaceId)))
            return res.status(404).json(errors.ENTITY_NOT_FOUND);

        const actualBookingGid = await spaceImpl.getBookingGid(bookingId);

        if (!(apiUtility.validateAuth(req, LEVELS.EDUCATOR, actualBookingGid) || apiUtility.validateAuth(req, LEVELS.ADMIN)))
            return res.status(401).json(errors.ACCESS_NOT_GRANTED);

        const isDeleted = await spaceImpl.deleteBooking(spaceId, bookingId);

        if (!isDeleted)
            return res.status(404).json(errors.ENTITY_NOT_FOUND);

        return res.status(200).end();
    }
    catch (err) {
        next(err);
    }
});

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`)
});