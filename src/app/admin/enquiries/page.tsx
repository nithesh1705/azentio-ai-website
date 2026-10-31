'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Inbox,
  Download,
  Search,
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  Building,
  UserCheck,
  Code,
  Users,
} from 'lucide-react';
import { ExtendedDemoEnquiry } from '@/server/dal/admin/enquiries';
import { HackathonRegistration } from '@/types';

export default function AdminEnquiriesPage() {
  const [activeTab, setActiveTab] = useState<'demos' | 'hackathons'>('demos');
  const [demos, setDemos] = useState<ExtendedDemoEnquiry[]>([]);
  const [hackathons, setHackathons] = useState<HackathonRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Status editing modal
  const [editingEnquiry, setEditingEnquiry] = useState<ExtendedDemoEnquiry | null>(null);
  const [newStatus, setNewStatus] = useState<ExtendedDemoEnquiry['status']>('new');
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/enquiries');
      const data = await res.json();
      if (res.ok) {
        setDemos(data.demos || []);
        setHackathons(data.hackathons || []);
      }
    } catch {
      setFeedback({ type: 'error', message: 'Failed to load enquiries telemetry.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEnquiry) return;

    try {
      setUpdating(true);
      const res = await fetch('/api/admin/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          id: editingEnquiry.id,
          status: newStatus,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update enquiry status.');

      setFeedback({ type: 'success', message: 'Enquiry status and notes updated.' });
      setEditingEnquiry(null);
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setUpdating(false);
    }
  };

  const filteredDemos = demos.filter(
    (d) =>
      d.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.workEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.offeringSlug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredHackathons = hackathons.filter(
    (h) =>
      h.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.workEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.track.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Inbox className="h-6 w-6 text-brand-teal" />
            Inbound Enquiries & Registrations
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Review prospect demo requests, qualify leads, convert enquiries to organisation drafts, and manage hackathon participant registrations.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <a
            href={`/api/admin/enquiries?export=${activeTab}`}
            className="px-3.5 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Export {activeTab === 'demos' ? 'Enquiries' : 'Registrations'} CSV
          </a>
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
          <button onClick={() => setFeedback(null)} className="text-xs font-semibold hover:underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800">
        <button
          onClick={() => setActiveTab('demos')}
          className={`py-3 px-5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'demos'
              ? 'border-brand-teal text-brand-teal font-semibold'
              : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
          }`}
        >
          <Building className="h-4 w-4" />
          Enterprise Demo Enquiries ({demos.length})
        </button>
        <button
          onClick={() => setActiveTab('hackathons')}
          className={`py-3 px-5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'hackathons'
              ? 'border-brand-teal text-brand-teal font-semibold'
              : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
          }`}
        >
          <Code className="h-4 w-4" />
          Hackathon Registrations ({hackathons.length})
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={`Search ${activeTab === 'demos' ? 'enquiries...' : 'registrations...'}`}
          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent"
        />
      </div>

      {/* TAB 1: DEMO ENQUIRIES */}
      {activeTab === 'demos' && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-xs uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="px-4 py-3">Prospect & Company</th>
                  <th className="px-4 py-3">Offering Interest</th>
                  <th className="px-4 py-3">Message Snippet</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {filteredDemos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                      No demo enquiries found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredDemos.map((d) => (
                    <tr key={d.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-neutral-900 dark:text-neutral-100">{d.fullName}</div>
                        <div className="text-xs text-neutral-600 dark:text-neutral-400">{d.companyName}</div>
                        <div className="text-[11px] text-brand-teal font-mono">{d.workEmail}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-mono text-xs text-neutral-700 dark:text-neutral-300">
                          {d.offeringSlug}
                        </span>
                        <div className="text-[10px] text-neutral-400 mt-0.5">
                          {new Date(d.submittedAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-xs text-xs text-neutral-600 dark:text-neutral-400">
                        <div className="line-clamp-2">{d.message}</div>
                        {d.notes && (
                          <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-1 italic">
                            Internal note: {d.notes}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                            d.status === 'qualified'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : d.status === 'contacted'
                              ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                              : d.status === 'converted'
                              ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingEnquiry(d);
                            setNewStatus(d.status);
                            setNotes(d.notes || '');
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded transition-colors inline-flex items-center gap-1"
                        >
                          Update Status
                        </button>
                        <Link
                          href={`/admin/orgs/new?name=${encodeURIComponent(d.companyName)}&contactEmail=${encodeURIComponent(d.workEmail)}`}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-brand-teal hover:bg-brand-teal/90 rounded transition-colors inline-flex items-center gap-1"
                          title="Convert this enquiry directly into a new organisation onboarding draft"
                        >
                          <Building className="h-3 w-3" />
                          Convert to Org
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: HACKATHONS */}
      {activeTab === 'hackathons' && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-xs uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="px-4 py-3">Participant</th>
                  <th className="px-4 py-3">Hackathon Track</th>
                  <th className="px-4 py-3">Team Size</th>
                  <th className="px-4 py-3">Notes & Motivation</th>
                  <th className="px-4 py-3">Submitted At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {filteredHackathons.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                      No hackathon registrations found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredHackathons.map((h) => (
                    <tr key={h.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-semibold text-neutral-900 dark:text-neutral-100">{h.fullName}</div>
                        <div className="text-xs text-brand-teal font-mono">{h.workEmail}</div>
                      </td>
                      <td className="px-4 py-3 max-w-xs text-xs font-medium text-neutral-800 dark:text-neutral-200">
                        {h.track}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-neutral-600 dark:text-neutral-400">
                        <span className="font-semibold">{h.teamSize}</span> members
                      </td>
                      <td className="px-4 py-3 max-w-sm text-xs text-neutral-600 dark:text-neutral-400">
                        {h.notes}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-neutral-500">
                        {new Date(h.submittedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingEnquiry && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              Update Lead Status: {editingEnquiry.companyName}
            </h3>
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-neutral-500">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent"
                >
                  <option value="new">New (Unreviewed)</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified Lead</option>
                  <option value="converted">Converted to Client</option>
                  <option value="closed">Closed / Disqualified</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-neutral-500">Internal Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about conversations or next steps..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingEnquiry(null)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 text-xs font-semibold text-white bg-brand-teal hover:bg-brand-teal/90 rounded-lg disabled:opacity-50"
                >
                  {updating ? 'Saving...' : 'Save Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

