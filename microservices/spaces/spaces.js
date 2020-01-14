const express = require('express');
const bodyParser = require('body-parser');
const spaceImpl = require('./spacesImpl.js');
const apiUtility = require('../../utility.js');
const errors = require('../../errorMsg.js');

process.env["NODE_CONFIG_DIR"] = "../../config/";
const config = require('config');

const PORT = process.env.PORT || config.get('spacesPort');
const key = process.env.API_KEY || config.get('API_KEY');

const app = express();
app.use(bodyParser.json());

//TODO: Add auth and error middleware


//*** SPACES PART ***//

app.get('/spaces', function (req, res) {
    const spaces = spaceImpl.getSpaces();
    return res.status(200).json(spaces);
});

app.post('/spaces', function (req,res){
    const name = String(req.body.name);
    
    if (apiUtility.validateParamsUndefined(name))
        return res.status(400).json(errors.PARAMS_UNDEFINED);
        
    const newSpace = spaceImpl.createNewSpace(name);
    
    if(newSpace === undefined)
        return res.status(400).json(errors.ALREADY_PRESENT);
    
    return res.status(201).json(newSpace);
});

app.put('/spaces', function (req,res){
    const spaceId = parseInt(req.params.id);
    const name = String(req.body.name);
    
    if (apiUtility.validateParamsUndefined(name))
        return res.status(400).json(errors.PARAMS_UNDEFINED);
    
    if(spaceImpl.validateSpaceId(spaceId))
        return res.status(404).json(errors.ENTITY_NOT_FOUND);

    const editedSpace = spaceImpl.editSpace(spaceId, name);
    
    if(editedSpace === undefined)
        return res.status(400).json(errors.ALREADY_PRESENT);
    
    return res.status(200).json(editedSpace);

})

//*** BOOKINGS PART ***//

app.get('/bookings/:id', function (req, res) {
    const spaceId = parseInt(req.params.id);

    if (apiUtility.validateParamsUndefined(spaceId))
        return res.status(400).json(errors.PARAMS_UNDEFINED);
    try {
        if(spaceImpl.validateSpaceId(spaceId) == false)
            return res.status(404).json(errors.ENTITY_NOT_FOUND);
            
        let bookings = spaceImpl.getBookings(spaceId);
        let spaceName = spaceImpl.getSpaceName(spaceId);
        if(apiUtility.validateParamsUndefined(bookings,spaceName))
            return res.status(404).json(errors.ENTITY_NOT_FOUND);

    } catch (err) {
        next(err);
    }
});

app.post('/bookings/:id', function (req, res){
    const spaceId = parseInt(req.params.id);
    const gid = parseInt(req.body.gid);
    const from = Date.parse(req.body.from);
    const to = Date.parse(req.body.to);
    const type = String(req.body.type);
    const uid = req.uid;

    if (apiUtility.validateParamsUndefined(spaceId,gid))
        return res.status(400).json(errors.PARAMS_UNDEFINED);
    if(!apiUtility.validateParamsDate(from,to))
        return res.status(400).json(errors.DATETIME_INVALID);
    if(!apiUtility.validateParamsNumber(spaceId,gid))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);
    if(!spaceImpl.validateBookingType(type))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);

    if(!(spaceImpl.validateSpaceId(spaceId)&&(spaceImpl.checkGroupId(gid))))
        return res.status(404).json(errors.ENTITY_NOT_FOUND);
        
    const newBooking = spaceImpl.createNewBooking(from, to, type, gid, uid);
    
    if(newBooking === undefined)
        return res.status(403).json(errors.ALREADY_RESERVED);
    
    return res.status(201).json(newBooking);

})

app.put('/bookings/:id', function (req, res){
    const bookingId = parseInt(req.params.id);
    const gid = parseInt(req.body.gid);
    const from = Date.parse(req.body.from);
    const to = Date.parse(req.body.to);
    const type = String(req.body.type);
    const uid = req.uid;

    if (apiUtility.validateParamsUndefined(bookingId,gid))
        return res.status(400).json(errors.PARAMS_UNDEFINED);
    if(!apiUtility.validateParamsDate(from,to))
        return res.status(400).json(errors.DATETIME_INVALID);
    if(!apiUtility.validateParamsNumber(bookingId,gid))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);
    if(!spaceImpl.validateBookingType(type))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);

    if(!(spaceImpl.checkBookingId(bookingId)&&(spaceImpl.checkGroupId(gid))))
        return res.status(404).json(errors.ENTITY_NOT_FOUND);
        
    const editedBooking = spaceImpl.editBooking(bookingId, from, to, type, gid, uid);
    
    if(editedBooking === undefined)
        return res.status(403).json(errors.ALREADY_RESERVED);
    
    return res.status(200).json(editedBooking);

});

app.delete('/bookings/:id', function (req, res){
    const bookingId = parseInt(req.params.id);
    const gid = parseInt(req.body.gid);
    const from = Date.parse(req.body.from);
    const to = Date.parse(req.body.to);
    const type = String(req.body.type);
    const uid = req.uid;

    if (apiUtility.validateParamsUndefined(bookingId,gid))
        return res.status(400).json(errors.PARAMS_UNDEFINED);
    if(!apiUtility.validateParamsDate(from,to))
        return res.status(400).json(errors.DATETIME_INVALID);
    if(!apiUtility.validateParamsNumber(bookingId,gid))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);
    if(!spaceImpl.validateBookingType(type))
        return res.status(400).json(errors.PARAMS_WRONG_TYPE);

    if(!(spaceImpl.checkBookingId(bookingId)&&(spaceImpl.checkGroupId(gid))))
        return res.status(404).json(errors.ENTITY_NOT_FOUND);
        
    const isDeleted = spaceImpl.deleteBooking(bookingId, uid);
    
    if(!isDeleted)
        return res.status(401).json(errors.INVALID_TOKEN);
    
    return res.status(200).json(editedBooking);

});

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`)
});