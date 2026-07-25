# Kazi Manufacturing — Frontend

Custom apparel manufacturing platform for UK clothing brands. Built with Next.js 14, Tailwind CSS, GSAP, and Supabase.

**Live:** [kazimfg.com](https://kazimfg.com) &nbsp;·&nbsp; **Repo:** [jenithroy/kazi-platform](https://github.com/jenithroy/kazi-platform)

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + inline styles |
| Animation | GSAP + Lenis smooth scroll |
| 3D | Three.js / React Three Fiber |
| Database | Supabase (Postgres + Auth + Storage) |
| Payments | Stripe |
| Email | Resend |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project
- A Stripe account (for payments)
- A Resend account (for email)

### 1. Clone & install

```bash
git clone https://github.com/jenithroy/kazi-platform.git
cd kazi-platform/app
npm install
```

### 2. Environment variables

Create `app/.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Resend
RESEND_API_KEY=your_resend_api_key

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Set up the database

Run the migrations in order against your Supabase project:

```bash
# Via Supabase CLI
supabase db push

# Or manually in the Supabase SQL editor:
# app/supabase/migrations/001_initial_schema.sql
# app/supabase/migrations/002_quote_customization.sql
# app/supabase/migrations/003_storage_bucket.sql
# app/supabase/migrations/004_audit_logs.sql
# app/supabase/migrations/005_set_admin.sql
```

### 4. Run locally

```bash
cd app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
app/
├── public/
│   ├── images/          # Hero, product, editorial images
│   ├── logos/           # Kazi logo variants
│   ├── models/          # 3D GLB models (hoodie, tshirt)
│   └── videos/          # Hero background video
├── src/
│   ├── app/             # Next.js App Router pages
│   │   ├── admin/       # Admin dashboard (orders, pricing, users)
│   │   ├── auth/        # Login, register, forgot password
│   │   ├── collections/ # Product collection pages
│   │   ├── studio/      # Studio — custom order configurator
│   │   ├── dashboard/   # Customer dashboard & order tracking
│   │   ├── factory/     # Factory/employee view
│   │   ├── pricing/     # Pricing calculator
│   │   ├── quote/       # Enquiry / get a quote
│   │   └── services/    # Our Heritage page
│   ├── components/      # Shared UI components
│   ├── sections/        # Homepage sections
│   ├── hooks/           # Custom React hooks
│   └── lib/             # Supabase, Stripe, newsletter clients
└── supabase/
    └── migrations/      # Database schema migrations
```

---

## Key Pages

| Route | Description |
|---|---|
| `/` | Homepage — hero, story, products, press |
| `/studio` | Studio — custom collection configurator |
| `/quote` | Enquire / get a quote |
| `/pricing` | Pricing calculator |
| `/services` | Our Heritage |
| `/dashboard` | Customer order dashboard |
| `/admin` | Admin panel (role-gated) |
| `/factory` | Factory employee view (role-gated) |

---

## Brand

- **Headquarters:** Kathmandu, Nepal
- **Serves:** UK clothing brands
- **MOQ:** 50 units
- **Import duty:** 0% to UK
- **Colour:** `#1B3D2A` forest green · `#EBF3EC` sage · `#3A7D44` accent

---

## License

Private — © 2015–2026 Kazi Manufacturing Ltd, Kathmandu, Nepal.
