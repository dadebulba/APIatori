const { DateTime } = require("luxon");
const fetch = require("node-fetch");

const levels = {
    EDUCATOR :"educator",
    COLLABORATOR : "collaborator",
    USER : "user",
    ADMIN : "admin"
}

function canBeParsedInt(n) {
    return Number(n) === parseInt(n);
}

module.exports = {
    //Ritorna true se c'è almeno un parametro undefined
    validateParamsUndefined: function(...params) {
        return params.some(p => p === undefined);
    },
    //Ritorna true se tutti i parametri sono numeri
    validateParamsNumber: function(...params) {
        return !params.some(p => typeof(p) !== 'number' || isNaN(p));
    },
    //Ritorna true se tutti i parametri sono stringhe
    validateParamsString : function(...params) {
        return !params.some(p => typeof(p) !== 'string');
    },
    //returns true if all the params are correct DateTime formats
    validateParamsDate : function(...params) {
        return !params.some(p => DateTime.fromJSDate(p).isValid === false);
    },
    castToInt: function(value) {
        return canBeParsedInt(value) ? parseInt(value) : undefined;
    },
    validateAuth : function(req, requiredLevel, requiredGid) {
        switch (requiredLevel) {
            case levels.ADMIN:
                return req['role'] === levels.ADMIN;
                break;
            case levels.EDUCATOR:
                if(requiredGid === undefined)
                    return req['educatorIn'].length > 0;
                else
                    return req['educatorIn'].some(v => v == requiredGid);
                break;
            case levels.COLLABORATOR:
                if(requiredGid === undefined)
                    return req['collaboratorIn'].length > 0;
                else
                    return req['collaboratorIn'].some(v => v == requiredGid);
            case levels.USER:
                return req['role'] == levels.USER;
            default:
                return false;
                break;
        }
    },
    validateEmail : function (email){
        const EMAIL_REGEX = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
        return (typeof email === 'string' && email.length > 5 && email.length < 61 && EMAIL_REGEX.test(email));
    },
    validateGroupId : async function (gid) {

        process.env["NODE_CONFIG_DIR"] = "./config/";
        const config = require('config');

        const groupURL = config.baseURL + ":" + config.groupDataLayerPort + config.groupDLPath + "/" + gid;
        let response = await fetch(groupURL);
        return response.status == 200;
    },
    validateUserId : async function(uid){

        process.env["NODE_CONFIG_DIR"] = "./config/";
        const config = require('config');

        const userURL = config.baseURL + ":" + config.userDataLayerPort + config.userDLPath + "/" + uid;
        console.log("Checking uid " + uid + " @ " + userURL);
        let response = await fetch(userURL);
        return response.status == 200;
    },
    levels : levels
}
