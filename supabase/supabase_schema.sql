-- =========================================================================
-- azentio.ai Enterprise Supabase PostgreSQL Schema
-- Project: azentio (https://vclkcpzuqkjkuuvttvoq.supabase.co)
-- In accordance with §6, §7, §8 of SOURCE_OF_TRUTH.md
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ORGANISATIONS TABLE
CREATE TABLE IF NOT EXISTS public.organisations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    domain TEXT NOT NULL UNIQUE,
    tier TEXT NOT NULL DEFAULT 'Enterprise',
    entitled_offerings TEXT[] NOT NULL DEFAULT '{}',
    member_count INT NOT NULL DEFAULT 0,
    synthetic BOOLEAN NOT NULL DEFAULT true,
    type TEXT NOT NULL DEFAULT 'client', -- 'platform' | 'client'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    -- SECURITY: passwords are stored as bcrypt hashes (cost=12). Never store plain text.
    password_hash TEXT NOT NULL,
    org_id TEXT NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    platform_grants TEXT[] NOT NULL DEFAULT '{}',
    memberships JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_verified_employee BOOLEAN NOT NULL DEFAULT false,
    avatar TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY DEFAULT ('aud-' || uuid_generate_v4()),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actor_id TEXT NOT NULL,
    actor_email TEXT NOT NULL,
    action TEXT NOT NULL,
    resource_kind TEXT NOT NULL,
    resource_id TEXT NOT NULL,
    details TEXT NOT NULL,
    ip TEXT
);

-- 4. CONTRIBUTIONS TABLE (Client observations in draft/submitted/triaged/withdrawn state)
CREATE TABLE IF NOT EXISTS public.contributions (
    id TEXT PRIMARY KEY,
    author_id TEXT NOT NULL,
    org_id TEXT NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
    offering_id TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    consents JSONB NOT NULL DEFAULT '{"aggregateTrends": true, "productImprovement": true, "deidentifiedSharing": true, "researchBenchmarking": true}'::jsonb,
    state TEXT NOT NULL DEFAULT 'draft', -- 'draft' | 'submitted' | 'triaged' | 'withdrawn'
    moderation_notes TEXT,
    sensitivity_flags TEXT[] NOT NULL DEFAULT '{}',
    submitted_at TIMESTAMPTZ,
    withdrawn_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PUBLISHED OBSERVATIONS TABLE (De-identified Shared Catalog)
CREATE TABLE IF NOT EXISTS public.published_observations (
    id TEXT PRIMARY KEY,
    source_contribution_id TEXT,
    offering_id TEXT NOT NULL,
    title TEXT NOT NULL,
    sanitized_text TEXT NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    synthetic BOOLEAN NOT NULL DEFAULT true
);

-- 6. THEMES TABLE (Safe macro trends with MIN_DISTINCT_ORGS >= 3)
CREATE TABLE IF NOT EXISTS public.themes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    distinct_orgs INT NOT NULL DEFAULT 3,
    contributing_org_ids TEXT[] NOT NULL DEFAULT '{}',
    votes INT NOT NULL DEFAULT 0,
    voted_org_ids TEXT[] NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'active'
);

-- 7. DEMO ENQUIRIES & HACKATHON REGISTRATIONS
CREATE TABLE IF NOT EXISTS public.demo_enquiries (
    id TEXT PRIMARY KEY DEFAULT ('enq-' || uuid_generate_v4()),
    full_name TEXT NOT NULL,
    work_email TEXT NOT NULL,
    company_name TEXT NOT NULL,
    offering_slug TEXT NOT NULL,
    message TEXT NOT NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hackathon_registrations (
    id TEXT PRIMARY KEY DEFAULT ('reg-' || uuid_generate_v4()),
    full_name TEXT NOT NULL,
    work_email TEXT NOT NULL,
    track TEXT NOT NULL,
    team_size INT NOT NULL DEFAULT 1,
    notes TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================================
-- PUBLIC ENTERPRISE TABLES (In accordance with azentio_website_research.md)
-- =========================================================================

-- 8. PRODUCT DOMAINS (Banking, Capital Markets, Risk & Compliance, Insurance, ERP)
CREATE TABLE IF NOT EXISTS public.product_domains (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    tagline TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_name TEXT NOT NULL,
    stats JSONB NOT NULL DEFAULT '[]'::jsonb,
    highlights TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. PRODUCTS (Individual products mapped to their domains)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    domain_id TEXT NOT NULL REFERENCES public.product_domains(id) ON DELETE CASCADE,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    tagline TEXT NOT NULL,
    summary TEXT NOT NULL,
    description TEXT NOT NULL,
    features TEXT[] NOT NULL DEFAULT '{}',
    capabilities JSONB NOT NULL DEFAULT '[]'::jsonb,
    target_audience TEXT[] NOT NULL DEFAULT '{}',
    deployment_models TEXT[] NOT NULL DEFAULT '{}',
    compliance_or_certifications TEXT[] NOT NULL DEFAULT '{}',
    metrics JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. LEADERSHIP (Executive leadership & Board of directors)
CREATE TABLE IF NOT EXISTS public.leaders (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('executive', 'board')),
    bio TEXT NOT NULL,
    previous_roles TEXT,
    avatar_url TEXT,
    linkedin_url TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. PRESENCE (Global offices & innovation hubs - 19 locations)
CREATE TABLE IF NOT EXISTS public.presence_offices (
    id TEXT PRIMARY KEY,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    region TEXT NOT NULL,
    is_headquarters BOOLEAN NOT NULL DEFAULT false,
    type TEXT NOT NULL,
    address TEXT,
    established TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. CUSTOMER CASE STUDIES & TESTIMONIALS
CREATE TABLE IF NOT EXISTS public.customer_stories (
    id TEXT PRIMARY KEY,
    client_name TEXT NOT NULL,
    domain TEXT NOT NULL,
    country TEXT NOT NULL,
    title TEXT NOT NULL,
    challenge TEXT NOT NULL,
    solution TEXT NOT NULL,
    outcomes TEXT[] NOT NULL DEFAULT '{}',
    quote TEXT,
    quote_author TEXT,
    quote_role TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. AWARDS & ANALYST RECOGNITIONS
CREATE TABLE IF NOT EXISTS public.industry_awards (
    id TEXT PRIMARY KEY,
    year INT NOT NULL,
    title TEXT NOT NULL,
    organization TEXT NOT NULL,
    category TEXT NOT NULL,
    product_ref TEXT NOT NULL,
    badge_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. BLOGS & RESEARCH ARTICLES
CREATE TABLE IF NOT EXISTS public.blogs (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    domain TEXT NOT NULL,
    author TEXT NOT NULL,
    published_date DATE NOT NULL DEFAULT CURRENT_DATE,
    read_time TEXT NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. CAREERS & OPEN VACANCIES
CREATE TABLE IF NOT EXISTS public.career_positions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    department TEXT NOT NULL,
    location TEXT NOT NULL,
    employment_type TEXT NOT NULL,
    experience_level TEXT NOT NULL,
    description TEXT NOT NULL,
    responsibilities TEXT[] NOT NULL DEFAULT '{}',
    requirements TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. CONTACT US ENTRIES
CREATE TABLE IF NOT EXISTS public.contact_enquiries (
    id TEXT PRIMARY KEY DEFAULT ('cnt-' || uuid_generate_v4()),
    full_name TEXT NOT NULL,
    work_email TEXT NOT NULL,
    company_name TEXT NOT NULL,
    country TEXT NOT NULL,
    interest_domain TEXT NOT NULL,
    message TEXT NOT NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on all tables (Deny by default policy)
ALTER TABLE public.organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.published_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathon_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presence_offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_enquiries ENABLE ROW LEVEL SECURITY;

-- Allow read access for application queries
CREATE POLICY "Public read for organisations" ON public.organisations FOR SELECT USING (true);
CREATE POLICY "Public read for users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Public read for published observations" ON public.published_observations FOR SELECT USING (true);
CREATE POLICY "Public read for themes" ON public.themes FOR SELECT USING (true);
CREATE POLICY "Public read for product domains" ON public.product_domains FOR SELECT USING (true);
CREATE POLICY "Public read for products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public read for leaders" ON public.leaders FOR SELECT USING (true);
CREATE POLICY "Public read for presence offices" ON public.presence_offices FOR SELECT USING (true);
CREATE POLICY "Public read for customer stories" ON public.customer_stories FOR SELECT USING (true);
CREATE POLICY "Public read for industry awards" ON public.industry_awards FOR SELECT USING (true);
CREATE POLICY "Public read for blogs" ON public.blogs FOR SELECT USING (true);
CREATE POLICY "Public read for career positions" ON public.career_positions FOR SELECT USING (true);
CREATE POLICY "Public insert for contact enquiries" ON public.contact_enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert for demo enquiries" ON public.demo_enquiries FOR INSERT WITH CHECK (true);

-- Insert initial seed organisations
INSERT INTO public.organisations (id, name, slug, domain, tier, entitled_offerings, member_count, synthetic, type)
VALUES
    ('org-azentio', 'Azentio Platform', 'azentio', 'azentio.com', 'Enterprise', ARRAY['offering-fai', 'offering-cbe', 'offering-aml', 'offering-dls'], 5, true, 'platform'),
    ('org-abcd', 'ABCD Technologies', 'abcd', 'abcd.in', 'Enterprise', ARRAY['offering-fai', 'offering-cbe', 'offering-aml'], 2, true, 'client'),
    ('org-xyz', 'XYZ Global', 'xyz', 'xyz.com', 'Enterprise', ARRAY['offering-fai', 'offering-dls'], 2, true, 'client'),
    ('org-cedar', 'Cedar Capital', 'cedar', 'cedar.synthetic', 'Enterprise', ARRAY['offering-fai', 'offering-dls'], 1, true, 'client')
ON CONFLICT (id) DO NOTHING;

-- Insert initial seed users
-- SECURITY: passwords are bcrypt hashed (cost=12). Plain text passwords are listed
-- in comments for reference ONLY during initial dev — remove these comments before production.
INSERT INTO public.users (id, name, email, password_hash, org_id, role, platform_grants, memberships, is_verified_employee)
VALUES
    -- plain: emp123
    ('usr-employee-nithesh', 'Nithesh M', 'nithesh_m@azentio.com', '$2b$12$YjgZc3FyHXUgWY6XEBWDhOWdlb0zJDAvezw3VaFvMAVwWd7Iesjvq', 'org-azentio', 'employee', '{}', '[]', true),
    -- plain: learning123
    ('usr-mod-pranika', 'Pranika K', 'pranika_k@azentio.com', '$2b$12$7h3GgC7t1038PuQFsrbb0.9VcaYeg5NkpPqGAPZ4YQpc3SrYlbVP6', 'org-azentio', 'learning_moderator', ARRAY['learning_moderator'], '[]', true),
    -- plain: content123
    ('usr-pub-nishanth', 'Nishanth E', 'nishanth_e@azentio.com', '$2b$12$iKg9a6JKQNyEWN95ivwcV.BokVRIqyEKt9l9IycHghSJKfFJIh0X6', 'org-azentio', 'content_publisher', ARRAY['content_publisher'], '[]', true),
    -- plain: product123
    ('usr-po-lewis', 'Lewis Hamilton', 'lewis_hamilton@azentio.com', '$2b$12$lRmpIL0xoji2rAMdO67A.eYPPZiYLXB5uqOt5dK7bPYvCi0VZIHa.', 'org-azentio', 'product_owner', ARRAY['product_owner'], '[]', true),
    -- plain: admin123
    ('usr-admin-max', 'Max Verstappen', 'max_verstappen@azentio.com', '$2b$12$zYeSW/YRqDbMhafRyioy..npvyhUOuRziIFZheT7WDh55B/Y6oay.', 'org-azentio', 'portal_admin', ARRAY['portal_admin', 'learning_moderator', 'content_publisher', 'product_owner'], '[]', true),
    -- plain: cleint123
    ('usr-client-virat', 'Virat Kohli', 'virat_kohli@abcd.in', '$2b$12$Ehgk0TKD/JyNIMdjjjFn3Ocu0h6XZYoATXnbqXwi8q78Bd6mbPxTi', 'org-abcd', 'client_member', '{}', '[{"orgId": "org-abcd", "role": "client_member", "status": "active"}]'::jsonb, false),
    -- plain: admin123
    ('usr-client-dhoni', 'MS Dhoni', 'dhoni.ms@xyz.com', '$2b$12$RdQs1p7PP/LfmRlkf3LR9.c4Rya.8NcYVa3ecefCFYpFM96BCi3Dm', 'org-xyz', 'client_admin', '{}', '[{"orgId": "org-xyz", "role": "client_admin", "status": "active"}]'::jsonb, false),
    -- plain: multiorg123
    ('usr-client-hardik', 'Hardik Pandya', 'hardik.pandya@xyz.com', '$2b$12$eYDn4dTFwYxWLGU8ZkMLg.BvvZN9V18ogDpnV4UljbcWGZuJx8bgG', 'org-xyz', 'client_member', '{}', '[{"orgId": "org-xyz", "role": "client_member", "status": "active"}, {"orgId": "org-abcd", "role": "client_member", "status": "active"}]'::jsonb, false)
ON CONFLICT (id) DO NOTHING;

