// api/lib/validate.js
// Shared Zod validation schemas for all API endpoints
import { z } from 'zod';

// ---- Chat ----
export const ChatBodySchema = z.object({
  contents: z.array(z.object({
    role: z.enum(['user', 'model']),
    parts: z.array(z.object({
      text: z.string().min(1).max(2000),
    })).min(1),
  })).min(1).max(60),
  session_id: z.string().uuid().optional(),
  user_email: z.string().email().optional(),
});

// ---- Auth ----
export const SendOtpSchema = z.object({
  email: z.string().email('Valid email address required'),
});

export const VerifyOtpSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, 'OTP must be 6 digits'),
});

// ---- Feedback ----
export const FeedbackSchema = z.object({
  session_id: z.string().uuid(),
  message_index: z.number().int().min(0),
  rating: z.enum(['up', 'down']),
  comment: z.string().max(500).optional(),
});

// ---- Payments ----
export const CheckoutSchema = z.object({
  tier: z.enum(['premium', 'professional']),
  provider: z.enum(['stripe']).optional(),
});

// ---- History ----
export const HistoryQuerySchema = z.object({
  session_id: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

// ---- Admin ----
export const AdminCleanupSchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(90),
});

// ---- Generic helpers ----
export function validateBody(schema, body) {
  const result = schema.safeParse(body);
  if (!result.success) {
    const errors = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`);
    return { ok: false, error: errors.join('; ') };
  }
  return { ok: true, data: result.data };
}

export function validateQuery(schema, url) {
  const params = Object.fromEntries(url.searchParams);
  const result = schema.safeParse(params);
  if (!result.success) {
    const errors = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`);
    return { ok: false, error: errors.join('; ') };
  }
  return { ok: true, data: result.data };
}
