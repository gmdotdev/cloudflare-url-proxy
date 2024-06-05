import { DurableObject } from 'cloudflare:workers';

import type { Env } from './env';
import { InternalError, UserError } from './errors';

interface Storage {
  accessToken: string | null;
  expiresAt: Date | null;
  maxUses: number | null;
  url: string;
}

export class UrlProxy extends DurableObject<Env> {
  async read() {
    const [accessToken, expiresAt, maxUses, url] = await Promise.all([
      this.ctx.storage.get<Storage['accessToken']>('accessToken'),
      this.ctx.storage.get<Storage['expiresAt']>('expiresAt'),
      this.ctx.storage.get<Storage['maxUses']>('maxUses'),
      this.ctx.storage.get<Storage['url']>('url'),
    ]);

    return { accessToken, expiresAt, maxUses, url };
  }

  async redirect(opts?: { accessToken?: string }) {
    const { accessToken, expiresAt, maxUses, url } = await this.read();

    if (!url) {
      throw new InternalError('This URL has not been configured yet.');
    }

    if (accessToken && opts?.accessToken !== accessToken) {
      throw new UserError('This URL is protected.');
    }

    if (expiresAt && expiresAt < new Date()) {
      throw new UserError('This URL has expired.');
    }

    // biome-ignore lint/style/noNonNullAssertion: Number.isInteger(maxUses) ensures maxUses is not null
    if (Number.isInteger(maxUses) && maxUses! <= 0) {
      throw new UserError('This URL has been used too many times.');
    }

    await this.ctx.storage.put('maxUses', maxUses ? maxUses - 1 : null);

    return url;
  }

  async update(input: { accessToken?: string; expiresAt?: Date; maxUses?: number; url: string }) {
    const { accessToken, expiresAt, maxUses, url } = input;

    await Promise.all([
      this.ctx.storage.put('accessToken', accessToken ?? null),
      this.ctx.storage.put('expiresAt', expiresAt ?? null),
      this.ctx.storage.put('maxUses', maxUses ?? null),
      this.ctx.storage.put('url', url),
    ]);

    return input;
  }
}
