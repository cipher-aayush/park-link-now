import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Smartphone, QrCode, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import QRCode from 'qrcode';
import { z } from 'zod';

// Validation schemas
const cardSchema = z.object({
  number: z.string().regex(/^[0-9\s]{13,19}$/, 'Invalid card number format'),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/[0-9]{2}$/, 'Invalid expiry format (MM/YY)'),
  cvv: z.string().regex(/^[0-9]{3,4}$/, 'CVV must be 3-4 digits'),
  name: z.string().min(3, 'Name must be at least 3 characters').max(100, 'Name too long'),
  otp: z.string().regex(/^[0-9]{6}$/, 'OTP must be 6 digits').optional()
});

const upiSchema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9._-]+@[a-zA-Z]+$/, 'Invalid UPI ID format'),
  pin: z.string().regex(/^[0-9]{4,6}$/, 'PIN must be 4-6 digits')
});

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (booking?: any) => void;
  bookingId: string | null;
  amount: number;
}

const PaymentModal = ({ isOpen, onClose, onSuccess, bookingId, amount }: PaymentModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('upi');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
    otp: ''
  });
  const [upiData, setUpiData] = useState({
    id: '',
    pin: ''
  });
  const [showOtpField, setShowOtpField] = useState(false);

  // Generate QR code for payment
  useEffect(() => {
    if (activeTab === 'qr' && bookingId) {
      const generateQR = async () => {
        try {
          const qrData = `upi://pay?pa=parking@upi&pn=ParkingApp&am=${amount}&cu=INR&tn=Parking-${bookingId}`;
          const qrUrl = await QRCode.toDataURL(qrData);
          setQrCodeUrl(qrUrl);
        } catch (error) {
          console.error('QR generation error:', error);
        }
      };
      generateQR();
    }
  }, [activeTab, bookingId, amount]);

  const processPayment = async (paymentMethod: string) => {
    if (!bookingId) return;

    setLoading(true);

    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Call the secure edge function to process payment
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          bookingId,
          paymentMethod
        }
      });

      if (error) {
        console.error('Payment processing error:', error);
        throw new Error(error.message || 'Payment processing failed');
      }

      if (!data.success) {
        throw new Error(data.error || 'Payment failed');
      }

      toast({
        title: "Payment Successful!",
        description: `Payment of ₹${amount} completed successfully via ${paymentMethod.toUpperCase()}`
      });

      // Fetch updated booking
      const { data: updatedBooking } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      onSuccess(updatedBooking);
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Unable to process payment. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCardPayment = async () => {
    // Validate card data
    const validation = cardSchema.safeParse(cardData);
    
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast({
        variant: "destructive",
        title: "Invalid Card Details",
        description: firstError.message
      });
      return;
    }

    if (!showOtpField) {
      setShowOtpField(true);
      toast({
        title: "OTP Sent",
        description: "Please enter the OTP sent to your registered mobile number"
      });
      return;
    }

    if (!cardData.otp) {
      toast({
        variant: "destructive",
        title: "OTP Required",
        description: "Please enter the OTP to complete payment"
      });
      return;
    }

    await processPayment('card');
  };

  const handleUpiPayment = async () => {
    // Validate UPI data
    const validation = upiSchema.safeParse(upiData);
    
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast({
        variant: "destructive",
        title: "Invalid UPI Details",
        description: firstError.message
      });
      return;
    }

    await processPayment('upi');
  };

  const handleQrPayment = async () => {
    await processPayment('qr');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Secure Payment</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold">₹{amount}</div>
                <div className="text-sm text-muted-foreground">Amount to Pay</div>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upi">
                <Smartphone className="h-4 w-4 mr-1" />
                UPI
              </TabsTrigger>
              <TabsTrigger value="card">
                <CreditCard className="h-4 w-4 mr-1" />
                Card
              </TabsTrigger>
              <TabsTrigger value="qr">
                <QrCode className="h-4 w-4 mr-1" />
                QR Code
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upi" className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="upiId">UPI ID</Label>
                  <Input
                    id="upiId"
                    placeholder="yourname@upi"
                    value={upiData.id}
                    onChange={(e) => setUpiData(prev => ({ ...prev, id: e.target.value.trim() }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upiPin">UPI PIN</Label>
                  <Input
                    id="upiPin"
                    type="password"
                    placeholder="Enter 4-6 digit PIN"
                    maxLength={6}
                    value={upiData.pin}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setUpiData(prev => ({ ...prev, pin: value }));
                    }}
                  />
                </div>
                <Button 
                  onClick={handleUpiPayment} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Processing..." : "Pay with UPI"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="card" className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    value={cardData.number}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
                      setCardData(prev => ({ ...prev, number: value }));
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      maxLength={5}
                      value={cardData.expiry}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').replace(/(.{2})/, '$1/');
                        setCardData(prev => ({ ...prev, expiry: value }));
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      type="password"
                      placeholder="123"
                      maxLength={4}
                      value={cardData.cvv}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setCardData(prev => ({ ...prev, cvv: value }));
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardName">Cardholder Name</Label>
                  <Input
                    id="cardName"
                    placeholder="John Doe"
                    value={cardData.name}
                    onChange={(e) => setCardData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                {showOtpField && (
                  <div className="space-y-2">
                    <Label htmlFor="otp">OTP</Label>
                    <Input
                      id="otp"
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      value={cardData.otp}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setCardData(prev => ({ ...prev, otp: value }));
                      }}
                    />
                  </div>
                )}
                <Button 
                  onClick={handleCardPayment} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Processing..." : showOtpField ? "Verify OTP & Pay" : "Send OTP"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="qr" className="space-y-4">
              <div className="text-center space-y-4">
                {qrCodeUrl && (
                  <div className="flex justify-center">
                    <img src={qrCodeUrl} alt="Payment QR Code" className="w-48 h-48" />
                  </div>
                )}
                <div className="text-sm text-muted-foreground">
                  Scan this QR code with any UPI app to pay ₹{amount}
                </div>
                <Button 
                  onClick={handleQrPayment} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Processing..." : "I have paid"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="text-xs text-center text-muted-foreground">
            <Shield className="h-3 w-3 inline mr-1" />
            Your payment is secured with 256-bit SSL encryption
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;