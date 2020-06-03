const fetch = require("node-fetch");

const endpoint = "http://api.openweathermap.org/data/2.5/forecast";

function validateWeatherOptions(options){
    if (options == undefined || typeof options !== "object") return false;
    if (options.lang && typeof options.lang !== "string") return false;
    if (options.zipCode && typeof options.zipCode !== "string") return false;
    if (options.units && typeof options.units !== "string") return false;

    return true;
}

module.exports = {

    getWeather : async function(appid, options){
        if (appid == undefined || typeof appid !== "string")
            return undefined;

        if (options && !validateWeatherOptions(options))
            return undefined;

        let url = endpoint;
        if (options){
            let parameters = "appid=" + appid + "&";

            if (options.lang) 
                parameters += "lang=" + options.lang + "&";

            if (options.zipCode)
                parameters += "zip=" + options.zipCode + "&";

            if (options.units)
                parameters += "units=" + options.units + "&";

            parameters = parameters.substring(0, parameters.length-1);
            url += "?" + parameters;
        }

        try {
            let result = await fetch(url);
            if (result.status != 200)
                return undefined;

            let toReturn = await result.json();
            return toReturn;
        } catch (err){
            return undefined;
        }   
    }
}