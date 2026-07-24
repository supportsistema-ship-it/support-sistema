import crypto from 'node:crypto';

// Em produção, o ideal é mover isso para uma variável de ambiente no Netlify
// (Site configuration → Environment variables → AUTH_SECRET).
const SECRET = process.env.AUTH_SECRET || 'support-terceirizacoes-troque-este-segredo-2026';
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 horas

export function signToken(email) {
  const exp = Date.now() + SESSION_TTL_MS;
  const payload = `${email}|${exp}`;
  const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
  return { token: `${payload}.${sig}`, exp };
}

export function requireAuth(req) {
  const authHeader = req.headers.get('authorization') || '';
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  const token = match[1];
  const idx = token.lastIndexOf('.');
  if (idx === -1) return null;
  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
  if (sig !== expected) return null;
  const [email, expStr] = payload.split('|');
  const exp = Number(expStr);
  if (!exp || Date.now() > exp) return null;
  return email;
}
