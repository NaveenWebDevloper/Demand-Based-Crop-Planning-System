from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np
import os

app = FastAPI(title="Agriculture AI Service")

# Load models and encoders
MODEL_PATH = "crop_model.pkl"

class PredictionInput(BaseModel):
    soil_type: str
    rainfall: float
    temperature: float
    water_availability: str
    season: str
    previous_crop: str = ""
    irrigation_type: str = "rainfed"

@app.get("/")
def read_root():
    return {"message": "AI Service is running"}

@app.post("/retrain")
def retrain_models():
    try:
        from train_model import train_crop_model
        train_crop_model()
        return {"message": "Models retrained successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict-price")
def predict_price(crop_name: str):
    try:
        from prophet import Prophet
        import datetime
        
        # In a real scenario, fetch historical prices from MongoDB for this crop
        # For now, generate synthetic historical data
        dates = pd.date_range(start='2023-01-01', periods=100, freq='W')
        prices = [2000 + (i * 5) + np.random.randint(-100, 100) for i in range(100)]
        
        df = pd.DataFrame({'ds': dates, 'y': prices})
        
        model = Prophet(yearly_seasonality=True, daily_seasonality=False)
        model.fit(df)
        
        future = model.make_future_dataframe(periods=3, freq='ME')
        forecast = model.predict(future)
        
        predictions = forecast[['ds', 'yhat']].tail(3).to_dict('records')
        
        return {
            "crop_name": crop_name,
            "forecast": [
                {"month": d['ds'].strftime('%B'), "predicted_price": round(d['yhat'], 2)} 
                for d in predictions
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict-crop")
def predict_crop(data: PredictionInput):
    if not os.path.exists(MODEL_PATH):
        raise HTTPException(status_code=503, detail="Model not trained yet")
    
    try:
        # Load model and encoders
        model = joblib.load('crop_model.pkl')
        le_soil = joblib.load('le_soil.pkl')
        le_water = joblib.load('le_water.pkl')
        le_season = joblib.load('le_season.pkl')
        le_crop = joblib.load('le_crop.pkl')

        # Transform inputs (handling unknown categories)
        def safe_transform(le, val):
            v = str(val).lower()
            if v in [x.lower() for x in le.classes_]:
                # Find exact match or case-insensitive match
                for c in le.classes_:
                    if c.lower() == v:
                        return le.transform([c])[0]
            return 0 # Fallback

        soil_enc = safe_transform(le_soil, data.soil_type)
        water_enc = safe_transform(le_water, data.water_availability)
        season_enc = safe_transform(le_season, data.season)

        # Prepare input for model
        input_data = pd.DataFrame([[
            soil_enc, 
            data.rainfall, 
            data.temperature, 
            water_enc, 
            season_enc
        ]], columns=['soil_type', 'rainfall', 'temperature', 'water_availability', 'season'])

        # Predict
        prediction = model.predict(input_data)
        probabilities = model.predict_proba(input_data)[0]
        
        # Get top 8 recommendations physically suitable for the soil/weather
        top_indices = np.argsort(probabilities)[-8:][::-1]
        results = []
        
        for idx in top_indices:
            crop_name = le_crop.inverse_transform([idx])[0]
            base_score = probabilities[idx] * 100
            
            # Simple heuristic for Crop Rotation (prevents same crop twice)
            if data.previous_crop and data.previous_crop.lower() in crop_name.lower():
                base_score *= 0.6  # Penalize 40% if same as previous crop
            
            # Simple heuristic for Irrigation support
            if data.irrigation_type == "borewell" or data.irrigation_type == "canal":
                # High-water crops like Rice/Sugar are better
                if crop_name in ["Rice", "Sugarcane", "Banana"]:
                    base_score += 10
            
            score = int(min(max(base_score, 0), 99))
            
            results.append({
                "crop_name": crop_name,
                "score": score,
                "expected_profit": np.random.randint(20000, 50000), 
                "risk": "Low" if score > 70 else ("Medium" if score > 40 else "High")
            })

        return {"recommended_crops": results}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
