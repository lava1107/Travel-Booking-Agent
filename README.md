# Travel Agent Management System (Python NLP Core + React 18)

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.14-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![JWT](https://img.shields.io/badge/JWT-RFC_7519_HS256-black?style=flat&logo=jsonwebtokens)](https://jwt.io)
[![SpaCy](https://img.shields.io/badge/SpaCy-NER_Core-09A3D5?style=flat&logo=spacy&logoColor=white)](https://spacy.io/)

A modern, full-featured Travel Agent Management System powered by **Python (FastAPI + Machine Learning + SpaCy)** and **React 18 (Vite)** with OAuth 2.0, JWT authentication, 700+ verified travel packages, multi-lingual support, Developer REST API, and AI Concierge dialogue tracking.

---

## 🌟 Key Features & Architecture

### 1. 📦 700+ Verified Travel Packages (30+ Packages per Source & Destination)
- Over **748 authentic, production-grade holiday packages**.
- **Every Tamil Nadu origin** (Chennai, Coimbatore, Madurai, Tiruchirappalli, Salem, Tirunelveli, Erode, Vellore, Hosur, Puducherry) has **66–88 verified departures**.
- **Every major destination** (Goa, Munnar, Ooty, Kodaikanal, Andaman, Kashmir, Manali, Rajasthan, Varanasi, Rishikesh, Singapore, Maldives, Dubai, Sri Lanka, Thailand, Bali, etc.) has **at least 34 distinct packages**.
- Real hotel categories, meal plans, genuine transport modes (Flight, AC Volvo, Vande Bharat Express, Speed Catamaran), seat inventories, and high-definition photography.
- Zero placeholder or dummy data.

### 2. 🔐 OAuth 2.0 & RFC 7519 HS256 JWT Authentication
- **OAuth Single Sign-On**: One-click Google and GitHub OAuth authentication dialogs.
- **Backend OAuth Endpoint**: `POST /api/auth/oauth` automatically links accounts and issues encrypted Bearer JWT tokens.
- **PBKDF2 Password Hashing**: 100,000 rounds of PBKDF2 with unique cryptographic salt.
- **JWT Authorization**: Interceptor injecting `Authorization: Bearer <TOKEN>` on all requests with refresh token rotation.

### 3. 👥 Verified User Profiles (6 Verified Demo Accounts)
- 1-click Quick Login chips directly on the Login page for 6 distinct roles:
  | Role | Name | Email | Password |
  |---|---|---|---|
  | **🛡️ System Administrator** | System Admin | `admin@lyantravel.com` | `123` |
  | **💼 Certified Senior Agent** | Sarah Connor | `agent@lyantravel.com` | `123` |
  | **💼 Certified Travel Agent** | Rajesh Kannan | `agent.rajesh@lyantravel.com` | `123` |
  | **👤 Verified Customer** | Lavanya | `lavanya@lyantravel.com` | `123` |
  | **👤 Verified Customer** | Divya | `divya.chennai@gmail.com` | `123` |
  | **👤 Verified Customer** | Raja | `raja.coimbatore@gmail.com` | `123` |

### 4. 🛡️ Admin Command Dashboard (`/admin`)
- Real-time KPI summaries: Total Bookings, Gross Revenue, Active Catalog, Active Users, System Health.
- Booking lifecycle management: Confirm, Reschedule, or Cancel bookings with instant updates.
- Package operations: Create new packages, toggle featured status, update prices and available seats.
- User management: Filter users by role, activate/suspend user access.
- Live NLP Query Logs: Real-time telemetry monitoring customer queries, classified intent, and model confidence scores.
- Revenue by destination analytics and monthly booking trend charts.

### 5. ⚡ Developer REST API & Semantic Query Portal (`/api-access`)
- Live API Key generator with copy and roll functionality (`lyan_live_8f3a2c7e4b9d0a12_2026`).
- Interactive API Explorer testing endpoints:
  - `GET /api/trips`: Query packages with origin, destination, maxPrice, and category filters.
  - `POST /api/nlp/search`: Natural language query parsing with SpaCy slot extraction.
  - `GET /api/destinations`: Curated destinations catalog with route pricing.
  - `GET /api/health`: Backend diagnostics and intent classifier status.
- Ready-to-copy code snippets in **cURL**, **JavaScript (Fetch / Axios)**, and **Python (requests)**.

### 6. 🤖 24/7 AI Travel Concierge Chatbot
- Multi-turn conversational assistant with dialog state tracking.
- Recognizes user intent, extracts budget, dates, and destinations, suggests packages, and assists with booking checkout.
- Hybrid execution: connects to live FastAPI backend (`POST /api/chat/message`) with built-in frontend intelligence fallback.

### 7. 🕒 Recently Accessed Records
- Global `RecentContext` with local storage persistence.
- Top Navbar dropdown flyout showing recently viewed travel packages with instant resumption.
- Dedicated "Recently Viewed Packages" carousel on Customer Dashboard.

### 8. 🌐 Multi-Lingual Support (i18n)
- Reactive language switcher in the Navbar supporting:
  - 🌐 **English (EN)**
  - 🇮🇳 **தமிழ் (Tamil - TA)**
  - 🇮🇳 **हिन्दी (Hindi - HI)**
  - 🇪🇸 **Español (Spanish - ES)**
- Translates navigation menus, search action buttons, filter labels, and status badges in real time.

### 9. 🚀 Unique Resume-Defending Non-CRUD Features
1. **Machine Learning NLP Semantic Search Engine**: Calibrated TF-IDF Classifier + SpaCy Named Entity Recognition extracting travel slots (`origin`, `destination`, `budget`, `passengers`, `transport`) with multi-turn context tracking.
2. **AI Dynamic Travel Itinerary & Budget Optimizer (`/planner`)**: Algorithmic day-by-day itinerary generator computing activity schedules, cost breakdown (stays, transport, sightseeing, dining), and custom packing checklists.
3. **Multi-Package Side-by-Side Comparison Matrix (`/compare`)**: Compare up to 3 packages with attribute-by-attribute evaluation (cost per day, inclusions, meal plans, accommodation tier, transport efficiency).
4. **Developer REST API Platform (`/api-access`)**: Enterprise API key authorization and live query explorer.

---

## 🛠️ Quick Start Guide

### 1. Start Python NLP Core & Unified Backend
In terminal:
```bash
cd nlp-service
py -m uvicorn app.main:app --reload --port 8000
```
- API runs at `http://127.0.0.1:8000`
- Swagger Interactive Docs: `http://127.0.0.1:8000/docs`

### 2. Start Frontend Dev Server
In another terminal:
```bash
cd frontend
npm run dev
```
- App runs at `http://localhost:5173`
- Proxies all `/api/*` requests directly to Python FastAPI on port `8000`.

---

## 🧪 Running Automated Test Suites

### 1. Test 6 Distinct User Logins & JWT Generation
```bash
cd nlp-service
py tests/test_mandatory_logins.py
```
*Validates Admin, Agent Sarah, Agent Rajesh, Lavanya, Divya, and Raja logins.*

### 2. Test Core NLP Model & Multi-Turn Context Tracking
```bash
cd nlp-service
py tests/test_nlp.py
```
*Validates TF-IDF intent prediction, SpaCy entity recognition, and dialogue context memory.*

### 3. Test Full Backend REST API Pipeline
```bash
cd nlp-service
py tests/test_api_endpoints.py
```
*Validates Health, NLP search, Chatbot, 748-package catalog, user registration, login, bookings, and cancellations.*
