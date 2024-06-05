import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

import type { Env } from './env';
import { authenticate } from './middleware';

export { UrlProxy } from './proxy';

const app = new Hono<{ Bindings: Env }>();

app.post(
  '/',
  authenticate,
  zValidator(
    'json',
    z.object({
      accessToken: z.string().optional(),
      expiresAt: z.string().optional(),
      maxUses: z.number().optional(),
      url: z.string(),
    }),
  ),
  async (c) => {
    const { URL_PROXY } = c.env;

    const { accessToken, expiresAt, maxUses, url } = c.req.valid('json');

    const id = URL_PROXY.newUniqueId();

    const urlProxy = URL_PROXY.get(id);

    await urlProxy.update({
      accessToken,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      maxUses,
      url,
    });

    return c.json({
      id: id.toString(),
    });
  },
);

app.get(
  '/:id',
  zValidator('param', z.object({ id: z.string() })),
  zValidator('query', z.object({ accessToken: z.string().optional() })),
  async (c) => {
    const { URL_PROXY } = c.env;

    const { accessToken } = c.req.valid('query');
    const { id } = c.req.valid('param');

    const urlProxy = URL_PROXY.get(URL_PROXY.idFromString(id));

    try {
      const url = await urlProxy.redirect({ accessToken });
      return c.redirect(url, 302);
    } catch (err) {
      if (err instanceof Error && err.message.startsWith('UserError:')) {
        return c.json({ error: err.message.slice(11) }, { status: 400 });
      }

      return c.json({ error: 'An unexpected error occurred.' }, { status: 500 });
    }
  },
);

app.get('/:id/info', authenticate, zValidator('param', z.object({ id: z.string() })), async (c) => {
  const { URL_PROXY } = c.env;

  const { id } = c.req.valid('param');

  const urlProxy = URL_PROXY.get(URL_PROXY.idFromString(id));

  try {
    const data = await urlProxy.read();
    return c.json({
      id,
      ...data,
    });
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('UserError:')) {
      return c.json({ error: err.message.slice(11) }, { status: 400 });
    }

    return c.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
});

export default app;
