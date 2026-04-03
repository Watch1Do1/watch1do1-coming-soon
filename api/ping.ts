export default function handler(req: any, res: any) {
  console.log("Ping received at", new Date().toISOString());
  res.status(200).json({ 
    status: "ok", 
    time: new Date().toISOString(),
    env: {
      hasEbayClientId: !!process.env.EBAY_CLIENT_ID,
      hasEbayClientSecret: !!process.env.EBAY_CLIENT_SECRET,
      hasEbayCampaignId: !!process.env.EBAY_CAMPAIGN_ID,
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      hasResendKey: !!process.env.RESEND_API_KEY,
      hasDeletionToken: !!process.env.EBAY_DELETION_VERIFICATION_TOKEN,
      hasDeletionEndpoint: !!process.env.EBAY_DELETION_ENDPOINT
    }
  });
}
