const fetch = require("node-fetch");

if (process.env.PROD == undefined) process.env["NODE_CONFIG_DIR"] = "../../config";
const config = require('config'); 

const Space = require("./spaceSchema.js")[0];
const Booking = require("./spaceSchema.js")[1];

async function checkGroupExist(gid){
    let result = await fetch(config.baseURL + ":" + config.groupDataLayerPort + "/data/groups/" + gid);
    return result.status == 200; 
}

async function checkUserExist(uid){
    let result = await fetch(config.baseURL + ":" + config.userDataLayerPort + "/data/users/" + uid);
    return result.status == 200;
}

async function checkBooking(booking){
    if (booking.uid == undefined || booking.from == undefined || booking.to == undefined || booking.type == undefined)
        return false;

    let tsFrom = new Date(booking.from).getTime();
    let tsTo = new Date(booking.to).getTime();
    if (tsTo <= tsFrom || tsFrom < Date.now())
        return false;

    let result = await checkUserExist(booking.uid);
    if (!result)
        return false;

    if (booking.gid != undefined) {
        result = await checkGroupExist(booking.gid);
        if (!result)
            return false;
    }

    return true;
}

function checkIntervalOverlaps(firstStart, firstEnd, secondStart, secondEnd){

    firstStart = new Date(firstStart).getTime();
    firstEnd = new Date(firstEnd).getTime();
    secondStart = new Date(secondStart).getTime();
    secondEnd = new Date(secondEnd).getTime();

    /*console.log("--- CHECK INTERVALS ---");
    console.log("FIRST: " + firstStart + ", " + firstEnd);
    console.log("NEW: " + secondStart + ", " + secondEnd);
    console.log("TEST1: " + (secondStart>=firstStart && secondEnd>=firstEnd));
    console.log("TEST2: " + (secondStart<=firstStart && secondEnd<=firstEnd));
    console.log("TEST3: " + (firstStart<=secondStart && firstEnd>=secondEnd));
    console.log("TEST4: " + (secondStart<=firstStart && firstEnd<=secondEnd));
    console.log("-----------------------");*/

    return (secondStart>=firstStart && secondEnd>=firstEnd && secondStart<=firstEnd) ||
            (secondStart<=firstStart && secondEnd<=firstEnd && firstStart<=secondEnd) ||
            (firstStart<=secondStart && firstEnd>=secondEnd) ||
            (secondStart<=firstStart && firstEnd<=secondEnd);
}

module.exports = {

    retrieveAllSpaces : async function(){
        let spacesList = await Space.find({}, {bookings: 0, __v: 0});     //I exclude 'bookings' field
        spacesList = JSON.parse(JSON.stringify(spacesList));
        return spacesList;
    },

    retrieveSingleSpace : async function(sid){

        if (sid == undefined || arguments.length != 1)
            return undefined;
        
        let space = await Space.findById(sid);
        if (space !== undefined){
            space = JSON.parse(JSON.stringify(space));

            if (space.bookings != undefined)
                space.bookings.forEach((item) => {
                    item.bid = item._id;
                    delete item._id;
                });
        }

        return space;
    },

    createSpace : async function(spaceName){

        if (spaceName == undefined || arguments.length != 1)
            return undefined;

        //Check that there isn't already a space with the same name
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

        if (sid == undefined || newName == undefined || arguments.length != 2)
            return undefined;

        let result = await Space.findByIdAndUpdate(sid, $set = {name: newName});
        if (result != undefined)
            result = JSON.parse(JSON.stringify(result));

        return result;
    },

    deleteSpace : async function (sid){
        if (sid == undefined || arguments.length != 1)
            return undefined;

        let result = await Space.findByIdAndDelete(sid);
        return result;
    },

    editReservation : async function(sid, bid, edit){
        if (sid == undefined || bid == undefined || edit == undefined || arguments.length !== 3)
            throw new Error("Error in editReservation function");

        let check = await checkBooking(edit);
        if (!check)
            throw new Error("Booking format not correct");

        let space = await Space.findById(sid);
        if (space == undefined) 
            return undefined;

        space = JSON.parse(JSON.stringify(space));
        var toUpdate = false;
        
        //Search for the right booking
        for (var i=0; i<space.bookings.length; i++)
            if (space.bookings[i]._id === bid && space.bookings[i].uid == edit.uid){

                //Check for possible overlaps
                for (var j=0; j<space.bookings.length; j++)
                    if (i!=j && checkIntervalOverlaps(space.bookings[i].from, space.bookings[i].to, space.bookings[j].from, space.bookings[j].to))
                        throw new Error("Interval overlap detected");

                space.bookings[i] = edit;
                toUpdate = true;
                break;
            }
        
        if (!toUpdate)
            return undefined;

        space = await Space.findByIdAndUpdate(sid, $set = {bookings: space.bookings});
        space = JSON.parse(JSON.stringify(space));
        return space;
    },

    deleteReservation : async function(sid, bid){
        if (sid == undefined || bid == undefined || arguments.length !== 2)
            throw new Error("Error in deleteReservation function");

        let result = await Space.updateOne({_id: sid}, {$pull: {"bookings": {_id: bid}}});
        return result;
    },

    createBooking : async function(sid, booking){
        if (arguments.length != 2 || sid == undefined || sid == "" || booking == undefined || typeof booking !== "object")
            throw new Error("Type error in createBooking");

        let result = await checkBooking(booking);
        if (!result)
            throw new Error("Booking object not well formed");

        //Check that there aren't bookings that overlap with the new one
        let space = await this.retrieveSingleSpace(sid);
        if (space == undefined)
            throw new Error("Cannot find space");

        for (var i=0; i<space.bookings.length; i++)
            if (checkIntervalOverlaps(space.bookings[i].from, space.bookings[i].to, booking.from, booking.to))
                return undefined;                                                     

        let newBooking = new Booking({
            uid: booking.uid,
            from: booking.from,
            to: booking.to,
            type: booking.type
        });

        space = await Space.updateOne({_id: sid}, {$push: {"bookings": newBooking}});
        space = JSON.parse(JSON.stringify(space));
        return space;
    }

}