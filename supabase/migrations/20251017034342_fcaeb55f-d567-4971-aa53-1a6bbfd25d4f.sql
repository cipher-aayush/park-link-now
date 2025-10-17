-- Insert parking locations across major cities in India

-- Delhi NCR locations
INSERT INTO public.parking_locations (name, address, latitude, longitude, total_slots, available_slots, price_per_hour, features, category, images)
VALUES 
  ('Connaught Place Parking', 'Connaught Place, New Delhi, Delhi 110001', 28.6315, 77.2167, 500, 120, 50, ARRAY['Security', 'CCTV', 'Covered', 'EV Charging'], 'covered', ARRAY[]::text[]),
  ('India Gate Parking', 'Rajpath, New Delhi, Delhi 110001', 28.6129, 77.2295, 300, 85, 40, ARRAY['Security', 'CCTV'], 'open', ARRAY[]::text[]),
  ('Cyber Hub Parking', 'DLF Cyber City, Gurgaon, Haryana 122002', 28.4950, 77.0890, 800, 200, 60, ARRAY['Security', 'CCTV', 'Covered', 'EV Charging', 'Valet'], 'covered', ARRAY[]::text[]),
  ('IGI Airport T3 Parking', 'Indira Gandhi International Airport, New Delhi 110037', 28.5562, 77.1000, 2000, 450, 70, ARRAY['Security', 'CCTV', 'Covered', '24/7 Access', 'EV Charging'], 'covered', ARRAY[]::text[]),
  ('Saket Metro Station Parking', 'Saket, New Delhi, Delhi 110017', 28.5205, 77.2073, 250, 180, 30, ARRAY['Security', 'CCTV'], 'open', ARRAY[]::text[]),
  
  -- Mumbai locations
  ('Gateway of India Parking', 'Apollo Bandar, Colaba, Mumbai 400001', 18.9220, 72.8347, 200, 45, 80, ARRAY['Security', 'CCTV', 'Valet'], 'open', ARRAY[]::text[]),
  ('Bandra Kurla Complex Parking', 'BKC, Bandra East, Mumbai 400051', 19.0596, 72.8656, 600, 150, 70, ARRAY['Security', 'CCTV', 'Covered', 'EV Charging'], 'covered', ARRAY[]::text[]),
  ('Chhatrapati Shivaji Terminal Parking', 'CST, Mumbai 400001', 18.9398, 72.8355, 400, 95, 50, ARRAY['Security', 'CCTV', '24/7 Access'], 'open', ARRAY[]::text[]),
  ('Mumbai Airport T2 Parking', 'Chhatrapati Shivaji International Airport, Mumbai 400099', 19.0896, 72.8656, 1500, 320, 90, ARRAY['Security', 'CCTV', 'Covered', '24/7 Access', 'EV Charging'], 'covered', ARRAY[]::text[]),
  ('Nariman Point Parking', 'Nariman Point, Mumbai 400021', 18.9263, 72.8230, 350, 75, 65, ARRAY['Security', 'CCTV', 'Valet'], 'covered', ARRAY[]::text[]),
  
  -- Bangalore locations
  ('MG Road Parking', 'Mahatma Gandhi Road, Bangalore 560001', 12.9716, 77.5946, 400, 110, 45, ARRAY['Security', 'CCTV', 'Covered'], 'covered', ARRAY[]::text[]),
  ('Kempegowda Airport Parking', 'Bengaluru International Airport, Bangalore 560300', 13.1979, 77.7066, 1800, 400, 75, ARRAY['Security', 'CCTV', 'Covered', '24/7 Access', 'EV Charging'], 'covered', ARRAY[]::text[]),
  ('Electronic City Parking', 'Electronic City Phase 1, Bangalore 560100', 12.8456, 77.6603, 500, 280, 35, ARRAY['Security', 'CCTV', 'EV Charging'], 'open', ARRAY[]::text[]),
  ('Whitefield Tech Park Parking', 'ITPL Main Road, Whitefield, Bangalore 560066', 12.9698, 77.7500, 700, 320, 40, ARRAY['Security', 'CCTV', 'Covered', 'EV Charging'], 'covered', ARRAY[]::text[]),
  
  -- Chennai locations
  ('Anna Nagar Parking', 'Anna Nagar, Chennai 600040', 13.0878, 80.2085, 300, 145, 30, ARRAY['Security', 'CCTV'], 'open', ARRAY[]::text[]),
  ('Chennai Airport Parking', 'Chennai International Airport, Chennai 600027', 12.9941, 80.1709, 1200, 280, 65, ARRAY['Security', 'CCTV', 'Covered', '24/7 Access'], 'covered', ARRAY[]::text[]),
  ('T Nagar Parking', 'T Nagar, Chennai 600017', 13.0418, 80.2341, 250, 90, 35, ARRAY['Security', 'CCTV'], 'open', ARRAY[]::text[]),
  
  -- Hyderabad locations
  ('Hitech City Parking', 'HITEC City, Hyderabad 500081', 17.4435, 78.3772, 600, 210, 40, ARRAY['Security', 'CCTV', 'Covered', 'EV Charging'], 'covered', ARRAY[]::text[]),
  ('Hyderabad Airport Parking', 'Rajiv Gandhi International Airport, Hyderabad 500409', 17.2403, 78.4294, 1500, 350, 70, ARRAY['Security', 'CCTV', 'Covered', '24/7 Access', 'EV Charging'], 'covered', ARRAY[]::text[]),
  ('Gachibowli Parking', 'Gachibowli, Hyderabad 500032', 17.4399, 78.3489, 450, 200, 35, ARRAY['Security', 'CCTV'], 'open', ARRAY[]::text[]),
  
  -- Kolkata locations
  ('Park Street Parking', 'Park Street, Kolkata 700016', 22.5533, 88.3515, 280, 95, 40, ARRAY['Security', 'CCTV', 'Covered'], 'covered', ARRAY[]::text[]),
  ('Kolkata Airport Parking', 'Netaji Subhash Chandra Bose Airport, Kolkata 700052', 22.6520, 88.4463, 1000, 240, 60, ARRAY['Security', 'CCTV', 'Covered', '24/7 Access'], 'covered', ARRAY[]::text[]),
  ('Salt Lake Sector V Parking', 'Sector V, Salt Lake, Kolkata 700091', 22.5726, 88.4331, 500, 220, 35, ARRAY['Security', 'CCTV', 'EV Charging'], 'open', ARRAY[]::text[]),
  
  -- Pune locations
  ('Koregaon Park Parking', 'Koregaon Park, Pune 411001', 18.5362, 73.8958, 200, 85, 35, ARRAY['Security', 'CCTV'], 'open', ARRAY[]::text[]),
  ('Pune Airport Parking', 'Pune Airport, Lohegaon, Pune 411032', 18.5821, 73.9197, 800, 190, 55, ARRAY['Security', 'CCTV', 'Covered', '24/7 Access'], 'covered', ARRAY[]::text[]),
  ('Hinjewadi IT Park Parking', 'Hinjewadi Phase 1, Pune 411057', 18.5912, 73.7389, 650, 300, 40, ARRAY['Security', 'CCTV', 'Covered', 'EV Charging'], 'covered', ARRAY[]::text[]),
  
  -- Ahmedabad locations
  ('SG Highway Parking', 'SG Highway, Ahmedabad 380015', 23.0258, 72.5050, 400, 150, 35, ARRAY['Security', 'CCTV', 'Covered'], 'covered', ARRAY[]::text[]),
  ('Ahmedabad Airport Parking', 'Sardar Vallabhbhai Patel Airport, Ahmedabad 382475', 23.0772, 72.6347, 900, 220, 50, ARRAY['Security', 'CCTV', 'Covered', '24/7 Access'], 'covered', ARRAY[]::text[]),
  
  -- Jaipur locations
  ('Hawa Mahal Parking', 'Hawa Mahal Road, Jaipur 302002', 26.9239, 75.8267, 150, 65, 25, ARRAY['Security', 'CCTV'], 'open', ARRAY[]::text[]),
  ('Jaipur Airport Parking', 'Jaipur International Airport, Jaipur 303905', 26.8242, 75.8122, 700, 170, 45, ARRAY['Security', 'CCTV', 'Covered', '24/7 Access'], 'covered', ARRAY[]::text[]),
  
  -- Lucknow locations
  ('Hazratganj Parking', 'Hazratganj, Lucknow 226001', 26.8467, 80.9462, 250, 110, 30, ARRAY['Security', 'CCTV'], 'open', ARRAY[]::text[]),
  ('Lucknow Airport Parking', 'Chaudhary Charan Singh Airport, Lucknow 226008', 26.7606, 80.8893, 600, 145, 40, ARRAY['Security', 'CCTV', 'Covered', '24/7 Access'], 'covered', ARRAY[]::text[]),
  
  -- Chandigarh locations
  ('Sector 17 Parking', 'Sector 17, Chandigarh 160017', 30.7410, 76.7791, 400, 180, 35, ARRAY['Security', 'CCTV', 'Covered'], 'covered', ARRAY[]::text[]),
  ('Chandigarh Airport Parking', 'Chandigarh International Airport, Mohali 160104', 30.6735, 76.7885, 500, 120, 45, ARRAY['Security', 'CCTV', 'Covered', '24/7 Access'], 'covered', ARRAY[]::text[]),
  
  -- Kochi locations
  ('Marine Drive Kochi Parking', 'Marine Drive, Kochi 682031', 9.9674, 76.2816, 200, 90, 30, ARRAY['Security', 'CCTV'], 'open', ARRAY[]::text[]),
  ('Kochi Airport Parking', 'Cochin International Airport, Kochi 683111', 10.1520, 76.3919, 800, 195, 50, ARRAY['Security', 'CCTV', 'Covered', '24/7 Access'], 'covered', ARRAY[]::text[])

ON CONFLICT DO NOTHING;