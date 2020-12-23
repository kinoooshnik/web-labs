const {BadRequest} = require('./utils/errors');
const {City} = require('./models');
const {getWeatherFor, responseToObj} = require("./utils/fetch");
const catchWrap = require("./utils/wrappers");

function api(app) {
    app.get("/weather/city", catchWrap(async (req, res, next) => {
        const {q} = req.query;
        if (!q) {
            throw new BadRequest('Missing required fields: q');
        }
        const jsonResponse = await getWeatherFor(q);
        const weather = responseToObj(jsonResponse);
        res.json(weather);
    }));


    app.get("/weather/coordinates", catchWrap(async (req, res, next) => {
        const {lat, lon} = req.query;
        if (!lat || !lon) {
            throw new BadRequest('Missing required fields: lat or lon');
        }
        const jsonResponse = await getWeatherFor(`${lat},${lon}`);
        const weather = responseToObj(jsonResponse);
        res.json(weather);
    }));

    app.get("/favourites", catchWrap((req, res, next) => {
        City.find({}, (err, cities) => {
            if (err) next(err);
            res.json(cities)
        });
    }));

    app.post("/favourites", catchWrap((req, res, next) => {
        const {name} = req.body;
        if (!name) throw new BadRequest('Missing required fields: name');
        const city = new City({name: name});

        city.save((err) => {
            if (err) next(err);
            res.json(city);
        });
    }));

    app.delete("/favourites", catchWrap((req, res, next) => {
        const {id} = req.query;
        if (!id) throw new BadRequest('Missing required fields: id');

        City.findByIdAndDelete(id, (err, user) => {
            if (err) next(err);
            res.json(user);
        });
    }));
}

module.exports = api;
