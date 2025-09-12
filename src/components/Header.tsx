import { Button } from "@/components/ui/button";
import { Car, Menu, User } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-primary p-2 rounded-lg">
              <Car className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">ParkEasy</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-foreground hover:text-parking-primary transition-colors">
              Find Parking
            </a>
            <a href="#" className="text-foreground hover:text-parking-primary transition-colors">
              How it Works
            </a>
            <a href="#" className="text-foreground hover:text-parking-primary transition-colors">
              Pricing
            </a>
            <a href="#" className="text-foreground hover:text-parking-primary transition-colors">
              Support
            </a>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              variant="ghost" 
              className="text-foreground hover:text-parking-primary"
              onClick={() => window.location.href = '/sign-in'}
            >
              <User className="h-4 w-4 mr-2" />
              Sign In
            </Button>
            <Button 
              className="bg-parking-accent hover:bg-parking-accent/90 text-accent-foreground"
              onClick={() => window.location.href = '/sign-up'}
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-4">
              <a href="#" className="text-foreground hover:text-parking-primary transition-colors">
                Find Parking
              </a>
              <a href="#" className="text-foreground hover:text-parking-primary transition-colors">
                How it Works
              </a>
              <a href="#" className="text-foreground hover:text-parking-primary transition-colors">
                Pricing
              </a>
              <a href="#" className="text-foreground hover:text-parking-primary transition-colors">
                Support
              </a>
              <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                <Button 
                  variant="ghost" 
                  className="justify-start text-foreground hover:text-parking-primary"
                  onClick={() => window.location.href = '/sign-in'}
                >
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
                <Button 
                  className="justify-start bg-parking-accent hover:bg-parking-accent/90 text-accent-foreground"
                  onClick={() => window.location.href = '/sign-up'}
                >
                  Get Started
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;