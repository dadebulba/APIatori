const mongoose = require('mongoose');
const controller = require('./userDataLayerImpl.js');
const apiUtility = (process.env.PROD) ? require("./utility.js") : require("../../utility.js");

if (process.env.PROD == undefined && process.env.TEST == undefined) process.env["NODE_CONFIG_DIR"] = "../../config";
const config = require('config'); 

var inmemory_mongodb_promise;
const mongoOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
};

if (process.env.TEST){
    //Start the in-memory db for testing
    inmemory_mongodb_promise = new Promise((resolve, reject) => {
        mongoose.connect(global.__MONGO_URI__, mongoOptions).then(
            () => {
                controller.loadMockUsers(process.env.MOCK_USERS).then(() => resolve(mongoose.connection));
            }
        );
    });
}
else {
    //MongoDB initialization
    mongoose.connect(config.mongoURL, mongoOptions);
    mongoose.Promise = global.Promise;
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));
}

module.exports = {

    inmemory_mongodb_promise : inmemory_mongodb_promise,

    createUser : async function(userInfo){
        if (userInfo == undefined || arguments.length !== 1)
            throw new Error("Bad parameters");

        let result = await controller.createUser(userInfo);
        return result;
    },

    getAllUsers : async function(){
        let usersList = await controller.retrieveAllUsers();

        usersList.forEach((item) => {
            item.uid = item._id;
            delete item._id;

            item.href = config.baseURL + ":" + config.usersPort + config.usersPath + "/" + item.uid;
        });

        return usersList;
    },

    getUser : async function(uid){
        if (arguments.length !== 1 || !apiUtility.isObjectIdValid(uid))
            throw new Error("Bad parameters");

        let result = await controller.getUser(uid);
        return result;
    }

}