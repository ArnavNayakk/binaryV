import nodemailer from "nodemailer";
import { convert } from "html-to-text";

class Email {
  constructor(user) {
    this.to = user.email;
    this.firstName = user?.name?.split(" ")[0] || "User";
    this.from = `BinaryV <${process.env.EMAIL_USERNAME}>`;
  }

  // Transport (Production-ready structure)
  newTransport() {
    if (process.env.NODE_ENV === "production") {
      // Use Resend / Sendgrid / SES in production
      return nodemailer.createTransport({
        service: "SendGrid",
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    //  Development mode (Gmail)
    return nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Generic send
  async send(subject, message, email = this.to) {
    const mailOptions = {
      from: this.from,
      to: email,
      subject,
      html: message,
      text: convert(message),
    };

    try {
      console.log(" Sending email...");
      await this.newTransport().sendMail(mailOptions);
      console.log(" Email sent successfully");
    } catch (err) {
      console.error(" Email send failed:", err.message);
      throw new Error("Failed to send email");
    }
  }

  // Welcome Email
  async sendWelcome() {
    const message = `
      <h1>Welcome to BinaryV</h1>
      <p>Hi ${this.firstName},</p>
      <p>Thank you for joining PlantV! We're excited to have you.</p>
    `;
    await this.send("Welcome to BinaryV", message);
  }

  // OTP Email
  async sendOtp(otp) {
    const message = `
      <h2>Your OTP: <strong>${otp}</strong></h2>
      <p>This OTP is valid for 5 minutes.</p>
    `;
    await this.send("Your BinaryV OTP (Valid for 5 min)", message);
  }

  // Password Reset Email
  async sendPasswordReset(otp) {
    const message = `
      <h1>Password Reset Request</h1>
      <p>Hi ${this.firstName},</p>
      <p>Use this OTP to reset your password:</p>
      <h2>${otp}</h2>
      <p>Valid for 10 minutes.</p>
    `;
    await this.send("BinaryV Password Reset OTP", message);
  }

  // Marketing Email
  async sendMarketing(subject, htmlContent) {
    await this.send(subject, htmlContent);
  }
}

export default Email;
