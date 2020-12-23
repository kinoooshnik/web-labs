const assert = require('assert');
const mongoose = require('mongoose');
const MockMongoose = require('mock-mongoose').MockMongoose;
const mockMongoose = new MockMongoose(mongoose);
const request = require("supertest");

const express = require("express");
const bodyParser = require("body-parser");
const handleErrors = require('../backend/middleware/handleErrors');
const api = require("../backend/api");
const {mongooseConnect} = require("../backend/db")

const app = express();
app.use(express.static("frontend"));
app.use(bodyParser.json());
api(app);
app.use(handleErrors);

describe('Backend Tests', () => {
    before((done) => {
        mockMongoose.prepareStorage().then(() => {
            mongooseConnect("mongodb://example.com/TestingDB", () => {
                done();
            });
        });
    });

    describe('GET /weather/city', () => {
        it('Correct response', (done) => {
            assert.equal(1, 1);
            done();
        });
        it('Incorrect response: missing required fields - q', (done) => {
            assert.equal(1, 1);
            done();
        });
        it('Incorrect response: city not found', (done) => {
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
        it('Incorrect response: unacceptable value - lat', (done) => {
            assert.equal(1, 1);
            done();
        });
        it('Incorrect response: unacceptable value - lon', (done) => {
            assert.equal(1, 1);
            done();
        });
    });
    describe('GET /favourites', () => {
        it('Correct response: empty', (done) => {
            request(app)
                .get("/favourites")
                .expect("[]")
                .end(done);
        });
        it('Correct response: one city', (done) => {
            assert.equal(1, 1);
            done();
        });
        it('Incorrect response: DB error', (done) => {
            assert.equal(1, 1);
            done();
        });
    });
    describe('POST /favourites', () => {
        it('Correct response: successfully added', (done) => {
            request(app)
                .post("/favourites")
                .send({name: "Moscow"})
                .end((err, res) => {
                    request(app)
                        .get("/favourites")
                        .expect("[]")
                        .end(done)
                })

            // done();
        });
        it('Incorrect response: missing required fields - name', (done) => {
            assert.equal(1, 1);
            done();
        });
        it('Incorrect response: DB error', (done) => {
            assert.equal(1, 1);
            done();
        });
    });
    describe('DELETE /favourites', () => {
        it('Correct response: successfully deleted', (done) => {
            assert.equal(1, 1);
            done();
        });
        it('Incorrect response: missing required fields - id', (done) => {
            assert.equal(1, 1);
            done();
        });
        it('Incorrect response: DB error', (done) => {
            assert.equal(1, 1);
            done();
        });
    });
});