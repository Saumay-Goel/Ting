import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!);
}

export async function sendVerificationEmail(to: string, token: string) {
  const resend = getResend();
  const link = `${process.env.APP_URL}/auth/verify?token=${token}`;
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: "Verify your email",
    html: `<h2>Welcome to Ting!</h2><p><a href="${link}">Verify my email</a></p><p>Expires in 24 hours.</p>`,
  });

  if (error) {
    console.error("Resend error:", error);
    throw new Error(`Email failed: ${error.message}`);
  }
  console.log("Email sent, id:", data?.id);
}

export async function sendWelcomeEmail(to: string, name?: string) {
  const resend = getResend();
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: "Welcome to Ting 🎉",
    html: `<h2>You're all set${name ? `, ${name}` : ""}!</h2><p>Your email is verified. Connect your AWS account to start monitoring.</p>`,
  });
  if (error) {
    console.error("Resend welcome error:", error);
  }
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const resend = getResend();
  const link = `${process.env.APP_URL}/auth/reset-password?token=${token}`;
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: "Reset your password",
    html: `<h2>Password reset</h2><p>Click to reset your password:</p><p><a href="${link}">Reset password</a></p><p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>`,
  });
  if (error) {
    console.error("Reset email error:", error);
    throw new Error(`Email failed: ${error.message}`);
  }
}
