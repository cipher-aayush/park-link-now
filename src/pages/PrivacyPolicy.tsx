import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, Database, UserCheck, Globe, Bell, Trash2 } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-parking-primary/10 rounded-full mb-4">
              <Shield className="h-8 w-8 text-parking-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: December 2024</p>
          </div>

          <div className="bg-parking-primary/5 border border-parking-primary/20 rounded-lg p-6 mb-8">
            <p className="text-foreground">
              At ParkEasy, we are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
            </p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-parking-primary" />
                  1. Information We Collect
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-4">
                <h4 className="font-semibold text-foreground">Personal Information:</h4>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Name and email address</li>
                  <li>Phone number</li>
                  <li>Vehicle registration details</li>
                  <li>Payment information (processed securely by payment partners)</li>
                  <li>Booking history and preferences</li>
                </ul>
                
                <h4 className="font-semibold text-foreground mt-6">Automatically Collected Information:</h4>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Device information (type, operating system)</li>
                  <li>IP address and browser type</li>
                  <li>Location data (with your consent)</li>
                  <li>Usage patterns and app interactions</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-parking-primary" />
                  2. How We Use Your Information
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-4">
                <p>We use the collected information for:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Processing and managing your parking bookings</li>
                  <li>Sending booking confirmations and reminders</li>
                  <li>Processing payments and refunds</li>
                  <li>Providing customer support</li>
                  <li>Improving our services and user experience</li>
                  <li>Sending promotional offers (with your consent)</li>
                  <li>Ensuring security and preventing fraud</li>
                  <li>Complying with legal obligations</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-parking-primary" />
                  3. Information Sharing
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-4">
                <p>We may share your information with:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Parking Facility Partners:</strong> To fulfill your bookings</li>
                  <li><strong>Payment Processors:</strong> To process secure transactions</li>
                  <li><strong>Service Providers:</strong> Who assist in our operations</li>
                  <li><strong>Legal Authorities:</strong> When required by law</li>
                </ul>
                <p className="mt-4 font-medium text-foreground">
                  We do NOT sell your personal information to third parties.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-parking-accent" />
                  4. Data Security
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-4">
                <p>We implement robust security measures to protect your data:</p>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">🔐 Encryption</h4>
                    <p className="text-sm">All data is encrypted in transit and at rest using industry-standard protocols.</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">🛡️ Access Control</h4>
                    <p className="text-sm">Strict access controls ensure only authorized personnel can access your data.</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">🔍 Monitoring</h4>
                    <p className="text-sm">Continuous security monitoring to detect and prevent unauthorized access.</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">💾 Backups</h4>
                    <p className="text-sm">Regular backups ensure your data is safe and recoverable.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-parking-primary" />
                  5. Your Rights
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-4">
                <p>You have the right to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Rectify:</strong> Correct inaccurate or incomplete data</li>
                  <li><strong>Delete:</strong> Request deletion of your personal data</li>
                  <li><strong>Portability:</strong> Receive your data in a portable format</li>
                  <li><strong>Withdraw Consent:</strong> Opt-out of marketing communications</li>
                  <li><strong>Object:</strong> Object to processing based on legitimate interests</li>
                </ul>
                <p className="mt-4">
                  To exercise these rights, contact us at privacy@parkeasy.com
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-parking-primary" />
                  6. Cookies & Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-4">
                <p>We use cookies and similar technologies to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Remember your preferences and settings</li>
                  <li>Authenticate your sessions</li>
                  <li>Analyze usage patterns to improve our service</li>
                  <li>Deliver relevant content and advertisements</li>
                </ul>
                <p className="mt-4">
                  You can control cookie preferences through your browser settings. Note that disabling 
                  cookies may affect some functionality of our service.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-destructive" />
                  7. Data Retention
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-4">
                <p>
                  We retain your personal information for as long as necessary to provide our services 
                  and fulfill the purposes outlined in this policy.
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Active accounts:</strong> Data retained while account is active</li>
                  <li><strong>Booking records:</strong> Retained for 7 years for legal compliance</li>
                  <li><strong>Payment records:</strong> Retained as required by financial regulations</li>
                  <li><strong>After account deletion:</strong> Most data deleted within 30 days</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-parking-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-parking-primary">
                  <Shield className="h-5 w-5" />
                  Contact Our Privacy Team
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>
                  For privacy-related inquiries or to exercise your data rights, please contact our dedicated privacy team:
                </p>
                <div className="mt-4 p-4 bg-parking-primary/5 rounded-lg">
                  <p><strong>Email:</strong> privacy@parkeasy.com</p>
                  <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                  <p><strong>Data Protection Officer:</strong> dpo@parkeasy.com</p>
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

export default PrivacyPolicy;
