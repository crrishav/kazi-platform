-- ============================================================
-- Sukkha Citta - Supabase Database Schema
-- ============================================================

-- 1. Create the products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    price_gbp NUMERIC(10, 2) NOT NULL,
    colors TEXT[] DEFAULT NULL,
    is_gender_neutral BOOLEAN DEFAULT FALSE,
    image_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security on products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read products
CREATE POLICY "Allow public read access on products"
    ON products
    FOR SELECT
    USING (true);

-- 2. Create the insiders_newsletter table
CREATE TABLE IF NOT EXISTS insiders_newsletter (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security on insiders_newsletter
ALTER TABLE insiders_newsletter ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (subscribe)
CREATE POLICY "Allow public insert on insiders_newsletter"
    ON insiders_newsletter
    FOR INSERT
    WITH CHECK (true);

-- Allow admin to read
CREATE POLICY "Allow admin read on insiders_newsletter"
    ON insiders_newsletter
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- 3. Seed data for products
INSERT INTO products (name, slug, price_gbp, colors, is_gender_neutral, image_url)
VALUES
    ('PERTIWI WRAP IN ANYAM', 'pertiwi-wrap-in-anyam', 222.30, NULL, FALSE, '/images/product-wrap.jpg'),
    ('PERTIWI KEBAYA', 'pertiwi-kebaya', 183.30, ARRAY['#8FA89B', '#1F2E22', '#6B6B4E', '#F5F3EE'], FALSE, '/images/product-kebaya-black.jpg'),
    ('PERTIWI KEBAYA IN SELAH', 'pertiwi-kebaya-in-selah', 272.44, NULL, FALSE, '/images/product-kebaya-cream.jpg'),
    ('WEEKEND SHIRT', 'weekend-shirt', 222.30, NULL, TRUE, '/images/product-weekend.jpg')
ON CONFLICT (slug) DO NOTHING;

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_gender_neutral ON products(is_gender_neutral);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON insiders_newsletter(email);
