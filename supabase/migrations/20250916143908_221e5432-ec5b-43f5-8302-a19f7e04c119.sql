-- Fix search path for handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'phone'
  );
  RETURN NEW;
END;
$$;

-- Fix search path for update_parking_rating function
CREATE OR REPLACE FUNCTION public.update_parking_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE parking_locations 
    SET 
        average_rating = COALESCE((
            SELECT AVG(rating)::NUMERIC(3,2) 
            FROM reviews 
            WHERE parking_location_id = COALESCE(NEW.parking_location_id, OLD.parking_location_id)
            AND is_approved = true
        ), 0),
        total_reviews = COALESCE((
            SELECT COUNT(*) 
            FROM reviews 
            WHERE parking_location_id = COALESCE(NEW.parking_location_id, OLD.parking_location_id)
            AND is_approved = true
        ), 0)
    WHERE id = COALESCE(NEW.parking_location_id, OLD.parking_location_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$;