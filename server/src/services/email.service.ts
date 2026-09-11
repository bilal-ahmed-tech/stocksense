import nodemailer from "nodemailer";

function getTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS,
    },
  });
}

export async function sendAlertEmail(
  to: string,
  name: string,
  symbol: string,
  condition: string,
  targetPrice: number,
  currentPrice: number
): Promise<void> {
  const transporter = getTransporter();

  await transporter.sendMail({
    from: `StockSense <${process.env.NODEMAILER_USER}>`,
    to,
    subject: `Price Alert: ${symbol} is ${condition} $${targetPrice.toFixed(2)}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #6366f1;">StockSense Alert</h2>
        <p>Hi ${name},</p>
        <p>Your price alert for <strong>${symbol}</strong> has been triggered.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; color: #6b7280;">Condition</td>
            <td style="padding: 8px; font-weight: bold;">${condition} $${targetPrice.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 8px; color: #6b7280;">Current Price</td>
            <td style="padding: 8px; font-weight: bold; color: #22c55e;">$${currentPrice.toFixed(2)}</td>
          </tr>
        </table>
        <p style="color: #6b7280; font-size: 12px;">
          This is an automated alert from StockSense.
        </p>
      </div>
    `,
  });
}

export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string
): Promise<void> {
  const transporter = getTransporter();
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `StockSense <${process.env.NODEMAILER_USER}>`,
    to,
    subject: "Verify your StockSense email",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #6366f1;">Verify your email</h2>
        <p>Hi ${name},</p>
        <p>Thanks for signing up for StockSense. Please verify your email address to enable price alerts and other email notifications.</p>
        <p style="margin: 28px 0;">
          <a href="${verifyUrl}" style="background: #4f46e5; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Verify Email
          </a>
        </p>
        <p style="color: #6b7280; font-size: 13px;">
          Or copy this link into your browser:<br />
          <a href="${verifyUrl}" style="color: #6366f1; word-break: break-all;">${verifyUrl}</a>
        </p>
        <p style="color: #6b7280; font-size: 12px;">
          This link expires in 24 hours. If you did not create an account, you can ignore this email.
        </p>
      </div>
    `,
  });
}
