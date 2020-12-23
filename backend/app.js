const express = require("express");
const bodyParser = require("body-parser");
const handleErrors = require('./middleware/handleErrors');
const api = require("./api");
const {mongooseConnect} = require("./db")

const app = express();
const port = 3000;

app.use(express.static("frontend"));
app.use(bodyParser.json());

mongooseConnect("mongodb://localhost:27017/citiesdb", () => {
    app.listen(port, () =>
        console.log(`app is listening at http://localhost:${port}`)
    );
});

api(app);
app.use(handleErrors);