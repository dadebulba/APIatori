const mongoose = require('mongoose');
const controller = require('./userDataLayerImpl.js');

let config = {}
if (process.env.PROD || process.env.TESTING) {
    config = require('../config/default.json');
}
else {
    config = require('../../config/default.json');
}

const DatalayerAlreadyInitializedError = require("../../errors/datalayerAlreadyInitializedError");
const DatalayerNotInitializedError = require("../../errors/datalayerNotInitializedError");
const ParametersError = require("../../errors/parametersError");

var initialized = false;

module.exports = {

    init : async function(){
        if (initialized)
            throw new DatalayerAlreadyInitializedError("UserDataLayer");

        const mongoOptions = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        };
        
        if (process.env.TEST){
            //Start the in-memory db for testing
            let inmemory_mongodb_promise = new Promise((resolve, reject) => {
                mongoose.connect(global.__MONGO_URI__, mongoOptions).then(
                    () => {
                        controller.loadMockUsers(process.env.MOCK_USERS).then(() => resolve());
                    }
                );
            });

            await inmemory_mongodb_promise;
        }
        else {
            //MongoDB initialization
            if (process.env.TESTING) {
                mongoose.connect(config.mongo_URL_TEST, mongoOptions);
            }
            else {
                mongoose.connect(config.mongo_URL, mongoOptions);
            }
            mongoose.Promise = global.Promise;
        }

        initialized = true;
        return true;
    },

    createUser : async function(userInfo){
        if (!initialized)
            throw new DatalayerNotInitializedError("UserDataLayer");

        if (userInfo == undefined || arguments.length !== 1)
            throw new ParametersError();

        let result = await controller.createUser(userInfo);
        return result;
    },

    getAllUsers : async function(){
        if (!initialized)
            throw new DatalayerNotInitializedError("UserDataLayer");

        let usersList = await controller.retrieveAllUsers();

        usersList.forEach((item) => {
            item.uid = item._id;
            delete item._id;

            item.href = config.baseURL + ":" + config.gatewayPort + config.usersPath + "/" + item.uid;
        });

        return usersList;
    },

    getUser : async function(uid){
        if (!initialized)
            throw new DatalayerNotInitializedError("UserDataLayer");

        if (arguments.length !== 1)
            throw new ParametersError();

        let result = await controller.getUser(uid);
        return result;
    },

    login : async function(mail, password){
        if (!initialized)
            throw new DatalayerNotInitializedError("UserDataLayer");

        if (arguments.length !== 2)
            throw new ParametersError();

        let result = await controller.userLogin(mail, password);
        return result;
    },

    modifyUser : async function(uid, userData){
        if (!initialized)
            throw new DatalayerNotInitializedError("UserDataLayer");

        if (arguments.length !== 2)
            throw new ParametersError();

        let result = await controller.modifyUser(uid, userData);
        return result;
    }

}
