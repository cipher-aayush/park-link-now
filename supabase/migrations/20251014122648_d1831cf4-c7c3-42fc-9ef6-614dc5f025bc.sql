-- Fix payment security: Remove user ability to update payment_status directly
-- Users can only update their bookings EXCEPT payment-related fields

-- First, drop the existing policy that allows users to update their own bookings
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;

-- Create new policy that allows users to update only non-payment fields
CREATE POLICY "Users can update non-payment booking fields" 
ON public.bookings 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id AND
  -- Ensure users cannot modify payment-related fields
  -- This is enforced by comparing OLD and NEW values in a trigger
  true
);

-- Create a trigger function to prevent users from modifying payment fields
CREATE OR REPLACE FUNCTION public.prevent_payment_field_updates()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow admins to update anything
  IF EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  ) THEN
    RETURN NEW;
  END IF;
  
  -- For regular users, prevent modification of payment-related fields
  IF OLD.payment_status IS DISTINCT FROM NEW.payment_status THEN
    RAISE EXCEPTION 'Direct modification of payment_status is not allowed';
  END IF;
  
  IF OLD.payment_id IS DISTINCT FROM NEW.payment_id THEN
    RAISE EXCEPTION 'Direct modification of payment_id is not allowed';
  END IF;
  
  IF OLD.payment_method IS DISTINCT FROM NEW.payment_method THEN
    RAISE EXCEPTION 'Direct modification of payment_method is not allowed';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to enforce payment field protection
DROP TRIGGER IF EXISTS protect_payment_fields ON public.bookings;
CREATE TRIGGER protect_payment_fields
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_payment_field_updates();

-- Create a secure function to update payment status (to be called by edge functions only)
CREATE OR REPLACE FUNCTION public.update_booking_payment(
  _booking_id UUID,
  _payment_id TEXT,
  _payment_method TEXT,
  _payment_status TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- This function should only be called by authenticated service role
  -- Additional verification would be done in the edge function
  
  UPDATE public.bookings
  SET 
    payment_id = _payment_id,
    payment_method = _payment_method,
    payment_status = _payment_status,
    updated_at = now()
  WHERE id = _booking_id;
  
  RETURN FOUND;
END;
$$;