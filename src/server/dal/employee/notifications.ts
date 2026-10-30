import { Actor, Notification } from '@/types';
import { authorize } from '@/server/policy/authorize';
import { getNotifications, markNotificationRead, store } from '@/server/dal/store';

export function getEmployeeNotifications(actor: Actor): Notification[] {
  const auth = authorize(actor, 'read', { kind: 'notification', audience: 'employee' });
  if (!auth.allow) {
    throw new Error(auth.reason);
  }
  return getNotifications(actor);
}

export function setNotificationReadState(actor: Actor, notificationId: string, read: boolean): void {
  const auth = authorize(actor, 'update', { kind: 'notification', audience: 'employee', id: notificationId });
  if (!auth.allow) {
    throw new Error(auth.reason);
  }
  const n = (store as any).notifications.find(
    (item: any) => item.id === notificationId && item.userId === actor.userId
  );
  if (n) {
    n.read = read;
    n.state = read ? 'read' : 'stored';
  }
}

export function markAllEmployeeNotificationsRead(actor: Actor): void {
  const auth = authorize(actor, 'update', { kind: 'notification', audience: 'employee' });
  if (!auth.allow) {
    throw new Error(auth.reason);
  }
  (store as any).notifications.forEach((item: any) => {
    if (item.userId === actor.userId) {
      item.read = true;
      item.state = 'read';
    }
  });
}

export function deleteEmployeeNotification(actor: Actor, notificationId: string): void {
  const auth = authorize(actor, 'delete', { kind: 'notification', audience: 'employee', id: notificationId });
  if (!auth.allow) {
    throw new Error(auth.reason);
  }
  const index = (store as any).notifications.findIndex(
    (item: any) => item.id === notificationId && item.userId === actor.userId
  );
  if (index !== -1) {
    (store as any).notifications.splice(index, 1);
  }
}
