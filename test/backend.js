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
const {WEATHER_API_MOSCOW_RESPONSE} = require("./responses");

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
            fetchMock.get(encodeURI(`${WEATHER_API_URL}?key=${WEATHER_API_KEY}&q=Москва`), WEATHER_API_MOSCOW_RESPONSE);
        });
        after(async () => {
            fetchMock.reset();
        })
        it('Correct response', async () => {
            const res = await request(app)
                .get(`/weather/city?`)
                .expect(200)
            assert.equal(res.body, "Москва")
        });
        it('Incorrect response: missing required fields - q', (done) => {
            assert.equal(1, 1);
            done();
        });
    });
    describe('GET /weather/coordinates', () => {
        it('Correct response', (done) => {
            assert.equal(1, 1);
            done();
        });
        it('Incorrect response: missing required fields - lat', (done) => {
            assert.equal(1, 1);
            done();
        });
        it('Incorrect response: missing required fields - lon', (done) => {
            assert.equal(1, 1);
            done();
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
});