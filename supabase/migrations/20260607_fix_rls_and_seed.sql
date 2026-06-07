-- 1. Add allowed_countries column to companies table if it doesn't exist
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS allowed_countries TEXT[] DEFAULT ARRAY['KR', 'JP', 'DE', 'AU'];

-- 2. Drop existing SELECT and INSERT policies on companies table to prevent conflicts
DROP POLICY IF EXISTS "Users can view their linked company" ON public.companies;
DROP POLICY IF EXISTS "Anyone can insert a company" ON public.companies;
DROP POLICY IF EXISTS "Anyone can view companies" ON public.companies;

-- 3. Create permissive policies so that:
--    a. Anyone can view all companies (needed for company search and chat listing by Visa Issuers)
--    b. Anyone can insert a company (needed for registration)
CREATE POLICY "Anyone can view companies"
    ON public.companies FOR SELECT
    USING (true);

CREATE POLICY "Anyone can insert a company"
    ON public.companies FOR INSERT
    WITH CHECK (true);

-- 4. Seed the database with 6 fictional companies, 
--    each configured with a unique set of 1 to 4 countries they can issue visas to.
INSERT INTO public.companies (id, name, registration_no, allowed_countries)
VALUES 
  ('c0000000-0000-0000-0000-000000000001', 'Терасофт Технологи ХХК', '5091234', ARRAY['KR', 'JP', 'DE']),
  ('c0000000-0000-0000-0000-000000000002', 'Солонго Телеком ХХК', '2054321', ARRAY['JP', 'DE', 'AU']),
  ('c0000000-0000-0000-0000-000000000003', 'Ази Капитал Банк ХХК', '5078912', ARRAY['KR', 'AU']),
  ('c0000000-0000-0000-0000-000000000004', 'Номад Трэйд ХХК', '5012345', ARRAY['DE']),
  ('c0000000-0000-0000-0000-000000000005', 'Эрдэнэт Хүнс ХК', '2011223', ARRAY['KR', 'JP', 'DE', 'AU']),
  ('c0000000-0000-0000-0000-000000000006', 'Мөнх Групп ХХК', '9011022', ARRAY['KR', 'JP'])
ON CONFLICT (registration_no) 
DO UPDATE SET 
  name = EXCLUDED.name,
  allowed_countries = EXCLUDED.allowed_countries;
