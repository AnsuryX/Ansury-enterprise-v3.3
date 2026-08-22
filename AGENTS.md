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

1. **Strict Zero-Mock / Zero-Simulation Policy**:
   - **Never use hardcoded user credentials or mock fallback accounts** in client-side forms or production UI.
   - All authentication flows must route through `/api/auth/login` and `/api/auth/register` and persist to dynamic database state.
   - Interactive UI controls (e.g. creating tenants, adding contacts, scheduling calendar events, executing flows) must trigger genuine backend endpoints and update the persistent datastore.
2. **Enterprise Multi-Tenancy & RBAC Security**:
   - Every workspace is partitioned by a unique `tenantId` with strict data isolation.
   - Passwords must be hashed using cryptographic HMAC-SHA256 with tenant-scoped salts.
   - Session tokens are validated on every request via `/api/auth/me` with Bearer headers.
   - Enforce fine-grained RBAC roles: `Super Admin`, `Admin & System Owner`, `Omnichannel Support Lead`, and `AI Operations Specialist`.
3. **WhatsApp Entity Identification & Coexistence Protocol**:
   - **Business Portfolio ID** (e.g. `648719564147989` - SOLAR GEAR Limited): Represents the top-level Meta Business Manager portfolio, owner settings, and billing.
   - **WhatsApp Business Account (WABA) ID** (e.g. `1495781001950663` - Solar Gear): Represents the WhatsApp account asset used for all Graph API messaging calls, templates, phone number assignment, and webhooks.
   - **Meta App ID** (e.g. `946589648227889`): Must have `whatsapp_business_management` and `whatsapp_business_messaging` permissions.
   - **Avoid Error #1690130 ("Invalid Business ID")**: Never swap the Business Portfolio ID into the WABA ID field in SDK configuration. WABA ID belongs in WhatsApp account fields; Portfolio ID belongs strictly in the owner/portfolio field.
   - **Dual Coexistence Strategy**: Cloud API coexistence enables simultaneous operation of the physical WhatsApp Business Mobile App on iOS/Android devices alongside the Ansury Omnichannel Inbox via Port 3000 Webhook Ingress and WAMID deduplication.
   - **WABA Status Handling**: Note that a "Review Not Started" status on a WABA can temporarily hide it from certain partner onboarding dropdowns; manual WABA ID mapping bypasses this block cleanly.
4. **Full Database Persistence & Sync**:
   - The platform datastore captures all entities: `tenants`, `users`, `sessions`, `contacts`, `conversations`, `messages`, `integrations`, `products`, `broadcasts`, `visualFlows`, `calendarEvents`, and `auditLogs`.
   - Dual-tier persistence: Server writes state changes immediately to disk (`data/platform-state.json`) and synchronizes with cloud database (Supabase `ansury_store` & relational tables).
5. **Server API Key Security**:
   - Always proxy external API requests through `server.ts`. Never expose `GEMINI_API_KEY`, Supabase Service Keys, or CRM tokens to the client bundle.
6. **Port & Container Constraints**:
   - Always bind Express to host `0.0.0.0` and port `3000`. Do not override the port.

---

## 📚 Key Lessons Learned from Building Ansury

1. **Meta Graph API Entity Hierarchy & ID Disambiguation**:
   - Swapping the Meta Business Portfolio ID (e.g. `648719564147989`) and the WABA ID (e.g. `1495781001950663`) is the #1 root cause of Meta Error `#1690130` during Embedded Signup. Explicitly separating top-level Portfolio ownership from messaging WABA assets prevents initialization failures.
2. **True Full-Stack Decoupling**:
   - Keeping sensitive secrets (Gemini AI, Meta Graph API, Supabase Service Role, Google Workspace OAuth) strictly inside `server.ts` guarantees zero client-side credential exposure and eliminates CORS issues.
3. **Resilient Multi-Tenant Schema Partitioning**:
   - Partitioning all data documents with `tenantId` enables instant multi-tenancy without requiring separate database instances per tenant while preserving total isolation.
4. **Omnichannel Coexistence Sync & WAMID Deduplication**:
   - When synchronizing messages between Meta WhatsApp Cloud API and WhatsApp Business Mobile apps, strict WAMID (WhatsApp Message ID) tracking is essential to prevent infinite message echo loops.
5. **Non-Destructive State Hydration**:
   - When hydrating application state upon server startup, never let initial placeholder data overwrite live user accounts, custom integrations, or newly created contacts.
6. **Session Token Validation on App Boot**:
   - Client applications should immediately check `/api/auth/me` on startup with Bearer authentication to gracefully restore active sessions or transition cleanly to the login screen if the token has expired.

---

*Ansury Enterprise Architecture Documentation — Maintained for AI Agents & Developers.*
