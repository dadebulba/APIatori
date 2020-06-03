const crypto = require('crypto');

const User = require("./userSchema.js");
const apiUtility = require('../../utility.js');

const ParametersError = require("../../errors/parametersError");
const DatabaseError = require("../../errors/databaseError");

function checkUserBody(body){
    if (body == undefined || arguments.length !== 1)
        return false;
    if (apiUtility.validateParamsUndefined(body.name, body.surname, body.birthdate, body.mail, body.password))
        return false;
    body.mail = body.mail.toLowerCase();
    if (!apiUtility.validateEmail(body.mail))
        return false;
            
    if (body.phone != undefined && apiUtility.castToInt(body.phone) == undefined)
        return false;
    
    let checkBirthdate = Date.parse(body.birthdate);
    if (isNaN(checkBirthdate) || checkBirthdate >= Date.now())
        return false;

            
    //Check parent's fields
    if (body.parents != undefined)
        for (var i=0; i<body.parents.length; i++){
            if (apiUtility.validateParamsUndefined(body.parents[i].name, body.parents[i].surname))
                return false;
                
            if (body.parents[i].mail != undefined){
                body.parents[i].mail = body.parents[i].mail.toLowerCase();
                if (!apiUtility.validateEmail(body.parents[i].mail))
                    return false;
            }

            if (body.parents[i].phone != undefined && apiUtility.castToInt(body.parents[i].phone) == undefined)
                return false;
        }

    return true;    
}

module.exports = {

    loadMockUsers: async function(mockUser){

        mockUser = JSON.parse(mockUser);

        for (var i=0; i<mockUser.length; i++){
            const newUser = new User(mockUser[i]);
            await newUser.save();
        }

        return true;
    },

    createUser : async function(newUser){
        undefined
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
            nickname: newUser.nickname,
            birthdate: newUser.birthdate,
            mail: newUser.mail,
            password: newUser.password,
            parents: (newUser.parents != undefined) ? newUser.parents : [],
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
            nickname: 0,
            parents: 0,
            birthdate: 0,
            phone: 0
        }

        let result = await User.find({}, excludedFields);
        result = JSON.parse(JSON.stringify(result));
        return result;
    },

    getUser : async function(uid){

        if (uid == undefined || !apiUtility.isObjectIdValid(uid))
            throw new ParametersError();

        let user = await User.findById(uid);
        if (user != null){
            user = JSON.parse(JSON.stringify(user));
            delete user.__v;
            user.uid = user._id;
            delete user._id;
        }

        return (user != null) ? user : undefined;
    }
}