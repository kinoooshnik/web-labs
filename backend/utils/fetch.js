global.fetch = require("node-fetch");
const {BadRequest} = require('./errors');
const {WEATHER_API_URL, WEATHER_API_KEY} = require("../consts");


async function getWeatherFor(q) {
    const response = await fetch(encodeURI(`${WEATHER_API_URL}?key=${WEATHER_API_KEY}&q=${q}`));
    if (response.status === 400) {
        throw new BadRequest(`No cities found for this request: ${q}`)
    }
    return await response.json();
}

function responseToObj(jsonResponse) {
    return {
        placeName: jsonResponse.location.name,
        coords: {
            lat: jsonResponse.location.lat,
            lon: jsonResponse.location.lon,
            str: `[${jsonResponse.location.lat}, ${jsonResponse.location.lon}]`
        },
        temp: jsonResponse.current.temp_c + "°C",
        wind: jsonResponse.current.wind_kph + " kp/h",
        cloud: jsonResponse.current.cloud + "%",
        pressure: jsonResponse.current.pressure_mb + " hpa",
        humidity: jsonResponse.current.humidity + "%",
        img: {
            alt: jsonResponse.current.condition.text,
            url: jsonResponse.current.condition.icon.replace(/64x64/, "128x128"),
        }
    }
}

module.exports = {
    getWeatherFor: getWeatherFor,
    responseToObj: responseToObj,
}