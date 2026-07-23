import { createCrudHandler } from './_lib/crud.mjs';

export default createCrudHandler('clientes');

export const config = { path: '/api/clientes' };
