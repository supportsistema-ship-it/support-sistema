import { createCrudHandler } from './_lib/crud.mjs';

export default createCrudHandler('contratos');

export const config = { path: '/api/contratos' };
