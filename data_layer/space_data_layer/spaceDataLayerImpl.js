const Space = require("./spaceSchema.js");

process.env["NODE_CONFIG_DIR"] = "../../config/";
const config = require('config'); 

module.exports = {

    retrieveAllSpaces : async function(){
        let spacesList = await Space.find({}, {bookings: 0, __v: 0});     //I exclude 'bookings' field
        spacesList = JSON.parse(JSON.stringify(spacesList));
        return spacesList;
    },

    retrieveSingleSpace : async function(sid){
        let space = await Space.findById(sid);
        if (space !== undefined)
            space = JSON.parse(JSON.stringify(space));

        return space;
    },

    createSpace : async function(spaceName){
        let result = await Space.findOne({name: new RegExp('^'+spaceName+'$', "i")}); // "i" for case-insensitive
        if (result != null)
            return undefined;

        let newSpace = new Space({
            name: spaceName,
            bookings: []
        });

        result = await newSpace.save();
        if (result == undefined)
            throw new Error("Can't save new entry on database");
        else    
            return JSON.parse(JSON.stringify(result));
    },

    modifySpaceName : async function(sid, newName){
        let result = await Space.findByIdAndUpdate(sid, $set = {name: newName});
        if (result != undefined)
            result = JSON.parse(JSON.stringify(result));

        return result;
    },

    deleteSpace : async function (sid){
        let result = await Space.findByIdAndDelete(sid);
        return result;
    }

}