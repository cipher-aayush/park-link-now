import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get the authorization header from the request
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify the user's JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      throw new Error('Unauthorized');
    }

    const { bookingId, paymentMethod } = await req.json();
    
    console.log(`Processing payment for booking ${bookingId}, user ${user.id}, method: ${paymentMethod}`);

    if (!bookingId || !paymentMethod) {
      throw new Error('Missing required fields: bookingId and paymentMethod');
    }

    // Verify the booking belongs to the user
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .eq('user_id', user.id)
      .single();

    if (bookingError || !booking) {
      console.error('Booking verification error:', bookingError);
      throw new Error('Booking not found or unauthorized');
    }

    // TODO: Integrate with real payment gateway (Stripe/Razorpay/PayU)
    // For now, simulate payment processing with validation
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate payment ID (in production, this would come from the payment gateway)
    const paymentId = `PAY_${Date.now()}_${bookingId.substring(0, 8)}`;
    
    // Generate QR code data using the secure RPC function
    const { data: qrData, error: qrError } = await supabaseClient
      .rpc('generate_booking_qr', { booking_id: bookingId });

    if (qrError) {
      console.error('QR generation error:', qrError);
      throw new Error('Failed to generate QR code');
    }

    // Update payment status and QR code using the secure function
    // This bypasses RLS and can only be called by the service role
    const { data: updateResult, error: updateError } = await supabaseClient
      .rpc('update_booking_payment', {
        _booking_id: bookingId,
        _payment_id: paymentId,
        _payment_method: paymentMethod,
        _payment_status: 'completed',
        _qr_code: qrData
      });

    if (updateError) {
      console.error('Payment update error:', updateError);
      throw new Error('Failed to update payment status');
    }

    if (!updateResult) {
      throw new Error('Booking not found or update failed');
    }

    console.log(`Payment processed successfully for booking ${bookingId}`);

    return new Response(
      JSON.stringify({
        success: true,
        payment_id: paymentId,
        qr_code: qrData,
        message: 'Payment processed successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in process-payment function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
