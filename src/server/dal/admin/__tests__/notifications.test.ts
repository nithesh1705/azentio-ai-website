import { describe, it, expect, beforeEach } from 'vitest';
import { Actor } from '@/types';
import {
  notificationStore,
  getNotificationTemplates,
  getNotificationBroadcasts,
  estimateRecipients,
  composeNotificationBroadcast,
  recallNotificationBroadcast,
} from '../notifications';
import { approvalsEngine } from '@/server/services/approvals';
import { store } from '@/server/dal/store';

const mockAdminActor: Actor = {
  userId: 'usr-admin-elena',
  name: 'Elena Rostova',
  isVerifiedEmployee: true,
  email: 'elena.rostova@azentio.com',
  platformGrants: ['portal_admin'],
  memberships: [],
  activeTenantId: null,
};

const mockClientActor: Actor = {
  userId: 'usr-client-001',
  name: 'Client User',
  isVerifiedEmployee: false,
  email: 'client@apex.com',
  platformGrants: [],
  memberships: [
    {
      orgId: 'org-apex',
      role: 'client_member',
      status: 'active',
    },
  ],
  activeTenantId: 'org-apex',
};

describe('Admin Notifications & Broadcasts DAL', () => {
  beforeEach(() => {
    notificationStore.reset();
    approvalsEngine.reset();
  });

  it('1. Requires portal_admin grant to read templates or broadcasts', () => {
    expect(() => getNotificationTemplates(mockClientActor)).toThrow(/verified employee|portal_admin/i);
    expect(() => getNotificationBroadcasts(mockClientActor)).toThrow(/verified employee|portal_admin/i);

    const templates = getNotificationTemplates(mockAdminActor);
    expect(templates.length).toBeGreaterThan(0);
    expect(templates[0]).toHaveProperty('subjectTemplate');

    const broadcasts = getNotificationBroadcasts(mockAdminActor);
    expect(broadcasts.length).toBeGreaterThan(0);
  });

  it('2. Accurately estimates recipient counts and flags dual control requirements', () => {
    // all_employees
    const empPreview = estimateRecipients(mockAdminActor, { scope: 'all_employees' });
    expect(empPreview.count).toBeGreaterThan(0);
    expect(empPreview.requiresDualControl).toBe(false);

    // all_clients requires dual control
    const clientPreview = estimateRecipients(mockAdminActor, { scope: 'all_clients' });
    expect(clientPreview.requiresDualControl).toBe(true);
  });

  it('3. Enforces dual-control approval for all_clients broadcasts', () => {
    const result = composeNotificationBroadcast(mockAdminActor, {
      title: 'Global System Update',
      message: 'Platform maintenance will commence at midnight UTC.',
      type: 'maintenance',
      severity: 'warning',
      targetAudience: { scope: 'all_clients' },
      channels: ['in_app'],
      idempotencyKey: 'idem-test-dual-01',
    });

    expect(result.success).toBe(true);
    expect(result.pendingApproval).toBe(true);
    expect(result.approvalId).toBeDefined();

    // Verify approval request was logged in engine
    const req = approvalsEngine.getApprovalRequestById(result.approvalId!);
    expect(req).toBeDefined();
    expect(req?.actionType).toBe('broadcast_all_clients');
  });

  it('4. Dispatches immediate notifications for targeted audiences without dual control', () => {
    const prevNotifCount = (store as any).notifications.length;

    const result = composeNotificationBroadcast(mockAdminActor, {
      title: 'Internal Engineering Sync',
      message: 'All hands engineering sync at 3 PM UTC.',
      type: 'announcement',
      severity: 'info',
      targetAudience: { scope: 'all_employees' },
      channels: ['in_app'],
      idempotencyKey: 'idem-test-emp-01',
    });

    expect(result.success).toBe(true);
    expect(result.pendingApproval).toBeFalsy();
    expect(result.broadcast).toBeDefined();
    expect(result.broadcast?.deliveryReport.storedCount).toBeGreaterThan(0);

    // Notifications in store increased
    expect((store as any).notifications.length).toBeGreaterThan(prevNotifCount);
  });

  it('5. Protects against duplicate submits using idempotency key', () => {
    const input = {
      title: 'Idempotent Broadcast Test',
      message: 'Testing double submits prevention.',
      type: 'product_update' as const,
      severity: 'info' as const,
      targetAudience: { scope: 'all_employees' as const },
      channels: ['in_app' as const],
      idempotencyKey: 'idem-test-repeat-01',
    };

    const first = composeNotificationBroadcast(mockAdminActor, input);
    const second = composeNotificationBroadcast(mockAdminActor, input);

    expect(first.broadcast?.id).toBe(second.broadcast?.id);
  });

  it('6. Recalls unread notification instances from recipients', () => {
    // Dispatch test notification to employees
    const composeResult = composeNotificationBroadcast(mockAdminActor, {
      title: 'Recallable Announcement Test',
      message: 'This message should be recalled.',
      type: 'announcement',
      severity: 'info',
      targetAudience: { scope: 'all_employees' },
      channels: ['in_app'],
      idempotencyKey: 'idem-test-recall-01',
    });

    const broadcastId = composeResult.broadcast!.id;
    const recalledResult = recallNotificationBroadcast(mockAdminActor, broadcastId);

    expect(recalledResult.success).toBe(true);
    expect(recalledResult.recalledCount).toBeGreaterThan(0);

    // Verify broadcast record updated
    const updated = getNotificationBroadcasts(mockAdminActor).find((b) => b.id === broadcastId);
    expect(updated?.deliveryReport.recalledCount).toBe(recalledResult.recalledCount);
  });
});
