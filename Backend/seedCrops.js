const mongoose = require('mongoose');
const dotenv = require('dotenv');
const CropModel = require('./src/Models/Crop.model');

dotenv.config();

const crops = [
    {
        crop_name: "Groundnut",
        season: "Kharif",
        water_requirement: "medium",
        avg_yield_per_acre: 800,
        growth_duration_days: 110,
        supported_soil_types: ["Red Soil", "Alluvial Soil"],
        temperature_range: { min: 20, max: 30 },
        rainfall_requirement: { min: 500, max: 1000 },
        market_price_base: 55
    },
    {
        crop_name: "Cotton",
        season: "Kharif",
        water_requirement: "medium",
        avg_yield_per_acre: 1000,
        growth_duration_days: 160,
        supported_soil_types: ["Black Soil", "Alluvial Soil"],
        temperature_range: { min: 21, max: 30 },
        rainfall_requirement: { min: 600, max: 1200 },
        market_price_base: 60
    },
    {
        crop_name: "Rice (Paddy)",
        season: "Kharif",
        water_requirement: "high",
        avg_yield_per_acre: 1800,
        growth_duration_days: 120,
        supported_soil_types: ["Alluvial Soil", "Clay Soil"],
        temperature_range: { min: 20, max: 35 },
        rainfall_requirement: { min: 1500, max: 2500 },
        market_price_base: 22
    },
    {
        crop_name: "Maize",
        season: "Kharif",
        water_requirement: "medium",
        avg_yield_per_acre: 2500,
        growth_duration_days: 100,
        supported_soil_types: ["Red Soil", "Black Soil", "Alluvial Soil"],
        temperature_range: { min: 18, max: 27 },
        rainfall_requirement: { min: 600, max: 1100 },
        market_price_base: 18
    },
    {
        crop_name: "Millet",
        season: "Kharif",
        water_requirement: "low",
        avg_yield_per_acre: 600,
        growth_duration_days: 90,
        supported_soil_types: ["Red Soil", "Laterite Soil"],
        temperature_range: { min: 25, max: 35 },
        rainfall_requirement: { min: 400, max: 600 },
        market_price_base: 30
    }
];

const seedCrops = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing crops
        await CropModel.deleteMany({});
        console.log('Existing crops cleared');

        // Insert new crops
        await CropModel.insertMany(crops);
        console.log('Crops seeded successfully');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding crops:', error);
        process.exit(1);
    }
};

seedCrops();
