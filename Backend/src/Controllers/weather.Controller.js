// Native fetch is used (Node 18+)

const getWeather = async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ 
        success: false, 
        message: 'Latitude and Longitude are required' 
      });
    }

    const apiKey = process.env.OPENWEATHER_API_KEY?.trim();
    
    // If no API key is provided, return mock data
    if (!apiKey || apiKey.includes('YOUR_')) {
       // Mock data for demonstration if no key is present
       return res.json({
         success: true,
         isMock: true,
         data: {
           temp: 28,
           condition: 'Sunny',
           humidity: 45,
           windSpeed: 12,
           location: 'Demo Location',
           icon: '01d'
         }
       });
    }

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch weather data');
    }

    res.json({
      success: true,
      data: {
        temp: Math.round(data.main.temp),
        condition: data.weather[0].main,
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        location: data.name,
        icon: data.weather[0].icon
      }
    });

  } catch (error) {
    console.error('Weather fetch error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error'
    });
  }
};

module.exports = {
  getWeather
};
