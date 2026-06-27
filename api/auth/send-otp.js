import { neon } from "@neondatabase/serverless";
import crypto from "crypto";

const ALLOWED_ORIGINS = [
  "https://islamic-banking-fte.vercel.app",
  "http://localhost:8000",
  "http://localhost:3000",
];

function setCors(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function generateOTP() {
  return crypto.randomInt(100000, 1000000).toString();
}

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { RESEND_API_KEY, DATABASE_URL } = process.env;
  if (!RESEND_API_KEY)
    return res.status(500).json({ error: "RESEND_API_KEY not configured" });
  if (!DATABASE_URL)
    return res.status(500).json({ error: "DATABASE_URL not configured" });

  const sql = neon(DATABASE_URL);

  try {
    const { email } = req.body || {};
    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email.trim())) {
      return res
        .status(400)
        .json({ error: "Valid email address required (e.g. name@gmail.com)" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Rate limit: max 3 OTPs per email in 10 minutes
    const recent = await sql`
      SELECT COUNT(*) as cnt FROM otps
      WHERE email = ${normalizedEmail}
        AND created_at > NOW() - INTERVAL '10 minutes'
    `;
    if (parseInt(recent[0].cnt) >= 3) {
      return res
        .status(429)
        .json({ error: "Too many OTP requests. Try again in 10 minutes." });
    }

    // Generate and store OTP
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await sql`
      INSERT INTO otps (email, code, expires_at)
      VALUES (${normalizedEmail}, ${code}, ${expiresAt.toISOString()})
    `;

    // Send OTP via Resend
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Islamic Banking FTE <${process.env.FROM_EMAIL || "onboarding@resend.dev"}>`,
        to: [normalizedEmail],
        subject: "Your Verification Code — Islamic Banking FTE",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a4731;">Assalamu Alaikum</h2>
            <p>Your verification code is:</p>
            <div style="background: #d8f3dc; border: 2px solid #2d6a4f; border-radius: 8px; padding: 16px; text-align: center; margin: 16px 0;">
              <span style="font-size: 32px; font-weight: bold; color: #1a4731; letter-spacing: 8px;">${code}</span>
            </div>
            <p style="color: #666;">This code expires in 5 minutes.</p>
            <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email.</p>
          </div>
        `,
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      console.error("Resend error:", errText);
      return res.status(500).json({ error: "Failed to send email" });
    }

    return res
      .status(200)
      .json({ success: true, message: "OTP sent to your email" });
  } catch (err) {
    console.error("send-otp error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
}
