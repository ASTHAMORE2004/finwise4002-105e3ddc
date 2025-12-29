-- Add INSERT policy for authenticated users to create IPO listings
CREATE POLICY "Authenticated users can create IPO listings" 
ON public.ipo_listings 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Add UPDATE policy for users to update their own IPO listings (optional for future)
CREATE POLICY "Users can update IPO listings" 
ON public.ipo_listings 
FOR UPDATE 
TO authenticated
USING (true);

-- Ensure kyc_documents has proper INSERT policy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'kyc_documents' 
    AND policyname = 'Users can insert their own KYC documents'
  ) THEN
    CREATE POLICY "Users can insert their own KYC documents" 
    ON public.kyc_documents 
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;