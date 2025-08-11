import { AkismetClient } from "akismet-api";

export interface AkismetComment {
  content: string;
  userIp: string;
  userAgent: string;
  author?: string;
  authorEmail?: string;
  permalink: string;
}

export interface AkismetConfig {
  key: string;
  blog: string;
  isTest?: boolean;
}

export class AkismetService {
  private akismet: AkismetClient;
  private isTest: boolean;

  constructor(config: AkismetConfig) {
    this.akismet = new AkismetClient({
      key: config.key,
      blog: config.blog,
    });
    this.isTest = config.isTest ?? false;
  }

  async checkSpam(comment: AkismetComment): Promise<boolean> {
    try {
      const result = await this.akismet.checkSpam({
        content: comment.content,
        ip: comment.userIp,
        useragent: comment.userAgent,
        name: comment.author,
        email: comment.authorEmail,
        permalink: comment.permalink,
        is_test: this.isTest,
      });
      return result;
    } catch (error) {
      console.error("Akismet checkSpam error:", error);
      return false;
    }
  }

  async submitSpam(comment: AkismetComment): Promise<void> {
    try {
      await this.akismet.submitSpam({
        content: comment.content,
        ip: comment.userIp,
        useragent: comment.userAgent,
        name: comment.author,
        email: comment.authorEmail,
        permalink: comment.permalink,
        is_test: this.isTest,
      });
    } catch (error) {
      console.error("Akismet submitSpam error:", error);
    }
  }

  async submitHam(comment: AkismetComment): Promise<void> {
    try {
      await this.akismet.submitHam({
        content: comment.content,
        ip: comment.userIp,
        useragent: comment.userAgent,
        name: comment.author,
        email: comment.authorEmail,
        permalink: comment.permalink,
        is_test: this.isTest,
      });
    } catch (error) {
      console.error("Akismet submitHam error:", error);
    }
  }
}
