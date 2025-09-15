import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Shield, Zap } from 'lucide-react';

const PricingSection = () => {
  const pricingFeatures = [
    {
      icon: <Clock className="h-5 w-5 text-parking-accent" />,
      title: "Hourly Rates",
      description: "Pay only for the time you use, starting from ₹20/hour"
    },
    {
      icon: <MapPin className="h-5 w-5 text-parking-accent" />,
      title: "Prime Locations",
      description: "Premium spots in malls, offices, and city centers"
    },
    {
      icon: <Shield className="h-5 w-5 text-parking-accent" />,
      title: "Secure Booking",
      description: "Guaranteed parking with 100% refund on cancellation"
    },
    {
      icon: <Zap className="h-5 w-5 text-parking-accent" />,
      title: "Instant Confirmation",
      description: "Book and confirm your spot in under 30 seconds"
    }
  ];

  const samplePricing = [
    { location: "Shopping Malls", price: "₹30-50/hr", features: ["CCTV Security", "EV Charging", "Covered Parking"] },
    { location: "Office Complexes", price: "₹25-40/hr", features: ["24/7 Access", "Valet Service", "Monthly Passes"] },
    { location: "City Centers", price: "₹40-80/hr", features: ["Prime Location", "Easy Access", "Multiple Exits"] },
    { location: "Airports", price: "₹60-120/hr", features: ["Long-term Rates", "Shuttle Service", "High Security"] }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-secondary/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Transparent Pricing</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Affordable rates for every parking need, with no hidden charges
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {pricingFeatures.map((feature, index) => (
            <Card key={index} className="text-center group hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="mx-auto mb-3 p-3 bg-parking-accent/10 rounded-full w-fit group-hover:bg-parking-accent/20 transition-colors">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sample Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {samplePricing.map((item, index) => (
            <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <CardHeader className="text-center">
                <CardTitle className="text-lg text-parking-primary">{item.location}</CardTitle>
                <div className="text-2xl font-bold text-parking-accent">{item.price}</div>
              </CardHeader>
              <CardContent className="space-y-3">
                {item.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-parking-accent rounded-full"></div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </CardContent>
              {index === 0 && (
                <Badge className="absolute top-4 right-4 bg-parking-accent">
                  Popular
                </Badge>
              )}
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            * Prices may vary based on location, time, and demand. Early bird and long-term discounts available.
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;