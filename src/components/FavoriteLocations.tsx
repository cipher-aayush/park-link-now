import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Star, Car, Clock, Bell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface FavoriteLocation {
  id: string;
  created_at: string;
  parking_locations: {
    id: string;
    name: string;
    address: string;
    price_per_hour: number;
    available_slots: number;
    total_slots: number;
    average_rating: number;
    total_reviews: number;
    category: string;
    features: string[];
  };
}

const FavoriteLocations: React.FC = () => {
  const [favorites, setFavorites] = useState<FavoriteLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('favorites')
        .select(`
          *,
          parking_locations (
            id,
            name,
            address,
            price_per_hour,
            available_slots,
            total_slots,
            average_rating,
            total_reviews,
            category,
            features
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast({
        title: "Error",
        description: "Failed to load favorite locations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (parkingLocationId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('favorites')
        .delete()
        .eq('user_id', user?.id)
        .eq('parking_location_id', parkingLocationId);

      if (error) throw error;

      setFavorites(prev => 
        prev.filter(fav => fav.parking_locations.id !== parkingLocationId)
      );

      toast({
        title: "Removed from favorites",
        description: "Location removed from your favorites",
      });
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast({
        title: "Error",
        description: "Failed to remove from favorites",
        variant: "destructive",
      });
    }
  };

  const enableNotifications = async (parkingLocationId: string) => {
    // This would enable notifications for this location
    toast({
      title: "Notifications enabled",
      description: "You'll be notified when spots become available",
    });
  };

  const getAvailabilityColor = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage > 50) return 'text-green-600';
    if (percentage > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Heart className="w-6 h-6 text-red-500" />
          Favorite Locations
        </h1>
        <Badge variant="outline">{favorites.length} favorites</Badge>
      </div>

      {favorites.length === 0 ? (
        <Card className="p-12 text-center">
          <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
          <p className="text-muted-foreground mb-4">
            Save parking locations you love for quick access
          </p>
          <Button>Find Parking</Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {favorites.map((favorite) => {
            const location = favorite.parking_locations;
            return (
              <Card key={favorite.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {location.name}
                        <Badge variant="outline" className="text-xs">
                          {location.category}
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-4 h-4" />
                        {location.address}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFavorite(location.id)}
                    >
                      <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Price per Hour</p>
                      <p className="text-lg font-bold text-primary">₹{location.price_per_hour}</p>
                    </div>
                    <div>
                      <p className="font-medium">Availability</p>
                      <p className={`font-semibold ${getAvailabilityColor(location.available_slots, location.total_slots)}`}>
                        {location.available_slots}/{location.total_slots} spots
                      </p>
                    </div>
                  </div>

                  {location.average_rating > 0 && (
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{location.average_rating.toFixed(1)}</span>
                      <span className="text-sm text-muted-foreground">
                        ({location.total_reviews} reviews)
                      </span>
                    </div>
                  )}

                  {location.features && location.features.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {location.features.slice(0, 3).map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {location.features.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{location.features.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button className="flex-1" size="sm">
                      <Car className="w-4 h-4 mr-1" />
                      Book Now
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => enableNotifications(location.id)}
                    >
                      <Bell className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FavoriteLocations;