# Content Upload Control

Private Next.js control panel for scheduling video uploads across TikTok, Instagram, and YouTube with per-platform SEO planning, company isolation, and cron-driven delivery.

## What is implemented

- Password-protected app shell with signed session cookie
- Red-toned high-end UI with a controller-style top surface
- New automation flow with:
  - company selection
  - local video drop input
  - TikTok / Instagram / YouTube toggles
  - AI SEO or manual entry per platform
  - independent publish time per platform
- Scheduled tasks view with preview, generated notes, and edit access
- Edit mode plus delete confirmation flow
- Company page showing one reserved channel per platform with OAuth handoff points
- Settings page dedicated to per-company OAuth linking and unlinking
- Supabase-oriented schema, env config, and secure token encryption helper
- Secret-guarded cron endpoint contract

## What is still a scaffold

- Persistent storage is still mocked from `src/lib/data/demo-data.ts`
- Video upload currently previews locally instead of storing to Supabase Storage
- TikTok / Instagram / YouTube OAuth provider redirects and token exchange are still placeholders
- Posting workers and transcript generation are contract stubs

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- Supabase client helpers ready for wiring
- Zod validation

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment file and fill in real secrets:

```bash
cp .env.example .env.local
```

3. Start the app:

```bash
npm run dev
```

## Security notes

- `APP_PASSWORD` is the initial gate for the whole application.
- `SESSION_SECRET` signs the password-gated session cookie.
- `CRON_SECRET` authenticates the scheduler calling `/api/cron/run-due`.
- `CHANNEL_TOKEN_ENCRYPTION_KEY` must be a base64-encoded 32-byte key for AES-256-GCM encryption of provider tokens at rest.
- Real provider app credentials should stay server-side only.
- Real company channel tokens should be stored per company and platform in encrypted database rows after OAuth callback completes.

## OAuth-only policy

- Upload scheduling is blocked unless that company already has a healthy OAuth connection for the selected platform.
- There is no manual token entry fallback in the scheduler.
- Linking and unlinking should happen from the Settings screen only.

## Suggested next implementation steps

1. Replace `src/lib/data/repository.ts` with a real Supabase repository.
2. Add Supabase Storage upload flow for the incoming video file.
3. Implement provider OAuth redirects and callbacks for each platform.
4. Run the transcript + SEO generation pipeline asynchronously after scheduling.
5. Add a worker or queue processor that posts due items and records upload results.
