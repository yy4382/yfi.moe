# Notification Service

The backend now includes a comprehensive notification service that supports multiple channels and can be easily extended.

## Architecture

- **Notification Service**: Central service that manages multiple notification providers
- **Providers**: Individual implementations for different notification channels
- **Plugin System**: Easy integration with the Hono app

## Current Providers

### Email Provider (EmailNotificationProvider)

- Uses nodemailer with SMTP (AWS SES compatible)
- Templates for different notification types
- Configurable via environment variables

## Usage

### Environment Configuration

```bash
# Email notifications (AWS SES via SMTP)
EMAIL_NOTIFICATION_ENABLED=true
EMAIL_FROM=noreply@yfi.moe
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=YOUR_AWS_SES_SMTP_USERNAME
SMTP_PASS=YOUR_AWS_SES_SMTP_PASSWORD
```

### In Code

```typescript
// Get notification service from context
const notification = c.get("notification");

// Send notification
await notification.send({
  type: "comment_reply",
  recipient: "user@example.com",
  data: {
    postSlug: "hello-world",
    postTitle: "Hello World",
    commentContent: "Great post!",
    authorName: "John Doe",
  },
});

// Send batch notifications
await notification.sendBatch([
  {
    /* notification 1 */
  },
  {
    /* notification 2 */
  },
]);
```

## Adding New Providers

Create a new provider by implementing the `NotificationProvider` interface:

```typescript
class DiscordNotificationProvider implements NotificationProvider {
  name = "discord";

  isEnabled(): boolean {
    return !!process.env.DISCORD_WEBHOOK_URL;
  }

  async send(notification: NotificationPayload): Promise<void> {
    // Implementation
  }
}
```

Then register it in the notification plugin.

## Notification Types

- `comment_reply`: When someone replies to a user's comment
- `new_comment`: When a new comment is posted on a user's post
- `comment_mention`: When someone is mentioned in a comment
- `admin_new_comment`: When a new comment requires moderation
