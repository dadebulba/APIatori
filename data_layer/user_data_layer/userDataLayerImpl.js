const crypto = require('crypto');

const User = require("./userSchema.js");
const utility = require('../utility.js');

const ParametersError = require("../../errors/parametersError");
const DatabaseError = require("../../errors/databaseError");

function checkUserBody(body){
    if (body == undefined || arguments.length !== 1)
        return false;
    if (utility.validateParamsUndefined(body.name, body.surname, body.mail, body.password))
        return false;

    let validStrings = [body.name, body.surname, body.mail, body.password].every(item => typeof item === "string" && item !== "");
    if (!validStrings)
        return false;

    body.mail = body.mail.toLowerCase();
    if (!utility.validateEmail(body.mail))
        return false;
            
    if (body.phone != undefined && utility.castToInt(body.phone) == undefined)
        return false;

    return true;    
}

module.exports = {

    loadMockUsers: async function(mockUser){

        mockUser = JSON.parse(mockUser);

        for (var i=0; i<mockUser.length; i++){
            mockUser[i].password = crypto.createHash("sha256").update(mockUser[i].password).digest("hex");
            const newUser = new User(mockUser[i]);
            await newUser.save();
        }

        return true;
    },

    createUser : async function(newUser){
        
        if (newUser == undefined || !checkUserBody(newUser))
            throw new ParametersError();

        //Check that there isn't already an user with the same mail
        let result = await User.findOne({mail: new RegExp('^'+newUser.mail+'$', "i")}); // "i" for case-insensitive
        if (result != null)
            return undefined;

        newUser.password = crypto.createHash("sha256").update(newUser.password).digest("hex");

        let user = new User({
            name: newUser.name,
            surname: newUser.surname,
            mail: newUser.mail,
            password: newUser.password,
            phone: newUser.phone,
            role: "user"
        });

        result = await user.save();
        if (result == undefined)
            throw new DatabaseError();
        else {    
            result = JSON.parse(JSON.stringify(result));
            delete result.password;
            result.uid = result._id;
            delete result._id;
            delete result.__v;
            return result;           
        }
    },

    retrieveAllUsers : async function(){

        let excludedFields = {
            __v: 0,
            phone: 0,
            password: 0
        }

        let result = await User.find({}, excludedFields);
        result = JSON.parse(JSON.stringify(result));
        return result;
    },

    getUser : async function(uid){

        if (uid == undefined || !utility.isObjectIdValid(uid))
            throw new ParametersError();

        let user = await User.findById(uid);
        if (user != null){
            user = JSON.parse(JSON.stringify(user));
            delete user.__v;
            user.uid = user._id;
            delete user._id;
            delete user.password;
        }

        return (user != null) ? user : undefined;
    },

    /* Only educatorIn and collaboratorIn fields can be modified */
    modifyUser : async function(uid, userData){
        if (uid == undefined || userData == undefined)
            throw new ParametersError();
        if (!utility.isObjectIdValid(uid) || !Array.isArray(userData.educatorIn) || !Array.isArray(userData.collaboratorIn))
            throw new ParametersError();

        var toUpdate = false;
        var updateObj = {};

        //Check educatorIn and collaboratorIn values
        if (userData.educatorIn != undefined){
            let check = userData.educatorIn.every(item => utility.isObjectIdValid(item));
            if (!check)
                throw new ParametersError();

            toUpdate = true;
            updateObj.educatorIn = userData.educatorIn;
        }

        if (userData.collaboratorIn != undefined){
            let check = userData.collaboratorIn.every(item => utility.isObjectIdValid(item));
            if (!check)
                throw new ParametersError();

            toUpdate = true;
            updateObj.collaboratorIn = userData.collaboratorIn;
        }

        if (!toUpdate)
            throw new ParametersError();
        
        let result = await User.findByIdAndUpdate(uid, $set = updateObj, {new: true});

        if (result != null){
            result = JSON.parse(JSON.stringify(result));
            delete result.__v;
            delete result.password;
            result.uid = result._id;
            delete result._id;
        }

        return (result != null) ? result : undefined;
    },

    userLogin : async function(mail, password){

        if (arguments.length != 2 || mail == undefined || password == undefined)
            throw new ParametersError();

        let checkStrings = [mail, password].every(item => typeof item === "string" && item !== "");
        if (!checkStrings)
            throw new ParametersError();

        if (!utility.validateEmail(mail))
            throw new ParametersError();

        let hashPassword = crypto.createHash("sha256").update(password).digest("hex");
        let excludedFields = {
            __v: 0,
            phone: 0
        }
        let allUsers = await User.find({}, excludedFields);
        allUsers = JSON.parse(JSON.stringify(allUsers));

        for (var i=0; i<allUsers.length; i++)
            if (allUsers[i].mail == mail && allUsers[i].password == hashPassword)
                return {uid: allUsers[i]._id, role: allUsers[i].role, educatorIn: allUsers[i].educatorIn, collaboratorIn: allUsers[i].collaboratorIn};

        return undefined;
    }
}