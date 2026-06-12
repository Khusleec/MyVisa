-- ==========================================
-- 1. Fix Status Tampering & Self-Approval
-- ==========================================

-- Restrict user inserts to draft-only applications
DROP POLICY IF EXISTS "Individuals can insert their own applications" ON public.visa_applications;
CREATE POLICY "Individuals can insert their own applications"
    ON public.visa_applications FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id
        AND company_id IS NULL
        AND status = 'draft'::public.application_status
        AND (passport_url IS NULL OR split_part(passport_url, '/', 1) = auth.uid()::text)
        AND (photo_url IS NULL OR split_part(photo_url, '/', 1) = auth.uid()::text)
        AND (bank_statement_url IS NULL OR split_part(bank_statement_url, '/', 1) = auth.uid()::text)
    );

DROP POLICY IF EXISTS "Business admins can insert applications for their company" ON public.visa_applications;
CREATE POLICY "Business admins can insert applications for their company"
    ON public.visa_applications FOR INSERT
    TO authenticated
    WITH CHECK (
        public.get_my_role() = 'business_admin'::public.user_role
        AND company_id = public.get_my_company_id()
        AND status = 'draft'::public.application_status
        AND (passport_url IS NULL OR split_part(passport_url, '/', 1) = auth.uid()::text)
        AND (photo_url IS NULL OR split_part(photo_url, '/', 1) = auth.uid()::text)
        AND (bank_statement_url IS NULL OR split_part(bank_statement_url, '/', 1) = auth.uid()::text)
    );

DROP POLICY IF EXISTS "Users can edit their own applications (draft stage)" ON public.visa_applications;
CREATE POLICY "Users can edit their own applications (draft stage)"
    ON public.visa_applications FOR UPDATE
    TO authenticated
    USING (
        (auth.uid() = user_id OR auth.uid() = created_by)
        AND status = 'draft'::public.application_status
    )
    WITH CHECK (
        (auth.uid() = user_id OR auth.uid() = created_by)
        AND status IN (
            'draft'::public.application_status,
            'dan_verified'::public.application_status,
            'khur_checked'::public.application_status,
            'payment_pending'::public.application_status
        )
        AND (passport_url IS NULL OR split_part(passport_url, '/', 1) = auth.uid()::text)
        AND (photo_url IS NULL OR split_part(photo_url, '/', 1) = auth.uid()::text)
        AND (bank_statement_url IS NULL OR split_part(bank_statement_url, '/', 1) = auth.uid()::text)
    );

DROP POLICY IF EXISTS "Business admins can edit company applications (draft stage)" ON public.visa_applications;
CREATE POLICY "Business admins can edit company applications (draft stage)"
    ON public.visa_applications FOR UPDATE
    TO authenticated
    USING (
        public.get_my_role() = 'business_admin'::public.user_role
        AND company_id = public.get_my_company_id()
        AND status = 'draft'::application_status
    )
    WITH CHECK (
        public.get_my_role() = 'business_admin'::public.user_role
        AND company_id = public.get_my_company_id()
        AND status IN (
            'draft'::public.application_status,
            'dan_verified'::public.application_status,
            'khur_checked'::public.application_status,
            'payment_pending'::public.application_status
        )
        AND (passport_url IS NULL OR split_part(passport_url, '/', 1) = auth.uid()::text)
        AND (photo_url IS NULL OR split_part(photo_url, '/', 1) = auth.uid()::text)
        AND (bank_statement_url IS NULL OR split_part(bank_statement_url, '/', 1) = auth.uid()::text)
    );

-- ==========================================
-- 2. Fix Chat Visibility (Profiles RLS)
-- ==========================================

DROP POLICY IF EXISTS "Anyone can view company admins and visa issuers" ON public.profiles;

CREATE POLICY "Authenticated users can view visa issuers"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (
        role = 'visa_issuer'::public.user_role
    );

CREATE POLICY "Authenticated users can view business admins for chat"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (
        role = 'business_admin'::public.user_role
    );

-- ==========================================
-- 3. Remove vulnerable storage policy
-- ==========================================
-- Folder-based policy in 20260608_align_schema.sql already covers:
--   - own-folder access (auth.uid())
--   - visa issuer access
--   - business admin access for same-company employee folders

DROP POLICY IF EXISTS "Users can view documents linked to their applications" ON storage.objects;
