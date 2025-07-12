export interface EmailConfig {
  provider: 'aws-ses';
  aws: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    fromEmail: string;
  };
  adminEmail: string;
  siteName: string;
  siteUrl: string;
  enabled: boolean;
}

export function getEmailConfig(): EmailConfig {
  const enabled = process.env.EMAIL_ENABLED === 'true';
  
  if (!enabled) {
    return {
      provider: 'aws-ses',
      aws: {
        region: '',
        accessKeyId: '',
        secretAccessKey: '',
        fromEmail: '',
      },
      adminEmail: '',
      siteName: 'Your Blog',
      siteUrl: 'https://yfi.moe',
      enabled: false,
    };
  }

  const requiredEnvVars = [
    'AWS_REGION',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_SES_FROM_EMAIL',
    'ADMIN_EMAIL',
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

  return {
    provider: 'aws-ses',
    aws: {
      region: process.env.AWS_REGION!,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      fromEmail: process.env.AWS_SES_FROM_EMAIL!,
    },
    adminEmail: process.env.ADMIN_EMAIL!,
    siteName: process.env.SITE_NAME || 'Your Blog',
    siteUrl: process.env.SITE_URL || 'https://yfi.moe',
    enabled: true,
  };
}