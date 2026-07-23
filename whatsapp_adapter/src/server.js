import express from "express";
import axios from "axios";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// Helper to verify Meta signature
function verifySignature(req) {
  const signature = req.headers["x-hub-signature-256"];
  if (!signature) return false;
  const expected = "sha256=" + crypto.createHmac("sha256", process.env.WHATSAPP_APP_SECRET)
    .update(JSON.stringify(req.body))
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

// Verification endpoint (GET) – Meta calls this during setup
app.get("/whatsapp/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log("✅ Webhook verified");
    res.send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Incoming messages (POST)
app.post("/whatsapp/webhook", async (req, res) => {
  if (!verifySignature(req)) {
    console.warn("⚠️ Invalid signature");
    return res.sendStatus(403);
  }
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages ?? [];
    for (const msg of messages) {
      const event = {
        source: "whatsapp",
        externalId: msg.id,
        timestamp: new Date(parseInt(msg.timestamp, 10) * 1000).toISOString(),
        contact: {
          phone: msg.from,
          whatsapp: msg.from
        },
        payload: {
          type: msg.type,
          content: msg.text?.body ?? (msg.image?.caption ?? ""),
          mediaId: msg.image?.id ?? msg.document?.id ?? null
        },
        metadata: {
          receivedVia: "whatsapp-webhook"
        }
      };
      await axios.post(process.env.OMS_ENDPOINT, event, {
        headers: { "Content-Type": "application/json" }
      });
    }
    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`WhatsApp adapter listening on port ${PORT}`));
