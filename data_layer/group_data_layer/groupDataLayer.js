const mongoose = require('mongoose');
const controller = require('./groupDataLayerImpl.js');

if (process.env.PROD == undefined && process.env.TEST == undefined) process.env["NODE_CONFIG_DIR"] = "../../config";
const config = require('config');

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
            mongoose.connect(config.mongoURL, mongoOptions);
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
            item.href = config.baseURL + ":" + config.groupsPort + config.groupsPath + "/" + item.gid;
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