const { DateTime } = require("luxon");

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
    checkStatus : function (res) {
        if (res.status != 500) {
            return res;
        } else {
            throw new Error(JSON.stringify({code: 'E000', message: 'CONNECTION ERROR WITH THE DB'}));
        }
    },
    validateGroupId : async function (gid) {
        try {
            const group = await fetch("ENDPOINT TO GROUP").then(apiUtility.checkStatus);
            if(group === undefined)
                return false;
            else
                return true;
        }
        catch (err) {
            next(err);
        }
    },
    levels : levels
}
