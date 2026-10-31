'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  Send,
  FileText,
  AlertTriangle,
  Info,
  CheckCircle2,
  ShieldAlert,
  Users,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Clock,
  Search,
} from 'lucide-react';
import { NotificationBroadcast, NotificationTemplate } from '@/types';

export default function AdminNotificationsPage() {
  const [activeTab, setActiveTab] = useState<'compose' | 'sent' | 'templates'>('compose');
  const [broadcasts, setBroadcasts] = useState<NotificationBroadcast[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Compose form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<NotificationBroadcast['type']>('announcement');
  const [severity, setSeverity] = useState<NotificationBroadcast['severity']>('info');
  const [scope, setScope] = useState<NotificationBroadcast['targetAudience']['scope']>('all_employees');
  const [linkUrl, setLinkUrl] = useState('');
  const [channels, setChannels] = useState<('in_app' | 'email')[]>(['in_app']);
  const [idempotencyKey, setIdempotencyKey] = useState(() => `idem-${Date.now()}`);

  // Preview state
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [previewRequiresDualControl, setPreviewRequiresDualControl] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Search filter for sent broadcasts
  const [sentFilter, setSentFilter] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/notifications');
      const data = await res.json();
      if (res.ok) {
        setBroadcasts(data.broadcasts || []);
        setTemplates(data.templates || []);
      }
    } catch {
      setFeedback({ type: 'error', message: 'Failed to load notifications telemetry.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update preview when scope changes
  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const res = await fetch(`/api/admin/notifications?preview=true&scope=${scope}`);
        const data = await res.json();
        if (res.ok) {
          setPreviewCount(data.count);
          setPreviewRequiresDualControl(data.requiresDualControl);
        }
      } catch {
        // silent preview fallback
      }
    };
    fetchPreview();
  }, [scope]);

  const handleUseTemplate = (tpl: NotificationTemplate) => {
    setTitle(tpl.subjectTemplate);
    setMessage(tpl.bodyTemplate);
    if (tpl.category === 'Operations') setType('maintenance');
    else if (tpl.category === 'Security') {
      setType('policy_update');
      setSeverity('critical');
    } else if (tpl.category === 'Product') setType('product_update');
    else if (tpl.category === 'Events') setType('webinar_invite');
    setActiveTab('compose');
    setFeedback({ type: 'success', message: `Template "${tpl.title}" populated into composer.` });
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          message,
          type,
          severity,
          targetAudience: { scope },
          linkUrl: linkUrl.trim() || undefined,
          channels,
          idempotencyKey,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch notification broadcast.');
      }

      if (data.pendingApproval) {
        setFeedback({
          type: 'success',
          message:
            'Dual-Control Guard: Broadcast to all clients requires approval from a second administrator. Approval request submitted to Inbox.',
        });
      } else {
        setFeedback({
          type: 'success',
          message: `Broadcast successfully dispatched to ${data.broadcast.deliveryReport.storedCount} recipients.`,
        });
      }

      // Reset form and refresh
      setTitle('');
      setMessage('');
      setLinkUrl('');
      setIdempotencyKey(`idem-${Date.now()}`);
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecall = async (broadcastId: string) => {
    if (!confirm('Are you sure you want to recall unread instances of this broadcast? Recipients who have not read it will have it removed.')) {
      return;
    }

    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'recall', broadcastId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to recall notification.');
      }
      setFeedback({
        type: 'success',
        message: `Successfully recalled ${data.recalledCount} unread notifications.`,
      });
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const filteredBroadcasts = broadcasts.filter((b) =>
    b.title.toLowerCase().includes(sentFilter.toLowerCase()) ||
    b.message.toLowerCase().includes(sentFilter.toLowerCase()) ||
    b.senderName.toLowerCase().includes(sentFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Bell className="h-6 w-6 text-brand-teal" />
            Notifications & Broadcasts
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Compose targeted audience communications, review real-time delivery telemetry, and enforce dual-control approvals for platform-wide broadcasts.
          </p>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
          }`}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs font-semibold hover:underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800">
        <button
          onClick={() => setActiveTab('compose')}
          className={`py-3 px-5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'compose'
              ? 'border-brand-teal text-brand-teal'
              : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
          }`}
        >
          <Send className="h-4 w-4" />
          Compose Broadcast
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`py-3 px-5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'sent'
              ? 'border-brand-teal text-brand-teal'
              : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
          }`}
        >
          <Clock className="h-4 w-4" />
          Sent & Telemetry ({broadcasts.length})
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`py-3 px-5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'templates'
              ? 'border-brand-teal text-brand-teal'
              : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
          }`}
        >
          <FileText className="h-4 w-4" />
          Templates Library ({templates.length})
        </button>
      </div>

      {/* TAB 1: COMPOSE */}
      {activeTab === 'compose' && (
        <form onSubmit={handleSendBroadcast} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Broadcast Subject / Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Scheduled Platform Maintenance: Nov 2, 2026"
                className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:ring-2 focus:ring-brand-teal"
              />
            </div>

            {/* Target Audience Scope */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Audience Scope *
              </label>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value as any)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:ring-2 focus:ring-brand-teal"
              >
                <option value="all_employees">All Internal Employees (@azentio.com)</option>
                <option value="all_clients">All Client Organisations (Platform-wide)</option>
                <option value="client_admins_only">Client Administrators Only</option>
              </select>
            </div>

            {/* Type & Urgency */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Category
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:ring-2 focus:ring-brand-teal"
                >
                  <option value="announcement">Announcement</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="policy_update">Policy Update</option>
                  <option value="product_update">Product Update</option>
                  <option value="webinar_invite">Webinar Invite</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Urgency
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:ring-2 focus:ring-brand-teal"
                >
                  <option value="info">Info (Standard)</option>
                  <option value="warning">Warning (Priority)</option>
                  <option value="critical">Critical (Urgent)</option>
                </select>
              </div>
            </div>

            {/* Audience Estimation Box */}
            <div className="md:col-span-2 p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-neutral-500" />
                <div>
                  <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Estimated Recipients: <span className="font-bold">{previewCount !== null ? previewCount : 'Calculating...'}</span> users
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    Calculated against active memberships and verified employee accounts.
                  </div>
                </div>
              </div>
              {previewRequiresDualControl && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Dual Control Required (2nd Admin Sign-off)
                </div>
              )}
            </div>

            {/* Message Body */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Message Content *
              </label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Compose your message text here..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:ring-2 focus:ring-brand-teal"
              />
            </div>

            {/* Link URL */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Action Link (Optional URL)
              </label>
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="e.g. /client/resources or https://status.azentio.com"
                className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent focus:ring-2 focus:ring-brand-teal"
              />
            </div>

            {/* Delivery Channels */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Delivery Channels
              </label>
              <div className="flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={channels.includes('in_app')}
                    onChange={(e) => {
                      if (e.target.checked) setChannels([...channels, 'in_app']);
                      else setChannels(channels.filter((c) => c !== 'in_app'));
                    }}
                    className="rounded border-neutral-300 text-brand-teal focus:ring-brand-teal"
                  />
                  <span>In-App Notification Feed (Instant)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={channels.includes('email')}
                    onChange={(e) => {
                      if (e.target.checked) setChannels([...channels, 'email']);
                      else setChannels(channels.filter((c) => c !== 'email'));
                    }}
                    className="rounded border-neutral-300 text-brand-teal focus:ring-brand-teal"
                  />
                  <span>Email Dispatch (Queued to Provider)</span>
                </label>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Note: Honest delivery metrics are strictly preserved. Email is flagged as queued and never claimed as delivered without confirmed provider webhook.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex justify-end gap-3">
            <button
              type="submit"
              disabled={submitting || channels.length === 0}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-brand-teal text-white hover:bg-brand-teal/90 disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              <Send className="h-4 w-4" />
              {submitting ? 'Dispatching...' : previewRequiresDualControl ? 'Submit for Dual-Control Approval' : 'Send Broadcast Now'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: SENT BROADCASTS & TELEMETRY */}
      {activeTab === 'sent' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                value={sentFilter}
                onChange={(e) => setSentFilter(e.target.value)}
                placeholder="Search sent broadcasts..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-xs uppercase tracking-wider text-neutral-500">
                  <tr>
                    <th className="px-4 py-3">Subject & Content</th>
                    <th className="px-4 py-3">Audience & Urgency</th>
                    <th className="px-4 py-3">Sent By & Time</th>
                    <th className="px-4 py-3">Delivery Telemetry</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {filteredBroadcasts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                        No broadcasts found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredBroadcasts.map((b) => (
                      <tr key={b.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40">
                        <td className="px-4 py-3 max-w-md">
                          <div className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                            {b.title}
                            {b.linkUrl && (
                              <a href={b.linkUrl} target="_blank" rel="noreferrer" className="text-brand-teal">
                                <ExternalLink className="h-3.5 w-3.5 inline" />
                              </a>
                            )}
                          </div>
                          <div className="text-xs text-neutral-500 line-clamp-2 mt-0.5">{b.message}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                            Scope: {b.targetAudience.scope.replace(/_/g, ' ')}
                          </div>
                          <span
                            className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              b.severity === 'critical'
                                ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                                : b.severity === 'warning'
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                            }`}
                          >
                            {b.severity}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-neutral-600 dark:text-neutral-400">
                          <div className="font-medium text-neutral-900 dark:text-neutral-100">{b.senderName}</div>
                          <div>{b.sentAt ? new Date(b.sentAt).toLocaleString() : 'Pending'}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-xs space-y-1">
                            <div>
                              Target: <span className="font-medium">{b.deliveryReport.targetCount}</span>
                            </div>
                            <div className="text-neutral-500">
                              Stored: <span className="text-neutral-800 dark:text-neutral-200 font-medium">{b.deliveryReport.storedCount}</span> | Read: <span className="text-emerald-600 font-medium">{b.deliveryReport.readCount}</span>
                            </div>
                            {b.deliveryReport.recalledCount > 0 && (
                              <div className="text-amber-600 font-medium">
                                Recalled: {b.deliveryReport.recalledCount}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleRecall(b.id)}
                            className="px-2.5 py-1 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors inline-flex items-center gap-1"
                            title="Recall unread notifications from recipient inboxes"
                          >
                            <RotateCcw className="h-3 w-3" />
                            Recall Unread
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 space-y-4 shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                    {tpl.category}
                  </span>
                  <div className="text-xs text-neutral-400 font-mono">{tpl.id}</div>
                </div>
                <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  {tpl.title}
                </h3>
                <div className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Subject: <span className="font-mono text-neutral-500">{tpl.subjectTemplate}</span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800/40 p-3 rounded-lg border border-neutral-200/60 dark:border-neutral-800 font-mono">
                  {tpl.bodyTemplate}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tpl.variables.map((v) => (
                    <span
                      key={v}
                      className="px-2 py-0.5 text-[10px] font-mono rounded bg-brand-teal/10 text-brand-teal border border-brand-teal/20"
                    >
                      {`{{${v}}}`}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
                <button
                  onClick={() => handleUseTemplate(tpl)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-brand-teal hover:bg-brand-teal/90 rounded-lg inline-flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Use Template
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

