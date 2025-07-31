import type {
  NotificationService,
  NotificationProvider,
  NotificationPayload,
} from "./types.js";

export class DefaultNotificationService implements NotificationService {
  private providers = new Map<string, NotificationProvider>();

  addProvider(provider: NotificationProvider): void {
    this.providers.set(provider.name, provider);
  }

  removeProvider(name: string): void {
    this.providers.delete(name);
  }

  async send(notification: NotificationPayload): Promise<void> {
    const enabledProviders = Array.from(this.providers.values()).filter((p) =>
      p.isEnabled(),
    );

    if (enabledProviders.length === 0) {
      console.warn("No notification providers are enabled");
      return;
    }

    const promises = enabledProviders.map((provider) => {
      return provider.send(notification).catch((error) => {
        console.error(
          `Failed to send notification via ${provider.name}:`,
          error,
        );
      });
    });

    await Promise.allSettled(promises);
  }

  async sendBatch(notifications: NotificationPayload[]): Promise<void> {
    const enabledProviders = Array.from(this.providers.values()).filter((p) =>
      p.isEnabled(),
    );

    if (enabledProviders.length === 0) {
      console.warn("No notification providers are enabled");
      return;
    }

    const promises = enabledProviders.map((provider) => {
      return Promise.allSettled(
        notifications.map((notification) =>
          provider.send(notification).catch((error) => {
            console.error(
              `Failed to send notification via ${provider.name}:`,
              error,
            );
          }),
        ),
      );
    });

    await Promise.allSettled(promises);
  }

  getEnabledProviders(): string[] {
    return Array.from(this.providers.values())
      .filter((p) => p.isEnabled())
      .map((p) => p.name);
  }
}
