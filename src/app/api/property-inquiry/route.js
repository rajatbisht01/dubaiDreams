// app/api/property-inquiry/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.SENDER_EMAIL;
const TO_EMAIL = process.env.RECIEVER_EMAIL;

export async function POST(req) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, phone, location, budget, bedrooms, message } = body;
    const supabase = await supabaseServer();

    // Validation
    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Combine firstName and lastName for the name field
    const fullName = `${firstName} ${lastName}`;
    
    // Build message with additional details
    let fullMessage = '';
    if (location) fullMessage += `Location: ${location}\n`;
    if (budget) fullMessage += `Budget: ${budget}\n`;
    if (bedrooms) fullMessage += `Bedrooms: ${bedrooms}\n`;
    if (message) fullMessage += `\nMessage:\n${message}`;

    // 1. Save to Supabase user_messages table (same as contact form)
    const { data, error } = await supabase
      .from("user_messages")
      .insert({
        property_id: null, // General inquiry, not tied to specific property
        name: fullName,
        email,
        phone,
        message: fullMessage.trim()
      })
      .select()
      .single();

    if (error) {
      console.error("[Supabase Error]", error);
      throw error;
    }

    // 2. Send email via SendGrid
    if (SENDGRID_API_KEY && FROM_EMAIL) {
      try {
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
              New Property Inquiry
            </h2>
            
            <div style="margin: 20px 0;">
              <h3 style="color: #333;">Contact Information</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Name:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;">${firstName} ${lastName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;">${phone}</td>
                </tr>
                ${location ? `
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Location:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;">${location}</td>
                </tr>
                ` : ''}
                ${budget ? `
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Budget:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;">${budget}</td>
                </tr>
                ` : ''}
                ${bedrooms ? `
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Bedrooms:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;">${bedrooms}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Message ID:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;">${data.id}</td>
                </tr>
              </table>
            </div>

            ${message ? `
            <div style="margin: 20px 0;">
              <h3 style="color: #333;">Additional Message</h3>
              <p style="background: #f5f5f5; padding: 15px; border-radius: 5px; line-height: 1.6;">
                ${message.replace(/\n/g, '<br>')}
              </p>
            </div>
            ` : ''}

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
              <p>This inquiry was submitted on ${new Date().toLocaleString()}</p>
              <p>Message saved to database with ID: ${data.id}</p>
            </div>
          </div>
        `;

        const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SENDGRID_API_KEY}`
          },
          body: JSON.stringify({
            personalizations: [
              {
                to: [{ email: TO_EMAIL }],
                subject: `New Property Inquiry from ${firstName} ${lastName}`
              }
            ],
            from: {
              email: FROM_EMAIL,
              name: 'Property Website'
            },
            reply_to: {
              email: email,
              name: fullName
            },
            content: [
              {
                type: 'text/html',
                value: emailHtml
              }
            ]
          })
        });

        if (!sendGridResponse.ok) {
          const errorText = await sendGridResponse.text();
          console.error('[SendGrid Error]', errorText);
          // Don't fail the request if email fails - data is already saved
        } else {
          console.log('✅ Property inquiry email sent successfully via SendGrid');
        }
      } catch (emailError) {
        console.error('[Email Error]', emailError);
        // Don't fail the request if email fails - data is already saved
      }
    } else {
      console.warn('⚠️ SendGrid not configured - skipping email notification');
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/property-inquiry] ", err);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}