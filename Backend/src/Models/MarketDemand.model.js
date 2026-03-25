const mongoose = require('mongoose');

const marketDemandSchema = new mongoose.Schema({
    crop_name: {
        type: String,
        required: true
    },
    region: {
        type: String,
        required: true
    },
    market_name: {
        type: String,
        required: false
    },
    demandLevel: {
        type: String,
        enum: ['low', 'medium', 'high'],
        required: true
    },
    season: {
        type: String,
        required: false
    },
    quantity: {
        type: Number,
        required: true
    },
    quantityUnit: {
        type: String,
        enum: ['kg', 'quintal', 'ton'],
        default: 'kg'
    },
    price: {
        type: Number,
        required: true
    },
    arrival_volume: {
        type: Number,
        required: false
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const MarketDemandModel = mongoose.model('MarketDemand', marketDemandSchema);

module.exports = MarketDemandModel;
