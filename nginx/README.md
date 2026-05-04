# Nginx rollout for Binary V

This setup adds Nginx as a production entrypoint in front of:

- `tradingWebApp` static frontend build
- `Binary-Trading` Express + Socket.IO backend on port `4000`

It is designed to be added without changing the current local development flow.

## What this gives you

- One public origin for frontend, API, uploads, and sockets
- HTTPS-first deployment with HTTP-to-HTTPS redirect
- Reverse proxy support for `/api` and `/socket.io`
- Better static asset caching
- Safer request handling before traffic reaches Node
- Edge request limiting before abuse reaches Express
- Backend logging for blocked or replayed trade attempts
- Idempotent trade placement support for safer client retries

## Files

- `nginx/binary-v.conf`: example production server block
- `Binary-Trading/middleware/tradeGuard.js`: per-user throttling and duplicate trade guard
- `Binary-Trading/middleware/tradeIdempotency.js`: idempotency replay protection for trade placement
- `Binary-Trading/utils/tradeSecurityLogger.js`: centralized security-event logging

## Safe rollout plan

1. Keep the backend running on `127.0.0.1:4000`.
2. Build the frontend from `tradingWebApp` so `dist/` is up to date.
3. Replace `your-domain.com` in `nginx/binary-v.conf` with the real hostname.
4. Replace the sample certificate paths in `nginx/binary-v.conf` with your real certificate files.
5. Configure backend env:
   - `NODE_ENV=production`
   - `TRUST_PROXY=1`
   - `FRONTEND_URL=https://your-domain.com`
   - or `FRONTEND_URLS=https://your-domain.com`
   - `TRADE_RATE_WINDOW_MS=10000`
   - `TRADE_MAX_PER_WINDOW=5`
   - `DUPLICATE_TRADE_LOCK_MS=3000`
   - `TRADE_IDEMPOTENCY_TTL_MS=60000`
   - `TRADE_IDEMPOTENCY_PENDING_TTL_MS=15000`
6. Start Nginx and verify:
   - `/` serves the frontend
   - HTTP traffic redirects to HTTPS
   - `/api/...` reaches Express
   - `/uploads/...` resolves correctly
   - `Socket.IO` connects and receives trade events
   - repeated requests with the same `X-Idempotency-Key` replay safely instead of placing a second trade

## Important notes

- The frontend now supports same-origin production mode. If `VITE_API_URL` is not set during a production build, it will call the current site origin through Nginx.
- Local development is unchanged. In dev, the frontend still defaults to `http://localhost:4000`.
- Because the backend already uses Express rate limiting, `TRUST_PROXY=1` is important when Nginx sits in front. Without it, IP-based limits can behave incorrectly.
- Keep `/socket.io`, `/api`, and `/uploads` on the same host so cookies and auth stay simple.
- Nginx rate limits are infrastructure guards, not replacements for backend trade validation.
- Backend trade security events are logged with the prefix `[trade-security]`. Forward these logs to your process manager or log collector in production.
- The frontend now sends `X-Idempotency-Key` on real trade placement so safe retries do not create accidental duplicate orders.

## Current Nginx limits

- `/api/auth/`: `5 requests/minute` per IP with a small burst allowance
- `/api/trades/trade`: `10 requests/minute` per IP with a small burst allowance
- `/api/`: `20 requests/second` per IP for broader API protection

Tune these after observing real traffic. For trading, backend user-based rules still matter more than IP-based edge rules.

## Current backend trade guards

- Per-user trade rate limit: default `5 trades` per `10 seconds`
- Duplicate trade lock: default `3 seconds` for the same trade fingerprint
- Idempotency replay cache: default `60 seconds`
- In-flight idempotency lock: default `15 seconds`

## HTTPS-ready outline

1. Replace `your-domain.com` in `nginx/binary-v.conf` with the real hostname.
2. Replace the sample `ssl_certificate` and `ssl_certificate_key` paths with your actual TLS certificate files.
3. Keep the port `80` server block so all HTTP traffic redirects to `443`.
4. Keep `TRUST_PROXY=1` enabled so Express sees the original protocol and IP.
5. Keep production auth cookies on secure settings. Your main auth controller already uses secure cookie settings when `NODE_ENV=production`.

## Recommended next hardening steps

- Add structured Nginx access and error logs
- Add health checks for backend readiness
- Add centralized log shipping or alerts for `[trade-security]` events
- Consider persisting idempotency responses in a dedicated cache namespace if you later add more order types
