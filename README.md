# 🌾 Demand-Based Crop Planning System

A full-stack web application that helps farmers plan crops based on real-time market demand data. Admins can manage farmer registrations, and farmers can view market trends and generate revenue estimates.

---

## 📁 Project Structure

```
Demand-Based-Crop-Planning-System/
├── Backend/       # Node.js + Express REST API (deployed on Vercel)
└── Frontend/
    └── vite-project/  # React + Vite + TailwindCSS (deployed on Vercel)
```

---

## 🚀 Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 19, Vite, TailwindCSS v4    |
| Backend   | Node.js, Express 5, MongoDB Atlas |
| Auth      | JWT (httpOnly cookies)            |
| Images    | ImageKit.io                       |
| Database  | MongoDB Atlas                     |
| Hosting   | Vercel (both frontend & backend)  |

---

## ⚙️ Setup & Development

### Backend

```bash
cd Backend
cp .env.example .env   # Fill in your secrets
npm install
npm run dev            # Starts on http://localhost:5000
```

### Frontend

```bash
cd Frontend/vite-project
cp .env.example .env   # Set VITE_API_BASE_URL
npm install
npm run dev            # Starts on http://localhost:5173
```

---

## 🌐 Deployment

| Service  | URL                                  |
|----------|--------------------------------------|
| Backend  | Deployed via `Backend/` on Vercel    |
| Frontend | Deployed via `Frontend/vite-project/` on Vercel |

### Required Vercel Environment Variables (Backend)

- `MONGO_URI`
- `JWT_SECRET`
- `IMAGEKIT_PUBLIC_KEY`
- `IMAGEKIT_PRIVATE_KEY`
- `IMAGEKIT_URL_ENDPOINT`
- `GOVT_MARKET_API_KEY`
- `FRONTEND_URL` ← Set to your frontend Vercel URL
- `NODE_ENV=production`

### Required Vercel Environment Variables (Frontend)

- `VITE_API_BASE_URL` ← Set to your backend Vercel URL

---

## 👤 Default Admin Credentials

- **Email:** `admin@cropplan.com`
- **Password:** `admin123`

> ⚠️ Change these credentials after first login in production.

---

## 📄 License

MIT
