import type { VercelRequest, VercelResponse } from '@vercel/node';

let ebayToken: { access_token: string; expires_at: number } | null = null;

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    res.status(200).json(data);
  } catch (error) {
    console.error("eBay search error:", error);
    res.status(500).json({ error: "eBay search failed" });
  }
}
