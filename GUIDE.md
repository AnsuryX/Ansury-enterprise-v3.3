# Ansury Enterprise Omnichannel Engine & Coexistence Platform Guide

Welcome to **Ansury**, the world-class enterprise omnichannel customer engagement, visual flow automation, and AI copilot platform powered by **Meta WhatsApp, Instagram Direct, & FB Messenger Coexistence**.

---

## 🌟 Application Capabilities & Feature Overview

### 1. Visual Flow Builder with n8n Custom Webhook Nodes
* **Visual Route Canvas**: Design complex customer pathways, IF/ELSE branch conditions, tag assigners, and automated drip delays.
* **n8n Custom Automation Nodes**: Execute complex external workflows directly from flow nodes. Custom parameters include target n8n Webhook Endpoint, HTTP Method (`POST`, `PUT`, `GET`), and dynamic JSON event payloads (`{{contact.phone}}`, `{{deal_stage}}`).
* **Live Webhook Test Runner**: Execute live n8n webhook dispatches directly inside the visual canvas with real-time latency reporting (ms), HTTP response codes (e.g. `200 OK`), and formatted JSON payload previews.

### 2. Zoho CRM Enterprise Connectors
* **Automatic Transcript Logging**: Log full customer conversation transcripts directly into Zoho CRM Deals Pipeline with single-click execution or flow trigger.
* **Deal Stage Synchronization**: Live dropdown updates to change lead stages (`Unqualified Lead`, `Qualified Lead`, `Demo Scheduled`, `Proposal Sent`, `Negotiation`, `Closed Won`).
* **Tag & Attribute Sync**: Keep tags and custom contact attributes synchronized bidirectionally between Ansury and Zoho CRM.
* **Audit Logging**: Every Zoho sync generates an immutable security audit entry with actor, timestamp, IP address, and Zoho Record ID.

### 3. Agent Collision Detection & Real-Time Presence
* **Co-Agent Live Tracking**: Real-time detection when multiple human agents or supervisors inspect the same conversation thread.
* **Visual Presence Badges**: Header avatars displaying active co-agents with pulsing green indicators when an agent is actively typing.
* **Collision Alert Banner**: Top warning banner (`⚠️ Agent Collision Warning: Agent David Miller is inspecting this conversation and typing a response`) prevents duplicate agent replies and customer confusion.

### 4. Full Meta Suite Synchronization (WhatsApp, Instagram, FB Messenger)
* **Meta Dual Coexistence**: Synchronize native WhatsApp Business mobile app messaging with the Ansury Omnichannel Inbox.
* **Instagram Direct DMs & Messenger Sync**: Coexistence synchronization extended across Meta's entire messaging suite (WhatsApp, Instagram Direct, Facebook Messenger, and Web Widgets).
* **Meta Interactive Product Catalogs**: Render interactive Meta Commerce product cards inside chat threads with instant "Buy Now / Order in Chat" order placement.

### 5. Rich Multi-Media & Voice Notes Suite
* **Emoji Accent Picker**: Quick popover featuring categorized popular emojis (`😊`, `👍`, `🔥`, `🎉`, `💼`, `📊`, `⚡`, `💬`, `🛍️`, `✅`, `❤️`, `🚀`, `⭐`, `📞`).
* **Live Audio Voice Recorder**: Record voice notes with duration counter (`00:08`), animated audio pulse waveform, and "Send Voice Note" / "Discard" controls.
* **Interactive Waveform Player**: Play voice notes and audio attachments directly inside chat messages with duration badges and audio controls.
* **Multi-Media Attachments**: Send and receive high-resolution Images, PDF SLA Agreements, Audio tracks, and Product Demo Videos.

### 6. Real-Time Engagement Analytics & SLA Compliance
* **Active Conversation Volume**: Live Recharts visualization of incoming chat metrics across Meta channels.
* **Average Response Time per Channel**: Channel latency metrics comparing WhatsApp, Instagram, Live Chat, and Email.
* **Peak Usage Hours Heatmap**: Hour-by-hour volume distribution to optimize agent shift scheduling.
* **SLA Breach Monitoring**: Real-time SLA breach countdowns and automated escalations to Slack or supervisors.

---

## 📋 Meta Developer Console Configuration (Step-by-Step)

To configure your Meta App in the [Meta for Developers Console](https://developers.facebook.com/):

### 1. App Settings > Basic
| Meta Console Field | Value to Enter |
| :--- | :--- |
| **App Domains** | `app.ansury.com` *(or Cloud Run domain)* |
| **Privacy Policy URL** | `https://app.ansury.com/privacy` |
| **Terms of Service URL** | `https://app.ansury.com/terms` |
| **Category** | Business / Messenger / Customer Service |
| **Business Use** | Tech Provider / Client Workspace |

### 2. Facebook Login & Webhooks
* **Valid OAuth Redirect URIs**: `https://app.ansury.com`
* **Webhook Callback URL**: `https://app.ansury.com/api/webhooks/whatsapp`
* **Verify Token**: `ansury_meta_secret_2026`
* **Subscribed Webhook Fields**: `messages`, `message_template_status_update`, `account_update`

---

## ⚙️ Configuration & Environment Variables

Create a `.env` or set container environment variables:

```env
PORT=3000
NODE_ENV=production
GEMINI_API_KEY=your_gemini_api_key_here
N8N_DEFAULT_WEBHOOK_URL=https://n8n.ansury.com/webhook/omnichannel-event-v2
ZOHO_CLIENT_ID=1000.xxxxxxxxxxxx
ZOHO_CLIENT_SECRET=xxxxxxxxxxxx
META_APP_ID=946589648227889
META_APP_SECRET=xxxxxxxxxxxx
```

---

*Powered by Ansury Enterprise Omnichannel Engine & Google Gemini AI.*
