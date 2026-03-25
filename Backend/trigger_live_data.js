const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { fetchMarketData } = require('./src/Services/market.service');
const WeatherService = require('./src/Services/weather.service');
const UserModel = require('./src/Models/user.model');

dotenv.config();

const triggerLiveFetch = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        console.log('Step 1: Fetching Live Government Market Data (Agmarknet)...');
        await fetchMarketData();
        console.log('✅ Market data fetch initiated.');

        // Fetch weather for at least one known location to have data in DB
        const farmers = await UserModel.find({ role: 'farmer' }).limit(5);
        if (farmers.length > 0) {
            console.log(`Step 2: Fetching Weather for ${farmers.length} farmers...`);
            for (const farmer of farmers) {
                if (farmer.latitude && farmer.longitude) {
                    await WeatherService.getWeatherData(farmer.latitude, farmer.longitude, farmer.district);
                    console.log(`✅ Weather updated for ${farmer.district}`);
                }
            }
        } else {
            console.log('Skipping step 2: No farmers found to fetch weather for.');
        }

        console.log('\nSUCCESS: Real data has been ingested into MongoDB.');
        console.log('Next Actions:');
        console.log('1. Run: node export_datasets.js');
        console.log('2. Run: cd ../ai-service && python train_model.py');
        
        process.exit(0);
    } catch (error) {
        console.error('Fetch error:', error);
        process.exit(1);
    }
};

triggerLiveFetch();
