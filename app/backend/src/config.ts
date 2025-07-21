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
} satisfies ConfigInput);
