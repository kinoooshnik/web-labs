const WEATHER_API_MOSCOW_RESPONSE = {"location":{"name":"Москва","region":"Moscow City","country":"Россия","lat":55.75,"lon":37.62,"tz_id":"Europe/Moscow","localtime_epoch":1608758781,"localtime":"2020-12-24 0:26"},"current":{"last_updated_epoch":1608758106,"last_updated":"2020-12-24 00:15","temp_c":-8.0,"temp_f":17.6,"is_day":0,"condition":{"text":"Overcast","icon":"//cdn.weatherapi.com/weather/64x64/night/122.png","code":1009},"wind_mph":13.6,"wind_kph":22.0,"wind_degree":160,"wind_dir":"SSE","pressure_mb":1018.0,"pressure_in":30.5,"precip_mm":0.1,"precip_in":0.0,"humidity":85,"cloud":100,"feelslike_c":-14.4,"feelslike_f":6.1,"vis_km":10.0,"vis_miles":6.0,"uv":1.0,"gust_mph":14.8,"gust_kph":23.8}}
const APP_API_GET_WEATHER_CITY_RESPONSE = {cloud: "100%", coords: {lat: 55.75, lon: 37.62, str: "[55.75, 37.62]"}, humidity: "85%", img: {alt: "Overcast", url: "//cdn.weatherapi.com/weather/128x128/night/122.png",}, placeName: "Москва", pressure: "1018 hpa", temp: "-8°C", wind: "22 kp/h",}
const APP_API_GET_WEATHER_COORDINATES_RESPONSE = {cloud: "100%", coords: {lat: 55.75, lon: 37.62, str: "[55.75, 37.62]"}, humidity: "85%", img: {alt: "Overcast", url: "//cdn.weatherapi.com/weather/128x128/night/122.png",}, placeName: "Москва", pressure: "1018 hpa", temp: "-8°C", wind: "22 kp/h",}

module.exports = {
    WEATHER_API_MOSCOW_RESPONSE: WEATHER_API_MOSCOW_RESPONSE,
    APP_API_GET_WEATHER_CITY_RESPONSE: APP_API_GET_WEATHER_CITY_RESPONSE
};
