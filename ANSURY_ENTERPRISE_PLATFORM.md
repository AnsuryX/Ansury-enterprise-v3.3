# 🚀 Ansury Enterprise Omnichannel & Coexistence Platform

> **The Next-Generation Enterprise Omnichannel Inbox, WhatsApp Coexistence Engine, Autonomous AI Copilot, and Visual Workflow Automation Canvas.**

---

## 📌 Executive Summary

**Ansury Enterprise** is a full-stack, enterprise-grade customer engagement platform engineered for high-volume sales, support, and marketing teams. It seamlessly unifies **WhatsApp (with Meta Coexistence Engine)**, **Instagram Direct**, **Facebook Messenger**, **Telegram**, **Live Chat**, and **Email** into a unified, high-speed inbox powered by **Google Gemini 3.6 Flash AI**.

Ansury addresses the critical challenge of **WhatsApp messaging lockouts** during enterprise API migrations by enabling **Meta Dual-App Coexistence**—allowing human teams to continue using the physical WhatsApp Business mobile app while automated AI bots, CRM syncs, and n8n webhooks operate simultaneously over the official Meta Cloud API.

---

## 🏗️ Technical Architecture & Stack

```
 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │                              REACT 18 FRONTEND SPA                               │
 │   • Lucide Icons • Motion Animations • Recharts Visualizations • Tailwind CSS    │
 └──────────────────────────────────────┬───────────────────────────────────────────┘
                                        │ REST API & WebSockets (Port 3000)
 ┌──────────────────────────────────────▼───────────────────────────────────────────┐
 │                            EXPRESS BACKEND (`server.ts`)                         │
 │   • Bundled CommonJS (`dist/server.cjs`) • ESBuild Pipeline • Cloud Run Container│
 └───────────┬──────────────────────────┬───────────────────────────┬───────────────┘
             │                          │                           │
 ┌───────────▼───────────┐  ┌───────────▼───────────┐   ┌───────────▼──────────────┐
 │ GEMINI 3.6 FLASH SDK  │  │ META CLOUD API & WAMID│   │ PUBLIC REST API & N8N    │
 │ Server-Side AI Copilot│  │ WhatsApp Coexistence  │   │ Developer Marketplace    │
 └───────────────────────┘  └───────────────────────┘   └──────────────────────────┘
```

* **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Motion (Framer Motion), Lucide Icons, Recharts.
* **Backend Entry Point**: `server.ts` (Express server bundled as standalone CommonJS CJS via `esbuild server.ts --bundle --platform=node --format=cjs --packages=external --outfile=dist/server.cjs`).
* **Container Environment**: Google Cloud Run binding strictly to port `3000` on host `0.0.0.0`.
* **AI Engine**: `@google/genai` TypeScript SDK utilizing `gemini-3.6-flash` accessed **exclusively server-side**.

---

## 🌟 Key Capabilities & Features

### 1. 💬 Omnichannel Inbox & Meta WhatsApp Coexistence Engine
* **Meta Dual-App Coexistence**: Prevents physical phone app disconnections when integrating official Meta WhatsApp Business Cloud API. Messages sent from mobile phones or web app sync bi-directionally in real-time.
* **Unified Multi-Channel Threading**: Manage WhatsApp, Instagram Direct, Facebook Messenger, Live Web Chat, Telegram, and Email inside a single high-performance sidebar.
* **WAMID Message Deduplication**: Ingest Meta webhook events with WAMID hash tracking to guarantee zero duplicated customer records.
* **Meta Commerce Integration**: Native product catalog drawer allowing agents and bots to send rich interactive product cards directly in WhatsApp threads.

---

### 2. 🧠 Autonomous AI Copilot & Knowledge Grounding (RAG)
* **Server-Side Gemini 3.6 Flash Integration**: Fast, low-latency AI assistance running strictly on the backend to protect credentials.
* **Knowledge Base RAG Grounding**: Upload enterprise documentation, warranty policies, and pricing sheets. The AI Copilot grounds all responses in retrieved enterprise knowledge with **exact document citations**.
* **Real-Time Copilot Actions**:
  * 🪄 **Draft Reply**: Instantly drafts context-aware responses based on customer history.
  * ✍️ **Tone Polishing**: Rephrases drafts to sound empathetic, technical, or formal.
  * 🌐 **Instant Translation**: Multi-lingual customer communication across 40+ languages.
  * 📑 **Conversation Summarization**: Generates bulleted case handovers for human escalation.

---

### 3. 🎯 Autonomous Lead Scoring & Real-Time Sentiment Analysis
* **Live Sentiment Engine**: Classifies incoming customer sentiment into `positive`, `neutral`, `frustrated`, `urgent`, or `high_intent`.
* **Dynamic Lead Scoring**: Calculates 0–100 purchase intent scores based on conversation keywords, sentiment, and user profile parameters.
* **Visual Intent Badging**: Displays badges such as **"🔥 Hot Lead (Scale Inquiry)"** or **"⚡ SLA At Risk"** directly in conversation lists.

---

### 4. 🎭 Multi-Persona AI Delegation
* **Configurable AI SDR & Support Personas**: Assign specialized AI Agents depending on conversation context:
  * 💼 **Sales SDR Bot**: Consultative, high-converting product recommendation agent.
  * 🛠️ **Technical Specialist**: In-depth architecture, API, and troubleshooting assistant.
  * 💳 **Billing & Subscriptions Bot**: Policy-grounded invoice and account assistant.
* **Custom System Prompts & Temperature**: Fine-tune agent creativity, greeting messages, and tone controls.

---

### 5. 👥 Multi-Agent Collision Detection & Real-Time Presence
* **Co-Agent Viewing Markers**: Shows avatars of team members currently viewing the same conversation thread.
* **Live Typing Indicators**: Real-time visual feedback showing when another agent is actively drafting a response, preventing duplicate customer replies.
* **Agent Assignment & Transfers**: Smooth case delegation between human agents and AI personas.

---

### 6. ⚡ Visual Workflow Automation Engine (n8n & Webhooks)
* **Drag-and-Drop Node Builder**: Graph editor supporting automation nodes:
  * 📥 **Trigger Node**: Omnichannel inbound message, keyword match, or tag update.
  * 💬 **Send Message Node**: Templated message dispatch.
  * 📦 **Send Product Catalog Node**: Rich commerce gallery insertion.
  * 🤖 **AI Copilot Handover**: Autonomous AI bot conversation handling.
  * 🔀 **Conditional Branching**: If/Else evaluation based on contact tags or sentiment score.
  * 💼 **CRM Deal Creation**: Automatically logs new deals in Zoho CRM or custom database.
  * 🔗 **n8n / Custom Webhook Node**: Dispatches JSON payloads to external workflow engines with live latency measurement.
* **Live Step-by-Step Flow Tracing**: Real-time visual inspection showing customer sessions traversing flow steps with execution status (`COMPLETED`, `BRANCH_TRUE`, `DISPATCHED_N8N`), payload inspect, and timing metrics.

---

### 7. 🔌 Developer API Marketplace & Public Tenant REST API (`/v1/*`)
* **Tenant REST API Key Generator**: Provision scoped API keys (`ans_live_*`) for backend systems, mobile apps, or third-party integrations.
* **Production API Endpoints**:
  * `POST /v1/messages/send`: Programmatically dispatch outbound omnichannel messages or start new threads.
  * `POST /v1/contacts/create`: Create or update customer profiles, tags, and CRM metadata.
  * `POST /v1/broadcasts/trigger`: Execute targeted marketing campaigns to contact segments.
* **Interactive Endpoint Playground**: Test API requests directly inside the UI with live JSON execution output.
* **Multi-Language Code Snippets**: Auto-generates ready-to-use code in **Node.js**, **cURL**, and **Python**.
* **Interactive OpenAPI 3.0 Spec**: Dynamic OpenAPI specification available at `/api/developer/openapi.json`.

---

### 8. 📊 Enterprise SLA Engine & Real-Time Analytics
* **Breach Countdown Timers**: Visual SLA timers calculating time-to-breach per ticket based on priority.
* **Automated Escalation Rules**: Re-assigns tickets automatically when SLA response windows are at risk.
* **Analytics Dashboard**: Tracks response velocity, total resolution time, messaging volume per channel, and agent productivity graphs powered by Recharts.

---

### 9. 🔒 Security, Compliance & Audit Trail

* **Zero Client API Key Leakage**: All API keys (`GEMINI_API_KEY`, Meta tokens, Zoho OAuth secrets) are stored in server environment variables and **never exposed to the browser bundle**.
* **Immutable Security Audit Log**: Tracks system actions (`/api/audit-logs`) with IP recording, actor identification, and cryptographic timestamping.
* **Containerized Cloud Run Isolation**: Sandboxed deployment behind secure Nginx reverse proxy routing strictly through port 3000.

---

## 🛠️ Complete Backend API Reference

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/conversations` | `GET` | Fetch all omnichannel conversation threads |
| `/api/conversations/:id/messages` | `GET` / `POST` | Retrieve thread messages or post a new reply |
| `/api/conversations/:id/analyze-sentiment` | `POST` | Trigger Gemini sentiment & lead score audit |
| `/api/ai/copilot` | `POST` | Execute Gemini AI Copilot actions (draft, polish, summarize, translate) |
| `/api/ai-agents/personas` | `GET` / `POST` | Manage AI Copilot agent personas |
| `/api/ai-agents/kb` | `GET` / `POST` | Manage Knowledge Base RAG documents |
| `/api/presence/collision` | `POST` | Poll live co-agent presence and typing indicators |
| `/api/developer/keys` | `GET` / `POST` / `DELETE` | Manage Tenant REST API keys |
| `/api/developer/openapi.json` | `GET` | Serve interactive OpenAPI 3.0 JSON specification |
| `/v1/messages/send` | `POST` | Public REST endpoint: Dispatch outbound message |
| `/v1/contacts/create` | `POST` | Public REST endpoint: Create or update contact |
| `/v1/broadcasts/trigger` | `POST` | Public REST endpoint: Trigger broadcast campaign |
| `/api/integrations/n8n/trigger` | `POST` | Trigger external n8n workflow webhook |
| `/api/integrations/zoho/sync-contact` | `POST` | Sync contact & deal stage into Zoho CRM |
| `/api/analytics` | `GET` | Retrieve real-time performance & SLA breach metrics |
| `/api/audit-logs` | `GET` | Query platform security audit trail |

---

## 💼 Enterprise Use Cases

### 🛒 1. High-Volume E-Commerce Sales & Cart Recovery
* Automatically send rich WhatsApp catalog cards when customers inquire about products.
* Trigger n8n webhooks upon cart abandonment to offer discount codes and convert shoppers via Instagram Direct or WhatsApp.

### 💼 2. Enterprise B2B Lead Qualification
* Use the **Sales SDR Bot Persona** to qualify inbound leads 24/7.
* Score leads automatically with Gemini Sentiment Analysis; automatically create high-value deals in **Zoho CRM**.

### 🗓️ 3. Healthcare & Appointment Scheduling
* Integrate with **Google Calendar** to allow patients to book appointments directly over WhatsApp or Live Web Chat.
* Send automated SMS/WhatsApp appointment reminders with zero manual agent intervention.

### 🌍 4. Global Multilingual Customer Support
* Support international users seamlessly using AI Translation and Grounded Knowledge Base RAG.
* Guarantee SLA compliance with automated escalation timers and multi-agent collision prevention.

---

*Ansury Enterprise Omnichannel & Coexistence Platform — Built for Scale, Security, and Seamless Customer Engagement.*
