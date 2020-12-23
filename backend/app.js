const express = require("express");
const bodyParser = require("body-parser");
const handleErrors = require('./middleware/handleErrors');
const api = require("./api");
const mongoose = require("mongoose");

const app = express();
const port = 3000;

app.use(express.static("frontend"));
app.use(bodyParser.json());

mongoose.connect("mongodb://localhost:27017/citiesdb", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (err) => {
    if (err) return console.log(err);
    else {
        app.listen(port, () =>
            console.log(`app is listening at http://localhost:${port}`)
        );
    }
});

api(app);
app.use(handleErrors);