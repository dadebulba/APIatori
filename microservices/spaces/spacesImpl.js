const apiUtility = require('../../utility.js');
process.env["NODE_CONFIG_DIR"] = "../../config/";
const config = require('config');

const BASE_URL = process.env.baseURL || config.get('baseURL');
const SPACE_DL_PATH = process.env.spaceDLPath || config.get('spaceDLPath');
const SPACE_DL_PORT = process.env.spaceDataLayerPort || config.get('spaceDataLayerPort');

const SPACE_DL_ENDPOINT = `${BASE_URL}:${SPACE_DL_PORT}${SPACE_DL_PATH}`;

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
            const bookings = await this.getBookings(spaceId);
            if(bookings === undefined)
                return false;

            return bookings.some(b => b.bid === bookingId);
        }
        catch (err) {
            next(err);
        }
    },
    validateSpaceId: async function (spaceId) {
        try {
            const spaces = await this.getSpaces();
            if(spaces === undefined)
                return false;

            return spaces.some(s => s.sid === spaceId);
        }
        catch (err) {
            next(err);
        }
    },
    getSpaces: async function (spaceId) {
        try {
            const res = await fetch(SPACE_DL_ENDPOINT).then(apiUtility.checkStatus);
            if (res.ok) {
                const spaces = await res.json();
                if(spaceId){
                    return space.find(s.sid === spaceId)
                }
                else {
                    return spaces;
                }
            }
            else
                return undefined;

        } catch (err) {
            next(err);
        }
    },
    editSpace: async function (spaceId, name) {
        const body = { name: name };
        try {
            const res = await fetch(`${SPACE_DL_ENDPOINT}/${spaceId}`, {
                method: 'PUT',
                body: JSON.stringify(body),
                headers: { 'Content-Type': 'application/json' }

            }).then(apiUtility.checkStatus);

            if (res.ok) {
                const space = await res.json();
                return space;
            }
            else
                return undefined;

        } catch (err) {
            next(err);
        }
    },
    createNewSpace: async function (name) {
        const body = { name: name };
        try {
            const res = await fetch(SPACE_DL_ENDPOINT, {
                method: 'POST',
                body: JSON.stringify(body),
                headers: { 'Content-Type': 'application/json' }

            }).then(apiUtility.checkStatus);

            if (res.ok) {
                const spaces = await res.json();
                return spaces;
            }
            else
                return undefined;

        } catch (err) {
            next(err);
        }
    },
    deleteSpace: async function (spaceId) {
        try {
            const res = await fetch(`${SPACE_DL_ENDPOINT}/${spaceId}`, {
                method: 'DELETE'
            }).then(apiUtility.checkStatus);

            if (res.ok) {
                return true;
            }
            else
                return false;

        } catch (err) {
            next(err);
        }
    },
    getBookings: async function (spaceId) {
        try {
            const res = await fetch(`${SPACE_DL_ENDPOINT}/${spaceId}`).then(apiUtility.checkStatus);
            if (res.ok) {
                const space = await res.json();
                const bookings = space.bookings;
                return bookings;
            }
            else
                return undefined;

        } catch (err) {
            next(err);
        }
    },
    getBookingGid: async function (spaceId, bookingId) {
        try {
            const bookings = await this.getBookings(spaceId);
            if (bookings === undefined)
                return undefined;

            const searchedBooking = bookings.find(b => b.bid === bookingId);
            if(searchedBooking === undefined)
                return undefined;
            
            return searchedBooking.gid;
        }
        catch (err) {
            next(err);
        }
    },
    createNewBooking : async function (from, to, type, gid, uid, spaceId) {
        const body = { uid : uid, from : from, to : to, type : type, gid : gid };
        try {
            const res = await fetch(`${SPACE_DL_ENDPOINT}/${spaceId}/bookings`, {
                method: 'POST',
                body: JSON.stringify(body),
                headers: { 'Content-Type': 'application/json' }

            }).then(apiUtility.checkStatus);

            if (res.ok) {
                const booking = await res.json();
                return booking;
            }
            else
                return undefined;

        } catch (err) {
            next(err);
        }
    },
    editBooking: async function (spaceId, bookingId, from, to, type, gid, uid) {
        const body = { uid : uid, from : from, to : to, type : type, gid : gid };
        try {
            const res = await fetch(`${SPACE_DL_ENDPOINT}/${spaceId}/bookings/${bookingId}`, {
                method: 'PUT',
                body: JSON.stringify(body),
                headers: { 'Content-Type': 'application/json' }

            }).then(apiUtility.checkStatus);

            if (res.ok) {
                const booking = await res.json();
                return booking;
            }
            else
                return undefined;

        } catch (err) {
            next(err);
        }
    },
    deleteBooking: async function (spaceId, bookingId) {
        try {
            const res = await fetch(`${SPACE_DL_ENDPOINT}/${spaceId}/bookings/${bookingId}`, {
                method: 'DELETE'
            }).then(apiUtility.checkStatus);

            if (res.ok) {
                return true;
            }
            else
                return false;

        } catch (err) {
            next(err);
        }
    }


}