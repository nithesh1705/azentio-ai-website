'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ContentItem } from '@/types';
import { BookOpen, ArrowLeft, Save, Send, EyeOff } from 'lucide-react';

export default function AdminEditBlogPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [blog, setBlog] = useState<ContentItem | null>(null);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [body, setBody] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [category, setCategory] = useState('Intelligence');
  const [tagsText, setTagsText] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/content/${id}`);
        if (res.ok) {
          const data = await res.json();
          const item = data.item;
          setBlog(item);
          setTitle(item.title);
          setExcerpt(item.excerpt || '');
          setBody(item.body || '');
          setCoverImageUrl(item.coverImageUrl || '');
          setCategory(item.category || 'Intelligence');
          setTagsText((item.tags || []).join(', '));
          setSeoTitle(item.seoTitle || '');
          setSeoDescription(item.seoDescription || '');
        }
      } catch (err: any) {
        setFeedback({ type: 'error', message: err.message });
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const tags = tagsText.split(',').map((t) => t.trim()).filter(Boolean);
      const res = await fetch(`/api/admin/content/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          excerpt,
          body,
          coverImageUrl,
          category,
          tags,
          seoTitle,
          seoDescription,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ type: 'error', message: data.error || 'Failed to update blog' });
        return;
      }
      setFeedback({ type: 'success', message: 'Blog updated successfully.' });
      setBlog(data.item);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish', id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ type: 'error', message: data.error || 'Failed to publish' });
        return;
      }
      setFeedback({ type: 'success', message: 'Blog published live.' });
      setBlog(data.item);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleUnpublish = async () => {
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unpublish', id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ type: 'error', message: data.error || 'Failed to unpublish' });
        return;
      }
      setFeedback({ type: 'success', message: 'Blog unpublished immediately.' });
      setBlog(data.item);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  if (loading) return <div className="p-8 text-center text-xs text-muted-foreground">Loading article editor...</div>;
  if (!blog) return <div className="p-8 text-center text-xs text-muted-foreground">Blog not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
          href="/admin/content/blogs"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Blogs</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                  blog.status === 'published'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-500/10 text-amber-600'
                }`}
              >
                {blog.status}
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              version: {blog.version} • slug: /{blog.slug}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {blog.status !== 'published' ? (
              <button
                onClick={handlePublish}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
              >
                Publish Live
              </button>
            ) : (
              <button
                onClick={handleUnpublish}
                className="px-3.5 py-1.5 text-xs font-medium rounded-lg text-amber-600 hover:bg-amber-500/10 border border-amber-500/30"
              >
                Unpublish
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Editor Body */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Summary / Excerpt</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            className="w-full p-2.5 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Article Body (Markdown)</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={12}
            className="w-full p-3 text-xs font-mono rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex justify-end pt-3 border-t border-border">
          <button
            onClick={handleUpdate}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Updates'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
