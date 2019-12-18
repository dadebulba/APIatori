const mongoose = require('mongoose');
const autoIncrement = require("mongodb-autoincrement").setDefaults({ field: "gid", step: 1 });

let GroupSchema = new mongoose.Schema({
    gid: Schema.Types.ObjectId,
    name: {type: String, required: true, max: 40, default: ""},
    animators: {type: [Number], required: true},
    collaborators: {type: [Number], required: true},
    guys: {type: [Number], required: true},
    calendarMail: {type: String, required: false, max: 50}
});

GroupSchema.plugin(autoIncrement.mongoosePlugin); //For autoincrement ObjectID values
module.exports = mongoose.model('Group', GroupSchema);