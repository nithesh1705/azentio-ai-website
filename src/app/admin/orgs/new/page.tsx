'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, ArrowLeft, Check, AlertCircle, Shield, Layers } from 'lucide-react';

const AVAILABLE_OFFERINGS = [
  { id: 'offering-fai', name: 'Financial Analysis Intelligence', code: 'FAI' },
  { id: 'offering-cbe', name: 'Core Banking Modernization Engine', code: 'CBE' },
  { id: 'offering-aml', name: 'AML & Fraud Surveillance Suite', code: 'AML' },
  { id: 'offering-dls', name: 'Digital Lending & Credit Scoring', code: 'DLS' },
];

export default function AdminNewOrgPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [tier, setTier] = useState<'Enterprise' | 'Core' | 'Standard'>('Enterprise');
  const [selectedOfferings, setSelectedOfferings] = useState<string[]>([
    'offering-fai',
    'offering-cbe',
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const toggleOffering = (id: string) => {
    setSelectedOfferings((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !domain.trim()) {
      setError('Both organisation name and domain are required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/orgs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          domain: domain.trim().toLowerCase(),
          tier,
          entitledOfferings: selectedOfferings,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to create organisation');
        setLoading(false);
        return;
      }

      router.push(`/admin/orgs/${data.organisation.id}`);
    } catch (err: any) {
      setError(err.message || 'Network error creating organisation');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/admin/orgs"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Organisations</span>
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Building2 className="w-6 h-6 text-primary" />
          <span>Create New Client Organisation</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Provision a dedicated multi-tenant workspace with isolated memberships, policy contracts, and solution entitlements.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider text-muted-foreground border-b border-border/60 pb-2">
            1. Identity & Domain Binding
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="org-name" className="block text-xs font-medium text-foreground mb-1.5">
                Organisation Legal Name <span className="text-destructive">*</span>
              </label>
              <input
                id="org-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Apex Global Banking Corp"
                required
                className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="org-domain" className="block text-xs font-medium text-foreground mb-1.5">
                Corporate Email Domain <span className="text-destructive">*</span>
              </label>
              <input
                id="org-domain"
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="e.g. apexbank.com"
                required
                className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Domain is validated during invitation matching and SSO federations.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Workspace URL Slug (Immutable once active)
            </label>
            <div className="px-3 py-2 text-xs font-mono rounded-lg border border-border/60 bg-muted/40 text-muted-foreground">
              /client?tenant=<strong>{slug || 'auto-generated-slug'}</strong>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider text-muted-foreground border-b border-border/60 pb-2">
            2. Service Level Tier
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'Enterprise',
                desc: 'Dedicated compliance SLA, custom sandbox scenarios, collective learning priority.',
              },
              {
                id: 'Core',
                desc: 'Standard commercial deployment with shared market intelligence access.',
              },
              {
                id: 'Standard',
                desc: 'Base entitlement bundle for regional financial institution pilots.',
              },
            ].map((t) => (
              <label
                key={t.id}
                className={`p-3.5 rounded-xl border cursor-pointer transition-colors block ${
                  tier === t.id
                    ? 'border-primary bg-primary/5 text-primary shadow-sm'
                    : 'border-border bg-card/60 hover:bg-muted/40 text-foreground'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs">{t.id}</span>
                  <input
                    type="radio"
                    name="tier"
                    value={t.id}
                    checked={tier === t.id}
                    onChange={() => setTier(t.id as any)}
                    className="accent-primary"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{t.desc}</p>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider text-muted-foreground border-b border-border/60 pb-2">
            3. Entitled Solution Engines
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {AVAILABLE_OFFERINGS.map((offering) => {
              const checked = selectedOfferings.includes(offering.id);
              return (
                <div
                  key={offering.id}
                  onClick={() => toggleOffering(offering.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-colors flex items-center justify-between ${
                    checked
                      ? 'border-primary bg-primary/5 text-foreground'
                      : 'border-border bg-card hover:bg-muted/30 text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold ${
                        checked ? 'bg-primary text-primary-foreground' : 'border border-border'
                      }`}
                    >
                      {checked && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">{offering.name}</p>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {offering.code}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Link
            href="/admin/orgs"
            className="px-4 py-2 text-xs font-medium rounded-lg border border-border hover:bg-muted transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || !name.trim() || !domain.trim()}
            className="px-5 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm"
          >
            {loading ? 'Creating Organisation...' : 'Create Organisation'}
          </button>
        </div>
      </form>
    </div>
  );
}
