import type { Env } from "@/env.js";
import { EmailNotifier } from "./providers/email.js";
import type { NotificationService } from "./types.js";

export class DefaultNotificationService implements NotificationService {
  email: EmailNotifier | null = null;
  constructor({ email }: { email: EmailNotifier | null }) {
    this.email = email;
  }

  static createFromEnv(env: Env): DefaultNotificationService {
    const emailService = EmailNotifier.createFromEnv(env);
    return new DefaultNotificationService({ email: emailService });
  }
}
