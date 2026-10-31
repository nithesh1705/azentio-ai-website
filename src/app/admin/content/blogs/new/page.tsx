'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, ArrowLeft, Save, Send } from 'lucide-react';

export default function AdminNewBlogPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [body, setBody] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [category, setCategory] = useState('Intelligence');
  const [tagsText, setTagsText] = useState('Commercial Lending, AI Agents');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const handleSave = async (publishImmediately: boolean) => {
    if (!title.trim() || !body.trim()) {
      setError('Title and blog content body are required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const tags = tagsText.split(',').map((t) => t.trim()).filter(Boolean);

      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'blog',
          title,
          slug,
          excerpt,
          body,
          coverImageUrl,
          category,
          tags,
          seoTitle: seoTitle || title,
          seoDescription: seoDescription || excerpt,
          status: publishImmediately ? 'published' : 'draft',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to save blog');
        setLoading(false);
        return;
      }

      router.push('/admin/content/blogs');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/content/blogs"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Blogs</span>
        </Link>

        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
          <BookOpen className="w-6 h-6 text-primary" />
          <span>Create New Blog Post</span>
        </h1>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs">
          {error}
        </div>
      )}

      {/* Editor Card */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Article Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Architecting Autonomous Risk Loops for Islamic Financial Instruments"
              required
              className="w-full px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary font-semibold"
            />
            <p className="text-[10px] text-muted-foreground font-mono mt-1">
              URL Slug: /insights/blogs/<strong>{slug || 'auto-slug'}</strong>
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Summary / Excerpt
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A concise 2-sentence teaser for listing feeds and search snippets..."
              rows={2}
              className="w-full p-2.5 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Article Body (Markdown Supported) <span className="text-destructive">*</span>
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write markdown content here... (e.g. ## Heading, lists, bold text)"
              rows={12}
              required
              className="w-full p-3 text-xs font-mono rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Intelligence">Intelligence</option>
                <option value="Banking">Banking</option>
                <option value="Lending">Lending</option>
                <option value="Compliance">Compliance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                placeholder="AI Agents, Risk Models, Credit"
                className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Cover Image URL (Unsplash or CDN)
            </label>
            <input
              type="url"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="pt-2 border-t border-border/60 space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Search Engine Optimization (SEO Metadata)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">SEO Title</label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Defaults to article title"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">SEO Meta Description</label>
                <input
                  type="text"
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Defaults to excerpt"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Link
            href="/admin/content/blogs"
            className="px-4 py-2 text-xs font-medium rounded-lg border border-border hover:bg-muted"
          >
            Cancel
          </Link>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSave(false)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save as Draft</span>
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSave(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publish Immediately</span>
          </button>
        </div>
      </div>
    </div>
  );
}

