import { createCrudHandler } from './_lib/crud.mjs';

export default createCrudHandler('rotinas');

export const config = { path: '/api/rotinas' };
