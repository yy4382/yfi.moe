import { describe, test, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { injectDeps, type Variables } from '@/middleware.js';
import { drizzle } from 'drizzle-orm/libsql';
import { commentApp } from '../comments.js';
import * as schema from '@/db/schema.js';
import { migrate } from 'drizzle-orm/libsql/migrator';
import type { NotificationService } from '@/services/notification/notification-service.js';

// Mock notification service
const mockNotificationService = {
  notifyNewComment: vi.fn().mockResolvedValue(undefined),
};

// Mock the notification instance
vi.mock('@/services/notification/instance.js', () => ({
  getNotificationService: vi.fn(() => mockNotificationService),
}));

async function getTestApp() {
  const app = new Hono<{ Variables: Variables }>();
  const db = drizzle(':memory:', { schema });

  await migrate(db, { migrationsFolder: './drizzle' });

  injectDeps(app, db as any);

  app.route('/api/comments/v1', commentApp);
  return app;
}

describe('addComment with notifications', () => {
  let app: Hono<{ Variables: Variables }>;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = await getTestApp();
  });

  test('should send notification when comment is added', async () => {
    const commentData = {
      path: '/test-post',
      content: 'This is a test comment',
      parentId: null,
      replyToId: null,
      visitorName: 'Test User',
      visitorEmail: 'test@example.com',
    };

    const res = await app.request('/api/comments/v1/addComment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commentData),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('id');
    expect(typeof body.id).toBe('number');

    // Verify notification was sent asynchronously
    expect(mockNotificationService.notifyNewComment).toHaveBeenCalled();
    expect(mockNotificationService.notifyNewComment).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/test-post',
        rawContent: 'This is a test comment',
        visitorName: 'Test User',
        visitorEmail: 'test@example.com',
      })
    );
  });

  test('should handle notification service not available', async () => {
    // Mock service as unavailable
    const { getNotificationService } = await import('@/services/notification/instance.js');
    vi.mocked(getNotificationService).mockReturnValue(null);

    const commentData = {
      path: '/test-post',
      content: 'This is a test comment',
      parentId: null,
      replyToId: null,
      visitorName: 'Test User',
      visitorEmail: 'test@example.com',
    };

    const res = await app.request('/api/comments/v1/addComment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commentData),
    });

    expect(res.status).toBe(200);
    expect(mockNotificationService.notifyNewComment).not.toHaveBeenCalled();
  });

  test('should handle notification errors gracefully', async () => {
    // Mock notification service to throw error
    mockNotificationService.notifyNewComment.mockRejectedValue(new Error('Notification failed'));

    const commentData = {
      path: '/test-post',
      content: 'This is a test comment',
      parentId: null,
      replyToId: null,
      visitorName: 'Test User',
      visitorEmail: 'test@example.com',
    };

    const res = await app.request('/api/comments/v1/addComment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commentData),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('id');
  });

  test('should send notification for reply comments', async () => {
    // First, create a parent comment
    const parentData = {
      path: '/test-post',
      content: 'This is a parent comment',
      parentId: null,
      replyToId: null,
      visitorName: 'Parent User',
      visitorEmail: 'parent@example.com',
    };

    let res = await app.request('/api/comments/v1/addComment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parentData),
    });

    expect(res.status).toBe(200);
    const parentBody = await res.json();
    const parentId = parentBody.id;

    // Reset mock to clear calls
    mockNotificationService.notifyNewComment.mockClear();

    // Now create a reply
    const replyData = {
      path: '/test-post',
      content: 'This is a reply comment',
      parentId: parentId,
      replyToId: parentId,
      visitorName: 'Reply User',
      visitorEmail: 'reply@example.com',
    };

    res = await app.request('/api/comments/v1/addComment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(replyData),
    });

    expect(res.status).toBe(200);
    expect(mockNotificationService.notifyNewComment).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/test-post',
        rawContent: 'This is a reply comment',
        parentId: parentId,
        replyToId: parentId,
      })
    );
  });
});