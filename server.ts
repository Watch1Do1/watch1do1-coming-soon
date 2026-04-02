import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { Resend } from "resend";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

let resend: Resend | null = null;
let ebayToken: { access_token: string; expires_at: number } | null = null;

const getResend = () => {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
};

const getEbayToken = async () => {
  if (ebayToken && ebayToken.expires_at > Date.now()) {
    return ebayToken.access_token;
  }

  const clientId = process.env.EBAY_CLIENT_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("eBay credentials not set");
    return null;
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  try {
    const response = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${auth}`,
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        scope: "https://api.ebay.com/oauth/api_scope",
      }),
    });

    const data = await response.json();
    if (data.access_token) {
      ebayToken = {
        access_token: data.access_token,
        expires_at: Date.now() + data.expires_in * 1000 - 60000, // Buffer of 1 minute
      };
      return data.access_token;
    }
  } catch (error) {
    console.error("Error fetching eBay token:", error);
  }
  return null;
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.post("/api/contact", async (req, res) => {
    const { name, email, message } = req.body;
    const resendClient = getResend();

    if (!resendClient) {
      console.warn("RESEND_API_KEY is not set. Mocking email send.");
      return res.json({ success: true, mocked: true });
    }

    try {
      const { data, error } = await resendClient.emails.send({
        from: "Watch1Do1 <onboarding@resend.dev>", // Default Resend test domain
        to: ["team@watch1do1.com"], // User's email from context
        subject: `New Contact from ${name}`,
        html: `<p><strong>Name:</strong> ${name}</p>
               <p><strong>Email:</strong> ${email}</p>
               <p><strong>Message:</strong> ${message}</p>`,
      });

      if (error) {
        return res.status(400).json({ error });
      }

      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/ebay/search", async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: "Query required" });

    const token = await getEbayToken();
    if (!token) return res.status(500).json({ error: "eBay auth failed" });

    const campaignId = process.env.EBAY_CAMPAIGN_ID;
    const referenceId = process.env.EBAY_AFFILIATE_REFERENCE_ID;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    if (campaignId) {
      headers["X-EBAY-C-ENDUSERCTX"] = `affiliateCampaignId=${campaignId}${referenceId ? `,affiliateReferenceId=${referenceId}` : ""}`;
    }

    try {
      const response = await fetch(
        `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(q as string)}&limit=5`,
        { headers }
      );

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("eBay search error:", error);
      res.status(500).json({ error: "eBay search failed" });
    }
  });

  // eBay Marketplace Account Deletion Notification Endpoint
  app.get("/api/ebay/account-deletion", (req, res) => {
    const challengeCode = (req.query.challenge_code as string)?.trim();
    const verificationToken = process.env.EBAY_DELETION_VERIFICATION_TOKEN?.trim();
    const endpoint = (process.env.EBAY_DELETION_ENDPOINT || "https://www.watch1do1.com/api/ebay/account-deletion").trim();

    console.log("eBay Account Deletion Validation Request Received");
    console.log("Challenge Code:", challengeCode);
    console.log("Verification Token (exists):", !!verificationToken);
    console.log("Endpoint URL:", endpoint);

    if (!challengeCode || !verificationToken) {
      console.error("Missing challengeCode or verificationToken");
      return res.status(200).json({ 
        error: "Missing parameters",
        verificationToken: verificationToken ? "Set" : "Missing" 
      });
    }

    try {
      const hash = crypto.createHash('sha256');
      hash.update(challengeCode);
      hash.update(verificationToken);
      hash.update(endpoint);
      const responseHash = hash.digest('hex');

      console.log("Generated Hash:", responseHash);

      return res.status(200).json({
        challengeResponse: responseHash
      });
    } catch (error) {
      console.error("Error generating eBay hash:", error);
      return res.status(500).json({ error: "Hash generation failed" });
    }
  });

  app.post("/api/ebay/account-deletion", (req, res) => {
    // Acknowledge receipt of deletion notice
    return res.status(200).json({ status: 'ok' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
