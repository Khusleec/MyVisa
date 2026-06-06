-- 1. Create custom enum types for roles
CREATE TYPE user_role AS ENUM ('individual', 'business_admin', 'business_employee');
CREATE TYPE application_status AS ENUM ('draft', 'dan_verified', 'khur_checked', 'payment_pending', 'submitted', 'approved', 'rejected');
CREATE TYPE payment_status AS ENUM ('unpaid', 'paid');

-- 2. Create Companies Table
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    registration_no VARCHAR(50) NOT NULL UNIQUE, -- Улсын бүртгэлийн дугаар
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Profiles / Users Table (linked with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    register_no VARCHAR(10), -- Монгол Улсын Регистрийн Дугаар (УУ94021512)
    phone VARCHAR(20),
    role user_role DEFAULT 'individual'::user_role NOT NULL,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    is_verified BOOLEAN DEFAULT false NOT NULL, -- DAN verification flag
    profile_photo TEXT, -- Base64 profile photo url
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Visa Applications Table
CREATE TABLE IF NOT EXISTS public.visa_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- The applicant or employee
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Who filled it (could be HR Admin)
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL, -- Null if individual B2C
    applicant_name VARCHAR(255) NOT NULL,
    applicant_relation VARCHAR(100), -- 'Self', 'Spouse', 'Child', 'Employee'
    country VARCHAR(150) NOT NULL,
    country_code VARCHAR(10) NOT NULL,
    status application_status DEFAULT 'draft'::application_status NOT NULL,
    passport_url TEXT, -- Encrypted document location
    bank_statement_url TEXT,
    photo_url TEXT,
    khur_salary NUMERIC,
    khur_employer VARCHAR(255),
    khur_insurance_months INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES public.visa_applications(id) ON DELETE CASCADE, -- Single applicant payment
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL, -- Bulk payment by company
    amount NUMERIC NOT NULL,
    qpay_invoice VARCHAR(100) NOT NULL UNIQUE,
    status payment_status DEFAULT 'unpaid'::payment_status NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visa_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

--------------------------------------------------------------------------------
-- HELPER FUNCTIONS FOR RLS POLICIES (To avoid infinite recursion)
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS public.user_role
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  my_role public.user_role;
BEGIN
  SELECT role INTO my_role FROM public.profiles WHERE id = auth.uid();
  RETURN my_role;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_my_company_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  my_company_id UUID;
BEGIN
  SELECT company_id INTO my_company_id FROM public.profiles WHERE id = auth.uid();
  RETURN my_company_id;
END;
$$;

--------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
--------------------------------------------------------------------------------

-- Profiles Policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Business admins can view company employee profiles"
    ON public.profiles FOR SELECT
    USING (
        public.get_my_role() = 'business_admin'::public.user_role 
        AND public.get_my_company_id() = company_id
    );

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Companies Policies
CREATE POLICY "Users can view their linked company"
    ON public.companies FOR SELECT
    USING (
        id = public.get_my_company_id()
    );

CREATE POLICY "Anyone can insert a company"
    ON public.companies FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can update company details"
    ON public.companies FOR UPDATE
    USING (
        public.get_my_role() = 'business_admin'::public.user_role
        AND id = public.get_my_company_id()
    );

-- Visa Applications Policies
CREATE POLICY "Individuals can view their own applications"
    ON public.visa_applications FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() = created_by);

CREATE POLICY "Business admins can view company applications"
    ON public.visa_applications FOR SELECT
    USING (
        public.get_my_role() = 'business_admin'::public.user_role
        AND company_id = public.get_my_company_id()
    );

CREATE POLICY "Individuals can insert their own applications"
    ON public.visa_applications FOR INSERT
    WITH CHECK (auth.uid() = user_id AND company_id IS NULL);

CREATE POLICY "Business admins can insert applications for their company"
    ON public.visa_applications FOR INSERT
    WITH CHECK (
        public.get_my_role() = 'business_admin'::public.user_role
        AND company_id = public.get_my_company_id()
    );

CREATE POLICY "Users can edit their own applications (draft stage)"
    ON public.visa_applications FOR UPDATE
    USING (
        (auth.uid() = user_id OR auth.uid() = created_by) 
        AND status = 'draft'::application_status
    )
    WITH CHECK (
        auth.uid() = user_id OR auth.uid() = created_by
    );

CREATE POLICY "Business admins can edit company applications (draft stage)"
    ON public.visa_applications FOR UPDATE
    USING (
        public.get_my_role() = 'business_admin'::public.user_role
        AND company_id = public.get_my_company_id()
        AND status = 'draft'::application_status
    )
    WITH CHECK (
        public.get_my_role() = 'business_admin'::public.user_role
        AND company_id = public.get_my_company_id()
    );

-- Payments Policies
CREATE POLICY "Users can view their own payments"
    ON public.payments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.visa_applications app
            WHERE app.id = public.payments.application_id
            AND (app.user_id = auth.uid() OR app.created_by = auth.uid())
        )
    );

CREATE POLICY "Business admins can view their company payments"
    ON public.payments FOR SELECT
    USING (
        public.get_my_role() = 'business_admin'::public.user_role
        AND company_id = public.get_my_company_id()
    );

--------------------------------------------------------------------------------
-- TRIGGERS FOR PROFILE AUTO-CREATION ON SIGN UP
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, register_no, phone, role, company_id, is_verified)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Шинэ Хэрэглэгч'),
    NEW.raw_user_meta_data->>'register_no',
    NEW.raw_user_meta_data->>'phone',
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'individual'::public.user_role),
    (NEW.raw_user_meta_data->>'company_id')::uuid,
    COALESCE((NEW.raw_user_meta_data->>'is_verified')::boolean, false)
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
