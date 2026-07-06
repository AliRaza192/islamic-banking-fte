// api/lib/pii-encryption.js
// PII Encryption utility for at-rest data protection
// Uses AES-256-GCM for symmetric encryption
// Key stored in env var: PII_ENCRYPTION_KEY (32 bytes hex)

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

/**
 * Get encryption key from environment
 * @returns {Buffer} 32-byte encryption key
 */
function getKey() {
  const keyHex = process.env.PII_ENCRYPTION_KEY;
  if (!keyHex) {
    // Fallback: derive key from JWT_SECRET (less secure, but functional)
    const jwtSecret = process.env.JWT_SECRET || 'default-dev-key-change-in-production';
    return crypto.createHash('sha256').update(jwtSecret).digest();
  }
  return Buffer.from(keyHex, 'hex');
}

/**
 * Encrypt a string value
 * @param {string} plaintext - Value to encrypt
 * @returns {string} Encrypted value (base64 encoded: iv:tag:ciphertext)
 */
export function encrypt(plaintext) {
  if (!plaintext) return plaintext;

  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const tag = cipher.getAuthTag();

  // Format: base64(iv:tag:ciphertext)
  return Buffer.concat([
    iv,
    tag,
    Buffer.from(encrypted, 'hex'),
  ]).toString('base64');
}

/**
 * Decrypt an encrypted value
 * @param {string} encryptedBase64 - Encrypted value (base64 encoded)
 * @returns {string} Decrypted plaintext
 */
export function decrypt(encryptedBase64) {
  if (!encryptedBase64) return encryptedBase64;

  try {
    const key = getKey();
    const data = Buffer.from(encryptedBase64, 'base64');

    const iv = data.subarray(0, IV_LENGTH);
    const tag = data.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const ciphertext = data.subarray(IV_LENGTH + TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(ciphertext, undefined, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (err) {
    console.error('PII decryption failed:', err.message);
    return null;
  }
}

/**
 * Check if a value is encrypted (basic heuristic)
 * @param {string} value - Value to check
 * @returns {boolean} True if value appears to be encrypted
 */
export function isEncrypted(value) {
  if (!value || typeof value !== 'string') return false;
  try {
    const decoded = Buffer.from(value, 'base64');
    return decoded.length > IV_LENGTH + TAG_LENGTH;
  } catch {
    return false;
  }
}

/**
 * Detect PII in text (for logging/filtering)
 * @param {string} text - Text to scan
 * @returns {string[]} Array of PII types found
 */
export function detectPII(text) {
  if (!text) return [];

  const patterns = [
    { type: 'CNIC', pattern: /\b\d{5}-?\d{7}-?\d\b/g },
    { type: 'AccountNumber', pattern: /\b\d{4}-?\d{4}-?\d{4}\b/g },
    { type: 'CardNumber', pattern: /\b\d{16}\b/g },
    { type: 'Email', pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g },
    { type: 'Phone', pattern: /\b(\+92|0092|92)?[- ]?\d{3}[- ]?\d{7}\b/g },
  ];

  const found = [];
  for (const { type, pattern } of patterns) {
    if (pattern.test(text)) {
      found.push(type);
    }
  }
  return found;
}

/**
 * Sanitize PII for logging (mask sensitive data)
 * @param {string} text - Text to sanitize
 * @returns {string} Text with PII masked
 */
export function sanitizeForLog(text) {
  if (!text) return text;

  return text
    .replace(/\b\d{5}-?\d{7}-?\d\b/g, 'XXXXX-XXXXXXX-X')  // CNIC
    .replace(/\b\d{4}-?\d{4}-?\d{4}\b/g, 'XXXX-XXXX-XXXX')  // Account
    .replace(/\b\d{16}\b/g, 'XXXX-XXXX-XXXX-XXXX')  // Card
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '***@***.***');  // Email
}
