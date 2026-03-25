import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib
import os

# Create datasets directory if not exists
os.makedirs('datasets', exist_ok=True)

def train_crop_model():
    print("Training Crop Recommendation Model...")
    
    market_path = 'datasets/market_historical.csv'
    weather_path = 'datasets/weather_historical.csv'
    crop_path = 'datasets/crop_agronomy.csv'
    
    if os.path.exists(market_path) and os.path.exists(weather_path):
        print("Using real historical data for training...")
        market_df = pd.read_csv(market_path)
        weather_df = pd.read_csv(weather_path)
        
        # Merge datasets (logic to create training samples)
        # Here we map weather conditions to specific market arrivals
        # and assume those crops were the 'correct' choice for those conditions
        df = pd.merge(market_df, weather_df, on='region', suffixes=('_m', '_w'))
        df = df.rename(columns={'crop_name': 'crop', 'soil_type': 'soil_type'})
        
        # Select relevant columns for training
        # If real data is missing some columns, we might need to synthetically fill them or use defaults
        required_cols = ['soil_type', 'rainfall', 'temperature', 'water_availability', 'season', 'crop']
        for col in required_cols:
            if col not in df.columns:
                if col == 'water_availability': df[col] = 'medium'
                if col == 'season': df[col] = 'kharif'
                if col == 'soil_type': df[col] = 'alluvial'
        
        df = df[required_cols]
    else:
        print("Datasets not found. Using synthetic data for demonstration...")
        data = {
            'soil_type': ['red', 'black', 'alluvial', 'sandy', 'clay', 'laterite'] * 50,
            'rainfall': np.random.randint(400, 2500, 300),
            'temperature': np.random.randint(15, 40, 300),
            'water_availability': ['low', 'medium', 'high'] * 100,
            'season': ['kharif', 'rabi', 'summer'] * 100,
            'crop': ['groundnut', 'cotton', 'rice', 'millet', 'maize', 'wheat'] * 50
        }
        df = pd.DataFrame(data)
    
    # Encoding Categorical Data
    le_soil = LabelEncoder()
    le_water = LabelEncoder()
    le_season = LabelEncoder()
    le_crop = LabelEncoder()
    
    df['soil_type'] = le_soil.fit_transform(df['soil_type'])
    df['water_availability'] = le_water.fit_transform(df['water_availability'])
    df['season'] = le_season.fit_transform(df['season'])
    
    X = df.drop('crop', axis=1)
    y = le_crop.fit_transform(df['crop'])
    
    model = RandomForestClassifier(n_estimators=100)
    model.fit(X, y)
    
    # Save Model and Encoders
    joblib.dump(model, 'crop_model.pkl')
    joblib.dump(le_soil, 'le_soil.pkl')
    joblib.dump(le_water, 'le_water.pkl')
    joblib.dump(le_season, 'le_season.pkl')
    joblib.dump(le_crop, 'le_crop.pkl')
    
    print("Model saved to crop_model.pkl")

if __name__ == "__main__":
    train_crop_model()
