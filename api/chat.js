import { neon } from "@neondatabase/serverless";
import jwt from "jsonwebtoken";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { buildCalculationBlock } from "./calculate.js";
import { sanitizeForLog } from "./lib/pii-encryption.js";
import { setCors } from "./lib/cors.js";

// ---- Load files from disk (server-side only, with caching) ----
const _fileCache = new Map();
function loadFile(relativePath) {
  if (_fileCache.has(relativePath)) return _fileCache.get(relativePath);
  try {
    const fullPath = join(process.cwd(), relativePath);
    if (existsSync(fullPath)) {
      const content = readFileSync(fullPath, "utf-8");
      _fileCache.set(relativePath, content);
      return content;
    }
    _fileCache.set(relativePath, "");
    return "";
  } catch (err) {
    console.error(`File load error: ${relativePath}`, err.message);
    _fileCache.set(relativePath, "");
    return "";
  }
}

// ---- Skill Auto-Router ----
// Returns array of matched skills (most specific first)
// ORDER MATTERS: More specific skills match BEFORE generic ones
function detectSkills(userMessage) {
  const msg = userMessage.toLowerCase();
  const skills = [];

  // 1. Murabaha (FAS 2)
  if (
    msg.includes("murabaha") ||
    msg.includes("مرابحة") ||
    msg.includes("car loan") ||
    msg.includes("ghar ka qarz") ||
    msg.includes("cost-plus") ||
    msg.includes("commodity financ")
  )
    skills.push("murabaha-specialist");

  // 2. Zakat (FAS 9)
  if (
    msg.includes("zakat") ||
    msg.includes("zakaat") ||
    msg.includes("زکات") ||
    msg.includes("nisab") ||
    msg.includes("نصاب") ||
    msg.includes("tithe")
  )
    skills.push("zakat-advisor");

  // 3. Ijara (FAS 8/32)
  if (
    msg.includes("ijara") ||
    msg.includes("ijarah") ||
    msg.includes("إجارة") ||
    msg.includes("lease") ||
    msg.includes("kiraya") ||
    msg.includes("rent-to-own")
  )
    skills.push("ijara-specialist");

  // 4. Salam (FAS 7)
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
    skills.push("salam-specialist");

  // 5. Istisna'a (FAS 10)
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
    skills.push("istisna-a-specialist");

  // 6. Sukuk Issuer (FAS 33/34)
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
    skills.push("sukuk-issuer");

  // 7. Sukuk Investor (FAS 25)
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
    skills.push("sukuk-investor");

  // 8. Takaful IFRS 17
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
    skills.push("takaful-ifrs17");

  // 9. Musharakah Full (FAS 4)
  if (
    msg.includes("full musharakah") ||
    msg.includes("permanent musharakah") ||
    msg.includes("running musharakah") ||
    msg.includes("sme partnership") ||
    msg.includes("working capital musharakah") ||
    msg.includes("musharakah joint venture")
  )
    skills.push("musharaka-full");

  // 10. Musharakah/Mudarabah (FAS 3/4)
  if (
    msg.includes("musharakah") ||
    msg.includes("mudarabah") ||
    msg.includes("مشاركة") ||
    msg.includes("مضاربة") ||
    msg.includes("partnership") ||
    msg.includes("profit shar") ||
    msg.includes("shirkat")
  )
    skills.push("musharakah-mudarabah-specialist");

  // 11. Sukuk/Takaful (Generic)
  if (
    msg.includes("sukuk") ||
    msg.includes("takaful") ||
    msg.includes("صكوك") ||
    msg.includes("تكافل") ||
    msg.includes("islamic insurance") ||
    msg.includes("halal insurance") ||
    msg.includes("islamic bond")
  )
    skills.push("sukuk-takaful-specialist");

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
    skills.push("shariah-compliance-checker");

  // 13b. Roshan Digital Account
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
    skills.push("roshan-digital-advisor");

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
    skills.push("pakistan-banking-navigator");

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
    skills.push("halal-calculator");

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
    skills.push("islamic-product-explainer");

  // Fallback: if no skill matched, use generic advisor
  if (skills.length === 0) skills.push("islamic-banking-advisor");

  return skills;
}

// Backward-compatible: return primary (first) skill
function detectSkill(userMessage) {
  return detectSkills(userMessage)[0];
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
  const skillNames = detectSkills(userMessage);
  const skillContents = skillNames
    .map((s) => loadFile(`skills/${s}/SKILL.md`))
    .filter(Boolean);
  const primarySkill = skillNames[0];

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
    "## Active Product Skill(s): " + skillNames.join(", "),
    skillContents.join("\n\n---\n\n"),
    "---",
    "## Core References",
    "### Shariah Rules",
    shariahRules,
    "### Nisab & Zakat Values",
    nisabTable,
    "### Calculation Formulas",
    calculations,
    extraRefs,
    "\n\n---\n\n## MANDATORY: Data Freshness & Timestamps\n**EVERY response that references rates, prices, or financial data MUST include:**\n1. **Date stamp:** '📅 Data as of: [exact date]'\n2. **Source:** Where the data came from\n3. **Reliability label:** '🔴 Live (fetched just now)' OR '⚪ Estimated (verify with current rates)'\n4. **Staleness warning:** If reference files are >30 days old, add: '⚠️ This data is from [month year] and may be outdated. Please verify current rates with your bank or the live rates endpoint (/api/rates).'\n5. **Verification reminder:** '⚠️ Verify current terms with your bank directly'\n\n**Example format:**\n'📅 Gold Nisab as of July 5, 2026 | Source: goldapi.io | 🔴 Live'\n'⚠️ Bank profit rates from reference file (May 2026) — rates may have changed. Verify with bank directly.'\n\nDo NOT present outdated reference data as current without this disclaimer.\n\n**Freshness Rules:**\n- Gold/Silver rates: Use LIVE data from /api/rates endpoint, NOT reference files\n- Bank profit rates: Reference files are estimates — always add staleness warning\n- Nisab values: Calculate from LIVE gold/silver prices, NOT hardcoded values\n- Shariah rules: These are permanent (never change) — no freshness warning needed",
  ]
    .filter(Boolean)
    .join("\n\n");
}

// ---- Input Validation ----
function validateInput(body) {
  let { contents } = body;
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

      // Toxicity detection — block abusive/offensive content
      const toxicityPatterns = [
        /\b(bakwas|bkl|mc|bc|gandi|gali|chutyapa|chutia|harami|kamine|randi|saala|behenchod|madarchod)\b/i,
        /\b(fuck|shit|damn|ass|bitch|crap|dick)\b/i,
        /[\u0600-\u06FF]\s*(گالی|گندی|بکواس|ہرامی|کمینہ|سالا)\b/i,
      ];
      if (toxicityPatterns.some((p) => p.test(part.text)))
        return "Message contains inappropriate language. Please maintain a respectful tone for Islamic banking guidance.";

      // Jailbreak detection — detect attempts to bypass safety rules
      const jailbreakPatterns = [
        /pretend\s+(you\s+are|to\s+be)\s+(a|an)\s+(hacker|cracker|evil|unrestricted)/i,
        /do\s+anything\s+now/i,
        /no\s+(more\s+)?rules/i,
        /bypass\s+(all\s+)?(filters|rules|safety|restrictions)/i,
        / DAN\s+mode/i,
        /developer\s+mode/i,
        /jailbreak/i,
        /unfiltered\s+AI/i,
        /no\s+censorship/i,
        /DAN\s*:\s*Hi/i,
        /ignore\s+all\s+previous/i,
        /you\s+are\s+now\s+DAN/i,
        /switch\s+to\s+(evil|unrestricted|hacking)/i,
        // Roman Urdu jailbreak attempts
        /ab\s+tum\s+(azad\s+ho|kuch\s+bhi\s+kar\s+sakte\s+ho)/i,
        /tumhare\s+upar\s+koi\s+rule\s+nahi/i,
        /sari\s+rules\s+bhool\s+jao/i,
      ];
      if (jailbreakPatterns.some((p) => p.test(part.text)))
        return "I'm designed to provide Islamic banking guidance within my scope. I cannot bypass my safety guidelines. How can I help you with Islamic finance questions?";

      // PII detection — detect sensitive personal information
      const piiPatterns = [
        { pattern: /\b\d{5}-?\d{7}-?\d\b/g, type: "CNIC" },  // Pakistani CNIC
        { pattern: /\b\d{4}-?\d{4}-?\d{4}\b/g, type: "Account Number" },  // Bank account
        { pattern: /\b\d{16}\b/g, type: "Card Number" },  // Credit/Debit card
        { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, type: "Email" },
      ];
      const detectedPII = [];
      for (const { pattern, type } of piiPatterns) {
        if (pattern.test(part.text)) {
          detectedPII.push(type);
        }
      }
      if (detectedPII.length > 0) {
        // Don't block — just warn. User might intentionally share for calculation.
        // The system will not store PII in logs (chat.js already truncates).
        console.warn(`PII detected in query: ${detectedPII.join(", ")}`);
      }
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
function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  for (const pair of cookieHeader.split(';')) {
    const [k, ...v] = pair.split('=');
    cookies[k.trim()] = v.join('=').trim();
  }
  return cookies;
}

function verifyToken(authHeader, cookieHeader) {
  let token = null;
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  } else {
    const cookies = parseCookies(cookieHeader);
    token = cookies['ibf_token'] || null;
  }
  if (!token) return null;
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) return null;
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// ---- Rate Limiting (tiered, atomic) ----
// Atomically increment and check — eliminates TOCTOU race condition
async function checkAndIncrementRateLimit(sql, ip, user) {
  const tier = user?.tier || "anonymous";
  const limit = TIER_LIMITS[tier];

  if (limit === Infinity)
    return { allowed: true, remaining: "unlimited", tier, count: 0 };

  // Authenticated user: track by user_id in users table
  if (user && sql) {
    try {
      const today = new Date().toISOString().split("T")[0];
      // Reset counter if date changed, then atomically increment
      await sql`
        UPDATE users SET queries_today = 0, queries_date = ${today}
        WHERE id = ${user.userId} AND queries_date < ${today}::date
      `;
      const rows = await sql`
        UPDATE users SET queries_today = queries_today + 1
        WHERE id = ${user.userId}
        RETURNING queries_today
      `;
      const count = rows[0]?.queries_today ?? 0;
      if (count > limit) {
        // Rollback: decrement
        await sql`
          UPDATE users SET queries_today = queries_today - 1
          WHERE id = ${user.userId}
        `;
        return { allowed: false, remaining: 0, tier, count: count - 1 };
      }
      const remaining = Math.max(0, limit - count);
      return { allowed: true, remaining, tier, count };
    } catch (err) {
      console.error("User rate limit error:", err.message);
      return { allowed: true, remaining: limit, tier, count: 0 };
    }
  }

  // Anonymous: track by IP
  if (!sql) return { allowed: true, remaining: 5, tier, count: 0 };
  try {
    // Atomic insert-or-increment
    const rows = await sql`
      INSERT INTO rate_limits (ip, req_date, req_count)
      VALUES (${ip}, CURRENT_DATE, 1)
      ON CONFLICT (ip, req_date)
      DO UPDATE SET req_count = rate_limits.req_count + 1
      RETURNING req_count
    `;
    const count = rows[0]?.req_count ?? 1;
    if (count > limit) {
      // Rollback: decrement
      await sql`
        UPDATE rate_limits SET req_count = req_count - 1
        WHERE ip = ${ip} AND req_date = CURRENT_DATE
      `;
      return { allowed: false, remaining: 0, tier, count: count - 1 };
    }
    const remaining = Math.max(0, limit - count);
    return { allowed: true, remaining, tier, count };
  } catch (err) {
    console.error("Rate limit error:", err.message);
    return { allowed: true, remaining: 5, tier, count: 0 };
  }
}

// ---- Decrement Rate Limit (rollback on Gemini failure) ----
async function decrementRateLimit(sql, ip, user) {
  try {
    if (!sql) return;
    if (user && user.userId) {
      await sql`
        UPDATE users SET queries_today = queries_today - 1
        WHERE id = ${user.userId} AND queries_today > 0
      `;
      return;
    }
    await sql`
      UPDATE rate_limits SET req_count = req_count - 1
      WHERE ip = ${ip} AND req_date = CURRENT_DATE AND req_count > 0
    `;
  } catch (err) {
    console.error("Rate limit decrement error:", err.message);
  }
}

// ---- Get Client IP ----
function getClientIP(req) {
  const vercelForwarded = req.headers["x-vercel-forwarded-for"];
  if (vercelForwarded) return vercelForwarded.split(",")[0].trim();
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

// ---- Main Handler ----
export default async function handler(req, res) {
  setCors(req, res, "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Expose-Headers",
    "X-RateLimit-Remaining, X-RateLimit-Tier, X-RateLimit-Limit",
  );

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
    let user = verifyToken(req.headers.authorization, req.headers.cookie);

    // Fetch actual tier from DB (JWT tier may be stale after upgrade)
    if (user && sql) {
      try {
        const dbUser = await sql`
          SELECT id, email, tier FROM users WHERE id = ${user.userId}
        `;
        if (dbUser.length > 0) {
          user = { ...user, tier: dbUser[0].tier, userId: dbUser[0].id, email: dbUser[0].email };
        }
      } catch (err) {
        console.error("Fetch user tier error:", err.message);
      }
    }

    const { allowed, remaining, tier, count } = await checkAndIncrementRateLimit(
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
      // Owner alert — notify when rate limits are hit
      const ALERT_WEBHOOK = process.env.ALERT_WEBHOOK_URL;
      if (ALERT_WEBHOOK) {
        try {
          await fetch(ALERT_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: `⚠️ Islamic Banking FTE: Rate limit hit!\nTier: ${tier}\nIP: ${clientIP}\nTime: ${new Date().toISOString()}`,
            }),
            signal: AbortSignal.timeout(3000),
          });
        } catch {
          // Alert failure shouldn't block the response
        }
      }

      return res.status(429).json({
        error: `Daily limit reached (${TIER_LIMITS[tier]} requests/day for ${tier} tier). Login or upgrade for more.`,
        retry_after: "tomorrow",
        tier,
      });
    }

    // Warning alert — notify when approaching limit (80% threshold)
    if (count && TIER_LIMITS[tier] !== Infinity) {
      const threshold = TIER_LIMITS[tier] * 0.8;
      if (count >= threshold && count < TIER_LIMITS[tier]) {
        const ALERT_WEBHOOK = process.env.ALERT_WEBHOOK_URL;
        if (ALERT_WEBHOOK && !globalThis._alertSent?.[tier]) {
          try {
            await fetch(ALERT_WEBHOOK, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: `🟡 Islamic Banking FTE: Approaching rate limit!\nTier: ${tier}\nUsage: ${count}/${TIER_LIMITS[tier]} (${Math.round(count/TIER_LIMITS[tier]*100)}%)\nTime: ${new Date().toISOString()}`,
              }),
              signal: AbortSignal.timeout(3000),
            });
            globalThis._alertSent = globalThis._alertSent || {};
            globalThis._alertSent[tier] = true;
            // Reset alert flag after 1 hour
            setTimeout(() => { delete globalThis._alertSent?.[tier]; }, 3600000);
          } catch {
            // Alert failure shouldn't block the response
          }
        }
      }
    }

    const { contents, session_id, user_email } = req.body;
    const userMsg = contents[contents.length - 1].parts[0].text;

    // ─── TIER 0: PRE-PROCESSING HOOKS ─────────────────────────────────────────
    // These run BEFORE the LLM processes the query.
    // Purpose: Block dangerous/out-of-scope queries deterministically.

    // Hook 1: Fatwa Request Blocking
    const FATWA_PATTERNS = [
      /give\s+me\s+a\s+fatwa/i,
      /issue\s+a\s+fatwa/i,
      /what\s+is\s+the\s+fatwa/i,
      /fatwa\s+on/i,
      /fatawa\s+den/i,
      /فتویٰ\s+دیں/i,
      /فتویٰ\s+کیا\s+ہے/i,
      /حکم\s+دیں/i,
      /hukm\s+den/i,
      /binding\s+ruling/i,
      /final\s+ruling/i,
      /definitive\s+ruling/i,
      /is\s+it\s+halal\s+or\s+haram.*definitive/i,
      /کیا\s+یہ\s+حلال\s+ہے.*قطعی/i,
    ];
    const isFatwaRequest = FATWA_PATTERNS.some((p) => p.test(userMsg));

    if (isFatwaRequest) {
      const hasUrduScript = /[\u0600-\u06FF]/.test(userMsg);
      const blockedResponseEN =
        "I understand you're seeking a definitive ruling, but I'm not qualified to issue Fatwas or binding religious rulings.\n\n" +
        "**What I can do:**\n" +
        "- Explain the general Shariah principles around this topic\n" +
        "- Share what major scholars and Islamic finance standards (AAOIFI, etc.) say\n" +
        "- Help you understand the different scholarly opinions\n\n" +
        "**What you should do:**\n" +
        "- Contact your local Mufti or Shariah scholar\n" +
        "- Consult your bank's Shariah Advisory Board\n" +
        "- Reach out to recognized Islamic finance institutions\n\n" +
        "Would you like me to explain the general principles around this topic instead?\n\n" +
        "---\n\n*⚠️ Shariah Disclaimer: This information is for educational and guidance purposes only. It does not constitute a formal Fatwa or binding Shariah ruling. Please consult your bank's Shariah Advisor or a qualified Islamic scholar before making financial decisions.*";
      const blockedResponseUR =
        "Main samajhta hoon ke aap ek definitive ruling chahte hain, lekin main Fatwas ya binding religious rulings dene ke liye qualified nahi hoon.\n\n" +
        "**Main kya kar sakta hoon:**\n" +
        "- Is topic ke uth'la Shari'eh usool explain kar sakta hoon\n" +
        "- Bade scholars aur Islamic finance standards (AAOIFI) kya kehte hain wo bata sakta hoon\n" +
        "- Mukhtalif scholarly opinions samjhane mein madad kar sakta hoon\n\n" +
        "**Aapko kya karna chahiye:**\n" +
        "- Apne local Mufti ya Shariah scholar se rabta karein\n" +
        "- Apne bank ke Shariah Advisory Board se consult karein\n" +
        "- Maqbool Islamic finance institutions se raabta karein\n\n" +
        "Kya aap is topic ke uth'la usool explain karwana chahte hain?\n\n" +
        "---\n\n*⚠️ شرعی نوٹ: یہ معلومات صرف رہنمائی کے لیے ہیں۔ کوئی بھی مالی فیصلہ کرنے سے پہلے اپنے بینک کے شریعہ ایڈوائزر یا کسی مستند عالم دین سے مشورہ ضرور لیں۔*";

      return res.status(200).json({
        candidates: [{ content: { parts: [{ text: hasUrduScript ? blockedResponseUR : blockedResponseEN }] } }],
        blocked: true,
        block_reason: "fatwa_request",
      });
    }

    // Hook 2: Scope Enforcement — Block out-of-scope queries
    const SCOPE_RULES = [
      {
        patterns: [
          /which\s+stock\s+(should|to)\s+(i|we)\s+buy/i,
          /stock\s+tip/i,
          /give\s+me\s+stock/i,
          /specific\s+stock\s+recommendation/i,
          /mujhe\s+stock\s+batao/i,
        ],
        redirectEN: "I can help you understand Shariah-compliant investment principles and screen stocks for compliance, but I cannot provide specific stock recommendations. Would you like to learn about Shariah screening criteria instead?",
        redirectUR: "Main aapko Shariah-compliant investment ke usool samjha sakta hoon aur stocks ko compliance ke liye screen kar sakta hoon, lekin main specific stock recommendations nahi de sakta. Kya aap Shariah screening criteria ke baare mein jaanna chahte hain?",
      },
      {
        patterns: [
          /financial\s+plan.*for\s+me/i,
          /how\s+should\s+i\s+invest\s+my\s+money/i,
          /mera\s+paisa\s+kahan\s+lagayein/i,
          /investment\s+plan\s+banao/i,
        ],
        redirectEN: "I can explain Islamic financial products and their structures, but comprehensive financial planning requires a certified Islamic financial advisor who can assess your complete situation. Would you like to learn about available Islamic investment options?",
        redirectUR: "Main aapko Islamic financial products aur unki structure samjha sakta hoon, lekin mukammal financial planning ke liye ek certified Islamic financial advisor zaroori hai jo aapki poori situation assess kar sake. Kya aap available Islamic investment options ke baare mein jaanna chahte hain?",
      },
      {
        patterns: [
          /legal\s+advice/i,
          /can\s+i\s+sue/i,
          /court\s+case/i,
          /muqadma/i,
          /kanooni\s+raay/i,
          /legal\s+opinion/i,
        ],
        redirectEN: "I cannot provide legal advice. For legal matters related to Islamic banking, please consult a lawyer specializing in Islamic finance law.",
        redirectUR: "Main kanooni raay nahi de sakta. Islamic banking se mutaliq qanooni mamlay ke liye, barah-e-karam Islamic finance law mein mahir wakeel se raabta karein.",
      },
      {
        patterns: [
          /christian\s+finance/i,
          /jewish\s+banking/i,
          /hindu\s+loan/i,
          /riba\s+in\s+other\s+religions/i,
        ],
        redirectEN: "My expertise is specifically in Islamic finance and banking. For questions about other religious financial systems, I'd recommend consulting resources specific to those traditions.",
        redirectUR: "Meri expertise khaas tor par Islamic finance aur banking mein hai. Deen'i mali nizamon ke baare mein, un khasusi zariyon se raabta karein.",
      },
    ];

    for (const rule of SCOPE_RULES) {
      if (rule.patterns.some((p) => p.test(userMsg))) {
        const hasUrduScript = /[\u0600-\u06FF]/.test(userMsg);
        const redirect = hasUrduScript ? rule.redirectUR : rule.redirectEN;
        return res.status(200).json({
          candidates: [{ content: { parts: [{ text: redirect }] } }],
          blocked: true,
          block_reason: "scope_enforcement",
        });
      }
    }

    // Hook 3: Human Escalation Detection
    // Detect queries that need human Shariah advisor involvement
    const ESCALATION_TRIGGERS = {
      highAmount: /(?:Rs\.?|PKR|rupees)\s*([\d,]+)\s*(?:lakh|lac|crore|million)/i,
      keywords: [
        /fatwa/i, /fatawa/i, /legal\s+advice/i, /court\s+case/i,
        /dispute/i, /complaint/i, /fraud/i, /cheating/i,
        /binding/i, /final\s+ruling/i, /definitive/i,
        /فتویٰ/, /کانونی/, /مقدمہ/, /تکلیف/, /دھوکہ/,
      ],
      complexQuery: [
        /joint\s+business/i, /partnership\s+structure/i,
        /business\s+structure.*compliant/i,
        /multiple\s+banks/i, /cross.?border/i,
        /tax\s+implication/i, /zakat\s+on\s+business/i,
        /مشترکہ\s+کاروبار/, /شراکت/, /ٹیکس/,
      ],
    };

    let escalationNeeded = false;
    let escalationReason = "";

    // Check for high amounts (> 10 lakh)
    const amountMatch = userMsg.match(ESCALATION_TRIGGERS.highAmount);
    if (amountMatch) {
      const amountStr = amountMatch[1].replace(/,/g, "");
      const amount = parseInt(amountStr);
      let multiplier = 1;
      if (userMsg.match(/lakh|lac/i)) multiplier = 100000;
      else if (userMsg.match(/crore/i)) multiplier = 10000000;
      else if (userMsg.match(/million/i)) multiplier = 1000000;

      if (amount * multiplier > 1000000) {
        // > 10 lakh
        escalationNeeded = true;
        escalationReason = `High-value query (Rs. ${(amount * multiplier).toLocaleString()})`;
      }
    }

    // Check for escalation keywords
    if (!escalationNeeded) {
      for (const pattern of ESCALATION_TRIGGERS.keywords) {
        if (pattern.test(userMsg)) {
          escalationNeeded = true;
          escalationReason = "Requires qualified Shariah advisor review";
          break;
        }
      }
    }

    // Check for complex queries
    if (!escalationNeeded) {
      for (const pattern of ESCALATION_TRIGGERS.complexQuery) {
        if (pattern.test(userMsg)) {
          escalationNeeded = true;
          escalationReason = "Complex query requiring expert analysis";
          break;
        }
      }
    }

    const skillName = detectSkills(userMsg)[0];

    // Pre-declare session history and user profile blocks (used in system prompt build)
    let sessionHistoryBlock = "";
    let userProfileBlock = "";

    // 3a. Fetch live nisab rates for zakat-advisor
    let liveNisabBlock = "";
    let liveNisab = null;
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
          liveNisab = rates;
          const reliabilityLabel = '⚪ Estimated';
          liveNisabBlock = `\n\n---\n\n## LIVE NISAB VALUES\n📅 Fetched: ${new Date(rates.lastUpdated).toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })}\n\n| Metal | Nisab | Rate | Reliability |\n|-------|-------|------|-------------|\n| Gold (87.48g) | PKR ${rates.nisab.gold.toLocaleString()} | ${rates.gold.pkrsPerTola.toLocaleString()}/tola | ${reliabilityLabel} |\n| Silver (612.36g) | PKR ${rates.nisab.silver.toLocaleString()} | ${rates.silver.pkrsPerTola.toLocaleString()}/tola | ⚪ Estimated |\n\n⚠️ **Note:** Gold/Silver rates are estimated — verify with current market rates before making Zakat decisions\n\nUse THESE live values for all nisab calculations instead of any hardcoded figures.`;
        }
      } catch (err) {
        console.error("Live nisab rates fetch failed:", err.message);
      }
    }

    // 3b. Server-side pre-computed calculations (deterministic, not LLM)
    const calcBlock = buildCalculationBlock(userMsg, liveNisab);

    // 3c. Build system prompt server-side
    const systemPrompt = buildSystemPrompt(userMsg) + liveNisabBlock + calcBlock + sessionHistoryBlock + userProfileBlock;

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
        VALUES (${session_id}, ${sanitizeForLog(userMsg)}, ${skillName})
      `;
    }

    // 4b. Session Memory — Load last 5 messages for conversation continuity
    if (sql && session_id) {
      try {
        const recentMessages = await sql`
          SELECT role, content FROM messages
          WHERE session_id = ${session_id}
          ORDER BY created_at DESC
          LIMIT 10
        `;
        if (recentMessages.length > 1) {
          // Reverse to get chronological order (oldest first)
          const history = recentMessages.reverse();
          sessionHistoryBlock = "\n\n---\n\n## CONVERSATION HISTORY (this session)\nThe user has asked these questions before in this session. Use this context for continuity:\n";
          for (const msg of history) {
            const role = msg.role === "user" ? "User" : "Assistant";
            sessionHistoryBlock += `\n${role}: ${msg.content.substring(0, 200)}${msg.content.length > 200 ? "..." : ""}`;
          }
          sessionHistoryBlock += "\n\nUse this history to provide contextual, continuous responses. Don't repeat information already given.";
        }
      } catch (err) {
        console.error("Session memory load error:", err.message);
      }
    }

    // 4c. User Profile — Extract preferences and load profile
    if (sql && user?.userId) {
      try {
        // Load existing profile
        const profileRows = await sql`
          SELECT * FROM user_profiles WHERE user_id = ${user.userId}
        `;
        const profile = profileRows[0];

        // Detect language preference from current query
        const hasUrduScript = /[\u0600-\u06FF]/.test(userMsg);
        const hasRomanUrdu = /\b(hai|hain|kya|kaise|bataiye|samjhao|kitna|mera|meri)\b/i.test(userMsg);
        let detectedLang = "en";
        if (hasUrduScript) detectedLang = "ur";
        else if (hasRomanUrdu) detectedLang = "roman_ur";

        // Detect jurisdiction
        const detectedJurisdiction = detectJurisdiction(userMsg);

        // Detect interests (which products user asked about)
        const interestKeywords = {
          murabaha: ["murabaha", "car loan", "ghar ka qarz"],
          ijara: ["ijara", "ijarah", "lease", "kiraya"],
          zakat: ["zakat", "zakaat", "nisab"],
          sukuk: ["sukuk", "bond", "investment"],
          takaful: ["takaful", "insurance", "taameen"],
          musharakah: ["musharakah", "musharaka", "partnership"],
        };
        const newInterests = [];
        for (const [product, keywords] of Object.entries(interestKeywords)) {
          if (keywords.some((k) => userMsg.toLowerCase().includes(k))) {
            newInterests.push(product);
          }
        }

        // Update or create profile
        if (profile) {
          // Merge interests
          const existingInterests = profile.interests || [];
          const mergedInterests = [...new Set([...existingInterests, ...newInterests])];

          await sql`
            UPDATE user_profiles SET
              preferred_lang = ${detectedLang},
              jurisdiction = ${detectedJurisdiction},
              interests = ${mergedInterests},
              last_query_date = NOW(),
              query_count = query_count + 1,
              updated_at = NOW()
            WHERE user_id = ${user.userId}
          `;
        } else {
          await sql`
            INSERT INTO user_profiles (user_id, preferred_lang, jurisdiction, interests, last_query_date, query_count)
            VALUES (${user.userId}, ${detectedLang}, ${detectedJurisdiction}, ${newInterests}, NOW(), 1)
          `;
        }

        // Build profile block for system prompt
        const langLabel = detectedLang === "ur" ? "Urdu (script)" : detectedLang === "roman_ur" ? "Roman Urdu" : "English";
        userProfileBlock = `\n\n---\n\n## USER PROFILE\n- Preferred Language: ${langLabel}\n- Jurisdiction: ${detectedJurisdiction.toUpperCase()}\n- Previous Interests: ${profile?.interests?.join(", ") || "None yet"}\n- Total Queries: ${(profile?.query_count || 0) + 1}\n\nRespond in the user's preferred language. Use their jurisdiction for rate references.`;
      } catch (err) {
        console.error("User profile error:", err.message);
      }
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
        signal: AbortSignal.timeout(8000),
      },
    );

    if (!geminiRes.ok) {
      const geminiErr = await geminiRes.json().catch(() => ({}));
      const rawErrMsg = geminiErr?.error?.message || geminiErr?.error || "";

      // Rate limit handling — rollback count and return friendly message
      if (geminiRes.status === 429 || rawErrMsg.includes("quota") || rawErrMsg.includes("rate")) {
        console.error("Gemini rate limit hit:", rawErrMsg);
        await decrementRateLimit(sql, clientIP, user);
        return res.status(429).json({
          error: "AI service abhi busy hai (daily limit ke qareeb). Thodi der baad dobara try karein. Agar urgent sawaal hai toh apne bank ke Islamic banking section se seedha rabta karein.",
          error_en: "AI service is temporarily busy (approaching daily limit). Please try again in a few minutes. For urgent queries, contact your bank's Islamic banking section directly.",
          retry_after: 300,
          fallback: true,
        });
      }

      // Other Gemini errors — rollback count
      const errMsg = rawErrMsg || "AI service waqti tor par band hai. Thodi der baad dobara try karein.";
      console.error("Gemini API error:", geminiRes.status, errMsg);
      await decrementRateLimit(sql, clientIP, user);
      return res.status(503).json({ error: errMsg, fallback: true });
    }

    const data = await geminiRes.json();

    // 5b. Rate limit already incremented atomically — update remaining for response header

    // Update remaining count for response header (after increment)
    const newCount = (count ?? 0) + 1;
    const newRemaining =
      TIER_LIMITS[tier] === Infinity
        ? "unlimited"
        : Math.max(0, TIER_LIMITS[tier] - newCount);
    res.setHeader("X-RateLimit-Remaining", newRemaining);

    // 6. Save bot reply + shariah audit log
    let botReply = data.candidates?.[0]?.content?.parts?.[0]?.text;

    // 6b. Shariah disclaimer enforcement — financial responses mein disclaimer mandatory hai
    if (botReply) {
      const financialSkills = [
        "murabaha-specialist", "ijara-specialist", "salam-specialist",
        "istisna-a-specialist", "sukuk-issuer", "sukuk-investor",
        "takaful-ifrs17", "musharaka-full", "musharakah-mudarabah-specialist",
        "sukuk-takaful-specialist", "zakat-advisor", "shariah-compliance-checker",
        "halal-calculator", "pakistan-banking-navigator",
      ];
      const isFinancialQuery = financialSkills.includes(skillName);

      if (isFinancialQuery) {
        const disclaimerPatterns = [
          /shariah\s+disclaimer/i,
          /شریعہ\s+نوٹ/i,
          /educational\s+and\s+guidance\s+purposes/i,
          /binding\s+shariah\s+ruling/i,
          /consult.*shariah\s+advisor/i,
          / مستند\s+عالم\s+دين/i,
        ];
        const hasDisclaimer = disclaimerPatterns.some((p) => p.test(botReply));

        if (!hasDisclaimer) {
          const hasUrduScript = /[\u0600-\u06FF]/.test(botReply);
          const disclaimerEN =
            "\n\n---\n\n*⚠️ Shariah Disclaimer: This information is for educational and guidance purposes only. It does not constitute a formal Fatwa or binding Shariah ruling. Please consult your bank's Shariah Advisor or a qualified Islamic scholar before making financial decisions. Product features and profit rates change — verify current terms with your bank directly.*";
          const disclaimerUR =
            "\n\n---\n\n*⚠️ شرعی نوٹ: یہ معلومات صرف رہنمائی کے لیے ہیں۔ کوئی بھی مالی فیصلہ کرنے سے پہلے اپنے بینک کے شریعہ ایڈوائزر یا کسی مستند عالم دین سے مشورہ ضرور لیں۔*";
          botReply += hasUrduScript ? disclaimerUR : disclaimerEN;
          // Update the Gemini response object so saved message includes disclaimer
          data.candidates[0].content.parts[0].text = botReply;
        }
      }

      // Hook 3: Overclaiming Detection — Flag "100% halal", "guaranteed permissible" etc.
      const OVERCLAIM_PATTERNS = [
        { pattern: /100%\s*(halal|permissible|allowed|jaiz)/gi, replacement: "generally considered halal (subject to scholarly review)" },
        { pattern: /guaranteed\s*(halal|permissible|shariah[\s-]*compliant)/gi, replacement: "widely considered $2 (please verify with your Shariah advisor)" },
        { pattern: /definitely\s*(halal|permissible|allowed)/gi, replacement: "generally considered halal" },
        { pattern: /absolutely\s*(halal|permissible)/gi, replacement: "considered halal by major scholars" },
        { pattern: /قطعاً?\s*(حلال|جائز)/gi, replacement: "عموماً حلال سمجھا جاتا ہے" },
        { pattern: /100%\s*حلال/gi, replacement: "عموماً حلال" },
      ];

      let overclaimFixed = false;
      for (const { pattern, replacement } of OVERCLAIM_PATTERNS) {
        if (pattern.test(botReply)) {
          botReply = botReply.replace(pattern, replacement);
          overclaimFixed = true;
        }
      }
      if (overclaimFixed) {
        data.candidates[0].content.parts[0].text = botReply;
      }

      // Hook 4: Escalation Notice — Add "consult a scholar" notice for complex queries
      if (escalationNeeded && botReply) {
        const hasUrduScript = /[\u0600-\u06FF]/.test(botReply);
        const escalationNoticeEN =
          `\n\n---\n\n*📋 **Important Notice:** ${escalationReason}. This response is for educational guidance only. For a definitive answer on this matter, please consult a qualified Shariah scholar or your bank's Shariah Advisory Board.*`;
        const escalationNoticeUR =
          `\n\n---\n\n*📋 **اہم نوٹ:** ${escalationReason}۔ یہ جواب صرف تعلیمی رہنمائی کے لیے ہے۔ اس معاملے میں یقینی جواب کے لیے براہ کرم کسی مستند شرعی عالم یا اپنے بینک کے شریعہ ایڈوائزری بورڈ سے رجوع کریں۔*`;
        botReply += hasUrduScript ? escalationNoticeUR : escalationNoticeEN;
        data.candidates[0].content.parts[0].text = botReply;
      }
    }

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
          // disclaimer_shown = true only if we actually verified/enforced it
          const hasDisclaimerNow =
            botReply.includes("Shariah Disclaimer") ||
            botReply.includes("شرعی نوٹ");
          await sql`
            INSERT INTO shariah_audit_log (user_email, session_id, query_type, input_data, output_summary, disclaimer_shown)
            VALUES (
              ${user_email || null},
              ${session_id},
              ${skillName},
              ${JSON.stringify({ query: userMsg.substring(0, 500) })},
              ${botReply.substring(0, 300)},
              ${hasDisclaimerNow}
            )
          `;
        } catch (auditErr) {
          // Audit log fail hone se main response block na ho
          console.error("Audit log error:", auditErr.message);
        }
      }
    }

    // 7. Full audit log — har response ka compliance trail
    if (sql && botReply) {
      try {
        const crypto = await import("crypto");
        const responseHash = crypto.createHash("sha256").update(botReply).digest("hex").slice(0, 16);
        const hasDisclaimer =
          botReply.includes("Shariah Disclaimer") ||
          botReply.includes("شرعی نوٹ") ||
          botReply.includes("educational and guidance purposes");

        await sql`
          INSERT INTO full_audit_log (
            session_id, user_email, skill_used, jurisdiction,
            disclaimer_shown, escalation_triggered, response_hash, response_length, created_at
          ) VALUES (
            ${session_id || null},
            ${user_email || null},
            ${skillName},
            ${detectJurisdiction(userMsg)},
            ${hasDisclaimer},
            ${escalationNeeded},
            ${responseHash},
            ${botReply.length},
            NOW()
          )
        `;
      } catch (auditErr) {
        console.error("Full audit log error:", auditErr.message);
      }
    }

    return res.status(geminiRes.status).json(data);
  } catch (err) {
    console.error("API error:", err.message);

    // Graceful fallback — user ko helpful message milta hai
    // Internal error details ko server pe log karo, user ko mat dikhao
    const isGeminiDown =
      err.message?.includes("fetch") || err.message?.includes("network");
    return res.status(500).json({
      error: isGeminiDown
        ? "AI service waqti tor par band hai. Thodi der baad dobara try karein. Urgent sawaal ke liye apne bank se seedha rabta karein."
        : "Internal server error. Please try again later.",
      fallback: true,
    });
  }
}
