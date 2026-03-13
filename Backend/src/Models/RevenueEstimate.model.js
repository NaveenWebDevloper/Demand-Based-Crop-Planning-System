const mongoose = require('mongoose');

const revenueEstimateSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    demandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MarketDemand',
      required: true,
    },
    crop: {
      type: String,
      required: true,
    },
    region: {
      type: String,
      required: true,
    },
    season: {
      type: String,
      required: true,
    },
    adminPricePerUnit: {
      type: Number,
      required: true,
    },
    plannedQuantity: {
      type: Number,
      required: true,
    },
    quantityUnit: {
      type: String,
      enum: ['kg', 'quintal', 'ton'],
      default: 'kg',
    },
    landArea: {
      type: Number,
      default: null,
    },
    landAreaUnit: {
      type: String,
      enum: ['acre', 'hectare'],
      default: 'acre',
    },
    cultivationCostBreakdown: {
      seeds: {
        type: Number,
        default: 0,
      },
      fertilizers: {
        type: Number,
        default: 0,
      },
      pesticides: {
        type: Number,
        default: 0,
      },
      labor: {
        type: Number,
        default: 0,
      },
      irrigation: {
        type: Number,
        default: 0,
      },
      machinery: {
        type: Number,
        default: 0,
      },
      transportation: {
        type: Number,
        default: 0,
      },
      totalCost: {
        type: Number,
        default: 0,
      },
      costPerAcre: {
        type: Number,
        default: null,
      },
      costPerHectare: {
        type: Number,
        default: null,
      },
    },
    estimatedCost: {
      type: Number,
      required: true,
      default: 0,
    },
    expectedRevenue: {
      type: Number,
      required: true,
    },
    estimatedProfit: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const RevenueEstimateModel = mongoose.model('RevenueEstimate', revenueEstimateSchema);

module.exports = RevenueEstimateModel;
