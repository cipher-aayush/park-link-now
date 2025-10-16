import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Button } from "@/components/ui/button";
import { MapPin, Navigation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google: typeof google;
    selectParkingLocation: (locationId: string) => void;
  }
}

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

interface GoogleMapProps {
  locations: ParkingLocation[];
  onLocationSelect?: (location: ParkingLocation) => void;
  selectedLocation?: ParkingLocation | null;
  center?: { lat: number; lng: number };
}

const GoogleMap = ({ locations, onLocationSelect, selectedLocation, center }: GoogleMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { toast } = useToast();

  // Initialize Google Maps
  useEffect(() => {
    const initializeMap = async () => {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      
      if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
        console.warn('Google Maps API key not configured');
        return;
      }
      
      const loader = new Loader({
        apiKey,
        version: 'weekly',
        libraries: ['places', 'geometry']
      });

      try {
        await loader.load();
        setIsLoaded(true);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        toast({
          variant: "destructive",
          title: "Maps Error",
          description: "Failed to load Google Maps. Please check your API key."
        });
      }
    };

    initializeMap();
  }, [toast]);

  // Create map instance
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    const mapCenter = center || { lat: 28.6139, lng: 77.2090 }; // Delhi coordinates

    mapInstanceRef.current = new google.maps.Map(mapRef.current, {
      center: mapCenter,
      zoom: 12,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ]
    });
  }, [isLoaded, center]);

  // Add parking location markers
  useEffect(() => {
    if (!mapInstanceRef.current || !locations.length) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    locations.forEach((location) => {
      const marker = new google.maps.Marker({
        position: { lat: location.latitude, lng: location.longitude },
        map: mapInstanceRef.current,
        title: location.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="#3b82f6" stroke="white" stroke-width="3"/>
              <text x="20" y="25" text-anchor="middle" fill="white" font-size="12" font-weight="bold">P</text>
            </svg>
          `),
          scaledSize: new google.maps.Size(40, 40),
        },
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold;">${location.name}</h3>
            <p style="margin: 0 0 8px 0; color: #666; font-size: 12px;">${location.address}</p>
            <div style="display: flex; justify-between; margin-bottom: 8px; font-size: 12px;">
              <span>Available: <strong style="color: #16a34a;">${location.available_slots}/${location.total_slots}</strong></span>
              <span>Price: <strong>₹${location.price_per_hour}/hr</strong></span>
            </div>
            <button 
              onclick="window.selectParkingLocation('${location.id}')"
              style="width: 100%; background: #3b82f6; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer; font-size: 12px;"
            >
              Select Location
            </button>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker);
      });

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
      const bounds = new google.maps.LatLngBounds();
      locations.forEach(location => {
        bounds.extend({ lat: location.latitude, lng: location.longitude });
      });
      mapInstanceRef.current?.fitBounds(bounds);
    }
  }, [locations, onLocationSelect, mapInstanceRef.current]);

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userPos = { lat: latitude, lng: longitude };
          setUserLocation(userPos);
          
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter(userPos);
            mapInstanceRef.current.setZoom(15);

            // Add user location marker
            new google.maps.Marker({
              position: userPos,
              map: mapInstanceRef.current,
              title: 'Your Location',
              icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10" cy="10" r="8" fill="#ef4444" stroke="white" stroke-width="3"/>
                  </svg>
                `),
                scaledSize: new google.maps.Size(20, 20),
              },
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
    }
  };

  if (!isLoaded) {
    return (
      <div className="w-full h-[500px] rounded-lg bg-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">Loading Google Maps...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] rounded-lg overflow-hidden">
      <div ref={mapRef} className="absolute inset-0" />
      
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

export default GoogleMap;