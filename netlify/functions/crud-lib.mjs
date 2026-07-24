import { getStore } from '@netlify/blobs';
import { requireAuth } from './auth.mjs';

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * Cria um handler de API REST simples (GET/POST/PUT/DELETE) para uma coleção,
 * persistida como um único JSON dentro do Netlify Blobs.
 * Todas as rotas (exceto OPTIONS) exigem um token de login válido, enviado no
 * cabeçalho: Authorization: Bearer <token> (ver netlify/functions/auth.mjs).
 *
 * GET    /api/recurso           -> lista tudo
 * POST   /api/recurso           -> cria um item (body = campos do item)
 * PUT    /api/recurso?id=xxx    -> atualiza um item (body = campos a alterar)
 * DELETE /api/recurso?id=xxx    -> remove um item
 */
export function createCrudHandler(storeName) {
  return async (req) => {
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const user = requireAuth(req);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Não autenticado' }), { status: 401, headers: corsHeaders });
    }

    try {
      const store = getStore(storeName);
      const url = new URL(req.url);
      const id = url.searchParams.get('id');

      if (req.method === 'GET') {
        const data = (await store.get('all', { type: 'json' })) || [];
        return new Response(JSON.stringify(data), { headers: corsHeaders });
      }

      if (req.method === 'POST') {
        const body = await req.json();
        const data = (await store.get('all', { type: 'json' })) || [];
        const item = {
          ...body,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };
        data.push(item);
        await store.setJSON('all', data);
        return new Response(JSON.stringify(item), { status: 201, headers: corsHeaders });
      }

      if (req.method === 'PUT') {
        const body = await req.json();
        const targetId = id || body.id;
        const data = (await store.get('all', { type: 'json' })) || [];
        const idx = data.findIndex((x) => x.id === targetId);
        if (idx === -1) {
          return new Response(JSON.stringify({ error: 'Registro não encontrado' }), { status: 404, headers: corsHeaders });
        }
        data[idx] = { ...data[idx], ...body, id: targetId, updatedAt: new Date().toISOString() };
        await store.setJSON('all', data);
        return new Response(JSON.stringify(data[idx]), { headers: corsHeaders });
      }

      if (req.method === 'DELETE') {
        const data = (await store.get('all', { type: 'json' })) || [];
        const filtered = data.filter((x) => x.id !== id);
        await store.setJSON('all', filtered);
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }

      return new Response(JSON.stringify({ error: 'Método não suportado' }), { status: 405, headers: corsHeaders });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message || 'Erro interno' }), { status: 500, headers: corsHeaders });
    }
  };
}
