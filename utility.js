const { DateTime } = require("luxon");
const fetch = require("node-fetch");
const ObjectId = require("mongoose").Types.ObjectId;

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
    //Ritorna true se tutti i parametri sono numeri
    validateParamsNumber: function (...params) {
        return params.some(p => typeof (p) !== 'number' || isNaN(p));
    },
    //Ritorna true se tutti i parametri sono stringhe
    validateParamsString: function (...params) {
        return params.some(p => typeof (p) !== 'string');
    },
    //returns true if all the params are correct DateTime formats
    validateParamsDate: function (...params) {
        return !params.some(p => DateTime.fromJSDate(p).isValid === false);
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
                return req['role'] == levels.USER;
            default:
                return false;
                break;
        }
    },
    checkStatus: function (res) {
        if (res.status != 500) {
            return res;
        } else {
            throw new Error(JSON.stringify({ code: 'E000', message: 'CONNECTION ERROR WITH THE DB' }));
        }
    },
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
    unless : function (middleware, ...excludedPaths){
        return function(req, res, next){
            const match = excludedPaths.some(path => path === req.path);
            match ? next() : middleware(req, res, next);           
        }
    },
    levels: levels
}
