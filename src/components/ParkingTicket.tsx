import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, MapPin, Clock, Car, Check } from "lucide-react";
import QRCode from "qrcode";
import { useToast } from "@/hooks/use-toast";

interface ParkingTicketProps {
  booking: {
    id: string;
    location_name: string;
    location_address: string;
    date: string;
    start_time: string;
    end_time: string;
    duration: number;
    total_amount: number;
    vehicle_number: string;
    qr_code?: string;
    slot_number?: string;
  };
  onClose: () => void;
}

// Generate a parking slot number based on booking id
const generateSlotNumber = (bookingId: string): string => {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const hash = bookingId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const row = rows[hash % rows.length];
  const number = (hash % 20) + 1;
  return `${row}${number}`;
};

const ParkingTicket = ({ booking, onClose }: ParkingTicketProps) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const { toast } = useToast();
  const slotNumber = booking.slot_number || generateSlotNumber(booking.id);

  React.useEffect(() => {
    generateQRCode();
  }, [booking.id]);

  const generateQRCode = async () => {
    try {
      const qrData = {
        bookingId: booking.id,
        location: booking.location_name,
        date: booking.date,
        time: booking.start_time,
        vehicle: booking.vehicle_number,
        slot: slotNumber
      };
      
      const qrUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 200,
        margin: 2,
        color: {
          dark: '#1a472a',
          light: '#ffffff'
        }
      });
      
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const downloadTicket = () => {
    // Create a canvas to draw the ticket
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    canvas.width = 600;
    canvas.height = 800;
    
    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Header
    ctx.fillStyle = '#1a472a';
    ctx.fillRect(0, 0, canvas.width, 80);
    
    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PARKING TICKET', canvas.width / 2, 50);
    
    // Content
    ctx.fillStyle = '#000000';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    
    let y = 120;
    const lineHeight = 30;
    
    const details = [
      `Booking ID: ${booking.id}`,
      `Slot Number: ${slotNumber}`,
      `Location: ${booking.location_name}`,
      `Address: ${booking.location_address}`,
      `Date: ${booking.date}`,
      `Time: ${booking.start_time} - ${booking.end_time}`,
      `Duration: ${booking.duration} hour(s)`,
      `Vehicle: ${booking.vehicle_number}`,
      `Amount: ₹${booking.total_amount}`
    ];
    
    details.forEach((detail) => {
      ctx.fillText(detail, 50, y);
      y += lineHeight;
    });
    
    // QR Code
    if (qrCodeUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, canvas.width / 2 - 100, y + 20, 200, 200);
        
        // QR Code label
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Scan to verify', canvas.width / 2, y + 240);
        
        // Download
        const link = document.createElement('a');
        link.download = `parking-ticket-${booking.id}.png`;
        link.href = canvas.toDataURL();
        link.click();
        
        toast({
          title: "Ticket downloaded",
          description: "Your parking ticket has been saved to your device"
        });
      };
      img.src = qrCodeUrl;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="max-w-md w-full my-4">
        <CardHeader className="text-center bg-parking-primary text-primary-foreground py-3">
          <div className="flex items-center justify-center mb-1">
            <Check className="h-6 w-6 text-green-400" />
          </div>
          <CardTitle className="text-lg">Booking Confirmed!</CardTitle>
          <p className="text-xs opacity-90">Your parking spot has been reserved</p>
        </CardHeader>
        
        <CardContent className="p-4 space-y-3">
          {/* Slot Number - Prominent Display */}
          <div className="bg-parking-primary/10 border-2 border-parking-primary rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Your Parking Slot</p>
            <p className="text-3xl font-bold text-parking-primary">{slotNumber}</p>
          </div>
          
          <div className="text-center">
            <h3 className="font-semibold text-base">{booking.location_name}</h3>
            <p className="text-xs text-muted-foreground flex items-center justify-center">
              <MapPin className="h-3 w-3 mr-1" />
              {booking.location_address}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="font-medium">Date</p>
              <p>{booking.date}</p>
            </div>
            <div>
              <p className="font-medium">Time</p>
              <p className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {booking.start_time} - {booking.end_time}
              </p>
            </div>
            <div>
              <p className="font-medium">Duration</p>
              <p>{booking.duration} hour(s)</p>
            </div>
            <div>
              <p className="font-medium">Vehicle</p>
              <p className="flex items-center">
                <Car className="h-3 w-3 mr-1" />
                {booking.vehicle_number}
              </p>
            </div>
          </div>
          
          <div className="border-t pt-2">
            <div className="flex justify-between items-center text-base font-semibold">
              <span>Total Amount</span>
              <span className="text-parking-primary">₹{booking.total_amount}</span>
            </div>
          </div>
          
          {qrCodeUrl && (
            <div className="text-center">
              <img src={qrCodeUrl} alt="QR Code" className="mx-auto w-24 h-24" />
              <p className="text-xs text-muted-foreground">Scan to verify</p>
            </div>
          )}
          
          {/* Buttons moved up - always visible */}
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={downloadTicket}
              className="flex-1 bg-parking-primary hover:bg-parking-primary-light"
              size="sm"
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            <Button 
              onClick={onClose}
              variant="outline"
              className="flex-1"
              size="sm"
            >
              Go to Bookings
            </Button>
          </div>
          
          <div className="text-xs text-center text-muted-foreground">
            ID: {booking.id.substring(0, 8)}...
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ParkingTicket;