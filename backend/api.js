const {BadRequest} = require('./utils/errors');
const {City} = require('./models');
const {getWeatherFor, responseToObj} = require("./utils/fetch");

function api(app) {
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
}

module.exports = api;
