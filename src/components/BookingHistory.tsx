import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Calendar, Clock, MapPin, Car, Bike, Download, Star, Ticket, XCircle } from 'lucide-react';
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
  total_amount: number;
  booking_status: string;
  payment_status: string;
  vehicle_number: string;
  vehicle_type: string;
  created_at: string;
  parking_locations?: {
    name: string;
    address: string;
    price_per_hour: number;
  };
}

// Helper function to calculate duration from start_time and end_time
const calculateDuration = (startTime: string, endTime: string): number => {
  try {
    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60)) || 1;
  } catch {
    return 1;
  }
};

const BookingHistory: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await (supabase as any)
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

  const handleCancelBooking = (booking: Booking) => {
    setBookingToCancel(booking);
    setCancelDialogOpen(true);
  };

  const [cancelling, setCancelling] = useState(false);
  const [refundInfo, setRefundInfo] = useState<{ refundPercentage: number; refundAmount: number; reason: string } | null>(null);

  const confirmCancelBooking = async () => {
    if (!bookingToCancel || !user) return;

    setCancelling(true);
    try {
      const { data, error } = await supabase.functions.invoke('cancel-booking', {
        body: {
          bookingId: bookingToCancel.id,
          userId: user.id,
          userEmail: user.email
        }
      });

      if (error) throw error;

      if (data.success) {
        setRefundInfo(data.refund);
        toast({
          title: "Booking Cancelled",
          description: data.refund.refundAmount > 0 
            ? `Refund of ₹${data.refund.refundAmount} (${data.refund.refundPercentage}%) will be processed within 2-3 business days.`
            : "Your booking has been cancelled. Unfortunately, no refund is available for late cancellations.",
        });

        // Refresh bookings
        fetchBookings();
        setCancelDialogOpen(false);
        setBookingToCancel(null);
        setRefundInfo(null);
      } else {
        throw new Error(data.error || 'Cancellation failed');
      }
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to cancel booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCancelling(false);
    }
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
                onCancelBooking={handleCancelBooking}
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
                onCancelBooking={handleCancelBooking}
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
            duration: calculateDuration(selectedBooking.start_time, selectedBooking.end_time),
            total_amount: selectedBooking.total_amount,
            vehicle_number: selectedBooking.vehicle_number || 'N/A',
            vehicle_type: selectedBooking.vehicle_type || 'car',
            qr_code: selectedBooking.id
          }}
          onClose={() => setSelectedBooking(null)}
        />
      )}

      {/* Cancel Booking Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={(open) => {
        if (!cancelling) {
          setCancelDialogOpen(open);
          if (!open) setBookingToCancel(null);
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>Are you sure you want to cancel this booking?</p>
              <div className="bg-muted p-3 rounded-md text-sm space-y-1">
                <p className="font-semibold">Refund Policy:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>More than 24 hours before: <span className="text-green-600 font-medium">100% refund</span></li>
                  <li>12-24 hours before: <span className="text-green-600 font-medium">75% refund</span></li>
                  <li>6-12 hours before: <span className="text-yellow-600 font-medium">50% refund</span></li>
                  <li>2-6 hours before: <span className="text-orange-600 font-medium">25% refund</span></li>
                  <li>Less than 2 hours: <span className="text-red-600 font-medium">No refund</span></li>
                </ul>
              </div>
              {bookingToCancel && (
                <p className="text-sm">
                  Booking amount: <span className="font-bold">₹{bookingToCancel.total_amount}</span>
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>Keep Booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancelBooking}
              className="bg-red-600 hover:bg-red-700"
              disabled={cancelling}
            >
              {cancelling ? "Cancelling..." : "Cancel Booking"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Booking Card Component
interface BookingCardProps {
  booking: Booking;
  onShowTicket: (booking: Booking) => void;
  onCancelBooking: (booking: Booking) => void;
  isCurrent: boolean;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, onShowTicket, onCancelBooking, isCurrent }) => {
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
            {booking.vehicle_type === 'bike' ? (
              <Bike className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Car className="w-4 h-4 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium">Vehicle</p>
              <p className="text-muted-foreground">
                {booking.vehicle_type === 'bike' ? 'Bike' : 'Car'} - {booking.vehicle_number || 'N/A'}
              </p>
            </div>
          </div>
          
          <div>
            <p className="font-medium">Total Amount</p>
            <p className="text-lg font-bold text-primary">
              ₹{booking.total_amount}
            </p>
            <p className="text-xs text-muted-foreground">
              {calculateDuration(booking.start_time, booking.end_time)}h × ₹{booking.parking_locations?.price_per_hour}/h
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
            {booking.booking_status === 'active' && booking.payment_status === 'completed' && (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => onCancelBooking(booking)}
                className="gap-1"
              >
                <XCircle className="w-3 h-3" />
                Cancel
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