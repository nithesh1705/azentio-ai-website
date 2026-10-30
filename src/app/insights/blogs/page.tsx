'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Tag,
  Search,
  BrainCircuit,
  Lock,
} from 'lucide-react';

const BLOG_ARTICLES = [
  {
    id: 'blog-01',
    slug: 'governed-collective-learning-banking-ai',
    title: 'Governed Collective Learning: How Multi-Tenant Banking Solves the Dark Data Paradox',
    category: 'Architecture',
    publishedAt: 'October 24, 2026',
    readTime: '6 min read',
    author: {
      name: 'Dr. Alistair Chen',
      role: 'Head of Collective AI, Azentio',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    },
    excerpt:
      'Traditional federated models frequently falter in banking due to strict jurisdictional boundaries and confidential loan covenants. Discover how de-identified observation pipelines and 4-tier consent matrices enable safe knowledge pooling without sharing raw records.',
    tags: ['Collective Intelligence', 'Federated Learning', 'Data Privacy', 'Banking AI'],
    featured: true,
  },
  {
    id: 'blog-02',
    slug: 'sub-60-second-consent-withdrawal',
    title: 'Architecting Sub-60s Consent Revocation Across Distributed Read Models',
    category: 'Engineering & Compliance',
    publishedAt: 'October 16, 2026',
    readTime: '5 min read',
    author: {
      name: 'Nithesh M',
      role: 'Principal Systems Architect',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    },
    excerpt:
      'Under GDPR Article 17 and enterprise banking charters, a tenant’s consent withdrawal must instantaneously purge derived artifacts. A breakdown of our transaction outbox, cryptographic tombstoning, and immediate projection invalids.',
    tags: ['Consent Management', 'Event Sourcing', 'Security', 'Compliance'],
    featured: false,
  },
  {
    id: 'blog-03',
    slug: 'aira-hybrid-retrieval-anti-hallucination',
    title: 'AIRA: Grounding Generative Financial Synthesis in Live Approved Evidence',
    category: 'Machine Learning',
    publishedAt: 'October 8, 2026',
    readTime: '8 min read',
    author: {
      name: 'Elena Rostova',
      role: 'Lead NLP Researcher',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    },
    excerpt:
      'Hallucinations are fatal in loan underwriting. Here is how Azentio’s AIRA retrieval engine restricts citation boundaries strictly to published observations that have passed both automated sensitivity heuristics and human moderation triage.',
    tags: ['AIRA', 'Retrieval Augmented Generation', 'Zero Hallucination', 'NLP'],
    featured: false,
  },
  {
    id: 'blog-04',
    slug: 'synthetic-sme-balance-sheets-zero-leakage',
    title: 'Generating Synthetic SME Financial Statements With Zero PII Leakage',
    category: 'Synthetic Data',
    publishedAt: 'September 29, 2026',
    readTime: '7 min read',
    author: {
      name: 'Marcus Sterling',
      role: 'Quantitative Risk Lead',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
    },
    excerpt:
      'How conditional tabular diffusion generates high-fidelity borrower credit trajectories that preserve statistical correlations while eliminating membership inference attacks.',
    tags: ['Synthetic Data', 'Differential Privacy', 'Credit Risk'],
    featured: false,
  },
];

export default function BlogsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const filtered = BLOG_ARTICLES.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTag = selectedTag ? article.tags.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  const allTags = Array.from(new Set(BLOG_ARTICLES.flatMap((a) => a.tags)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Engineering & AI Research Insights</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">
          Azentio <span className="text-emerald-500">Research & Blog</span>
        </h1>
        <p className="text-base text-muted-foreground">
          Deep-dives into cryptographic privacy, federated banking ontologies, zero-hallucination agent architectures, and enterprise engineering best practices.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-border">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles, tags, authors..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedTag === null
                ? 'bg-primary text-primary-foreground font-semibold'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedTag === tag
                  ? 'bg-primary text-primary-foreground font-semibold'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((article, idx) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className={`p-6 sm:p-8 rounded-3xl glass-panel border border-border/80 hover:border-emerald-500/40 shadow-lg transition-all flex flex-col justify-between space-y-6 ${
              article.featured ? 'md:col-span-2 lg:col-span-2 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent' : ''
            }`}
          >
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  {article.category}
                </span>
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {article.readTime}
                </span>
              </div>

              <h2 className={`font-bold text-foreground hover:text-emerald-500 transition-colors ${
                article.featured ? 'text-2xl sm:text-3xl font-black' : 'text-xl'
              }`}>
                {article.title}
              </h2>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {article.excerpt}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {article.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-muted font-mono text-muted-foreground"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-muted border border-border">
                  <img
                    src={article.author.avatar}
                    alt={article.author.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="text-xs font-semibold text-foreground">{article.author.name}</div>
                  <div className="text-[10px] text-muted-foreground">{article.publishedAt}</div>
                </div>
              </div>

              <span className="text-xs font-semibold text-primary inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform cursor-pointer">
                <span>Read paper</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

