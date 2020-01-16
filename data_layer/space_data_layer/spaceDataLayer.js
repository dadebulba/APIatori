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
app.listen(config.spaceDataLayerPort);

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
        res.status(500).json({error: err});
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
        if (result == undefined)
            res.status(404).send();
        else {
            result.sid = result._id;
            delete result._id;
            delete result._id;
            res.status(200).json(result);
        }
    } catch (err){
        res.status(500).json({error: err});
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
        res.status(500).json(err);
    }
});

app.use('/', router);