import React, { useEffect, useRef, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google: typeof google;
  }
}

interface LocationAutoCompleteProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

const LocationAutoComplete = ({ 
  onLocationSelect, 
  placeholder = "Enter location or address",
  value = "",
  onChange 
}: LocationAutoCompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState(value);
  const { toast } = useToast();

  useEffect(() => {
    if (!inputRef.current || typeof window === 'undefined' || !window.google) return;

    // Initialize autocomplete
    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      types: ['establishment', 'geocode'],
      componentRestrictions: { country: 'IN' }
    });

    // Add place changed listener
    const listener = autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();
      
      if (place?.geometry?.location) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          address: place.formatted_address || place.name || ''
        };
        
        setInputValue(location.address);
        onLocationSelect(location);
        
        if (onChange) {
          onChange(location.address);
        }
      }
    });

    return () => {
      if (listener) {
        google.maps.event.removeListener(listener);
      }
    };
  }, [onLocationSelect, onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Reverse geocoding
          const geocoder = new google.maps.Geocoder();
          try {
            const response = await new Promise<google.maps.GeocoderResponse>((resolve, reject) => {
              geocoder.geocode(
                { location: { lat: latitude, lng: longitude } },
                (results, status) => {
                  if (status === 'OK' && results) {
                    resolve({ results } as google.maps.GeocoderResponse);
                  } else {
                    reject(new Error('Geocoding failed'));
                  }
                }
              );
            });

            if (response.results && response.results.length > 0) {
              const address = response.results[0].formatted_address;
              setInputValue(address);
              onLocationSelect({ lat: latitude, lng: longitude, address });
              
              if (onChange) {
                onChange(address);
              }
              
              toast({
                title: "Location found",
                description: "Your current location has been set"
              });
            }
          } catch (error) {
            console.error('Geocoding error:', error);
            const coords = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            setInputValue(coords);
            onLocationSelect({ lat: latitude, lng: longitude, address: coords });
            
            if (onChange) {
              onChange(coords);
            }
            
            toast({
              title: "Location found",
              description: "Current location coordinates have been set"
            });
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast({
            variant: "destructive",
            title: "Location access denied",
            description: "Please enable location services or enter an address manually"
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

  return (
    <div className="flex space-x-2">
      <Input
        ref={inputRef}
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        className="flex-1"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={getCurrentLocation}
        className="shrink-0"
      >
        <Navigation className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default LocationAutoComplete;