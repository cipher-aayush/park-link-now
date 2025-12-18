import { Car, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-parking-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-parking-accent p-2 rounded-lg">
                <Car className="h-6 w-6 text-accent-foreground" />
              </div>
              <span className="text-xl font-bold">ParkEasy</span>
            </div>
            <p className="text-primary-foreground/80 leading-relaxed">
              Making parking simple, secure, and convenient for everyone. Book your spot with confidence.
            </p>
            <div className="flex space-x-4">
              <Button size="sm" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                Download App
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-primary-foreground/80">
              <li><a href="#" className="hover:text-parking-accent transition-colors">Find Parking</a></li>
              <li><a href="#" className="hover:text-parking-accent transition-colors">How it Works</a></li>
              <li><a href="#" className="hover:text-parking-accent transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-parking-accent transition-colors">Partner with Us</a></li>
              <li><a href="#" className="hover:text-parking-accent transition-colors">Support Center</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3 text-primary-foreground/80">
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>support@parkeasy.com</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                <span>123 Tech Street<br />Innovation City, IC 12345</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Stay Updated</h3>
            <p className="text-primary-foreground/80 mb-4">
              Get the latest updates on new parking locations and features.
            </p>
            <div className="space-y-2">
              <Input 
                placeholder="Enter your email"
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
              />
              <Button className="w-full bg-parking-accent hover:bg-parking-accent/90 text-accent-foreground">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-primary-foreground/60 text-sm">
            © 2024 ParkEasy. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy-policy" className="text-primary-foreground/60 hover:text-parking-accent text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="text-primary-foreground/60 hover:text-parking-accent text-sm transition-colors">
              Terms of Service
            </Link>
            <a href="#" className="text-primary-foreground/60 hover:text-parking-accent text-sm transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;