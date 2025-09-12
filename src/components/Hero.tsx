import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Clock, Shield } from "lucide-react";
import heroImage from "@/assets/parking-hero.jpg";

const Hero = () => {
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

          {/* Search Form */}
          <div className="bg-background rounded-2xl p-6 shadow-parking max-w-3xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-foreground mb-2 block">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Location
                </label>
                <Input 
                  placeholder="Enter address or landmark"
                  className="h-12"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Date & Time
                </label>
                <Input 
                  type="datetime-local"
                  className="h-12"
                />
              </div>
              
              <div className="flex items-end">
                <Button 
                  size="lg" 
                  className="w-full h-12 bg-parking-accent hover:bg-parking-accent/90 text-accent-foreground font-semibold"
                >
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </Button>
              </div>
            </div>
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