# WhatsApp Adapter

This adapter bridges **WhatsApp Business Cloud API** webhook events into your Operational Management System (OMS).

## Prerequisites
- Node.js 20+ (or any recent LTS version)
- A **WhatsApp Business Cloud** account (Meta)
- An HTTPS‑reachable URL for the webhook (e.g., `https://example.com/whatsapp/webhook`). For local testing you can use a tunneling service such as **ngrok**.

## Setup
1. **Create the project** (already done in the repository under `whatsapp_adapter`).
2. Install dependencies:
   ```bash
   cd whatsapp_adapter
   npm install
   ```
3. Copy the example `.env` file and fill in your credentials:
   ```text
   WHATSAPP_VERIFY_TOKEN=your_verify_token          # token you set in Meta webhook settings
   WHATSAPP_APP_SECRET=your_app_secret            # Meta App Secret – used to verify signatures
   OMS_ENDPOINT=http://localhost:5173/api/events   # URL of your OMS endpoint that accepts POST JSON events
   PORT=3000                                       # Port for this adapter (change if needed)
   ```
4. **Expose the webhook** publicly. If using ngrok:
   ```bash
   ngrok http 3000
   ```
   Take the generated HTTPS URL (e.g., `https://abcd1234.ngrok.io`) and configure Meta:
   - **Callback URL**: `https://abcd1234.ngrok.io/whatsapp/webhook`
   - **Verify Token**: the same `WHATSAPP_VERIFY_TOKEN`
   - **Subscribe** to *messages* and *message_deliveries* (or any other events you need).

## Running the Adapter
```bash
npm start   # launches the Express server on the configured PORT
```
The server will:
- Respond to the GET verification request from Meta.
- Verify the `X-Hub-Signature-256` header on incoming POSTs.
- Transform each WhatsApp message into a normalized OMS event (see `server.js`).
- POST the event to the `OMS_ENDPOINT` you defined.

## Expected OMS Payload
```json
{
  "source": "whatsapp",
  "externalId": "wamid.HBgM...",
  "timestamp": "2026-07-16T09:12:34.000Z",
  "contact": {
    "phone": "491711234567",
    "whatsapp": "491711234567"
  },
  "payload": {
    "type": "text",
    "content": "Hello, I need help with my order.",
    "mediaId": null
  },
  "metadata": {
    "receivedVia": "whatsapp-webhook"
  }
}
```
Your OMS backend should expose a POST `/api/events` endpoint that accepts this JSON, stores it (e.g., in a database or a log file) and optionally triggers further workflows such as creating a support ticket.

## Integration Checklist
- [ ] Deploy the adapter (Docker, systemd, PM2, etc.)
- [ ] Point `OMS_ENDPOINT` to a real API that persists events
- [ ] Secure the endpoint (HTTPS, authentication) – optional but recommended
- [ ] Test with Meta’s *Webhook Test* button; you should see a 200 response and the OMS receive the JSON payload.
- [ ] Extend the OMS UI to visualise incoming WhatsApp events (e.g., add a new dashboard tab that reads from your events store).

## Optional Dockerfile
If you prefer containerised deployment, a minimal Dockerfile is provided:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```
Build & run:
```bash
docker build -t whatsapp-adapter .
docker run -d -p 3000:3000 --env-file .env whatsapp-adapter
```

---
**Next steps**: Ensure your OMS backend implements the `/api/events` endpoint, then start the adapter and verify that messages appear in your OMS.
