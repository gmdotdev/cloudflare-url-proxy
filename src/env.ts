import type { UrlProxy } from './proxy';

export interface Env extends Record<string, unknown> {
  API_KEY: string;
  URL_PROXY: DurableObjectNamespace<UrlProxy>;
}
