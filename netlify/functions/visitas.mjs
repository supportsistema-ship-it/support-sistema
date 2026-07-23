import { createCrudHandler } from './_lib/crud.mjs';

export default createCrudHandler('visitas');

export const config = { path: '/api/visitas' };
