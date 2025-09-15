import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, MapPin, CreditCard, Car } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: <Search className="h-8 w-8 text-parking-accent" />,
      title: "Search Location",
      description: "Enter your destination or use current location to find nearby parking spots"
    },
    {
      icon: <MapPin className="h-8 w-8 text-parking-accent" />,
      title: "Select Parking",
      description: "Browse available parking spots on the map and choose the best option for you"
    },
    {
      icon: <CreditCard className="h-8 w-8 text-parking-accent" />,
      title: "Book & Pay",
      description: "Reserve your spot and pay securely using UPI, card, or QR code"
    },
    {
      icon: <Car className="h-8 w-8 text-parking-accent" />,
      title: "Park Easily",
      description: "Arrive at your reserved spot and park hassle-free with QR code verification"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-background to-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Book your parking spot in just a few simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <Card key={index} className="relative group hover:shadow-lg transition-all duration-300">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-3 bg-parking-accent/10 rounded-full w-fit">
                  {step.icon}
                </div>
                <CardTitle className="text-lg">{step.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </CardContent>
              <div className="absolute -top-2 -right-2 bg-parking-accent text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;