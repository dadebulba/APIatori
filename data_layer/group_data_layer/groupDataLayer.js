const mongoose = require('mongoose');
const controller = require('./groupDataLayerImpl.js');
const apiUtility = (process.env.PROD) ? require("./utility.js") : require("../../utility.js");

if (process.env.PROD == undefined) process.env["NODE_CONFIG_DIR"] = "../../config";
const config = require('config');

var inmemory_mongodb_promise;

if (process.env.TEST){
    //Start the in-memory db for testing
    inmemory_mongodb_promise = new Promise((resolve, reject) => {
        mongoose.connect(global.__MONGO_URI__, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }).then(
            () => {
                controller.loadMockGroups(process.env.MOCK_GROUPS).then(() => resolve());
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

    getAllGroups : async function(){
        let groups = await controller.retrieveAllGroups();
        groups.forEach((item) => {
            item.href = config.baseURL + ":" + config.groupsPort + config.groupsPath + "/" + item.gid;
        });
        return groups;
    },

    getGroup : async function(gid){
        if (arguments.length !== 1 || !apiUtility.isObjectValid(gid))
            throw new Error("Bad parameters");

        let result = await controller.getGroup(gid);
        return result;
    },

    createGroup : async function(groupData){
        if (arguments.length !== 1 || groupData == undefined)
            throw new Error("Bad parameters");

        let result = await controller.createGroup(groupData);
        return result;
    },

    modifyGroup : async function(gid, data){
        if (arguments.length !== 2 || !apiUtility.isObjectValid(gid) || data == undefined)
            throw new Error("Bad parameters");

        let result = await controller.modifyGroup(gid, data);
        return result;
    },

    deleteGroup : async function(gid){
        if (arguments.length !== 1 || !apiUtility.isObjectValid(gid))
            throw new Error("Bad arguments");

        let result = await controller.deleteGroup(gid);
        return result;
    }
}