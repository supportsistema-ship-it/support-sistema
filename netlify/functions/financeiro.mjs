import { createCrudHandler } from './_lib/crud.mjs';

export default createCrudHandler('financeiro');

export const config = { path: '/api/financeiro' };
