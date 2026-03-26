# 🌾 Demand-Based Crop Planning System

A state-of-the-art agricultural ecosystem designed to bridge the gap between farmers and market demand. By leveraging machine learning, real-time government data, and interactive AI, this system empowers farmers to make data-driven decisions, maximize profitability, and ensure sustainable farming practices.

---

## 🌟 Key Features

### 🤖 AI-Powered Crop Recommendation
Our recommendation engine uses a **Random Forest Classifier** trained on high-dimensional agricultural datasets.
- **Physical Suitability:** Analyzes soil type, average rainfall, temperature, and water availability.
- **Sustainability Logic:** Implements crop rotation heuristics to penalize consecutive planting of the same crop, preserving soil health.
- **Smart Scoring:** Provides the top 8 compatible crops with suitability scores, expected profit, and risk levels (Low/Medium/High).

### 📈 Real-Time Market Intelligence
Stay ahead of the curve with live data synchronized with **official Government of India (data.gov.in)** APIs.
- **Live Ticker:** Real-time price updates for commodities like Wheat, Paddy, Cotton, and more.
- **Dynamic Heatmap:** Visualizes demand levels across different regions, helping farmers identify under-served markets.

### 💬 AI Help Desk (Agri-Chatbot)
An intelligent assistant powered by **OpenRouter**, integrating multiple Large Language Models (LLMs) with automated fallbacks:
- **Primary:** `openchat/openchat-7b`
- **Fallbacks:** `meta-llama/llama-3-8b-instruct`, `gryphe/mythomist-7b`
- **Capabilities:** Expert advice on pest control, sustainable practices, and market trend analysis.

### 💰 Revenue & Cost Estimator
A comprehensive financial tool that allows farmers to project their ROI.
- **Cost Breakdown:** Detailed input for seeds, fertilizers, pesticides, labor, irrigation, machinery, and transportation.
- **Profit Projection:** Calculates expected revenue based on planned quantity and current admin-set market prices.

### 🔮 Price Forecasting
Uses **Facebook Prophet** to analyze historical price trends and forecast future market behavior, allowing farmers to time their harvests for maximum profit.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite, TailwindCSS v4, Framer Motion |
| **Mobile** | Expo, React Native (Android/iOS) |
| **Backend** | Node.js (Express 5), MongoDB Atlas (Mongoose) |
| **AI Service** | Python, FastAPI, Scikit-learn, Facebook Prophet, Joblib |
| **Authentication** | JWT (HTTP-only Cookies), Role-Based Access Control (RBAC) |
| **Cloud Storage** | ImageKit.io (for profile and crop images) |

---

## 📂 Project Structure

```text
Demand-Based-Crop-Planning-System/
├── Backend/           # Express.js REST API
├── Frontend/          # React + Vite Web Application
├── MobileApp/         # Expo React Native App
├── ai-service/        # FastAPI ML Service (Python)
└── README.md          # Project Documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- Python (3.10+)
- MongoDB Atlas Account
- OpenRouter API Key

### 2. AI Service Setup
```bash
cd ai-service
pip install -r requirements.txt
python train_model.py  # Train the initial crop model
python main.py         # Runs on http://localhost:8000
```

### 3. Backend Setup
```bash
cd Backend
npm install
npm run dev            # Runs on http://localhost:5000
```

### 4. Frontend Setup
```bash
cd Frontend/vite-project
npm install
npm run dev            # Runs on http://localhost:5173
```

---

## 🔑 Environment Variables

### Backend (`/Backend/.env`)
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for token signing
- `OPENROUTER_API_KEY`: Key for AI Chatbot
- `GOVT_MARKET_API_KEY`: API key from data.gov.in
- `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT`: ImageKit credentials

### Frontend (`/Frontend/vite-project/.env`)
- `VITE_API_BASE_URL`: URL of the deployed backend

---

## 🧑‍💻 Default Admin Credentials
- **Email:** `admin@cropplan.com`
- **Password:** `admin123`

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
