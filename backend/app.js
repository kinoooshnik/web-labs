const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const handleErrors = require('./middleware/handleErrors');
const api = require("./api");

const app = express();
const port = 3000;

app.use(express.static("frontend"));
app.use(bodyParser.json());

mongoose.connect("mongodb://localhost:27017/citiesdb", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, function (err) {
    if (err) return console.log(err);
    app.listen(port, () =>
        console.log(`app is listening at http://localhost:${port}`)
    );
});

api(app);
app.use(handleErrors);