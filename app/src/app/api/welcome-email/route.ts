export const dynamic = 'force-dynamic';
import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const getResend = () => new Resend(process.env.RESEND_API_KEY ?? 'placeholder');

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const { data, error } = await getResend().emails.send({
      from: 'Kazi Manufacturing <hello@kazimanufacturing.com>',
      to: email,
      subject: 'Welcome to Kazi Manufacturing',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0;padding:0;font-family:'Georgia',serif;background:#EBF3EC;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="padding:48px 24px;">
                <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #C2D6C6;">
                  <tr>
                    <td style="padding:40px 48px 32px;text-align:center;border-bottom:1px solid #D6E6D8;">
                      <p style="margin:0;font-family:'Cinzel',Georgia,serif;font-size:18px;letter-spacing:0.3em;color:#1B3D2A;text-transform:uppercase;">
                        Kazi Manufacturing
                      </p>
                      <p style="margin:8px 0 0;font-size:12px;color:#7A9B82;letter-spacing:0.1em;">
                        Sustainable Garment Manufacturing
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:40px 48px;">
                      <h2 style="margin:0 0 16px;font-family:'Cinzel',Georgia,serif;font-size:22px;font-weight:400;color:#1B3D2A;">
                        Welcome, ${name || 'there'}
                      </h2>
                      <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#4D6B55;">
                        Your account has been created. We&rsquo;re delighted to have you join us.
                      </p>
                      <div style="border-left:2px solid #3A7D44;padding:16px 20px;margin:24px 0;background:#EBF3EC;">
                        <p style="margin:0;font-size:13px;color:#4D6B55;line-height:1.7;">
                          You can now request quotes, track orders, and manage your production schedule from your dashboard.
                        </p>
                      </div>
                      <div style="text-align:center;margin:36px 0;">
                        <a href="${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/dashboard"
                           style="display:inline-block;background:#1B3D2A;color:#EBF3EC;text-decoration:none;padding:14px 36px;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;">
                          Go to Dashboard
                        </a>
                      </div>
                      <p style="margin:24px 0 0;font-size:13px;color:#7A9B82;line-height:1.6;">
                        Have a question? Reply to this email and our team will be happy to help.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:24px 48px;text-align:center;border-top:1px solid #D6E6D8;">
                      <p style="margin:0;font-size:12px;color:#7A9B82;letter-spacing:0.05em;">
                        © 2026 Kazi Manufacturing Ltd &nbsp;·&nbsp; Sustainable garment manufacturing from Bangladesh
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'Failed to send welcome email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, messageId: data?.id });
  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
