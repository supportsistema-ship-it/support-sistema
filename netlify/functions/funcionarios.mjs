import { createCrudHandler } from './_lib/crud.mjs';

export default createCrudHandler('funcionarios');

export const config = { path: '/api/funcionarios' };
