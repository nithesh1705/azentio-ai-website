'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ContentItem } from '@/types';
import {
  FileText,
  BookOpen,
  Award,
  MessageSquareQuote,
  Megaphone,
  HelpCircle,
  Image as ImageIcon,
  Plus,
  CheckCircle2,
  Clock,
  Eye,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export default function AdminContentHubPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/content');
        if (res.ok) {
          const data = await res.json();
          setItems(data.items || []);
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const blogsCount = items.filter((i) => i.type === 'blog').length;
  const casesCount = items.filter((i) => i.type === 'case_study').length;
  const testimonialsCount = items.filter((i) => i.type === 'testimonial').length;
  const bannersCount = items.filter((i) => i.type === 'banner').length;
  const faqsCount = items.filter((i) => i.type === 'faq').length;

  const publishedCount = items.filter((i) => i.status === 'published').length;
  const draftsCount = items.filter((i) => i.status === 'draft').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-primary" />
            <span>Content Publishing Hub</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Author, moderate, and publish enterprise blogs, consented customer case studies, banners, testimonials, and FAQs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/content/blogs/new"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Blog Post</span>
          </Link>
          <Link
            href="/admin/content/case-studies/new"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-muted text-foreground transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Case Study</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
          <p className="text-xs text-muted-foreground font-medium">Published Live</p>
          <p className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{publishedCount}</p>
        </div>
        <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
          <p className="text-xs text-muted-foreground font-medium">Drafts in Progress</p>
          <p className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">{draftsCount}</p>
        </div>
        <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
          <p className="text-xs text-muted-foreground font-medium">Blogs & Articles</p>
          <p className="text-2xl font-bold mt-1 text-foreground">{blogsCount}</p>
        </div>
        <div className="bg-card border border-border p-4 rounded-xl shadow-sm">
          <p className="text-xs text-muted-foreground font-medium">Customer Stories</p>
          <p className="text-2xl font-bold mt-1 text-foreground">{casesCount}</p>
        </div>
      </div>

      {/* 6 Sub-Hub Area Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            href: '/admin/content/blogs',
            title: 'Blogs & Articles',
            desc: 'Technical insights, agentic architecture breakdowns, and macroeconomic papers.',
            count: blogsCount,
            icon: BookOpen,
          },
          {
            href: '/admin/content/case-studies',
            title: 'Case Studies',
            desc: 'Consented ROI proof points and anonymised peer deployment metrics.',
            count: casesCount,
            icon: Award,
          },
          {
            href: '/admin/content/testimonials',
            title: 'Testimonials',
            desc: 'Customer quotes with mandatory consent documentation and approver verification.',
            count: testimonialsCount,
            icon: MessageSquareQuote,
          },
          {
            href: '/admin/content/banners',
            title: 'Broadcast Banners',
            desc: 'Site-wide announcements, maintenance notices, and scheduled webinar alerts.',
            count: bannersCount,
            icon: Megaphone,
          },
          {
            href: '/admin/content/faqs',
            title: 'Knowledge & FAQs',
            desc: 'Category-indexed self-service answers with accessible screen-reader reordering.',
            count: faqsCount,
            icon: HelpCircle,
          },
          {
            href: '/admin/content/media',
            title: 'Media Library',
            desc: 'Public and private authenticated media asset streaming CDN repository.',
            count: 'CDN Active',
            icon: ImageIcon,
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="p-5 rounded-xl border border-border bg-card/60 hover:bg-muted/30 hover:border-primary/40 transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {card.count}
                  </span>
                </div>
                <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{card.desc}</p>
              </div>

              <div className="flex items-center gap-1 text-xs font-medium text-primary pt-2 border-t border-border/40">
                <span>Manage {card.title}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Unified Feed of Recent Content Items */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Recent Content Activity & Publications
        </h3>

        <div className="space-y-2">
          {items.slice(0, 5).map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-lg border border-border/60 bg-muted/10 hover:bg-muted/30 transition-colors flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                    {item.type.replace('_', ' ')}
                  </span>
                  <Link
                    href={`/admin/content/${item.type === 'blog' ? 'blogs' : 'case-studies'}/${item.id}`}
                    className="font-semibold text-xs text-foreground hover:underline"
                  >
                    {item.title}
                  </Link>
                </div>
                <p className="text-[11px] text-muted-foreground font-mono">
                  Slug: /{item.slug} • Updated: {new Date(item.updatedAt).toLocaleDateString()}
                </p>
              </div>

              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                  item.status === 'published'
                    ? 'bg-emerald-500/10 text-emerald-600'
                    : 'bg-amber-500/10 text-amber-600'
                }`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
