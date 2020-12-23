const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cityScheme = new Schema({name: {type: String, required: true}}, {versionKey: false});
const City = mongoose.model("City", cityScheme);

module.exports = {
    City: City,
};