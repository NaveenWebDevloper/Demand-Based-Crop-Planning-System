const mongoose = require('mongoose');

const marketPriceSchema = new mongoose.Schema({
    crop_name: {
        type: String,
        required: true
    },
    market_name: {
        type: String,
        required: true
    },
    region: {
        type: String,
        required: false
    },
    state: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    arrival_quantity: {
        type: Number,
        required: true
    },
    price_min: {
        type: Number,
        required: true
    },
    price_max: {
        type: Number,
        required: true
    },
    price_modal: {
        type: Number,
        required: true
    }
}, { timestamps: true });

// Index for faster queries on common filters
marketPriceSchema.index({ crop_name: 1, state: 1, date: -1 });

const MarketPriceModel = mongoose.model('MarketPrice', marketPriceSchema);

module.exports = MarketPriceModel;
