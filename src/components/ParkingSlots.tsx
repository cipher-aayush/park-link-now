import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Car, Shield, Zap, Camera } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

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


const ParkingSlots = () => {
  const [locations, setLocations] = useState<ParkingLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<ParkingLocation | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

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
    toast({
      title: "Booking initiated",
      description: `Starting booking process for ${location.name}`
    });
  };

  if (loading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <p>Loading parking locations...</p>
        </div>
      </section>
    );
  }
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Available Parking Spots
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Find and book parking spaces near you with real-time availability and instant confirmation
          </p>
          
          <div className="flex justify-center mt-6 space-x-4">
            <Button 
              onClick={() => setShowMap(!showMap)}
              variant={showMap ? "default" : "outline"}
              className="bg-parking-primary hover:bg-parking-primary-light"
            >
              <MapPin className="h-4 w-4 mr-2" />
              {showMap ? "Hide Map" : "Show Map"}
            </Button>
          </div>
        </div>

        {showMap && (
          <div className="mb-12 p-4 text-center bg-muted rounded-lg">
            <p className="text-muted-foreground">Map feature will be available with Google Maps integration.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {locations.map((location) => (
            <Card 
              key={location.id} 
              className={`hover:shadow-lg transition-all border-border/50 cursor-pointer ${
                selectedLocation?.id === location.id ? 'ring-2 ring-parking-primary' : ''
              }`}
              onClick={() => setSelectedLocation(location)}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBookNow(location);
                  }}
                  className="w-full bg-parking-primary hover:bg-parking-primary-light text-primary-foreground"
                >
                  Book Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => setShowMap(true)}
            className="border-parking-primary text-parking-primary hover:bg-parking-primary hover:text-primary-foreground"
          >
            <MapPin className="h-4 w-4 mr-2" />
            View All on Map
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ParkingSlots;