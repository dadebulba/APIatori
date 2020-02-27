const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const controller = require('./userDataLayerImpl.js');
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
app.listen(config.userDataLayerPort);

//Routes
const router = express.Router();

router.post("/data/users", async function(req, res){
    let body = req.body;
    let result = controller.checkUserBody(body);
    if (!result){
        res.status(400).json(errors.PARAMS_UNDEFINED);
        return;
    }

    try {
        result = await controller.createUser(body);
        if (result == undefined){
            res.status(400).json({message: "User already present"});
            return;
        }

        result.uid = result._id;
        delete result._id;
        delete result.__v;

        res.status(201).json(result);
        
    } catch (err){
        res.status(500).json({error: err.message});
    }
});

router.get("/data/users", async function(req, res){
    let usersList = await controller.retrieveAllUsers();

    usersList.forEach((item, index) => {
        item.uid = item._id;
        delete item._id;

        item.href = config.baseURL + ":" + config.userDataLayerPort + "/data/users/" + item.uid;
    });

    res.status(200).json(usersList);
});

router.get("/data/users/:uid", async function(req, res){

    if (req.params.uid == undefined){
        res.status(400).json(errors.PARAMS_UNDEFINED);
        return;
    }
    try {
        let result = await controller.getUser(req.params.uid);
        if (result == undefined)
            res.status(404).send();
        else {
            delete result.password;
            delete result.__v;
            result.uid = result._id;
            delete result._id;

            res.status(200).json(result);
        }
    } catch (e){
        res.status(404).send();
    }
})

app.use('/', router);