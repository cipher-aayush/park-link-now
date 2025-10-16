import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { MapPin, Navigation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

interface GoogleMapComponentProps {
  locations: ParkingLocation[];
  onLocationSelect?: (location: ParkingLocation) => void;
  selectedLocation?: ParkingLocation | null;
  center?: { lat: number; lng: number };
  zoom?: number;
}

const GoogleMapComponent = ({ 
  locations, 
  onLocationSelect, 
  selectedLocation,
  center = { lat: 28.6139, lng: 77.2090 }, // Delhi default
  zoom = 12 
}: GoogleMapComponentProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { toast } = useToast();

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        // Check if Google Maps is already loaded
        if (window.google && window.google.maps) {
          setIsMapLoaded(true);
          return;
        }

        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        
        if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
          console.warn('Google Maps API key not configured');
          return;
        }
        
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => setIsMapLoaded(true);
        script.onerror = () => {
          console.log('Google Maps failed to load, showing placeholder');
          // Don't show error toast, just keep the loading state
        };
        document.head.appendChild(script);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    loadGoogleMaps();
  }, [toast]);

  // Initialize map when Google Maps is loaded
  useEffect(() => {
    if (!isMapLoaded || !mapContainer.current || map.current) return;

    map.current = new google.maps.Map(mapContainer.current, {
      zoom,
      center,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ]
    });
  }, [isMapLoaded, center, zoom]);

  // Add markers for parking locations
  useEffect(() => {
    if (!map.current || !locations.length) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const bounds = new google.maps.LatLngBounds();

    locations.forEach((location) => {
      const position = { lat: location.latitude, lng: location.longitude };
      
      const marker = new google.maps.Marker({
        position,
        map: map.current,
        title: location.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="#1e40af" stroke="white" stroke-width="3"/>
              <text x="16" y="20" font-family="Arial" font-size="10" font-weight="bold" fill="white" text-anchor="middle">P</text>
            </svg>
          `),
          scaledSize: new google.maps.Size(32, 32),
        }
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${location.name}</h3>
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">${location.address}</p>
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 8px;">
              <span>Available: <strong style="color: #10b981;">${location.available_slots}/${location.total_slots}</strong></span>
              <span>Price: <strong>₹${location.price_per_hour}/hr</strong></span>
            </div>
            <button onclick="window.selectParkingLocation('${location.id}')" 
                    style="width: 100%; padding: 6px 12px; background: #1e40af; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Select Location
            </button>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map.current, marker);
      });

      markersRef.current.push(marker);
      bounds.extend(position);
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
      map.current?.fitBounds(bounds);
    }
  }, [map.current, locations, onLocationSelect]);

  // Add user location marker
  useEffect(() => {
    if (!map.current || !userLocation) return;

    const userMarker = new google.maps.Marker({
      position: userLocation,
      map: map.current,
      title: 'Your Location',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="8" fill="#ef4444" stroke="white" stroke-width="2"/>
          </svg>
        `),
        scaledSize: new google.maps.Size(20, 20),
      }
    });

    const userInfoWindow = new google.maps.InfoWindow({
      content: '<div style="padding: 4px;"><strong>Your Location</strong></div>'
    });

    userMarker.addListener('click', () => {
      userInfoWindow.open(map.current, userMarker);
    });
  }, [map.current, userLocation]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userPos = { lat: latitude, lng: longitude };
          setUserLocation(userPos);
          
          if (map.current) {
            map.current.setCenter(userPos);
            map.current.setZoom(15);
          }
          
          toast({
            title: "Location found",
            description: "Showing your current location on the map"
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            variant: "destructive",
            title: "Location access denied",
            description: "Please enable location services to find your position"
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

  if (!isMapLoaded) {
    return (
      <div className="relative w-full h-[500px] rounded-lg bg-muted flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Map view requires Google Maps API configuration</p>
          <p className="text-sm text-muted-foreground">Configure your Google Maps API key to enable map features</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] rounded-lg overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />
      
      <div className="absolute top-4 left-4 z-10">
        <Button 
          onClick={getCurrentLocation}
          size="sm"
          className="bg-white text-gray-700 hover:bg-gray-50 shadow-lg border"
        >
          <Navigation className="h-4 w-4 mr-2" />
          Find My Location
        </Button>
      </div>

      {selectedLocation && (
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4 z-10">
          <div className="flex items-start space-x-3">
            <MapPin className="h-5 w-5 text-primary mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{selectedLocation.name}</h3>
              <p className="text-xs text-muted-foreground mb-2">{selectedLocation.address}</p>
              <div className="flex justify-between items-center">
                <div className="text-xs">
                  <span className="text-green-600 font-medium">
                    {selectedLocation.available_slots} available
                  </span>
                  <span className="text-muted-foreground"> of {selectedLocation.total_slots}</span>
                </div>
                <div className="text-sm font-semibold text-primary">
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

export default GoogleMapComponent;