const mongoose = require('mongoose');

let UserSchema = new mongoose.Schema({
    name: {type: String, required: true, max: 40, default: ""},
    surname: {type: String, required: true, max: 40, default: ""},
    mail: {type: String, required: true, max: 40},
    password: {type:String, required: true},
    phone: {type: String, required: false, max: 15},
    role: {type: String, required: true},
    educatorIn: {type: [mongoose.Schema.Types.ObjectId], required: true, default: []},
    collaboratorIn: {type: [mongoose.Schema.Types.ObjectId], required: true, default: []}
});

module.exports = mongoose.model('User', UserSchema);