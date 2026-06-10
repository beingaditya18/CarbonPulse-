# CarbonPulse AI+ System Architecture Specification

This document details the system design, data flows, security boundaries, and modular component relationships of the redesigned CarbonPulse AI+ PWA.

---

## 1. High-Level Architectural Diagram

CarbonPulse AI+ operates as a serverless, local-first Progressive Web Application. All heavy calculations are performed directly on the client side, while advanced ML tasks and secure storage interface with Google Cloud services via edge API routing handlers.

```mermaid
graph TD
    classDef client fill:#064e3b,stroke:#059669,stroke-width:2px,color:#fff;
    classDef edge fill:#1e1b4b,stroke:#4f46e5,stroke-width:2px,color:#fff;
    classDef gcp fill:#0f172a,stroke:#3b82f6,stroke-width:2px,color:#fff;

    subgraph ClientWorkspace ["Next.js PWA Client (Offline-First)"]
        UI[PWA Interactive Views]:::client
        Zustand[Zustand Persistent Store]:::client
        SHAP[SHAP Math Explainer]:::client
        OLS[OLS Regression Twin]:::client
    end

    subgraph EdgeRoutes ["Vercel Edge Network API Routes"]
        ChatEdge["/api/chat (Edge SDK)"]:::edge
        OcrEdge["/api/carbon/receipt (Edge Ingest)"]:::edge
        InsightsEdge["/api/carbon/insights"]:::edge
    end

    subgraph GCP ["Google Cloud Services Platform"]
        Gemini[Google Gemini 1.5 Pro]:::gcp
        Vision[Google Cloud Vision OCR]:::gcp
        GCS[Google Cloud Storage Buckets]:::gcp
        Armor[Cloud Armor WAF / Firewall]:::gcp
        IAP[Identity-Aware Proxy SSO]:::gcp
    end

    UI --> Zustand
    Zustand --> SHAP
    Zustand --> OLS

    UI --> ChatEdge
    UI --> OcrEdge
    UI --> InsightsEdge

    ChatEdge --> Gemini
    OcrEdge --> GCS
    OcrEdge --> Vision
    
    OcrEdge -. Secured by .- Armor
    ChatEdge -. Secured by .- IAP
```

---

## 2. Component Hierarchy & Clean File Layout

We segment components strictly by functional concern to satisfy line limits (files < 300 lines; functions < 50 lines) and enable efficient dynamic imports.

```
src/
├── app/                  # Next.js App Routing shells & metadata definitions
│   ├── onboarding/       # Onboarding questionnaire container
│   └── dashboard/        # Central command center shell
├── components/           # Reusable generic UI primitives (shadcn UI buttons, tabs)
├── features/             # Sub-feature domain blocks
│   ├── landing/          # Landing-specific widgets (LandingTwinPreview)
│   ├── onboarding/       # Onboarding form sliders
│   ├── dashboard/        # Gauge, OcrScanner, ChatCoach, Logs, and Shap cards
│   └── twin/             # TwinAvatar model and TwinForecastChart line graph
├── hooks/                # Reusable custom hooks (e.g. useMounted)
├── services/             # REST call instantiators for Gemini / OCR Vision APIs
├── lib/                  # Store core instantiators (useCarbonStore.ts)
├── utils/                # Pure mathematical, sanitization, and rate-limiting scripts
└── types/                # Strict TypeScript domain interfaces
```

---

## 3. Data & Core Calculation Flows

### 1. Game-Theoretic SHAP Calculations
1. The client logs are parsed and grouped by category (transit, food, etc.).
2. The custom mathematical SHAP model ([`shapEngine.ts`](frontend/src/lib/shapEngine.ts)) computes relative marginal contributions:
$$\phi_i(v) = \sum_{S \subseteq N \setminus \{i\}} \frac{|S|!(|N| - |S| - 1)!}{|N|!} (v(S \cup \{i\}) - v(S))$$
3. Contributions are normalized against baseline targets and visually output on the dashboard as percentage weights.

### 2. Digital Twin Regression Forecasting
1. Daily carbon emissions coordinates are compiled into a time-series trendline.
2. The forecasting engine ([`twinRegression.ts`](frontend/src/lib/twinRegression.ts)) fits an Ordinary Least Squares (OLS) slope:
$$y = m \cdot x + c$$
3. Adjusting slider values dynamically recalculates projected yields over 30, 60, and 90 days.

---

## 4. Multi-Layer Security Architecture

1. **Edge Rate Limiting**: All API endpoints use an IP-based token-bucket rate limiter ([`rateLimiter.ts`](frontend/src/utils/rateLimiter.ts)) restricting client flooding.
2. **Content Security Policy (CSP)**: Safe CSP headers configured in `next.config.ts` restrict style/script execution sources, blocking cross-site scripting vectors.
3. **MIME/Size Filters**: Files uploaded for OCR receipt annotation are checked against strict MIME type constraints (only JPEG/PNG/WebP) and capped at 4MB to prevent payload exhaustion.
4. **Input & Output Sanitization**: Dynamic strings are validated on entry using Zod schemas, and responses are regex-escaped ([`sanitize.ts`](frontend/src/utils/sanitize.ts)) to shield rendering views.
5. **GCP Layer Hardening**: Production deployments connect with Google Identity-Aware Proxy (IAP) for single-sign-on OAuth verification and rely on Cloud Armor policies to filter out network threats.
