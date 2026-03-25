const axios = require('axios');
const WeatherDataModel = require('../Models/WeatherData.model');

const fetchAndStoreWeather = async (lat, lon, region) => {
    try {
        const apiKey = process.env.OPENWEATHER_API_KEY;
        if (!apiKey) {
            console.error('OPENWEATHER_API_KEY is missing');
            return null;
        }

        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        const response = await axios.get(url);
        
        const { main, weather, rain } = response.data;
        
        const weatherData = {
            region,
            date: new Date(),
            temperature: main.temp,
            rainfall: rain ? rain['1h'] || rain['3h'] || 0 : 0,
            humidity: main.humidity,
            condition: weather[0].description
        };

        // Store in DB
        const savedData = await WeatherDataModel.create(weatherData);
        return savedData;
    } catch (error) {
        console.error('Error fetching weather data:', error.message);
        return null;
    }
};

module.exports = { fetchAndStoreWeather };
