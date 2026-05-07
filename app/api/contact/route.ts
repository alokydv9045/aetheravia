import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { sanitizeInput, createRateLimiter } from '@/lib/security';

// Rate limiter: 3 contact requests per hour per email
const contactRateLimiter = createRateLimiter(3, 60 * 60 * 1000);

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const { name, email, phone, subject, message } = rawBody;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 });
    }

    // Rate limiting check
    const rateLimit = contactRateLimiter.check(email);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' }, 
        { status: 429 }
      );
    }

    // Sanitize input to prevent injection in email bodies
    const sanitizedMessage = sanitizeInput(message).substring(0, 5000); // Limit length
    const sanitizedName = sanitizeInput(name);
    const sanitizedSubject = sanitizeInput(subject || 'No Subject');
    const sanitizedPhone = phone ? sanitizeInput(phone).substring(0, 20) : 'Not provided';
    // Configure transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // 1. Send confirmation email to the user
    const userMailOptions = {
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: email,
      subject: `Ritual Inquiry Received: ${sanitizedSubject}`,
      html: `
        <div style="font-family: serif; color: #2D4B3C; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; padding: 40px; border-radius: 12px;">
          <h2 style="color: #2D4B3C; font-style: italic;">Greetings from AetherAvia</h2>
          <p>Dear ${sanitizedName},</p>
          <p>We have received your message regarding "<strong>${sanitizedSubject}</strong>".</p>
          <p>Our artisans are reviewing your inquiry and will connect with you shortly. Thank you for your patience.</p>
          <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 30px 0;" />
          <p style="font-size: 12px; color: #6b7280;">This is an automated confirmation. Please do not reply directly to this message.</p>
        </div>
      `,
    };

    // 2. Send notification email to the admin/support team
    const adminMailOptions = {
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || process.env.SMTP_USER,
      subject: `New Contact Form Submission: ${sanitizedSubject}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h3>New Inquiry from ${sanitizedName}</h3>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${sanitizedPhone}</p>
          <p><strong>Subject:</strong> ${sanitizedSubject}</p>
          <hr />
          <p><strong>Message:</strong></p>
          <p>${sanitizedMessage}</p>
        </div>
      `,
    };

    // Verify transporter configuration
    try {
      await transporter.verify();
    } catch (verifyError) {
      console.warn("SMTP Verification failed, please check your .env credentials. Continuing without sending...");
      // For local testing, we'll pretend it worked if SMTP isn't set up yet.
      if (!process.env.SMTP_PASS || process.env.SMTP_PASS.includes('your-app-password')) {
         return NextResponse.json({ message: 'Simulated success (SMTP not configured)' }, { status: 200 });
      }
      return NextResponse.json({ error: 'Failed to connect to email server' }, { status: 500 });
    }

    // Send both emails
    await transporter.sendMail(userMailOptions);
    await transporter.sendMail(adminMailOptions);

    return NextResponse.json({ message: 'Emails sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Contact Form API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

