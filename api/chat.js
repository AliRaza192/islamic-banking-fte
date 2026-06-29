import { neonConfig, neon } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;
import jwt from "jsonwebtoken";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

// ---- Load files from disk (server-side only) ----
function loadFile(relativePath) {
  try {
    const fullPath = join(process.cwd(), relativePath);
    if (existsSync(fullPath)) return readFileSync(fullPath, "utf-8");
    return "";
  } catch (err) {
    console.error(`File load error: ${relativePath}`, err.message);
    return "";
  }
}

// ---- Skill Auto-Router ----
// ORDER MATTERS: More specific skills match BEFORE generic ones
function detectSkill(userMessage) {
  const msg = userMessage.toLowerCase();

  // 1. Murabaha (FAS 2)
  if (
    msg.includes("murabaha") ||
    msg.includes("مرابحة") ||
    msg.includes("car loan") ||
    msg.includes("ghar ka qarz") ||
    msg.includes("cost-plus") ||
    msg.includes("commodity financ")
  )
    return "murabaha-specialist";

  // 2. Zakat (FAS 9)
  if (
    msg.includes("zakat") ||
    msg.includes("zakaat") ||
    msg.includes("زکات") ||
    msg.includes("nisab") ||
    msg.includes("نصاب") ||
    msg.includes("tithe")
  )
    return "zakat-advisor";

  // 3. Ijara (FAS 8/32)
  if (
    msg.includes("ijara") ||
    msg.includes("ijarah") ||
    msg.includes("إجارة") ||
    msg.includes("lease") ||
    msg.includes("kiraya") ||
    msg.includes("rent-to-own")
  )
    return "ijara-specialist";

  // 4. Salam (FAS 7) — BEFORE generic sukuk/takaful
  if (
    /\bsalam\b/i.test(msg) ||
    msg.includes("سلم") ||
    msg.includes("forward sale") ||
    msg.includes("advance payment") ||
    msg.includes("crop financing") ||
    msg.includes("agricultural financ") ||
    msg.includes("commodity forward") ||
    msg.includes("pre-paid goods")
  )
    return "salam-specialist";

  // 5. Istisna'a (FAS 10) — BEFORE generic sukuk/takaful
  if (
    msg.includes("istisna") ||
    msg.includes("استصناع") ||
    msg.includes("construction financ") ||
    msg.includes("manufacturing financ") ||
    msg.includes("home construction") ||
    msg.includes("under-construction") ||
    msg.includes("milestone payment") ||
    msg.includes("progressive payment")
  )
    return "istisna-a-specialist";

  // 6. Sukuk Issuer (FAS 33/34) — BEFORE generic sukuk
  if (
    (msg.includes("sukuk") &&
      (msg.includes("issuance") ||
        msg.includes("issue") ||
        msg.includes("issuer") ||
        msg.includes("structure") ||
        msg.includes("spv") ||
        msg.includes("corporate") ||
        msg.includes("prospectus"))) ||
    msg.includes("issue sukuk") ||
    msg.includes("sukuk offering")
  )
    return "sukuk-issuer";

  // 7. Sukuk Investor (FAS 25) — BEFORE generic sukuk
  if (
    (msg.includes("sukuk") &&
      (msg.includes("invest") ||
        msg.includes("buy") ||
        msg.includes("yield") ||
        msg.includes("return") ||
        msg.includes("portfolio") ||
        msg.includes("gop sukuk") ||
        msg.includes("pakistan sukuk"))) ||
    msg.includes("invest in sukuk") ||
    msg.includes("sukuk investment")
  )
    return "sukuk-investor";

  // 8. Takaful IFRS 17 — BEFORE generic takaful
  if (
    (msg.includes("takaful") &&
      (msg.includes("accounting") ||
        msg.includes("ifrs17") ||
        msg.includes("ifrs 17") ||
        msg.includes("operator") ||
        msg.includes("wakala") ||
        msg.includes("measurement") ||
        msg.includes("contracts") ||
        msg.includes("surplus"))) ||
    msg.includes("takaful accounting") ||
    msg.includes("takaful operator")
  )
    return "takaful-ifrs17";

  // 9. Musharakah Full (FAS 4) — specific musharakah types
  if (
    msg.includes("full musharakah") ||
    msg.includes("permanent musharakah") ||
    msg.includes("running musharakah") ||
    msg.includes("sme partnership") ||
    msg.includes("working capital musharakah") ||
    msg.includes("musharakah joint venture")
  )
    return "musharaka-full";

  // 10. Musharakah/Mudarabah (FAS 3/4) — general
  if (
    msg.includes("musharakah") ||
    msg.includes("mudarabah") ||
    msg.includes("مشاركة") ||
    msg.includes("مضاربة") ||
    msg.includes("partnership") ||
    msg.includes("profit shar") ||
    msg.includes("shirkat")
  )
    return "musharakah-mudarabah-specialist";

  // 11. Sukuk/Takaful (Generic) — after specific skills
  if (
    msg.includes("sukuk") ||
    msg.includes("takaful") ||
    msg.includes("صكوك") ||
    msg.includes("تكافل") ||
    msg.includes("islamic insurance") ||
    msg.includes("halal insurance") ||
    msg.includes("islamic bond")
  )
    return "sukuk-takaful-specialist";

  // 12. Shariah Compliance Checker
  if (
    msg.includes("halal") ||
    msg.includes("haram") ||
    msg.includes("permissible") ||
    msg.includes("jaiz") ||
    msg.includes("na-jaiz") ||
    msg.includes("shariah check") ||
    msg.includes("compliance") ||
    msg.includes("riba") ||
    msg.includes("gharar") ||
    msg.includes("kya yeh")
  )
    return "shariah-compliance-checker";

  // 13b. Roshan Digital Account — Overseas Pakistanis
  if (
    msg.includes("roshan") ||
    msg.includes("rda") ||
    msg.includes("roshan digital") ||
    msg.includes("overseas pakistani") ||
    msg.includes("non-resident") ||
    msg.includes("nrp") ||
    msg.includes("naya pakistan certificate") ||
    msg.includes("npc") ||
    msg.includes("روشن ڈیجیٹل")
  )
    return "roshan-digital-advisor";

  // 13. Pakistan Banking Navigator
  if (
    msg.includes("meezan") ||
    msg.includes("dubai islamic") ||
    msg.includes("bank islami") ||
    msg.includes("al baraka") ||
    msg.includes("faysal bank") ||
    msg.includes("sbp") ||
    msg.includes("pakistan") ||
    msg.includes("kibor") ||
    msg.includes("pkr") ||
    msg.includes("روشن")
  )
    return "pakistan-banking-navigator";

  // 14. Halal Calculator
  if (
    msg.includes("calculate") ||
    msg.includes("hisab") ||
    msg.includes("kitna") ||
    msg.includes("monthly payment") ||
    msg.includes("installment") ||
    msg.includes("qist") ||
    msg.includes("total payable") ||
    msg.includes("profit amount")
  )
    return "halal-calculator";

  // 15. Product Explainer
  if (
    msg.includes("what is") ||
    msg.includes("explain") ||
    msg.includes("kya hai") ||
    msg.includes("bataiye") ||
    msg.includes("samjhao") ||
    msg.includes("difference between") ||
    msg.includes("how does")
  )
    return "islamic-product-explainer";

  return "islamic-banking-advisor";
}

// ---- Detect Jurisdiction ----
function detectJurisdiction(userMessage) {
  const msg = userMessage.toLowerCase();

  if (
    msg.includes("uae") ||
    msg.includes("dubai") ||
    msg.includes("abu dhabi") ||
    msg.includes("emirates islamic") ||
    msg.includes("aed") ||
    msg.includes("cbuae") ||
    msg.includes("dib") ||
    msg.includes("adib")
  )
    return "uae";
  if (
    msg.includes("saudi") ||
    msg.includes("ksa") ||
    msg.includes("al rajhi") ||
    msg.includes("sar") ||
    msg.includes("sama") ||
    msg.includes("zatca")
  )
    return "saudi";
  if (
    msg.includes("malaysia") ||
    msg.includes("maybank") ||
    msg.includes("myr") ||
    msg.includes("bnm") ||
    msg.includes("klibor")
  )
    return "malaysia";
  if (
    msg.includes("bahrain") ||
    msg.includes("al baraka") ||
    msg.includes("bhd") ||
    msg.includes("cbb") ||
    msg.includes("aaoifi")
  )
    return "bahrain";
  if (
    msg.includes("kuwait") ||
    msg.includes("kuwait finance") ||
    msg.includes("kwd") ||
    msg.includes("cbk") ||
    msg.includes("kfh")
  )
    return "kuwait";
  if (
    msg.includes("qatar") ||
    msg.includes("qar") ||
    msg.includes("qib") ||
    msg.includes("qiib") ||
    msg.includes("qcb") ||
    msg.includes("qfc")
  )
    return "qatar";
  if (
    msg.includes("oman") ||
    msg.includes("omr") ||
    msg.includes("cbo") ||
    msg.includes("bank nizwa") ||
    msg.includes("meethaq")
  )
    return "oman";
  if (
    msg.includes("turkey") ||
    msg.includes("turkish") ||
    msg.includes("try") ||
    msg.includes("bddk") ||
    msg.includes("kuveyt turk") ||
    msg.includes("katilim")
  )
    return "turkey";
  if (
    msg.includes("nigeria") ||
    msg.includes("ngn") ||
    msg.includes("cbn") ||
    msg.includes("jaiz bank") ||
    msg.includes("taj bank")
  )
    return "nigeria";
  if (
    msg.includes("indonesia") ||
    msg.includes("idr") ||
    msg.includes("ojk") ||
    msg.includes("bsi") ||
    msg.includes("bank muamalat") ||
    msg.includes("dsn-mui")
  )
    return "indonesia";
  if (
    (/\buk\b/.test(msg) && !msg.includes("sukuk")) ||
    msg.includes("united kingdom") ||
    msg.includes("britain") ||
    msg.includes("gbp") ||
    msg.includes("al rayan") ||
    msg.includes("blme") ||
    msg.includes("hmrc") ||
    msg.includes("prafca")
  )
    return "uk";
  if (
    msg.includes("gcc") ||
    msg.includes("cross-border") ||
    msg.includes("gulf") ||
    msg.includes("multi-country")
  )
    return "gcc-crossborder";
  return "pakistan";
}

// ---- Build Full System Prompt ----
function buildSystemPrompt(userMessage) {
  const claudeMd = loadFile("CLAUDE.md");
  const routerSkill = loadFile("skills/islamic-finance-router/SKILL.md");
  const shariahRules = loadFile("references/shariah-rules.md");
  const nisabTable = loadFile("references/nisab-table.md");
  const calculations = loadFile("references/calculations.md");
  const jurisdiction = detectJurisdiction(userMessage);
  const jurisdictionFiles = {
    pakistan: "pakistan-ifrs",
    uae: "uae-ifrs",
    saudi: "saudi-ifrs",
    malaysia: "malaysia-mfrs",
    bahrain: "bahrain-aaoifi",
    kuwait: "kuwait-ifrs",
    qatar: "qatar-aaoifi",
    oman: "oman-ifrs",
    turkey: "turkey-tfrs",
    nigeria: "nigeria-ifrs",
    indonesia: "indonesia-psak",
    uk: "uk-ifrs",
    "gcc-crossborder": "gcc-crossborder",
  };
  const jurisdictionOverlay = loadFile(
    `skills/islamic-finance-router/references/jurisdictions/${jurisdictionFiles[jurisdiction] || jurisdiction + "-ifrs"}.md`,
  );
  const skillName = detectSkill(userMessage);
  const skillContent = loadFile(`skills/${skillName}/SKILL.md`);

  const msg = userMessage.toLowerCase();
  let extraRefs = "";
  if (
    msg.includes("bank") ||
    msg.includes("meezan") ||
    msg.includes("pakistan") ||
    msg.includes("recommend") ||
    msg.includes("best bank")
  )
    extraRefs += "\n\n---\n\n" + loadFile("references/pakistan-banks.md");
  if (
    msg.includes("product") ||
    msg.includes("what is") ||
    msg.includes("explain") ||
    msg.includes("kya hai") ||
    msg.includes("murabaha") ||
    msg.includes("ijara")
  )
    extraRefs += "\n\n---\n\n" + loadFile("references/products.md");
  if (
    msg.includes("faq") ||
    msg.includes("question") ||
    msg.includes("confused") ||
    msg.includes("difference") ||
    msg.includes("better")
  )
    extraRefs += "\n\n---\n\n" + loadFile("references/faqs.md");

  return [
    claudeMd,
    "---",
    "## Router Skill (Active)",
    routerSkill,
    "---",
    "## Detected Jurisdiction: " + jurisdiction.toUpperCase(),
    jurisdictionOverlay,
    "---",
    "## Active Product Skill: " + skillName,
    skillContent,
    "---",
    "## Core References",
    "### Shariah Rules",
    shariahRules,
    "### Nisab & Zakat Values",
    nisabTable,
    "### Calculation Formulas",
    calculations,
    extraRefs,
  ]
    .filter(Boolean)
    .join("\n\n");
}

// ---- Input Validation ----
function validateInput(body) {
  const { contents } = body;
  if (!contents || !Array.isArray(contents) || contents.length === 0)
    return "Invalid request: contents missing";
  if (contents.length > 60) {
    body.contents = [contents[0], ...contents.slice(-20)];
    contents = body.contents;
  }

  for (const msg of contents) {
    if (!msg.role || !msg.parts || !Array.isArray(msg.parts))
      return "Invalid message structure";
    for (const part of msg.parts) {
      if (!part.text || typeof part.text !== "string")
        return "Invalid message format";
      // Block prompt injection attempts (defense-in-depth — not jailbreak-proof)
      const injectionPatterns = [
        /ignore\s+(previous|prior|above|all|original)/i,
        /disregard\s+(previous|prior|above|all|original)/i,
        /forget\s+(previous|prior|above|all|original)/i,
        /reveal\s+(your|the)\s+(system|prompt|instructions|rules)/i,
        /show\s+(me\s+)?(your|the)\s+(system|prompt|instructions|rules)/i,
        /you\s+are\s+now\s+/i,
        /act\s+as\s+(if\s+)?(you\s+are|a|an|though)/i,
        /system\s+prompt/i,
        /original\s+(instructions|rules|prompt)/i,
        // Roman Urdu variants
        /pichle\s+(hukum|instructions|batain|rules)\s+(bhool|ignore|chhor)/i,
        /apne\s+(asli|original|pichle)\s+(hukum|qaide|rules)\s+(bhool|chhor|ignore)/i,
        /meri\s+baat\s+maano/i,
        /jo\s+main\s+keh\s+raha/i,
      ];
      if (injectionPatterns.some((p) => p.test(part.text)))
        return "Invalid message content";
    }
  }

  const lastMsg = contents[contents.length - 1]?.parts?.[0]?.text;
  if (!lastMsg || typeof lastMsg !== "string") return "Invalid message format";
  if (lastMsg.length > 2000)
    return "Message too long — please keep under 2000 characters";
  return null;
}

// ---- Tier Limits ----
const TIER_LIMITS = {
  anonymous: 5,
  free: 5,
  premium: 100,
  professional: Infinity, // unlimited
};

// ---- JWT Verification ----
function verifyToken(authHeader) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) return null;
    return jwt.verify(authHeader.slice(7), JWT_SECRET);
  } catch {
    return null;
  }
}

// ---- Rate Limiting (tiered) ----
// CHECK first (no increment), then INCREMENT after successful response
async function checkRateLimit(sql, ip, user) {
  const tier = user?.tier || "anonymous";
  const limit = TIER_LIMITS[tier];

  if (limit === Infinity)
    return { allowed: true, remaining: "unlimited", tier };

  // Authenticated user: track by user_id in users table
  if (user && sql) {
    try {
      const today = new Date().toISOString().split("T")[0];
      // Reset counter if date changed
      await sql`
        UPDATE users SET queries_today = 0, queries_date = ${today}
        WHERE id = ${user.userId} AND queries_date < ${today}::date
      `;
      // READ current count (no increment yet)
      const rows = await sql`
        SELECT queries_today FROM users WHERE id = ${user.userId}
      `;
      const count = rows[0]?.queries_today ?? 0;
      const remaining = Math.max(0, limit - count);
      return { allowed: count < limit, remaining, tier, count };
    } catch (err) {
      console.error("User rate limit error:", err.message);
      return { allowed: false, remaining: 0, tier };
    }
  }

  // Anonymous: track by IP
  if (!sql) return { allowed: false, remaining: 0, tier };
  try {
    // READ current count first (no increment)
    const rows = await sql`
      SELECT req_count FROM rate_limits
      WHERE ip = ${ip} AND req_date = CURRENT_DATE
    `;
    const count = rows[0]?.req_count ?? 0;
    const remaining = Math.max(0, limit - count);

    if (count >= limit) {
      return { allowed: false, remaining: 0, tier, count };
    }

    return { allowed: true, remaining, tier, count };
  } catch (err) {
    console.error("Rate limit check error:", err.message);
    return { allowed: false, remaining: 0, tier };
  }
}

// ---- Increment Rate Limit (called AFTER successful response) ----
async function incrementRateLimit(sql, ip, user) {
  try {
    if (!sql) return;

    // Authenticated user
    if (user && user.userId) {
      await sql`
        UPDATE users SET queries_today = queries_today + 1
        WHERE id = ${user.userId}
      `;
      return;
    }

    // Anonymous: track by IP
    await sql`
      INSERT INTO rate_limits (ip, req_date, req_count)
      VALUES (${ip}, CURRENT_DATE, 1)
      ON CONFLICT (ip, req_date)
      DO UPDATE SET req_count = rate_limits.req_count + 1
    `;
  } catch (err) {
    console.error("Rate limit increment error:", err.message);
  }
}

// ---- Get Client IP ----
function getClientIP(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

// ---- Main Handler ----
export default async function handler(req, res) {
  const origin = req.headers.origin;
  const ALLOWED_ORIGINS = [
    "https://islamic-banking-fte.vercel.app",
    "http://localhost:8000",
    "http://localhost:3000",
  ];

  // Always set CORS headers
  if (!origin || ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  } else if (origin) {
    // Fallback: allow the requesting origin if not blocked
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader(
    "Access-Control-Expose-Headers",
    "X-RateLimit-Remaining, X-RateLimit-Tier, X-RateLimit-Limit",
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!GEMINI_KEY)
    return res.status(500).json({ error: "GEMINI_API_KEY not configured" });

  const sql = DATABASE_URL ? neon(DATABASE_URL) : null;

  try {
    // 1. Validate input
    const validationError = validateInput(req.body);
    if (validationError)
      return res.status(400).json({ error: validationError });

    // 2. Auth + rate limit check
    const clientIP = getClientIP(req);
    const user = verifyToken(req.headers.authorization);
    const { allowed, remaining, tier, count } = await checkRateLimit(
      sql,
      clientIP,
      user,
    );

    const limitDisplay =
      TIER_LIMITS[tier] === Infinity ? "unlimited" : TIER_LIMITS[tier];
    res.setHeader("X-RateLimit-Limit", limitDisplay);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Tier", tier);

    if (!allowed) {
      return res.status(429).json({
        error: `Daily limit reached (${TIER_LIMITS[tier]} requests/day for ${tier} tier). Login or upgrade for more.`,
        retry_after: "tomorrow",
        tier,
      });
    }

    const { contents, session_id, user_email } = req.body;
    const userMsg = contents[contents.length - 1].parts[0].text;
    const skillName = detectSkill(userMsg);

    // 3a. Fetch live nisab rates for zakat-advisor
    let liveNisabBlock = "";
    if (skillName === "zakat-advisor") {
      try {
        const host = req.headers.host || "localhost:8000";
        const protocol =
          host.includes("localhost") || host.includes("127.0.0.1")
            ? "http"
            : "https";
        const ratesRes = await fetch(`${protocol}://${host}/api/rates`, {
          signal: AbortSignal.timeout(2500),
        });
        if (ratesRes.ok) {
          const rates = await ratesRes.json();
          liveNisabBlock = `\n\n---\n\n## LIVE NISAB VALUES (fetched ${rates.updated})\nUse THESE live values for all nisab calculations instead of any hardcoded figures:\n- Gold Nisab (87.48g): PKR ${rates.nisab_gold_pkr}\n- Silver Nisab (612.36g): PKR ${rates.nisab_silver_pkr}\n- Gold per tola: PKR ${rates.gold_pkr_per_tola}\n- Silver per tola: PKR ${rates.silver_pkr_per_tola}\n- Source: ${rates.source}`;
        }
      } catch (err) {
        console.error("Live nisab rates fetch failed:", err.message);
      }
    }

    // 3b. Build system prompt server-side
    const systemPrompt = buildSystemPrompt(userMsg) + liveNisabBlock;

    // 4. Save to DB
    if (sql && session_id) {
      await sql`
        INSERT INTO sessions (id, user_email) VALUES (${session_id}, ${user_email || null})
        ON CONFLICT (id) DO UPDATE SET updated_at = NOW(), user_email = ${user_email || null}
      `;
      await sql`
        INSERT INTO messages (session_id, role, content)
        VALUES (${session_id}, 'user', ${userMsg})
      `;
      await sql`
        INSERT INTO queries_log (session_id, query_text, skill_used)
        VALUES (${session_id}, ${userMsg}, ${skillName})
      `;
    }

    // 5. Call Gemini
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_KEY,
        },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
        }),
        signal: AbortSignal.timeout(25000),
      },
    );

    if (!geminiRes.ok) {
      const geminiErr = await geminiRes.json().catch(() => ({}));
      const errMsg =
        geminiErr?.error?.message ||
        geminiErr?.error ||
        "AI service waqti tor par band hai. Thodi der baad dobara try karein.";
      console.error("Gemini API error:", geminiRes.status, errMsg);
      return res.status(503).json({ error: errMsg, fallback: true });
    }

    const data = await geminiRes.json();

    // 5b. Increment rate limit ONLY after successful Gemini response
    await incrementRateLimit(sql, clientIP, user);

    // Update remaining count for response header (after increment)
    const newCount = (count ?? 0) + 1;
    const newRemaining =
      TIER_LIMITS[tier] === Infinity
        ? "unlimited"
        : Math.max(0, TIER_LIMITS[tier] - newCount);
    res.setHeader("X-RateLimit-Remaining", newRemaining);

    // 6. Save bot reply + shariah audit log
    const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (sql && session_id && botReply) {
      await sql`
        INSERT INTO messages (session_id, role, content)
        VALUES (${session_id}, 'model', ${botReply})
      `;

      // Shariah audit log — compliance queries track karo
      const complianceKeywords = [
        "halal",
        "haram",
        "riba",
        "gharar",
        "permissible",
        "jaiz",
        "shariah",
        "sharīʿah",
        "maysir",
        "prohibited",
      ];
      const isComplianceQuery = complianceKeywords.some((k) =>
        userMsg.toLowerCase().includes(k),
      );
      if (isComplianceQuery) {
        try {
          await sql`
            INSERT INTO shariah_audit_log (user_email, session_id, query_type, input_data, output_summary, disclaimer_shown)
            VALUES (
              ${user_email || null},
              ${session_id},
              ${skillName},
              ${JSON.stringify({ query: userMsg.substring(0, 500) })},
              ${botReply.substring(0, 300)},
              true
            )
          `;
        } catch (auditErr) {
          // Audit log fail hone se main response block na ho
          console.error("Audit log error:", auditErr.message);
        }
      }
    }

    return res.status(geminiRes.status).json(data);
  } catch (err) {
    console.error("API error:", err.message);

    // Graceful fallback — user ko helpful message milta hai
    const isGeminiDown =
      err.message?.includes("fetch") || err.message?.includes("network");
    return res.status(500).json({
      error: isGeminiDown
        ? "AI service waqti tor par band hai. Thodi der baad dobara try karein. Urgent sawaal ke liye apne bank se seedha rabta karein."
        : err.message,
      fallback: true,
    });
  }
}
