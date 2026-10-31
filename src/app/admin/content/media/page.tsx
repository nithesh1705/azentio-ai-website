'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MediaItem } from '@/types';
import {
  Image as ImageIcon,
  Plus,
  ArrowLeft,
  Copy,
  Check,
  Trash2,
  Lock,
  Globe,
  FileText,
  Search,
} from 'lucide-react';

export default function AdminMediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [audienceFilter, setAudienceFilter] = useState<'all' | 'public' | 'private'>('all');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filename, setFilename] = useState('');
  const [mimeType, setMimeType] = useState('image/png');
  const [sizeBytes, setSizeBytes] = useState(350000);
  const [altText, setAltText] = useState('');
  const [audience, setAudience] = useState<'public' | 'private'>('public');
  const [url, setUrl] = useState('');

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/content/media');
      if (res.ok) {
        const data = await res.json();
        setMedia(data.items || []);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filename.trim()) return;

    try {
      const res = await fetch('/api/admin/content/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename,
          mimeType,
          sizeBytes,
          altText: altText || filename,
          audience,
          url: url || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ type: 'error', message: data.error || 'Failed to upload media' });
        return;
      }

      setFeedback({ type: 'success', message: `Media '${filename}' uploaded successfully.` });
      setShowUploadModal(false);
      setFilename('');
      setAltText('');
      setUrl('');
      fetchMedia();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/content/media?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', message: 'Media asset deleted.' });
        fetchMedia();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const filtered = media.filter((m) => {
    const matchesAudience = audienceFilter === 'all' || m.audience === audienceFilter;
    const matchesSearch =
      m.filename.toLowerCase().includes(search.toLowerCase()) ||
      m.altText.toLowerCase().includes(search.toLowerCase());
    return matchesAudience && matchesSearch;
  });

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
              <ImageIcon className="w-6 h-6 text-primary" />
              <span>Media Asset Repository</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Store public marketing assets and private authenticated media streamed through secure tokenized endpoints.
            </p>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Media</span>
          </button>
        </div>
      </div>

      {/* Filter and Grid */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg text-xs overflow-x-auto">
            {['all', 'public', 'private'].map((aud) => (
              <button
                key={aud}
                onClick={() => setAudienceFilter(aud as any)}
                className={`px-3 py-1.5 rounded-md font-medium capitalize transition-colors whitespace-nowrap ${
                  audienceFilter === aud
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {aud} Assets
              </button>
            ))}
          </div>

          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search filename or alt text..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-border bg-card/60 hover:bg-muted/20 transition-colors flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold capitalize ${
                      item.audience === 'public'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-amber-500/10 text-amber-600'
                    }`}
                  >
                    {item.audience === 'public' ? (
                      <Globe className="w-3 h-3" />
                    ) : (
                      <Lock className="w-3 h-3" />
                    )}
                    <span>{item.audience}</span>
                  </span>

                  <span className="text-[10px] font-mono text-muted-foreground">
                    {(item.sizeBytes / 1024).toFixed(1)} KB
                  </span>
                </div>

                <div>
                  <h4 className="font-semibold text-xs text-foreground font-mono truncate">
                    {item.filename}
                  </h4>
                  <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{item.altText}</p>
                </div>

                <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/40">
                  <span>MIME: {item.mimeType}</span>
                  <span>Usages: {item.usagesCount}</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/50">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(item.url);
                    setCopiedId(item.id);
                    setTimeout(() => setCopiedId(null), 2000);
                  }}
                  className="px-2.5 py-1 text-xs rounded border border-border hover:bg-muted font-medium transition-colors flex items-center gap-1"
                >
                  {copiedId === item.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedId === item.id ? 'Copied' : 'Copy URL'}</span>
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1 rounded text-destructive hover:bg-destructive/10 transition-colors"
                  title="Delete media asset"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Media Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6 space-y-4">
            <h3 className="font-semibold text-foreground text-sm">Upload Media Asset</h3>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Filename</label>
                <input
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  placeholder="e.g. loan-pipeline-architecture.png"
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">MIME Type</label>
                  <select
                    value={mimeType}
                    onChange={(e) => setMimeType(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-input bg-background"
                  >
                    <option value="image/png">image/png</option>
                    <option value="image/jpeg">image/jpeg</option>
                    <option value="image/webp">image/webp</option>
                    <option value="application/pdf">application/pdf</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Audience Scope</label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-input bg-background"
                  >
                    <option value="public">Public (Static CDN)</option>
                    <option value="private">Private (Streamed /api/media)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Alt Text / Description</label>
                <input
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Accessibility screen reader description..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Storage URL (CDN or Blob)</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or blob URL"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3.5 py-2 text-xs font-medium rounded-lg border border-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Register Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
