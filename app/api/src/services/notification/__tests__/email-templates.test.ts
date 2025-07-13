import { describe, test, expect } from 'vitest';
import { createAdminNotificationTemplate, createReplyNotificationTemplate } from '../email-templates.js';
import type { EmailTemplateData } from '../../email/types.js';

describe('Email Templates', () => {
  const mockTemplateData: EmailTemplateData = {
    commentContent: '<p>This is a test comment</p>',
    commentPath: '/test-post',
    commentAuthor: 'Test User',
    commentUrl: 'https://test.example.com/test-post',
    siteName: 'Test Blog',
  };

  describe('createAdminNotificationTemplate', () => {
    test('should create admin notification template', () => {
      const result = createAdminNotificationTemplate(mockTemplateData);

      expect(result.subject).toBe('New comment on Test Blog: /test-post');
      expect(result.html).toContain('Test User');
      expect(result.html).toContain('This is a test comment');
      expect(result.html).toContain('https://test.example.com/test-post');
      expect(result.text).toContain('Test User');
      expect(result.text).toContain('This is a test comment');
      expect(result.text).toContain('https://test.example.com/test-post');
    });

    test('should handle HTML content in comment', () => {
      const dataWithHtml = {
        ...mockTemplateData,
        commentContent: '<p><strong>Bold text</strong> and <em>italic text</em></p>',
      };

      const result = createAdminNotificationTemplate(dataWithHtml);

      expect(result.html).toContain('<strong>Bold text</strong>');
      expect(result.text).toContain('<p><strong>Bold text</strong> and <em>italic text</em></p>');
    });
  });

  describe('createReplyNotificationTemplate', () => {
    test('should create reply notification template', () => {
      const result = createReplyNotificationTemplate(mockTemplateData);

      expect(result.subject).toBe('New reply to your comment on Test Blog');
      expect(result.html).toContain('Test User');
      expect(result.html).toContain('This is a test comment');
      expect(result.html).toContain('https://test.example.com/test-post');
      expect(result.text).toContain('Test User');
      expect(result.text).toContain('This is a test comment');
      expect(result.text).toContain('https://test.example.com/test-post');
    });
  });
});