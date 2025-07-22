import { z } from "zod";

const configSchema = z.object({
  appUrl: z.url(),
  trustedUrls: z.preprocess(
    (val) => z.string().parse(val).split(","),
    z.array(z.url()),
  ),
  port: z.coerce.number().default(3000),
  betterAuthToken: z.string(),

  dbFileName: z.string(),

  githubClientId: z.string(),
  githubClientSecret: z.string(),

  emailNotification: z
    .object({
      enabled: z.coerce.boolean().default(false),
      from: z.email(),
      smtp: z.object({
        host: z.string(),
        port: z.coerce.number().default(587),
        secure: z.coerce.boolean().default(false),
        auth: z.object({
          user: z.string(),
          pass: z.string(),
        }),
      }),
    })
    .optional(),
});

type ConfigInput = z.input<typeof configSchema>;
type Config = z.infer<typeof configSchema>;

export const config = configSchema.parse({
  appUrl: process.env.APP_URL!,
  trustedUrls: process.env.TRUSTED_URLS!,
  port: process.env.PORT!,
  betterAuthToken: process.env.BETTER_AUTH_SECRET!,

  dbFileName: process.env.DB_FILE_NAME!,

  githubClientId: process.env.GITHUB_CLIENT_ID!,
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET!,

  emailNotification:
    process.env.EMAIL_NOTIFICATION_ENABLED === "true"
      ? {
          enabled: true,
          from: process.env.EMAIL_FROM!,
          smtp: {
            host: process.env.SMTP_HOST!,
            port: process.env.SMTP_PORT!,
            secure: process.env.SMTP_SECURE === "true",
            auth: {
              user: process.env.SMTP_USER!,
              pass: process.env.SMTP_PASS!,
            },
          },
        }
      : undefined,
} satisfies ConfigInput);
