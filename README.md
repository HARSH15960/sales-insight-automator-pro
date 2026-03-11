# 🚀 Sales Insight Automator Pro

> AI-powered sales intelligence platform. Upload CSV/XLSX → get executive insights via email + interactive AI chat.

[![CI](https://github.com/yourusername/sales-insight-automator-pro/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/sales-insight-automator-pro/actions)
![Node.js](https://img.shields.io/badge/Node.js-20+-green)
![React](https://img.shields.io/badge/React-18-blue)
![Groq](https://img.shields.io/badge/AI-Groq_Llama3-orange)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)

---

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                            │
│  React (Vite) + TailwindCSS + Framer Motion + Axios         │
│  ┌────────────┐  ┌───────────────┐  ┌──────────────────┐   │
│  │ Upload     │  │ Insight Panel │  │  AI Chat Panel   │   │
│  │ Dropzone   │  │ (Results UI)  │  │  (Groq-powered)  │   │
│  └─────┬──────┘  └───────────────┘  └──────────────────┘   │
└────────┼────────────────────────────────────────────────────┘
         │  HTTPS + JWT Bearer Token
         ▼
┌─────────────────────────────────────────────────────────────┐
│                   API GATEWAY LAYER                         │
│  Express.js + Helmet + CORS + Rate Limiter                  │
│  ┌──────────────┐  ┌────────────┐  ┌───────────────────┐   │
│  │ POST /upload │  │ GET /status│  │  POST /chat        │   │
│  │ POST /auth   │  │ /:jobId    │  │  (AI Q&A)          │   │
│  └──────┬───────┘  └─────┬──────┘  └─────────┬─────────┘   │
└─────────┼────────────────┼──────────────────┼──────────────┘
          │                │                  │
          ▼                ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                  PROCESSING LAYER                           │
│                                                             │
│  ┌─────────────────┐         ┌────────────────────────┐    │
│  │   BullMQ Queue  │◄───────►│      Redis              │    │
│  │   (Async Jobs)  │         │  (Job State + Context)  │    │
│  └────────┬────────┘         └────────────────────────┘    │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Worker Process                         │   │
│  │  1. Parse CSV/XLSX (csv-parse / xlsx)               │   │
│  │  2. Analyze Patterns (fileParser.js)                │   │
│  │  3. Generate AI Insights (Groq Llama3)              │   │
│  │  4. Create Charts (QuickChart API)                  │   │
│  │  5. Send Email Report (Nodemailer)                  │   │
│  │  6. Cleanup Temp Files                              │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

External Services:
  ┌─────────────┐  ┌────────────────┐  ┌─────────────────┐
  │  Groq API   │  │  QuickChart API │  │  SMTP Provider  │
  │  (Llama3)   │  │  (Charts PNG)   │  │  (Gmail/SES)    │
  └─────────────┘  └────────────────┘  └─────────────────┘

Deployment:
  Frontend ──► Vercel (CDN + Edge)
  Backend  ──► Render.com (Docker container)
  Redis    ──► Upstash / Render Redis
```

---

## 📁 Project Structure

```
sales-insight-automator-pro/
│
├── backend/
│   ├── config/
│   │   ├── redis.js            # BullMQ + Redis connection
│   │   └── swagger.js          # OpenAPI spec
│   ├── controllers/
│   │   ├── authController.js   # JWT login/refresh/me
│   │   ├── uploadController.js # File upload + queue job
│   │   ├── statusController.js # Job status polling
│   │   └── chatController.js   # AI chat endpoint
│   ├── middleware/
│   │   ├── auth.js             # JWT verification
│   │   ├── errorHandler.js     # Global error handler
│   │   ├── logger.js           # Request logging
│   │   ├── rateLimiter.js      # Express rate limits
│   │   └── upload.js           # Multer config
│   ├── queues/                 # (Reserved for future queue configs)
│   ├── routes/
│   │   ├── auth.js             # POST /api/auth/login
│   │   ├── upload.js           # POST /api/upload
│   │   ├── status.js           # GET /api/status/:id
│   │   └── chat.js             # POST /api/chat
│   ├── services/
│   │   ├── groqService.js      # Groq Llama3 AI engine
│   │   ├── chartService.js     # QuickChart graph generator
│   │   └── emailService.js     # Nodemailer HTML reports
│   ├── utils/
│   │   ├── logger.js           # Winston logger
│   │   ├── fileParser.js       # CSV/XLSX parser + analyzer
│   │   └── cleanup.js          # Temp file cleanup
│   ├── workers/
│   │   └── insightWorker.js    # BullMQ async worker
│   ├── app.js                  # Express app entry
│   ├── Dockerfile              # Multi-stage production image
│   ├── .env.example            # Environment template
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── NavBar.jsx          # Top navigation
│   │   │   ├── UploadDropzone.jsx  # Animated file dropper
│   │   │   ├── ProcessingStatus.jsx # Progress pipeline UI
│   │   │   ├── InsightPanel.jsx    # AI results display
│   │   │   └── ChatPanel.jsx       # Conversational AI panel
│   │   ├── hooks/
│   │   │   ├── useAuth.js          # Auth state + actions
│   │   │   └── useJobPoller.js     # Job status poller
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx       # Glassmorphism login
│   │   │   └── DashboardPage.jsx   # Main dashboard
│   │   ├── services/
│   │   │   └── api.js              # Axios API client
│   │   ├── App.jsx                 # Router
│   │   ├── main.jsx                # React entry
│   │   └── index.css               # TailwindCSS + custom
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── .env.example
│   └── package.json
│
├── docker-compose.yml          # Backend + Redis + Worker
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI
├── sample-data/
│   └── sample_sales.csv        # Test file
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 20+
- Docker + Docker Compose
- Redis (via Docker or local)
- Groq API key → https://console.groq.com

### 1. Clone & Configure

```bash
git clone https://github.com/yourusername/sales-insight-automator-pro.git
cd sales-insight-automator-pro

# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys

# Frontend
cp frontend/.env.example frontend/.env
```

### 2. Run with Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up --build

# Or in background
docker-compose up -d --build

# View logs
docker-compose logs -f backend worker

# Stop all
docker-compose down
```

Services:
- API: http://localhost:3001
- API Docs: http://localhost:3001/docs
- Redis: localhost:6379

### 3. Run Frontend (Development)

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### 4. Run Backend Locally (Without Docker)

```bash
# Start Redis first
docker run -d -p 6379:6379 redis:7-alpine

# Backend
cd backend
npm install
npm start

# Worker (separate terminal)
cd backend
npm run worker
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 3001) | No |
| `JWT_SECRET` | JWT signing key (min 32 chars) | **Yes** |
| `GROQ_API_KEY` | Groq API key from console.groq.com | **Yes** |
| `REDIS_URL` or `REDIS_HOST` | Redis connection | **Yes** |
| `SMTP_HOST` | Email SMTP host | **Yes** |
| `SMTP_USER` | SMTP username/email | **Yes** |
| `SMTP_PASS` | SMTP password/app password | **Yes** |
| `MAX_FILE_SIZE_MB` | Max upload size (default: 10) | No |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL (default: /api) |

---

## 🌐 API Endpoints

### Authentication
```
POST /api/auth/login     — Get JWT token
POST /api/auth/refresh   — Refresh token
GET  /api/auth/me        — Current user
```

### Core
```
POST /api/upload         — Upload CSV/XLSX files (multipart/form-data)
GET  /api/status/:jobId  — Poll job processing status
POST /api/chat           — AI conversational query
```

### Documentation
```
GET  /docs               — Swagger UI
GET  /health             — Health check
```

**Demo credentials:**
- `admin@demo.com` / `demo123`
- `analyst@demo.com` / `demo123`

---

## 🧠 AI Smart Insight Engine

The AI engine (powered by Groq Llama3) detects and generates:

| Insight | Description |
|---------|-------------|
| **Top Region** | Highest revenue region with analysis |
| **Worst Category** | Underperforming segment with recommendations |
| **Cancellation Analysis** | Rate, risk level (LOW/MEDIUM/HIGH), impact |
| **Revenue Trend** | UPWARD / DOWNWARD / STABLE / VOLATILE |
| **Business Recommendations** | 4 actionable strategic bullets |
| **Risk Alerts** | Specific alerts with figures |
| **Health Score** | 0-100 score with GOOD/FAIR/AT RISK/CRITICAL label |
| **Predicted Trend** | Forward-looking analysis |

---

## 📊 Auto Chart Generator

Charts are generated via QuickChart.io API:

1. **Revenue Bar Chart** — Regional or category revenue distribution
2. **Trend Line Chart** — Revenue over time
3. **Category Donut Chart** — Revenue share by category

Charts are embedded in HTML emails with proper `cid:` attachments.

---

## 🔐 Security Features

| Feature | Implementation |
|---------|---------------|
| JWT Authentication | `jsonwebtoken` with configurable expiry |
| Rate Limiting | Per-endpoint limits (auth: 10/15min, upload: 5/min) |
| File Type Validation | Extension + MIME type whitelist |
| File Size Limit | Configurable (default 10MB per file) |
| Input Sanitization | `express-validator` |
| Helmet.js | Security headers (CSP, HSTS, XFO) |
| Temp File Cleanup | Automatic 24-hour TTL cleanup |
| Non-root Docker | Container runs as `appuser` |
| CORS | Configurable origin whitelist |

---

## 🐳 Docker Details

The backend uses a **3-stage multi-stage build**:
1. `deps` — Production dependencies only
2. `dev-deps` — All dependencies (for build tools if needed)
3. `production` — Minimal Alpine image with non-root user

```bash
# Build image manually
docker build -t sia-backend ./backend

# Run with env file
docker run -p 3001:3001 --env-file backend/.env sia-backend

# Full stack via compose
docker-compose up --build
```

---

## 🚀 Deployment

### Backend → Render.com

1. Connect GitHub repo to Render
2. Create **Web Service** from `backend/` directory
3. Build command: `npm ci --only=production`
4. Start command: `node app.js`
5. Add env variables in Render dashboard
6. Add Redis: Create **Redis** service on Render, copy URL to `REDIS_URL`

For the worker, create a separate **Background Worker** service:
- Start command: `node workers/insightWorker.js`

### Frontend → Vercel

```bash
cd frontend
npx vercel --prod

# Or connect GitHub repo in Vercel dashboard
# Build command: npm run build
# Output directory: dist
# Add env: VITE_API_URL=https://your-backend.onrender.com/api
```

### Environment on Render

Set these in Render dashboard:
```
NODE_ENV=production
JWT_SECRET=<generate with: openssl rand -base64 32>
GROQ_API_KEY=<your key>
REDIS_URL=<from Render Redis>
SMTP_HOST=smtp.gmail.com
SMTP_USER=<your gmail>
SMTP_PASS=<app password>
FRONTEND_URL=https://your-app.vercel.app
```

---

## 🔄 Async Queue Architecture

```
Upload Request
     │
     ▼
Express API ──► BullMQ Queue ──► Worker Process
     │                               │
     │  jobId                        │
     │◄──────────────────────────────┘
     │
     ▼
Client polls GET /api/status/:jobId
     │
     ▼
     Job completed? ──► Return insights JSON
     Job failed?    ──► Return error message
     Job active?    ──► Return progress %
```

---

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# Test with sample CSV
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.com","password":"demo123"}'

# Upload file (replace TOKEN)
curl -X POST http://localhost:3001/api/upload \
  -H "Authorization: Bearer TOKEN" \
  -F "files=@sample-data/sample_sales.csv" \
  -F "email=you@example.com"
```

---

## 📧 Email Report

The HTML email includes:
- Executive summary section
- Business health score gauge
- Key metrics table
- Top performing region card
- Worst category card
- Risk alerts section
- Embedded chart images (bar + line + donut)
- Strategic recommendations table
- Predicted trend statement

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TailwindCSS, Framer Motion |
| Backend | Node.js 20, Express.js |
| AI | Groq SDK (Llama3-8b-8192) |
| Queue | BullMQ + Redis |
| File Processing | Multer, csv-parse, xlsx |
| Charts | QuickChart.io API |
| Email | Nodemailer |
| Auth | JWT (jsonwebtoken) |
| Security | Helmet, express-rate-limit |
| Logging | Winston, Morgan |
| Docs | Swagger UI (OpenAPI 3.0) |
| CI/CD | GitHub Actions |
| Containers | Docker (multi-stage), Docker Compose |
| Deploy | Vercel (frontend), Render.com (backend) |

---

## 📝 License

MIT — Built with ❤️ using Groq AI, React, and Node.js.
