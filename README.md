# Cloudflare URL Proxy

This project is a proof of concept for a URL proxy using Cloudflare Workers and Durable Objects.

## Getting Started

1. Clone this repository

```bash
  git clone git@github.com:gmdotdev/cloudflare-url-proxy.git
```

2. Install dependencies

```bash
  pnpm install
```

3. Start the development server(s)

```bash
  pnpm dev
```

That's it! You should now have the API running locally.

## Usage

### `POST /`

Creates a new URL proxy.

This is an authenticated endpoint and requires `?apiKey=<string>` query parameter (via .dev.vars API_KEY).

#### Body

```json
{
  "accessToken": "<string, optional>",
  "expiresAt": "<date string, optional>",
  "maxUses": <number, optional>,
  "url": "https://google.com"
}
```

#### Returns

```json
{
  "id": "<string>"
}
```

### `GET /:id`

Attempts to redirect to the URL associated with the given ID.

This endpoint will check accessToken, expiration, and maxUses before redirecting and throw an error if any of these checks fail.

If an accessToken was set on creation, it must be passed as a query parameter `?accessToken=<string>`.

### `GET /:id/info`

Returns information about the URL proxy associated with the given ID.

This can be useful for passing on information like maxUses or expiresAt to a user.

This is an authenticated endpoint and requires `?apiKey=<string>` query parameter (via .dev.vars API_KEY).

```json
{
  "id": "<string>",
  "accessToken": "<string, optional>",
  "expiresAt": "<date string, optional>",
  "maxUses": <number, optional>,
  "url": "https://google.com"
}
```

## Links

- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/)
- [Hono](https://hono.dev)
