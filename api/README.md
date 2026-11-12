# api/ — server seam (not used by the starter)

The starter has **no backend**: `src/gift-schema/codec.ts` encodes a `GiftContentV1` into the URL hash
(`#/g/<z|j><base64url>`), so the whole create → share → open flow runs as a static site.

Production (FRAMEWORK §7.1, §7.5, arch-web-react-motion.md §6) replaces that with Vercel Functions
(Node 22, `sin1`) over Supabase (`ap-southeast-1`). Only this folder may hold the service-role key.

| Function | Replaces in the starter | Notes |
|---|---|---|
| `POST /api/gift/[slug]/open` | `loadGift(param)` in `src/gift-schema/codec.ts` | unlock gate, passcode gate (scrypt of the §6.4-normalised answer, rate-limited), returns content + signed media URLs (TTL 6 h) |
| `POST /api/gift/[slug]/event` | — | opt-in opened / finished / replied, timestamp only |
| `GET /g/[slug]` | the SPA shell | injects per-slug `<head>` (OG, `noindex`); locked / revoked / expired pages server-rendered with no JS |
| `POST /api/media/sign-upload`, `/api/media/finalize` | `'ph:<n>'` / `data:` refs in `src/gift-schema/media.ts` | private bucket, EXIF strip, 3 sizes + thumbhash |
| `POST /api/publish/[draftId]` | `encodeGift()` | validates with the shared zod `GiftContentV1`, freezes `gift_versions`, renders OG once |
| `pay/{create,ipn-*,bank-webhook}` | — | VND, idempotent IPN |

When moving to the server, keep the player calling `loadGift()`; change only `codec.ts` (and the router's
`parseRoute` input from `location.hash` to `location.pathname`).
