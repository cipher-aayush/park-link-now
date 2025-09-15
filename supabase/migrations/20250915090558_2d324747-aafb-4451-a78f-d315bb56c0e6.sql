-- Create bookings table for parking reservations
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  parking_location_id UUID NOT NULL REFERENCES public.parking_locations(id),
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_hours INTEGER NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT CHECK (payment_method IN ('upi', 'card', 'qr')),
  payment_id TEXT,
  booking_status TEXT NOT NULL DEFAULT 'active' CHECK (booking_status IN ('active', 'completed', 'cancelled')),
  vehicle_number TEXT,
  qr_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for bookings
CREATE POLICY "Users can view their own bookings" 
ON public.bookings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings" 
ON public.bookings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" 
ON public.bookings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Admin can view all bookings (for admin panel)
CREATE POLICY "Admins can view all bookings" 
ON public.bookings 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND (full_name ILIKE '%admin%' OR phone = 'admin')
  )
);

-- Create function to update timestamps
CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add admin role to profiles table
ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Create function to generate QR code text
CREATE OR REPLACE FUNCTION public.generate_booking_qr(booking_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN 'PARKING_BOOKING:' || booking_id::text || ':' || extract(epoch from now())::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;