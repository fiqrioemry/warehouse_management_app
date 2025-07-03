import transporter from "../config/nodemailer";

async function sendEmail(to: string, otp: string): Promise<void> {
  const mailOptions = {
    from: `"No Reply" <${process.env.MAIL_USER}>`,
    to,
    subject: "Your OTP Code",
    html: `<p>Your OTP code is <b>${otp}</b>. It will expire in 10 minutes.</p>`,
  };

  await transporter.sendMail(mailOptions);
}

export default sendEmail;
