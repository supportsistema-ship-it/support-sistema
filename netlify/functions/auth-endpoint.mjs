import { signToken } from './_lib/auth.mjs';

// Credenciais de acesso ao sistema. Para trocar a senha, edite os valores abaixo
// e reenvie este arquivo. Em produção, o ideal é mover para variáveis de ambiente
// no Netlify (Site configuration → Environment variables → LOGIN_EMAIL / LOGIN_PASSWORD).
const LOGIN_EMAIL = process.env.LOGIN_EMAIL || 'supportsistema@gmail.com';
const LOGIN_PASSWORD = process.env.LOGIN_PASSWORD || 'Support2026';

const headersJson = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
};

export default async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: headersJson });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método não suportado' }), { status: 405, headers: headersJson });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Dados inválidos' }), { status: 400, headers: headersJson });
  }

  const { email, password } = body;
  if (email === LOGIN_EMAIL && password === LOGIN_PASSWORD) {
    const { token, exp } = signToken(email);
    return new Response(JSON.stringify({ ok: true, token, exp }), { headers: headersJson });
  }
  return new Response(JSON.stringify({ error: 'E-mail ou senha incorretos' }), { status: 401, headers: headersJson });
};

export const config = { path: '/api/auth' };
