export interface EmailService {
  sendEmail(params: SendEmailParams): Promise<void>;
}

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export interface EmailTemplateData {
  commentContent: string;
  commentPath: string;
  commentAuthor: string;
  commentUrl: string;
  siteName?: string;
}