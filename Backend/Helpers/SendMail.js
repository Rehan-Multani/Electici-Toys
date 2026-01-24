import nodemailer from "nodemailer";

export const sendOTPEmail = async (to, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",   // ya apna SMTP
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,   // your email
        pass: process.env.EMAIL_PASS,   // app password
      },
    });

    const mailOptions = {
      from: `"ElectriciToys" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Verify Your Account - OTP",
      html: `
        <h3>Account Verification</h3>
        <p>Your OTP is:</p>
        <h2>${otp}</h2>
        <p>This OTP is valid for 10 minutes</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("OTP Email Sent Successfully");

  } catch (error) {
    console.log("Email Error:", error);
  }
};

export const sendContactEmail = async (adminEmail, contactData) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"ElectriciToys Contact" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `New Contact Transmission from ${contactData.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #C78023; text-transform: uppercase;">New Transmission Received</h2>
          <p>You have received a new message from the contact form on your website.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <div style="margin-bottom: 10px;">
            <strong>Full Name:</strong> ${contactData.name}
          </div>
          <div style="margin-bottom: 10px;">
            <strong>Email Address:</strong> ${contactData.email}
          </div>
          <div style="margin-bottom: 20px;">
            <strong>Message:</strong>
            <p style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 10px; font-style: italic;">
              ${contactData.message}
            </p>
          </div>
          <p style="font-size: 12px; color: #888;">This email was sent from the Electrici-Toys contact form.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Contact Email Sent Successfully to Admin");
    return true;
  } catch (error) {
    console.log("Contact Email Error:", error);
    throw error;
  }
};
