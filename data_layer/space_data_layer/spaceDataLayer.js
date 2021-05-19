const mongoose = require('mongoose');
const controller = require('./spaceDataLayerImpl.js');
const utility = require("../utility.js");

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
                        controller.loadMockSpaces(process.env.MOCK_SPACES).then(() => resolve());
                    }
                );
            });

            await inmemory_mongodb_promise;
        }
        else {
            //MongoDB initialization
            mongoose.connect(config.mongo_spaces_URL, mongoOptions);
            mongoose.Promise = global.Promise;
        }

        initialized = true;
        return true;
    },

    getAllSpaces : async function(){
        if (!initialized)
            throw new DatalayerNotInitializedError("SpaceDataLayer");

        let spacesList = await controller.retrieveAllSpaces();
        spacesList.forEach((item) => {
            item.href = config.baseURL + ":" + config.gatewayPort + config.spacesPath + "/" + item._id;
            item.sid = item._id;
            delete item._id;
        });

        return spacesList;
    },

    getSpace : async function(sid){
        if (!initialized)
            throw new DatalayerNotInitializedError("SpaceDataLayer");

        if (arguments.length !== 1 || !utility.isObjectIdValid(sid))
            throw new ParametersError();

        let space = await controller.retrieveSingleSpace(sid);
        return space;
    },

    createSpace : async function(name){
        if (!initialized)
            throw new DatalayerNotInitializedError("SpaceDataLayer");

        if (arguments.length !== 1 || name == undefined || typeof name !== "string" || name === "")
            throw new ParametersError();

        let result = await controller.createSpace(name);
        return result;
    },

    modifySpace : async function(sid, newName){
        if (!initialized)
            throw new DatalayerNotInitializedError("SpaceDataLayer");

        if (arguments.length !== 2 || newName == undefined || !utility.isObjectIdValid(sid) || newName === "")
            throw new ParametersError();

        let result = await controller.modifySpaceName(sid, newName);
        return result;
    },

    deleteSpace : async function(sid){
        if (!initialized)
            throw new DatalayerNotInitializedError("SpaceDataLayer");

        if (arguments.length !== 1 || !utility.isObjectIdValid(sid))
            throw new ParametersError();

        let result = await controller.deleteSpace(sid);
        return result;
    },

    getAllBookingsForSpace : async function(sid){
        if (!initialized)
            throw new DatalayerNotInitializedError("SpaceDataLayer");

        if (arguments.length !== 1 || !utility.isObjectIdValid(sid))
            throw new ParametersError();

        let result = await controller.getAllBookings(sid);
        return result;
    },

    getBookingForSpace : async function(sid, bid){
        if (!initialized)
            throw new DatalayerNotInitializedError("SpaceDataLayer");

        if (arguments.length !== 2 || !utility.isObjectIdValid(sid) || !utility.isObjectIdValid(bid))
            throw new ParametersError();

        let result = await controller.getBooking(sid, bid);
        return result;
    },

    createBookingForSpace : async function(sid, bookingData){
        if (!initialized)
            throw new DatalayerNotInitializedError("SpaceDataLayer");

        if (arguments.length !== 2 || !utility.isObjectIdValid(sid) || bookingData == undefined)
            throw new ParametersError();

        let result = await controller.createBooking(sid, bookingData);
        return result;
    },

    modifyBookingForSpace : async function(sid, bid, data){
        if (!initialized)
            throw new DatalayerNotInitializedError("SpaceDataLayer");

        if (arguments.length !== 3 || !utility.isObjectIdValid(sid) || !utility.isObjectIdValid(bid) ||
                data == undefined)
            throw new ParametersError();

        let result = await controller.editBooking(sid, bid, data);
        return result;
    },

    deleteBookingForSpace : async function(sid, bid){
        if (!initialized)
            throw new DatalayerNotInitializedError("SpaceDataLayer");

        if (arguments.length !== 2 || !utility.isObjectIdValid(sid) || !utility.isObjectIdValid(bid))
            throw new ParametersError();

        let result = await controller.deleteBooking(sid, bid);
        return result;
    }

}
