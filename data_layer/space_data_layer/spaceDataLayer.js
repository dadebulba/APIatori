const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const controller = require('./spaceDataLayerImpl.js');
const errors = require('../../errorMsg.js');

process.env["NODE_CONFIG_DIR"] = "../../config/";
const config = require('config'); 

//Database parameters
const DBaddress = config.mongoDB.address;
const DBport = config.mongoDB.port;
const DBname = config.mongoDB.collection;
const DBurl = "mongodb://" + DBaddress + ":" + DBport + "/" + DBname;

//MongoDB initialization
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
};
mongoose.connect(DBurl, options);
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

//Express initialization
const app = express();
app.use(bodyParser.json());
app.listen(config.spaceDataLayerPort, () => {
    console.log("Listening on port " + config.spaceDataLayerPort);
});

//Routes
const router = express.Router();

router.get("/data/spaces", async function(req, res){
    let spacesList = await controller.retrieveAllSpaces();
    spacesList.forEach((item, index) => {
        item.href = config.baseURL + ":" + config.bookingPort + "/bookings/" + item._id;
        item.sid = item._id;
        delete item._id;
    });

    spacesList == undefined ? res.status(500).send() : res.status(200).json(spacesList);
});

router.get("/data/spaces/:sid", async function(req, res){
    let spaceID = req.params.sid;
    if (spaceID == undefined || spaceID == ""){
        res.status(400).json(errors.PARAMS_UNDEFINED);
        return;
    }

    let space = await controller.retrieveSingleSpace(spaceID);
    if (space == undefined)
        res.status(404).send();
    else {
        space.sid = space._id;
        delete space._id;
        delete space.__v;
        res.status(200).json(space);
    }
});

router.post("/data/spaces", async function(req, res){
    let body = req.body;
    if (body == undefined || body == "" || body.name == undefined || body.name == ""){
        res.status(400).json(errors.PARAMS_UNDEFINED);
        return;
    }

    try {
        let result = await controller.createSpace(body.name);
        if (result == undefined)
            res.status(400).json(errors.ALREADY_PRESENT);
        else {
            result.sid = result._id;
            delete result._id;
            delete result.__v;
            res.status(201).json(result);
        }
    } catch (err){
        res.status(500).json({error: err.message});
    }
});

router.put("/data/spaces/:sid", async function(req, res){
    let spaceID = req.params.sid;
    let body = req.body;

    if (spaceID === undefined || spaceID == "" 
            || body === undefined || body.name === undefined || body.name == ""){
        res.status(400).json(errors.PARAMS_UNDEFINED);
        return;
    }

    try {
        let result = await controller.modifySpaceName(spaceID, body.name);
        var status;
        (result == undefined) ? status = 404 : status = 200;
        res.status(status).send();
    } catch (err){
        res.status(500).json({error: err.message});
    }
    
});

router.delete("/data/spaces/:sid", async function(req, res){
    let spaceID = req.params.sid;
    if (spaceID === undefined || spaceID == ""){
        res.status(400).json(errors.PARAMS_UNDEFINED);
        return;
    }

    try {
        let result = await controller.deleteSpace(spaceID);
        if (result == undefined)
            res.status(404).send();
        else
            res.status(200).send();
    } catch (err){
        res.status(404).send();
    }
});

router.post("/data/spaces/:sid/bookings", async function(req, res){
    let body = req.body;
    let sid = req.params.sid;

    if (body == undefined || body == "" || sid == undefined || sid == ""){
        res.status(400).json(errors.INVALID_DATA);
        return;
    }

    try {
        let result = await controller.createBooking(sid, body);
        if (result == undefined)
            res.status(400).json(errors.ALREADY_PRESENT);
        else {
            result.bid = result._id;
            delete result._id;
            delete result.__v;
            res.status(201).json(result);
        }
    } catch (err){
        res.status(500).json({message: err.message});
    }
});

router.put("/data/spaces/:sid/bookings/:bid", async function(req, res){
    let sid = req.params.sid;
    let bid = req.params.bid;
    let body = req.body;

    if (sid == undefined || bid == undefined || body == undefined){
        res.status(400).json(errors.PARAMS_UNDEFINED);
        return;
    }

    try {
        let result = await controller.editReservation(sid, bid, body);
        if (result == undefined)
            res.status(404).send();
        else    
            res.status(200).json(result);
    } catch (err){
        res.status(500).json({error: err.message});
    }

});

router.delete("/data/spaces/:sid/bookings/:bid", async function(req, res){
    let sid = req.params.sid;
    let bid = req.params.bid;

    if (sid == undefined || bid == undefined){
        res.status(400).json(errors.PARAMS_UNDEFINED);
        return;
    }

    try {
        let result = await controller.deleteReservation(sid, bid);
        let status = (result == undefined) ? 404 : 200;
        res.status(status).send();
    } catch (err){
        res.status(500).json({error: err.message});
    }
});

app.use('/', router);