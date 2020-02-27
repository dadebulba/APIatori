const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const controller = require('./groupDataLayerImpl.js');
const errors = (process.env.PROD != undefined) ? require("./errorMsg.js") : require('../../errorMsg.js');

if (process.env.PROD == undefined) process.env["NODE_CONFIG_DIR"] = "../../config";
const config = require('config');

//Database parameters
const DBaddress = config.mongoDB.address;
const DBport = config.mongoDB.port;
const DBname = config.mongoDB.collection;
const DBurl = "mongodb://" + DBaddress + ":" + DBport + "/" + DBname;

if (process.env.PROD != undefined)
    DBurl = "mongodb://mongo:27017/APIATORI";

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
app.listen(config.groupDataLayerPort);

//Routes
const router = express.Router();

router.get("/data/groups", async function(req, res){
    let groups = await controller.retrieveAllGroups();
    res.status(200).json(groups);
});

router.post("/data/groups", async function(req, res){
    let body = req.body;
    if (body == undefined || body == ""){
        res.status(400).json(errors.PARAMS_UNDEFINED);
        return;
    }

    try {
        let result = await controller.createGroup(body);
        if (result == undefined)
            res.status(400).json(errors.PARAMS_WRONG_TYPE);
        else {
            result.gid = result._id;
            delete result._id;
            delete result.__v;

            res.status(201).json(result);
        }
    } catch (err){
        res.status(500).json({error: err.message});
    }
}); 

router.get("/data/groups/:gid", async function(req, res){
    let gid = req.params.gid;
    if (gid == undefined){
        res.status(400).json(errors.PARAMS_UNDEFINED);
        return;
    }

    try {
        let result = await controller.getGroup(gid);
        if (result == undefined)
            res.status(404).send();
        else {
            delete result.__v;
            result.gid = result._id;
            delete result._id;

            res.status(200).json(result);
        }
    } catch (err) {
        res.status(404).send();
    }
});

router.put("/data/groups/:gid", async function(req, res){
    let gid = req.params.gid;
    let body = req.body;
    if (gid == undefined || body == undefined){
        res.status(400).json(errors.PARAMS_UNDEFINED);
        return;
    }

    try {
        let result = await controller.modifyGroup(gid, body);
        if (result == undefined)
            res.status(404).send();
        else {
            result.gid = result._id;
            delete result.__v;
            delete result._id;

            res.status(200).json(result);
        }
    } catch (err){
        res.status(400).json({error: err.message});
    }
});

router.delete("/data/groups/:gid", async function(req, res){
    let gid = req.params.gid;
    if (gid == undefined){
        res.status(400).json(errors.PARAMS_UNDEFINED);
        return;
    }

    try {
        let result = await controller.deleteGroup(gid);
        let status = (result == undefined) ? 404 : 200;
        res.status(status).send();
    } catch (err){
        res.status(500).json({error: err.message});
    }
});

app.use('/', router);