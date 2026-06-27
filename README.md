# ViralForge.ai

**Turn one idea into 30 days of content.**

ViralForge turns a single idea, transcript, or piece of text into a complete,
copy-paste-ready content package for social media — hooks, captions, threads,
hashtags, a newsletter draft, a blog outline, content ideas and a carousel
concept — in one click.

Built as a real, paid SaaS MVP.

---

## ✨ Features

- **Landing page** — modern dark SaaS marketing site with pricing.
- **Authentication** — email/password sign up, login, logout, protected routes.
- **AI content generation** — one input → a full multi-platform content pack
  using OpenAI structured (JSON-schema) output.
- **History** — every generation is saved; open, copy, export, or delete.
- **Usage limits** — monthly per-plan generation quotas, enforced server-side.
- **Stripe billing** — checkout, customer portal, and webhook-driven plan sync.
- **Copy & export** — copy any section, copy all, or export to `.txt` / `.md`.

### Output of every generation
10 hooks · Instagram caption · TikTok caption · LinkedIn post · X thread ·
Newsletter draft · Blog outline · 20 hashtags · 5 CTA options ·
10 content ideas · 5-slide carousel.

---

## 🧱 Tech stack

| Layer      | Choice                                   |
| ---------- | ---------------------------------------- |
| Framework  | Next.js 15 (App Router) + TypeScript     |
| Styling    | Tailwind CSS + shadcn/ui-style components |
| Database   | PostgreSQL                               |
| ORM        | Prisma                                   |
| Auth       | Custom JWT sessions (httpOnly cookie + bcrypt) |
| Payments   | Stripe (Checkout + Billing Portal + Webhooks) |
| AI         | OpenAI API (JSON-schema structured output) |
| Hosting    | Render                                   |

> **A note on auth:** This MVP ships with a self-contained email/password auth
> implementation (JWT in an httpOnly cookie, bcrypt password hashing) so the app
> runs with nothing more than a Postgres database — no third-party auth account
> required. The `src/lib/auth.ts` module is the single integration point, so it
> can be swapped for Supabase Auth or Clerk later without touching the rest of
> the app.

---

## 🚀 Run locally

### 1. Prerequisites

- Node.js 18.18+ (or 20+)
- A PostgreSQL database (local or hosted)
- An OpenAI API key
- (Optional) A Stripe account for billing

### 2. Install

```bash
git clone <your-repo-url>
cd viralforge
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Fill in `.env` (see [Environment variables](#-environment-variables)).
At minimum you need `DATABASE_URL`, `AUTH_SECRET`, and `OPENAI_API_KEY`.

Generate an `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

### 4. Set up the database

```bash
# Create tables from the schema and generate the Prisma client
npx prisma migrate dev --name init
```

(or, without migration history: `npm run db:push`)

### 5. Start the dev server

```bash
npm run dev
```

Open http://localhost:3000.

---

## 🔐 Environment variables

| Variable                 | Required | Description                                            |
| ------------------------ | :------: | ------------------------------------------------------ |
| `NEXT_PUBLIC_APP_URL`    |    ✅    | Public base URL (e.g. `http://localhost:3000`).        |
| `DATABASE_URL`           |    ✅    | PostgreSQL connection string.                          |
| `AUTH_SECRET`            |    ✅    | Random secret used to sign session JWTs.               |
| `OPENAI_API_KEY`         |    ✅    | OpenAI API key for generation.                         |
| `OPENAI_MODEL`           |    –     | Model id (defaults to `gpt-4o-mini`).                  |
| `STRIPE_SECRET_KEY`      |   ✅\*   | Stripe secret key (required for billing).              |
| `STRIPE_WEBHOOK_SECRET`  |   ✅\*   | Signing secret for the Stripe webhook.                 |
| `STRIPE_PRICE_CREATOR`   |   ✅\*   | Stripe price id for the Creator plan.                  |
| `STRIPE_PRICE_PRO`       |   ✅\*   | Stripe price id for the Pro plan.                      |
| `STRIPE_PRICE_AGENCY`    |   ✅\*   | Stripe price id for the Agency plan.                   |

\* Stripe variables are only required to enable paid plans. The app runs fine on
the Free plan without them; billing UI degrades gracefully.

---

## 🗄️ Database migrations

```bash
# Development — creates a migration and applies it
npx prisma migrate dev --name <name>

# Production — applies committed migrations (used in the Render build)
npx prisma migrate deploy

# Inspect data
npm run prisma:studio
```

### Models

- **User** — account, plan, Stripe customer id.
- **Subscription** — Stripe subscription mirror (status, plan, period end).
- **Generation** — saved content packs (input, tone, platforms, output JSON).
- **Usage** — per-user, per-month generation counter for quota enforcement.

---

## 💳 Stripe setup

1. **Create products & prices.** In the Stripe dashboard, create three recurring
   monthly prices:
   - Creator — $19/mo
   - Pro — $39/mo
   - Agency — $99/mo

   Copy each price id (`price_...`) into `STRIPE_PRICE_CREATOR`,
   `STRIPE_PRICE_PRO`, and `STRIPE_PRICE_AGENCY`.

2. **Add your secret key.** Put your `sk_...` key in `STRIPE_SECRET_KEY`.

3. **Set up the webhook.**

   **Local development** (with the [Stripe CLI](https://stripe.com/docs/stripe-cli)):

   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

   Copy the `whsec_...` it prints into `STRIPE_WEBHOOK_SECRET`.

   **Production:** In Stripe → Developers → Webhooks, add an endpoint:
   `https://YOUR_DOMAIN/api/stripe/webhook` and subscribe to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

   Copy the endpoint's signing secret into `STRIPE_WEBHOOK_SECRET`.

4. **Test the flow.** Use card `4242 4242 4242 4242`, any future expiry/CVC.
   On success the webhook updates the user's `plan` and `Subscription` row.

---

## ☁️ Deploy to Render

This repo includes a [`render.yaml`](./render.yaml) Blueprint.

1. Push the repo to GitHub.
2. In Render: **New → Blueprint**, select the repo. Render provisions the
   PostgreSQL database and the web service.
3. Set the secret env vars in the service (OpenAI + Stripe + `NEXT_PUBLIC_APP_URL`).
   `DATABASE_URL` and `AUTH_SECRET` are wired automatically.
4. Deploy. The build command runs migrations automatically:

   - **Build command:** `npm install && npx prisma migrate deploy && npm run build`
   - **Start command:** `npm run start`
   - **Health check path:** `/api/health`

5. Add the production Stripe webhook (see [Stripe setup](#-stripe-setup)) using
   your Render URL.

> First deploy: if you have no migration files yet, run
> `npx prisma migrate dev --name init` locally and commit the generated
> `prisma/migrations/` folder so `migrate deploy` has something to apply.

---

## 📁 Project structure

```
src/
  app/
    (marketing)/        # Landing + pricing (public)
    (auth)/             # Login + signup
    (app)/              # Dashboard + settings (protected)
    api/
      auth/             # signup / login / logout
      generate/         # AI generation endpoint
      generations/[id]/ # delete a generation
      stripe/           # checkout / portal / webhook
      health/
  components/
    ui/                 # shadcn-style primitives
    marketing/ dashboard/ auth/
  lib/
    auth.ts openai.ts stripe.ts prisma.ts usage.ts
    plans.ts validation.ts rate-limit.ts export.ts content-types.ts
prisma/schema.prisma
```

---

## 🧭 What's next (post-MVP)

- Email verification + password reset.
- Swap custom auth for Supabase/Clerk if SSO is needed.
- Multi-brand workspaces for the Agency plan.
- Direct publishing / scheduling integrations (Instagram, TikTok, X).
- Regenerate individual sections; tone/length controls per section.
- Move rate limiting + usage to Redis/Upstash for multi-instance scale.
- Team collaboration & roles.
- Analytics on generated content performance.

---

## 📝 License

Proprietary — all rights reserved.
