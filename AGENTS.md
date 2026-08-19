# AGENTS.md — AI Agent Knowledge Base & Developer Context

This document provides system instructions, architectural design patterns, API endpoints, and data schema definitions for AI agents modifying or maintaining the **Ansury Enterprise Omnichannel & Coexistence Platform**.

---

## 🏗️ System Architecture Overview

Ansury is a full-stack React + Express application running on Cloud Run container infrastructure:

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Motion animations, Recharts data visualization.
- **Backend Entry Point**: `server.ts` (Express server bundled as CommonJS CJS via `esbuild server.ts --bundle --platform=node --format=cjs --packages=external --outfile=dist/server.cjs`).
- **Dev Server Port**: Binds strictly to port `3000` on `0.0.0.0` (required for Cloud Run reverse proxy).
- **AI Copilot**: Uses `@google/genai` with `GEMINI_API_KEY` accessed exclusively server-side in `server.ts`.

---

## 🔑 Key Data Structures & Types (`src/types.ts`)

1. **`Conversation`**: Repesents an omnichannel chat session (`whatsapp`, `instagram`, `messenger`, `livechat`, `email`). Includes `coexistenceSynced`, `contact`, `unreadCount`, `lastMessage`, `status`.
2. **`Message`**: Message thread entry (`senderType`: `agent` | `contact` | `system`, `whatsappMeta`, `productMeta`, `orderMeta`, `attachments`).
3. **`VisualFlow` & `FlowNode`**: Automation pathway containing step nodes (`send_message`, `send_product_catalog`, `ai_copilot_handover`, `condition_branch`, `add_tag`, `assign_agent`, `delay`, `webhook_n8n`).
4. **`Integration`**: Third-party connectors (`zoho`, `n8n`, `webhook`, `slack`, `shopify`, `gcal`).
5. **`AiPersona`**: Configurable AI Copilot personas (`Sales SDR Bot`, `Support Specialist`, `Technical Specialist`).

---

## 🔌 Primary Backend API Routes (`server.ts`)

| HTTP Method | Route | Description |
| :--- | :--- | :--- |
| **GET** | `/api/conversations` | Fetch all active omnichannel conversations |
| **GET** | `/api/conversations/:id/messages` | Fetch message history for a specific thread |
| **POST** | `/api/conversations/:id/messages` | Append a new message (agent or contact) |
| **POST** | `/api/integrations/n8n/trigger` | Trigger external n8n custom webhook node with live latency check |
| **POST** | `/api/integrations/zoho/sync-contact` | Log transcript & sync deal stage into Zoho CRM |
| **POST** | `/api/presence/collision` | Poll live co-agent presence and typing indicators |
| **POST** | `/api/ai/copilot` | Execute Gemini AI Copilot actions (`rephrase`, `draft_reply`, `summarize`) |
| **POST** | `/api/webhooks/whatsapp` | Ingest Meta WhatsApp/Instagram webhooks with WAMID deduplication |
| **GET** | `/api/analytics` | Fetch real-time engagement graphs & SLA breach metrics |
| **GET** | `/api/audit-logs` | Retrieve platform security audit trail |

---

## 🛠️ Developer Rules & Best Practices

1. **Server API Key Security**: Always proxy external API requests through `server.ts`. Never expose `GEMINI_API_KEY` or third-party client secrets to the browser bundle.
2. **Port & Host Constraints**: Always bind Express to host `0.0.0.0` and port `3000`. Do not override the port.
3. **Build Script Verification**: Production build relies on `vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs`.
4. **No Mock Fallbacks in Live UI**: Ensure every interactive UI control triggers actual backend API endpoints and updates React state dynamically.

---

*Ansury Enterprise Architecture Documentation — Maintained for AI Agents & Developers.*
