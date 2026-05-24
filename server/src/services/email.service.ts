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