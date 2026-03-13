const mongoose = require('mongoose');


const marketDemandSchema = new mongoose.Schema({
    imageUrl: {
        type: String,
        required: false
    },
    crop: {
        type: String,
        required: true
    },
    region: {
        type: String,
        required: true

    },
    demandLevel: {
        type: String,
        enum: ['low', 'medium', 'high'],
        required: true
    },
    season:{
        type: String,
        required: true
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
    date: {
        type: Date,
        default: Date.now
    }
})

const MarketDemandModel = mongoose.model('MarketDemand', marketDemandSchema);

module.exports = MarketDemandModel;