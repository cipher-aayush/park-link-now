import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Star, Car } from "lucide-react";

const mockSlots = [
  {
    id: 1,
    name: "Downtown Plaza Parking",
    address: "123 Main St, Downtown",
    price: "$5/hour",
    rating: 4.8,
    distance: "0.2 miles",
    available: 15,
    total: 50,
    features: ["Covered", "Security", "24/7"]
  },
  {
    id: 2,
    name: "City Center Garage",
    address: "456 Business Ave",
    price: "$4/hour", 
    rating: 4.6,
    distance: "0.4 miles",
    available: 8,
    total: 30,
    features: ["EV Charging", "Security"]
  },
  {
    id: 3,
    name: "Metro Station Parking",
    address: "789 Transit Blvd",
    price: "$3/hour",
    rating: 4.7,
    distance: "0.6 miles", 
    available: 25,
    total: 75,
    features: ["Near Metro", "Outdoor"]
  }
];

const ParkingSlots = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Available Parking Near You
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose from premium parking locations with real-time availability
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockSlots.map((slot) => (
            <Card key={slot.id} className="group hover:shadow-parking transition-all duration-300 hover:-translate-y-1 bg-gradient-card border-border/50">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-foreground group-hover:text-parking-primary transition-colors">
                      {slot.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {slot.address}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-parking-primary">{slot.price}</div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                      {slot.rating}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Availability */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Car className="h-4 w-4 text-parking-success" />
                    <span className="text-sm font-medium text-foreground">
                      {slot.available} spots available
                    </span>
                  </div>
                  <Badge 
                    variant={slot.available > 10 ? "default" : slot.available > 5 ? "secondary" : "destructive"}
                    className={slot.available > 10 ? "bg-parking-success" : ""}
                  >
                    {slot.available > 10 ? "Many" : slot.available > 5 ? "Few" : "Limited"}
                  </Badge>
                </div>

                {/* Distance */}
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  {slot.distance} away
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-2">
                  {slot.features.map((feature) => (
                    <Badge key={feature} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>

                {/* Book Button */}
                <Button 
                  className="w-full bg-parking-primary hover:bg-parking-primary-light text-primary-foreground font-semibold"
                  size="lg"
                >
                  Book Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="border-parking-primary text-parking-primary hover:bg-parking-primary hover:text-primary-foreground">
            View All Locations
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ParkingSlots;