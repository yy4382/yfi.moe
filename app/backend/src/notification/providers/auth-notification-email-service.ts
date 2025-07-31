import { BaseEmailService, type EmailConfig } from "./base-email-service.js";
import { NotionMagicLinkEmail } from "../templates/index.js";

export class AuthNotificationEmailService extends BaseEmailService {
  name = "auth-email-service";

  constructor(config: EmailConfig) {
    super(config);
  }

  async sendMagicLinkEmail(email: string, url: string): Promise<void> {
    if (!this.isEnabled()) {
      throw new Error("Auth email notification service is not configured");
    }

    const emailComponent = NotionMagicLinkEmail({ url });
    const { html, text } = await this.renderEmailComponent(emailComponent);

    await this.sendEmail({
      to: email,
      subject: "登录链接 - Yunfi",
      html,
      text,
    });
  }

  async sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
    if (!this.isEnabled()) {
      throw new Error("Auth email notification service is not configured");
    }

    // For now, using the magic link template for password reset
    // TODO: Create a dedicated password reset template
    const emailComponent = NotionMagicLinkEmail({ url: resetUrl });
    const { html, text } = await this.renderEmailComponent(emailComponent);

    await this.sendEmail({
      to: email,
      subject: "重置密码 - Yunfi",
      html,
      text,
    });
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    if (!this.isEnabled()) {
      throw new Error("Auth email notification service is not configured");
    }

    // Simple welcome email for now
    // TODO: Create a dedicated welcome email template
    const html = `
      <h1>欢迎来到 Yunfi！</h1>
      <p>你好 ${name}，</p>
      <p>欢迎加入 Yunfi 社区！您现在可以开始评论和参与讨论了。</p>
      <p>祝您使用愉快！</p>
    `;

    const text = `
      欢迎来到 Yunfi！
      
      你好 ${name}，
      
      欢迎加入 Yunfi 社区！您现在可以开始评论和参与讨论了。
      
      祝您使用愉快！
    `;

    await this.sendEmail({
      to: email,
      subject: "欢迎来到 Yunfi",
      html,
      text,
    });
  }
}
