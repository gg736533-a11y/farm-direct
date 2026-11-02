# FarmDirect — Added Features

This package retains the existing FarmDirect project and adds a **Farm Tools** page at `/farm-tools`.

## Added features

1. **Voice search:** use the browser microphone to recognize a spoken product query, then open the marketplace with that query.
2. **Product voice assistant:** choose a sample product and hear basic product-selection guidance using browser speech synthesis.
3. **Three languages:** English, Tamil, and Hindi labels are available on the Farm Tools page.
4. **Soil-to-seed suggestions:** choose from six soil types to see general crop examples. Suggestions are educational and should be checked against local agricultural advice.
5. **Data collection and architecture:** the Farm Tools page summarizes data collection, architecture, and privacy. A fuller explanation is available in `docs/data-collection-and-architecture.md`.

## Run the project

### Frontend

```powershell
cd farm-direct
npm install
npm run dev
```

### Backend

Open a second terminal:

```powershell
cd farm-direct\server
npm install
```

Ensure `server/.env` exists and has a `DATABASE_URL` that matches the MySQL credentials configured in `server/.env`. Then run the project's database migration and seed scripts as described in `server/README.md`, and start the backend with:

```powershell
npm run dev
```

The frontend uses Vite's default address, `http://localhost:5173`. The backend port is configured in `server/.env`.

## Browser support

Voice search requires a browser that supports the Web Speech API and microphone permission. Spoken output uses browser speech synthesis. If voice recognition is unavailable, use the text input.
