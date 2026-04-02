import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  console.log("Ping received at", new Date().toISOString());
  res.status(200).json({ 
    status: "ok", 
    time: new Date().toISOString(),
    env: {
      hasToken: !!process.env.EBAY_DELETION_VERIFICATION_TOKEN,
      hasEndpoint: !!process.env.EBAY_DELETION_ENDPOINT
    }
  });
}
