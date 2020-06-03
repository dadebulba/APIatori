const apiUtility = require("../../utility.js");

const Space = require("./spaceSchema.js")[0];
const Booking = require("./spaceSchema.js")[1];

const ParametersError = require("../../errors/parametersError");
const IntervalOverlapError = require("../../errors/intervalOverlapError");
const DatabaseError = require("../../errors/databaseError");
const SpaceAlreadyExistsError = require("../../errors/spaceAlreadyExistsError");

function checkBooking(booking){
    if (booking.from == undefined || booking.to == undefined || booking.type == undefined)
        return false;
    if (booking.uid == undefined || booking.gid == undefined)
        return false;
    if (booking.eventId == undefined || typeof booking.eventId !== "string")
        return false;

    let tsFrom = new Date(booking.from).getTime();
    let tsTo = new Date(booking.to).getTime();
    if (tsTo <= tsFrom || tsFrom < Date.now())
        return false;

    if (!apiUtility.isObjectIdValid(booking.uid) || !apiUtility.isObjectIdValid(booking.gid))
        return false;

    return true;
}

function checkIntervalOverlaps(firstStart, firstEnd, secondStart, secondEnd){

    firstStart = new Date(firstStart).getTime();
    firstEnd = new Date(firstEnd).getTime();
    secondStart = new Date(secondStart).getTime();
    secondEnd = new Date(secondEnd).getTime();

    return (secondStart>=firstStart && secondEnd>=firstEnd && secondStart<=firstEnd) ||
            (secondStart<=firstStart && secondEnd<=firstEnd && firstStart<=secondEnd) ||
            (firstStart<=secondStart && firstEnd>=secondEnd) ||
            (secondStart<=firstStart && firstEnd<=secondEnd);
}

module.exports = {

    loadMockSpaces : async function(mockSpaces){
        mockSpaces = JSON.parse(mockSpaces);

        for (var i=0; i<mockSpaces.length; i++){
            const newSpace = new Space(mockSpaces[i]);
            await newSpace.save();
        }

        return true;
    },

    retrieveAllSpaces : async function(){
        let spacesList = await Space.find({}, {bookings: 0, __v: 0});     //I exclude 'bookings' field
        spacesList = JSON.parse(JSON.stringify(spacesList));
        return spacesList;
    },

    retrieveSingleSpace : async function(sid){

        if (sid == undefined || arguments.length != 1)
            return ParametersError();
        
        let space = await Space.findById(sid);
        if (space != null){
            space = JSON.parse(JSON.stringify(space));

            if (space.bookings != undefined)
                space.bookings.forEach((item) => {
                    item.bid = item._id;
                    delete item._id;
                });

            space.sid = space._id;
            delete space._id;
            delete space.__v;
        }

        return (space != null) ? space : undefined;
    },

    createSpace : async function(spaceName){

        if (spaceName == undefined || arguments.length != 1)
            return ParametersError();

        //Check that there isn't already a space with the same name
        let result = await Space.findOne({name: new RegExp('^'+spaceName+'$', "i")}); // "i" for case-insensitive
        if (result != null && result.length != 0)
            throw new SpaceAlreadyExistsError();

        let newSpace = new Space({
            name: spaceName,
            bookings: []
        });

        result = await newSpace.save();
        if (result == undefined)
            throw new DatabaseError();
        else{    
            result = JSON.parse(JSON.stringify(result));
            result.sid = result._id;
            delete result._id;
            delete result.__v;

            return result;
        }
    },

    modifySpaceName : async function(sid, newName){

        if (sid == undefined || newName == undefined || arguments.length != 2)
            return ParametersError();

        let check = await Space.findOne({name: new RegExp('^'+newName+'$', "i")}); // "i" for case-insensitive
        if (check != null && check.length != 0)
            throw new SpaceAlreadyExistsError();

        let result = await Space.findByIdAndUpdate(sid, $set = {name: newName}, {new: true});
        if (result != null) {
            result = JSON.parse(JSON.stringify(result));
            result.name = newName;

            result.sid = result._id;
            delete result._id;
            delete result.__v;

            result.bookings.forEach((item) => {
                item.bid = item._id;
                delete item._id;
            })
        }

        return (result != null) ? result : undefined;
    },

    deleteSpace : async function (sid){
        if (sid == undefined || arguments.length != 1)
            return ParametersError();

        let result = await Space.findByIdAndDelete(sid);
        return (result != null) ? result : undefined;
    },

    editBooking : async function(sid, bid, edit){
        if (!checkBooking(edit))
            throw new ParametersError();

        var space = await Space.findById(sid);
        if (space == undefined){
            console.log("Not found"); 
            return undefined;
        }

        space = JSON.parse(JSON.stringify(space));
        var toUpdate = false;
        var index = undefined;
        
        //Search for the right booking
        for (var i=0; i<space.bookings.length && !toUpdate; i++)
            if (space.bookings[i]._id == bid && space.bookings[i].uid == edit.uid && 
                space.bookings[i].gid == edit.gid){

                //Check for possible overlaps
                for (var j=0; j<space.bookings.length; j++)
                    if (i!=j && checkIntervalOverlaps(edit.from, edit.to, space.bookings[j].from, space.bookings[j].to))
                        throw new IntervalOverlapError();

                space.bookings[i] = edit;
                toUpdate = true;
                index = i;
                break;
            }
        
        if (!toUpdate){
            console.log("Not to update");
            return undefined;
        }

        space = await Space.findByIdAndUpdate(sid, $set = {bookings: space.bookings}, {new: true});
        space = JSON.parse(JSON.stringify(space));

        let updated = space.bookings[index];
        updated.bid = updated._id;
        delete updated._id;
        return updated;
    },

    deleteBooking : async function(sid, bid){
        let result = await Space.updateOne({_id: sid}, {$pull: {"bookings": {_id: bid}}});
        result = JSON.parse(JSON.stringify(result));
        return (result.nModified === 0) ? undefined : true;
    },

    createBooking : async function(sid, booking){
        if (arguments.length != 2 || typeof booking !== "object")
            throw new ParametersError();

        let result = checkBooking(booking);
        if (!result)
            throw new ParametersError();

        //Check that there aren't bookings that overlap with the new one
        let space = await this.retrieveSingleSpace(sid);
        if (space == undefined)
            return undefined;

        for (var i=0; i<space.bookings.length; i++)
            if (checkIntervalOverlaps(space.bookings[i].from, space.bookings[i].to, booking.from, booking.to))
                throw new IntervalOverlapError();                                                    

        let newBooking = new Booking({
            uid: booking.uid,
            from: booking.from,
            to: booking.to,
            type: booking.type,
            gid: booking.gid
        });

        space = await Space.findOneAndUpdate({_id: sid}, {$push: {"bookings": newBooking}}, {new: true});
        space = JSON.parse(JSON.stringify(space));

        let insertedBooking = space.bookings[space.bookings.length-1];
        insertedBooking.bid = insertedBooking._id;
        delete insertedBooking._id;
        delete insertedBooking.__v;
        return insertedBooking;
    },

    getAllBookings : async function(sid){
        let result = await Space.findById(sid);
        if (result == undefined)
            return undefined;
        
        result = JSON.parse(JSON.stringify(result));
        result = result.bookings;
        result.forEach(item => {
            item.bid = item._id;
            delete item._id;
        });

        return result;
    },

    getBooking : async function(sid, bid){
        let result = await this.getAllBookings(sid);
        if (result == undefined)
            return undefined;

        result = JSON.parse(JSON.stringify(result));
        for (var i=0; i<result.length; i++)
            if (result[i].bid === bid)
                return result[i];

        return undefined;
    }

}