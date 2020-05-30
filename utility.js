const { DateTime } = require("luxon");
const fetch = require("node-fetch");
const ObjectId = require("mongoose").Types.ObjectId;

const levels = {
    EDUCATOR: "educator",
    COLLABORATOR: "collaborator",
    USER: "user",
    ADMIN: "admin"
}

//Weather API settings
const WEATHER_API_SETTINGS = {
    lang: "it",
    zipCode: "46047,it",
    units: "metric",
    url: "http://api.openweathermap.org/data/2.5/forecast",
    appID: "56c557e7517707ac796be3173d0e0a34"
};

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
    validateParamsDate : function(...params){
        const regex = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;
        return params.some(dt => {
            return dt.toString() === 'Invalid Date' || dt.getFullYear() < new Date().getFullYear() || dt.toISOString().match(regex) === null;
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
    unless : function (middleware, ...excludedUrl){
        return function(req, res, next){
            console.log(req.method, req.path, excludedUrl)
            const match = excludedUrl.some(url => (req.path.includes(url.path) && url.method == req.method));
            match ? next() : middleware(req, res, next);           
        }
    },
    getWeatherInfo: async function (date){ 
        const url = WEATHER_API_SETTINGS.url + "?" + 
            "zip=" + WEATHER_API_SETTINGS.zipCode + 
            "&appid=" + WEATHER_API_SETTINGS.appID +
            "&units=" + WEATHER_API_SETTINGS.units +
            "&lang=" + WEATHER_API_SETTINGS.lang;

        let result = await fetch(url);
        if (result.status != 200){
            console.log("Weather API does not fulfill the request");
            return undefined;
        }

        let tmpJson = await result.json();
        let forecast = tmpJson.list;

        try {
            for (var i=0; i<forecast.length; i++)
                if (forecast[i].dt_txt.split(" ")[0] == date)
                    return {
                        temp: Math.round(forecast[i].main.temp, -1) + "°C",
                        tempMax: Math.round(forecast[i].main.temp_max, -1) + "°C",
                        tempMin: Math.round(forecast[i].main.temp_min, -1) + "°C",
                        humidity: forecast[i].main.humidity,
                        main: forecast[i].weather[0].main,
                        description: forecast[i].weather[0].description.charAt(0).toUpperCase() + forecast[i].weather[0].description.slice(1),
                        clouds: ((forecast[i].clouds) ? forecast[i].clouds.all : 0) + "%",
                        wind: ((forecast[i].wind) ? forecast[i].wind.speed : 0) + " km/h",
                        rain: ((forecast[i].rain) ? forecast[i].rain['3h'] : 0) + " mm",
                        snow: ((forecast[i].snow) ? forecast[i].snow['3h'] : 0) + " mm"
                    };
        } catch (err) {
            console.log("Weather API returned and object not expected");
            return undefined;
        }

        return undefined;
    },
    levels: levels
}
