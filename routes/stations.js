const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const router = express.Router();
const Stations = require("../models/Station");
const Trains = require("../models/Train");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



router.post("/api/stations", async (req,res) => {
    try {
        const station = new Stations({
            station_id: req.body.station_id,
            station_name: req.body.station_name,
            longitude: req.body.longitude,
            latitude: req.body.latitude
        });
        await station.save();
        res.status(201).json({
            station_id: station.station_id,
            station_name: station.station_name,
            longitude: station.longitude,
            latitude: station.latitude
        });
    } catch (err) {

    }
});

router.get("/api/stations", async (req,res) => {
     try {
        const stations = await Stations.find();
        const formattedStations = stations.map((station) => ({
            station_id: station.station_id,
            station_name: station.station_name,
            longitude: station.longitude,
            latitude: station.latitude
        }));
        const response = {
            stations: formattedStations || []
        }
        res.status(200).json(response);
     } catch (err) {

     }
});

router.get("/api/stations/:station_id/trains", async (req,res) => {
    try {
        const stationId = parseInt(req.params.station_id);
        const station = await Stations.findOne({station_id: stationId});
        if (station) {
            // Query trains that have a stop at the specified station
            const trains = await Trains.find({ 'stops.station_id': stationId });

            if (trains.length === 0) {
            return res.status(200).json({
                station_id: stationId,
                trains: []
            });
            }

            // Sort the trains according to the specified criteria
            trains.sort((a, b) => {
            const departureA = a.stops.find(stop => stop.station_id === stationId).departure_time || '';
            const departureB = b.stops.find(stop => stop.station_id === stationId).departure_time || '';
            const arrivalA = a.stops.find(stop => stop.station_id === stationId).arrival_time || '';
            const arrivalB = b.stops.find(stop => stop.station_id === stationId).arrival_time || '';

            if (departureA === departureB) {
                return arrivalA.localeCompare(arrivalB) || (a.train_id - b.train_id);
            } else {
                return departureA.localeCompare(departureB);
            }
            });

            // Extract relevant data and send response
            const response = trains.map(train => {
            const stop = train.stops.find(stop => stop.station_id === stationId);
            return {
                train_id: train.train_id,
                arrival_time: stop.arrival_time,
                departure_time: stop.departure_time
            };
            });

            res.status(200).json({
            station_id: stationId,
            trains: response
            });
        }else {
            res.status(404).json({
                message: `station with id: ${stationId} was not found`
            });
        }
    } catch (err) {

    }
});


module.exports = router;