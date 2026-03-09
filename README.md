# ContentCascade

Turn one idea into a week of content. ContentCascade is an AI-powered SaaS application that repurposes your content into optimized posts for LinkedIn, Twitter/X, and TikTok.

## Features

- **AI Content Generation** — Paste any text and instantly get platform-optimized posts
- **Multi-Platform Support** — LinkedIn posts, Twitter threads, and TikTok scripts
- **A/B/C Variants** — Three creative variations per platform for testing
- **Hook Generator** — AI-suggested hooks to maximize engagement
- **Tone Presets** — Professional, Viral, Storytelling, Educational, Controversial, Minimalist
- **Usage Dashboard** — Browse and copy all your previously generated content
- **Subscription Billing** — Free, Creator ($15/mo), and Pro ($29/mo) plans via Stripe

## Tech Stack

- [Next.js 14](https://nextjs.org) (App Router, TypeScript)
- [TailwindCSS](https://tailwindcss.com) for styling
- [Supabase](https://supabase.com) for database and auth (email/password + Google OAuth)
- [Stripe](https://stripe.com) for subscription billing
- [OpenAI](https://openai.com) for content generation (gpt-4o-mini)

## Getting Started

### 1. Clone and install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` — Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` — Your Supabase service role key (for webhooks)
- `OPENAI_API_KEY` — Your OpenAI API key
- `STRIPE_SECRET_KEY` — Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET` — Your Stripe webhook signing secret
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — Your Stripe publishable key
- `STRIPE_CREATOR_PRICE_ID` — Stripe price ID for the Creator plan
- `STRIPE_PRO_PRICE_ID` — Stripe price ID for the Pro plan
- `NEXT_PUBLIC_STRIPE_CREATOR_PRICE_ID` — Same as above (exposed to client)
- `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` — Same as above (exposed to client)
- `NEXT_PUBLIC_APP_URL` — Your app URL (e.g., `http://localhost:3000`)

### 3. Set up Supabase

Run the SQL schema from `supabase/schema.sql` in your Supabase project's SQL editor.

### 4. Set up Stripe

1. Create two subscription products in your Stripe dashboard: Creator ($15/mo) and Pro ($29/mo)
2. Copy the price IDs to your `.env.local`
3. Configure a webhook endpoint pointing to `{your-url}/api/stripe/webhook` with events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

Deploy to [Vercel](https://vercel.com) with all environment variables configured. Make sure to update `NEXT_PUBLIC_APP_URL` to your production URL and configure your Stripe webhook endpoint accordingly.

