const mongoose = require('mongoose');

let ParentSchema = new mongoose.Schema({
    name: {type: String, required: true, max: 40},
    surname: {type: String, required: true, max: 40},
    mail: {type: String, required: false, max: 40},
    phone: {type: String, required: false, max: 15}
});

let UserSchema = new mongoose.Schema({
    name: {type: String, required: true, max: 40, default: ""},
    surname: {type: String, required: true, max: 40, default: ""},
    nickname: {type: String, required: false, max: 20},
    birthdate: {type: Date, required: true, default: Date.now()},
    mail: {type: String, required: true, max: 40},
    password: {type:String, required: true},
    parents: {type: [ParentSchema], required: false},
    phone: {type: String, required: false, max: 15},
    role: {type: String, required: true, default: "User"},
    educatorIn: {type: [mongoose.Schema.Types.ObjectId], required: true, default: []},
    collaboratorIn: {type: [mongoose.Schema.Types.ObjectId], required: true, default: []}
});

module.exports = mongoose.model('User', UserSchema);