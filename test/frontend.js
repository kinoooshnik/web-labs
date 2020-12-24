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
fetchMock.get(encodeURI(`http://localhost:3000/favourites`), []);

const {
    getWeatherForCity,
    getWeatherForCor,
    addSelectedCityInStorage,
    getAllSelectedCityFromStorage,
    deleteSelectedCityFromStorage,
} = require("../frontend/main.js");


describe('Frontend Tests', () => {
    describe('getWeatherForCity', () => {
        it('Correct response', async () => {
            fetchMock.get(encodeURI(`http://localhost:3000/weather/city?q=Москва`), RESPONSES["APP_API_GET_WEATHER_CITY_RESPONSE"], {overwriteRoutes: true});
            const res = await getWeatherForCity("Москва");
            assert.deepEqual(res, RESPONSES["APP_API_GET_WEATHER_CITY_RESPONSE"]);
        });
        it('Throw exception', async () => {
            fetchMock.get(encodeURI(`http://localhost:3000/weather/city?q=Москва`), {
                status: 400,
                body: RESPONSES["APP_API_ERROR_RESPONSE"]
            }, {overwriteRoutes: true});
            try {
                await getWeatherForCity("Москва")
            } catch (e) {
                assert.equal(e.message, RESPONSES["APP_API_ERROR_RESPONSE"].message)
            }
        });
    });
    describe('getWeatherForCor', () => {
        it('Correct response', async () => {
            fetchMock.get(encodeURI(`http://localhost:3000/weather/coordinates?lat=59.89&lon=30.26`), RESPONSES["APP_API_GET_WEATHER_CITY_RESPONSE"], {overwriteRoutes: true});
            const res = await getWeatherForCor(59.89, 30.26);
            assert.deepEqual(res, RESPONSES["APP_API_GET_WEATHER_CITY_RESPONSE"]);
        });
        it('Throw exception', async () => {
            fetchMock.get(encodeURI(`http://localhost:3000/weather/coordinates?lat=59.89&lon=30.26`), {
                status: 400,
                body: RESPONSES["APP_API_ERROR_RESPONSE"]
            }, {overwriteRoutes: true});
            try {
                await getWeatherForCor(59.89, 30.26);
            } catch (e) {
                assert.equal(e.message, RESPONSES["APP_API_ERROR_RESPONSE"].message)
            }
        });
    });
    describe('getAllSelectedCityFromStorage', () => {
        it('Correct response: empty storage', async () => {
            fetchMock.get(encodeURI(`http://localhost:3000/favourites`), [], {overwriteRoutes: true});
            const res = await getAllSelectedCityFromStorage();
            assert.deepEqual(res, []);
        });
        it('Correct response: one city', async () => {
            fetchMock.get(encodeURI(`http://localhost:3000/favourites`), RESPONSES["APP_API_GET_FAVOURITES_RESPONSE"], {overwriteRoutes: true});
            const res = await getAllSelectedCityFromStorage();
            assert.deepEqual(res, RESPONSES["APP_API_GET_FAVOURITES_RESPONSE"]);
        });
        it('Throw exception', async () => {
            fetchMock.get(encodeURI(`http://localhost:3000/favourites`), {
                status: 400,
                body: RESPONSES["APP_API_ERROR_RESPONSE"]
            }, {overwriteRoutes: true});
            try {
                await getAllSelectedCityFromStorage();
            } catch (e) {
                assert.equal(e.message, RESPONSES["APP_API_ERROR_RESPONSE"].message)
            }
        });
    });
    describe('addSelectedCityInStorage', () => {
        it('Correct response', async () => {
            fetchMock.post(encodeURI(`http://localhost:3000/favourites`), RESPONSES["APP_API_POST_FAVOURITES_RESPONSE"], {overwriteRoutes: true});
            const res = await addSelectedCityInStorage("Москва");
            assert.deepEqual(res, RESPONSES["APP_API_POST_FAVOURITES_RESPONSE"]);
        });
        it('Throw exception', async () => {
            fetchMock.post(encodeURI(`http://localhost:3000/favourites`), {
                status: 400,
                body: RESPONSES["APP_API_ERROR_RESPONSE"]
            }, {overwriteRoutes: true});
            try {
                await addSelectedCityInStorage("Москва");
            } catch (e) {
                assert.equal(e.message, RESPONSES["APP_API_ERROR_RESPONSE"].message)
            }
        });
    });
    describe('deleteSelectedCityFromStorage', () => {
        it('Correct response', async () => {
            fetchMock.delete(encodeURI(`http://localhost:3000/favourites?id=${RESPONSES["APP_API_POST_FAVOURITES_RESPONSE"]._id}`), RESPONSES["APP_API_POST_FAVOURITES_RESPONSE"], {overwriteRoutes: true});
            const res = await deleteSelectedCityFromStorage(RESPONSES["APP_API_POST_FAVOURITES_RESPONSE"]._id);
            assert.deepEqual(res, RESPONSES["APP_API_POST_FAVOURITES_RESPONSE"]);
        });
        it('Throw exception', async () => {
            fetchMock.delete(encodeURI(`http://localhost:3000/favourites`), {
                status: 400,
                body: RESPONSES["APP_API_ERROR_RESPONSE"]
            }, {overwriteRoutes: true});
            try {
                await deleteSelectedCityFromStorage(RESPONSES["APP_API_POST_FAVOURITES_RESPONSE"]._id);
            } catch (e) {
                assert.equal(e.message, RESPONSES["APP_API_ERROR_RESPONSE"].message)
            }
        });
    });
});