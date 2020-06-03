const { DateTime } = require("luxon");
const fetch = require("node-fetch");
const ObjectId = require("mongoose").Types.ObjectId;
const userDataLayer = require("./data_layer/user_data_layer/userDataLayer")
const levels = {
    EDUCATOR: "educator",
    COLLABORATOR: "collaborator",
    USER: "user",
    ADMIN: "admin"
}

function canBeParsedInt(n) {
    return Number(n) === parseInt(n);
}

module.exports = {
    //Ritorna true se c'è almeno un parametro undefined
    validateParamsUndefined: function (...params) {
        return params.some(p => p === undefined);
    },
    //returns true if all params are non empty array
    validateParamsArray: function (...params) {
        return params.every(arr => Array.isArray(arr) && Array.length > 0)
    },
    //Ritorna true se tutti i parametri sono numeri
    validateParamsNumber: function (...params ) {
        return params.some(p => typeof (p) !== 'number' || isNaN(p));
    },
    //returns true if one or more params are not strings
    validateParamsString: function (...params) {
        return params.some(p => typeof (p) !== 'string');
    },
    //returns true if all the params are correct DateTime formats
    validateParamsDate : function(...params){
        const regex = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;
        return params.some(dt => {
            return dt.toString() === 'Invalid Date' || dt.getFullYear() < new Date().getFullYear() || regex.test(dt.toISOString()) === false;
        })
    },
    validateParamsDateOld: function (...params) {
        return params.some(p => DateTime.fromJSDate(p).isValid === false);
    },
    castToInt: function (value) {
        return canBeParsedInt(value) ? parseInt(value) : undefined;
    },
    validateAuth: function (req, requiredLevel, requiredGid) {
        switch (requiredLevel) {
            case levels.ADMIN:
                return req['role'] === levels.ADMIN;
                break;
            case levels.EDUCATOR:
                if (requiredGid === undefined)
                    return req['educatorIn'].length > 0 || req['role'] === levels.ADMIN;
                else
                    return req['educatorIn'].some(v => v == requiredGid) || req['role'] === levels.ADMIN;
                break;
            case levels.COLLABORATOR:
                if (requiredGid === undefined)
                    return req['collaboratorIn'].length > 0 || req['role'] === levels.ADMIN;
                else
                    return req['collaboratorIn'].some(v => v == requiredGid) || req['role'] === levels.ADMIN;
            case levels.USER:
                return req['role'] == levels.USER || req['role'] === levels.ADMIN;
            default:
                return false;
                break;
        }
    },
    validateUsers: async function(usersToCheck) {
        const usersOnDB = await userDataLayer.getAllUsers();
        return usersToCheck.every(user => usersOnDB.includes(user))
    },
    checkStatus: function (res) {
        if (res.status != 500) {
            return res;
        } else {
            throw new Error(JSON.stringify({ code: 'E000', message: 'CONNECTION ERROR WITH THE DB' }));
        }
    },
    //returns true if email is valid
    validateEmail: function (email) {
        const EMAIL_REGEX = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
        return (typeof email === 'string' && email.length > 5 && email.length < 61 && EMAIL_REGEX.test(email));
    },
    isObjectIdValid: function (id){
        return id != undefined && ObjectId.isValid(id) && String(new ObjectId(id) === id);
    },
    getAuthHeader: async function (email, password, tokenUrl) {
        const options = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                "action" : "createToken"
            },
            body: JSON.stringify({ email : email, password : password })
        }
        try {
            console.log("bearer", await fetch(tokenUrl, options))
            return {
                'Authorization': `Bearer ${await fetch(tokenUrl, options)}`
            };
        }
        catch (err) {
            throw err;
        }
    },
    unless : function (middleware, ...excludedUrl){
        return function(req, res, next){
            const match = excludedUrl.some(url => (req.path.includes(url.path) && url.method == req.method));
            match ? next() : middleware(req, res, next);           
        }
    },
    levels: levels
}
