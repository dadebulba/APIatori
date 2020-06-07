const mongoose = require('mongoose');

let GroupSchema = new mongoose.Schema({
    name: {type: String, required: true, max: 40, default: ""},
    educators: {type: [mongoose.Schema.Types.ObjectId], required: true},
    collaborators: {type: [mongoose.Schema.Types.ObjectId], required: true, default: []},
    guys: {type: [mongoose.Schema.Types.ObjectId], required: true},
    calendarId: {type: String, required: true}
});

module.exports = mongoose.model('Group', GroupSchema);