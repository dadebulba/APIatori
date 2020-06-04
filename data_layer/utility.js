const ObjectId = require("mongoose").Types.ObjectId;

function canBeParsedInt(n) { return Number(n) === parseInt(n);}

module.exports = {
    validateEmail: function (email) {
        const EMAIL_REGEX = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
        return (typeof email === 'string' && email.length > 5 && email.length < 61 && EMAIL_REGEX.test(email));
    },
    isObjectIdValid: function (id){
        return id != undefined && ObjectId.isValid(id) && String(new ObjectId(id) === id);
    },
    castToInt: function (value) {
        return canBeParsedInt(value) ? parseInt(value) : undefined;
    },
    validateParamsUndefined: function (...params) {
        return params.some(p => p === undefined);
    },
}