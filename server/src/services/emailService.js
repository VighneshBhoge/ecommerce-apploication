import { Resend } from "resend";

const getResend = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.startsWith("re_xxx")) {
    return null;
  }
  return new Resend(apiKey);
};

export async function sendOrderConfirmation(user, order) {
  try {
    const resend = getResend();
    if (!resend) {
      console.log(`[Email Mock] Order confirmation for ${user.email} (Order #${order.id})`);
      return;
    }

    await resend.emails.send({
      from: process.env.EMAIL_FROM || "orders@yourstore.com",
      to: user.email,
      subject: `Order Confirmed — #${order.id}`,
      html: `
        <h1>Hi ${user.name}!</h1>
        <p>Your order has been placed successfully.</p>
        <p><strong>Order ID:</strong> ${order.id}</p>
        <p><strong>Total Amount:</strong> ₹${(order.total / 100).toFixed(2)}</p>
        <p>Status: ${order.status}</p>
      `,
    });
  } catch (err) {
    console.error("Failed to send order confirmation email:", err.message);
  }
}

export async function sendPasswordResetOTP(user, otp) {
  try {
    const resend = getResend();
    if (!resend) {
      console.log(`[Email Mock] Password reset OTP for ${user.email}: ${otp}`);
      return;
    }

    await resend.emails.send({
      from: process.env.EMAIL_FROM || "noreply@yourstore.com",
      to: user.email,
      subject: "Password Reset OTP",
      html: `<p>Hi ${user.name},</p><p>Your OTP for password reset is: <strong>${otp}</strong>. Valid for 10 minutes.</p>`,
    });
  } catch (err) {
    console.error("Failed to send OTP email:", err.message);
  }
}
