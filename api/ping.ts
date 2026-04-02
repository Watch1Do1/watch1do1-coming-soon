export default function handler(req: any, res: any) {
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
