# 💻 CarbonPulse AI+ Frontend (Next.js PWA)

> **The production-grade client-side application for the CarbonPulse AI+ carbon tracking platform, built with Next.js 16 and Tailwind CSS.**

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js&style=flat-square)](https://nextjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind--CSS-v4-06B6D4?logo=tailwindcss&style=flat-square)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5-3178C6?logo=typescript&style=flat-square)](https://typescriptlang.org)
[![Zustand](https://img.shields.io/badge/State--Management-Zustand-orange?style=flat-square)](https://github.com/pmndrs/zustand)
[![PWA](https://img.shields.io/badge/PWA-Progressive%20Web%20App-purple?style=flat-square)](https://web.dev/explore/progressive-web-apps)

The CarbonPulse AI+ frontend provides a responsive, accessible, and high-performance Progressive Web Application dashboard, visual charts, and simulators designed to guide users from climate awareness to concrete action.

---

## 📱 Running Prototype Screens

| 🌐 High-Impact Landing Page | 📊 SHAP Explainable AI Insights |
| :---: | :---: |
| ![Landing Page](public/landing-screenshot.png) | ![Dashboard Overview](public/dashboard-overview.png) |
| **💡 Carbon Twin Scenario Simulator** | **🏆 Global Community Impact** |
| ![Carbon Twin](public/carbon-twin.png) | ![Community Impact](public/community-impact.png) |

---

## ✨ Design Philosophy & UI/UX Features

- **Modern Glassmorphism Design**: Incorporates dark-mode compatible translucent card interfaces, smooth micro-animations, and custom gradient accents using the Tailwind CSS engine.
- **Explainable AI Insights**: Uses progress bars and interactive widgets to break down the exact impact contribution of user consumption habits.
- **Responsive PWA Layout**: Optimised for installation on both desktop and mobile devices. Supports responsive grid modules that adjust elegantly across all device screen aspect ratios.
- **Accessibility & Compliance**: Focuses on WCAG guidelines, utilizing proper HTML5 semantic markup, keyboard focus states, navigation skip-links, and descriptive ARIA roles.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router)
- **State Store**: Zustand (caches local carbon logs, user configuration, and tokens)
- **Data Visualizations**: Recharts
- **Icons**: Lucide React
- **Styling**: Tailwind CSS + custom glassmorphic overrides
- **Primitives**: `@base-ui/react` and `class-variance-authority`

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- A running instance of the CarbonPulse FastAPI backend (details in the root [README](../README.md))

### 1. Install Dependencies
```bash
npm install
```

### 2. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the client dashboard.

---

## 📁 Key File Structure

```
frontend/
├── public/                 # Icons, screenshots, manifest assets
└── src/
    ├── app/
    │   ├── dashboard/      # Layout and main dashboard pages
    │   │   ├── community/  # Community challenges and global leaderboards
    │   │   ├── twin/       # Scenario-based Digital Carbon Twin simulator
    │   │   └── page.tsx    # SHAP explanations and current level logs
    │   ├── globals.css     # CSS root setup and Tailwind imports
    │   ├── layout.tsx      # Application shell configuration
    │   └── page.tsx        # Responsive landing page
    ├── components/
    │   └── ui/             # Reusable core visual primitives (cards, buttons, progress bar)
    └── lib/
        └── api.ts          # Asynchronous backend fetch wrapper
```

---

## ☁️ Deployment

### Railway
Deploying the client-side Next.js PWA to Railway requires simple configurations:
1. Create a service in Railway linked to this GitHub repository.
2. Configure **Root Directory** to `frontend`.
3. In the **Variables** tab, add:
   - `NEXT_PUBLIC_API_URL`: Set this to your deployed FastAPI backend URL (e.g., `https://your-backend-service.up.railway.app/api/v1`).
4. Railway will automatically build and serve the production-ready Next.js client using Nixpacks.

### Render
Deploying the client-side Next.js PWA to Render requires simple configurations:
1. Create a service in Render linked to this GitHub repository (or use the repository's `render.yaml` Blueprint).
2. Configure **Root Directory** to `frontend`.
3. Set the runtime to **Node**.
4. Set the build command to `npm install && npm run build` and the start command to `npm run start`.
5. In the environment variables, add:
   - `NEXT_PUBLIC_API_URL`: The URL of your deployed backend service (e.g., `https://carbonpulse-backend.onrender.com/api/v1`).

---

## 🔗 Backend Ingestion & Routes
The client interfaces with the FastAPI backend endpoints via `src/lib/api.ts`:
- `GET /carbon/insights` → Populates category contribution progress bars using actual SHAP values.
- `POST /carbon/twin/simulate` → Feeds input parameters to the time-series forecasting model and updates the projections card.
- `POST /carbon/receipt` → Dispatches image files for OCR processing and classifications.

---

*Developed with 💚 by the CarbonPulse AI+*
