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
    password TEXT NOT NULL DEFAULT 'azentio123',
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

-- Enable Row Level Security (RLS) on all tables (Deny by default policy)
ALTER TABLE public.organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.published_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hackathon_registrations ENABLE ROW LEVEL SECURITY;

-- Allow read access for application queries
CREATE POLICY "Public read for organisations" ON public.organisations FOR SELECT USING (true);
CREATE POLICY "Public read for users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Public read for published observations" ON public.published_observations FOR SELECT USING (true);
CREATE POLICY "Public read for themes" ON public.themes FOR SELECT USING (true);

-- Insert initial seed organisations
INSERT INTO public.organisations (id, name, slug, domain, tier, entitled_offerings, member_count, synthetic, type)
VALUES
    ('org-azentio', 'Azentio Platform', 'azentio', 'azentio.com', 'Enterprise', ARRAY['offering-fai', 'offering-cbe', 'offering-aml', 'offering-dls'], 5, true, 'platform'),
    ('org-abcd', 'ABCD Technologies', 'abcd', 'abcd.in', 'Enterprise', ARRAY['offering-fai', 'offering-cbe', 'offering-aml'], 2, true, 'client'),
    ('org-xyz', 'XYZ Global', 'xyz', 'xyz.com', 'Enterprise', ARRAY['offering-fai', 'offering-dls'], 2, true, 'client'),
    ('org-cedar', 'Cedar Capital', 'cedar', 'cedar.synthetic', 'Enterprise', ARRAY['offering-fai', 'offering-dls'], 1, true, 'client')
ON CONFLICT (id) DO NOTHING;

-- Insert initial seed users
INSERT INTO public.users (id, name, email, password, org_id, role, platform_grants, memberships, is_verified_employee)
VALUES
    ('usr-employee-nithesh', 'Nithesh M', 'nithesh_m@azentio.com', 'emp123', 'org-azentio', 'employee', '{}', '[]', true),
    ('usr-mod-pranika', 'Pranika K', 'pranika_k@azentio.com', 'learning123', 'org-azentio', 'learning_moderator', ARRAY['learning_moderator'], '[]', true),
    ('usr-pub-nishanth', 'Nishanth E', 'nishanth_e@azentio.com', 'content123', 'org-azentio', 'content_publisher', ARRAY['content_publisher'], '[]', true),
    ('usr-po-lewis', 'Lewis Hamilton', 'lewis_hamilton@azentio.com', 'product123', 'org-azentio', 'product_owner', ARRAY['product_owner'], '[]', true),
    ('usr-admin-max', 'Max Verstappen', 'max_verstappen@azentio.com', 'admin123', 'org-azentio', 'portal_admin', ARRAY['portal_admin', 'learning_moderator', 'content_publisher', 'product_owner'], '[]', true),
    ('usr-client-virat', 'Virat Kohli', 'virat_kohli@abcd.in', 'cleint123', 'org-abcd', 'client_member', '{}', '[{"orgId": "org-abcd", "role": "client_member", "status": "active"}]'::jsonb, false),
    ('usr-client-dhoni', 'MS Dhoni', 'dhoni.ms@xyz.com', 'admin123', 'org-xyz', 'client_admin', '{}', '[{"orgId": "org-xyz", "role": "client_admin", "status": "active"}]'::jsonb, false),
    ('usr-client-hardik', 'Hardik Pandya', 'hardik.pandya@xyz.com', 'multiorg123', 'org-xyz', 'client_member', '{}', '[{"orgId": "org-xyz", "role": "client_member", "status": "active"}, {"orgId": "org-abcd", "role": "client_member", "status": "active"}]'::jsonb, false)
ON CONFLICT (id) DO NOTHING;
