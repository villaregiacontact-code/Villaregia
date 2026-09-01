-- =====================================================================
-- VILLA REGIA — SUPABASE DATABASE SCHEMA & SEED SCRIPT (IDEMPOTENT)
-- Copy and paste this script directly into your Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New Query -> Run
-- =====================================================================

-- 1. Create Enums Safely
DO $$ BEGIN
    CREATE TYPE universe_type AS ENUM ('VENTE', 'RESIDENCE', 'LUXE', 'EVENT');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE property_status AS ENUM ('DISPONIBLE', 'RESERVE', 'VENDU', 'LOUE', 'SOUS_OFFRE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'ADMIN', 'AGENT', 'CONTENT_MANAGER');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. Create Properties Table
CREATE TABLE IF NOT EXISTS properties (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title JSONB NOT NULL,
    universe universe_type NOT NULL DEFAULT 'VENTE',
    category TEXT NOT NULL,
    price JSONB NOT NULL,
    location JSONB NOT NULL,
    specs JSONB NOT NULL,
    images JSONB NOT NULL DEFAULT '[]'::jsonb,
    description JSONB NOT NULL,
    story JSONB,
    amenities TEXT[] DEFAULT '{}',
    status property_status NOT NULL DEFAULT 'DISPONIBLE',
    is_featured BOOLEAN DEFAULT FALSE,
    is_new BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY DEFAULT ('res-' || floor(random() * 900000 + 100000)::text),
    property_id TEXT REFERENCES properties(id) ON DELETE CASCADE,
    property_title TEXT NOT NULL,
    guest_name TEXT NOT NULL,
    guest_email TEXT NOT NULL,
    guest_phone TEXT NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guests_count INT NOT NULL DEFAULT 1,
    total_nights INT NOT NULL,
    price_per_night NUMERIC NOT NULL,
    total_amount NUMERIC NOT NULL,
    deposit_amount NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Leads / CRM Table
CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY DEFAULT ('lead-' || gen_random_uuid()::text),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'Formulaire Contact',
    universe universe_type NOT NULL DEFAULT 'VENTE',
    property_title TEXT,
    status TEXT NOT NULL DEFAULT 'Nouveau',
    notes TEXT,
    assigned_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Owner Submissions Table ("Proposer un bien")
CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY DEFAULT ('prop-sub-' || gen_random_uuid()::text),
    property_type TEXT NOT NULL,
    objective universe_type NOT NULL,
    surface_m2 NUMERIC NOT NULL,
    bedrooms INT,
    estimated_value NUMERIC,
    city TEXT NOT NULL,
    district TEXT NOT NULL,
    address TEXT,
    owner_name TEXT NOT NULL,
    owner_phone TEXT NOT NULL,
    owner_email TEXT,
    details TEXT,
    photos JSONB DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'NOUVEAU',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Indexes for Maximum Performance
CREATE INDEX IF NOT EXISTS idx_properties_universe ON properties(universe);
CREATE INDEX IF NOT EXISTS idx_properties_category ON properties(category);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

-- 7. Seed Initial Signature Properties
INSERT INTO properties (id, title, universe, category, price, location, specs, images, description, status, is_featured, is_new)
VALUES 
(
    'vr-soukra-01',
    '{"fr": "Domaine de la Soukra — Villa de Maître & Piscine Oliviers", "ar": "قصر السكرة — فيلا فاخرة وحمام سباحة بين الزيتون", "en": "La Soukra Estate — Master Villa & Olive Pool"}'::jsonb,
    'LUXE',
    'Villa',
    '{"amount": 1450, "currency": "TND", "period": "nuit"}'::jsonb,
    '{"city": "Sfax", "district": "Route de la Soukra", "country": "Tunisie", "lat": 34.7431, "lng": 10.7412, "isExactPosition": false}'::jsonb,
    '{"surfaceM2": 680, "bedrooms": 5, "bathrooms": 5, "livingRooms": 3, "parkingSpaces": 4, "pool": true, "garden": true, "guestCapacity": 12}'::jsonb,
    '[{"url": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85", "alt": "Façade contemporaine Villa la Soukra Sfax", "isCover": true}]'::jsonb,
    '{"fr": "Une résidence d’exception nichée au cœur d’un parc privé d’oliviers centenaires sur la Route de la Soukra à Sfax. Alliant architecture épurée méditerranéenne et touches de marbre noble.", "ar": "إقامة استثنائية تقع في قلب حديقة خاصة من أشجار الزيتون المعمرة.", "en": "An exceptional residence nestled in the heart of a private park of century-old olive trees."}'::jsonb,
    'DISPONIBLE',
    true,
    true
)
ON CONFLICT (id) DO NOTHING;

-- Confirmation Query
SELECT count(*) AS total_properties FROM properties;
