const mongoose = require('mongoose');
const autoIncrement = require("mongodb-autoincrement").setDefaults({ field: "uid", step: 1 });

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
    role: {type: String, required: true, default: "User"}
});

UserSchema.plugin(autoIncrement.mongoosePlugin); //For autoincrement ObjectID values
module.exports = mongoose.model('User', UserSchema);