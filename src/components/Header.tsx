import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car, Menu, User, LogOut, Bell, Heart, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import DarkModeToggle from "./DarkModeToggle";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

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
            <Link to="/" className="text-foreground hover:text-parking-primary transition-colors">
              Find Parking
            </Link>
            {user && (
              <Link to="/my-bookings" className="text-foreground hover:text-parking-primary transition-colors flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                My Bookings
              </Link>
            )}
            <a href="#how-it-works" className="text-foreground hover:text-parking-primary transition-colors">
              How it Works
            </a>
            <a href="#pricing" className="text-foreground hover:text-parking-primary transition-colors">
              Pricing
            </a>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <DarkModeToggle />
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-foreground text-sm">
                  Welcome back!
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={signOut}
                  className="text-foreground hover:text-parking-primary"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Link to="/sign-in">
                  <Button 
                    variant="ghost" 
                    className="text-foreground hover:text-parking-primary"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
                <Button 
                  className="bg-parking-accent hover:bg-parking-accent/90 text-accent-foreground"
                  onClick={() => window.location.href = '/sign-up'}
                >
                  Get Started
                </Button>
              </>
            )}
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
              <Link to="/" className="text-foreground hover:text-parking-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
                Find Parking
              </Link>
              {user && (
                <Link to="/my-bookings" className="text-foreground hover:text-parking-primary transition-colors flex items-center gap-1" onClick={() => setIsMenuOpen(false)}>
                  <Calendar className="w-4 h-4" />
                  My Bookings
                </Link>
              )}
              <a href="#how-it-works" className="text-foreground hover:text-parking-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
                How it Works
              </a>
              <a href="#pricing" className="text-foreground hover:text-parking-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
                Pricing
              </a>
              <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-foreground text-sm">Theme</span>
                  <DarkModeToggle />
                </div>
                {user ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2 text-foreground text-sm">
                      Welcome back!
                    </div>
                    <Button 
                      variant="ghost"
                      className="justify-start text-foreground hover:text-parking-primary"
                      onClick={() => {
                        signOut();
                        setIsMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <>
                    <Link to="/sign-in">
                      <Button 
                        variant="ghost" 
                        className="justify-start text-foreground hover:text-parking-primary w-full"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/sign-up">
                      <Button 
                        className="justify-start bg-parking-accent hover:bg-parking-accent/90 text-accent-foreground w-full"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;