const mongoose = require('mongoose');

const weatherDataSchema = new mongoose.Schema({
    region: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    temperature: {
        type: Number,
        required: true
    },
    rainfall: {
        type: Number,
        required: false
    },
    humidity: {
        type: Number,
        required: true
    },
    condition: {
        type: String,
        required: false
    }
}, { timestamps: true });

const WeatherDataModel = mongoose.model('WeatherData', weatherDataSchema);

module.exports = WeatherDataModel;
