const mongoose = require("mongoose");

const routeSchema = new mongoose.Schema({
    total_cost: {
        type: Number,
        required: true
    },
    total_time: {
        type: Number,
        required: true
    },
    stations: [{
        station_id: {
            type: Number,
            required: true
        },
        train_id: {
            type: Number,
            required: true
        },
        arrival_time: {
            type: String,
            required: true
        },
        departure_time: {
            type: String,
            required: true
        }
    }]
});

module.exports = mongoose.model("Routes", routeSchema);