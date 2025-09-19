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
  };
  onClose: () => void;
}

const ParkingTicket = ({ booking, onClose }: ParkingTicketProps) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const { toast } = useToast();

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
        vehicle: booking.vehicle_number
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center bg-parking-primary text-primary-foreground">
          <div className="flex items-center justify-center mb-2">
            <Check className="h-8 w-8 text-green-400" />
          </div>
          <CardTitle className="text-xl">Booking Confirmed!</CardTitle>
          <p className="text-sm opacity-90">Your parking spot has been reserved</p>
        </CardHeader>
        
        <CardContent className="p-6 space-y-4">
          <div className="text-center">
            <h3 className="font-semibold text-lg">{booking.location_name}</h3>
            <p className="text-sm text-muted-foreground flex items-center justify-center">
              <MapPin className="h-4 w-4 mr-1" />
              {booking.location_address}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">Date</p>
              <p>{booking.date}</p>
            </div>
            <div>
              <p className="font-medium">Time</p>
              <p className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {booking.start_time}
              </p>
            </div>
            <div>
              <p className="font-medium">Duration</p>
              <p>{booking.duration} hour(s)</p>
            </div>
            <div>
              <p className="font-medium">Vehicle</p>
              <p className="flex items-center">
                <Car className="h-4 w-4 mr-1" />
                {booking.vehicle_number}
              </p>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total Amount</span>
              <span className="text-parking-primary">₹{booking.total_amount}</span>
            </div>
          </div>
          
          {qrCodeUrl && (
            <div className="text-center">
              <img src={qrCodeUrl} alt="QR Code" className="mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Scan to verify your booking</p>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button 
              onClick={downloadTicket}
              className="flex-1 bg-parking-primary hover:bg-parking-primary-light"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Ticket
            </Button>
            <Button 
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Close
            </Button>
          </div>
          
          <div className="text-xs text-center text-muted-foreground">
            Booking ID: {booking.id}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ParkingTicket;