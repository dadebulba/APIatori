const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const controller = require('./groupController.js');

//Database parameters
const DBaddress = config.mongodb.address;
const DBport = config.mongodb.port;
const DBname = config.mongodb.dbname;
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
app.use('/', routes);
app.listen(config.groupDataLayerPort);

//Routes
const router = express.Router();

router.get("/groups", controller.retrieveAllGroups);
router.get("/groups/:gid", controller.getGroup);
router.get("/groups/me", controller.getActualGroup);

router.post("/groups", controller.createGroup); //Only if you are admin

router.put("/groups/:gid", controller.updateGroup);

router.delete("/groups/:gid", controller.deleteGroup); //Only if you are admin

router.options("/groups", controller.showAvaiableVerbs)

router.head("/groups/:gid", controller.showGroupMetadata);