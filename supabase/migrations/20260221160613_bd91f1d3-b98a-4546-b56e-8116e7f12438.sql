-- Tighten OTP update policy to only allow updating own OTPs
DROP POLICY IF EXISTS "Users can update their own OTPs" ON public.otp_verifications;
CREATE POLICY "Users can update their own OTPs" ON public.otp_verifications
  FOR UPDATE USING (
    (auth.uid() = user_id) OR (user_id IS NULL)
  );