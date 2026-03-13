const MarketDemandModel = require('../Models/MarketDemand.model');
const RevenueEstimateModel = require('../Models/RevenueEstimate.model');

const COST_FIELDS = [
    'seeds',
    'fertilizers',
    'pesticides',
    'labor',
    'irrigation',
    'machinery',
    'transportation',
];

const HECTARE_TO_ACRE = 2.47105;
const QUANTITY_UNITS = ['kg', 'quintal', 'ton'];
const DEFAULT_GOVT_MARKET_API_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
const DEFAULT_GOVT_MARKET_LIMIT = 12;
const PRIORITY_GOVT_STATES = ['Andhra Pradesh', 'Telangana'];
const GOVERNMENT_MARKET_BASELINES = [
    { commodity: 'Wheat', grade: 'MSP', state: 'Punjab', market: 'Ludhiana', unit: 'quintal', basePrice: 2425 },
    { commodity: 'Paddy', grade: 'Common', state: 'Uttar Pradesh', market: 'Lucknow', unit: 'quintal', basePrice: 2300 },
    { commodity: 'Maize', grade: 'FAQ', state: 'Bihar', market: 'Patna', unit: 'quintal', basePrice: 2225 },
    { commodity: 'Cotton', grade: 'Medium Staple', state: 'Gujarat', market: 'Rajkot', unit: 'quintal', basePrice: 7121 },
    { commodity: 'Tur (Arhar)', grade: 'MSP', state: 'Madhya Pradesh', market: 'Indore', unit: 'quintal', basePrice: 7550 },
    { commodity: 'Mustard', grade: 'FAQ', state: 'Rajasthan', market: 'Jaipur', unit: 'quintal', basePrice: 5950 },
];

const parsePositiveNumber = (value) => {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : null;
};

const buildFallbackGovtData = (now) => {
    const minuteSeed = now.getUTCMinutes();

    return GOVERNMENT_MARKET_BASELINES.map((entry, index) => {
        const swing = ((minuteSeed + index * 3) % 11) - 5;
        const livePrice = Math.max(entry.basePrice + swing, 1);

        return {
            ...entry,
            livePrice,
            previousClose: entry.basePrice,
            change: livePrice - entry.basePrice,
            source: 'Govt-Controlled Reference Feed',
            updatedAt: now.toISOString(),
        };
    });
};

const mapGovtRecordToTickerEntry = (record, index, now) => {
    const livePrice =
        parsePositiveNumber(record.modal_price) ??
        parsePositiveNumber(record.modalPrice) ??
        parsePositiveNumber(record.price) ??
        parsePositiveNumber(record.livePrice);

    if (!livePrice) return null;

    const previousClose =
        parsePositiveNumber(record.previous_close) ??
        parsePositiveNumber(record.previousClose) ??
        parsePositiveNumber(record.min_price) ??
        parsePositiveNumber(record.minPrice) ??
        livePrice;

    return {
        commodity: record.commodity || record.crop || `Crop ${index + 1}`,
        grade: record.variety || record.grade || 'FAQ',
        state: record.state || record.state_name || 'India',
        market: record.market || record.market_name || record.district || 'Govt Mandi',
        unit: record.unit || 'quintal',
        livePrice,
        previousClose,
        change: livePrice - previousClose,
        source: 'Official Government Market Feed',
        updatedAt: record.arrival_date || record.updatedAt || now.toISOString(),
    };
};

const fetchGovtRecords = async (baseUrl, queryParams = {}) => {
    if (typeof fetch !== 'function') {
        throw new Error('Global fetch is not available in this Node runtime.');
    }

    const url = new URL(baseUrl.toString());
    Object.entries(queryParams).forEach(([key, value]) => {
        if (value == null || value === '') return;
        url.searchParams.set(key, String(value));
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: { Accept: 'application/json' },
            signal: controller.signal,
        });

        if (!response.ok) {
            throw new Error(`Government market API returned ${response.status}`);
        }

        const payload = await response.json();
        const records = Array.isArray(payload?.records)
            ? payload.records
            : Array.isArray(payload?.data)
                ? payload.data
                : [];

        return {
            records,
            upstreamSource: payload?.source || payload?.title || 'Official Government API',
        };
    } finally {
        clearTimeout(timeoutId);
    }
};

const fetchOfficialGovernmentMarketData = async () => {
    const limit = parseInt(process.env.GOVT_MARKET_LIMIT || `${DEFAULT_GOVT_MARKET_LIMIT}`, 10);
    const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : DEFAULT_GOVT_MARKET_LIMIT;
    const endpoint = process.env.GOVT_MARKET_API_URL || DEFAULT_GOVT_MARKET_API_URL;
    const apiKey = process.env.GOVT_MARKET_API_KEY;
    const baseUrl = new URL(endpoint);

    if (apiKey && !baseUrl.searchParams.has('api-key')) {
        baseUrl.searchParams.set('api-key', apiKey);
    }

    if (!baseUrl.searchParams.has('format')) {
        baseUrl.searchParams.set('format', 'json');
    }

    const priorityFetchLimit = Math.max(6, Math.ceil(safeLimit / 2));
    const generalFetchLimit = Math.max(safeLimit * 2, 20);

    const settledResults = await Promise.allSettled([
        fetchGovtRecords(baseUrl, {
            limit: priorityFetchLimit,
            'filters[state]': PRIORITY_GOVT_STATES[0],
            'sort[modal_price]': 'desc',
        }),
        fetchGovtRecords(baseUrl, {
            limit: priorityFetchLimit,
            'filters[state]': PRIORITY_GOVT_STATES[1],
            'sort[modal_price]': 'desc',
        }),
        fetchGovtRecords(baseUrl, {
            limit: generalFetchLimit,
            offset: 0,
            'sort[modal_price]': 'desc',
        }),
    ]);

    const successfulResults = settledResults
        .filter((result) => result.status === 'fulfilled')
        .map((result) => result.value);

    if (!successfulResults.length) {
        const firstError = settledResults.find((result) => result.status === 'rejected');
        throw firstError?.reason || new Error('Unable to fetch government market data.');
    }

    const mergedRecords = successfulResults.flatMap((result) => result.records || []);
    const seenKeys = new Set();
    const uniqueRecords = [];

    for (const record of mergedRecords) {
        const uniqueKey = [
            String(record?.state || '').toLowerCase(),
            String(record?.district || '').toLowerCase(),
            String(record?.market || '').toLowerCase(),
            String(record?.commodity || '').toLowerCase(),
            String(record?.variety || '').toLowerCase(),
            String(record?.arrival_date || '').toLowerCase(),
        ].join('|');

        if (seenKeys.has(uniqueKey)) continue;
        seenKeys.add(uniqueKey);
        uniqueRecords.push(record);
    }

    const upstreamSource = successfulResults[0]?.upstreamSource || 'Official Government API';
    const hasPriorityStateData = uniqueRecords.some((record) => {
        const state = String(record?.state || '').toLowerCase();
        return state === 'andhra pradesh' || state === 'telangana';
    });

    return {
        records: uniqueRecords.slice(0, safeLimit),
        upstreamSource,
        hasPriorityStateData,
    };
};

const normalizeBody = (body) => {
    if (!body) return null;

    if (Buffer.isBuffer(body)) {
        const text = body.toString('utf8').trim();
        if (!text) return null;

        try {
            return JSON.parse(text);
        } catch (_err) {
            const form = new URLSearchParams(text);
            if (![...form.keys()].length) return null;
            return Object.fromEntries(form.entries());
        }
    }

    if (typeof body === 'object') return body;

    if (typeof body === 'string') {
        const text = body.trim();
        if (!text) return null;

        try {
            return JSON.parse(text);
        } catch (_err) {
            const form = new URLSearchParams(text);
            if (![...form.keys()].length) return null;
            return Object.fromEntries(form.entries());
        }
    }

    return null;
};

const parseNumber = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : NaN;
};

const hasAllCostFields = (payload) => COST_FIELDS.every((field) => payload[field] != null);

const buildCultivationCostDetails = (payload, { requireBreakdown = false } = {}) => {
    const areaRaw = payload.landArea;
    const unitRaw = (payload.landAreaUnit || 'acre').toString().toLowerCase();
    const landAreaUnit = unitRaw === 'hectare' ? 'hectare' : 'acre';
    const hasBreakdown = hasAllCostFields(payload);

    if (requireBreakdown && !hasBreakdown) {
        return {
            error: 'Missing cultivation cost fields. Provide seeds, fertilizers, pesticides, labor, irrigation, machinery, and transportation.'
        };
    }

    if (hasBreakdown) {
        const area = parseNumber(areaRaw);
        if (Number.isNaN(area) || area <= 0) {
            return {
                error: 'landArea must be a number greater than 0 when cultivation costs are provided.'
            };
        }

        const costBreakdown = {};
        for (const field of COST_FIELDS) {
            const value = parseNumber(payload[field]);
            if (Number.isNaN(value) || value < 0) {
                return {
                    error: `${field} must be a non-negative number.`
                };
            }
            costBreakdown[field] = value;
        }

        const totalCost = COST_FIELDS.reduce((sum, field) => sum + costBreakdown[field], 0);
        const landAreaInAcres = landAreaUnit === 'hectare' ? area * HECTARE_TO_ACRE : area;
        const landAreaInHectares = landAreaUnit === 'acre' ? area / HECTARE_TO_ACRE : area;

        return {
            estimatedCost: totalCost,
            landArea: area,
            landAreaUnit,
            cultivationCostBreakdown: {
                ...costBreakdown,
                totalCost,
                costPerAcre: landAreaInAcres > 0 ? totalCost / landAreaInAcres : null,
                costPerHectare: landAreaInHectares > 0 ? totalCost / landAreaInHectares : null,
            }
        };
    }

    const directCost = parseNumber(payload.estimatedCost ?? 0);
    if (Number.isNaN(directCost) || directCost < 0) {
        return {
            error: 'estimatedCost must be a non-negative number.'
        };
    }

    return {
        estimatedCost: directCost,
        landArea: null,
        landAreaUnit,
        cultivationCostBreakdown: {
            seeds: 0,
            fertilizers: 0,
            pesticides: 0,
            labor: 0,
            irrigation: 0,
            machinery: 0,
            transportation: 0,
            totalCost: directCost,
            costPerAcre: null,
            costPerHectare: null,
        }
    };
};


// Create a new market demand entry
const MarketDemand = async (req, res) => {
    try {
        const payload = normalizeBody(req.body);

        if (!payload) {
            return res.status(400).json({
                message: 'Request body is missing. Send JSON with crop, region, demandLevel, season, quantity, and price.'
            });
        }

        const { crop, region, demandLevel, season, quantity, quantityUnit = 'kg', price, imageUrl } = payload;

        if (!crop || !region || !demandLevel || !season || quantity == null || price == null) {
            return res.status(400).json({
                message: 'Missing required fields: crop, region, demandLevel, season, quantity, price'
            });
        }

        const parsedQuantity = Number(quantity);
        const parsedPrice = Number(price);
        const normalizedQuantityUnit = String(quantityUnit).toLowerCase();

        if (Number.isNaN(parsedQuantity) || parsedQuantity <= 0) {
            return res.status(400).json({ message: 'quantity must be a number greater than 0' });
        }

        if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
            return res.status(400).json({ message: 'price must be a number greater than 0' });
        }

        if (!QUANTITY_UNITS.includes(normalizedQuantityUnit)) {
            return res.status(400).json({ message: 'quantityUnit must be one of kg, quintal, or ton' });
        }

        const newDemand = await MarketDemandModel.create({
            crop,
            region,
            demandLevel,
            season,
            quantity: parsedQuantity,
            quantityUnit: normalizedQuantityUnit,
            price: parsedPrice,
            imageUrl
        });
        res.status(201).json({ message: 'Market demand entry created successfully', demand: newDemand });
    } catch (error) {
        console.error('Market Demand Error:', error.message);
        res.status(500).json({ message: 'Error creating market demand entry', error: error.message });
    }
};

// Public feed used by home page ticker for government controlled reference rates.
const getGovernmentLiveMarketData = async (_req, res) => {
    const now = new Date();

    try {
        const { records, upstreamSource, hasPriorityStateData } = await fetchOfficialGovernmentMarketData();

        const data = records
            .map((record, index) => mapGovtRecordToTickerEntry(record, index, now))
            .filter(Boolean)
            .slice(0, DEFAULT_GOVT_MARKET_LIMIT);

        if (!data.length) {
            throw new Error('Government market API returned no valid records.');
        }

        return res.status(200).json({
            source: upstreamSource,
            refreshedAt: now.toISOString(),
            data,
            isFallback: false,
            hasPriorityStateData,
            priorityStates: PRIORITY_GOVT_STATES,
        });
    } catch (error) {
        console.error('Get Government Live Market Data Error:', error.message);

        const fallbackData = buildFallbackGovtData(now);
        return res.status(200).json({
            source: 'Government Controlled Feed (Fallback)',
            refreshedAt: now.toISOString(),
            data: fallbackData,
            isFallback: true,
            warning: `Using fallback because upstream API failed: ${error.message}`,
        });
    }
};

// List market demand entries for dashboard view
const getMarketDemands = async (_req, res) => {
    try {
        const demands = await MarketDemandModel.find().sort({ date: -1 });
        res.status(200).json({ demands });
    } catch (error) {
        console.error('Get Market Demand Error:', error.message);
        res.status(500).json({ message: 'Error fetching market demand entries', error: error.message });
    }
};

// Estimate revenue for a farmer based on selected admin demand
const estimateRevenue = async (req, res) => {
    try {
        const payload = normalizeBody(req.body);

        if (!payload) {
            return res.status(400).json({
                message: 'Request body is missing. Send demandId and plannedQuantity.'
            });
        }

        const { demandId, plannedQuantity } = payload;

        if (!demandId || plannedQuantity == null) {
            return res.status(400).json({
                message: 'Missing required fields: demandId, plannedQuantity'
            });
        }

        const demand = await MarketDemandModel.findById(demandId);
        if (!demand) {
            return res.status(404).json({ message: 'Market demand not found' });
        }

        const quantity = Number(plannedQuantity);

        if (Number.isNaN(quantity) || quantity <= 0) {
            return res.status(400).json({ message: 'plannedQuantity must be a number greater than 0' });
        }

        if (quantity > demand.quantity) {
            return res.status(400).json({
                message: `plannedQuantity cannot exceed admin available quantity (${demand.quantity} ${demand.quantityUnit || 'kg'}).`
            });
        }

        const costDetails = buildCultivationCostDetails(payload);
        if (costDetails.error) {
            return res.status(400).json({ message: costDetails.error });
        }

        const cost = costDetails.estimatedCost;
        const expectedRevenue = quantity * demand.price;
        const estimatedProfit = expectedRevenue - cost;

        return res.status(200).json({
            estimate: {
                crop: demand.crop,
                region: demand.region,
                season: demand.season,
                adminPricePerUnit: demand.price,
                plannedQuantity: quantity,
                quantityUnit: demand.quantityUnit || 'kg',
                demandAvailableQuantity: demand.quantity,
                landArea: costDetails.landArea,
                landAreaUnit: costDetails.landAreaUnit,
                cultivationCostBreakdown: costDetails.cultivationCostBreakdown,
                estimatedCost: cost,
                expectedRevenue,
                estimatedProfit,
            }
        });
    } catch (error) {
        console.error('Estimate Revenue Error:', error.message);
        return res.status(500).json({ message: 'Error estimating revenue', error: error.message });
    }
};

const saveRevenueEstimate = async (req, res) => {
    try {
        const payload = normalizeBody(req.body);

        if (!payload) {
            return res.status(400).json({
                message: 'Request body is missing. Send demandId and plannedQuantity.'
            });
        }

        const { demandId, plannedQuantity } = payload;

        if (!demandId || plannedQuantity == null) {
            return res.status(400).json({
                message: 'Missing required fields: demandId, plannedQuantity'
            });
        }

        const demand = await MarketDemandModel.findById(demandId);
        if (!demand) {
            return res.status(404).json({ message: 'Market demand not found' });
        }

        const quantity = Number(plannedQuantity);

        if (Number.isNaN(quantity) || quantity <= 0) {
            return res.status(400).json({ message: 'plannedQuantity must be a number greater than 0' });
        }

        if (quantity > demand.quantity) {
            return res.status(400).json({
                message: `plannedQuantity cannot exceed admin available quantity (${demand.quantity} ${demand.quantityUnit || 'kg'}).`
            });
        }

        const costDetails = buildCultivationCostDetails(payload, { requireBreakdown: true });
        if (costDetails.error) {
            return res.status(400).json({ message: costDetails.error });
        }

        const cost = costDetails.estimatedCost;
        const expectedRevenue = quantity * demand.price;
        const estimatedProfit = expectedRevenue - cost;

        const savedEstimate = await RevenueEstimateModel.create({
            farmerId: req.user.id,
            demandId: demand._id,
            crop: demand.crop,
            region: demand.region,
            season: demand.season,
            adminPricePerUnit: demand.price,
            plannedQuantity: quantity,
            quantityUnit: demand.quantityUnit || 'kg',
            landArea: costDetails.landArea,
            landAreaUnit: costDetails.landAreaUnit,
            cultivationCostBreakdown: costDetails.cultivationCostBreakdown,
            estimatedCost: cost,
            expectedRevenue,
            estimatedProfit,
        });

        return res.status(201).json({
            message: 'Revenue estimate saved successfully',
            estimate: {
                crop: savedEstimate.crop,
                region: savedEstimate.region,
                season: savedEstimate.season,
                adminPricePerUnit: savedEstimate.adminPricePerUnit,
                plannedQuantity: savedEstimate.plannedQuantity,
                quantityUnit: savedEstimate.quantityUnit,
                landArea: savedEstimate.landArea,
                landAreaUnit: savedEstimate.landAreaUnit,
                cultivationCostBreakdown: savedEstimate.cultivationCostBreakdown,
                estimatedCost: savedEstimate.estimatedCost,
                expectedRevenue: savedEstimate.expectedRevenue,
                estimatedProfit: savedEstimate.estimatedProfit,
                createdAt: savedEstimate.createdAt,
            }
        });
    } catch (error) {
        console.error('Save Revenue Estimate Error:', error.message);
        return res.status(500).json({ message: 'Error saving revenue estimate', error: error.message });
    }
};

const estimateCultivationCost = async (req, res) => {
    try {
        const payload = normalizeBody(req.body);

        if (!payload) {
            return res.status(400).json({
                message: 'Request body is missing. Send landArea, landAreaUnit, and all cost fields.'
            });
        }

        const costDetails = buildCultivationCostDetails(payload, { requireBreakdown: true });
        if (costDetails.error) {
            return res.status(400).json({ message: costDetails.error });
        }

        return res.status(200).json({
            cultivationCost: {
                landArea: costDetails.landArea,
                landAreaUnit: costDetails.landAreaUnit,
                ...costDetails.cultivationCostBreakdown,
            }
        });
    } catch (error) {
        console.error('Estimate Cultivation Cost Error:', error.message);
        return res.status(500).json({ message: 'Error estimating cultivation cost', error: error.message });
    }
};

const getRevenueEstimateHistory = async (req, res) => {
    try {
        const estimates = await RevenueEstimateModel.find({ farmerId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50);

        return res.status(200).json({ estimates });
    } catch (error) {
        console.error('Get Revenue Estimate History Error:', error.message);
        return res.status(500).json({ message: 'Error fetching revenue estimate history', error: error.message });
    }
};

module.exports = {
    MarketDemand,
    getMarketDemands,
    getGovernmentLiveMarketData,
    estimateCultivationCost,
    estimateRevenue,
    saveRevenueEstimate,
    getRevenueEstimateHistory,
};