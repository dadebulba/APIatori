const mongoose = require('mongoose');
const controller = require('./userDataLayerImpl.js');

if (process.env.PROD == undefined && process.env.TEST == undefined) process.env["NODE_CONFIG_DIR"] = "../../config";
const config = require('config'); 

const DatalayerAlreadyInitializedError = require("../../errors/datalayerAlreadyInitializedError");
const DatalayerNotInitializedError = require("../../errors/datalayerNotInitializedError");
const ParametersError = require("../../errors/parametersError");

var initialized = false;

module.exports = {

    init : async function(){
        if (initialized)
            throw new DatalayerAlreadyInitializedError("SpaceDataLayer");

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
            mongoose.connect(config.mongoURL, mongoOptions);
            mongoose.Promise = global.Promise;
        }

        initialized = true;
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

            item.href = config.baseURL + ":" + config.usersPort + config.usersPath + "/" + item.uid;
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
    }

}