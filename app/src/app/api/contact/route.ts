export const dynamic = 'force-dynamic';
import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const getResend = () => new Resend(process.env.RESEND_API_KEY ?? 'placeholder');

export async function POST(request: Request) {
  try {
    const { name, email, company, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email and message are required' }, { status: 400 });
    }

    const { error } = await getResend().emails.send({
      from: 'Sukkha Citta <hello@sukkhacit ta.com>',
      to: process.env.CONTACT_EMAIL ?? 'hello@sukkhacit ta.com',
      replyTo: email,
      subject: `New enquiry from ${name}${company ? ` (${company})` : ''}`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
        <p><strong>Message:</strong></p>
        <p style="white-space:pre-wrap">${message}</p>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Contact error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
