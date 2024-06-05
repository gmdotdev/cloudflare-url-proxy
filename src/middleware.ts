import { createMiddleware } from 'hono/factory';

import type { Env } from './env';

export const authenticate = createMiddleware<{ Bindings: Env }>(async (c, next) => {
  const apiKey = c.req.query('apiKey');
  if (apiKey !== c.env.API_KEY) {
    return c.text('Unauthorized', { status: 401 });
  }

  await next();
});
