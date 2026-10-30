-- =========================================================================
-- azentio.ai Enterprise Supabase PostgreSQL Schema Update
-- Migration: Add New Public Enterprise Tables & Update Existing Columns
-- Safe to run on existing database (uses IF NOT EXISTS & safe ALTER statements)
-- =========================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- 1. ALTER EXISTING TABLES (Apply security & column refinements safely)
-- =========================================================================

-- Safely ensure password_hash exists in users table (in case an older table has password)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'password'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'password_hash'
    ) THEN
        ALTER TABLE public.users RENAME COLUMN password TO password_hash;
    END IF;
END $$;

-- =========================================================================
-- 2. CREATE NEW PUBLIC ENTERPRISE TABLES
-- =========================================================================

-- 1. PRODUCT DOMAINS (Banking, Capital Markets, Risk & Compliance, Insurance, ERP)
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

-- 2. PRODUCTS (Mapped to product_domains via foreign key)
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

-- 3. LEADERSHIP (Executive Leadership Team & Board of Directors)
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

-- 4. PRESENCE (19 Global Operating Hubs & Offices)
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

-- 5. CUSTOMER CASE STUDIES & TESTIMONIALS
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

-- 6. AWARDS & ANALYST RECOGNITIONS
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

-- 7. BLOGS & RESEARCH PAPERS
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

-- 8. CAREERS & OPEN VACANCIES
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

-- 9. CONTACT US ENTRIES
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

-- =========================================================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS) FOR NEW TABLES
-- =========================================================================
ALTER TABLE public.product_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presence_offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_enquiries ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- 4. RLS POLICIES (DROP EXISTING THEN RE-CREATE SAFELY)
-- =========================================================================
DO $$
BEGIN
    -- Product Domains Policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read for product domains' AND tablename = 'product_domains') THEN
        CREATE POLICY "Public read for product domains" ON public.product_domains FOR SELECT USING (true);
    END IF;

    -- Products Policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read for products' AND tablename = 'products') THEN
        CREATE POLICY "Public read for products" ON public.products FOR SELECT USING (true);
    END IF;

    -- Leaders Policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read for leaders' AND tablename = 'leaders') THEN
        CREATE POLICY "Public read for leaders" ON public.leaders FOR SELECT USING (true);
    END IF;

    -- Presence Offices Policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read for presence offices' AND tablename = 'presence_offices') THEN
        CREATE POLICY "Public read for presence offices" ON public.presence_offices FOR SELECT USING (true);
    END IF;

    -- Customer Stories Policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read for customer stories' AND tablename = 'customer_stories') THEN
        CREATE POLICY "Public read for customer stories" ON public.customer_stories FOR SELECT USING (true);
    END IF;

    -- Industry Awards Policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read for industry awards' AND tablename = 'industry_awards') THEN
        CREATE POLICY "Public read for industry awards" ON public.industry_awards FOR SELECT USING (true);
    END IF;

    -- Blogs Policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read for blogs' AND tablename = 'blogs') THEN
        CREATE POLICY "Public read for blogs" ON public.blogs FOR SELECT USING (true);
    END IF;

    -- Career Positions Policy
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read for career positions' AND tablename = 'career_positions') THEN
        CREATE POLICY "Public read for career positions" ON public.career_positions FOR SELECT USING (true);
    END IF;

    -- Contact Enquiries Insert Policy (Public website visitors can submit inquiries)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public insert for contact enquiries' AND tablename = 'contact_enquiries') THEN
        CREATE POLICY "Public insert for contact enquiries" ON public.contact_enquiries FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- =========================================================================
-- 5. INITIAL SEED DATA FOR NEW TABLES (Safe ON CONFLICT DO NOTHING)
-- =========================================================================

-- Seed 5 Product Domains
INSERT INTO public.product_domains (id, slug, name, tagline, description, icon_name, stats, highlights)
VALUES
    ('domain-banking', 'banking', 'Banking', 'AAOIFI-Certified Islamic & Core Banking Platforms', 'Purpose-built banking technology engineered for Islamic finance, digital transformation, retail & corporate banking, treasury, trade finance and microfinance operations.', 'Landmark', '[{"label": "Countries Supported", "value": "36+"}, {"label": "Branches Powered", "value": "6,000+"}, {"label": "Customer Accounts", "value": "25M+"}, {"label": "Assets Managed", "value": "$500B+"}]'::jsonb, ARRAY['AAOIFI-certified Shari’ah compliance', 'iMAL Islamic Core Banking engine', 'Integrated Islamic profit pool calculation', 'API-first & cloud-native architecture']),
    ('domain-capital-markets', 'capital-markets', 'Capital Markets', 'End-to-End Asset, Fund Administration & Wealth Management', 'Integrated front-to-back office solutions for mutual funds, wealth advisory, investor servicing and portfolio management powering leading tier-1 asset management firms.', 'TrendingUp', '[{"label": "Institutional Clients", "value": "36+"}, {"label": "Top Fund Houses", "value": "Top 15"}, {"label": "Front-to-Back Flow", "value": "100%"}, {"label": "Asset Classes", "value": "Multi-Asset"}]'::jsonb, ARRAY['MFund Plus front-to-back asset management', 'MFund ISS investor servicing & fund administration', 'MFund Plus WMS client digital wealth advisory', 'Deep regulatory automation across emerging markets']),
    ('domain-risk-compliance', 'risk-compliance', 'Risk & Compliance', 'AI-Powered Financial Crime Prevention & AML Surveillance', 'AMLOCK surveillance suite delivers real-time transaction monitoring, KYC onboarding, sanctions screening, and trade-based AML intelligence with vector-based matching.', 'ShieldAlert', '[{"label": "Accounts Protected", "value": "800M+"}, {"label": "False Positive Drop", "value": "40%"}, {"label": "Compliance Cost Drop", "value": "20%"}, {"label": "MX Formats Screened", "value": "25+"}]'::jsonb, ARRAY['Chartis Category Leader in AML Transaction Monitoring', 'Celent Noteworthy KYC Orchestration', 'Real-time PEP & watchlist fuzzy matching across scripts', 'Automated trade-based AML & vessel tracking']),
    ('domain-insurance', 'insurance', 'Insurance', 'Unified Core Policy, Claims Automation & Takaful Operations', 'Comprehensive insurance platforms powering General, Health, Life and Takaful insurers with automated FNOL-to-settlement workflows and omni-channel broker portals.', 'HeartPulse', '[{"label": "Insurer Clients", "value": "100+"}, {"label": "Preconfigured Products", "value": "40+"}, {"label": "Claims Cycle Speedup", "value": "65%"}, {"label": "Operating Models", "value": "Conventional & Takaful"}]'::jsonb, ARRAY['Premia Core Insurance suite', 'Automated claims lifecycle from FNOL to payment', 'General, Health, Life and Shari’ah Takaful models', 'Multi-currency, multilingual & regional reinsurance']),
    ('domain-erp', 'erp', 'ERP', 'Cloud-Native Orion ERP for Process Manufacturing & Trade', 'Orion Cloud ERP unifies distribution, contracting, financial accounting and process manufacturing with real-time supply chain analytics and e-invoicing compliance.', 'Boxes', '[{"label": "Enterprise Deployments", "value": "1,000+"}, {"label": "Deployment Timeline", "value": "3-6 Mos"}, {"label": "Supply Chain Sync", "value": "Real-time"}, {"label": "Pre-Approved E-Invoice", "value": "ZATCA / UAE"}]'::jsonb, ARRAY['Orion Distribution Cloud with batch traceability', 'Orion Manufacturing Cloud with shop-floor MRP', 'Orion Contracting Cloud for infrastructure & projects', 'Gartner Peer Insights Voice of Customer recognized'])
ON CONFLICT (id) DO NOTHING;

-- Seed Sample Key Products
INSERT INTO public.products (id, domain_id, slug, name, tagline, summary, description, features, capabilities, target_audience, deployment_models, compliance_or_certifications)
VALUES
    ('prod-imal-islamic-banking', 'domain-banking', 'imal-islamic-banking', 'Azentio iMAL Islamic Banking Platform', 'World-Leading AAOIFI-Certified Islamic Core Banking Engine', 'Complete Shari’ah-compliant core banking suite covering retail, corporate, treasury, investment and inclusive microfinance.', 'Azentio iMAL is recognized by the Global Islamic Finance Awards (GIFA) as the Best Islamic Banking Core System 2026. Built on AAOIFI accounting standards across 36 countries and over $500B in financial assets.', ARRAY['AAOIFI Shari’ah Compliance Certification across all modules', 'Multi-entity, multi-branch, and multi-currency ledger operations', 'Parameter-driven contract structures: Murabaha, Mudarabah, Musharakah, Ijara, and Istisna', 'Real-time customer 360 profile with regulatory reporting'], '[{"title": "Shari’ah Contract Lifecycle", "description": "End-to-end automation of complex Islamic financing agreements with deterministic audit trails."}, {"title": "Profit Calculation System (PCS)", "description": "Automated, mathematically transparent pool distribution and reserve management preventing unfair returns."}]'::jsonb, ARRAY['Islamic Banks & Window Operations', 'Central Banks & Monetary Authorities'], ARRAY['Cloud-Native (SaaS)', 'Hybrid Cloud', 'Private Banking Cloud'], ARRAY['AAOIFI Certified', 'IFSB Compliant', 'ISO 20022']),
    ('prod-mfund-plus', 'domain-capital-markets', 'mfund-plus', 'Azentio MFund Plus', 'Comprehensive Front-to-Back Office Investment Management Platform', 'Web-based asset management software powering portfolio construction, pre-trade compliance, order routing, and NAV accounting.', 'Azentio MFund Plus handles substantial portions of mutual fund AUM in fast-growing markets like India and Southeast Asia. Used by institutions among top 15 fund houses.', ARRAY['Multi-asset class support: Equities, Fixed Income, Derivatives, Sukuk, and Commodities', 'Real-time pre-trade limit checking and mandate compliance', 'Automated multi-currency Net Asset Value (NAV) computation'], '[{"title": "Front-to-Back STP Processing", "description": "Seamless order execution to back-office clearing with zero manual re-keying."}]'::jsonb, ARRAY['Mutual Fund Houses', 'Asset Managers'], ARRAY['Private Cloud', 'Enterprise On-Premises'], ARRAY['SEBI Compliant', 'MAS Regulated Standards']),
    ('prod-amlock-aml', 'domain-risk-compliance', 'amlock-aml', 'Azentio AMLOCK Anti-Money Laundering & Surveillance', 'Chartis RiskTech Category Leader in AML Transaction Monitoring', 'AI and rule-based suspicious transaction detection, multi-scenario alerting, and case management.', 'Positioned as a Category Leader in Chartis RiskTech AML Transaction Monitoring Solutions 2026. AMLOCK analyzes millions of transactions daily with 40% fewer false alerts.', ARRAY['Hybrid detection engine: deterministic regulatory rules combined with machine learning', 'Automated Suspicious Activity Report (SAR / STR) narrative generation', 'Entity link analysis visualizing hidden relationship networks'], '[{"title": "Behavioral Anomaly Profiling", "description": "Identifies smurfing, rapid cross-border layering, and dormant account spikes."}]'::jsonb, ARRAY['Tier-1 Banks', 'FinTech Unicorns', 'Payment Aggregators'], ARRAY['High-Throughput SaaS', 'Private Cloud'], ARRAY['FATF Compliant', 'Wolfsberg Group Standards']),
    ('prod-premia-general-insurance', 'domain-insurance', 'general-insurance', 'Azentio Premia General Insurance Suite', 'Full Policy Lifecycle, Reinsurance & Underwriting for P&C Carriers', 'End-to-end administration for 40+ lines including motor, fire, marine, engineering, and property.', 'Recognized by Celent as a Noteworthy Solution in Claims Administration Systems. Unifies policy issuance, endorsements, reinsurance treaties, and accounting across conventional and Takaful models.', ARRAY['40+ pre-configured general insurance product blueprints', 'Dynamic multi-tier reinsurance allocation (Treaty & Facultative)', 'Automated tariff calculation and dynamic rate modification engine'], '[{"title": "Multi-Country Reinsurance Ledger", "description": "Calculates retention limits, treaty balances, and excess-of-loss claims instantaneously."}]'::jsonb, ARRAY['Property & Casualty Insurers', 'Takaful Operators'], ARRAY['Cloud', 'On-Premises'], ARRAY['IAIS Guidelines', 'IFRS 17 Certified']),
    ('prod-orion-distribution', 'domain-erp', 'orion-distribution-cloud', 'Orion Distribution Cloud ERP', 'Purpose-Built ERP for Chemical, FMCG & Wholesale Trading', 'Multi-warehouse logistics, batch traceability, expiry management, and supplier portals.', 'Adopted by distributors like M.H. Enterprises and Al Taher Chemicals. Engineered for stringent batch tracking, shelf-life management, and pre-approved e-invoicing.', ARRAY['Multi-warehouse real-time inventory visibility and bin allocation', 'Strict batch traceability and product recall automation', 'Automated purchase order workflows with price tolerance checks'], '[{"title": "Chemical & Perishable Traceability", "description": "Maintains end-to-end chain of custody from import container to retail delivery."}]'::jsonb, ARRAY['Chemical Traders', 'FMCG Distributors'], ARRAY['Cloud SaaS', 'Dedicated Cloud'], ARRAY['ZATCA Certified', 'UAE FTA Pre-Approved'])
ON CONFLICT (id) DO NOTHING;

-- Seed Leadership
INSERT INTO public.leaders (id, name, role, category, bio, previous_roles, sort_order)
VALUES
    ('lead-sanjay-singh', 'Sanjay Singh', 'Group Chief Executive Officer', 'executive', 'Sanjay Singh leads Azentio with decades of experience driving global enterprise software and technology organizations across Banking, Financial Services, and Insurance.', 'Senior Global Tech Executive', 1),
    ('lead-rahul-arora', 'Rahul Arora', 'Chief Sales Officer', 'executive', 'Oversees global commercial strategy, client acquisition, and strategic sales partnerships across Asia Pacific, Middle East, and Africa.', 'Global Head of Sales', 2),
    ('lead-gaurav-kedia', 'Gaurav Kedia', 'Chief Financial Officer', 'executive', 'Leads corporate finance, capital allocation, treasury, and statutory reporting across Azentio’s multi-national operating footprint.', 'CFO Technology Platforms', 3),
    ('lead-savitha-ramakrishna', 'Savitha Ramakrishna', 'General Counsel', 'executive', 'Responsible for legal governance, international regulatory compliance, IP portfolio protection, and corporate structuring.', 'Chief Legal Officer', 4),
    ('lead-emma-foley', 'Emma Foley', 'Chief Marketing Officer', 'executive', 'Drives Azentio’s brand positioning, product marketing, global communications, and client engagement initiatives.', 'Global CMO', 5),
    ('board-david-hamilton', 'David Hamilton', 'Chairman of the Board', 'board', 'Veteran financial-services technology executive; previously held senior operating leadership roles at Fiserv, SunGard, and global fintech platforms.', 'Fiserv & SunGard Executive', 10),
    ('board-roy-mackenzie', 'Roy Mackenzie', 'Director', 'board', 'Partner in Apax’s global technology team; joined Apax in 2003 and actively participates in investment and governance committees.', 'Partner, Apax Technology Team', 11)
ON CONFLICT (id) DO NOTHING;

-- Seed Key Regional Presence Hubs
INSERT INTO public.presence_offices (id, city, country, region, is_headquarters, type, address, established)
VALUES
    ('pres-singapore', 'Singapore', 'Singapore', 'Asia Pacific', true, 'Corporate HQ', 'Marina Bay Financial Centre, Singapore', '2020'),
    ('pres-dubai', 'Dubai', 'United Arab Emirates', 'Middle East', false, 'Regional Office', 'Dubai Internet City, Building 14, Dubai, UAE', 'Regional Hub'),
    ('pres-riyadh', 'Riyadh', 'Saudi Arabia', 'Middle East', false, 'Regional Office', 'King Fahd Road, Riyadh, Kingdom of Saudi Arabia', 'Active'),
    ('pres-mumbai', 'Mumbai', 'India', 'South Asia', false, 'Innovation & Delivery', 'Mindspace IT Park, Airoli, Mumbai, India', 'Delivery Center'),
    ('pres-bengaluru', 'Bengaluru', 'India', 'South Asia', false, 'Innovation & Delivery', 'Whitefield Technology Hub, Bengaluru, India', 'Engineering Lab'),
    ('pres-nairobi', 'Nairobi', 'Kenya', 'Africa', false, 'Support Hub', 'Westlands Commercial Tower, Nairobi, Kenya', 'Support Hub'),
    ('pres-dallas', 'Dallas', 'United States', 'Americas', false, 'Regional Office', 'Plano Tech Corridor, Texas, United States', 'Americas Hub')
ON CONFLICT (id) DO NOTHING;

-- Seed Awards & Recognition
INSERT INTO public.industry_awards (id, year, title, organization, category, product_ref, badge_text)
VALUES
    ('award-gifa-2026', 2026, 'Best Islamic Banking Core System 2026', 'Global Islamic Finance Awards (GIFA)', 'Islamic Core Banking', 'iMAL', 'GIFA 2026 Winner'),
    ('award-chartis-aml-2026', 2026, 'Category Leader — AML Transaction Monitoring', 'Chartis RiskTech Financial Crime Solutions', 'Financial Crime & AML', 'AMLOCK', 'Chartis Category Leader'),
    ('award-celent-kyc-2026', 2026, 'Noteworthy Solution — KYC Orchestration Report 2026', 'Celent', 'KYC & Onboarding', 'AMLOCK KYC', 'Celent Noteworthy'),
    ('award-celent-insurance-2026', 2026, 'Noteworthy Solution — Claims Administration Systems (P&C)', 'Celent Claims Report (APAC & EMEA)', 'Claims Automation', 'Premia Insurance', 'Celent Noteworthy'),
    ('award-gartner-erp-2026', 2026, 'Recognized in Voice of the Customer for Cloud ERP', 'Gartner Peer Insights', 'Cloud ERP for Product-Centric Enterprises', 'Orion ERP', 'Gartner Peer Insights')
ON CONFLICT (id) DO NOTHING;

