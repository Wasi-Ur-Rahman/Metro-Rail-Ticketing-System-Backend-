const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const router = express.Router();
const Trains = require("../models/Train");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


router.post("/api/trains", async (req, res) => {
    try {
        const { train_id, train_name, capacity, stops } = req.body;

        // Save the train object to the database
        const newTrain = new Trains({
            train_id: train_id,
            train_name: train_name,
            capacity: capacity,
            stops: stops
        });

        await newTrain.save();

        // Calculate service_start, service_ends, and num_stations
        const firstStop = stops[0];
        const lastStop = stops[stops.length - 1];
        const service_start = firstStop.departure_time;
        const service_ends = lastStop.arrival_time;
        const num_stations = stops.length;

        // Respond with a 201 status code and the saved train object
        res.status(201).json({
            train_id: newTrain.train_id,
            train_name: newTrain.train_name,
            capacity: newTrain.capacity,
            service_start: service_start,
            service_ends: service_ends,
            num_stations: num_stations
        });
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;