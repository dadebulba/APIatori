//const apiUtility = (process.env.PROD != undefined) ? require("./utility.js") : require('../../utility.js');
const fetch = require("node-fetch");

const spaceDataLayer = process.env.PROD ? require("./space_data_layer/groupDataLayer") : require("../../data_layer/group_data_layer/groupDataLayer.js");

const bookingType = {
    ACTIVITY: "attivita",
    MEETING: "riunione",
    WINE: "degustazione prosecco",
    OTHER: "altro"
}

module.exports = {
    validateBookingType: function (type) {
        return bookingType.some(p => p === type);
    },
    validateBookingId: async function (spaceId, bookingId) {
        try {
            const res = await spaceDataLayer.getBookingForSpace(spaceId, bookingId)
            if(res)
                return true;
            else
                return false; 
        }
        catch (err) {
            next(err);
        }
    },
    validateSpaceId: async function (spaceId) {
        try {
            const res = await spaceDataLayer.getSpace(spaceId)
            if(res)
                return true;
            else
                return false; 
        }
        catch (err) {
            throw(err);
        }
    },
    getSpaces: async function (spaceId) {
        try {
            let spaces;

            if(spaceId) {
                spaces = await spaceDataLayer.getSpace(spaceId);
            }
            else {
                spaces = await spaceDataLayer.getAllSpaces();
            }

            return spaces;

        } catch (err) {
            throw(err);
        }
    },
    editSpace: async function (spaceId, name) {
        try {
            const editedSpace = await spaceDataLayer.modifySpace(spaceId, name);
            return editedSpace;

        } catch (err) {
            throw(err);
        }
    },
    createNewSpace: async function (name) {
        try {
            const newSpace = await spaceDataLayer.createSpace(name);
            return newSpace;

        } catch (err) {
            throw(err);
        }
    },
    deleteSpace: async function (spaceId) {
        try {
            const deletedSpace = await spaceDataLayer.deleteSpace(spaceId);
            return deletedSpace;

        } catch (err) {
            throw(err);
        }
    },
    getBookings: async function (spaceId) {
        try {
            const bookings = await spaceDataLayer.getAllBookingsForSpace(spaceId);
            return bookings;

        } catch (err) {
            next(err);
        }
    },
    getBookingGid: async function (spaceId, bookingId) {
        try {
            const bookings = await spaceDataLayer.getAllBookingsForSpace(spaceId);
            if (bookings){
                const searchedBooking = bookings.find(b => b.bid === bookingId);
                if(searchedBooking)
                    return searchedBooking.gid;
            }
            
            return undefined;
        }
        catch (err) {
            next(err);
        }
    },
    createNewBooking : async function (from, to, type, gid, uid, spaceId) {
        const bookingData = { uid : uid, from : from, to : to, type : type, gid : gid };
        try {
            const newBooking = await spaceDataLayer.createBookingForSpace(spaceId, bookingData);
            return newBooking;

        } catch (err) {
            throw(err);
        }
    },
    editBooking: async function (spaceId, bookingId, from, to, type, gid, uid) {
        const bookingData = { uid : uid, from : from, to : to, type : type, gid : gid };
        try {
            const editedBooking = await spaceDataLayer.modifyBookingForSpace(spaceId, bookingId, bookingData);
            return editedBooking;
        } catch (err) {
            next(err);
        }
    },
    deleteBooking: async function (spaceId, bookingId) {
        try {
            const isDeleted = await spaceDataLayer.deleteBookingForSpace(spaceId, bookingId);
            
            if (isDeleted) {
                return true;
            }
            else
                return false;

        } catch (err) {
            next(err);
        }
    }
}