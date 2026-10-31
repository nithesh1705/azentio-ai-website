'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ContentItem } from '@/types';
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Edit2,
  Eye,
  Calendar,
  Tag,
} from 'lucide-react';

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/content?type=blog');
      if (res.ok) {
        const data = await res.json();
        setBlogs(data.items || []);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handlePublish = async (id: string) => {
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish', id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ type: 'error', message: data.error || 'Failed to publish blog' });
        return;
      }
      setFeedback({ type: 'success', message: 'Blog published successfully to public website.' });
      fetchBlogs();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleUnpublish = async (id: string) => {
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unpublish', id }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ type: 'error', message: data.error || 'Failed to unpublish blog' });
        return;
      }
      setFeedback({ type: 'success', message: 'Blog unpublished immediately.' });
      fetchBlogs();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const filtered = blogs.filter((b) => {
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.slug.toLowerCase().includes(search.toLowerCase()) ||
      (b.excerpt && b.excerpt.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
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
              <BookOpen className="w-6 h-6 text-primary" />
              <span>Blogs & Technical Articles</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Author and publish thought leadership, engineering case notes, and macroeconomic insights.
            </p>
          </div>

          <Link
            href="/admin/content/blogs/new"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Blog Post</span>
          </Link>
        </div>
      </div>

      {/* Filter and Table Card */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg text-xs overflow-x-auto">
            {['all', 'published', 'draft', 'unpublished'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-md font-medium capitalize transition-colors whitespace-nowrap ${
                  statusFilter === status
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search blogs by title or slug..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Blogs List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <p className="text-center py-8 text-xs text-muted-foreground">
              No blog posts match your filter.
            </p>
          ) : (
            filtered.map((blog) => (
              <div
                key={blog.id}
                className="p-4 rounded-xl border border-border bg-card/60 hover:bg-muted/20 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/content/blogs/${blog.id}`}
                      className="font-bold text-sm text-foreground hover:underline"
                    >
                      {blog.title}
                    </Link>
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

                  <p className="text-xs text-muted-foreground line-clamp-2">{blog.excerpt}</p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="font-mono">slug: /{blog.slug}</span>
                    <span>•</span>
                    <span>Author: {blog.authorName}</span>
                    <span>•</span>
                    <span>Updated: {new Date(blog.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/admin/content/blogs/${blog.id}`}
                    className="px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-muted font-medium transition-colors"
                  >
                    Edit
                  </Link>

                  {blog.status !== 'published' ? (
                    <button
                      onClick={() => handlePublish(blog.id)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                      Publish
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUnpublish(blog.id)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg text-amber-600 hover:bg-amber-500/10 transition-colors"
                    >
                      Unpublish
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

