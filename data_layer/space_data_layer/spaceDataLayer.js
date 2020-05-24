const mongoose = require('mongoose');
const controller = require('./spaceDataLayerImpl.js');
const apiUtility = (process.env.PROD) ? require("./utility.js") : require("../../utility.js");

if (process.env.PROD == undefined && process.env.TEST == undefined) process.env["NODE_CONFIG_DIR"] = "../../config";
const config = require('config'); 

var conn;

module.exports = {

    init : async function(){
        const mongoOptions = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        };
        
        if (process.env.TEST){
            //Start the in-memory db for testing
            let inmemory_mongodb_promise = new Promise((resolve, reject) => {
                mongoose.connect(global.__MONGO_URI__, mongoOptions).then(
                    (connection) => {
                        controller.loadMockSpaces(process.env.MOCK_SPACES).then(() => resolve(connection));
                    }
                );
            });

            conn = await inmemory_mongodb_promise;
        }
        else {
            //MongoDB initialization
            mongoose.connect(config.mongoURL, mongoOptions);
            mongoose.Promise = global.Promise;
            const db = mongoose.connection;
            db.on('error', console.error.bind(console, 'MongoDB connection error:'));

            conn = db;
        }

        return conn;
    },

    getAllSpaces : async function(){
        if (conn == undefined)
            throw new Error("SpaceDataLayer not initialized yet");

        let spacesList = await controller.retrieveAllSpaces();
        spacesList.forEach((item) => {
            item.href = config.baseURL + ":" + config.spacesPort + config.spacesPath + "/" + item._id;
            item.sid = item._id;
            delete item._id;
        });

        return spacesList;
    },

    getSpace : async function(sid){
        if (conn == undefined)
            throw new Error("SpaceDataLayer not initialized yet");

        if (arguments.length !== 1 || !apiUtility.isObjectIdValid(sid))
            throw new Error("Bad parameters");

        let space = await controller.retrieveSingleSpace(sid);
        return space;
    },

    createSpace : async function(name){
        if (conn == undefined)
            throw new Error("SpaceDataLayer not initialized yet");

        if (arguments.length !== 1 || name == undefined || typeof name !== "string")
            throw new Error("Bad arguments");

        let result = await controller.createSpace(name);
        return result;
    },

    modifySpace : async function(sid, newName){
        if (conn == undefined)
            throw new Error("SpaceDataLayer not initialized yet");

        if (arguments.length !== 2 || newName == undefined || !apiUtility.isObjectIdValid(sid) || newName === "")
            throw new Error("Bad arguments");

        let result = await controller.modifySpaceName(sid, newName);
        return result;
    },

    deleteSpace : async function(sid){
        if (conn == undefined)
            throw new Error("SpaceDataLayer not initialized yet");

        if (arguments.length !== 1 || !apiUtility.isObjectIdValid(sid))
            throw new Error("Bad parameters");

        let result = await controller.deleteSpace(sid);
        return result;
    },

    getAllBookingsForSpace : async function(sid){
        if (conn == undefined)
            throw new Error("SpaceDataLayer not initialized yet");

        if (arguments.length !== 1 || !apiUtility.isObjectIdValid(sid))
            throw new Error("Bad parameters");

        let result = await controller.getAllBookings(sid);
        return result;
    },

    getBookingForSpace : async function(sid, bid){
        if (conn == undefined)
            throw new Error("SpaceDataLayer not initialized yet");

        if (arguments.length !== 2 || !apiUtility.isObjectIdValid(sid) || !apiUtility.isObjectIdValid(bid))
            throw new Error("Bad parameters");

        let result = await controller.getBooking(sid, bid);
        return result;
    },

    createBookingForSpace : async function(sid, bookingData){
        if (conn == undefined)
            throw new Error("SpaceDataLayer not initialized yet");

        if (arguments.length !== 2 || !apiUtility.isObjectIdValid(sid) || bookingData == undefined)
            throw new Error("Bad parameters");

        let result = await controller.createBooking(sid, bookingData);
        return result;
    },

    modifyBookingForSpace : async function(sid, bid, data){
        if (conn == undefined)
            throw new Error("SpaceDataLayer not initialized yet");

        if (arguments.length !== 3 || !apiUtility.isObjectIdValid(sid) || !apiUtility.isObjectIdValid(bid) ||
                data == undefined)
            throw new Error("Bad parameters");

        let result = await controller.editBooking(sid, bid, data);
        return result;
    },

    deleteBookingForSpace : async function(sid, bid){
        if (conn == undefined)
            throw new Error("SpaceDataLayer not initialized yet");

        if (arguments.length !== 2 || !apiUtility.isObjectIdValid(sid) || !apiUtility.isObjectIdValid(bid))
            throw new Error("Bad parameters");

        let result = await controller.deleteBooking(sid, bid);
        return result;
    }

}