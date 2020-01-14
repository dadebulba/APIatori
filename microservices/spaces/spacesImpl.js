const bookingType = {
    ACTIVITY : "attivita",
    MEETING : "riunione",
    WINE : "degustazione prosecco",
    OTHER : "altro"
}

function validateBookingType(type) {
    return bookingType.some(p => p === type);
}

module.exports = {
    validateBookingType : validateBookingType
}