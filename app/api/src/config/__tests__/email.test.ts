import { describe, test, expect, beforeEach, afterAll, vi } from 'vitest';
import { getEmailConfig } from '../email.js';

describe('Email Config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('should return disabled config when EMAIL_ENABLED is not true', () => {
    delete process.env.EMAIL_ENABLED;
    
    const config = getEmailConfig();
    
    expect(config.enabled).toBe(false);
    expect(config.adminEmail).toBe('');
    expect(config.aws.region).toBe('');
  });

  test('should return enabled config when all env vars are provided', () => {
    process.env.EMAIL_ENABLED = 'true';
    process.env.AWS_REGION = 'us-east-1';
    process.env.AWS_ACCESS_KEY_ID = 'test-key';
    process.env.AWS_SECRET_ACCESS_KEY = 'test-secret';
    process.env.AWS_SES_FROM_EMAIL = 'from@example.com';
    process.env.ADMIN_EMAIL = 'admin@example.com';
    process.env.SITE_NAME = 'My Test Blog';
    process.env.SITE_URL = 'https://mytest.com';

    const config = getEmailConfig();

    expect(config.enabled).toBe(true);
    expect(config.aws.region).toBe('us-east-1');
    expect(config.aws.accessKeyId).toBe('test-key');
    expect(config.aws.secretAccessKey).toBe('test-secret');
    expect(config.aws.fromEmail).toBe('from@example.com');
    expect(config.adminEmail).toBe('admin@example.com');
    expect(config.siteName).toBe('My Test Blog');
    expect(config.siteUrl).toBe('https://mytest.com');
  });

  test('should use default values for optional env vars', () => {
    process.env.EMAIL_ENABLED = 'true';
    process.env.AWS_REGION = 'us-east-1';
    process.env.AWS_ACCESS_KEY_ID = 'test-key';
    process.env.AWS_SECRET_ACCESS_KEY = 'test-secret';
    process.env.AWS_SES_FROM_EMAIL = 'from@example.com';
    process.env.ADMIN_EMAIL = 'admin@example.com';
    // SITE_NAME and SITE_URL not provided

    const config = getEmailConfig();

    expect(config.siteName).toBe('Your Blog');
    expect(config.siteUrl).toBe('https://yfi.moe');
  });

  test('should throw error when required env vars are missing', () => {
    process.env.EMAIL_ENABLED = 'true';
    process.env.AWS_REGION = 'us-east-1';
    // Missing AWS_ACCESS_KEY_ID and others

    expect(() => getEmailConfig()).toThrow('Missing required environment variable: AWS_ACCESS_KEY_ID');
  });
});