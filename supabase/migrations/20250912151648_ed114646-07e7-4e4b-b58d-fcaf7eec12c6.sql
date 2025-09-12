-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
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

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create parking locations table
CREATE TABLE public.parking_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  total_slots INTEGER NOT NULL DEFAULT 0,
  available_slots INTEGER NOT NULL DEFAULT 0,
  price_per_hour DECIMAL(10,2) NOT NULL,
  features TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for parking locations
ALTER TABLE public.parking_locations ENABLE ROW LEVEL SECURITY;

-- Create policy for parking locations (readable by all authenticated users)
CREATE POLICY "Parking locations are viewable by authenticated users" 
ON public.parking_locations 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Insert sample parking locations with famous malls
INSERT INTO public.parking_locations (name, address, latitude, longitude, total_slots, available_slots, price_per_hour, features) VALUES
('Phoenix MarketCity Mall', 'LBS Marg, Kurla West, Mumbai', 19.0728, 72.8826, 500, 45, 50.00, '{"Security", "CCTV", "Covered"}'),
('Select City Walk Mall', 'A-3, District Centre, Saket, New Delhi', 28.5245, 77.2066, 800, 120, 40.00, '{"Security", "CCTV", "Valet", "EV Charging"}'),
('Forum Mall Bangalore', '21, Hosur Road, Adugodi, Bangalore', 12.9352, 77.6245, 600, 78, 30.00, '{"Security", "CCTV", "Covered", "24/7"}'),
('Express Avenue Mall', 'Express Estate, Royapettah, Chennai', 13.0569, 80.2570, 400, 32, 35.00, '{"Security", "CCTV", "Covered"}'),
('Palladium Mall', 'High Street Phoenix, Lower Parel, Mumbai', 19.0176, 72.8295, 350, 25, 60.00, '{"Security", "CCTV", "Valet", "Premium"}'),
('DLF Mall of India', 'Sector 18, Noida, Uttar Pradesh', 28.5679, 77.3178, 1000, 156, 45.00, '{"Security", "CCTV", "Covered", "EV Charging"}')