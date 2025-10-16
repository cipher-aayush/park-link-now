-- Insert parking locations in Chhattisgarh (Raipur area)

-- Near AIIMS Raipur
INSERT INTO public.parking_locations (name, address, latitude, longitude, total_slots, available_slots, price_per_hour, features, category, images)
VALUES 
  ('AIIMS Raipur Parking', 'Tatibandh, GE Road, Raipur, Chhattisgarh 492099', 21.2514, 81.6296, 200, 150, 30, ARRAY['Security', 'CCTV', 'Covered', '24/7 Access'], 'covered', ARRAY[]::text[]),
  
  -- Near Magneto The Mall
  ('Magneto Mall Parking', 'Magneto The Mall, GE Road, Raipur, Chhattisgarh 492001', 21.2497, 81.6293, 300, 280, 40, ARRAY['Security', 'CCTV', 'Covered', 'EV Charging'], 'covered', ARRAY[]::text[]),
  
  -- Near City Mall 36
  ('City Mall 36 Parking', 'Pandri, Raipur, Chhattisgarh 492001', 21.2345, 81.6445, 250, 200, 35, ARRAY['Security', 'CCTV', 'Covered', 'EV Charging'], 'covered', ARRAY[]::text[]),
  
  -- Near Raipur Railway Station
  ('Raipur Railway Station Parking', 'Station Road, Raipur, Chhattisgarh 492001', 21.2514, 81.6296, 150, 120, 25, ARRAY['Security', 'CCTV', '24/7 Access'], 'open', ARRAY[]::text[]),
  
  -- Near Swami Vivekananda Airport
  ('Raipur Airport Parking', 'Swami Vivekananda Airport, Raipur, Chhattisgarh 493661', 21.1804, 81.7389, 400, 350, 50, ARRAY['Security', 'CCTV', 'Covered', '24/7 Access', 'EV Charging'], 'covered', ARRAY[]::text[]),
  
  -- Near Marine Drive
  ('Marine Drive Parking', 'Marine Drive, Telibandha, Raipur, Chhattisgarh 492001', 21.2361, 81.6445, 100, 75, 20, ARRAY['Security', 'CCTV'], 'open', ARRAY[]::text[]),
  
  -- Near Ambuja City Center
  ('Ambuja City Center Parking', 'Mowa, Raipur, Chhattisgarh 492007', 21.2084, 81.6565, 200, 180, 30, ARRAY['Security', 'CCTV', 'Covered'], 'covered', ARRAY[]::text[]),
  
  -- Near Ramkrishna Care Hospital
  ('Ramkrishna Hospital Parking', 'Aurobindo Enclave, Pachpedi Naka, Raipur, Chhattisgarh 492001', 21.2280, 81.6528, 120, 90, 25, ARRAY['Security', 'CCTV', '24/7 Access'], 'open', ARRAY[]::text[]),
  
  -- Near NIT Raipur
  ('NIT Raipur Parking', 'GE Road, Raipur, Chhattisgarh 492010', 21.1251, 81.6077, 150, 130, 20, ARRAY['Security', 'CCTV'], 'open', ARRAY[]::text[]),
  
  -- Near Buddha Talab
  ('Buddha Talab Parking', 'Civil Lines, Raipur, Chhattisgarh 492001', 21.2333, 81.6333, 80, 60, 15, ARRAY['Security', 'CCTV'], 'open', ARRAY[]::text[]),
  
  -- Near Devendra Nagar
  ('Devendra Nagar Market Parking', 'Devendra Nagar, Raipur, Chhattisgarh 492001', 21.2614, 81.6428, 100, 85, 20, ARRAY['Security', 'CCTV'], 'open', ARRAY[]::text[]),
  
  -- Near Raj Bhavan
  ('Raj Bhavan Area Parking', 'Jail Road, Raipur, Chhattisgarh 492001', 21.2451, 81.6250, 60, 45, 25, ARRAY['Security', 'CCTV'], 'open', ARRAY[]::text[])
  
ON CONFLICT DO NOTHING;