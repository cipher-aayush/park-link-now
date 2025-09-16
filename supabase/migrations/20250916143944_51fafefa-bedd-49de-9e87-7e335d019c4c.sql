-- Fix search path for generate_booking_qr function
CREATE OR REPLACE FUNCTION public.generate_booking_qr(booking_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN 'PARKING_BOOKING:' || booking_id::text || ':' || extract(epoch from now())::text;
END;
$$;