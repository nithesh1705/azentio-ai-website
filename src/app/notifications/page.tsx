'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import { Notification } from '@/types';
import {
  getEmployeeNotifications,
  setNotificationReadState,
  markAllEmployeeNotificationsRead,
  deleteEmployeeNotification,
} from '@/server/dal/employee/notifications';
import {
  Bell,
  CheckCircle2,
  Trash2,
  Filter,
  ExternalLink,
  Users,
  MessageSquare,
  Radio,
  BookOpen,
  Layers,
  Lightbulb,
  Clock,
  ShieldCheck,
  CheckCheck,
} from 'lucide-react';

export default function NotificationsPage() {
  const { actor } = usePersona();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [selectedKind, setSelectedKind] = useState<string>('all');
  const [refreshKey, setRefreshKey] = useState(0);

  // Authenticated visitor check
  if (!actor.userId || actor.userId === 'usr-anonymous') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <Bell className="w-12 h-12 text-muted-foreground mx-auto" />
        <h1 className="text-2xl font-bold text-foreground">Sign In to View Notifications</h1>
        <p className="text-xs text-muted-foreground">
          Notifications are private and scoped strictly to your authenticated identity.
        </p>
        <Link
          href="/signin"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 shadow-md"
        >
          Sign In
        </Link>
      </div>
    );
  }

  let notifications: Notification[] = [];
  try {
    notifications = getEmployeeNotifications(actor);
  } catch {
    notifications = [];
  }

  // Filter items
  const filteredNotifications = notifications.filter((item: any) => {
    if (filter === 'unread' && item.state === 'read') return false;
    if (selectedKind !== 'all' && item.kind !== selectedKind) return false;
    return true;
  });

  const unreadCount = notifications.filter((n: any) => n.state !== 'read').length;

  const handleMarkAllRead = () => {
    markAllEmployeeNotificationsRead(actor);
    setRefreshKey((k) => k + 1);
  };

  const handleToggleRead = (id: string, currentState: string) => {
    setNotificationReadState(actor, id, currentState !== 'read');
    setRefreshKey((k) => k + 1);
  };

  const handleDelete = (id: string) => {
    deleteEmployeeNotification(actor, id);
    setRefreshKey((k) => k + 1);
  };

  const getKindIcon = (kind: string) => {
    switch (kind) {
      case 'join_request':
      case 'team_invite':
        return <Users className="w-4 h-4 text-indigo-500" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-teal-500" />;
      case 'live_reminder':
        return <Radio className="w-4 h-4 text-rose-500" />;
      case 'review_due':
        return <BookOpen className="w-4 h-4 text-amber-500" />;
      case 'release':
        return <Layers className="w-4 h-4 text-cyan-500" />;
      case 'idea_status':
        return <Lightbulb className="w-4 h-4 text-emerald-500" />;
      default:
        return <Bell className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Notification Centre
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            In-app system notifications. All events are append-only and audited.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-card hover:bg-accent text-xs font-semibold text-foreground transition-all shadow-xs"
          >
            <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs & Categories */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Status toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'all'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'unread'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Kind selector */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <select
            value={selectedKind}
            onChange={(e) => setSelectedKind(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-border bg-card text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Categories</option>
            <option value="join_request">Collaborator Join Requests</option>
            <option value="comment">Comments & Discussions</option>
            <option value="live_reminder">Live Broadcast Reminders</option>
            <option value="review_due">Knowledge Review Alerts</option>
            <option value="release">Platform Releases</option>
            <option value="idea_status">Product Improvement Ideas</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center rounded-3xl glass-panel border border-border space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-foreground">You're All Caught Up</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No notifications matching your current filters. New system alerts will appear here automatically.
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredNotifications.map((n: any) => {
              const isRead = n.state === 'read';
              return (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isRead
                      ? 'bg-card/40 border-border/60 opacity-80'
                      : 'bg-card border-emerald-500/30 shadow-md shadow-emerald-500/5'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0 mt-0.5">
                      {getKindIcon(n.kind)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground">{n.title}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase ${
                            isRead
                              ? 'bg-muted text-muted-foreground'
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {n.state}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{n.message}</p>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                        {n.link && (
                          <Link
                            href={n.link}
                            className="text-primary hover:underline flex items-center gap-0.5 font-sans font-semibold"
                          >
                            <span>Open destination</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => handleToggleRead(n.id, n.state)}
                      className="px-3 py-1.5 rounded-xl border border-border hover:bg-accent text-[11px] font-semibold text-foreground transition-colors"
                    >
                      {isRead ? 'Mark Unread' : 'Mark Read'}
                    </button>
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Delete notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Honest Outbox Note */}
      <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 text-xs text-muted-foreground flex items-center gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>
          <strong>Honesty Guarantee:</strong> azentio.ai notifications reflect stored in-app state. We never claim external email delivery has completed without third-party confirmation.
        </span>
      </div>
    </div>
  );
}
