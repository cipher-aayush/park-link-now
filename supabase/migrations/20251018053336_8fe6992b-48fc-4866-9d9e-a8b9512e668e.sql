-- Add parking locations in Bhilai, Chhattisgarh
INSERT INTO public.parking_locations (name, address, latitude, longitude, total_slots, available_slots, price_per_hour, category, features) VALUES
('Civic Center Parking', 'Civic Centre, Bhilai, Chhattisgarh 490006', 21.2097, 81.3784, 100, 85, 20, 'covered', ARRAY['CCTV', 'Security', 'Covered', '24/7 Access']),
('Steel Plant Gate 1 Parking', 'SAIL Bhilai Steel Plant, Gate 1, Bhilai', 21.2167, 81.4304, 150, 120, 15, 'open', ARRAY['Security', 'CCTV', 'Well-lit']),
('Nehru Art Gallery Parking', 'Nehru Art Gallery, Supela, Bhilai', 21.2426, 81.3710, 60, 45, 25, 'open', ARRAY['CCTV', 'Security', 'Covered']),
('Maitri Bagh Parking', 'Maitri Bagh Zoo, Bhilai, Chhattisgarh', 21.1878, 81.3425, 200, 150, 30, 'open', ARRAY['Security', 'CCTV', 'EV Charging', 'Well-lit']),
('Smriti Van Parking', 'Smriti Van, Kurud Road, Bhilai', 21.1547, 81.4289, 80, 60, 20, 'open', ARRAY['Security', 'CCTV', 'Covered']),
('Bhilai Central Mall Parking', 'Khursipar, Bhilai, Chhattisgarh 490011', 21.2145, 81.4356, 120, 95, 35, 'covered', ARRAY['CCTV', 'Security', 'Covered', 'EV Charging', 'Valet Service']),
('Sector 6 Market Parking', 'Sector 6, Bhilai, Chhattisgarh', 21.2234, 81.4267, 70, 50, 15, 'open', ARRAY['CCTV', 'Security', 'Well-lit']),
('Ispat Club Parking', 'Ispat Club, Sector 1, Bhilai', 21.2089, 81.4123, 90, 70, 25, 'open', ARRAY['Security', 'CCTV', 'Covered', '24/7 Access']),
('Pt. Deendayal Upadhyay Memorial Hospital Parking', 'Hospital Sector, Bhilai', 21.1923, 81.4178, 150, 110, 20, 'covered', ARRAY['CCTV', 'Security', 'Covered', 'Disabled Access']),
('Railway Station Bhilai Parking', 'Bhilai Railway Station, Station Road', 21.2012, 81.4234, 180, 140, 25, 'open', ARRAY['CCTV', 'Security', '24/7 Access', 'Well-lit']);