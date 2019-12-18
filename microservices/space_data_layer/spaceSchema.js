const mongoose = require('mongoose');
const autoIncrement = require("mongodb-autoincrement").setDefaults({ field: "sid", step: 1 });

let BookingSchema = new mongoose.Schema({
    uid: {type: Number, required: true},
    from: {type: Date, require: true},
    to: {type: Date, required: true},
    gid: {type: Number, required: false}
});

let SpaceSchema = new mongoose.Schema({
    sid: Schema.Types.ObjectId,
    name: {type: String, required: true, max: 40, default: ""},
    bookings: {type: [BookingSchema], required: true}
});

SpaceSchema.plugin(autoIncrement.mongoosePlugin); //For autoincrement ObjectID values
module.exports = mongoose.model('Space', SpaceSchema);