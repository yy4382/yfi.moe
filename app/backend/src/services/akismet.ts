import { AkismetClient } from "akismet-api";
import { logger as rawLogger } from "@/logger.js";

const logger = rawLogger.child({
  module: "akismet",
});

export interface AkismetComment {
  content: string;
  userIp: string;
  userAgent?: string;
  author?: string;
  authorEmail?: string;
  permalink: string;
}

function getLogComment(comment: AkismetComment) {
  return {
    content: comment.content,
    authorEmail: comment.authorEmail,
  };
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
      logger.info(
        {
          result,
          comment: getLogComment(comment),
        },
        "Called Akismet checkSpam",
      );
      return result;
    } catch (error) {
      logger.error(
        {
          err: error,
          comment: getLogComment(comment),
        },
        "Akismet checkSpam error",
      );
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
      logger.info(
        { comment: getLogComment(comment) },
        "Called Akismet submitSpam",
      );
    } catch (error) {
      logger.error(
        {
          err: error,
          comment: getLogComment(comment),
        },
        "Akismet submitSpam error",
      );
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

      logger.info(
        { comment: getLogComment(comment) },
        "Called Akismet submitHam",
      );
    } catch (error) {
      logger.error(
        {
          err: error,
          comment: getLogComment(comment),
        },
        "Akismet submitHam error",
      );
    }
  }
}
