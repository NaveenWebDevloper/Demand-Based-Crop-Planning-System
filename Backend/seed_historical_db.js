const mongoose = require('mongoose');
const dotenv = require('dotenv');
const MarketPriceModel = require('./src/Models/MarketPrice.model');
const WeatherDataModel = require('./src/Models/WeatherData.model');

dotenv.config();

const generateSyntheticDBData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        console.log('Clearing old mocked data...');
        await MarketPriceModel.deleteMany({});
        await WeatherDataModel.deleteMany({});

        console.log('Generating realistic historical database records...');
        const crops = ['Groundnut', 'Cotton', 'Rice (Paddy)', 'Maize', 'Millet'];
        const regions = ['Medchal', 'Hyderabad', 'Rangareddy', 'Sangareddy', 'Nizamabad'];
        const states = ['Telangana'];

        const marketPrices = [];
        const weatherData = [];

        // Generate 300 days of historical data
        for (let i = 0; i < 300; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);

            for (const region of regions) {
                // Weather data for region
                const temp = 20 + Math.random() * 20;
                const rain = Math.random() > 0.7 ? Math.random() * 50 : 0; // occasional rain
                weatherData.push({
                    region,
                    date,
                    temperature: temp,
                    rainfall: rain,
                    humidity: 50 + Math.random() * 30,
                    condition: rain > 0 ? 'Rainy' : 'Clear'
                });

                // Market prices
                for (const crop of crops) {
                    if (Math.random() > 0.5) continue; // Not every crop every day
                    
                    marketPrices.push({
                        crop_name: crop,
                        market_name: region + ' Market',
                        region: region,
                        state: states[0],
                        date: date,
                        arrival_quantity: Math.floor(100 + Math.random() * 1000),
                        price_min: 1500 + Math.random() * 1000,
                        price_max: 3000 + Math.random() * 1000,
                        price_modal: 2000 + Math.random() * 1500
                    });
                }
            }
        }

        await WeatherDataModel.insertMany(weatherData);
        await MarketPriceModel.insertMany(marketPrices);

        console.log(`Successfully injected ${marketPrices.length} market records and ${weatherData.length} weather records into MongoDB.`);
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

generateSyntheticDBData();
