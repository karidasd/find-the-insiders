# 🔍 Solana Insider Detector — On-Chain Intelligence

![Solana](https://img.shields.io/badge/Solana-Blockchain-black?style=for-the-badge&logo=solana)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Vis.js](https://img.shields.io/badge/Visualization-Vis.js-blueviolet?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Complete-success?style=for-the-badge)

A premium, interactive web dashboard to map early buyer transactions, identify wallet clusters, trace system program funding flows, and compute insider threat levels on the Solana blockchain.

---

## 🎯 Features

- **Algorithmic Risk Meter:** Automatically evaluates risk scores (0-100) based on block timing, funding overlaps, and holdings concentration.
- **Interactive vis.js Network Graph:** Physics-based mapping connects early wallets to their funding hubs (e.g. parent wallets, CEX hot wallets).
- **Free DexScreener Integration:** Fetches real token symbol, price, volume, and pair URLs dynamically without any API keys.
- **Robust Simulated Fallback:** Runs instantly in hybrid mock mode if Helius API keys are missing — loading real market statistics combined with simulated insider transaction paths.

---

## 📂 Structure

```
solana-insider-detector/
├── backend/
│   ├── main.py          # FastAPI server & RPC logic
│   ├── requirements.txt # Server dependencies
│   └── .env.example     # API credentials template
├── frontend/
│   ├── index.html       # Glassmorphism UI
│   ├── style.css        # Premium styling & neon accents
│   └── app.js           # Network graph initialization & API calls
└── run.py               # Double server launcher script
```

---

## 🚀 Quick Start

1. **Clone & Navigate:**
   ```bash
   cd solana-insider-detector
   ```

2. **Install Dependencies:**
   ```bash
   pip install -r backend/requirements.txt
   ```

3. **Start the Engines:**
   ```bash
   python run.py
   ```

*The launcher script will automatically:*
- Run the FastAPI backend on port `8000`.
- Run the static frontend server on port `3000`.
- Open your browser to `http://localhost:3000`.

---

## 🔑 Production Setup

To enable real on-chain scanning:
1. Rename `backend/.env.example` -> `backend/.env`.
2. Add your **Helius API Key** (and optionally Birdeye Key):
   ```env
   HELIUS_API_KEY=your_access_key
   ```
3. Restart the server. The backend will switch to **Live Mode**, query the Solana RPC node, trace history signatures, and verify real transactions.

---

## 🛡️ License

MIT License. Designed & Built by **DARKAIS Data Science** · 2026.
