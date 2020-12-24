const assert = require('assert');
const mongoose = require('mongoose');
const MockMongoose = require('mock-mongoose').MockMongoose;
const mockMongoose = new MockMongoose(mongoose);
const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const fetchMock = require("fetch-mock");

const handleErrors = require('../backend/middleware/handleErrors');
const api = require("../backend/api");
const {City} = require("../backend/db")
const {WEATHER_API_URL, WEATHER_API_KEY} = require("../backend/consts");
const RESPONSES = require("./responses");
const catchWrap = require("../backend/utils/wrappers");
const {getWeatherFor, responseToObj} = require("../backend/utils/fetch");
const {BadRequest} = require("../backend/utils/errors");

const app = express();
app.use(express.static("frontend"));
app.use(bodyParser.json());
api(app);
app.use(handleErrors);

describe('Backend Tests', () => {
    beforeEach(async () => {
        await mockMongoose.prepareStorage();
        const conn = await mongoose.connect("mongodb://example.com/TestingDB", {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        conn.connection.db.dropDatabase();
        const cities = [new City({name: "Москва"}), new City({name: "Тверь"})]
        await cities[0].save();
        await cities[1].save();
    });

    after(async () => {
        await mockMongoose.killMongo()
    });

    describe('GET /weather/city', () => {
        before(async () => {
            fetchMock.get(encodeURI(`${WEATHER_API_URL}?key=${WEATHER_API_KEY}&q=Москва`), RESPONSES["WEATHER_API_MOSCOW_RESPONSE"]);
        });
        after(async () => {
            fetchMock.reset();
        })
        it('Correct response', async () => {
            const res = await request(app)
                .get(encodeURI("/weather/city?q=Москва"))
                .expect(200)
            assert.deepEqual(res.body, RESPONSES["APP_API_GET_WEATHER_CITY_RESPONSE"])
        });
        it('Incorrect response: missing required fields - q', async () => {
            const res = await request(app)
                .get(encodeURI("/weather/city"))
                .expect(400)
            assert.deepEqual(res.body, {status: "error", message: "Missing required fields: q"})
        });
    });
    describe('GET /weather/coordinates', () => {
        before(async () => {
            fetchMock.get(encodeURI(`${WEATHER_API_URL}?key=${WEATHER_API_KEY}&q=55.75,37.62`), RESPONSES["WEATHER_API_MOSCOW_RESPONSE"]);
        });
        after(async () => {
            fetchMock.reset();
        })
        it('Correct response', async () => {
            const res = await request(app)
                .get(encodeURI("/weather/coordinates?lat=55.75&lon=37.62"))
                .expect(200)
            assert.deepEqual(res.body, RESPONSES["APP_API_GET_WEATHER_CITY_RESPONSE"])
        });
        it('Incorrect response: missing required fields - lat', async () => {
            const res = await request(app)
                .get(encodeURI("/weather/coordinates?lon=37.62"))
                .expect(400)
            assert.deepEqual(res.body, {status: "error", message: "Missing required fields: lat or lon"})
        });
        it('Incorrect response: missing required fields - lon', async () => {
            const res = await request(app)
                .get(encodeURI("/weather/coordinates?lat=55.75"))
                .expect(400)
            assert.deepEqual(res.body, {status: "error", message: "Missing required fields: lat or lon"})
        });
        it('Incorrect response: missing required fields - lat and lon', async () => {
            const res = await request(app)
                .get(encodeURI("/weather/coordinates"))
                .expect(400)
            assert.deepEqual(res.body, {status: "error", message: "Missing required fields: lat or lon"})
        });
    });
    describe('GET /favourites', () => {
        it('Correct response: two cities', async () => {
            const res = await request(app)
                .get("/favourites")
                .expect(200)
            assert.equal(res.body[0].name, "Москва")
            assert.equal(res.body[1].name, "Тверь")
        });
    });
    describe('POST /favourites', async () => {
        it('Correct response: successfully added', async () => {
            const res = await request(app)
                .post("/favourites")
                .send({name: "Moscow"})
                .expect(200)
            assert.equal(res.body.name, "Moscow")
        });
        it('Incorrect response: missing required fields - name', async () => {
            const res = await request(app)
                .post("/favourites")
                .expect(400)
            assert.deepEqual(res.body, {status: "error", message: "Missing required fields: name"})
        });
    });
    describe('DELETE /favourites', () => {
        it('Correct response: successfully deleted', async () => {
            const cities = await City.find({})
            const res = await request(app)
                .delete(`/favourites?id=${cities[0].id}`)
                .expect(200)
            assert.deepEqual(res.body, {_id: cities[0].id, name: cities[0].name});
        });
        it('Incorrect response: missing required fields - id', async () => {
            const res = await request(app)
                .delete("/favourites")
                .expect(400)
            assert.deepEqual(res.body, {status: "error", message: "Missing required fields: id"})
        });
    });
    describe('WRAPPERS', () => {
        it('catchWrap', async () => {
            function test(req, res, next) {
                throw new Error();
            }
            test = catchWrap(test);
            let check = false;
            await test(() => {}, () => {}, () => {check = true})
            assert.equal(check, true);
        });
    });
    describe('FETCH', () => {
        it('responseToObj', async () => {
            assert.deepEqual(responseToObj(RESPONSES["WEATHER_API_MOSCOW_RESPONSE"]), RESPONSES["APP_API_GET_WEATHER_CITY_RESPONSE"])
        });
        it('getWeatherFor: correct result', async () => {
            fetchMock.get(encodeURI(`${WEATHER_API_URL}?key=${WEATHER_API_KEY}&q=Москва`), RESPONSES["WEATHER_API_MOSCOW_RESPONSE"], {overwriteRoutes: true});
            const res = await getWeatherFor("Москва");
            assert.deepEqual(res, RESPONSES["WEATHER_API_MOSCOW_RESPONSE"]);
        });
        it('getWeatherFor: throw exception', async () => {
            fetchMock.get(encodeURI(`${WEATHER_API_URL}?key=${WEATHER_API_KEY}&q=Москва`), {
                status: 400,
                body: RESPONSES["APP_API_ERROR_RESPONSE"]
            }, {overwriteRoutes: true});
            try {
                await getWeatherFor("Москва");
            } catch (e) {
                assert.equal(e instanceof BadRequest, true)
            }
        });
    });
});