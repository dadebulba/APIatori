const express = require('express');
const unless = require('express-unless');
const bodyParser = require('body-parser');
const spaceImpl = require('./spacesImpl.js');
const apiUtility = require('../../utility.js');
const errors = require('../../errorMsg.js');

process.env["NODE_CONFIG_DIR"] = "../../config/";
const config = require('config');

const PORT = process.env.PORT || config.get('spacesPort');
const key = process.env.API_KEY || config.get('API_KEY');
const basePath = process.env.BASE_PATH || config.get("basePath");
const LEVELS = apiUtility.levels;
const app = express();
app.use(bodyParser.json());

//*** ERROR AND AUTH MIDDLEWARE ***/
const mwErrorHandler = require('../../middleware/mwErrorHandler');
app.use(mwErrorHandler);

const mwAuth = require('../../middleware/mwAuth.js');
mwAuth.unless = unless;
app.use(mwAuth.unless({ path : [
    {
        url: `/${basePath}/spaces`,
        methods: [`GET`]
    },
    {
        url: `/${basePath}/bookings/:id`,
        methods: [`GET`]
    },    
]
}))

//*** SPACES PART ***//

app.get('/spaces', function (req, res) {
    const spaces = spaceImpl.getSpaces();
    return res.status(200).json(spaces);
});

app.post('/spaces', function (req,res){
    const name = req.body.name;
    
    if (apiUtility.validateParamsUndefined(name))
        return res.status(400).json(errors.PARAMS_UNDEFINED);
    if(!apiUtility.validateParamsString(name))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);

    if(!(apiUtility.validateAuth(req,LEVELS.ADMIN)))
        return res.status(401).json(errors.ACCESS_NOT_GRANTED);

    const newSpace = spaceImpl.createNewSpace(name);
    
    if(newSpace === undefined)
        return res.status(400).json(errors.ALREADY_PRESENT);
    
    return res.status(201).json(newSpace);
});

app.put('/spaces', function (req,res){
    const spaceId = req.params.id;
    const name = req.body.name;
    
    if (apiUtility.validateParamsUndefined(spaceId,name))
        return res.status(400).json(errors.PARAMS_UNDEFINED);
    if (!apiUtility.validateParamsString(spaceId,name))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);

    if(spaceImpl.validateSpaceId(spaceId))
        return res.status(404).json(errors.ENTITY_NOT_FOUND);

    if(!(apiUtility.validateAuth(req,LEVELS.ADMIN)))
        return res.status(401).json(errors.ACCESS_NOT_GRANTED);

    const editedSpace = spaceImpl.editSpace(spaceId, name);
    
    if(editedSpace === undefined)
        return res.status(400).json(errors.ALREADY_PRESENT);
    
    return res.status(200).json(editedSpace);

})

app.delete('/spaces/:id', function (req, res){
    const spaceId = req.params.id;

    if (apiUtility.validateParamsUndefined(spaceId))
        return res.status(400).json(errors.PARAMS_UNDEFINED);
    if(!apiUtility.validateParamsString(spaceId))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);
        
    if(!spaceImpl.validateSpaceId(spaceId))
        return res.status(404).json(errors.ENTITY_NOT_FOUND);
    
    const actualBookingGid = spaceImpl.getBookingGid(spaceId);

    if(!(apiUtility.validateAuth(req,LEVELS.EDUCATOR,actualBookingGid) || apiUtility.validateAuth(req,LEVELS.ADMIN)))
        return res.status(401).json(errors.ACCESS_NOT_GRANTED);

    const isDeleted = spaceImpl.deleteBooking(spaceId);
    
    if(!isDeleted)
        return res.status(401).json(errors.INVALID_TOKEN);
    
    return res.status(200).json(editedBooking);

});

//*** BOOKINGS PART ***//

app.get('/bookings/:id', function (req, res) {
    const spaceId = req.params.id;

    if (apiUtility.validateParamsUndefined(spaceId))
        return res.status(400).json(errors.PARAMS_UNDEFINED);
    if (apiUtility.validateParamsString(spaceId))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);

    try {
        if(spaceImpl.validateSpaceId(spaceId) == false)
            return res.status(404).json(errors.ENTITY_NOT_FOUND);
            
        const bookings = spaceImpl.getBookings(spaceId);
        if(apiUtility.validateParamsUndefined(bookings))
            return res.status(404).json(errors.ENTITY_NOT_FOUND);

        return res.status(200).json(bookings)
    } catch (err) {
        next(err);
    }
});

app.post('/bookings/:id', function (req, res){
    const spaceId = req.params.id;
    const gid = req.body.gid;
    const from = Date.parse(req.body.from);
    const to = Date.parse(req.body.to);
    const type = req.body.type;
    const uid = req.uid;

    if (apiUtility.validateParamsUndefined(spaceId, gid, from, to, type))
        return res.status(400).json(errors.PARAMS_UNDEFINED);
    if(!apiUtility.validateParamsDate(from,to))
        return res.status(400).json(errors.DATETIME_INVALID);
    if(!apiUtility.validateParamsString(spaceId,gid))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);
    if(!spaceImpl.validateBookingType(type))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);

    if(!(spaceImpl.validateSpaceId(spaceId)&&(apiUtility.validateGroupId(gid))))
        return res.status(404).json(errors.ENTITY_NOT_FOUND);

    if(!(apiUtility.validateAuth(req,LEVELS.EDUCATOR) || apiUtility.validateAuth(req,LEVELS.ADMIN)))
        return res.status(401).json(errors.ACCESS_NOT_GRANTED);

    const newBooking = spaceImpl.createNewBooking(from, to, type, gid, uid);
    
    if(newBooking === undefined)
        return res.status(403).json(errors.ALREADY_RESERVED);
    
    return res.status(201).json(newBooking);

})

app.put('/spaces/:spaceId/bookings/:bookingId', function (req, res){
    const spaceId = req.param.spaceId;
    const bookingId = req.params.bookingId;
    const gid = req.body.gid;
    const from = Date.parse(req.body.from);
    const to = Date.parse(req.body.to);
    const type = req.body.type;
    const uid = req.uid;

    if (apiUtility.validateParamsUndefined(spaceId, bookingId, gid, from, to, type))
        return res.status(400).json(errors.PARAMS_UNDEFINED);
    if(!apiUtility.validateParamsDate(from,to))
        return res.status(400).json(errors.DATETIME_INVALID);
    if(!apiUtility.validateParamsString(spaceId, bookingId,gid))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);
    if(!spaceImpl.validateBookingType(type))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);

    if(!(spaceImpl.validateBookingId(bookingId) && 
        spaceImpl.validateSpaceId(spaceId) && 
        apiUtility.validateGroupId(gid)))
        return res.status(404).json(errors.ENTITY_NOT_FOUND);
    
    const actualBookingGid = spaceImpl.getBookingGid(bookingId);

    if(!(apiUtility.validateAuth(req,LEVELS.EDUCATOR,actualBookingGid) || apiUtility.validateAuth(req,LEVELS.ADMIN)))
        return res.status(401).json(errors.ACCESS_NOT_GRANTED);
        
    const editedBooking = spaceImpl.editBooking(spaceId, bookingId, from, to, type, gid, uid);
    
    if(editedBooking === undefined)
        return res.status(403).json(errors.ALREADY_RESERVED);
    
    return res.status(200).json(editedBooking);

});

app.delete('/spaces/:spaceId/bookings/:bookingId', function (req, res){
    const spaceId = req.param.spaceId;
    const bookingId = req.params.bookingId;

    if (apiUtility.validateParamsUndefined(spaceId, bookingId))
        return res.status(400).json(errors.PARAMS_UNDEFINED);
    if(!apiUtility.validateParamsString(spaceId, bookingId))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);

    if(!(spaceImpl.validateBookingId(bookingId) && spaceImpl.validateSpaceId(spaceId)))
        return res.status(404).json(errors.ENTITY_NOT_FOUND);
    
    const actualBookingGid = spaceImpl.getBookingGid(bookingId);

    if(!(apiUtility.validateAuth(req,LEVELS.EDUCATOR,actualBookingGid) || apiUtility.validateAuth(req,LEVELS.ADMIN)))
        return res.status(401).json(errors.ACCESS_NOT_GRANTED);

    spaceImpl.deleteBooking(spaceId, bookingId);

    return res.status(200).end();
});

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`)
});