import {BindingKey} from '@loopback/context';
import * as nodemailer from 'nodemailer';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // Use Gmail SMTP service
      auth: {
        user: process.env.GMAIL_USER || 'batcrew38@gmail.com', // Your Gmail address
        pass: process.env.GMAIL_APP_PASSWORD || 'dzte zimh fvjn olfj', // App Password for Gmail
      },
    });
  }

  async sendEmail(to: string, subject: string, text: string): Promise<void> {
    const mailOptions = {
      from: process.env.GMAIL_USER, // Sender's email address
      to: to,
      subject: subject,
      text: text,
    };

    await this.transporter.sendMail(mailOptions);
  }
}

export const EMAIL_SERVICE = BindingKey.create<EmailService>('services.EmailService');
