const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
    crop_name: {
        type: String,
        required: true,
        unique: true
    },
    season: {
        type: String,
        required: true
    },
    water_requirement: {
        type: String,
        enum: ['low', 'medium', 'high'],
        required: true
    },
    avg_yield_per_acre: {
        type: Number,
        required: true
    },
    growth_duration_days: {
        type: Number,
        required: true
    },
    supported_soil_types: [{
        type: String
    }],
    temperature_range: {
        min: Number,
        max: Number
    },
    rainfall_requirement: {
        min: Number,
        max: Number
    },
    market_price_base: {
        type: Number,
        required: false
    }
}, { timestamps: true });

const CropModel = mongoose.model('Crop', cropSchema);

module.exports = CropModel;
