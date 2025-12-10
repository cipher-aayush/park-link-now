import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

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

    // Validate input with Zod
    const paymentRequestSchema = z.object({
      bookingId: z.string().uuid('Invalid booking ID format'),
      paymentMethod: z.enum(['upi', 'card', 'qr'], {
        errorMap: () => ({ message: 'Payment method must be upi, card, or qr' })
      })
    });

    const body = await req.json();
    const validation = paymentRequestSchema.safeParse(body);

    if (!validation.success) {
      console.error('Validation error:', validation.error.errors);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid request data',
          details: validation.error.errors[0].message
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { bookingId, paymentMethod } = validation.data;
    
    console.log(`Processing payment for booking ${bookingId}, user ${user.id}, method: ${paymentMethod}`);

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

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate payment ID
    const paymentId = `PAY_${Date.now()}_${bookingId.substring(0, 8)}`;
    
    // Update booking with payment status using service role (bypasses RLS)
    const { data: updatedBooking, error: updateError } = await supabaseClient
      .from('bookings')
      .update({
        payment_status: 'completed',
        booking_status: 'confirmed'
      })
      .eq('id', bookingId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Payment update error:', updateError);
      throw new Error('Failed to update payment status');
    }

    console.log(`Payment processed successfully for booking ${bookingId}`);

    return new Response(
      JSON.stringify({
        success: true,
        payment_id: paymentId,
        booking: updatedBooking,
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
