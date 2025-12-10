import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingEmailRequest {
  bookingId: string;
  userEmail: string;
  userName: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Send booking confirmation function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookingId, userEmail, userName }: BookingEmailRequest = await req.json();
    console.log(`Processing email for booking: ${bookingId}, email: ${userEmail}`);

    // Get Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch booking details with location
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        *,
        parking_locations (
          name,
          address,
          city,
          state,
          price_per_hour
        )
      `)
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      console.error("Error fetching booking:", bookingError);
      throw new Error("Booking not found");
    }

    console.log("Booking details fetched:", booking);

    const location = booking.parking_locations;
    const bookingDate = new Date(booking.booking_date).toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Booking Confirmation</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 30px; text-align: center; color: white; }
          .header h1 { margin: 0; font-size: 28px; }
          .header p { margin: 10px 0 0; opacity: 0.9; }
          .content { padding: 30px; }
          .success-badge { background: #dcfce7; color: #166534; padding: 12px 24px; border-radius: 50px; display: inline-block; font-weight: 600; margin-bottom: 20px; }
          .booking-details { background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { color: #64748b; font-size: 14px; }
          .detail-value { font-weight: 600; color: #1e293b; }
          .total-row { background: #1e293b; color: white; padding: 15px 20px; border-radius: 8px; display: flex; justify-content: space-between; margin-top: 15px; }
          .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 12px; }
          .cta-button { background: #3b82f6; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; display: inline-block; margin-top: 20px; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚗 ParkEase</h1>
            <p>Your Smart Parking Solution</p>
          </div>
          <div class="content">
            <div class="success-badge">✓ Booking Confirmed</div>
            <h2>Hello ${userName || "Valued Customer"}!</h2>
            <p>Your parking spot has been successfully booked. Here are your booking details:</p>
            
            <div class="booking-details">
              <div class="detail-row">
                <span class="detail-label">Booking ID</span>
                <span class="detail-value">${bookingId.substring(0, 8).toUpperCase()}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Location</span>
                <span class="detail-value">${location?.name || "N/A"}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Address</span>
                <span class="detail-value">${location?.address}, ${location?.city}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date</span>
                <span class="detail-value">${bookingDate}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Time</span>
                <span class="detail-value">${booking.start_time} - ${booking.end_time}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Vehicle Number</span>
                <span class="detail-value">${booking.vehicle_number}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Vehicle Type</span>
                <span class="detail-value">${booking.vehicle_type?.toUpperCase() || "CAR"}</span>
              </div>
            </div>
            
            <div class="total-row">
              <span>Total Amount Paid</span>
              <span>₹${booking.total_amount}</span>
            </div>
            
            <p style="margin-top: 20px; color: #64748b;">
              Please show this confirmation at the parking entrance. Have a safe journey!
            </p>
          </div>
          <div class="footer">
            <p>Thank you for choosing ParkEase</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "ParkEase <onboarding@resend.dev>",
      to: [userEmail],
      subject: `Booking Confirmed - ${location?.name || "Parking"} | ${bookingDate}`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-booking-confirmation function:", error);
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
