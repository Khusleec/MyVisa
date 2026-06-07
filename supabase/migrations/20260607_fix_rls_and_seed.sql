-- 1. Add columns to companies table if they don't exist
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS allowed_countries TEXT[] DEFAULT ARRAY['KR', 'JP', 'DE', 'AU'];
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS advantages TEXT[];

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
--    each configured with a unique set of 1 to 4 countries they can issue visas to, along with contact details.
INSERT INTO public.companies (id, name, registration_no, allowed_countries, phone, address, advantages)
VALUES 
  ('c0000000-0000-0000-0000-000000000001', 'Терасофт Технологи ХХК', '5091234', ARRAY['KR', 'JP', 'DE'], '7575-1111', 'Сүхбаатар дүүрэг, 1-р хороо, Олимпын гудамж, Терасофт Тауэр', ARRAY['Хурдан шуурхай', 'Найдвартай хамт олон', '24/7 хэрэглэгчийн дэмжлэг']),
  ('c0000000-0000-0000-0000-000000000002', 'Солонго Телеком ХХК', '2054321', ARRAY['JP', 'DE', 'AU'], '7575-2222', 'Чингэлтэй дүүрэг, 3-р хороо, Энхтайваны өргөн чөлөө, Солонго оффис', ARRAY['Бүрэн дижитал систем', 'Хамгийн хямд хураамж', 'Олон жилийн туршлага']),
  ('c0000000-0000-0000-0000-000000000003', 'Ази Капитал Банк ХХК', '5078912', ARRAY['KR', 'AU'], '7575-3333', 'Сүхбаатар дүүрэг, 8-р хороо, Сүхбаатарын талбай 2, Ази Капитал төв', ARRAY['Дансны баталгаа үнэгүй', 'VIP үйлчилгээ', 'Зээлийн нөхцөлүүд']),
  ('c0000000-0000-0000-0000-000000000004', 'Номад Трэйд ХХК', '5012345', ARRAY['DE'], '7575-4444', 'Баянзүрх дүүрэг, 26-р хороо, Их Монгол улсын гудамж, Номад плаза', ARRAY['Шенгений визний өндөр хувь', 'Материал орчуулга үнэгүй']),
  ('c0000000-0000-0000-0000-000000000005', 'Эрдэнэт Хүнс ХК', '2011223', ARRAY['KR', 'JP', 'DE', 'AU'], '7575-5555', 'Баянгол дүүрэг, 4-р хороо, Үйлдвэрчний эвлэлийн гудамж, Эрдэнэт цогцолбор', ARRAY['Бүх төрлийн баримт бүрдүүлэлт', 'Хөнгөлөлттэй үнэ']),
  ('c0000000-0000-0000-0000-000000000006', 'Мөнх Групп ХХК', '9011022', ARRAY['KR', 'JP'], '7575-6666', 'Хан-Уул дүүрэг, 15-р хороо, Махатма Гандийн гудамж, Мөнх плаза', ARRAY['Элчингийн найдвартай түнш', 'Өндөр баталгаа'])
ON CONFLICT (registration_no) 
DO UPDATE SET 
  name = EXCLUDED.name,
  allowed_countries = EXCLUDED.allowed_countries,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  advantages = EXCLUDED.advantages;
