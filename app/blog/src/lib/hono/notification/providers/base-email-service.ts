import * as nodemailer from "nodemailer";
import { render } from "@react-email/render";

export interface EmailConfig {
  from: string;
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
}

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export abstract class BaseEmailService {
  protected transporter: nodemailer.Transporter;
  protected config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
    this.transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: config.smtp.auth.user ? config.smtp.auth : undefined,
    });
  }

  isEnabled(): boolean {
    return !!this.config.smtp.host && !!this.config.smtp.port;
  }

  protected async renderEmailComponent(
    component: React.ReactElement,
  ): Promise<EmailContent> {
    const html = await render(component);
    const text = await render(component, { plainText: true });

    return {
      subject: "", // Will be set by subclasses
      html,
      text,
    };
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    if (!this.isEnabled()) {
      throw new Error("Email service is not configured");
    }

    try {
      await this.transporter.sendMail({
        from: this.config.from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
      console.log(`Email sent to ${options.to}, subject: ${options.subject}`);
    } catch (error) {
      console.error("Failed to send email:", error);
      throw error;
    }
  }

  async sendArbitraryEmail(
    args: Omit<Parameters<typeof this.transporter.sendMail>[0], "from">,
  ): Promise<void> {
    if (!this.isEnabled()) {
      throw new Error("Email service is not configured");
    }

    await this.transporter.sendMail({
      from: this.config.from,
      ...args,
    });
  }
}
