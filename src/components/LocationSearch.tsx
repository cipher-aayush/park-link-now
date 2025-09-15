import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LocationAutoComplete from "./LocationAutoComplete";

interface LocationSearchProps {
  onLocationFound?: (lat: number, lng: number, address: string) => void;
}

const LocationSearch = ({ onLocationFound }: LocationSearchProps) => {
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [duration, setDuration] = useState("1");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getCurrentLocation = () => {
    setLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Reverse geocoding to get address
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=pk.eyJ1IjoibG92YWJsZWFpIiwiYSI6ImNscTBtYzUwbjFuOG8yanM4cjR1MW9rOTIifQ.5zJxR7O3UyPVkl8dRnmjxA`
            );
            const data = await response.json();
            
            if (data.features && data.features.length > 0) {
              const address = data.features[0].place_name;
              setSearchLocation(address);
              
              if (onLocationFound) {
                onLocationFound(latitude, longitude, address);
              }
              
              toast({
                title: "Location found",
                description: "Your current location has been set"
              });
            }
          } catch (error) {
            console.error('Error getting address:', error);
            setSearchLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
            
            if (onLocationFound) {
              onLocationFound(latitude, longitude, `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
            }
            
            toast({
              title: "Location found",
              description: "Current location coordinates have been set"
            });
          }
          
          setLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLoading(false);
          toast({
            variant: "destructive",
            title: "Location access denied",
            description: "Please enable location services or enter an address manually"
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Location not supported",
        description: "Your browser doesn't support geolocation"
      });
    }
  };

  const handleSearch = async () => {
    if (!searchLocation.trim()) {
      toast({
        variant: "destructive",
        title: "Please enter a location",
        description: "Enter an address or use current location"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Geocoding to get coordinates from address
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchLocation)}.json?access_token=pk.eyJ1IjoibG92YWJsZWFpIiwiYSI6ImNscTBtYzUwbjFuOG8yanM4cjR1MW9rOTIifQ.5zJxR7O3UyPVkl8dRnmjxA&country=IN&limit=1`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        const address = data.features[0].place_name;
        
        if (onLocationFound) {
          onLocationFound(lat, lng, address);
        }
        
        toast({
          title: "Location found",
          description: `Found: ${address}`
        });
      } else {
        toast({
          variant: "destructive",
          title: "Location not found",
          description: "Please try a different address"
        });
      }
    } catch (error) {
      console.error('Error searching location:', error);
      toast({
        variant: "destructive",
        title: "Search failed",
        description: "Unable to search for the location"
      });
    } finally {
      setLoading(false);
    }
  };

  // Set default date to today
  const today = new Date().toISOString().split('T')[0];
  const defaultTime = new Date().toTimeString().slice(0, 5);

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Location Search */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Location
            </Label>
            <LocationAutoComplete
              onLocationSelect={(location) => {
                setSearchLocation(location.address);
                if (onLocationFound) {
                  onLocationFound(location.lat, location.lng, location.address);
                }
              }}
              placeholder="Enter location or address"
              value={searchLocation}
              onChange={setSearchLocation}
            />
          </div>

          {/* Date Picker */}
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium">
              <Calendar className="h-4 w-4 inline mr-1" />
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={selectedDate || today}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={today}
            />
          </div>

          {/* Time Picker */}
          <div className="space-y-2">
            <Label htmlFor="time" className="text-sm font-medium">
              <Clock className="h-4 w-4 inline mr-1" />
              Time
            </Label>
            <Input
              id="time"
              type="time"
              value={selectedTime || defaultTime}
              onChange={(e) => setSelectedTime(e.target.value)}
            />
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration" className="text-sm font-medium">
              Duration (hrs)
            </Label>
            <select
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="1">1 hour</option>
              <option value="2">2 hours</option>
              <option value="3">3 hours</option>
              <option value="4">4 hours</option>
              <option value="6">6 hours</option>
              <option value="8">8 hours</option>
              <option value="12">12 hours</option>
              <option value="24">24 hours</option>
            </select>
          </div>
        </div>

        {/* Search Button */}
        <div className="mt-6">
          <Button 
            onClick={() => {
              if (searchLocation && onLocationFound) {
                // Simple search trigger - the actual location handling is done by LocationAutoComplete
                toast({
                  title: "Searching...",
                  description: "Finding parking spots near your location"
                });
              }
            }}
            disabled={loading || !searchLocation}
            className="w-full bg-parking-primary hover:bg-parking-primary-light text-primary-foreground"
            size="lg"
          >
            {loading ? "Searching..." : "Find Parking Spots"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationSearch;