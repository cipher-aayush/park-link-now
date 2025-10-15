-- Drop the existing function and recreate it to include qr_code update
DROP FUNCTION IF EXISTS public.update_booking_payment(uuid, text, text, text);

CREATE OR REPLACE FUNCTION public.update_booking_payment(
  _booking_id uuid,
  _payment_id text,
  _payment_method text,
  _payment_status text,
  _qr_code text DEFAULT NULL
)
RETURNS boolean
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
    qr_code = COALESCE(_qr_code, qr_code),
    updated_at = now()
  WHERE id = _booking_id;
  
  RETURN FOUND;
END;
$$;