const mongoose = require('mongoose');
const autoIncrement = require("mongodb-autoincrement").setDefaults({ field: "gid", step: 1 });

let TransactionSchema = new mongoose.Schema({
    timestamp: {type: String, required: true},
    amount: {type: Number, required: true},
    causal: {type: String, required: true}
});

let GroupSchema = new mongoose.Schema({
    gid: Schema.Types.ObjectId,
    name: {type: String, required: true, max: 40, default: ""},
    animators: {type: [Number], required: true},
    collaborators: {type: [Number], required: true},
    guys: {type: [Number], required: true},
    calendarMail: {type: String, required: false, max: 50},
    balance: {type: Number, required: true, default: 0.0},
    transactions: {type: [TransactionSchema], required: true, default: []}
});

GroupSchema.plugin(autoIncrement.mongoosePlugin); //For autoincrement ObjectID values
module.exports = mongoose.model('Group', GroupSchema);