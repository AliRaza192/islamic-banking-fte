"""
Islamic Banking FTE — Local Development Server
Reads GEMINI_API_KEY from .env.local (never exposed to browser)
Mirrors api/chat.js logic for local testing
Usage: python3 server.py
Then open: http://localhost:8000
"""

import os
import json
import re
import hmac as _hmac
import hashlib
import base64
import time
import random
import string
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.request import urlopen, Request
from urllib.error import HTTPError

# ---- Load .env.local ----
def load_env():
    env_path = os.path.join(os.path.dirname(__file__), '.env.local')
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    k, v = line.split('=', 1)
                    os.environ[k.strip()] = v.strip().strip('"').strip("'")
        print("✅ .env.local loaded")
    else:
        print("⚠️  .env.local not found")

load_env()

GEMINI_KEY   = os.environ.get('GEMINI_API_KEY', '')
GEMINI_MODEL = os.environ.get('GEMINI_MODEL', 'gemini-2.5-flash')
JWT_SECRET   = os.environ.get('JWT_SECRET', 'local-dev-secret-key-change-in-prod')
BASE_DIR     = os.path.dirname(os.path.abspath(__file__))

# In-memory OTP store for local dev (no DB needed)
_local_otps = {}

def _base64url(data):
    if isinstance(data, str):
        data = data.encode()
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode()

def _sign_jwt(payload, secret):
    header = _base64url(json.dumps({"alg": "HS256", "typ": "JWT"}))
    payload['iat'] = int(time.time())
    payload['exp'] = int(time.time()) + 30 * 24 * 3600
    body = _base64url(json.dumps(payload))
    sig = _hmac.new(secret.encode(), f"{header}.{body}".encode(), hashlib.sha256).digest()
    return f"{header}.{body}.{_base64url(sig)}"

def _verify_jwt(token, secret):
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
        header, body, sig = parts
        expected = hmac.new(secret.encode(), f"{header}.{body}".encode(), hashlib.sha256).digest()
        if _base64url(expected) != sig:
            return None
        payload = json.loads(base64.urlsafe_b64decode(body + '=='))
        if payload.get('exp', 0) < time.time():
            return None
        return payload
    except Exception:
        return None

# ---- Load file from disk ----
def load_file(relative_path):
    full_path = os.path.join(BASE_DIR, relative_path)
    if os.path.exists(full_path):
        with open(full_path, 'r', encoding='utf-8') as f:
            return f.read()
    return ''

# ---- Skill Auto-Router (mirrors api/chat.js) ----
def detect_skill(user_message):
    msg = user_message.lower()

    if any(k in msg for k in ['murabaha', 'car loan', 'ghar ka qarz', 'cost-plus', 'commodity financ']):
        return 'murabaha-specialist'
    if any(k in msg for k in ['zakat', 'zakaat', 'nisab', 'tithe']):
        return 'zakat-advisor'
    if any(k in msg for k in ['ijara', 'ijarah', 'lease', 'kiraya', 'rent-to-own']):
        return 'ijara-specialist'
    if re.search(r'\bsalam\b', msg, re.IGNORECASE) or any(k in msg for k in ['forward sale', 'advance payment', 'crop financing', 'agricultural financ']):
        return 'salam-specialist'
    if any(k in msg for k in ['istisna', 'construction financ', 'manufacturing financ', 'home construction', 'milestone payment']):
        return 'istisna-a-specialist'
    if ('sukuk' in msg and any(k in msg for k in ['issuance', 'issue', 'issuer', 'structure', 'spv', 'corporate'])):
        return 'sukuk-issuer'
    if ('sukuk' in msg and any(k in msg for k in ['invest', 'buy', 'yield', 'return', 'portfolio', 'gop sukuk'])):
        return 'sukuk-investor'
    if ('takaful' in msg and any(k in msg for k in ['accounting', 'ifrs17', 'ifrs 17', 'operator', 'wakala', 'measurement', 'surplus'])):
        return 'takaful-ifrs17'
    if any(k in msg for k in ['full musharakah', 'permanent musharakah', 'running musharakah', 'sme partnership', 'working capital musharakah']):
        return 'musharaka-full'
    if any(k in msg for k in ['musharakah', 'mudarabah', 'partnership', 'profit shar', 'shirkat']):
        return 'musharakah-mudarabah-specialist'
    if any(k in msg for k in ['sukuk', 'takaful', 'islamic insurance', 'halal insurance', 'islamic bond']):
        return 'sukuk-takaful-specialist'
    if any(k in msg for k in ['halal', 'haram', 'permissible', 'jaiz', 'na-jaiz', 'shariah check', 'riba', 'gharar']):
        return 'shariah-compliance-checker'
    if any(k in msg for k in ['roshan', 'rda', 'roshan digital', 'overseas pakistani', 'non-resident', 'nrp', 'naya pakistan certificate', 'npc']):
        return 'roshan-digital-advisor'
    if any(k in msg for k in ['meezan', 'dubai islamic', 'bank islami', 'al baraka', 'faysal bank', 'sbp', 'pakistan', 'kibor', 'pkr']):
        return 'pakistan-banking-navigator'
    if any(k in msg for k in ['calculate', 'hisab', 'kitna', 'monthly payment', 'installment', 'qist', 'total payable']):
        return 'halal-calculator'
    if any(k in msg for k in ['what is', 'explain', 'kya hai', 'bataiye', 'samjhao', 'difference between', 'how does']):
        return 'islamic-product-explainer'

    return 'islamic-banking-advisor'

# ---- Detect Jurisdiction ----
def detect_jurisdiction(user_message):
    msg = user_message.lower()
    if any(k in msg for k in ['uae', 'dubai', 'abu dhabi', 'aed', 'cbuae', 'dib', 'adib']):
        return 'uae'
    if any(k in msg for k in ['saudi', 'ksa', 'al rajhi', 'sar', 'sama', 'zatca']):
        return 'saudi'
    if any(k in msg for k in ['malaysia', 'maybank', 'myr', 'bnm', 'klibor']):
        return 'malaysia'
    if any(k in msg for k in ['bahrain', 'bhd', 'cbb', 'aaoifi']):
        return 'bahrain'
    if any(k in msg for k in ['kuwait', 'kwd', 'cbk', 'kfh']):
        return 'kuwait'
    if any(k in msg for k in ['qatar', 'qar', 'qib', 'qiib', 'qcb', 'qfc']):
        return 'qatar'
    if any(k in msg for k in ['oman', 'omr', 'cbo', 'bank nizwa', 'meethaq']):
        return 'oman'
    if any(k in msg for k in ['turkey', 'turkish', 'try', 'bddk', 'kuveyt turk']):
        return 'turkey'
    if any(k in msg for k in ['nigeria', 'ngn', 'cbn', 'jaiz bank', 'taj bank']):
        return 'nigeria'
    if any(k in msg for k in ['indonesia', 'idr', 'ojk', 'bsi', 'bank muamalat']):
        return 'indonesia'
    if any(k in msg for k in ['uk', 'united kingdom', 'britain', 'gbp', 'al rayan', 'blme', 'hmrc']):
        return 'uk'
    if any(k in msg for k in ['gcc', 'cross-border', 'gulf', 'multi-country']):
        return 'gcc-crossborder'
    return 'pakistan'

# ---- Build System Prompt (mirrors api/chat.js) ----
def build_system_prompt(user_message):
    claude_md       = load_file('CLAUDE.md')
    router_skill    = load_file('skills/islamic-finance-router/SKILL.md')
    shariah_rules   = load_file('references/shariah-rules.md')
    nisab_table     = load_file('references/nisab-table.md')
    calculations    = load_file('references/calculations.md')

    jurisdiction    = detect_jurisdiction(user_message)
    jurisdiction_files = {
        'pakistan': 'pakistan-ifrs', 'uae': 'uae-ifrs', 'saudi': 'saudi-ifrs',
        'malaysia': 'malaysia-mfrs', 'bahrain': 'bahrain-aaoifi', 'kuwait': 'kuwait-ifrs',
        'qatar': 'qatar-aaoifi', 'oman': 'oman-ifrs', 'turkey': 'turkey-tfrs',
        'nigeria': 'nigeria-ifrs', 'indonesia': 'indonesia-psak', 'uk': 'uk-ifrs',
        'gcc-crossborder': 'gcc-crossborder',
    }
    jurisdiction_md = load_file(f'skills/islamic-finance-router/references/jurisdictions/{jurisdiction_files.get(jurisdiction, jurisdiction + "-ifrs")}.md')

    skill_name      = detect_skill(user_message)
    skill_content   = load_file(f'skills/{skill_name}/SKILL.md')

    msg = user_message.lower()
    extra_refs = ''
    if any(k in msg for k in ['bank', 'meezan', 'pakistan', 'recommend', 'best bank']):
        extra_refs += '\n\n---\n\n' + load_file('references/pakistan-banks.md')
    if any(k in msg for k in ['product', 'what is', 'explain', 'kya hai', 'murabaha', 'ijara']):
        extra_refs += '\n\n---\n\n' + load_file('references/products.md')
    if any(k in msg for k in ['faq', 'question', 'confused', 'difference', 'better']):
        extra_refs += '\n\n---\n\n' + load_file('references/faqs.md')

    parts = [
        claude_md,
        '---',
        '## Router Skill (Active)',
        router_skill,
        '---',
        f'## Detected Jurisdiction: {jurisdiction.upper()}',
        jurisdiction_md,
        '---',
        f'## Active Product Skill: {skill_name}',
        skill_content,
        '---',
        '## Core References',
        '### Shariah Rules',
        shariah_rules,
        '### Nisab & Zakat Values',
        nisab_table,
        '### Calculation Formulas',
        calculations,
        extra_refs,
    ]
    return '\n\n'.join(p for p in parts if p)

# ---- Request Handler ----
class Handler(SimpleHTTPRequestHandler):

    def __init__(self, *args, **kwargs):
        web_dir = os.path.join(BASE_DIR, 'web')
        super().__init__(*args, directory=web_dir, **kwargs)

    def do_GET(self):
        if self.path == '/api/health':
            checks = {
                'status': 'ok',
                'gemini': bool(GEMINI_KEY),
                'database': False,
                'version': '1.0.0',
            }
            db_url = os.environ.get('DATABASE_URL', '')
            if db_url:
                checks['database'] = True  # Simplified for local
            status = 200 if checks['gemini'] else 503
            self._json(status, checks)
            return

        if self.path == '/api/auth/me':
            auth = self.headers.get('Authorization', '')
            if not auth.startswith('Bearer '):
                self._json(401, {'error': 'Authorization token required'})
                return
            payload = _verify_jwt(auth[7:], JWT_SECRET)
            if not payload:
                self._json(401, {'error': 'Invalid or expired token'})
                return
            self._json(200, {
                'email': payload.get('email'),
                'tier': payload.get('tier', 'free'),
                'queries_today': 0,
                'queries_limit': {'free': 10, 'premium': 100, 'professional': 'unlimited'}.get(payload.get('tier', 'free'), 10),
                'subscription': None,
            })
            return

        super().do_GET()

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    def do_POST(self):
        if self.path == '/api/auth/send-otp':
            try:
                length = int(self.headers['Content-Length'])
                body = json.loads(self.rfile.read(length))
                email = body.get('email', '').lower().strip()
                if not email or '@' not in email:
                    self._json(400, {'error': 'Valid email required'})
                    return
                code = ''.join(random.choices(string.digits, k=6))
                _local_otps[email] = {'code': code, 'expires': time.time() + 300}
                print(f"\n  📧 OTP for {email}: {code}\n")
                self._json(200, {'success': True, 'message': f'OTP sent to {email} (check server console)'})
            except Exception as e:
                self._json(500, {'error': str(e)})
            return

        if self.path == '/api/auth/verify-otp':
            try:
                length = int(self.headers['Content-Length'])
                body = json.loads(self.rfile.read(length))
                email = body.get('email', '').lower().strip()
                code = body.get('code', '').strip()
                if not email or not code:
                    self._json(400, {'error': 'Email and code required'})
                    return
                stored = _local_otps.get(email)
                if not stored or stored['expires'] < time.time():
                    self._json(400, {'error': 'Invalid or expired OTP'})
                    return
                if stored['code'] != code:
                    self._json(400, {'error': 'Incorrect OTP code'})
                    return
                del _local_otps[email]
                token = _sign_jwt({'userId': f'local-{email}', 'email': email, 'tier': 'free'}, JWT_SECRET)
                self._json(200, {'success': True, 'token': token, 'user': {'email': email, 'tier': 'free', 'queries_today': 0}})
            except Exception as e:
                self._json(500, {'error': str(e)})
            return

        if self.path == '/api/payments/create-checkout':
            self._json(200, {'checkout_url': 'https://checkout.stripe.com/test', 'note': 'Stripe not connected in local dev'})
            return

        if self.path == '/api/chat':
            try:
                length = int(self.headers['Content-Length'])
                body   = json.loads(self.rfile.read(length))

                contents = body.get('contents', [])
                session_id = body.get('session_id', '')

                if not contents:
                    self._json(400, {'error': 'contents missing'})
                    return

                user_msg = contents[-1]['parts'][0]['text']

                # Build system prompt server-side
                system_prompt = build_system_prompt(user_msg)

                gemini_body = {
                    'system_instruction': {'parts': [{'text': system_prompt}]},
                    'contents': contents,
                    'generationConfig': {'temperature': 0.7, 'maxOutputTokens': 2048}
                }

                url = (f'https://generativelanguage.googleapis.com/v1beta'
                       f'/models/{GEMINI_MODEL}:generateContent')

                headers = {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': GEMINI_KEY,
                }

                req = Request(url,
                    data=json.dumps(gemini_body).encode(),
                    headers=headers,
                    method='POST')

                try:
                    resp = urlopen(req)
                    result = resp.read()
                except HTTPError as e:
                    gemini_err = json.loads(e.read())
                    err_msg = gemini_err.get('error', {}).get('message', gemini_err.get('error', 'AI service waqti tor par band hai. Thodi der baad dobara try karein.'))
                    print(f"  ❌ Gemini API error: {e.code} - {err_msg}")
                    self._json(503, {'error': err_msg, 'fallback': True})
                    return

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self._cors()
                self.end_headers()
                self.wfile.write(result)

            except Exception as e:
                self._json(500, {'error': str(e)})
        else:
            self.send_response(404)
            self.end_headers()

    def _cors(self):
        origin = self.headers.get('Origin', '')
        ALLOWED_ORIGINS = [
            'http://localhost:8000',
            'http://localhost:3000',
            'https://islamic-banking-fte.vercel.app',
        ]
        if origin in ALLOWED_ORIGINS:
            self.send_header('Access-Control-Allow-Origin', origin)
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    def _json(self, status, data):
        body = json.dumps(data).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self._cors()
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        try:
            path   = args[0].split('"')[1] if '"' in str(args[0]) else str(args[0])
            status = args[1] if len(args) > 1 else ''
            print(f"  {path}  →  {status}")
        except Exception:
            pass

if __name__ == '__main__':
    if not GEMINI_KEY:
        print("❌ GEMINI_API_KEY not found in .env.local!")
        exit(1)

    port = 8000
    print()
    print("🕌  Islamic Banking FTE — Local Server")
    print(f"   URL:   http://localhost:{port}")
    print(f"   Key:   ✅ loaded ({GEMINI_KEY[:8]}...)")
    print(f"   Model: {GEMINI_MODEL}")
    print()
    print("   Skills auto-routing: ✅")
    print("   References injection: ✅")
    print("   Press Ctrl+C to stop")
    print()

    HTTPServer(('', port), Handler).serve_forever()
