import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Clock, Shield, ArrowRight } from "lucide-react";
import heroImage from "@/assets/parking-hero.jpg";
import LocationSearch from "./LocationSearch";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Hero = () => {
  const [searchLocation, setSearchLocation] = useState<{lat: number, lng: number, address: string} | null>(null);
  const { toast } = useToast();

  const handleLocationFound = (lat: number, lng: number, address: string) => {
    setSearchLocation({ lat, lng, address });
    toast({
      title: "Location set",
      description: `Searching for parking near: ${address}`
    });
  };
  return (
    <section className="relative min-h-[80vh] flex items-center">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Modern parking garage" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-parking-primary/90 to-parking-primary-light/80" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
            Find & Book
            <span className="block text-parking-accent">Parking Spots</span>
            Instantly
          </h1>
          
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl">
            Skip the hassle of searching for parking. Book your spot in advance and save time with our smart parking solution.
          </p>

          {/* Enhanced Search Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-2xl">
            <LocationSearch onLocationFound={handleLocationFound} />
            
            {searchLocation && (
              <div className="mt-4 p-4 bg-white/10 rounded-lg">
                <p className="text-primary-foreground text-sm">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Selected: {searchLocation.address}
                </p>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="flex items-center space-x-3 text-primary-foreground">
              <div className="bg-parking-accent/20 p-3 rounded-lg">
                <Shield className="h-6 w-6 text-parking-accent" />
              </div>
              <div>
                <h3 className="font-semibold">Secure Booking</h3>
                <p className="text-sm text-primary-foreground/80">Safe & guaranteed parking</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 text-primary-foreground">
              <div className="bg-parking-accent/20 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-parking-accent" />
              </div>
              <div>
                <h3 className="font-semibold">24/7 Access</h3>
                <p className="text-sm text-primary-foreground/80">Park anytime, anywhere</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 text-primary-foreground">
              <div className="bg-parking-accent/20 p-3 rounded-lg">
                <MapPin className="h-6 w-6 text-parking-accent" />
              </div>
              <div>
                <h3 className="font-semibold">Prime Locations</h3>
                <p className="text-sm text-primary-foreground/80">Best spots in the city</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;