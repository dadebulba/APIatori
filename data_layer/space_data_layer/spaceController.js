const Space = require("./spaceSchema.js");

module.exports = {

    retrieveAllSpaces : async function(req, res){
        let spacesList = await Space.find({}, {bookings: 0, __v: 0});     //I exclude 'bookings' field
        console.log(spacesList);
        res.status(200).json(spacesList);
    }

}