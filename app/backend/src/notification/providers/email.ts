import { render } from "@react-email/render";
import * as nodemailer from "nodemailer";
import type { Env } from "@/env.js";
import { logger as rawLogger } from "@/logger.js";

const logger = rawLogger.child({
  module: "email-notifier",
});

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

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export class EmailNotifier {
  protected transporter: nodemailer.Transporter;
  protected config: EmailConfig;

  private constructor(config: EmailConfig) {
    this.config = config;
    this.transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: config.smtp.auth.user ? config.smtp.auth : undefined,
    });
  }

  /**
   * Send an email
   *
   * Will not throw.
   * @returns true if email is sent successfully, false otherwise
   */
  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: this.config.from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
      logger.info(
        {
          emailOptions: {
            to: options.to,
            subject: options.subject,
          },
        },
        "Sent email",
      );
      return true;
    } catch (error) {
      logger.error(
        {
          err: error,
          emailOptions: {
            to: options.to,
            subject: options.subject,
          },
        },
        "Failed to send email",
      );
      return false;
    }
  }

  static createFromEnv(env: Env): EmailNotifier | null {
    if (!env.EMAIL_NOTIFICATION_ENABLED) {
      return null;
    }
    const config = {
      from: env.EMAIL_FROM,
      smtp: {
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      },
    };
    return new EmailNotifier(config);
  }

  static async renderEmailTemplate<T>(
    component: React.FunctionComponent<T>,
    props: T,
  ): Promise<{
    html: string;
    text: string;
  }> {
    const emailComponent = await component(props);
    return {
      html: await render(emailComponent),
      text: await render(emailComponent, { plainText: true }),
    };
  }
}
