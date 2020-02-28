var crypto = require('crypto');

const User = require("./userSchema.js");
const apiUtility = (process.env.PROD != undefined) ? require("./utility.js") : require('../../utility.js');

module.exports = {

    checkUserBody : function(body){

        if (body == undefined || arguments.length !== 1)
            return false;
        if (apiUtility.validateParamsUndefined(body.name, body.surname, body.birthdate, body.mail, body.password))
            return false;
        body.mail = body.mail.toLowerCase();
        if (!apiUtility.validateEmail(body.mail))
            return false;
            
        if (body.phone != undefined && apiUtility.castToInt(body.phone) == undefined)
            return false;

            
        //Check parent's fields
        if (body.parents != undefined){
            for (var i=0; i<body.parents.length; i++){
                if (apiUtility.validateParamsUndefined(body.parents[i].name, body.parents[i].surname))
                    return false;
                
                if (body.parents[i].mail != undefined){
                    if (!validateEmail(body.parents[i].mail))
                        return false;
                    body.parents[i].mail = body.parents[i].mail.toLowerCase();
                }

                if (body.parents[i].phone != undefined && apiUtility.castToInt(body.parents[i].phone) == undefined)
                    return false;
            }
        }

        return true;
    },

    createUser : async function(newUser){

        //Check that there isn't already an user with the same mail
        let result = User.findOne({mail: new RegExp('^'+newUser.mail+'$', "i")}); // "i" for case-insensitive
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
            role: "User"
        });

        result = await user.save();
        if (result == undefined)
            throw new Error("Can't save new entry on database");
        else {    
            result = JSON.parse(JSON.stringify(result));
            delete result.password;
            return result;           
        }
    },

    retrieveAllUsers : async function(){

        let excludedFields = {
            __v: 0,
            nickname: 0,
            parents: 0,
            birthdate: 0,
            password: 0,
            phone: 0,
            educatorIn: 0,
            collaboratorIn: 0
        }

        let result = await User.find({}, excludedFields);
        result = JSON.parse(JSON.stringify(result));
        return result;
    },

    getUser : async function(uid){

        if (uid == undefined)
            return undefined;

        let user = await User.findById(uid);
        if (user != undefined)
            user = JSON.parse(JSON.stringify(user));

        return user;
    }

}