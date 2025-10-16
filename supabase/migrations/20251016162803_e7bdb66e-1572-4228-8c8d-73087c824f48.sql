-- Allow service role to update payment fields via secure edge functions while keeping user protections
CREATE OR REPLACE FUNCTION public.prevent_payment_field_updates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Permit updates coming from service role (edge functions using service key)
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

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
$function$;

-- Ensure trigger exists and uses the updated function
DROP TRIGGER IF EXISTS trg_prevent_payment_field_updates ON public.bookings;
CREATE TRIGGER trg_prevent_payment_field_updates
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.prevent_payment_field_updates();