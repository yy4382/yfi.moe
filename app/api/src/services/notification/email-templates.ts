import type { EmailTemplateData } from "../email/types.js";

export function createAdminNotificationTemplate(data: EmailTemplateData): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `New comment on ${data.siteName || "your blog"}: ${data.commentPath}`;
  
  const commentUrl = `${data.commentUrl}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">New Comment Notification</h2>
      
      <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Path:</strong> ${data.commentPath}</p>
        <p><strong>Author:</strong> ${data.commentAuthor}</p>
      </div>
      
      <div style="background: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Comment:</strong></p>
        <div style="margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 4px;">
          ${data.commentContent}
        </div>
      </div>
      
      <div style="margin: 30px 0;">
        <a href="${commentUrl}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          View Comment
        </a>
      </div>
      
      <hr style="border: none; height: 1px; background: #ddd; margin: 30px 0;">
      <p style="color: #666; font-size: 12px;">
        This is an automated notification from ${data.siteName || "your blog"}.
      </p>
    </div>
  `;

  const text = `
New Comment Notification

Path: ${data.commentPath}
Author: ${data.commentAuthor}

Comment:
${data.commentContent}

View comment: ${commentUrl}

This is an automated notification from ${data.siteName || "your blog"}.
  `.trim();

  return { subject, html, text };
}

export function createReplyNotificationTemplate(data: EmailTemplateData): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `New reply to your comment on ${data.siteName || "our blog"}`;
  
  const commentUrl = `${data.commentUrl}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">Someone replied to your comment</h2>
      
      <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Path:</strong> ${data.commentPath}</p>
        <p><strong>Reply from:</strong> ${data.commentAuthor}</p>
      </div>
      
      <div style="background: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Reply:</strong></p>
        <div style="margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 4px;">
          ${data.commentContent}
        </div>
      </div>
      
      <div style="margin: 30px 0;">
        <a href="${commentUrl}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          View Reply
        </a>
      </div>
      
      <hr style="border: none; height: 1px; background: #ddd; margin: 30px 0;">
      <p style="color: #666; font-size: 12px;">
        This is an automated notification from ${data.siteName || "our blog"}.
      </p>
    </div>
  `;

  const text = `
New Reply Notification

Someone replied to your comment on ${data.commentPath}

Reply from: ${data.commentAuthor}

Reply:
${data.commentContent}

View reply: ${commentUrl}

This is an automated notification from ${data.siteName || "our blog"}.
  `.trim();

  return { subject, html, text };
}