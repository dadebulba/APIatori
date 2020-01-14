const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const controller = require('./spaceController.js');

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

router.get("/data/spaces", controller.retrieveAllSpaces);
//router.get("/data/spaces/:sid", controller.retrieveSingleSpace);

//router.post("/data/spaces", controller.createSpace);

//router.put("/data/spaces/:sid", controller.modifySpace);

//router.delete("/data/spaces/:sid", controller.deleteGroup);

//router.head("/data/spaces", controller.getMetadata); //?

app.use('/', router);