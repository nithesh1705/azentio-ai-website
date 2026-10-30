-- =========================================================================
-- azentio.ai - Exact Our Presence Registry Migration
-- Safe idempotent execution (adds phone column if missing and updates records)
-- =========================================================================

-- 1. Ensure phone column exists on presence_offices
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'presence_offices' 
          AND column_name = 'phone'
    ) THEN
        ALTER TABLE public.presence_offices ADD COLUMN phone TEXT;
    END IF;
END $$;

-- 2. Clear old presence seed and insert exact corporate registry data
DELETE FROM public.presence_offices;

INSERT INTO public.presence_offices (id, city, country, region, is_headquarters, type, address, phone)
VALUES
    (
        'pres-singapore',
        'Singapore',
        'Singapore',
        'Asia Pacific',
        true,
        'Corporate Headquarters',
        'Office No. 503, Spaces Clarke Quay, 4th to 6th Floor, 21 Merchant Road, Singapore 58267.',
        '+65 6956 7503'
    ),
    (
        'pres-bahrain',
        'Manama',
        'Bahrain',
        'Middle East',
        false,
        'Regional Office',
        'Office # 1140, Regus Bahrain Financial Harbour East Tower, 11th Floor, Manama, 346, Bahrain',
        '+973 3949 9923'
    ),
    (
        'pres-bangalore',
        'Bengaluru',
        'India',
        'South Asia',
        false,
        'Technology & Delivery Center',
        '5th Floor, Wing B, Electra Block, Exora Business Park, Kadubeesanahalli Village, Varthur Hobli, Outer Ring Road, Bengaluru East Taluk, Bengaluru, Karnataka 560103.',
        '+91 80 6954 8000'
    ),
    (
        'pres-chennai',
        'Chennai',
        'India',
        'South Asia',
        false,
        'Technology & Delivery Center',
        'Prince Infocity-II, 3rd Floor, No. 283/4, Rajiv Gandhi Salai (OMR), Kandanchavadi, Chennai – 600 096.',
        '+91 44 6909 2000'
    ),
    (
        'pres-egypt',
        'New Cairo',
        'Egypt',
        'Africa',
        false,
        'Regional Office',
        '1st floor, Polyom Building, Land piece No. 22, 1st Sector - Fifth Settlement, Down town Area, New Cairo, Egypt.',
        NULL
    ),
    (
        'pres-hyderabad',
        'Hyderabad',
        'India',
        'South Asia',
        false,
        'Technology & Delivery Center',
        '4th Floor, Western Dallas Centre, Survey #83/1, Raidurg Village, Serilingampally Mandal, RR District, Hyderabad 500032.',
        NULL
    ),
    (
        'pres-kenya',
        'Nairobi',
        'Kenya',
        'Africa',
        false,
        'Regional Office',
        'Office no. G24, Vienna Court, State House Crescent Road, Nairobi, Kenya.',
        NULL
    ),
    (
        'pres-kochi',
        'Kochi',
        'India',
        'South Asia',
        false,
        'Technology & Delivery Center',
        'Regus, Skyline Upper Crest, Office no. 503, 5th Floor, Info Park Road, Kusumagiri (PO), Kakkanad, Ernakulam, Kerala, 682030',
        '+91 484 2388 800'
    ),
    (
        'pres-lebanon',
        'Beirut',
        'Lebanon',
        'Middle East',
        false,
        'Regional Office',
        'Regus, Mathaf, 4th floor, Office No.427,428, 430 & 432, Le Bureau Building, Mathaf Street, Beirut, Lebanon.',
        NULL
    ),
    (
        'pres-malaysia',
        'Kuala Lumpur',
        'Malaysia',
        'Asia Pacific',
        false,
        'Regional Office',
        'Regus, Office # MR1, Level 28, The Gardens South Tower, Mid Valley City, Lingkaran Syed Putra, Kuala Lumpur - 59200, Malayasia',
        '+60 3-22987334   |   +60 3-22987335'
    ),
    (
        'pres-mumbai',
        'Mumbai',
        'India',
        'South Asia',
        false,
        'Technology & Delivery Center',
        'Aurum Q Parc, Unit No. 703, 7th Floor, Building Q2, Plot No. Gen 4/1, TTC Industrial Area, Thane Belapur Road, Ghansoli, Navi Mumbai, Thane, Maharashtra 400710.',
        '+91 22 4801 9001'
    ),
    (
        'pres-nigeria',
        'Lagos',
        'Nigeria',
        'Africa',
        false,
        'Regional Office',
        'Regus, 927/928 Bishop Aboyade Cole St. Victoria Island, 3rd floor, Mansard Place, Lagos, 106104, Nigeria',
        NULL
    ),
    (
        'pres-philippines',
        'Manila',
        'Philippines',
        'Asia Pacific',
        false,
        'Regional Office',
        'Office No. 4000C, Level 40, PBCom Tower, 6795 Ayala Avenue Corner V.A., Rufino Street, Makati City, Makati, 1226 Manila.',
        '+63 28 789 9000'
    ),
    (
        'pres-saudi-arabia',
        'Riyadh',
        'Saudi Arabia',
        'Middle East',
        false,
        'Regional Office',
        'Riyadh World Trade Centre, Bahrain Tower, Office No. 209, 2nd Floor, King Fahad Road, PO Box No. 8953, Riyadh 12214-2393, KSA.',
        '+00966 112795071   |   +00966 112795072'
    ),
    (
        'pres-thailand',
        'Bangkok',
        'Thailand',
        'Asia Pacific',
        false,
        'Regional Office',
        'Unit 3301, 33rd Floor, Regus Interchange 21, No.399, Sukhumvit Road, North Klong toey, Wattana, Bangkok - 10110 Thailand',
        '+66 2660 3865'
    ),
    (
        'pres-uae',
        'Dubai',
        'United Arab Emirates',
        'Middle East',
        false,
        'Regional Office',
        'Tower A, Business Central Towers, 7th floor, Office No. BT 701A-BT 707A, TECOM, PO Box 449686.',
        NULL
    ),
    (
        'pres-united-states',
        'Irving (Texas)',
        'United States',
        'Americas',
        false,
        'Regional Office',
        'B2 USA Inc Tx, Irving - Las Colinas The Urban Towers, 222 West las Colinas Blvd. Suite 1650, Irving, Texas 75039, USA',
        '+1 940 294 8080   |   +1 484 265 1137 Extn: 1137'
    );

