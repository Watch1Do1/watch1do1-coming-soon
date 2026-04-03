import crypto from "crypto";

export default function handler(req: any, res: any) {
  if (req.method === 'GET') {
    const challengeCode = (req.query.challenge_code as string)?.trim();
    const verificationToken = process.env.EBAY_DELETION_VERIFICATION_TOKEN?.trim();
    
    // Dynamically determine the endpoint URL if not explicitly set
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['host'];
    const currentUrl = `${protocol}://${host}/api/ebay/account-deletion`;
    const endpoint = (process.env.EBAY_DELETION_ENDPOINT || currentUrl).trim().replace(/"/g, '');

    console.log("--- eBay Account Deletion Validation ---");
    console.log("Time:", new Date().toISOString());
    console.log("Challenge Code:", challengeCode);
    console.log("Verification Token (exists):", !!verificationToken);
    console.log("Calculated Endpoint URL:", endpoint);

    if (!challengeCode || !verificationToken) {
      console.error("Missing challengeCode or verificationToken");
      return res.status(200).json({ 
        error: `Missing parameters. To verify, add ?challenge_code=test to the ${endpoint} URL.`,
        verificationToken: verificationToken ? "Set (Hidden for security)" : "Missing",
        calculatedEndpoint: endpoint
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
  }

  if (req.method === 'POST') {
    // Acknowledge receipt of deletion notice
    return res.status(200).json({ status: 'ok' });
  }

  return res.status(405).end();
}
