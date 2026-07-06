import { neonConfig, neon } from "@neondatabase/serverless";
import ws from "ws";
import crypto from "crypto";

neonConfig.webSocketConstructor = ws;

/**
 * Islamic Banking FTE — Compliance Audit Logger
 * 
 * Every interaction is logged with structured metadata for:
 * - Regulatory compliance
 * - Debugging calculation errors
 * - Proving disclaimer enforcement
 * - Tracking escalation decisions
 */

export class AuditLogger {
  constructor(sql) {
    this.sql = sql;
  }

  /**
   * Log a complete interaction for compliance
   */
  async logInteraction({
    sessionId,
    userEmail,
    query,
    response,
    skillUsed,
    jurisdiction,
    disclaimerPresent,
    disclaimerEnforced,
    escalated,
    escalationReason,
    calculationType,
    calculationResult,
    rateData,
    modelConfidence,
    responseTimeMs,
    hooksApplied,
  }) {
    try {
      // Generate response hash for tamper detection
      const responseHash = crypto
        .createHash("sha256")
        .update(response || "")
        .digest("hex")
        .substring(0, 16);

      await this.sql`
        INSERT INTO compliance_audit_log (
          session_id,
          user_email,
          query_text,
          response_hash,
          skill_used,
          jurisdiction,
          disclaimer_present,
          disclaimer_enforced,
          escalated,
          escalation_reason,
          calculation_type,
          calculation_result,
          rate_data,
          model_confidence,
          response_time_ms,
          hooks_applied,
          created_at
        ) VALUES (
          ${sessionId || null},
          ${userEmail || null},
          ${query?.substring(0, 1000) || null},
          ${responseHash},
          ${skillUsed || null},
          ${jurisdiction || "pakistan"},
          ${disclaimerPresent || false},
          ${disclaimerEnforced || false},
          ${escalated || false},
          ${escalationReason || null},
          ${calculationType || null},
          ${calculationResult ? JSON.stringify(calculationResult) : null},
          ${rateData ? JSON.stringify(rateData) : null},
          ${modelConfidence || null},
          ${responseTimeMs || null},
          ${hooksApplied ? JSON.stringify(hooksApplied) : null},
          NOW()
        )
      `;
    } catch (err) {
      // Audit log failure should never block the main response
      console.error("Audit log error:", err.message);
    }
  }

  /**
   * Log a disclaimer enforcement event
   */
  async logDisclaimerEnforcement({
    sessionId,
    query,
    skillUsed,
    wasPresent,
    wasEnforced,
    language,
  }) {
    try {
      await this.sql`
        INSERT INTO disclaimer_audit (
          session_id,
          query_text,
          skill_used,
          disclaimer_was_present,
          disclaimer_was_enforced,
          language,
          created_at
        ) VALUES (
          ${sessionId || null},
          ${query?.substring(0, 500) || null},
          ${skillUsed || null},
          ${wasPresent},
          ${wasEnforced},
          ${language || "en"},
          NOW()
        )
      `;
    } catch (err) {
      console.error("Disclaimer audit error:", err.message);
    }
  }

  /**
   * Log an escalation event
   */
  async logEscalation({
    sessionId,
    userEmail,
    query,
    reason,
    skillUsed,
    action,
  }) {
    try {
      await this.sql`
        INSERT INTO escalation_log (
          session_id,
          user_email,
          query_text,
          escalation_reason,
          skill_used,
          action_taken,
          created_at
        ) VALUES (
          ${sessionId || null},
          ${userEmail || null},
          ${query?.substring(0, 1000) || null},
          ${reason},
          ${skillUsed || null},
          ${action},
          NOW()
        )
      `;
    } catch (err) {
      console.error("Escalation audit error:", err.message);
    }
  }

  /**
   * Get audit summary for admin dashboard
   */
  async getAuditSummary(days = 30) {
    try {
      const summary = await this.sql`
        SELECT 
          COUNT(*) as total_interactions,
          COUNT(*) FILTER (WHERE disclaimer_present = true) as with_disclaimer,
          COUNT(*) FILTER (WHERE disclaimer_enforced = true) as enforced,
          COUNT(*) FILTER (WHERE escalated = true) as escalated,
          COUNT(DISTINCT skill_used) as unique_skills,
          AVG(response_time_ms) as avg_response_time,
          COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 day') as last_24h,
          COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as last_7d
        FROM compliance_audit_log
        WHERE created_at > NOW() - INTERVAL '${days} days'
      `;
      return summary[0] || {};
    } catch (err) {
      console.error("Audit summary error:", err.message);
      return {};
    }
  }
}
