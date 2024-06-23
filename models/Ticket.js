const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
    ticket_id: {
        type: Number,
        required: true
    },
    wallet_id: {
        type: Number,
        required: true
    },
    balance: {
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

module.exports = mongoose.model("Tickets",ticketSchema);