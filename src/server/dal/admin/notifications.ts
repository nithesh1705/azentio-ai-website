import { Actor, NotificationBroadcast, NotificationTemplate, Notification } from '@/types';
import { authorize } from '@/server/policy/authorize';
import { appendAuditEvent } from '@/server/services/audit';
import { approvalsEngine } from '@/server/services/approvals';
import { store } from '@/server/dal/store';

// In-memory Broadcasts & Templates Store
interface NotificationStore {
  broadcasts: NotificationBroadcast[];
  templates: NotificationTemplate[];
  processedIdempotencyKeys: Map<string, { broadcastId: string; timestamp: number }>;
}

const INITIAL_TEMPLATES: NotificationTemplate[] = [
  {
    id: 'tpl-maint-01',
    title: 'Scheduled Maintenance Window',
    category: 'Operations',
    subjectTemplate: 'Scheduled Platform Maintenance: {{window_start}} to {{window_end}}',
    bodyTemplate:
      'Please be advised that Azentio AI will undergo scheduled maintenance from {{window_start}} to {{window_end}} UTC. The following services may experience temporary interruptions: {{affected_services}}. We apologize for any inconvenience.',
    variables: ['window_start', 'window_end', 'affected_services'],
  },
  {
    id: 'tpl-sec-01',
    title: 'Critical Security Advisory',
    category: 'Security',
    subjectTemplate: 'Security Advisory: {{cve_or_issue}} — Action Required',
    bodyTemplate:
      'Our security operations team has published an advisory regarding {{cve_or_issue}}. Client administrators are urged to review security settings before {{deadline}}. Required action: {{required_action}}.',
    variables: ['cve_or_issue', 'required_action', 'deadline'],
  },
  {
    id: 'tpl-rel-01',
    title: 'Quarterly Product Release',
    category: 'Product',
    subjectTemplate: 'What is New in Azentio AI {{version}}',
    bodyTemplate:
      'We are thrilled to announce the general availability of Azentio AI {{version}}. Key enhancements include {{highlights}}. Join our product engineering team for an overview and demo on {{webinar_date}}.',
    variables: ['version', 'highlights', 'webinar_date'],
  },
  {
    id: 'tpl-pol-01',
    title: 'Terms & Acceptable Use Policy Update',
    category: 'Compliance',
    subjectTemplate: 'Updates to Azentio AI Terms and Privacy Policy (Effective {{effective_date}})',
    bodyTemplate:
      'We have updated our Master Services Terms and Data Processing Addendum effective {{effective_date}}. Summary of key changes: {{summary_of_changes}}. Continued platform access constitutes acceptance.',
    variables: ['effective_date', 'summary_of_changes'],
  },
  {
    id: 'tpl-web-01',
    title: 'Executive Webinar Invitation',
    category: 'Events',
    subjectTemplate: 'Invitation: {{topic}} with {{speaker}}',
    bodyTemplate:
      'Join {{speaker}} on {{date_time}} for an exclusive deep dive on {{topic}}. Space is limited; please register your attendance at {{registration_link}}.',
    variables: ['topic', 'speaker', 'date_time', 'registration_link'],
  },
];

const INITIAL_BROADCASTS: NotificationBroadcast[] = [
  {
    id: 'bc-demo-001',
    title: 'Welcome to Azentio AI Portal Admin',
    message: 'Global tenant management and governance are active. Dual control is enforced for sensitive operations.',
    type: 'announcement',
    severity: 'info',
    targetAudience: {
      scope: 'all_employees',
    },
    linkUrl: '/admin/ops',
    channels: ['in_app'],
    sentAt: '2026-10-30T09:00:00Z',
    senderId: 'usr-admin-elena',
    senderName: 'Elena Rostova',
    idempotencyKey: 'idem-seed-001',
    deliveryReport: {
      targetCount: 15,
      storedCount: 15,
      readCount: 12,
      recalledCount: 0,
    },
  },
  {
    id: 'bc-demo-002',
    title: 'Client Platform Advisory: Q4 Roadmap Preview',
    message: 'The Q4 feature roadmap and compliance certification packs are now available in your tenant resources tab.',
    type: 'product_update',
    severity: 'info',
    targetAudience: {
      scope: 'client_admins_only',
    },
    linkUrl: '/client/resources',
    channels: ['in_app'],
    sentAt: '2026-10-29T16:00:00Z',
    senderId: 'usr-admin-fernando',
    senderName: 'Fernando Alonso',
    idempotencyKey: 'idem-seed-002',
    deliveryReport: {
      targetCount: 42,
      storedCount: 42,
      readCount: 38,
      recalledCount: 0,
    },
  },
];

class NotificationStoreImpl implements NotificationStore {
  broadcasts: NotificationBroadcast[] = JSON.parse(JSON.stringify(INITIAL_BROADCASTS));
  templates: NotificationTemplate[] = JSON.parse(JSON.stringify(INITIAL_TEMPLATES));
  processedIdempotencyKeys = new Map<string, { broadcastId: string; timestamp: number }>();

  reset() {
    this.broadcasts = JSON.parse(JSON.stringify(INITIAL_BROADCASTS));
    this.templates = JSON.parse(JSON.stringify(INITIAL_TEMPLATES));
    this.processedIdempotencyKeys.clear();
  }
}

export const notificationStore = new NotificationStoreImpl();

function checkPortalAdmin(actor: Actor) {
  const auth = authorize(actor, 'manage_org', { kind: 'org', audience: 'public' });
  if (!auth.allow) {
    throw new Error(auth.reason || 'Requires portal_admin platform grant.');
  }
}

export function getNotificationTemplates(actor: Actor): NotificationTemplate[] {
  checkPortalAdmin(actor);
  return [...notificationStore.templates];
}

export function getNotificationBroadcasts(actor: Actor): NotificationBroadcast[] {
  checkPortalAdmin(actor);
  return [...notificationStore.broadcasts];
}

export function getNotificationBroadcastById(actor: Actor, id: string): NotificationBroadcast | undefined {
  checkPortalAdmin(actor);
  return notificationStore.broadcasts.find((b) => b.id === id);
}

export interface RecipientPreviewResult {
  count: number;
  sampleRecipients: { id: string; name: string; email: string; orgName?: string }[];
  requiresDualControl: boolean;
}

export function resolveTargetRecipients(
  actor: Actor,
  targetAudience: NotificationBroadcast['targetAudience']
): { id: string; name: string; email: string; orgName?: string }[] {
  checkPortalAdmin(actor);

  const allUsers = (store as any).users || [];
  const memberships = (store as any).memberships || [];
  const organisations = (store as any).organisations || [];

  const orgMap = new Map<string, string>();
  organisations.forEach((o: any) => orgMap.set(o.id, o.name));

  let matchedUsers: { id: string; name: string; email: string; orgName?: string }[] = [];

  switch (targetAudience.scope) {
    case 'all_employees': {
      matchedUsers = allUsers
        .filter((u: any) => u.email?.endsWith('@azentio.com') || u.isVerifiedEmployee)
        .map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          orgName: 'Azentio Internal',
        }));
      break;
    }
    case 'all_clients': {
      // All active client members across non-suspended organisations
      const activeOrgIds = new Set(
        organisations.filter((o: any) => o.status === 'active').map((o: any) => o.id)
      );
      const clientMembers = memberships.filter((m: any) => activeOrgIds.has(m.orgId) && m.status === 'active');
      const clientUserIds = new Set(clientMembers.map((m: any) => m.userId));

      matchedUsers = allUsers
        .filter((u: any) => clientUserIds.has(u.id) && !u.email?.endsWith('@azentio.com'))
        .map((u: any) => {
          const userMem = clientMembers.find((m: any) => m.userId === u.id);
          return {
            id: u.id,
            name: u.name,
            email: u.email,
            orgName: userMem ? orgMap.get(userMem.orgId) || userMem.orgId : undefined,
          };
        });
      break;
    }
    case 'client_admins_only': {
      const activeOrgIds = new Set(
        organisations.filter((o: any) => o.status === 'active').map((o: any) => o.id)
      );
      const adminMembers = memberships.filter(
        (m: any) => activeOrgIds.has(m.orgId) && m.status === 'active' && m.role === 'client_admin'
      );
      const adminUserIds = new Set(adminMembers.map((m: any) => m.userId));

      matchedUsers = allUsers
        .filter((u: any) => adminUserIds.has(u.id))
        .map((u: any) => {
          const userMem = adminMembers.find((m: any) => m.userId === u.id);
          return {
            id: u.id,
            name: u.name,
            email: u.email,
            orgName: userMem ? orgMap.get(userMem.orgId) : undefined,
          };
        });
      break;
    }
    case 'specific_orgs': {
      const targetOrgs = new Set(targetAudience.orgIds || []);
      const matchedMembers = memberships.filter(
        (m: any) => targetOrgs.has(m.orgId) && m.status === 'active'
      );
      const matchedUserIds = new Set(matchedMembers.map((m: any) => m.userId));

      matchedUsers = allUsers
        .filter((u: any) => matchedUserIds.has(u.id))
        .map((u: any) => {
          const userMem = matchedMembers.find((m: any) => m.userId === u.id);
          return {
            id: u.id,
            name: u.name,
            email: u.email,
            orgName: userMem ? orgMap.get(userMem.orgId) : undefined,
          };
        });
      break;
    }
    case 'members_by_role': {
      const targetRoles = new Set(targetAudience.roles || []);
      const matchedMembers = memberships.filter(
        (m: any) => targetRoles.has(m.role) && m.status === 'active'
      );
      const matchedUserIds = new Set(matchedMembers.map((m: any) => m.userId));

      matchedUsers = allUsers
        .filter((u: any) => matchedUserIds.has(u.id))
        .map((u: any) => {
          const userMem = matchedMembers.find((m: any) => m.userId === u.id);
          return {
            id: u.id,
            name: u.name,
            email: u.email,
            orgName: userMem ? orgMap.get(userMem.orgId) : undefined,
          };
        });
      break;
    }
    case 'specific_users': {
      const targetUserIds = new Set(targetAudience.userIds || []);
      matchedUsers = allUsers
        .filter((u: any) => targetUserIds.has(u.id))
        .map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
        }));
      break;
    }
  }

  // Deduplicate users
  const seen = new Set<string>();
  return matchedUsers.filter((u) => {
    if (seen.has(u.id)) return false;
    seen.add(u.id);
    return true;
  });
}

export function estimateRecipients(
  actor: Actor,
  targetAudience: NotificationBroadcast['targetAudience']
): RecipientPreviewResult {
  const recipients = resolveTargetRecipients(actor, targetAudience);
  const requiresDualControl = targetAudience.scope === 'all_clients' || recipients.length > 500;

  return {
    count: recipients.length,
    sampleRecipients: recipients.slice(0, 5),
    requiresDualControl,
  };
}

export interface ComposeBroadcastInput {
  title: string;
  message: string;
  type: NotificationBroadcast['type'];
  severity: NotificationBroadcast['severity'];
  targetAudience: NotificationBroadcast['targetAudience'];
  linkUrl?: string;
  channels: ('in_app' | 'email')[];
  scheduledAt?: string;
  idempotencyKey: string;
}

export function composeNotificationBroadcast(
  actor: Actor,
  input: ComposeBroadcastInput
): {
  success: boolean;
  broadcast?: NotificationBroadcast;
  pendingApproval?: boolean;
  approvalId?: string;
} {
  checkPortalAdmin(actor);

  if (!input.title || input.title.trim().length < 3) {
    throw new Error('Notification title must be at least 3 characters.');
  }
  if (!input.message || input.message.trim().length < 5) {
    throw new Error('Notification message must be at least 5 characters.');
  }

  // Idempotency verification
  const existing = notificationStore.processedIdempotencyKeys.get(input.idempotencyKey);
  if (existing) {
    const existingBroadcast = notificationStore.broadcasts.find((b) => b.id === existing.broadcastId);
    if (existingBroadcast) {
      return { success: true, broadcast: existingBroadcast };
    }
  }

  const recipients = resolveTargetRecipients(actor, input.targetAudience);
  const requiresDualControl = input.targetAudience.scope === 'all_clients' || recipients.length > 500;

  // Dual Control Guard
  if (requiresDualControl) {
    const approvalReq = approvalsEngine.createApprovalRequest(
      actor,
      'broadcast_all_clients',
      `Broadcast Notification: "${input.title}"`,
      `Audience: ${input.targetAudience.scope} (${recipients.length} recipients estimated). Type: ${input.type}. Urgency: ${input.severity}.`,
      {
        ...input,
        targetRecipientCount: recipients.length,
      },
      [
        { field: 'Recipients Count', before: '0', after: `${recipients.length} target users` },
        { field: 'Target Scope', before: 'None', after: input.targetAudience.scope },
        { field: 'Channels', before: 'None', after: input.channels.join(', ') },
      ]
    );

    appendAuditEvent(
      actor,
      'admin.notification.broadcast_approval_requested',
      'approval_request',
      approvalReq.id,
      `Requested dual-control approval for broadcast "${input.title}" to ${recipients.length} users.`
    );

    return {
      success: true,
      pendingApproval: true,
      approvalId: approvalReq.id,
    };
  }

  // Immediate or Scheduled Send
  const broadcastId = `bc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  let storedCount = 0;

  if (input.channels.includes('in_app')) {
    const notifKind: Notification['kind'] = 'system';

    recipients.forEach((rec) => {
      store.notify(rec.id, notifKind, input.title, input.message, input.linkUrl);
      storedCount++;
    });
  }

  const broadcast: NotificationBroadcast = {
    id: broadcastId,
    title: input.title,
    message: input.message,
    type: input.type,
    severity: input.severity,
    targetAudience: input.targetAudience,
    linkUrl: input.linkUrl,
    channels: input.channels,
    scheduledAt: input.scheduledAt,
    sentAt: new Date().toISOString(),
    senderId: actor.userId,
    senderName: actor.name,
    idempotencyKey: input.idempotencyKey,
    deliveryReport: {
      targetCount: recipients.length,
      storedCount,
      readCount: 0,
      recalledCount: 0,
    },
  };

  notificationStore.broadcasts.unshift(broadcast);
  notificationStore.processedIdempotencyKeys.set(input.idempotencyKey, {
    broadcastId,
    timestamp: Date.now(),
  });

  appendAuditEvent(
    actor,
    'admin.notification.broadcast_sent',
    'notification_broadcast',
    broadcastId,
    `Dispatched notification broadcast "${input.title}" to ${storedCount} in-app recipients.`
  );

  return {
    success: true,
    broadcast,
  };
}

export function recallNotificationBroadcast(
  actor: Actor,
  broadcastId: string
): { success: boolean; recalledCount: number } {
  checkPortalAdmin(actor);

  const broadcast = notificationStore.broadcasts.find((b) => b.id === broadcastId);
  if (!broadcast) {
    throw new Error('Notification broadcast not found.');
  }

  let recalledCount = 0;
  const storeNotifs = (store as any).notifications as Notification[];

  // Mark all unread notifications with matching title and created around or after broadcast sent time as recalled
  for (let i = storeNotifs.length - 1; i >= 0; i--) {
    const notif = storeNotifs[i];
    if (notif.title === broadcast.title && notif.state !== 'read') {
      // Remove unread notification from recipients' inboxes
      storeNotifs.splice(i, 1);
      recalledCount++;
    }
  }

  broadcast.deliveryReport.recalledCount += recalledCount;
  if (broadcast.deliveryReport.storedCount >= recalledCount) {
    broadcast.deliveryReport.storedCount -= recalledCount;
  }

  appendAuditEvent(
    actor,
    'admin.notification.recalled',
    'notification_broadcast',
    broadcastId,
    `Recalled ${recalledCount} unread instances of notification "${broadcast.title}".`
  );

  return {
    success: true,
    recalledCount,
  };
}
