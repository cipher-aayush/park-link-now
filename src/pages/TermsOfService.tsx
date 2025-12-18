import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, FileText, AlertCircle, Clock, CreditCard, Car, Scale, Mail } from "lucide-react";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-parking-primary/10 rounded-full mb-4">
              <FileText className="h-8 w-8 text-parking-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: December 2024</p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-parking-primary" />
                  1. Acceptance of Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-4">
                <p>
                  By accessing and using ParkEasy, you accept and agree to be bound by the terms and provisions of this agreement. 
                  If you do not agree to abide by these terms, please do not use this service.
                </p>
                <p>
                  We reserve the right to update these terms at any time without prior notice. Your continued use of the service 
                  after any changes constitutes acceptance of the new terms.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-parking-primary" />
                  2. Parking Services
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-4">
                <p>
                  ParkEasy provides a platform to book parking spaces at various locations. We act as an intermediary 
                  between you and parking facility owners.
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Bookings are subject to availability at the time of confirmation</li>
                  <li>You must provide accurate vehicle information when booking</li>
                  <li>Parking spots are assigned automatically based on availability</li>
                  <li>You must arrive within 30 minutes of your booked start time</li>
                  <li>Late arrivals may result in forfeiture of your booking</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-parking-accent" />
                  3. Overtime Charges
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-4">
                <p className="font-medium text-foreground">
                  Important: Exceeding your booked parking duration will result in additional charges.
                </p>
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <h4 className="font-semibold text-destructive mb-2">Overtime Charge Structure:</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• <strong>First 30 minutes overtime:</strong> 50% extra of hourly rate</li>
                    <li>• <strong>30 minutes - 1 hour overtime:</strong> 100% extra (full hourly rate)</li>
                    <li>• <strong>Beyond 1 hour overtime:</strong> 150% of hourly rate per additional hour</li>
                    <li>• <strong>Beyond 3 hours overtime:</strong> ₹500 flat penalty + 200% of hourly rate</li>
                  </ul>
                </div>
                <p>
                  Overtime charges are automatically calculated and will be charged to your registered payment method. 
                  Please ensure you vacate the parking spot before your booked end time to avoid these charges.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-parking-primary" />
                  4. Payments & Refunds
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-4">
                <p>
                  All payments are processed securely through our payment partners. We accept UPI, credit/debit cards, 
                  and other digital payment methods.
                </p>
                <h4 className="font-semibold text-foreground">Cancellation & Refund Policy:</h4>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>More than 24 hours before:</strong> 100% refund</li>
                  <li><strong>12-24 hours before:</strong> 75% refund</li>
                  <li><strong>6-12 hours before:</strong> 50% refund</li>
                  <li><strong>2-6 hours before:</strong> 25% refund</li>
                  <li><strong>Less than 2 hours before:</strong> No refund</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  5. User Responsibilities
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-4">
                <p>As a user of ParkEasy, you agree to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide accurate and complete information during registration</li>
                  <li>Maintain the confidentiality of your account credentials</li>
                  <li>Park only in your assigned parking spot</li>
                  <li>Not engage in any illegal activities within parking premises</li>
                  <li>Report any damages or issues immediately</li>
                  <li>Follow all parking facility rules and regulations</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-parking-primary" />
                  6. Liability & Disclaimers
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-4">
                <p>
                  ParkEasy is not responsible for:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Theft, damage, or loss of vehicles or belongings</li>
                  <li>Personal injury occurring within parking facilities</li>
                  <li>Technical issues affecting booking availability</li>
                  <li>Actions of parking facility staff or other users</li>
                </ul>
                <p>
                  We recommend users maintain appropriate vehicle insurance and take necessary precautions 
                  to secure their vehicles and valuables.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-parking-primary" />
                  7. Contact Us
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p><strong>Email:</strong> legal@parkeasy.com</p>
                  <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                  <p><strong>Address:</strong> 123 Tech Street, Innovation City, IC 12345</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;
