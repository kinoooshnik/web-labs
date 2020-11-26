const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const express = require("express");
const bodyParser = require("body-parser");
const handleErrors = require('./middleware/handleErrors');
const {BadRequest} = require('./utils/errors');
const fetch = require("node-fetch");

const WEATHER_API_URL = "https://api.weatherapi.com/v1/current.json"
const WEATHER_API_KEY = "621a48e10fad43b3849183044202810"

const app = express();
const port = 3000;

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

const cityScheme = new Schema({name: {type: String, required: true}}, {versionKey: false});
const City = mongoose.model("City", cityScheme);

mongoose.connect("mongodb://localhost:27017/citiesdb", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, function (err) {
    if (err) return console.log(err);
    app.listen(port, () =>
        console.log(`app is listening at http://localhost:${port}`)
    );
});

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

app.get("/weather/city", async (req, res, next) => {
    const {q} = req.query;
    try {
        if (!q) {
            throw new BadRequest('Missing required fields: q');
        }
        const jsonResponse = await getWeatherFor(q);
        const weather = responseToObj(jsonResponse);
        res.json(weather);
    } catch (err) {
        next(err)
    }
});


app.get("/weather/coordinates", async (req, res, next) => {
    const {lat, lon} = req.query;
    try {
        if (!lat || !lon) {
            throw new BadRequest('Missing required fields: lat or lon');
        }
        const jsonResponse = await getWeatherFor(`${lat},${lon}`);
        const weather = responseToObj(jsonResponse);
        res.json(weather);
    } catch (err) {
        next(err)
    }
});

app.get("/favourites", (req, res, next) => {
    City.find({}, (err, cities) => {
        if (err) next(err);
        res.json(cities)
    });
});

app.post("/favourites", (req, res, next) => {
    try {
        const {name} = req.body;
        if (!name) throw new BadRequest('Missing required fields: name');
        const city = new City({name: name});

        city.save((err) => {
            if (err) next(err);
            res.json(city);
        });
    } catch (err) {
        next(err)
    }
});

app.delete("/favourites", (req, res, next) => {
    try {
        const {id} = req.query;
        if (!id) throw new BadRequest('Missing required fields: id');

        City.findByIdAndDelete(id, (err, user) => {
            if (err) next(err);
            res.json(user);
        });
    } catch (err) {
        next(err)
    }
});

app.use(handleErrors);