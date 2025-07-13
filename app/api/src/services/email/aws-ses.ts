import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import type { EmailService, SendEmailParams } from "./types.js";

export class AwsSesEmailService implements EmailService {
  private ses: SESClient;
  private defaultFrom: string;

  constructor(config: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    fromEmail: string;
  }) {
    this.ses = new SESClient({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
    this.defaultFrom = config.fromEmail;
  }

  async sendEmail(params: SendEmailParams): Promise<void> {
    const { to, subject, html, text, from, replyTo } = params;

    const recipients = Array.isArray(to) ? to : [to];
    
    const command = new SendEmailCommand({
      Source: from || this.defaultFrom,
      Destination: {
        ToAddresses: recipients,
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: "UTF-8",
        },
        Body: {
          Html: {
            Data: html,
            Charset: "UTF-8",
          },
          ...(text && {
            Text: {
              Data: text,
              Charset: "UTF-8",
            },
          }),
        },
      },
      ReplyToAddresses: replyTo ? [replyTo] : undefined,
    });

    try {
      await this.ses.send(command);
    } catch (error) {
      console.error("Failed to send email via SES:", error);
      throw new Error(`Email sending failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
}