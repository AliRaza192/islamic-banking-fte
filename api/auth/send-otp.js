import { neon } from "@neondatabase/serverless";
import crypto from "crypto";
import { setCors } from "../lib/cors.js";

function getClientIP(req) {
  const vercelForwarded = req.headers["x-vercel-forwarded-for"];
  if (vercelForwarded) return vercelForwarded.split(",")[0].trim();
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

function generateOTP() {
  return crypto.randomInt(100000, 1000000).toString();
}

function hashOTP(email, code) {
  return crypto.createHash('sha256').update(`${email}:${code}`).digest('hex');
}

export default async function handler(req, res) {
  setCors(req, res, "POST, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { RESEND_API_KEY, DATABASE_URL } = process.env;

  // Detailed env check for debugging
  if (!RESEND_API_KEY) {
    console.error("send-otp: RESEND_API_KEY is not set in environment variables");
    return res.status(500).json({ error: "Email service not configured. Please contact support." });
  }
  if (!DATABASE_URL) {
    console.error("send-otp: DATABASE_URL is not set in environment variables");
    return res.status(500).json({ error: "Database not configured. Please contact support." });
  }

  let sql;
  try {
    sql = neon(DATABASE_URL);
  } catch (poolErr) {
    console.error("send-otp: Failed to connect to database:", poolErr.message);
    return res.status(500).json({ error: "Database connection failed. Please try again later." });
  }

  try {
    // IP-based rate limit check (DB-backed, 10 per hour)
    const clientIP = getClientIP(req);
    const ipLimit = await sql`
      SELECT req_count FROM rate_limits
      WHERE ip = ${clientIP} AND req_date = CURRENT_DATE
    `;
    const ipCount = ipLimit[0]?.req_count ?? 0;
    if (ipCount >= 10) {
      return res.status(429).json({ error: "Too many requests. Please try again later." });
    }

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
        .json({ error: "Too many OTP requests. Wait 10 minutes before trying again." });
    }

    // Generate and store OTP (hashed)
    const code = generateOTP();
    const hashedCode = hashOTP(normalizedEmail, code);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await sql`
      INSERT INTO otps (email, code, expires_at)
      VALUES (${normalizedEmail}, ${hashedCode}, ${expiresAt.toISOString()})
    `;

    // Send OTP via Resend
    const FROM_EMAIL = process.env.FROM_EMAIL;
    if (!FROM_EMAIL) {
      console.warn("send-otp: FROM_EMAIL not set — using Resend sandbox. Emails will ONLY deliver to account owner. Set FROM_EMAIL in Vercel env vars.");
    }
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Islamic Banking FTE <${FROM_EMAIL || "onboarding@resend.dev"}>`,
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
      console.error("Resend API error:", resendRes.status, errText);
      // Don't expose internal error details to user
      if (resendRes.status === 403) {
        return res.status(500).json({ error: "Email service authentication failed. Please contact support." });
      }
      if (resendRes.status === 422) {
        return res.status(500).json({ error: "Invalid email configuration. Please contact support." });
      }
      return res.status(500).json({ error: "Failed to send verification email. Please try again later." });
    }

    // Increment IP rate limit after successful send
    await sql`
      INSERT INTO rate_limits (ip, req_date, req_count)
      VALUES (${clientIP}, CURRENT_DATE, 1)
      ON CONFLICT (ip, req_date)
      DO UPDATE SET req_count = rate_limits.req_count + 1
    `;

    return res
      .status(200)
      .json({ success: true, message: "OTP sent to your email" });
  } catch (err) {
    console.error("send-otp error:", err.message, err.stack);
    return res.status(500).json({ error: "Internal server error. Please try again later." });
  }
}
