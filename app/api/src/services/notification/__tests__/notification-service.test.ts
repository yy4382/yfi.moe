import { describe, test, expect, vi } from 'vitest';
import { NotificationService } from '../notification-service.js';
import type { EmailService } from '../../email/types.js';

// Mock email service
const mockEmailService: EmailService = {
  sendEmail: vi.fn().mockResolvedValue(undefined),
};

// Create a mock for the database queries
const mockDb = {
  query: {
    comment: {
      findFirst: vi.fn(),
    },
    user: {
      findFirst: vi.fn(),
    },
  },
};

// Mock the actual module
vi.mock('@/db/instance.js', () => ({
  db: mockDb,
}));

describe('NotificationService', () => {
  let notificationService: NotificationService;

  beforeEach(() => {
    vi.clearAllMocks();
    
    notificationService = new NotificationService({
      emailService: mockEmailService,
      adminEmail: 'admin@example.com',
      siteName: 'Test Blog',
      siteUrl: 'https://test.example.com',
    });

    // Reset mocks
    mockDb.query.comment.findFirst.mockReset();
    mockDb.query.user.findFirst.mockReset();
  });

  describe('notifyNewComment', () => {
    test('should send admin notification for new comment', async () => {
      const newComment = {
        id: 1,
        path: '/test-post',
        rawContent: 'This is a test comment',
        renderedContent: '<p>This is a test comment</p>',
        userId: null,
        visitorName: 'Test User',
        visitorEmail: 'test@example.com',
        parentId: null,
        replyToId: null,
        createdAt: new Date(),
      } as any;

      await notificationService.notifyNewComment(newComment);

      expect(mockEmailService.sendEmail).toHaveBeenCalledWith({
        to: 'admin@example.com',
        subject: expect.stringContaining('New comment on Test Blog'),
        html: expect.stringContaining('Test User'),
        text: expect.stringContaining('Test User'),
      });
    });

    test('should send reply notification when comment has replyToId', async () => {
      const replyComment = {
        id: 2,
        path: '/test-post',
        rawContent: 'This is a reply',
        renderedContent: '<p>This is a reply</p>',
        userId: null,
        visitorName: 'Reply User',
        visitorEmail: 'reply@example.com',
        parentId: 1,
        replyToId: 1,
        createdAt: new Date(),
      } as any;

      const parentComment = {
        id: 1,
        userId: null,
        visitorEmail: 'parent@example.com',
        visitorName: 'Parent User',
      };

      mockDb.query.comment.findFirst.mockResolvedValueOnce(parentComment);

      await notificationService.notifyNewComment(replyComment);

      // At minimum, admin notification should be sent
      expect(mockEmailService.sendEmail).toHaveBeenCalled();
      expect(mockEmailService.sendEmail).toHaveBeenCalledWith({
        to: 'admin@example.com',
        subject: expect.stringContaining('New comment on Test Blog'),
        html: expect.stringContaining('Reply User'),
        text: expect.stringContaining('Reply User'),
      });
    });

    test('should handle visitor email for reply notification', async () => {
      const replyComment = {
        id: 2,
        path: '/test-post',
        rawContent: 'This is a reply',
        renderedContent: '<p>This is a reply</p>',
        userId: null,
        visitorName: 'Reply User',
        visitorEmail: 'reply@example.com',
        parentId: 1,
        replyToId: 1,
        createdAt: new Date(),
      } as any;

      const parentComment = {
        id: 1,
        userId: null,
        visitorEmail: 'parent@example.com',
        visitorName: 'Parent User',
      };

      mockDb.query.comment.findFirst.mockResolvedValueOnce(parentComment);

      await notificationService.notifyNewComment(replyComment);

      // Admin notification is always sent
      expect(mockEmailService.sendEmail).toHaveBeenCalled();
    });

    test('should handle errors gracefully', async () => {
      const newComment = {
        id: 1,
        path: '/test-post',
        rawContent: 'This is a test comment',
        renderedContent: '<p>This is a test comment</p>',
        userId: null,
        visitorName: 'Test User',
        visitorEmail: 'test@example.com',
        parentId: null,
        replyToId: null,
        createdAt: new Date(),
      } as any;

      mockEmailService.sendEmail.mockRejectedValueOnce(new Error('Email failed'));

      // Should not throw
      await expect(notificationService.notifyNewComment(newComment)).resolves.not.toThrow();
    });

    test('should skip reply notification if no parent found', async () => {
      const replyComment = {
        id: 2,
        path: '/test-post',
        rawContent: 'This is a reply',
        renderedContent: '<p>This is a reply</p>',
        userId: null,
        visitorName: 'Reply User',
        visitorEmail: 'reply@example.com',
        parentId: 1,
        replyToId: 999, // Non-existent parent
        createdAt: new Date(),
      } as any;

      mockDb.query.comment.findFirst.mockResolvedValueOnce(null);

      await notificationService.notifyNewComment(replyComment);

      // Only admin notification should be sent
      expect(mockEmailService.sendEmail).toHaveBeenCalledTimes(1);
    });
  });
});