import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'GET')
    return res.status(405).json({ error: 'Method not allowed' });

  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  const DATABASE_URL = process.env.DATABASE_URL;

  const checks = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    gemini: !!GEMINI_KEY,
    database: false,
    version: '1.0.0'
  };

  if (DATABASE_URL) {
    try {
      const sql = neon(DATABASE_URL);
      await sql`SELECT 1`;
      checks.database = true;
    } catch (err) {
      checks.database = false;
      checks.db_error = err.message;
    }
  }

  const allOk = checks.gemini && checks.database;
  return res.status(allOk ? 200 : 503).json(checks);
}
