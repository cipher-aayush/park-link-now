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
  features: string[];
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

  useEffect(() => {
    fetchParkingLocations();
  }, []);

  const fetchParkingLocations = async () => {
    try {
      const { data, error } = await supabase
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
        setLocations(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = (location: ParkingLocation) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Please sign in",
        description: "You need to sign in to book a parking slot"
      });
      return;
    }

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
                  {location.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature === "Security" && <Shield className="h-3 w-3 mr-1" />}
                      {feature === "CCTV" && <Camera className="h-3 w-3 mr-1" />}
                      {feature === "Covered" && <Car className="h-3 w-3 mr-1" />}
                      {feature === "EV Charging" && <Zap className="h-3 w-3 mr-1" />}
                      {feature}
                    </Badge>
                  ))}
                </div>

                <Button 
                  onClick={() => handleBookNow(location)}
                  className="w-full bg-parking-primary hover:bg-parking-primary-light text-primary-foreground"
                >
                  Book Now
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