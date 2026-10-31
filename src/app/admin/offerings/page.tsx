'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { OfferingWithStatus } from '@/server/dal/admin/entitlements_offerings';
import {
  Layers,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Cpu,
  Edit2,
  Trash2,
  Check,
  ExternalLink,
  Tag,
} from 'lucide-react';

export default function AdminOfferingsPage() {
  const [offerings, setOfferings] = useState<OfferingWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft' | 'retired'>('all');
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New Offering Modal
  const [showNewModal, setShowNewModal] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'Banking' | 'Lending' | 'Intelligence' | 'Compliance'>('Intelligence');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [featuresText, setFeaturesText] = useState('');
  const [sandboxAvailable, setSandboxAvailable] = useState(true);
  const [badge, setBadge] = useState('New Engine');

  // Edit Modal
  const [editTarget, setEditTarget] = useState<OfferingWithStatus | null>(null);

  // Retire Modal
  const [retireTarget, setRetireTarget] = useState<OfferingWithStatus | null>(null);
  const [retireReason, setRetireReason] = useState('');

  const fetchOfferings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/offerings');
      if (res.ok) {
        const data = await res.json();
        setOfferings(data.offerings || []);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfferings();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const features = featuresText
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean);

      const res = await fetch('/api/admin/offerings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category,
          tagline,
          description,
          features,
          sandboxAvailable,
          badge,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ type: 'error', message: data.error || 'Failed to create solution engine' });
        return;
      }

      setFeedback({ type: 'success', message: `Solution engine '${name}' added to catalogue.` });
      setShowNewModal(false);
      setName('');
      setTagline('');
      setDescription('');
      setFeaturesText('');
      fetchOfferings();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;

    try {
      const res = await fetch('/api/admin/offerings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editTarget.id,
          name: editTarget.name,
          tagline: editTarget.tagline,
          description: editTarget.description,
          badge: editTarget.badge,
          sandboxAvailable: editTarget.sandboxAvailable,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ type: 'error', message: data.error || 'Failed to update offering' });
        return;
      }

      setFeedback({ type: 'success', message: 'Solution engine updated.' });
      setEditTarget(null);
      fetchOfferings();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleRetireSubmit = async () => {
    if (!retireTarget) return;
    try {
      const res = await fetch('/api/admin/offerings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: retireTarget.id,
          reason: retireReason || 'Sunset engine',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: 'success',
          message: `Solution engine '${retireTarget.name}' has been marked retired.`,
        });
        setRetireTarget(null);
        setRetireReason('');
        fetchOfferings();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const filtered = offerings.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesSearch =
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.category.toLowerCase().includes(search.toLowerCase()) ||
      o.tagline.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Feedback */}
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-primary" />
            <span>Offerings & Solution Engines Catalogue</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Govern core enterprise software engines, client entitlements, sandbox simulation flags, and lifecycle availability.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Solution Engine</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg text-xs overflow-x-auto">
            {['all', 'active', 'draft', 'retired'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as any)}
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
              placeholder="Search solutions..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Offerings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((offering) => (
            <div
              key={offering.id}
              className="p-5 rounded-xl border border-border bg-card/60 hover:bg-muted/20 transition-colors flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-foreground">{offering.name}</h3>
                      {offering.badge && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                          {offering.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      ID: {offering.id} • Category: {offering.category}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold capitalize ${
                      offering.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : offering.status === 'draft'
                        ? 'bg-amber-500/10 text-amber-600'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {offering.status}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground font-medium">{offering.tagline}</p>
                <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed">
                  {offering.description}
                </p>

                {/* Subscribed Tenants Pill */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>
                      Subscribed Tenants: <strong>{offering.subscribedTenantsCount || 0}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>
                      Sandbox: <strong>{offering.sandboxAvailable ? 'Available' : 'Disabled'}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/50">
                <button
                  onClick={() => setEditTarget(offering)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-muted font-medium transition-colors flex items-center gap-1.5"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit Properties</span>
                </button>

                {offering.status === 'active' && (
                  <button
                    onClick={() => {
                      setRetireTarget(offering);
                      setRetireReason('');
                    }}
                    className="px-3 py-1.5 text-xs rounded-lg text-amber-600 hover:bg-amber-500/10 font-medium transition-colors"
                  >
                    Retire Engine
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-semibold text-foreground text-sm">Create Solution Engine</h3>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Engine Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Real-Time Liquidity Orchestrator"
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Banking">Banking</option>
                    <option value="Lending">Lending</option>
                    <option value="Intelligence">Intelligence</option>
                    <option value="Compliance">Compliance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Badge</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g. Flagship AI, Beta"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Short marketing hook..."
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Full solution description..."
                  rows={3}
                  required
                  className="w-full p-2.5 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Key Features (one per line)
                </label>
                <textarea
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                  rows={3}
                  className="w-full p-2.5 text-xs font-mono rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={sandboxAvailable}
                  onChange={(e) => setSandboxAvailable(e.target.checked)}
                  className="rounded text-primary focus:ring-primary"
                />
                <span className="font-medium text-foreground">Interactive Sandbox Simulation Lab Available</span>
              </label>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-3.5 py-2 text-xs font-medium rounded-lg border border-border hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Create Solution Engine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl p-6 space-y-4">
            <h3 className="font-semibold text-foreground text-sm">Edit {editTarget.name}</h3>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Engine Name</label>
                <input
                  type="text"
                  value={editTarget.name}
                  onChange={(e) => setEditTarget({ ...editTarget, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Tagline</label>
                <input
                  type="text"
                  value={editTarget.tagline}
                  onChange={(e) => setEditTarget({ ...editTarget, tagline: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Badge</label>
                <input
                  type="text"
                  value={editTarget.badge || ''}
                  onChange={(e) => setEditTarget({ ...editTarget, badge: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Description</label>
                <textarea
                  value={editTarget.description}
                  onChange={(e) => setEditTarget({ ...editTarget, description: e.target.value })}
                  rows={3}
                  required
                  className="w-full p-2.5 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  className="px-3.5 py-2 text-xs font-medium rounded-lg border border-border hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Retire Modal */}
      {retireTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-amber-500">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <h3 className="font-semibold text-foreground text-sm">Retire Solution Engine</h3>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Retiring <strong>{retireTarget.name}</strong> halts new entitlement grants and archives public marketing listings.
              {retireTarget.subscribedTenantsCount && retireTarget.subscribedTenantsCount > 0 ? (
                <span className="block mt-1 font-semibold text-destructive">
                  Warning: {retireTarget.subscribedTenantsCount} active client tenant(s) are currently subscribed to this offering!
                </span>
              ) : null}
            </p>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Decommission & Sunset Reason
              </label>
              <textarea
                value={retireReason}
                onChange={(e) => setRetireReason(e.target.value)}
                placeholder="Rationale for retiring offering..."
                rows={3}
                className="w-full p-2.5 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setRetireTarget(null)}
                className="px-3.5 py-2 text-xs font-medium rounded-lg border border-border hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleRetireSubmit}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700"
              >
                Confirm Retire
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

