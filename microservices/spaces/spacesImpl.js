const bookingType = {
    ACTIVITY : "attivita",
    MEETING : "riunione",
    WINE : "degustazione prosecco",
    OTHER : "altro"
}

module.exports = {
    validateBookingType : function(type) {
        return bookingType.some(p => p === type);
    },
    validateBookingId : function (bookingId) {
        return;
    },
    validateSpaceId : function (spaceId) {
        return;
    },
    getSpaces : function () {
        return;
    },    
    editSpace : function (spaceId, name) {
        return;
    },
    createNewSpace : function (name) {
        return;
    },
    getBookings : function (spaceId) {
        return;
    },
    getBookingGid : function (bookingId) {
        return;
    },
    editBooking : function (spaceId, bookingId, from, to, type, gid, uid){
        return;
    },
    deleteBooking : function (spaceId, bookingId, uid) {
        return;
    }


}