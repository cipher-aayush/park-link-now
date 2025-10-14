import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Car, Download, Star, Ticket } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow, format } from 'date-fns';
import ParkingTicket from './ParkingTicket';

interface Booking {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  total_amount: number;
  booking_status: string;
  payment_status: string;
  vehicle_number: string;
  created_at: string;
  parking_locations?: {
    name: string;
    address: string;
    price_per_hour: number;
  };
}

const BookingHistory: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          parking_locations (
            name,
            address,
            price_per_hour
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to load booking history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const showTicket = (booking: Booking) => {
    setSelectedBooking(booking);
  };

  const isCurrentBooking = (booking: Booking) => {
    const today = new Date();
    const bookingDate = new Date(booking.booking_date);
    return bookingDate >= today && booking.booking_status === 'active';
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

  const currentBookings = bookings.filter(isCurrentBooking);
  const pastBookings = bookings.filter(b => !isCurrentBooking(b));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <Badge variant="outline">{bookings.length} total bookings</Badge>
      </div>

      {/* Current Bookings Section */}
      {currentBookings.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            Current Bookings ({currentBookings.length})
          </h2>
          <div className="space-y-4">
            {currentBookings.map((booking) => (
              <BookingCard 
                key={booking.id} 
                booking={booking} 
                onShowTicket={showTicket}
                isCurrent={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Past Bookings Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          Past Bookings ({pastBookings.length})
        </h2>

        {pastBookings.length === 0 ? (
          <Card className="p-12 text-center">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No past bookings</h3>
            <p className="text-muted-foreground mb-4">
              Your completed bookings will appear here
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {pastBookings.map((booking) => (
              <BookingCard 
                key={booking.id} 
                booking={booking} 
                onShowTicket={showTicket}
                isCurrent={false}
              />
            ))}
          </div>
        )}
      </div>

      {/* Ticket Modal */}
      {selectedBooking && (
        <ParkingTicket
          booking={{
            id: selectedBooking.id,
            location_name: selectedBooking.parking_locations?.name || 'Parking Location',
            location_address: selectedBooking.parking_locations?.address || '',
            date: format(new Date(selectedBooking.booking_date), 'MMM dd, yyyy'),
            start_time: selectedBooking.start_time,
            end_time: selectedBooking.end_time,
            duration: selectedBooking.duration_hours,
            total_amount: selectedBooking.total_amount,
            vehicle_number: selectedBooking.vehicle_number || 'N/A',
            qr_code: selectedBooking.id
          }}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
};

// Booking Card Component
interface BookingCardProps {
  booking: Booking;
  onShowTicket: (booking: Booking) => void;
  isCurrent: boolean;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, onShowTicket, isCurrent }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${isCurrent ? 'border-green-500 border-2' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              {booking.parking_locations?.name || 'Parking Location'}
            </CardTitle>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="w-4 h-4" />
              {booking.parking_locations?.address}
            </p>
          </div>
          <div className="text-right space-y-1">
            <Badge className={getStatusColor(booking.booking_status)}>
              {booking.booking_status}
            </Badge>
            <Badge variant="outline" className={getPaymentStatusColor(booking.payment_status)}>
              {booking.payment_status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Date</p>
              <p className="text-muted-foreground">
                {format(new Date(booking.booking_date), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Time</p>
              <p className="text-muted-foreground">
                {booking.start_time} - {booking.end_time}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Vehicle</p>
              <p className="text-muted-foreground">
                {booking.vehicle_number || 'N/A'}
              </p>
            </div>
          </div>
          
          <div>
            <p className="font-medium">Total Amount</p>
            <p className="text-lg font-bold text-primary">
              ₹{booking.total_amount}
            </p>
            <p className="text-xs text-muted-foreground">
              {booking.duration_hours}h × ₹{booking.parking_locations?.price_per_hour}/h
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-xs text-muted-foreground">
            Booked {formatDistanceToNow(new Date(booking.created_at), { addSuffix: true })}
          </div>
          
          <div className="flex gap-2">
            {booking.payment_status === 'completed' && (
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => onShowTicket(booking)}
                className="gap-1 bg-parking-primary hover:bg-parking-primary/90"
              >
                <Ticket className="w-3 h-3" />
                View Ticket
              </Button>
            )}
            {booking.booking_status === 'completed' && (
              <Button variant="outline" size="sm" className="gap-1">
                <Star className="w-3 h-3" />
                Review
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingHistory;