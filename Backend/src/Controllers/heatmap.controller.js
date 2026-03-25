const MarketPriceModel = require('../Models/MarketPrice.model');
const MarketDemandModel = require('../Models/MarketDemand.model');

// Realistic static fallback seed data for Indian regions when DB has no data
const FALLBACK_REGIONAL_DATA = [
    { region: 'Hyderabad',    totalVolume: 12400, avgPrice: 3200,  crops: ['Tomato', 'Onion', 'Rice'],     demandLevel: 'high'   },
    { region: 'Warangal',     totalVolume: 7800,  avgPrice: 2800,  crops: ['Cotton', 'Maize', 'Chilli'],   demandLevel: 'high'   },
    { region: 'Karimnagar',   totalVolume: 6100,  avgPrice: 2400,  crops: ['Paddy', 'Soybean', 'Maize'],   demandLevel: 'high'   },
    { region: 'Nizamabad',    totalVolume: 5500,  avgPrice: 2600,  crops: ['Turmeric', 'Paddy', 'Maize'],  demandLevel: 'high'   },
    { region: 'Khammam',      totalVolume: 4200,  avgPrice: 2300,  crops: ['Cotton', 'Paddy', 'Maize'],    demandLevel: 'medium' },
    { region: 'Sangareddy',   totalVolume: 3800,  avgPrice: 2100,  crops: ['Paddy', 'Maize', 'Soybean'],  demandLevel: 'medium' },
    { region: 'Mahbubnagar',  totalVolume: 3200,  avgPrice: 1900,  crops: ['Cotton', 'Groundnut', 'Jowar'],demandLevel: 'medium' },
    { region: 'Rangareddy',   totalVolume: 2900,  avgPrice: 3500,  crops: ['Vegetables', 'Tomato'],         demandLevel: 'medium' },
    { region: 'Pune',         totalVolume: 9800,  avgPrice: 3100,  crops: ['Onion', 'Grapes', 'Wheat'],    demandLevel: 'high'   },
    { region: 'Nagpur',       totalVolume: 6700,  avgPrice: 2700,  crops: ['Orange', 'Cotton', 'Soybean'], demandLevel: 'high'   },
    { region: 'Nashik',       totalVolume: 5400,  avgPrice: 2200,  crops: ['Onion', 'Grapes', 'Tomato'],   demandLevel: 'high'   },
    { region: 'Ahmedabad',    totalVolume: 8200,  avgPrice: 2900,  crops: ['Cotton', 'Groundnut', 'Wheat'],demandLevel: 'high'   },
    { region: 'Bangalore',    totalVolume: 7600,  avgPrice: 3400,  crops: ['Ragi', 'Vegetables', 'Rose'],  demandLevel: 'high'   },
    { region: 'Mysore',       totalVolume: 4300,  avgPrice: 2600,  crops: ['Paddy', 'Sugarcane', 'Maize'], demandLevel: 'medium' },
    { region: 'Chennai',      totalVolume: 8900,  avgPrice: 3300,  crops: ['Rice', 'Banana', 'Coconut'],   demandLevel: 'high'   },
    { region: 'Coimbatore',   totalVolume: 5600,  avgPrice: 2500,  crops: ['Cotton', 'Banana', 'Maize'],   demandLevel: 'high'   },
    { region: 'Lucknow',      totalVolume: 7200,  avgPrice: 2800,  crops: ['Wheat', 'Sugarcane', 'Paddy'], demandLevel: 'high'   },
    { region: 'Jaipur',       totalVolume: 4600,  avgPrice: 2400,  crops: ['Mustard', 'Wheat', 'Bajra'],   demandLevel: 'medium' },
    { region: 'Amritsar',     totalVolume: 3800,  avgPrice: 2600,  crops: ['Wheat', 'Paddy', 'Maize'],     demandLevel: 'medium' },
    { region: 'Delhi',        totalVolume: 900,   avgPrice: 4200,  crops: ['Vegetables', 'Fruits'],         demandLevel: 'low'    },
    { region: 'Mumbai',       totalVolume: 750,   avgPrice: 4800,  crops: ['Bhindi', 'Tomato'],             demandLevel: 'low'    },
    { region: 'Medchal',      totalVolume: 2100,  avgPrice: 2000,  crops: ['Paddy', 'Vegetables'],          demandLevel: 'medium' },
    { region: 'Surat',        totalVolume: 3200,  avgPrice: 2300,  crops: ['Cotton', 'Groundnut'],          demandLevel: 'medium' },
];

/**
 * Build heatmap data from MarketPrice collection (primary source).
 * Groups by region, computes total volume, avg price, crops, and demand level.
 */
const buildFromMarketPrice = async () => {
    return MarketPriceModel.aggregate([
        {
            $group: {
                _id: '$region',
                totalVolume: { $sum: '$arrival_quantity' },
                avgPrice: { $avg: '$price_modal' },
                crops: { $addToSet: '$crop_name' }
            }
        },
        {
            $match: { _id: { $ne: null } }
        },
        {
            $project: {
                region: '$_id',
                totalVolume: 1,
                avgPrice: 1,
                crops: 1,
                demandLevel: {
                    $cond: {
                        if: { $gt: ['$totalVolume', 5000] },
                        then: 'high',
                        else: {
                            $cond: {
                                if: { $gt: ['$totalVolume', 1000] },
                                then: 'medium',
                                else: 'low'
                            }
                        }
                    }
                }
            }
        }
    ]);
};

/**
 * Build heatmap data from MarketDemand collection (secondary source).
 * Groups by region, computes total quantity, avg price, crops, and demand level.
 */
const buildFromMarketDemand = async () => {
    return MarketDemandModel.aggregate([
        {
            $group: {
                _id: '$region',
                totalVolume: { $sum: { $ifNull: ['$arrival_volume', '$quantity'] } },
                avgPrice: { $avg: '$price' },
                crops: { $addToSet: '$crop_name' },
                // Also pick up the stored demandLevel directly
                topDemandLevel: { $first: '$demandLevel' }
            }
        },
        {
            $match: { _id: { $ne: null } }
        },
        {
            $project: {
                region: '$_id',
                totalVolume: 1,
                avgPrice: { $multiply: ['$avgPrice', 100] }, // price was stored in paise
                crops: 1,
                demandLevel: {
                    $cond: {
                        if: { $gt: ['$totalVolume', 5000] },
                        then: 'high',
                        else: {
                            $cond: {
                                if: { $gt: ['$totalVolume', 500] },
                                then: 'medium',
                                else: { $ifNull: ['$topDemandLevel', 'low'] }
                            }
                        }
                    }
                }
            }
        }
    ]);
};

const getRegionalDemand = async (req, res) => {
    try {
        // ── Tier 1: Try MarketPrice (real government signals) ──────────────
        let regionalData = await buildFromMarketPrice();

        // ── Tier 2: Fall back to MarketDemand (admin-entered data) ─────────
        if (!regionalData || regionalData.length === 0) {
            regionalData = await buildFromMarketDemand();
        }

        // ── Tier 3: Fall back to static seed data ──────────────────────────
        if (!regionalData || regionalData.length === 0) {
            console.log('[Heatmap] No DB data found — returning static seed data.');
            return res.json({
                success: true,
                data: FALLBACK_REGIONAL_DATA,
                source: 'static_seed'
            });
        }

        res.json({
            success: true,
            data: regionalData,
            source: regionalData.length > 0 ? 'database' : 'static_seed'
        });

    } catch (error) {
        console.error('Heatmap data error:', error.message);
        // Even on errors, return seed data so the map is never empty
        res.json({
            success: true,
            data: FALLBACK_REGIONAL_DATA,
            source: 'static_seed_on_error',
            warning: error.message
        });
    }
};

module.exports = { getRegionalDemand };
