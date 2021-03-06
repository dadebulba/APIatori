const mongoose = require('mongoose');
const controller = require('./groupDataLayerImpl.js');

let config = require('../../config/default.json');

const DatalayerAlreadyInitializedError = require("../../errors/datalayerAlreadyInitializedError");
const DatalayerNotInitializedError = require("../../errors/datalayerNotInitializedError");
const ParametersError = require("../../errors/parametersError");

var initialized = false;

module.exports = {

    init : async function(){
        if (initialized)
            throw new DatalayerAlreadyInitializedError("GroupDataLayer");

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
                        controller.loadMockGroups(process.env.MOCK_GROUPS).then(() => resolve());
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

    getAllGroups : async function(){
        if (!initialized)
            throw new DatalayerNotInitializedError("GroupDataLayer");

        let groups = await controller.retrieveAllGroups();
        groups.forEach((item) => {
            item.href = config.baseURL + ":" + config.gatewayPort + config.groupsPath + "/" + item.gid;
        });
        return groups;
    },

    getGroup : async function(gid){
        if (!initialized)
            throw new DatalayerNotInitializedError("GroupDataLayer");

        if (arguments.length !== 1)
            throw new ParametersError();

        let result = await controller.getGroup(gid);
        return result;
    },

    createGroup : async function(groupData){
        if (!initialized)
            throw new DatalayerNotInitializedError("GroupDataLayer");

        if (arguments.length !== 1 || groupData == undefined)
            throw new ParametersError();

        let result = await controller.createGroup(groupData);
        return result;
    },

    modifyGroup : async function(gid, data){
        if (!initialized)
            throw new DatalayerNotInitializedError("GroupDataLayer");

        if (arguments.length !== 2 || data == undefined)
            throw new ParametersError();

        let result = await controller.modifyGroup(gid, data);
        return result;
    },

    deleteGroup : async function(gid){
        if (!initialized)
            throw new DatalayerNotInitializedError("GroupDataLayer");

        if (arguments.length !== 1)
            throw new ParametersError();

        let result = await controller.deleteGroup(gid);
        return result;
    }
}
