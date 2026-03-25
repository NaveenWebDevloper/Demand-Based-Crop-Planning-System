const axios = require("axios");

exports.getAIResponse = async (req, res) => {
  try {
    const { query } = req.body;
    console.log(`📡 AI Request Received (OpenRouter): ${query ? query.substring(0, 50) + "..." : "EMPTY"}`);

    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }

    const apiKey = (process.env.OPENROUTER_API_KEY || "").trim();
    if (!apiKey) {
      return res.status(511).json({ 
        message: "Network Authentication Required: Missing OpenRouter API Key." 
      });
    }

    const systemPrompt = "You are an expert Agricultural Assistant for the 'Demand-Based Crop Planning System'. Help Indian farmers with crop planning, market trends, and sustainable practices. Provide practical, concise advice. For real-time local rates, refer them to the 'Market Demand' section of their dashboard.";

    // Ordered list of fallback models — if one is offline, next one is tried automatically
    const MODELS = [
      "openchat/openchat-7b",
      "meta-llama/llama-3-8b-instruct",
      "gryphe/mythomist-7b"
    ];

    let response = null;
    let lastError = null;

    for (const model of MODELS) {
      try {
        console.log(`🤖 Trying model: ${model}`);
        response = await axios.post(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: query }
            ],
            temperature: 0.7
          },
          {
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "http://localhost:5173",
              "X-Title": "Demand-Based Crop Planning System",
            },
          }
        );
        console.log(`✅ Success with model: ${model}`);
        break; // Stop trying once one succeeds
      } catch (err) {
        lastError = err;
        console.warn(`❌ Model ${model} failed: ${err.response?.data?.error?.message || err.message}`);
      }
    }

    if (!response) {
      throw lastError; // All models failed — propagate last error
    }

    const responseText = response.data.choices[0].message.content;

    res.status(200).json({ response: responseText });

  } catch (error) {
    console.error("OpenRouter AI Service Error:", error.response?.data || error.message);
    
    const aiError = error.response?.data?.error?.message || 
                   error.response?.data?.message || 
                   "Internal AI Processing Error";
                         
    res.status(error.response?.status || 500).json({ 
      message: `OpenRouter Error: ${aiError}`,
      details: error.response?.data || error.toString()
    });
  }
};




