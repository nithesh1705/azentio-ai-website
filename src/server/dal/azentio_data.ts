import {
  ProductDomain,
  ProductItem,
  LeaderPerson,
  PresenceOffice,
  CustomerStory,
  IndustryAward,
  BlogPost,
  CareerPosition,
} from '@/types';

// =========================================================================
// 1. PRODUCT DOMAINS (5 Verticals)
// =========================================================================
export const DOMAINS: ProductDomain[] = [
  {
    id: 'domain-banking',
    slug: 'banking',
    name: 'Banking',
    tagline: 'AAOIFI-Certified Islamic & Core Banking Platforms',
    description:
      'Purpose-built banking technology engineered for Islamic finance, digital transformation, retail & corporate banking, treasury, trade finance and microfinance operations.',
    iconName: 'Landmark',
    stats: [
      { label: 'Countries Supported', value: '36+' },
      { label: 'Branches Powered', value: '6,000+' },
      { label: 'Customer Accounts', value: '25M+' },
      { label: 'Assets Managed', value: '$500B+' },
    ],
    highlights: [
      'AAOIFI-certified Shari’ah compliance',
      'iMAL Islamic Core Banking engine',
      'Integrated Islamic profit pool calculation',
      'API-first & cloud-native architecture',
    ],
  },
  {
    id: 'domain-capital-markets',
    slug: 'capital-markets',
    name: 'Capital Markets',
    tagline: 'End-to-End Asset, Fund Administration & Wealth Management',
    description:
      'Integrated front-to-back office solutions for mutual funds, wealth advisory, investor servicing and portfolio management powering leading tier-1 asset management firms.',
    iconName: 'TrendingUp',
    stats: [
      { label: 'Institutional Clients', value: '36+' },
      { label: 'Top Fund Houses', value: 'Top 15' },
      { label: 'Front-to-Back Flow', value: '100%' },
      { label: 'Asset Classes', value: 'Multi-Asset' },
    ],
    highlights: [
      'MFund Plus front-to-back asset management',
      'MFund ISS investor servicing & fund administration',
      'MFund Plus WMS client digital wealth advisory',
      'Deep regulatory automation across emerging markets',
    ],
  },
  {
    id: 'domain-risk-compliance',
    slug: 'risk-compliance',
    name: 'Risk & Compliance',
    tagline: 'AI-Powered Financial Crime Prevention & AML Surveillance',
    description:
      'AMLOCK surveillance suite delivers real-time transaction monitoring, KYC onboarding, sanctions screening, and trade-based AML intelligence with vector-based matching.',
    iconName: 'ShieldAlert',
    stats: [
      { label: 'Accounts Protected', value: '800M+' },
      { label: 'False Positive Drop', value: '40%' },
      { label: 'Compliance Cost Drop', value: '20%' },
      { label: 'MX Formats Screened', value: '25+' },
    ],
    highlights: [
      'Chartis Category Leader in AML Transaction Monitoring',
      'Celent Noteworthy KYC Orchestration',
      'Real-time PEP & watchlist fuzzy matching across scripts',
      'Automated trade-based AML & vessel tracking',
    ],
  },
  {
    id: 'domain-insurance',
    slug: 'insurance',
    name: 'Insurance',
    tagline: 'Unified Core Policy, Claims Automation & Takaful Operations',
    description:
      'Comprehensive insurance platforms powering General, Health, Life and Takaful insurers with automated FNOL-to-settlement workflows and omni-channel broker portals.',
    iconName: 'HeartPulse',
    stats: [
      { label: 'Insurer Clients', value: '100+' },
      { label: 'Preconfigured Products', value: '40+' },
      { label: 'Claims Cycle Speedup', value: '65%' },
      { label: 'Operating Models', value: 'Conventional & Takaful' },
    ],
    highlights: [
      'Premia Core Insurance suite',
      'Automated claims lifecycle from FNOL to payment',
      'General, Health, Life and Shari’ah Takaful models',
      'Multi-currency, multilingual & regional reinsurance',
    ],
  },
  {
    id: 'domain-erp',
    slug: 'erp',
    name: 'ERP',
    tagline: 'Cloud-Native Orion ERP for Process Manufacturing & Trade',
    description:
      'Orion Cloud ERP unifies distribution, contracting, financial accounting and process manufacturing with real-time supply chain analytics and e-invoicing compliance.',
    iconName: 'Boxes',
    stats: [
      { label: 'Enterprise Deployments', value: '1,000+' },
      { label: 'Deployment Timeline', value: '3-6 Mos' },
      { label: 'Supply Chain Sync', value: 'Real-time' },
      { label: 'Pre-Approved E-Invoice', value: 'ZATCA / UAE' },
    ],
    highlights: [
      'Orion Distribution Cloud with batch traceability',
      'Orion Manufacturing Cloud with shop-floor MRP',
      'Orion Contracting Cloud for infrastructure & projects',
      'Gartner Peer Insights Voice of Customer recognized',
    ],
  },
];

// =========================================================================
// 2. PRODUCTS (Deep mapped to domains)
// =========================================================================
export const PRODUCTS: ProductItem[] = [
  // --- BANKING PRODUCTS ---
  {
    id: 'prod-imal-islamic-banking',
    domainId: 'domain-banking',
    slug: 'imal-islamic-banking',
    name: 'Azentio iMAL Islamic Banking Platform',
    tagline: 'World-Leading AAOIFI-Certified Islamic Core Banking Engine',
    summary:
      'Complete Shari’ah-compliant core banking suite covering retail, corporate, treasury, investment and inclusive microfinance.',
    description:
      'Azentio iMAL is recognized by the Global Islamic Finance Awards (GIFA) as the Best Islamic Banking Core System 2026. Built from the ground up on AAOIFI accounting standards, iMAL eliminates interest-based contamination across 36 countries and over $500B in financial assets.',
    features: [
      'AAOIFI Shari’ah Compliance Certification across all modules',
      'Multi-entity, multi-branch, and multi-currency ledger operations',
      'Parameter-driven contract structures: Murabaha, Mudarabah, Musharakah, Ijara, and Istisna',
      'Real-time customer 360 profile with regulatory reporting',
      'API-first integration layer for open banking and mobile channels',
    ],
    capabilities: [
      {
        title: 'Shari’ah Contract Lifecycle',
        description:
          'End-to-end automation of complex Islamic financing agreements with deterministic audit trails.',
      },
      {
        title: 'Profit Calculation System (PCS)',
        description:
          'Automated, mathematically transparent pool distribution and reserve management preventing unfair returns.',
      },
      {
        title: 'Islamic Treasury & Money Market',
        description:
          'Interbank liquidity management, FX swaps, Sukuk issuance, and Wa’ad contract execution.',
      },
    ],
    targetAudience: [
      'Islamic Banks & Window Operations',
      'Central Banks & Monetary Authorities',
      'Microfinance Cooperatives',
    ],
    deploymentModels: ['Cloud-Native (SaaS)', 'Hybrid Cloud', 'Private Banking Cloud'],
    complianceOrCertifications: ['AAOIFI Certified', 'IFSB Compliant', 'ISO 20022'],
    metrics: [
      { label: 'Countries', value: '36' },
      { label: 'Branches', value: '6,000+' },
      { label: 'Total Assets', value: '$500B+' },
    ],
  },
  {
    id: 'prod-imal-financing',
    domainId: 'domain-banking',
    slug: 'imal-financing',
    name: 'iMAL Islamic Financing & Origination',
    tagline: 'End-to-End Financing Origination, Collateral & Disbursement',
    summary:
      'Configurable credit underwriting, repayment scheduling, and collateral management aligned with central bank guidelines.',
    description:
      'Provides financial institutions with agility in launching new financing products. Supports flexible repayment schedules indexed to harvest or revenue cycles with zero compounding interest.',
    features: [
      'Omnichannel credit origination portal',
      'Automated covenant validation & scoring engine',
      'Collateral valuation & margin call triggers',
      'Configurable disbursement stages with supplier voucher matching',
    ],
    capabilities: [
      {
        title: 'Dynamic Installment Calendars',
        description:
          'Flexibility to synchronize debt repayments with borrower cash flow seasonality.',
      },
      {
        title: 'Central Bank Reporting Hooks',
        description: 'Instant generation of supervisory loan book returns and provisioning calculations.',
      },
    ],
    targetAudience: ['Retail Banks', 'Corporate Lenders', 'SME Development Funds'],
    deploymentModels: ['SaaS', 'On-Premises'],
    complianceOrCertifications: ['IFRS 9 Expected Credit Loss Model', 'AAOIFI Standards'],
  },
  {
    id: 'prod-imal-microfinance',
    domainId: 'domain-banking',
    slug: 'imal-microfinance',
    name: 'iMAL Islamic Microfinance',
    tagline: 'Financial Inclusion Engine for Underserved Rural & SME Communities',
    summary:
      'Agent-banking powered microfinance solution supporting group lending, solidarity funds, and mobile loan disbursements.',
    description:
      'Empowers micro-lenders and rural cooperatives with offline-first field agent apps, biometric KYC, and community-based profit sharing models.',
    features: [
      'Field officer tablet interface with offline transaction capture',
      'Group lending and joint-liability peer group tracking',
      'Mobile wallet integrations for instant disbursement',
      'Low total cost of ownership on light hardware footprints',
    ],
    capabilities: [
      {
        title: 'Agent Banking Network',
        description: 'Extend branchless banking into unbanked agricultural and rural areas.',
      },
      {
        title: 'Flexible Qard Hassan & Murabaha Smallholder Loans',
        description: 'Empower farmers with equipment-purchase financing and seasonal credit.',
      },
    ],
    targetAudience: ['Development Banks', 'Rural Micro-Lenders', 'Financial Inclusion NGOs'],
    deploymentModels: ['Cloud', 'Hybrid'],
  },

  // --- CAPITAL MARKETS PRODUCTS ---
  {
    id: 'prod-mfund-plus',
    domainId: 'domain-capital-markets',
    slug: 'mfund-plus',
    name: 'Azentio MFund Plus',
    tagline: 'Comprehensive Front-to-Back Office Investment Management Platform',
    summary:
      'Web-based asset management software powering portfolio construction, pre-trade compliance, order routing, and NAV accounting.',
    description:
      'Azentio MFund Plus handles substantial portions of the mutual fund assets under management (AUM) in fast-growing markets like India and Southeast Asia. Used by institutions among the top 15 fund houses.',
    features: [
      'Multi-asset class support: Equities, Fixed Income, Derivatives, Sukuk, and Commodities',
      'Real-time pre-trade limit checking and mandate compliance',
      'Automated multi-currency Net Asset Value (NAV) computation',
      'Performance attribution and benchmark comparison models',
    ],
    capabilities: [
      {
        title: 'Front-to-Back STP Processing',
        description: 'Seamless order execution to back-office clearing with zero manual re-keying.',
      },
      {
        title: 'Regulatory & Mandate Engine',
        description: 'Built-in statutory investment ceiling checks matching SEBI, MAS, and SCA norms.',
      },
    ],
    targetAudience: ['Mutual Fund Houses', 'Asset Managers', 'Sovereign Wealth Funds'],
    deploymentModels: ['Private Cloud', 'Enterprise On-Premises'],
    metrics: [
      { label: 'Clients', value: '36+' },
      { label: 'Market Rank', value: 'Top 15 Fund Houses' },
    ],
  },
  {
    id: 'prod-mfund-iss',
    domainId: 'domain-capital-markets',
    slug: 'mfund-iss',
    name: 'MFund Investor Services & Fund Administration (ISS)',
    tagline: 'Registry & Transfer Agency (RTA) for High-Volume Investor Bases',
    summary:
      'Handles unit-holder registry, distributor commission tracking, corporate actions, and dividend distributions.',
    description:
      'High-throughput investor servicing system architected to process millions of investor transactions per day across SIP (Systematic Investment Plans) and institutional subscriptions.',
    features: [
      'Omnichannel distributor and investor portal APIs',
      'Automated tiered brokerage and trailing commission computation',
      'Capital gain tax statements and investor tax deduction at source',
      'Corporate action processing: bonus units, splits, and dividend payouts',
    ],
    capabilities: [
      {
        title: 'High-Volume SIP Processor',
        description: 'Processes millions of periodic debit mandates in rapid batch cycles.',
      },
    ],
    targetAudience: ['Registrars & Transfer Agents (RTAs)', 'Third-party Fund Administrators'],
    deploymentModels: ['Cloud', 'On-Premises'],
  },
  {
    id: 'prod-mfund-wms',
    domainId: 'domain-capital-markets',
    slug: 'mfund-wms',
    name: 'MFund Plus WMS — Digital Wealth Management',
    tagline: 'Client-Facing Digital Advisory & Relationship Manager Workspace',
    summary:
      'Client onboarding, risk profiling, model portfolio construction, and advisory intelligence for private banks.',
    description:
      'As demonstrated in our published success with Philippine National Bank (PNB), MFund WMS accelerates wealth advisory excellence through intuitive goal-based planning.',
    features: [
      'Dynamic client risk-appetite questionnaire and scoring',
      'Goal-based investment tracking and rebalancing simulator',
      'Relationship manager 360-degree client financial dashboard',
      'Self-service mobile wealth application for High Net Worth clients',
    ],
    capabilities: [
      {
        title: 'Model Portfolio Rebalancing',
        description: 'Batch rebalance hundreds of discretionary portfolios against asset allocation targets.',
      },
    ],
    targetAudience: ['Private Banks', 'Wealth Advisory Firms', 'Family Offices'],
    deploymentModels: ['Cloud SaaS', 'Private Hosted'],
  },

  // --- RISK & COMPLIANCE PRODUCTS ---
  {
    id: 'prod-amlock-aml',
    domainId: 'domain-risk-compliance',
    slug: 'amlock-aml',
    name: 'Azentio AMLOCK Anti-Money Laundering & Surveillance',
    tagline: 'Chartis RiskTech Category Leader in AML Transaction Monitoring',
    summary:
      'AI and rule-based suspicious transaction detection, multi-scenario alerting, and case management.',
    description:
      'Positioned as a Category Leader in Chartis RiskTech AML Transaction Monitoring Solutions 2026. AMLOCK analyzes millions of transactions daily across SWIFT, card, and cash networks with 40% fewer false alerts.',
    features: [
      'Hybrid detection engine: deterministic regulatory rules combined with machine learning',
      'Automated Suspicious Activity Report (SAR / STR) narrative generation',
      'Entity link analysis visualizing hidden relationship networks',
      'Scalable streaming architecture handling 10,000+ transactions per second',
    ],
    capabilities: [
      {
        title: 'Behavioral Anomaly Profiling',
        description: 'Identifies smurfing, rapid cross-border layering, and dormant account spikes.',
      },
      {
        title: 'Unified Investigation Workbench',
        description: 'Complete audit timeline, document attachments, and multi-tier escalation approvals.',
      },
    ],
    targetAudience: ['Tier-1 Banks', 'FinTech Unicorns', 'Payment Aggregators'],
    deploymentModels: ['High-Throughput SaaS', 'Private Cloud'],
    metrics: [
      { label: 'Accounts Protected', value: '800M+' },
      { label: 'False Positive Reduction', value: '40%' },
    ],
  },
  {
    id: 'prod-amlock-kyc',
    domainId: 'domain-risk-compliance',
    slug: 'amlock-kyc',
    name: 'AMLOCK KYC & Digital Onboarding',
    tagline: 'Celent Noteworthy Solution in KYC Orchestration 2026',
    summary:
      'End-to-end customer identity verification, beneficial ownership (UBO) discovery, and perpetual KYC.',
    description:
      'Streamlines corporate and retail onboarding with document OCR, biometric liveness validation, corporate registry queries, and automated periodic risk score refreshes.',
    features: [
      'Corporate UBO unraveling down to ultimate beneficial owners',
      'Digital document extraction & registry verification integration',
      'Perpetual KYC triggers activated on adverse media or transactional anomalies',
      'Configurable risk scoring matrix tailored by jurisdiction',
    ],
    capabilities: [
      {
        title: 'Complex Corporate Onboarding',
        description: 'Untangles multi-jurisdictional shell company structures automatically.',
      },
    ],
    targetAudience: ['Commercial Banks', 'Broker-Dealers', 'Virtual Asset Service Providers'],
    deploymentModels: ['Cloud SaaS', 'On-Premises'],
  },
  {
    id: 'prod-amlock-sanctions',
    domainId: 'domain-risk-compliance',
    slug: 'amlock-sanctions',
    name: 'AMLOCK Sanctions Screening Engine',
    tagline: 'Real-Time Vector & Phonetic Watchlist Matching for SWIFT MX & ISO 20022',
    summary:
      'Millisecond screening against UN, OFAC, EU, HMT, PEPs and custom adverse media feeds.',
    description:
      'Screens messages against sanctions in under 15 milliseconds. Supports more than 25 MX message types with phonetic and multi-script transliteration algorithms.',
    features: [
      'Native ISO 20022 MX message tag parsing (pacs.008, pacs.009, camt.053, etc.)',
      'AI vector matching suppressing false positives from common cultural aliases',
      'Pre-integrated with Dow Jones, World-Check, and national gazettes',
      'Zero-latency inline payment blocking and release controls',
    ],
    capabilities: [
      {
        title: 'Trade-Based AML Screening',
        description: 'Validates vessels, dual-use goods, and high-risk maritime ports in real time.',
      },
    ],
    targetAudience: ['International Correspondent Banks', 'Remittance Houses'],
    deploymentModels: ['Cloud', 'On-Premises High Availability'],
  },

  // --- INSURANCE PRODUCTS ---
  {
    id: 'prod-premia-general-insurance',
    domainId: 'domain-insurance',
    slug: 'general-insurance',
    name: 'Azentio Premia General Insurance Suite',
    tagline: 'Full Policy Lifecycle, Reinsurance & Underwriting for P&C Carriers',
    summary:
      'End-to-end administration for 40+ lines including motor, fire, marine, engineering, and property.',
    description:
      'Recognized by Celent as a Noteworthy Solution in Claims Administration Systems. Unifies policy issuance, endorsements, reinsurance treaties, and accounting across conventional and Takaful models.',
    features: [
      '40+ pre-configured general insurance product blueprints',
      'Dynamic multi-tier reinsurance allocation (Treaty & Facultative)',
      'Automated tariff calculation and dynamic rate modification engine',
      'Unified financial ledger with premium collection and commission escrow',
    ],
    capabilities: [
      {
        title: 'Multi-Country Reinsurance Ledger',
        description: 'Calculates retention limits, treaty balances, and excess-of-loss claims instantaneously.',
      },
    ],
    targetAudience: ['Property & Casualty Insurers', 'National Insurance Corporations', 'Takaful Operators'],
    deploymentModels: ['Cloud', 'On-Premises'],
    metrics: [
      { label: 'Carriers Powered', value: '100+' },
      { label: 'Lines of Business', value: '40+' },
    ],
  },
  {
    id: 'prod-premia-claims-automation',
    domainId: 'domain-insurance',
    slug: 'claim-automation',
    name: 'Azentio Insurance Claim Automation',
    tagline: 'Next-Generation FNOL-to-Settlement Workflow & Surveyor Network',
    summary:
      'Digitizes first notice of loss, garage estimates, mobile surveyor appraisals, and payment vouchers.',
    description:
      'Reduces claims cycle times by up to 65%. Enables policyholders to submit accident photos from mobile apps with automated computer vision damage assessment and fraud screening.',
    features: [
      'First Notice of Loss (FNOL) mobile and web intake portal',
      'Integration with authorized repair garage and hospital networks',
      'Automated claims reserve adjustment based on surveyor findings',
      'Straight-through processing (STP) for low-value fast-track claims',
    ],
    capabilities: [
      {
        title: 'Mobile Surveyor Appraisal',
        description: 'Empowers field surveyors with offline photo capture and instant estimate approvals.',
      },
    ],
    targetAudience: ['Motor Insurers', 'Health Claim Administrators', 'TPAs'],
    deploymentModels: ['Cloud SaaS', 'Hybrid'],
  },
  {
    id: 'prod-premia-health-insurance',
    domainId: 'domain-insurance',
    slug: 'health-insurance',
    name: 'Azentio Premia Health & Medical Suite',
    tagline: 'Comprehensive Provider Network, Pre-Auth & Benefit Limits',
    summary:
      'Manages hospital networks, member eligibility, cashless pre-authorizations, and loss-ratio analytics.',
    description:
      'Deployed by major insurers including Star Health and MUA Insurance. Handles complex corporate group policies, family deductibles, and direct electronic claims adjudication.',
    features: [
      'Real-time cashless pre-authorization hospital portal',
      'Sub-benefit tracking: OPD, IPD, maternity, dental, and optical caps',
      'Dynamic loss-ratio monitoring by employer corporate account',
      'Electronic integration with national health insurance authorities',
    ],
    capabilities: [
      {
        title: 'Cashless Hospital Adjudication',
        description: 'Authorizes medical admission requests in minutes with automated tariff check.',
      },
    ],
    targetAudience: ['Health Insurers', 'Third-Party Administrators (TPAs)', 'Self-Insured Corporate Groups'],
    deploymentModels: ['Cloud', 'On-Premises'],
  },

  // --- ERP PRODUCTS ---
  {
    id: 'prod-orion-distribution',
    domainId: 'domain-erp',
    slug: 'orion-distribution-cloud',
    name: 'Orion Distribution Cloud ERP',
    tagline: 'Purpose-Built ERP for Chemical, FMCG & Wholesale Trading',
    summary:
      'Multi-warehouse logistics, batch traceability, expiry management, and supplier portals.',
    description:
      'Adopted by distributors like M.H. Enterprises and Al Taher Chemicals. Engineered for stringent batch tracking, shelf-life management, hazardous chemical compliance, and e-invoicing.',
    features: [
      'Multi-warehouse real-time inventory visibility and bin allocation',
      'Strict batch traceability and product recall automation',
      'Automated purchase order workflows with price tolerance checks',
      'Built-in ZATCA & UAE FTA pre-approved e-invoicing compliance',
    ],
    capabilities: [
      {
        title: 'Chemical & Perishable Traceability',
        description: 'Maintains end-to-end chain of custody from import container to retail delivery.',
      },
    ],
    targetAudience: ['Chemical Traders', 'FMCG Distributors', 'Import/Export Enterprises'],
    deploymentModels: ['Cloud SaaS', 'Dedicated Cloud'],
  },
  {
    id: 'prod-orion-manufacturing',
    domainId: 'domain-erp',
    slug: 'orion-manufacturing-cloud',
    name: 'Orion Manufacturing Cloud ERP',
    tagline: 'Shop-Floor Material Requirements Planning (MRP) & Production Scheduling',
    summary:
      'Bill of materials (BOM), production routing, barcode scanning, and equipment maintenance.',
    description:
      'Powers industrial manufacturers including Hindustan Composites and Nuplas Industries. Combines formula management with machine workload scheduling and scrap tracking.',
    features: [
      'Multi-level Bill of Materials (BOM) with revision control',
      'Material Requirements Planning (MRP) calculating procurement leads',
      'Shop-floor mobile barcode scanning for work-in-progress (WIP)',
      'After-sales service, warranty registration, and spare parts management',
    ],
    capabilities: [
      {
        title: 'Dynamic Work Order Scheduling',
        description: 'Optimizes production runs to minimize machine downtime and tooling changeovers.',
      },
    ],
    targetAudience: ['Process Manufacturers', 'Plastics & Composite Makers', 'Industrial Equipment Plants'],
    deploymentModels: ['Cloud', 'Hybrid On-Premises'],
  },
  {
    id: 'prod-orion-financial',
    domainId: 'domain-erp',
    slug: 'orion-financial-cloud',
    name: 'Orion Financial Cloud ERP',
    tagline: 'Multi-Entity Financial Ledger, Budgeting & Statutory Compliance',
    summary:
      'General ledger, accounts payable/receivable, fixed asset registers, and corporate consolidation.',
    description:
      'Gartner Peer Insights Voice of Customer recognized cloud ERP. Delivers audit-ready statutory accounting across GCC VAT, Indian GST, and international IFRS standards.',
    features: [
      'Multi-currency chart of accounts with dynamic segment dimensions',
      'Automated bank reconciliation via direct open banking APIs',
      'Fixed asset lifecycle from acquisition through depreciation to salvage',
      'Consolidated multi-company profit & loss and balance sheet reports',
    ],
    capabilities: [
      {
        title: 'Automated E-Invoicing Tax Engine',
        description: 'Instant XML generation with digital QR codes verified against tax authorities.',
      },
    ],
    targetAudience: ['Mid-Market Enterprises', 'Conglomerates with Multi-Entities'],
    deploymentModels: ['Cloud SaaS'],
  },
];

// =========================================================================
// 3. EXECUTIVE LEADERSHIP & BOARD
// =========================================================================
export const LEADERS: LeaderPerson[] = [
  // --- Executives ---
  {
    id: 'lead-sanjay-singh',
    name: 'Sanjay Singh',
    role: 'Group Chief Executive Officer',
    category: 'executive',
    bio: 'Sanjay Singh leads Azentio with decades of experience driving global enterprise software and technology organizations across Banking, Financial Services, and Insurance.',
    previousRoles: 'Senior Global Tech Executive',
  },
  {
    id: 'lead-rahul-arora',
    name: 'Rahul Arora',
    role: 'Chief Sales Officer',
    category: 'executive',
    bio: 'Oversees global commercial strategy, client acquisition, and strategic sales partnerships across Asia Pacific, Middle East, and Africa.',
  },
  {
    id: 'lead-gaurav-kedia',
    name: 'Gaurav Kedia',
    role: 'Chief Financial Officer',
    category: 'executive',
    bio: 'Leads corporate finance, capital allocation, treasury, and statutory reporting across Azentio’s multi-national operating footprint.',
  },
  {
    id: 'lead-savitha-ramakrishna',
    name: 'Savitha Ramakrishna',
    role: 'General Counsel',
    category: 'executive',
    bio: 'Responsible for legal governance, international regulatory compliance, IP portfolio protection, and corporate structuring.',
  },
  {
    id: 'lead-emma-foley',
    name: 'Emma Foley',
    role: 'Chief Marketing Officer',
    category: 'executive',
    bio: 'Drives Azentio’s brand positioning, product marketing, global communications, and client engagement initiatives.',
  },
  {
    id: 'lead-aarthi-ramesh',
    name: 'Aarthi Ramesh',
    role: 'Chief Customer Officer',
    category: 'executive',
    bio: 'Ensures customer success, delivery excellence, professional services implementation, and long-term client retention.',
  },
  {
    id: 'lead-smitha-rao',
    name: 'Smitha Rao',
    role: 'SVP & Head of Human Resources',
    category: 'executive',
    bio: 'Directs global people culture, talent acquisition, leadership development, and employee enablement programs across 1,900+ professionals.',
  },
  {
    id: 'lead-hari-venkataramanan',
    name: 'Harikrishnan (Hari) Venkataramanan',
    role: 'President — ERP',
    category: 'executive',
    bio: 'Leads product engineering, market expansion, and customer success for Azentio’s Orion Cloud ERP business unit.',
  },

  // --- Board of Directors ---
  {
    id: 'board-david-hamilton',
    name: 'David Hamilton',
    role: 'Chairman of the Board',
    category: 'board',
    bio: 'Veteran financial-services technology executive; previously held senior operating leadership roles at Fiserv, SunGard, and global fintech platforms.',
    previousRoles: 'Executive Leadership at Fiserv & SunGard',
  },
  {
    id: 'board-harjot-dhaliwal',
    name: 'Harjot Dhaliwal',
    role: 'Director',
    category: 'board',
    bio: 'Works closely with technology entrepreneurs, founders, and management teams supporting businesses through rapid scale, M&A, and digital transformation.',
  },
  {
    id: 'board-roy-mackenzie',
    name: 'Roy Mackenzie',
    role: 'Director',
    category: 'board',
    bio: 'Partner in Apax’s global technology team; joined Apax in 2003 and actively participates in investment and governance committees.',
    previousRoles: 'Partner, Apax Technology Team',
  },
  {
    id: 'board-robin-crewe',
    name: 'Robin Crewe',
    role: 'Director',
    category: 'board',
    bio: 'Specialist technology advisor to private equity firms and enterprise software portfolio companies with deep architectural expertise.',
  },
  {
    id: 'board-matt-foster',
    name: 'Matt Foster',
    role: 'Director',
    category: 'board',
    bio: 'Distinguished enterprise software executive; early career at Accenture leading software architectures including Accenture Claim Components.',
    previousRoles: 'Accenture Software Architecture Leader',
  },
];

// =========================================================================
// 4. GLOBAL PRESENCE & HUBS (19 Points)
// =========================================================================
export const PRESENCE: PresenceOffice[] = [
  {
    id: 'pres-singapore',
    city: 'Singapore',
    country: 'Singapore',
    region: 'Asia Pacific',
    isHeadquarters: true,
    type: 'Corporate HQ',
    address: 'Azentio Software Private Limited, Marina Bay Financial Centre, Singapore',
    established: '2020',
  },
  {
    id: 'pres-dubai',
    city: 'Dubai',
    country: 'United Arab Emirates',
    region: 'Middle East',
    type: 'Regional Office',
    address: 'Dubai Internet City, Building 14, Dubai, UAE',
    established: 'Regional Operations Hub',
  },
  {
    id: 'pres-riyadh',
    city: 'Riyadh',
    country: 'Saudi Arabia',
    region: 'Middle East',
    type: 'Regional Office',
    address: 'King Fahd Road, Riyadh, Kingdom of Saudi Arabia',
  },
  {
    id: 'pres-manama',
    city: 'Manama',
    country: 'Bahrain',
    region: 'Middle East',
    type: 'Regional Office',
    address: 'Bahrain Financial Harbour, Manama, Kingdom of Bahrain',
  },
  {
    id: 'pres-kuwait',
    city: 'Kuwait City',
    country: 'Kuwait',
    region: 'Middle East',
    type: 'Regional Office',
    address: 'Sharq Commercial District, Kuwait City',
  },
  {
    id: 'pres-mumbai',
    city: 'Mumbai',
    country: 'India',
    region: 'South Asia',
    type: 'Innovation & Delivery',
    address: 'Mindspace IT Park, Airoli / Goregaon, Mumbai, India',
  },
  {
    id: 'pres-bengaluru',
    city: 'Bengaluru',
    country: 'India',
    region: 'South Asia',
    type: 'Innovation & Delivery',
    address: 'Whitefield Technology Hub, Bengaluru, Karnataka, India',
  },
  {
    id: 'pres-chennai',
    city: 'Chennai',
    country: 'India',
    region: 'South Asia',
    type: 'Innovation & Delivery',
    address: 'OMR IT Corridor, Chennai, Tamil Nadu, India',
  },
  {
    id: 'pres-hyderabad',
    city: 'Hyderabad',
    country: 'India',
    region: 'South Asia',
    type: 'Innovation & Delivery',
    address: 'HITEC City, Madhapur, Hyderabad, Telangana, India',
  },
  {
    id: 'pres-kochi',
    city: 'Kochi',
    country: 'India',
    region: 'South Asia',
    type: 'Innovation & Delivery',
    address: 'Infopark Kakkanad, Kochi, Kerala, India',
  },
  {
    id: 'pres-kuala-lumpur',
    city: 'Kuala Lumpur',
    country: 'Malaysia',
    region: 'Asia Pacific',
    type: 'Regional Office',
    address: 'KL Sentral Commercial Tower, Kuala Lumpur, Malaysia',
  },
  {
    id: 'pres-jakarta',
    city: 'Jakarta',
    country: 'Indonesia',
    region: 'Asia Pacific',
    type: 'Regional Office',
    address: 'Sudirman Central Business District (SCBD), Jakarta, Indonesia',
  },
  {
    id: 'pres-manila',
    city: 'Manila',
    country: 'Philippines',
    region: 'Asia Pacific',
    type: 'Regional Office',
    address: 'Bonifacio Global City (BGC), Taguig, Metro Manila, Philippines',
  },
  {
    id: 'pres-bangkok',
    city: 'Bangkok',
    country: 'Thailand',
    region: 'Asia Pacific',
    type: 'Regional Office',
    address: 'Sathorn Road Business Center, Bangkok, Thailand',
  },
  {
    id: 'pres-hong-kong',
    city: 'Hong Kong',
    country: 'Hong Kong SAR',
    region: 'Asia Pacific',
    type: 'Regional Office',
    address: 'Central District Commercial Hub, Hong Kong',
  },
  {
    id: 'pres-nairobi',
    city: 'Nairobi',
    country: 'Kenya',
    region: 'Africa',
    type: 'Support Hub',
    address: 'Westlands Commercial Tower, Nairobi, Kenya',
  },
  {
    id: 'pres-lagos',
    city: 'Lagos',
    country: 'Nigeria',
    region: 'Africa',
    type: 'Support Hub',
    address: 'Victoria Island Financial Center, Lagos, Nigeria',
  },
  {
    id: 'pres-cairo',
    city: 'Cairo',
    country: 'Egypt',
    region: 'Africa',
    type: 'Regional Office',
    address: 'Smart Village Business Park, Cairo, Egypt',
  },
  {
    id: 'pres-dallas',
    city: 'Dallas',
    country: 'United States',
    region: 'Americas',
    type: 'Regional Office',
    address: 'Plano Tech Corridor, Texas, United States',
  },
];

// =========================================================================
// 5. INDUSTRY PARTNERS / TRUSTED CLIENTS (Real Names from Research)
// =========================================================================
export const TRUSTED_PARTNERS = [
  { name: 'Boubyan Bank', domain: 'Banking', country: 'Kuwait', logoText: 'Boubyan Bank' },
  { name: 'Bank of Abyssinia', domain: 'Banking', country: 'Ethiopia', logoText: 'Bank of Abyssinia' },
  { name: 'Siraj Finance', domain: 'Banking', country: 'UAE', logoText: 'Siraj Finance' },
  { name: 'Philippine National Bank', domain: 'Capital Markets', country: 'Philippines', logoText: 'PNB Wealth' },
  { name: 'Sanlam Insurance Group', domain: 'Insurance', country: 'South Africa', logoText: 'Sanlam' },
  { name: 'Al Fujairah National Insurance', domain: 'Insurance', country: 'UAE', logoText: 'AFNIC' },
  { name: 'Emirates Insurance', domain: 'Insurance', country: 'UAE', logoText: 'Emirates Ins.' },
  { name: 'Ethio Life & General Insurance', domain: 'Insurance', country: 'Ethiopia', logoText: 'Ethio Life' },
  { name: 'Star Health Insurance', domain: 'Insurance', country: 'India', logoText: 'Star Health' },
  { name: 'M.H. Enterprises LLC', domain: 'ERP', country: 'UAE', logoText: 'M.H. Enterprises' },
  { name: 'Hindustan Composites', domain: 'ERP', country: 'India', logoText: 'Hind. Composites' },
  { name: 'Nuplas Industries', domain: 'ERP', country: 'UAE', logoText: 'Nuplas' },
  { name: 'Gandhar Oil Refinery', domain: 'ERP', country: 'India', logoText: 'Gandhar Oil' },
  { name: 'HTC Global Services', domain: 'Ecosystem Partner', country: 'Global', logoText: 'HTC Global' },
  { name: 'Nityo Infotech', domain: 'Ecosystem Partner', country: 'Global', logoText: 'Nityo' },
  { name: 'Apax', domain: 'Investor Ecosystem', country: 'Global', logoText: 'Apax' },
];

// =========================================================================
// 6. CUSTOMER CASE STUDIES & TESTIMONIALS
// =========================================================================
export const CASE_STUDIES: CustomerStory[] = [
  {
    id: 'case-boubyan-bank',
    clientName: 'Boubyan Bank',
    domain: 'Banking',
    country: 'Kuwait',
    title: 'Boubyan Bank Accelerates Digital Transformation with Azentio iMAL',
    challenge:
      'Required a modern, cloud-ready Shari’ah core banking architecture to accelerate digital product launches while sustaining stringent regulatory pool distribution.',
    solution:
      'Implemented Azentio iMAL core banking with real-time profit pool calculations and API-first customer onboarding.',
    outcomes: [
      'Shortened time-to-market for Islamic retail products by 50%',
      'Eliminated manual reconciliation for Mudarabah profit sharing pools',
      'Seamless multi-channel customer visibility across web and mobile branches',
    ],
    quote:
      'iMAL provided the exact architectural adaptability we needed to pioneer digital Islamic banking in the region.',
    quoteAuthor: 'Executive Leadership',
    quoteRole: 'Digital Transformation, Boubyan Bank',
  },
  {
    id: 'case-pnb-wealth',
    clientName: 'Philippine National Bank (PNB)',
    domain: 'Capital Markets',
    country: 'Philippines',
    title: 'Philippine National Bank Accelerates Wealth Advisory Excellence',
    challenge:
      'High Net Worth advisors faced disconnected legacy spreadsheets that delayed portfolio risk assessment and goal rebalancing.',
    solution:
      'Deployed Azentio MFund Plus WMS, unifying client profiling, model portfolio allocation, and dynamic compliance monitoring.',
    outcomes: [
      'Consolidated wealth advisory workflows into a single high-impact dashboard',
      'Real-time mandate violation warnings before order execution',
      'Rapid growth in assets under management across high net worth tiers',
    ],
  },
  {
    id: 'case-afnic-floodguard',
    clientName: 'Al Fujairah National Insurance Company (AFNIC)',
    domain: 'Insurance',
    country: 'UAE',
    title: 'AFNIC Launches Innovative FloodGuard Product on Premia Suite',
    challenge:
      'Needed to rapidly configure, underwrite, and distribute customized parametric flood insurance products for commercial clients.',
    solution:
      'Configured the product within days using Azentio Premia’s modular general insurance product workbench.',
    outcomes: [
      'Product launched to market in record time without custom code builds',
      'Automated claim reserve triggers based on weather bureau data feeds',
    ],
    quote:
      'Azentio Premia enabled us to deliver the FloodGuard product swiftly with complete underwriting controls.',
    quoteAuthor: 'Ashok Padmanabhan',
    quoteRole: 'IT Director, Al Fujairah National Insurance',
  },
  {
    id: 'case-mh-enterprises',
    clientName: 'M.H. Enterprises LLC',
    domain: 'ERP',
    country: 'UAE',
    title: 'M.H. Enterprises Streamlines Distribution & Traceability with Orion ERP',
    challenge:
      'High-velocity consumer and industrial distribution required multi-warehouse inventory visibility and zero-error expiry batch recalls.',
    solution:
      'Rolled out Orion Distribution Cloud with barcode picking, automated purchase re-order thresholds, and UAE tax e-invoicing.',
    outcomes: [
      'End-to-end batch traceability reduced product expiration waste by 35%',
      '100% compliant e-invoicing with instant tax authority approval',
      'Live warehouse synchronization across regional transit depots',
    ],
  },
];

// =========================================================================
// 7. AWARDS & ANALYST RECOGNITIONS
// =========================================================================
export const AWARDS: IndustryAward[] = [
  {
    id: 'award-gifa-2026',
    year: 2026,
    title: 'Best Islamic Banking Core System 2026',
    organization: 'Global Islamic Finance Awards (GIFA)',
    category: 'Islamic Core Banking',
    productRef: 'iMAL',
    badgeText: 'GIFA 2026 Winner',
  },
  {
    id: 'award-chartis-aml-2026',
    year: 2026,
    title: 'Category Leader — AML Transaction Monitoring',
    organization: 'Chartis RiskTech Financial Crime Solutions',
    category: 'Financial Crime & AML',
    productRef: 'AMLOCK',
    badgeText: 'Chartis Category Leader',
  },
  {
    id: 'award-chartis-watchlist-2026',
    year: 2026,
    title: 'Category Leader — Watchlist & Adverse-Media Monitoring',
    organization: 'Chartis RiskTech',
    category: 'Sanctions & Watchlist',
    productRef: 'AMLOCK Sanctions',
    badgeText: 'Chartis Category Leader',
  },
  {
    id: 'award-celent-kyc-2026',
    year: 2026,
    title: 'Noteworthy Solution — KYC Orchestration Report 2026',
    organization: 'Celent',
    category: 'KYC & Onboarding',
    productRef: 'AMLOCK KYC',
    badgeText: 'Celent Noteworthy',
  },
  {
    id: 'award-celent-insurance-2026',
    year: 2026,
    title: 'Noteworthy Solution — Claims Administration Systems (P&C)',
    organization: 'Celent Claims Report (APAC & EMEA)',
    category: 'Claims Automation',
    productRef: 'Premia Insurance',
    badgeText: 'Celent Noteworthy',
  },
  {
    id: 'award-chartis-credit-2026',
    year: 2026,
    title: 'Category Leader — Credit Lending Operations Solutions 2026',
    organization: 'Chartis RiskTech',
    category: 'Lending & Financing',
    productRef: 'iMAL Financing',
    badgeText: 'Chartis Category Leader',
  },
  {
    id: 'award-gartner-erp-2026',
    year: 2026,
    title: 'Recognized in Voice of the Customer for Cloud ERP',
    organization: 'Gartner Peer Insights',
    category: 'Cloud ERP for Product-Centric Enterprises',
    productRef: 'Orion ERP',
    badgeText: 'Gartner Peer Insights',
  },
];

// =========================================================================
// 8. RESEARCH & INSIGHT BLOGS
// =========================================================================
export const BLOGS: BlogPost[] = [
  {
    id: 'blog-islamic-core-modernization',
    slug: 'islamic-core-modernization-cloud-era',
    title: 'Next-Generation Islamic Core Banking: Meeting AAOIFI Standards in the Cloud Era',
    summary:
      'How Islamic financial institutions are replacing legacy siloed systems with modern Shari’ah-certified cloud platforms without sacrificing religious compliance.',
    content:
      'Islamic banking requires strict adherence to Shari’ah principles such as avoiding interest (Riba) and excessive uncertainty (Gharar). As digital banks emerge, platforms like Azentio iMAL prove that mathematical pool segregation and cloud scalability can coexist seamlessly.',
    domain: 'Banking',
    author: 'Azentio Banking Architecture Squad',
    publishedDate: '2026-10-15',
    readTime: '6 min read',
    tags: ['iMAL', 'Islamic Banking', 'AAOIFI', 'Core Modernization'],
  },
  {
    id: 'blog-chartis-aml-vector-matching',
    slug: 'ai-vector-matching-financial-crime-surveillance',
    title: 'Why AI Vector Matching Cuts Sanctions Screening False Positives by 40%',
    summary:
      'Traditional phonetic algorithms trigger crippling alert backlogs on Arabic and Asian name variants. Here is how vector embeddings resolve true matches in milliseconds.',
    content:
      'In high-volume SWIFT payment corridors, sanctions compliance analysts spend 80% of their day clearing non-actionable false alerts. By pairing ISO 20022 message parsers with vector distance scoring, Azentio AMLOCK isolates genuine threat patterns while accelerating legitimate liquidity.',
    domain: 'Risk & Compliance',
    author: 'Compliance Research Group',
    publishedDate: '2026-09-28',
    readTime: '8 min read',
    tags: ['AMLOCK', 'AML', 'Chartis', 'Sanctions', 'AI Vector'],
  },
  {
    id: 'blog-insurance-claim-automation-fnol',
    slug: 'digital-first-notice-of-loss-claims-automation',
    title: 'From Accident Scene to Settlement: Re-Engineering General Insurance Claims',
    summary:
      'How omni-channel FNOL, mobile surveyor apps, and automated repair garage networks reduce P&C settlement cycles from weeks to hours.',
    content:
      'Customer satisfaction during an insurance loss event depends entirely on settlement velocity. With Azentio Premia, policyholders submit damage photos directly from mobile devices, triggering automated reserve allocations and repair authorizations.',
    domain: 'Insurance',
    author: 'Insurance Innovation Lab',
    publishedDate: '2026-09-10',
    readTime: '5 min read',
    tags: ['Premia', 'Insurance', 'Claims Automation', 'FNOL'],
  },
  {
    id: 'blog-erp-chemical-batch-traceability',
    slug: 'traceability-zatca-einvoicing-orion-erp',
    title: 'Mastering Chemical Distribution: Batch Traceability and GCC E-Invoicing',
    summary:
      'Regulatory compliance for chemical and industrial trading requires granular chain-of-custody tracking paired with direct tax authority digital reporting.',
    content:
      'Chemical distributors navigate hazardous materials standards, expiry management, and strict tax requirements. Orion Distribution Cloud ensures audit readiness from container arrival to invoice transmission.',
    domain: 'ERP',
    author: 'Orion ERP Practice',
    publishedDate: '2026-08-22',
    readTime: '7 min read',
    tags: ['Orion ERP', 'Chemical Distribution', 'ZATCA', 'Traceability'],
  },
];

// =========================================================================
// 9. OPEN CAREER OPPORTUNITIES
// =========================================================================
export const CAREERS: CareerPosition[] = [
  {
    id: 'job-lead-imal-architect',
    title: 'Lead Architect — iMAL Islamic Banking Platforms',
    department: 'Banking Engineering',
    location: 'Singapore / Dubai / Hybrid',
    employmentType: 'Full-time',
    experienceLevel: 'Senior / Lead (8+ Years)',
    description:
      'Architect the next evolution of our flagship iMAL Islamic Core Banking engine. Work directly with tier-1 Middle Eastern and Southeast Asian financial institutions.',
    responsibilities: [
      'Design high-availability cloud-native microservices for core banking operations',
      'Ensure strict compliance with AAOIFI accounting standards across core transaction pools',
      'Mentor senior engineering squads across distributed development centers in Singapore and India',
    ],
    requirements: [
      'Deep knowledge of Islamic finance contracts (Murabaha, Mudarabah, Ijara)',
      'Proven expertise in Java/Spring Boot, Kafka streaming, and PostgreSQL/Oracle ledger design',
      'Demonstrated experience modernizing legacy core banking stacks',
    ],
  },
  {
    id: 'job-senior-aml-ai-engineer',
    title: 'Senior AI/ML Engineer — Financial Crime & AMLOCK',
    department: 'Risk & Intelligence Labs',
    location: 'Bengaluru / Mumbai / Remote',
    employmentType: 'Full-time',
    experienceLevel: 'Senior (5+ Years)',
    description:
      'Build cutting-edge vector search, graph link analysis, and anomaly detection algorithms for AMLOCK surveillance.',
    responsibilities: [
      'Train vector embedding models for multilingual name and sanctions screening',
      'Develop unsupervised clustering models for transaction smurfing and fraud detection',
      'Optimize model inference speed to maintain sub-15ms latency on live payment streams',
    ],
    requirements: [
      'Strong hands-on Python, PyTorch, Milvus/Qdrant, and graph databases (Neo4j/Amazon Neptune)',
      'Experience in financial crime, AML, or fraud detection systems',
      'Understanding of ISO 20022 and SWIFT financial message formats',
    ],
  },
  {
    id: 'job-premia-insurance-consultant',
    title: 'Principal Business Solutions Consultant — Premia Insurance',
    department: 'Customer Success & Professional Services',
    location: 'Dubai, UAE / Riyadh, KSA',
    employmentType: 'Full-time',
    experienceLevel: 'Lead / Principal (7+ Years)',
    description:
      'Lead functional requirements gathering, product configuration, and business transformation for general and health insurance carriers across the GCC.',
    responsibilities: [
      'Translate carrier underwriting guidelines into Premia configuration rules',
      'Lead customer workshops with Chief Underwriting Officers and Claims Directors',
      'Manage system integration testing and cutover to live production',
    ],
    requirements: [
      'Extensive background in Property & Casualty or Takaful insurance operations',
      'Proven track record implementing core insurance policy administration suites',
      'Fluency in English; Arabic language proficiency strongly preferred',
    ],
  },
];
