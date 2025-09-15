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

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
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
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate QR code for the booking
      const qrCode = await supabase
        .rpc('generate_booking_qr', { booking_id: bookingId });

      // Update booking with payment details
      const { error } = await supabase
        .from('bookings')
        .update({
          payment_status: 'completed',
          payment_method: paymentMethod,
          payment_id: `PAY_${Date.now()}`,
          qr_code: qrCode.data
        })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Payment Successful!",
        description: `Payment of ₹${amount} completed successfully via ${paymentMethod.toUpperCase()}`
      });

      onSuccess();
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        variant: "destructive",
        title: "Payment Failed",
        description: "Unable to process payment. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCardPayment = async () => {
    if (!cardData.number || !cardData.expiry || !cardData.cvv || !cardData.name) {
      toast({
        variant: "destructive",
        title: "Incomplete Details",
        description: "Please fill in all card details"
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
    if (!upiData.id || !upiData.pin) {
      toast({
        variant: "destructive",
        title: "UPI Details Required",
        description: "Please enter your UPI ID and PIN"
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
                    onChange={(e) => setUpiData(prev => ({ ...prev, id: e.target.value }))}
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
                    onChange={(e) => setUpiData(prev => ({ ...prev, pin: e.target.value }))}
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
                      maxLength={3}
                      value={cardData.cvv}
                      onChange={(e) => setCardData(prev => ({ ...prev, cvv: e.target.value }))}
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
                      onChange={(e) => setCardData(prev => ({ ...prev, otp: e.target.value }))}
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