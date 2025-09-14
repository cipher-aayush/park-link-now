import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from "@/components/ui/button";
import { MapPin, Navigation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ParkingLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  available_slots: number;
  total_slots: number;
  price_per_hour: number;
  features: string[];
}

interface LocationMapProps {
  locations: ParkingLocation[];
  onLocationSelect?: (location: ParkingLocation) => void;
  selectedLocation?: ParkingLocation | null;
}

const LocationMap = ({ locations, onLocationSelect, selectedLocation }: LocationMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const { toast } = useToast();

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([longitude, latitude]);
          
          if (map.current) {
            map.current.flyTo({
              center: [longitude, latitude],
              zoom: 14,
              duration: 2000
            });
          }
          
          toast({
            title: "Location found",
            description: "Showing parking near your current location"
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            variant: "destructive",
            title: "Location access denied",
            description: "Please enable location services to find nearby parking"
          });
        }
      );
    } else {
      toast({
        variant: "destructive",
        title: "Location not supported",
        description: "Your browser doesn't support geolocation"
      });
    }
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    // Use the Mapbox token from Supabase secrets
    mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZWFpIiwiYSI6ImNscTBtYzUwbjFuOG8yanM4cjR1MW9rOTIifQ.5zJxR7O3UyPVkl8dRnmjxA';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [77.2090, 28.6139], // Delhi coordinates as default
      zoom: 10,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    return () => {
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current || !locations.length) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add markers for each parking location
    locations.forEach((location) => {
      const el = document.createElement('div');
      el.className = 'parking-marker';
      el.style.cssText = `
        width: 40px;
        height: 40px;
        background-color: #3b82f6;
        border: 3px solid white;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        transition: all 0.2s ease;
      `;
      el.innerHTML = `P`;
      
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.1)';
        el.style.backgroundColor = '#1d4ed8';
      });
      
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
        el.style.backgroundColor = '#3b82f6';
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([location.longitude, location.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="p-3 min-w-[200px]">
                <h3 class="font-semibold text-sm mb-1">${location.name}</h3>
                <p class="text-xs text-gray-600 mb-2">${location.address}</p>
                <div class="space-y-1 text-xs">
                  <div class="flex justify-between">
                    <span>Available:</span>
                    <span class="font-medium text-green-600">${location.available_slots}/${location.total_slots}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Price:</span>
                    <span class="font-medium">₹${location.price_per_hour}/hr</span>
                  </div>
                </div>
                <button onclick="window.selectParkingLocation('${location.id}')" 
                        class="w-full mt-2 bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700">
                  Select Location
                </button>
              </div>
            `)
        )
        .addTo(map.current!);

      markersRef.current.push(marker);
    });

    // Set up global function for location selection
    (window as any).selectParkingLocation = (locationId: string) => {
      const location = locations.find(loc => loc.id === locationId);
      if (location && onLocationSelect) {
        onLocationSelect(location);
      }
    };

    // Fit map to show all locations
    if (locations.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      locations.forEach(location => {
        bounds.extend([location.longitude, location.latitude]);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [locations, onLocationSelect]);

  // Add user location marker when available
  useEffect(() => {
    if (!map.current || !userLocation) return;

    const userMarker = document.createElement('div');
    userMarker.style.cssText = `
      width: 20px;
      height: 20px;
      background-color: #ef4444;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    `;

    new mapboxgl.Marker(userMarker)
      .setLngLat(userLocation)
      .setPopup(
        new mapboxgl.Popup({ offset: 25 })
          .setHTML('<div class="p-2"><strong>Your Location</strong></div>')
      )
      .addTo(map.current);
  }, [userLocation]);

  return (
    <div className="relative w-full h-[500px] rounded-lg overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />
      
      <div className="absolute top-4 left-4 z-10">
        <Button 
          onClick={getCurrentLocation}
          size="sm"
          className="bg-white text-gray-700 hover:bg-gray-50 shadow-lg"
        >
          <Navigation className="h-4 w-4 mr-2" />
          Find My Location
        </Button>
      </div>

      {selectedLocation && (
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4 z-10">
          <div className="flex items-start space-x-3">
            <MapPin className="h-5 w-5 text-blue-600 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{selectedLocation.name}</h3>
              <p className="text-xs text-gray-600 mb-2">{selectedLocation.address}</p>
              <div className="flex justify-between items-center">
                <div className="text-xs">
                  <span className="text-green-600 font-medium">
                    {selectedLocation.available_slots} available
                  </span>
                  <span className="text-gray-500"> of {selectedLocation.total_slots}</span>
                </div>
                <div className="text-sm font-semibold text-blue-600">
                  ₹{selectedLocation.price_per_hour}/hr
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationMap;