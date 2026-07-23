import { getStore } from '@netlify/blobs';

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/**
 * Armazena documentos anexados a qualquer registro do sistema, usando Netlify Blobs.
 * Cada arquivo é salvo como texto base64, com metadados (nome, tipo, tamanho).
 *
 * GET    /api/documentos?recurso=clientes&itemId=xxx   -> lista os documentos daquele item
 * GET    /api/documentos?id=chave-do-blob               -> baixa/abre um documento específico
 * POST   /api/documentos                                 -> anexa um novo documento
 *        body: { recurso, itemId, filename, contentType, dataBase64 }
 * DELETE /api/documentos?id=chave-do-blob                -> remove um documento
 */
export default async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const store = getStore('documentos');
    const url = new URL(req.url);
    const recurso = url.searchParams.get('recurso');
    const itemId = url.searchParams.get('itemId');
    const id = url.searchParams.get('id');

    // Download de um documento específico
    if (req.method === 'GET' && id) {
      const result = await store.getWithMetadata(id, { type: 'text' });
      if (!result) {
        return new Response(JSON.stringify({ error: 'Documento não encontrado' }), { status: 404, headers: corsHeaders });
      }
      const buffer = Buffer.from(result.data, 'base64');
      const meta = result.metadata || {};
      return new Response(buffer, {
        headers: {
          'Content-Type': meta.contentType || 'application/octet-stream',
          'Content-Disposition': `inline; filename="${encodeURIComponent(meta.filename || 'arquivo')}"`,
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Lista os documentos de um item
    if (req.method === 'GET') {
      if (!recurso || !itemId) {
        return new Response(JSON.stringify({ error: 'Informe recurso e itemId' }), { status: 400, headers: corsHeaders });
      }
      const { blobs } = await store.list({ prefix: `${recurso}/${itemId}/` });
      const items = await Promise.all(
        blobs.map(async (b) => {
          const meta = await store.getMetadata(b.key);
          return { key: b.key, ...(meta && meta.metadata ? meta.metadata : {}) };
        })
      );
      items.sort((a, b) => (a.uploadedAt || '').localeCompare(b.uploadedAt || ''));
      return new Response(JSON.stringify(items), { headers: corsHeaders });
    }

    // Envia um novo documento
    if (req.method === 'POST') {
      const body = await req.json();
      const { recurso: r, itemId: iid, filename, contentType, dataBase64 } = body;
      if (!r || !iid || !filename || !dataBase64) {
        return new Response(JSON.stringify({ error: 'Dados incompletos' }), { status: 400, headers: corsHeaders });
      }
      const key = `${r}/${iid}/${crypto.randomUUID()}-${filename}`;
      const size = Math.ceil((dataBase64.length * 3) / 4);
      await store.set(key, dataBase64, {
        metadata: {
          filename,
          contentType: contentType || 'application/octet-stream',
          size,
          uploadedAt: new Date().toISOString(),
        },
      });
      return new Response(JSON.stringify({ key, filename, contentType, size }), { status: 201, headers: corsHeaders });
    }

    // Remove um documento
    if (req.method === 'DELETE') {
      if (!id) {
        return new Response(JSON.stringify({ error: 'Informe o id do documento' }), { status: 400, headers: corsHeaders });
      }
      await store.delete(id);
      return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ error: 'Método não suportado' }), { status: 405, headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Erro interno' }), { status: 500, headers: corsHeaders });
  }
};

export const config = { path: '/api/documentos' };
