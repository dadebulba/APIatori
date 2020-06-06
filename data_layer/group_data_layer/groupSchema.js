const mongoose = require('mongoose');

let TransactionSchema = new mongoose.Schema({
    timestamp: {type: String, required: true},
    amount: {type: Number, required: true},
    causal: {type: String, required: true}
});

let GroupSchema = new mongoose.Schema({
    name: {type: String, required: true, max: 40, default: ""},
    educators: {type: [mongoose.Schema.Types.ObjectId], required: true},
    collaborators: {type: [mongoose.Schema.Types.ObjectId], required: true, default: []},
    guys: {type: [mongoose.Schema.Types.ObjectId], required: true},
    calendarId: {type: String, required: true},
    balance: {type: Number, required: true, default: 0.0},
    transactions: {type: [TransactionSchema], required: true, default: []}
});

module.exports = [mongoose.model('Group', GroupSchema), mongoose.model('Transaction', TransactionSchema)];