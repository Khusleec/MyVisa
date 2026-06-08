-- 1. Add 'visa_issuer' to user_role enum
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'visa_issuer';

-- 2. Add 'position' column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS position VARCHAR(100);

-- 3. Create employee_invites Table
CREATE TABLE IF NOT EXISTS public.employee_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    register_no VARCHAR(10) NOT NULL UNIQUE,
    position VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create chat_messages Table
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.employee_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- 6. Policies for employee_invites
CREATE POLICY "Business admins can view company invites"
    ON public.employee_invites FOR SELECT
    USING (
        public.get_my_role() = 'business_admin'::public.user_role
        AND company_id = public.get_my_company_id()
    );

CREATE POLICY "Business admins can insert company invites"
    ON public.employee_invites FOR INSERT
    WITH CHECK (
        public.get_my_role() = 'business_admin'::public.user_role
        AND company_id = public.get_my_company_id()
    );

CREATE POLICY "Business admins can delete company invites"
    ON public.employee_invites FOR DELETE
    USING (
        public.get_my_role() = 'business_admin'::public.user_role
        AND company_id = public.get_my_company_id()
    );

-- 7. Policies for chat_messages
CREATE POLICY "Users can view their own chat messages"
    ON public.chat_messages FOR SELECT
    USING (
        auth.uid() = sender_id OR auth.uid() = receiver_id
    );

CREATE POLICY "Users can insert their own chat messages"
    ON public.chat_messages FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id
    );

-- 8. Policies for payments INSERT (previously missing)
CREATE POLICY "Users can insert payments for their own applications"
    ON public.payments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.visa_applications app
            WHERE app.id = application_id
            AND (app.user_id = auth.uid() OR app.created_by = auth.uid())
        )
    );

CREATE POLICY "Business admins can insert company payments"
    ON public.payments FOR INSERT
    WITH CHECK (
        public.get_my_role() = 'business_admin'::public.user_role
        AND (
            company_id = public.get_my_company_id()
            OR EXISTS (
                SELECT 1 FROM public.visa_applications app
                WHERE app.id = application_id
                AND app.company_id = public.get_my_company_id()
            )
        )
    );

-- 9. Storage bucket and policies for documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('documents', 'documents', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they conflict
DROP POLICY IF EXISTS "Users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;

-- Allow users to upload documents to their folder
CREATE POLICY "Users can upload documents" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'documents'
        AND (select auth.uid()::text) = (storage.foldername(name))[1]
    );

-- Allow users and visa issuers/company admins to view documents
CREATE POLICY "Users can view their own documents" ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'documents'
        AND (
            (select auth.uid()::text) = (storage.foldername(name))[1]
            OR EXISTS (
                SELECT 1 FROM public.profiles p
                WHERE p.id = auth.uid()
                AND p.role = 'visa_issuer'::public.user_role
            )
            OR EXISTS (
                SELECT 1 FROM public.profiles p
                WHERE p.id = auth.uid()
                AND p.role = 'business_admin'::public.user_role
                AND p.company_id = (
                    SELECT company_id FROM public.profiles p2 
                    WHERE p2.id::text = (storage.foldername(name))[1]
                )
            )
        )
    );

-- 10. Additional RLS Policies for Visa Issuers
CREATE POLICY "Visa issuers can view all profiles"
    ON public.profiles FOR SELECT
    USING (
        public.get_my_role() = 'visa_issuer'::public.user_role
    );

CREATE POLICY "Visa issuers can view all applications"
    ON public.visa_applications FOR SELECT
    USING (
        public.get_my_role() = 'visa_issuer'::public.user_role
    );

CREATE POLICY "Visa issuers can update applications"
    ON public.visa_applications FOR UPDATE
    USING (
        public.get_my_role() = 'visa_issuer'::public.user_role
    )
    WITH CHECK (
        public.get_my_role() = 'visa_issuer'::public.user_role
    );

-- 11. Update handle_new_user trigger function to prevent spoofing and support employee invites
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invite_rec RECORD;
  claimed_role VARCHAR;
  final_role public.user_role;
  final_company_id UUID;
  final_position VARCHAR(100);
BEGIN
  -- Check for employee invites matching the email
  SELECT * INTO invite_rec FROM public.employee_invites WHERE email = NEW.email;

  IF FOUND THEN
    -- User is invited as an employee
    final_role := 'business_employee'::public.user_role;
    final_company_id := invite_rec.company_id;
    final_position := invite_rec.position;
    
    INSERT INTO public.profiles (id, name, register_no, phone, role, company_id, position, is_verified)
    VALUES (
      NEW.id,
      invite_rec.name,
      invite_rec.register_no,
      COALESCE(NEW.raw_user_meta_data->>'phone', ''),
      final_role,
      final_company_id,
      final_position,
      false -- Employees must verify via DAN
    );

    -- Clean up the invite
    DELETE FROM public.employee_invites WHERE id = invite_rec.id;
  ELSE
    -- Regular signup
    claimed_role := COALESCE(NEW.raw_user_meta_data->>'role', 'individual');
    
    -- Prevent role spoofing
    IF claimed_role = 'visa_issuer' THEN
      final_role := 'individual'::public.user_role;
      final_company_id := NULL;
    ELSIF claimed_role = 'business_admin' THEN
      -- Must verify that company_id is provided and doesn't already have an admin
      IF NEW.raw_user_meta_data->>'company_id' IS NOT NULL THEN
        final_company_id := (NEW.raw_user_meta_data->>'company_id')::uuid;
        
        IF EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE company_id = final_company_id AND role = 'business_admin'::public.user_role
        ) THEN
          -- Company already has a business admin, downgrade to individual
          final_role := 'individual'::public.user_role;
          final_company_id := NULL;
        ELSE
          final_role := 'business_admin'::public.user_role;
        END IF;
      ELSE
        final_role := 'individual'::public.user_role;
        final_company_id := NULL;
      END IF;
    ELSE
      -- Default to individual
      final_role := 'individual'::public.user_role;
      final_company_id := NULL;
    END IF;

    INSERT INTO public.profiles (id, name, register_no, phone, role, company_id, is_verified)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', 'Шинэ Хэрэглэгч'),
      NEW.raw_user_meta_data->>'register_no',
      NEW.raw_user_meta_data->>'phone',
      final_role,
      final_company_id,
      COALESCE((NEW.raw_user_meta_data->>'is_verified')::boolean, false)
    );
  END IF;

  RETURN NEW;
END;
$$;
