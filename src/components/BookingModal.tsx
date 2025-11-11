import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin, Car, CreditCard, Smartphone, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import PaymentModal from './PaymentModal';
import ParkingTicket from './ParkingTicket';
import { z } from 'zod';

const bookingSchema = z.object({
  date: z.string()
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, { message: "Date cannot be in the past" }),
  startTime: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Invalid time format" }),
  duration: z.string()
    .refine((val) => {
      const num = parseInt(val);
      return !isNaN(num) && num > 0 && num <= 168;
    }, { message: "Duration must be between 1 and 168 hours" }),
  vehicleNumber: z.string()
    .trim()
    .min(5, { message: "Vehicle number must be at least 5 characters" })
    .max(15, { message: "Vehicle number must be less than 15 characters" })
    .regex(/^[A-Z0-9\s-]+$/, { message: "Vehicle number must contain only uppercase letters, numbers, spaces, and hyphens" })
});

interface ParkingLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  available_slots: number;
  total_slots: number;
  price_per_hour: number;
  features: string[];
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: ParkingLocation | null;
  prefilledDate?: string;
  prefilledTime?: string;
  prefilledDuration?: string;
}

const BookingModal = ({ isOpen, onClose, location, prefilledDate, prefilledTime, prefilledDuration }: BookingModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookingData, setBookingData] = useState({
    date: prefilledDate || new Date().toISOString().split('T')[0],
    startTime: prefilledTime || '09:00',
    duration: prefilledDuration || '2',
    vehicleNumber: ''
  });
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTicket, setShowTicket] = useState(false);
  const [ticketData, setTicketData] = useState<any>(null);

  const calculateTotal = () => {
    if (!location) return 0;
    return location.price_per_hour * parseInt(bookingData.duration);
  };

  const calculateEndTime = () => {
    const [hours, minutes] = bookingData.startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + (parseInt(bookingData.duration) * 60);
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  const handleBookingSubmit = async () => {
    if (!user || !location) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to make a booking"
      });
      return;
    }

    // Validate booking data
    try {
      bookingSchema.parse(bookingData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: error.errors[0].message
        });
        return;
      }
    }

    setLoading(true);

    try {
      const { data: booking, error } = await (supabase as any)
        .from('bookings')
        .insert({
          user_id: user.id,
          parking_location_id: location.id,
          booking_date: bookingData.date,
          start_time: bookingData.startTime,
          end_time: calculateEndTime(),
          duration_hours: parseInt(bookingData.duration),
          total_amount: calculateTotal(),
          vehicle_number: bookingData.vehicleNumber,
          payment_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      setBookingId(booking?.id);
      setPaymentModalOpen(true);
      
      toast({
        title: "Booking created",
        description: "Please complete the payment to confirm your booking"
      });
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        variant: "destructive",
        title: "Booking failed",
        description: "Unable to create booking. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (booking?: any) => {
    setPaymentModalOpen(false);
    
    // Create ticket data
    const ticket = {
      id: bookingId || `PK${Date.now()}`,
      location_name: location?.name || '',
      location_address: location?.address || '',
      date: bookingData.date,
      start_time: bookingData.startTime,
      end_time: calculateEndTime(),
      duration: parseInt(bookingData.duration),
      total_amount: calculateTotal(),
      vehicle_number: bookingData.vehicleNumber
    };
    
    setTicketData(ticket);
    setShowTicket(true);
  };

  if (!location) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Book Parking Spot</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Location Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{location.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{location.address}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Available Slots:</span>
                    <span className="ml-2 text-green-600">{location.available_slots}/{location.total_slots}</span>
                  </div>
                  <div>
                    <span className="font-medium">Price:</span>
                    <span className="ml-2">₹{location.price_per_hour}/hour</span>
                  </div>
                </div>
                {location.features.length > 0 && (
                  <div className="mt-4">
                    <span className="font-medium text-sm">Features:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {location.features.map((feature, index) => (
                        <span key={index} className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Booking Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Booking Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Date</span>
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={bookingData.date}
                      onChange={(e) => setBookingData(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startTime" className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>Start Time</span>
                    </Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={bookingData.startTime}
                      onChange={(e) => setBookingData(prev => ({ ...prev, startTime: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Select
                      value={bookingData.duration}
                      onValueChange={(value) => setBookingData(prev => ({ ...prev, duration: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 hour</SelectItem>
                        <SelectItem value="2">2 hours</SelectItem>
                        <SelectItem value="3">3 hours</SelectItem>
                        <SelectItem value="4">4 hours</SelectItem>
                        <SelectItem value="6">6 hours</SelectItem>
                        <SelectItem value="8">8 hours</SelectItem>
                        <SelectItem value="12">12 hours</SelectItem>
                        <SelectItem value="24">24 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <div className="h-10 px-3 py-2 border border-input bg-muted rounded-md flex items-center text-sm">
                      {calculateEndTime()}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicleNumber" className="flex items-center space-x-1">
                    <Car className="h-4 w-4" />
                    <span>Vehicle Number</span>
                  </Label>
                  <Input
                    id="vehicleNumber"
                    placeholder="e.g., DL 01 AB 1234"
                    value={bookingData.vehicleNumber}
                    onChange={(e) => setBookingData(prev => ({ ...prev, vehicleNumber: e.target.value.toUpperCase() }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pricing Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>{bookingData.duration} hour(s)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rate:</span>
                    <span>₹{location.price_per_hour}/hour</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>₹{calculateTotal()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleBookingSubmit} 
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Creating Booking..." : "Proceed to Payment"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onSuccess={handlePaymentSuccess}
        bookingId={bookingId}
        amount={calculateTotal()}
      />
      
      {showTicket && ticketData && (
        <ParkingTicket
          booking={ticketData}
          onClose={() => {
            setShowTicket(false);
            onClose();
          }}
        />
      )}
    </>
  );
};

export default BookingModal;