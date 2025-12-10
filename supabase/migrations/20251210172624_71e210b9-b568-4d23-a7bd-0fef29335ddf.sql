-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create parking_locations table
CREATE TABLE public.parking_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  total_slots INTEGER NOT NULL DEFAULT 50,
  available_slots INTEGER NOT NULL DEFAULT 50,
  price_per_hour DECIMAL(10, 2) NOT NULL DEFAULT 20.00,
  amenities TEXT[] DEFAULT '{}',
  rating DECIMAL(3, 2) DEFAULT 4.0,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  location_id UUID REFERENCES public.parking_locations(id) ON DELETE CASCADE NOT NULL,
  vehicle_number TEXT NOT NULL,
  vehicle_type TEXT NOT NULL DEFAULT 'car',
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  booking_status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_preferences table
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  dark_mode BOOLEAN NOT NULL DEFAULT false,
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create favorites table
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  location_id UUID REFERENCES public.parking_locations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, location_id)
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  location_id UUID REFERENCES public.parking_locations(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table (for admin access)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Enable RLS on all tables
ALTER TABLE public.parking_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies for parking_locations (public read)
CREATE POLICY "Anyone can view parking locations" ON public.parking_locations FOR SELECT USING (true);
CREATE POLICY "Admins can manage parking locations" ON public.parking_locations FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for bookings
CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own bookings" ON public.bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bookings" ON public.bookings FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all bookings" ON public.bookings FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_preferences
CREATE POLICY "Users can manage own preferences" ON public.user_preferences FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RLS Policies for favorites
CREATE POLICY "Users can manage own favorites" ON public.favorites FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create own reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON public.reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Insert sample parking locations for India
INSERT INTO public.parking_locations (name, address, city, state, latitude, longitude, total_slots, available_slots, price_per_hour, amenities, rating) VALUES
('Connaught Place Parking', 'Block A, Connaught Place', 'Delhi', 'Delhi', 28.6315, 77.2167, 200, 150, 40.00, ARRAY['CCTV', 'Security', 'EV Charging'], 4.5),
('Select Citywalk Parking', 'A-3, District Centre, Saket', 'Delhi', 'Delhi', 28.5286, 77.2193, 500, 320, 50.00, ARRAY['CCTV', 'Security', 'Covered', 'Valet'], 4.7),
('Phoenix Marketcity Parking', 'LBS Marg, Kurla West', 'Mumbai', 'Maharashtra', 19.0860, 72.8883, 600, 400, 60.00, ARRAY['CCTV', 'Security', 'Covered', 'EV Charging'], 4.6),
('Orion Mall Parking', 'Brigade Gateway, Rajajinagar', 'Bangalore', 'Karnataka', 13.0108, 77.5548, 400, 280, 50.00, ARRAY['CCTV', 'Security', 'Covered'], 4.4),
('Express Avenue Parking', 'Whites Road, Royapettah', 'Chennai', 'Tamil Nadu', 13.0569, 80.2639, 350, 200, 40.00, ARRAY['CCTV', 'Security', 'Covered'], 4.3),
('Inorbit Mall Parking', 'Mindspace, Hitech City', 'Hyderabad', 'Telangana', 17.4355, 78.3866, 450, 300, 45.00, ARRAY['CCTV', 'Security', 'Covered', 'EV Charging'], 4.5),
('City Centre Mall Parking', 'DC Block, Salt Lake', 'Kolkata', 'West Bengal', 22.5775, 88.4202, 300, 180, 35.00, ARRAY['CCTV', 'Security'], 4.2),
('Phoenix Marketcity Pune', 'Viman Nagar', 'Pune', 'Maharashtra', 18.5622, 73.9169, 400, 250, 45.00, ARRAY['CCTV', 'Security', 'Covered'], 4.4),
('Ahmedabad One Mall Parking', 'Vastrapur', 'Ahmedabad', 'Gujarat', 23.0386, 72.5252, 350, 220, 40.00, ARRAY['CCTV', 'Security', 'Covered'], 4.3),
('World Trade Park Parking', 'Malviya Nagar', 'Jaipur', 'Rajasthan', 26.8579, 75.8090, 400, 280, 35.00, ARRAY['CCTV', 'Security', 'Covered'], 4.4),
('Lulu Mall Parking', 'Edapally', 'Kochi', 'Kerala', 10.0276, 76.3076, 500, 350, 40.00, ARRAY['CCTV', 'Security', 'Covered', 'EV Charging'], 4.6),
('Magneto Mall Parking', 'Labhandi', 'Raipur', 'Chhattisgarh', 21.2200, 81.6500, 300, 200, 30.00, ARRAY['CCTV', 'Security', 'Covered'], 4.2),
('Surya Treasure Island Parking', 'Civic Centre', 'Bhilai', 'Chhattisgarh', 21.2147, 81.3749, 200, 150, 25.00, ARRAY['CCTV', 'Security'], 4.0);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for timestamp updates
CREATE TRIGGER update_parking_locations_updated_at BEFORE UPDATE ON public.parking_locations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();