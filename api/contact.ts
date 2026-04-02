import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from "resend";

let resend: Resend | null = null;

const getResend = () => {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, message } = req.body;
  const resendClient = getResend();

  if (!resendClient) {
    console.warn("RESEND_API_KEY is not set. Mocking email send.");
    return res.status(200).json({ success: true, mocked: true });
  }

  try {
    const { data, error } = await resendClient.emails.send({
      from: "Watch1Do1 <onboarding@resend.dev>",
      to: ["team@watch1do1.com"],
      subject: `New Contact from ${name}`,
      html: `<p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Message:</strong> ${message}</p>`,
    });

    if (error) {
      return res.status(400).json({ error });
    }

    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
}
