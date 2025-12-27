# SolarSavers Backend API

FastAPI backend for the SolarSavers multi-vendor solar marketplace.

## Environment Variables Required

Set these in Render Dashboard:

- `MONGO_URL` - MongoDB connection string (use MongoDB Atlas free tier)
- `DB_NAME` - Database name (e.g., `solarsavers`)
- `JWT_SECRET` - Secret key for JWT tokens
- `CORS_ORIGINS` - Comma-separated allowed origins (e.g., `https://rohansinghtakhi.github.io`)
- `EMERGENT_LLM_KEY` - (Optional) API key for AI chat

## Deploy to Render

1. Go to https://render.com
2. Connect your GitHub repository
3. Create a new "Web Service"
4. Select the `backend` directory as root
5. Set Build Command: `pip install -r requirements.txt`
6. Set Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
7. Add environment variables in the dashboard
