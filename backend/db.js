const mongoose = require("mongoose");
const Schema = mongoose.Schema;

function mongooseConnect(url, startServer) {
    mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, (err) => {
        if (err) return console.log(err);
        else startServer();
    });
}

const cityScheme = new Schema({name: {type: String, required: true}}, {versionKey: false});
const City = mongoose.model("City", cityScheme);

module.exports = {
    City: City,
    mongooseConnect: mongooseConnect,
};

