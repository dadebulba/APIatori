const mongoose = require('mongoose');

let BookingSchema = new mongoose.Schema({
    uid: {type: String, required: true},
    from: {type: Date, require: true},
    to: {type: Date, required: true},
    gid: {type: String, required: false},
    type: {type: String, required: true, default: "Altro"}
});

let SpaceSchema = new mongoose.Schema({
    name: {type: String, required: true, max: 40, default: ""},
    bookings: {type: [BookingSchema], required: true}
});

module.exports = [mongoose.model('Space', SpaceSchema), mongoose.model('Booking', BookingSchema)];