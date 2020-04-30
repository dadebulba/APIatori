const mongoose = require('mongoose');
const controller = require('./userDataLayerImpl.js');
const apiUtility = (process.env.PROD) ? require("./utility.js") : require("../../utility.js");

if (process.env.PROD == undefined) process.env["NODE_CONFIG_DIR"] = "../../config";
const config = require('config'); 

var inmemory_mongodb_promise;

if (process.env.TEST){
    //Start the in-memory db for testing
    inmemory_mongodb_promise = new Promise((resolve, reject) => {
        mongoose.connect(global.__MONGO_URI__, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }).then(
            () => {
                controller.loadMockUsers(process.env.MOCK_USERS).then(() => resolve());
            }
        );
    });
}
else {
    //MongoDB initialization
    const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    };
    mongoose.connect(config.mongoURL, options);
    mongoose.Promise = global.Promise;
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));
}

module.exports = {

    inmemory_mongodb_promise : inmemory_mongodb_promise,

    createUser : async function(userInfo){
        if (userInfo == undefined || arguments.length !== 1){
            throw new Error("Bad parameters");
        }

        let result = await controller.createUser(userInfo);
        if (result == undefined)
            return undefined;
    
        result.uid = result._id;
        delete result._id;
        delete result.__v;
    
        return result;
    },

    getAllUsers : async function(){
        let usersList = await controller.retrieveAllUsers();

        usersList.forEach((item) => {
            item.uid = item._id;
            delete item._id;

            item.href = config.baseURL + ":" + config.userDataLayerPort + "/data/users/" + item.uid;
        });

        return usersList;
    },

    getUser : async function(uid){
        if (arguments.length !== 1 || !apiUtility.isObjectIdValid(uid))
            throw new Error("Bad parameters");

        let result = await controller.getUser(uid);
        if (result == undefined)
            return undefined;
        else {
            delete result.__v;
            result.uid = result._id;
            delete result._id;
    
            return result;
        }    
    }

}