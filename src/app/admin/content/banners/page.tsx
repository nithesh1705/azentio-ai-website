'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ContentItem } from '@/types';
import {
  Megaphone,
  Plus,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  Calendar,
} from 'lucide-react';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New banner form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [style, setStyle] = useState<'info' | 'success' | 'warning'>('info');
  const [placement, setPlacement] = useState<'home_top_bar' | 'offerings_page' | 'portal_header'>('home_top_bar');
  const [priority, setPriority] = useState(1);
  const [dismissible, setDismissible] = useState(true);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/content?type=banner');
      if (res.ok) {
        const data = await res.json();
        setBanners(data.items || []);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'banner',
          title,
          body: message,
          status: 'published',
          bannerDetails: {
            message,
            linkUrl,
            style,
            placement,
            dismissible,
            priority,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ type: 'error', message: data.error || 'Failed to create banner' });
        return;
      }

      setFeedback({ type: 'success', message: 'Broadcast banner created and published.' });
      setShowNewModal(false);
      setTitle('');
      setMessage('');
      setLinkUrl('');
      fetchBanners();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleTogglePublish = async (banner: ContentItem) => {
    const action = banner.status === 'published' ? 'unpublish' : 'publish';
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, id: banner.id }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', message: `Banner ${action}ed.` });
        fetchBanners();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center justify-between border ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-destructive/10 border-destructive/30 text-destructive'
          }`}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs underline hover:opacity-80 ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <Link
          href="/admin/content"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Content Hub</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <Megaphone className="w-6 h-6 text-primary" />
              <span>Broadcast Banners & Advisory Alerts</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Deploy top-level alert banners across homepages, solutions directories, and client workspaces.
            </p>
          </div>

          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Banner</span>
          </button>
        </div>
      </div>

      {/* Banners List */}
      <div className="space-y-3">
        {banners.map((b) => {
          const d = b.bannerDetails;
          return (
            <div
              key={b.id}
              className="p-4 rounded-xl border border-border bg-card/60 hover:bg-muted/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                      d?.style === 'warning'
                        ? 'bg-amber-500/10 text-amber-600'
                        : d?.style === 'success'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {d?.style || 'info'}
                  </span>
                  <span className="font-semibold text-sm text-foreground">{b.title}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                      b.status === 'published'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground">{d?.message || b.body}</p>

                <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-mono">
                  <span>Placement: {d?.placement}</span>
                  <span>•</span>
                  <span>Priority: {d?.priority}</span>
                  <span>•</span>
                  <span>Dismissible: {d?.dismissible ? 'Yes' : 'No'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleTogglePublish(b)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    b.status === 'published'
                      ? 'border border-border hover:bg-muted text-muted-foreground'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {b.status === 'published' ? 'Unpublish' : 'Publish'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Banner Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl p-6 space-y-4">
            <h3 className="font-semibold text-foreground text-sm">Create Broadcast Banner</h3>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Banner Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Scheduled Maintenance Window"
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Alert Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. Services will undergo scheduled updates on Nov 2..."
                  rows={3}
                  required
                  className="w-full p-2.5 text-xs rounded-lg border border-input bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Style</label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-input bg-background"
                  >
                    <option value="info">Info (Blue/Neutral)</option>
                    <option value="warning">Warning (Amber)</option>
                    <option value="success">Success (Emerald)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Placement</label>
                  <select
                    value={placement}
                    onChange={(e) => setPlacement(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-input bg-background"
                  >
                    <option value="home_top_bar">Home Top Bar</option>
                    <option value="offerings_page">Offerings Catalogue</option>
                    <option value="portal_header">Portal Workspace Header</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Action Link (Optional)</label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="/insights/blogs/..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-3.5 py-2 text-xs font-medium rounded-lg border border-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Publish Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

