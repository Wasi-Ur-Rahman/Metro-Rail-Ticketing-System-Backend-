const mongoose = require("mongoose");

const trainSchema = new mongoose.Schema({
    train_id: {
        type: Number,
        required: true
    },
    train_name: {
        type: String,
        required: true
    },
    capacity: {
        type: Number,
        required: true
    },
    stops: [{
        station_id: Number,
        arrival_time: String,
        departure_time: String,
        fare: Number,
      }]
});

module.exports = mongoose.model("Trains", trainSchema);