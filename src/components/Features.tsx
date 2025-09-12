import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Smartphone, 
  CreditCard, 
  MapPin, 
  Clock, 
  Shield, 
  Zap,
  Users,
  BarChart3
} from "lucide-react";

const features = [
  {
    icon: Smartphone,
    title: "Easy Mobile Booking",
    description: "Book parking spots instantly with our user-friendly mobile interface. Quick search and one-tap booking."
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description: "Multiple payment options including UPI, cards, and wallets. SSL encrypted for your security."
  },
  {
    icon: MapPin,
    title: "Real-time Availability",
    description: "See live parking availability with interactive maps. Find the perfect spot near your destination."
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description: "Round-the-clock customer support and 24/7 access to your booked parking spots."
  },
  {
    icon: Shield,
    title: "Guaranteed Booking",
    description: "Your parking spot is guaranteed once booked. No more circling around looking for parking."
  },
  {
    icon: Zap,
    title: "Instant Confirmation",
    description: "Get immediate booking confirmation with unique booking ID and QR code for easy access."
  },
  {
    icon: Users,
    title: "Guest Parking",
    description: "Book parking even without an account. Perfect for visitors and one-time users."
  },
  {
    icon: BarChart3,
    title: "Admin Dashboard",
    description: "Comprehensive admin panel for managing slots, monitoring revenue, and viewing detailed reports."
  }
];

const Features = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Choose ParkEasy?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Modern parking solutions designed for convenience, security, and efficiency
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="group hover:shadow-card-parking transition-all duration-300 hover:-translate-y-1 bg-gradient-card border-border/50"
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto bg-parking-primary/10 p-4 rounded-2xl w-fit group-hover:bg-parking-primary/20 transition-colors">
                    <Icon className="h-8 w-8 text-parking-primary" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-foreground group-hover:text-parking-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;