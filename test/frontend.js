global.fetch = require("node-fetch");
const assert = require('assert');
const fs = require('fs');
const indexHtml = fs.readFileSync('frontend/index.html', {encoding: 'utf8', flag: 'r'});
const {JSDOM} = require('jsdom');
global.document = new JSDOM(indexHtml).window.document;
global.navigator = {
    geolocation: {
        getCurrentPosition: (success, err) => {
            err()
        }
    }
}
const fetchMock = require("fetch-mock");
const RESPONSES = require("./responses");


fetchMock.get(encodeURI(`http://localhost:3000/weather/city?q=Москва`), RESPONSES["APP_API_GET_WEATHER_CITY_RESPONSE"]);
fetchMock.get(encodeURI(`http://localhost:3000/weather/coordinates?lat=59.89&lon=30.26`), RESPONSES["APP_API_GET_WEATHER_CITY_RESPONSE"]);

const {
    getWeatherForCity,
    getWeatherForCor,
    addSelectedCityInStorage,
    getAllSelectedCityFromStorage,
    deleteSelectedCityFromStorage,
    fillCityNode,
} = require("../frontend/main.js");


describe('Frontend Tests', () => {
    before(async () => {
    });

    describe('getWeatherForCity', () => {
        it('Correct response', async () => {
            const res = await getWeatherForCity("Москва");
            assert.deepEqual(res, RESPONSES["APP_API_GET_WEATHER_CITY_RESPONSE"]);
            // assert.deepEqual(res.body, RESPONSES["APP_API_GET_WEATHER_CITY_RESPONSE"]);
        });
    });
    describe('getWeatherForCor', () => {
    });
    describe('addSelectedCityInStorage', () => {
    });
    describe('getAllSelectedCityFromStorage', () => {
    });
    describe('deleteSelectedCityFromStorage', () => {
    });
    describe('fillCityNode', () => {
    });


    it('Correct response', async () => {
    });
    it('Correct response', async () => {
    });
    it('Correct response', async () => {
    });
    it('Correct response', async () => {
    });
    it('Correct response', async () => {
    });
    it('Correct response', async () => {
    });
    it('Correct response', async () => {
    });
    it('Correct response', async () => {
    });
    it('Correct response', async () => {
    });
    it('Correct response', async () => {
    });
    it('Correct response', async () => {
    });
    it('Correct response', async () => {
    });
    it('Correct response', async () => {
    });

});