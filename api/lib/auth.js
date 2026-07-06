import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  for (const pair of cookieHeader.split(';')) {
    const [key, ...rest] = pair.split('=');
    cookies[key.trim()] = rest.join('=').trim();
  }
  return cookies;
}

export function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  const cookies = parseCookies(req.headers.cookie);
  return cookies['ibf_token'] || null;
}

export function verifyAuth(req) {
  if (!JWT_SECRET) throw new Error('JWT_SECRET not configured');
  const token = extractToken(req);
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function setAuthCookie(res, token) {
  const isProd = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
  const cookie = [
    `ibf_token=${token}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    `SameSite=${isProd ? 'Strict' : 'Lax'}`,
    'Max-Age=86400',
  ].join('; ');
  res.setHeader('Set-Cookie', cookie);
}

export function clearAuthCookie(res) {
  const cookie = 'ibf_token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0';
  res.setHeader('Set-Cookie', cookie);
}
