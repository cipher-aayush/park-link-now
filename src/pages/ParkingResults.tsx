import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Car, Shield, Zap, Camera, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import GoogleMapComponent from "@/components/GoogleMapComponent";
import BookingModal from "@/components/BookingModal";
import Header from "@/components/Header";

interface ParkingLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  total_slots: number;
  available_slots: number;
  price_per_hour: number;
  amenities: string[];
  distance?: number;
}

const ParkingResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [locations, setLocations] = useState<ParkingLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<ParkingLocation | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const address = searchParams.get('address') || '';
  const date = searchParams.get('date') || '';
  const time = searchParams.get('time') || '';
  const duration = searchParams.get('duration') || '';
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lng = parseFloat(searchParams.get('lng') || '0');

  useEffect(() => {
    fetchParkingLocations();
  }, [lat, lng]);

  // Calculate distance between two coordinates in km
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const fetchParkingLocations = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('parking_locations')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching parking locations:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load parking locations"
        });
      } else {
        // Calculate distance for all locations if coordinates are provided
        let filteredData: ParkingLocation[] = data || [];
        
        if (lat && lng) {
          const locationsWithDistance = filteredData.map(location => ({
            ...location,
            distance: calculateDistance(lat, lng, location.latitude, location.longitude)
          }));
          
          // Sort by distance
          locationsWithDistance.sort((a, b) => a.distance! - b.distance!);
          
          // Filter within 100km for display
          const nearbyLocations = locationsWithDistance.filter(location => location.distance! <= 100);
          
          if (nearbyLocations.length === 0) {
            // Show closest 5 locations if none within 100km
            filteredData = locationsWithDistance.slice(0, 5);
            toast({
              title: "Showing nearest parking",
              description: "No parking found within 100km. Showing closest available locations.",
            });
          } else {
            filteredData = nearbyLocations;
            toast({
              title: "Parking locations found",
              description: `Found ${nearbyLocations.length} parking location(s) near your search area`,
            });
          }
        } else {
          // Show all locations if no search coordinates
          toast({
            title: "All parking locations",
            description: `Showing ${filteredData.length} parking locations across India`,
          });
        }
        
        setLocations(filteredData);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = (location: ParkingLocation) => {
    console.log('Book Now clicked', { user, location });
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Please sign in",
        description: "You need to sign in to book a parking slot"
      });
      // Redirect to sign in page
      window.location.href = '/sign-in';
      return;
    }

    console.log('Opening booking modal for location:', location.name);
    setSelectedLocation(location);
    setShowBookingModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <p>Loading parking locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            onClick={() => navigate(-1)}
            variant="ghost" 
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Button>
          
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Parking Results
            </h1>
            <div className="text-muted-foreground">
              <p><MapPin className="inline h-4 w-4 mr-1" />{address}</p>
              {date && <p>Date: {date}</p>}
              {time && <p>Time: {time}</p>}
              {duration && <p>Duration: {duration} hour(s)</p>}
            </div>
          </div>
          
          <div className="mb-6">
            <Button
              onClick={() => setShowMap(!showMap)}
              variant="outline"
              className="mb-4"
            >
              <MapPin className="h-4 w-4 mr-2" />
              {showMap ? "Hide Map" : "Show Map"}
            </Button>
          </div>
        </div>

        {showMap && (
          <div className="mb-8">
            <GoogleMapComponent 
              locations={locations}
              selectedLocation={selectedLocation}
              onLocationSelect={(location) => {
                setSelectedLocation(location);
                setShowBookingModal(true);
              }}
              center={lat && lng ? { lat, lng } : undefined}
              zoom={lat && lng ? 12 : 5}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location) => (
            <Card 
              key={location.id} 
              className="hover:shadow-lg transition-all border-border/50"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-foreground mb-1">
                      {location.name}
                    </CardTitle>
                    <div className="flex items-center text-muted-foreground text-sm mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      {location.address}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {location.distance && (
                  <div className="bg-muted/50 rounded-lg p-2 mb-2">
                    <p className="text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3 inline mr-1" />
                      {location.distance < 1 
                        ? `${(location.distance * 1000).toFixed(0)}m away`
                        : `${location.distance.toFixed(1)}km away`}
                    </p>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-parking-primary">₹{location.price_per_hour}</p>
                    <p className="text-sm text-muted-foreground">per hour</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">{location.available_slots} available</p>
                    <p className="text-sm text-muted-foreground">of {location.total_slots} spaces</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {(location.amenities || []).map((amenity, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {amenity === "Security" && <Shield className="h-3 w-3 mr-1" />}
                      {amenity === "CCTV" && <Camera className="h-3 w-3 mr-1" />}
                      {amenity === "Covered" && <Car className="h-3 w-3 mr-1" />}
                      {amenity === "EV Charging" && <Zap className="h-3 w-3 mr-1" />}
                      {amenity}
                    </Badge>
                  ))}
                </div>

                <Button 
                  onClick={() => handleBookNow(location)}
                  className="w-full bg-parking-primary hover:bg-parking-primary-light text-primary-foreground"
                  size="lg"
                >
                  {user ? 'Book Now' : 'Sign In to Book'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedLocation && (
          <BookingModal
            isOpen={showBookingModal}
            onClose={() => {
              setShowBookingModal(false);
              setSelectedLocation(null);
            }}
            location={selectedLocation}
            prefilledDate={date}
            prefilledTime={time}
            prefilledDuration={duration}
          />
        )}
      </main>
    </div>
  );
};

export default ParkingResults;