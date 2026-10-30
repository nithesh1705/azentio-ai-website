'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import { getLiveSessions, createLiveSession } from '@/server/dal/employee/live';
import { LiveSession } from '@/types';
import {
  Radio,
  Play,
  Calendar,
  Clock,
  Users,
  Search,
  Filter,
  PlusCircle,
  Video,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';

export default function EmployeeLiveSessionsPage() {
  const { actor } = usePersona();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'recordings'>('upcoming');
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // Publisher modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newHostName, setNewHostName] = useState(actor?.name || 'Azentio Engineering');
  const [newHostRole, setNewHostRole] = useState('Staff Engineer');
  const [newStartTime, setNewStartTime] = useState(
    new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString().slice(0, 16)
  );
  const [newDuration, setNewDuration] = useState(45);
  const [newDescription, setNewDescription] = useState('');
  const [newAgenda, setNewAgenda] = useState('Overview & Context\nTechnical Architecture\nDemonstration & Metrics\nOpen Q&A');
  const [newTags, setNewTags] = useState('Architecture, Engineering');

  const isPublisher =
    actor?.platformGrants?.includes('content_publisher') ||
    actor?.platformGrants?.includes('portal_admin');

  const loadSessions = () => {
    if (!actor?.isVerifiedEmployee) return;
    try {
      const all = getLiveSessions(actor, activeTab);
      setSessions(all);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [actor, activeTab]);

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || !isPublisher) return;

    try {
      createLiveSession(actor, {
        title: newTitle,
        hostName: newHostName,
        hostRole: newHostRole,
        startTime: new Date(newStartTime).toISOString(),
        durationMinutes: Number(newDuration),
        description: newDescription,
        agenda: newAgenda.split('\n').filter((line) => line.trim().length > 0),
        tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
      });

      setShowCreateModal(false);
      setNewTitle('');
      setNewDescription('');
      loadSessions();
    } catch (err: any) {
      alert(err.message || 'Failed to create session');
    }
  };

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.hostName.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());

    const matchesTag = selectedTag === 'all' || s.tags.includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  const allTags = Array.from(new Set(sessions.flatMap((s) => s.tags)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              Employee Restricted Broadcasts
            </span>
            <span className="text-xs text-muted-foreground font-mono">Quarantined Stream</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Live Broadcasts & Engineering Sessions
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Internal engineering brown-bags, architectural reviews, and product release town halls.
          </p>
        </div>

        {isPublisher && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Schedule Session</span>
          </button>
        )}
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-2 bg-muted/60 p-1 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'upcoming'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-rose-500" />
            <span>Upcoming & Live</span>
          </button>
          <button
            onClick={() => setActiveTab('recordings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'recordings'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-indigo-500" />
            <span>Recordings Archive</span>
          </button>
        </div>

        {/* Search & Tag Filter */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-input bg-background text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/20 w-48 sm:w-60"
            />
          </div>

          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-input bg-background text-xs text-foreground outline-none"
          >
            <option value="all">All Topics</option>
            {allTags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sessions Grid */}
      {filteredSessions.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border rounded-3xl bg-card">
          <Radio className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-40" />
          <h3 className="text-base font-bold text-foreground">No sessions in this view</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Check the recordings archive or schedule a new internal brown-bag.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              className="rounded-3xl border border-border bg-card overflow-hidden hover:border-primary/40 transition-all flex flex-col justify-between group shadow-xs"
            >
              <div>
                {/* Image / Header */}
                <div className="relative h-44 bg-muted overflow-hidden">
                  {session.thumbnailUrl ? (
                    <img
                      src={session.thumbnailUrl}
                      alt={session.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-500/20 to-indigo-500/20">
                      <Radio className="w-10 h-10 text-foreground/40" />
                    </div>
                  )}

                  {/* Status Overlay */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    {session.status === 'live' ? (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-600 text-white shadow-md animate-pulse">
                        <Radio className="w-3 h-3" />
                        LIVE NOW
                      </span>
                    ) : session.status === 'scheduled' ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-background/90 backdrop-blur text-foreground border border-border">
                        Scheduled
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-zinc-900/90 text-zinc-100 backdrop-blur">
                        Recording Available
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-black/75 text-white backdrop-blur">
                    {session.durationMinutes} min
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {session.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {session.title}
                  </h3>

                  <p className="text-xs text-muted-foreground line-clamp-2">{session.description}</p>

                  <div className="space-y-1 pt-2 border-t border-border/60 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      <span className="font-medium text-foreground">{session.hostName}</span>
                      <span>({session.hostRole})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>{new Date(session.startTime).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-5 pt-0">
                <Link
                  href={`/employee/live/${session.id}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-primary-foreground" />
                  <span>
                    {session.status === 'live'
                      ? 'Join Stream'
                      : session.status === 'scheduled'
                      ? 'View Agenda & Calendar'
                      : 'Watch Recording'}
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Publisher Create Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl bg-card border border-border rounded-3xl p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h3 className="text-lg font-bold text-foreground">Schedule Internal Broadcast</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-xl text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Session Title</label>
                <input
                  required
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Core Banking High-Throughput Batch Processing"
                  className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Host Name</label>
                  <input
                    required
                    type="text"
                    value={newHostName}
                    onChange={(e) => setNewHostName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Host Role</label>
                  <input
                    required
                    type="text"
                    value={newHostRole}
                    onChange={(e) => setNewHostRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Start Time</label>
                  <input
                    required
                    type="datetime-local"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Duration (Minutes)</label>
                  <input
                    required
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Description</label>
                <textarea
                  required
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Outline purpose and objectives..."
                  className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Agenda (one item per line)</label>
                <textarea
                  rows={3}
                  value={newAgenda}
                  onChange={(e) => setNewAgenda(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Tags (comma separated)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90"
                >
                  Publish Session
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
