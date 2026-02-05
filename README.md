# Deriv Sentinel 🛡️

A self-healing LLM security platform for regulated fintech. Built for the Deriv AI Hackathon.

## 🚀 Quick Start

### 1. Start the Backend API

```bash
cd Backend
chmod +x start_server.sh
./start_server.sh
```

Or manually:
```bash
cd Backend
pip install -r requirements.txt
python api_server.py
```

The API will be available at:
- **REST API**: http://localhost:8000/api
- **WebSocket**: ws://localhost:8000/ws/attacks
- **API Docs**: http://localhost:8000/docs

### 2. Start the Frontend

```bash
cd Frontend
npm install
npm run dev
```

The dashboard will be available at http://localhost:5173

**Demo Credentials:**
- Email: `analyst@deriv.com`
- Password: `12345678`

### 3. Run Ollama (Required for attacks)

```bash
ollama run deepseek-r1:8b
ollama run shieldgemma:2b
```

## 🎯 Features

### Dashboard
- **Real-time attack monitoring** via WebSocket
- **Run Red Team Campaign** button - triggers all 16 attacks
- **System health indicators** for Bastion, ShieldGemma, PyRIT

### Attack Monitor
- **Custom attack input** - test any prompt against Bastion
- **ShieldGemma audit results** with risk scores
- **Filter & export** attacks to CSV

### Guardrails
- **Vaccine file viewer** - see raw injected rules
- **Base vs injected** guardrails separation
- **Toggle & reset** functionality

### Audit Results
- **Campaign summaries** with pass/fail rates
- **Vulnerability tracking** with recommendations
- **PDF export** for reports

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend                            │
│  Dashboard │ Attacks │ Audits │ Guardrails │ Settings       │
└─────────────────────────────────────────────────────────────┘
                              │
                    REST API + WebSocket
                              │
┌─────────────────────────────────────────────────────────────┐
│                    API Server (FastAPI)                      │
│  /api/stats │ /api/attacks │ /api/run-campaign │ /ws/attacks │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
    ┌─────▼─────┐      ┌──────▼──────┐     ┌──────▼──────┐
    │  Bastion  │      │ ShieldGemma │     │ Heal Engine │
    │ (LLM API) │      │  (Auditor)  │     │ (Vaccines)  │
    └───────────┘      └─────────────┘     └─────────────┘
```

## 📁 File Structure

```
Backend/
├── api_server.py          # Unified API server (main entry)
├── bastion.py             # Original Bastion LLM proxy
├── Scan_sentinel.py       # Giskard + ShieldGemma scanner
├── pyrit_attacker.py      # PyRIT red team orchestrator
├── shadow_RAG.py          # Synthetic "leaked" documents
├── heal_engine.py         # Vaccine injection system
├── orchestrator_graph.py  # LangGraph state machine
├── deriv_attacks.json     # 16 Deriv-specific attacks
└── requirements.txt

Frontend/
├── src/
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── AttackMonitor.tsx
│   │   ├── AuditResults.tsx
│   │   ├── Guardrails.tsx
│   │   └── Settings.tsx
│   ├── services/
│   │   └── api.ts         # API client
│   ├── hooks/
│   │   └── useWebSocket.ts
│   └── components/
│       └── Navbar.tsx
└── package.json
```

## 🎬 Demo Flow

1. **Open Dashboard** - Show "API Online" indicator
2. **Click "Run Red Team"** - Watch attacks stream in real-time
3. **Show Attack Monitor** - Explain ShieldGemma audit
4. **Show Guardrails** - Highlight injected vaccines
5. **Show Audit Results** - Summarize defense rate

## 🔑 Key Innovations

1. **Self-Healing Without Retraining** - Vaccines are injected into prompts, not model weights
2. **Shadow RAG** - Realistic attacker knowledge base with "leaked" documents
3. **Multi-Model Pipeline** - Bastion (defended) + ShieldGemma (auditor) + Foundation-Sec (attacker)
4. **LangGraph Governance** - Auditable state machine for attack → heal → retest loop

## 📄 License

MIT - Built for Deriv AI Hackathon 2026
