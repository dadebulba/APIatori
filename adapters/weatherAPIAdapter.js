const WeatherAPI = require("../data_layer/weatherAPI");
const appid = "56c557e7517707ac796be3173d0e0a34";

const WEATHER_SETTINGS = {
    lang: "en",
    zipCode: "46047,it",
    units: "metric"
};

module.exports = {

    getLocalWeather : async function (date){
        let forecast = await WeatherAPI.getWeather(appid, WEATHER_SETTINGS);
        if (forecast == undefined)
            return undefined;

        forecast = forecast.list;

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

        return undefined;
    }
}