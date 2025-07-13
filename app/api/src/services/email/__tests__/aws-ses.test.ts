import { describe, test, expect, vi, beforeEach } from 'vitest';
import { AwsSesEmailService } from '../aws-ses.js';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

// Mock AWS SDK
vi.mock('@aws-sdk/client-ses', () => ({
  SESClient: vi.fn(),
  SendEmailCommand: vi.fn(),
}));

describe('AwsSesEmailService', () => {
  let emailService: AwsSesEmailService;
  let mockSesClient: any;
  let mockSend: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockSend = vi.fn().mockResolvedValue({ MessageId: 'test-message-id' });
    mockSesClient = {
      send: mockSend,
    };
    
    (SESClient as any).mockImplementation(() => mockSesClient);
    (SendEmailCommand as any).mockImplementation((params) => params);

    emailService = new AwsSesEmailService({
      region: 'us-east-1',
      accessKeyId: 'test-key',
      secretAccessKey: 'test-secret',
      fromEmail: 'test@example.com',
    });
  });

  test('should initialize SES client with correct configuration', () => {
    expect(SESClient).toHaveBeenCalledWith({
      region: 'us-east-1',
      credentials: {
        accessKeyId: 'test-key',
        secretAccessKey: 'test-secret',
      },
    });
  });

  test('should send email with correct parameters', async () => {
    const emailParams = {
      to: 'recipient@example.com',
      subject: 'Test Subject',
      html: '<p>Test HTML content</p>',
      text: 'Test text content',
    };

    await emailService.sendEmail(emailParams);

    expect(mockSend).toHaveBeenCalledWith({
      Source: 'test@example.com',
      Destination: {
        ToAddresses: ['recipient@example.com'],
      },
      Message: {
        Subject: {
          Data: 'Test Subject',
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: '<p>Test HTML content</p>',
            Charset: 'UTF-8',
          },
          Text: {
            Data: 'Test text content',
            Charset: 'UTF-8',
          },
        },
      },
      ReplyToAddresses: undefined,
    });
  });

  test('should handle array of recipients', async () => {
    const emailParams = {
      to: ['recipient1@example.com', 'recipient2@example.com'],
      subject: 'Test Subject',
      html: '<p>Test HTML content</p>',
    };

    await emailService.sendEmail(emailParams);

    expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
      Destination: {
        ToAddresses: ['recipient1@example.com', 'recipient2@example.com'],
      },
    }));
  });

  test('should use custom from email when provided', async () => {
    const emailParams = {
      to: 'recipient@example.com',
      subject: 'Test Subject',
      html: '<p>Test HTML content</p>',
      from: 'custom@example.com',
    };

    await emailService.sendEmail(emailParams);

    expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
      Source: 'custom@example.com',
    }));
  });

  test('should include reply-to address when provided', async () => {
    const emailParams = {
      to: 'recipient@example.com',
      subject: 'Test Subject',
      html: '<p>Test HTML content</p>',
      replyTo: 'reply-to@example.com',
    };

    await emailService.sendEmail(emailParams);

    expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({
      ReplyToAddresses: ['reply-to@example.com'],
    }));
  });

  test('should handle SES errors gracefully', async () => {
    const error = new Error('SES Error: Invalid credentials');
    mockSend.mockRejectedValue(error);

    const emailParams = {
      to: 'recipient@example.com',
      subject: 'Test Subject',
      html: '<p>Test HTML content</p>',
    };

    await expect(emailService.sendEmail(emailParams)).rejects.toThrow(
      'Email sending failed: SES Error: Invalid credentials'
    );
  });

  test('should handle network errors', async () => {
    const error = new Error('Network timeout');
    mockSend.mockRejectedValue(error);

    const emailParams = {
      to: 'recipient@example.com',
      subject: 'Test Subject',
      html: '<p>Test HTML content</p>',
    };

    await expect(emailService.sendEmail(emailParams)).rejects.toThrow(
      'Email sending failed: Network timeout'
    );
  });
});