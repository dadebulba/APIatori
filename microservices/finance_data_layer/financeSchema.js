const mongoose = require('mongoose');

let FinanceSchema = new mongoose.Schema({
    name: {type: String, required: true, max: 40, default: ""},
    bookings: {type: [BookingSchema], required: true}
});

module.exports = mongoose.model('Finance', FinanceSchema);


/** VEDERE SE E' UNA PROPRIETA' DI GROUP O SE FARE UN DOC A PARTE */