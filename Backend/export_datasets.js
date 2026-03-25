const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { Parser } = require('json2csv');
const MarketPriceModel = require('./src/Models/MarketPrice.model');
const WeatherDataModel = require('./src/Models/WeatherData.model');
const CropModel = require('./src/Models/Crop.model');
const dotenv = require('dotenv');

dotenv.config();

const exportData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const datasetsDir = path.join(__dirname, '..', 'ai-service', 'datasets');
        if (!fs.existsSync(datasetsDir)) {
            fs.mkdirSync(datasetsDir, { recursive: true });
        }

        // 1. Export Market Price Data
        const marketData = await MarketPriceModel.find().lean();
        if (marketData.length > 0) {
            const marketParser = new Parser();
            const marketCsv = marketParser.parse(marketData);
            fs.writeFileSync(path.join(datasetsDir, 'market_historical.csv'), marketCsv);
            console.log(`Exported ${marketData.length} market records`);
        } else {
            console.log('No market data to export');
        }

        // 2. Export Weather Data
        const weatherData = await WeatherDataModel.find().lean();
        if (weatherData.length > 0) {
            const weatherParser = new Parser();
            const weatherCsv = weatherParser.parse(weatherData);
            fs.writeFileSync(path.join(datasetsDir, 'weather_historical.csv'), weatherCsv);
            console.log(`Exported ${weatherData.length} weather records`);
        } else {
            console.log('No weather data to export');
        }

        // 3. Export Crop Agronomy Data
        const cropData = await CropModel.find().lean();
        if (cropData.length > 0) {
            const cropParser = new Parser();
            const cropCsv = cropParser.parse(cropData);
            fs.writeFileSync(path.join(datasetsDir, 'crop_agronomy.csv'), cropCsv);
            console.log(`Exported ${cropData.length} crop records`);
        }

        console.log('Data export complete. Files saved in ai-service/datasets/');
        process.exit(0);
    } catch (error) {
        console.error('Export error:', error);
        process.exit(1);
    }
};

exportData();
