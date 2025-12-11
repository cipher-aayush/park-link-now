import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CancelBookingRequest {
  bookingId: string;
  userId: string;
  userEmail: string;
}

interface RefundResult {
  refundPercentage: number;
  refundAmount: number;
  reason: string;
}

// Calculate refund based on cancellation time
function calculateRefund(bookingDate: string, startTime: string, totalAmount: number): RefundResult {
  const now = new Date();
  const bookingDateTime = new Date(`${bookingDate}T${startTime}`);
  const hoursUntilBooking = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilBooking > 24) {
    // More than 24 hours before: 100% refund
    return {
      refundPercentage: 100,
      refundAmount: totalAmount,
      reason: "Full refund (cancelled more than 24 hours before booking)"
    };
  } else if (hoursUntilBooking > 12) {
    // 12-24 hours before: 75% refund
    return {
      refundPercentage: 75,
      refundAmount: Math.round(totalAmount * 0.75),
      reason: "75% refund (cancelled 12-24 hours before booking)"
    };
  } else if (hoursUntilBooking > 6) {
    // 6-12 hours before: 50% refund
    return {
      refundPercentage: 50,
      refundAmount: Math.round(totalAmount * 0.50),
      reason: "50% refund (cancelled 6-12 hours before booking)"
    };
  } else if (hoursUntilBooking > 2) {
    // 2-6 hours before: 25% refund
    return {
      refundPercentage: 25,
      refundAmount: Math.round(totalAmount * 0.25),
      reason: "25% refund (cancelled 2-6 hours before booking)"
    };
  } else {
    // Less than 2 hours: No refund
    return {
      refundPercentage: 0,
      refundAmount: 0,
      reason: "No refund (cancelled less than 2 hours before booking)"
    };
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookingId, userId, userEmail }: CancelBookingRequest = await req.json();

    console.log("Processing cancellation for booking:", bookingId);

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch booking details
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select(`
        *,
        parking_locations (
          name,
          address
        )
      `)
      .eq("id", bookingId)
      .eq("user_id", userId)
      .single();

    if (fetchError || !booking) {
      console.error("Booking not found:", fetchError);
      return new Response(
        JSON.stringify({ error: "Booking not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if booking can be cancelled
    if (booking.booking_status === "cancelled") {
      return new Response(
        JSON.stringify({ error: "Booking is already cancelled" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (booking.booking_status === "completed") {
      return new Response(
        JSON.stringify({ error: "Cannot cancel a completed booking" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Calculate refund
    const refund = calculateRefund(
      booking.booking_date,
      booking.start_time,
      Number(booking.total_amount)
    );

    console.log("Refund calculation:", refund);

    // Update booking status
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        booking_status: "cancelled",
        payment_status: refund.refundAmount > 0 ? "refunded" : "cancelled"
      })
      .eq("id", bookingId);

    if (updateError) {
      console.error("Failed to update booking:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to cancel booking" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send cancellation email
    if (userEmail) {
      try {
        const emailResponse = await resend.emails.send({
          from: "ParkEase <onboarding@resend.dev>",
          to: [userEmail],
          subject: "Booking Cancellation Confirmation - ParkEase",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .refund-box { background: #fff; border: 2px solid #dc2626; border-radius: 8px; padding: 20px; margin: 20px 0; }
                .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
                .highlight { color: #dc2626; font-weight: bold; }
                .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🚫 Booking Cancelled</h1>
                  <p>Your parking reservation has been cancelled</p>
                </div>
                <div class="content">
                  <h2>Cancellation Details</h2>
                  
                  <div class="detail-row">
                    <span><strong>Booking ID:</strong></span>
                    <span>${bookingId.slice(0, 8).toUpperCase()}</span>
                  </div>
                  
                  <div class="detail-row">
                    <span><strong>Location:</strong></span>
                    <span>${booking.parking_locations?.name || 'Parking Location'}</span>
                  </div>
                  
                  <div class="detail-row">
                    <span><strong>Address:</strong></span>
                    <span>${booking.parking_locations?.address || ''}</span>
                  </div>
                  
                  <div class="detail-row">
                    <span><strong>Original Date:</strong></span>
                    <span>${new Date(booking.booking_date).toLocaleDateString('en-IN', { dateStyle: 'full' })}</span>
                  </div>
                  
                  <div class="detail-row">
                    <span><strong>Time Slot:</strong></span>
                    <span>${booking.start_time} - ${booking.end_time}</span>
                  </div>
                  
                  <div class="refund-box">
                    <h3 style="margin-top: 0; color: #dc2626;">💰 Refund Information</h3>
                    
                    <div class="detail-row">
                      <span><strong>Original Amount:</strong></span>
                      <span>₹${booking.total_amount}</span>
                    </div>
                    
                    <div class="detail-row">
                      <span><strong>Refund Percentage:</strong></span>
                      <span class="highlight">${refund.refundPercentage}%</span>
                    </div>
                    
                    <div class="detail-row" style="border-bottom: none;">
                      <span><strong>Refund Amount:</strong></span>
                      <span style="font-size: 24px; color: #16a34a;">₹${refund.refundAmount}</span>
                    </div>
                    
                    <p style="margin-bottom: 0; font-size: 14px; color: #6b7280;">
                      <em>${refund.reason}</em>
                    </p>
                  </div>
                  
                  ${refund.refundAmount > 0 ? `
                    <p style="background: #dcfce7; padding: 15px; border-radius: 8px;">
                      ✅ Your refund of <strong>₹${refund.refundAmount}</strong> will be processed within 2-3 business days to your original payment method.
                    </p>
                  ` : `
                    <p style="background: #fef2f2; padding: 15px; border-radius: 8px;">
                      ⚠️ Unfortunately, no refund is available for cancellations made less than 2 hours before the booking time.
                    </p>
                  `}
                  
                  <h3>Refund Policy</h3>
                  <ul style="color: #6b7280;">
                    <li>More than 24 hours before: 100% refund</li>
                    <li>12-24 hours before: 75% refund</li>
                    <li>6-12 hours before: 50% refund</li>
                    <li>2-6 hours before: 25% refund</li>
                    <li>Less than 2 hours: No refund</li>
                  </ul>
                  
                  <div class="footer">
                    <p>Need help? Contact us at support@parkease.com</p>
                    <p>Thank you for using ParkEase!</p>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `,
        });

        console.log("Cancellation email sent:", emailResponse);
      } catch (emailError) {
        console.error("Failed to send cancellation email:", emailError);
        // Don't fail the cancellation if email fails
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Booking cancelled successfully",
        refund: refund
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in cancel-booking function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
