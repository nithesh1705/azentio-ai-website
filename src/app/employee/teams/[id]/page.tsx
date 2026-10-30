'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import {
  getTeamById,
  joinTeam,
  leaveTeam,
  getTeamNotes,
  createTeamNote,
  togglePinTeamNote,
  deleteTeamNote,
  getTeamSubmission,
  saveTeamSubmission,
} from '@/server/dal/employee/teams';
import { getPlaygroundRuns } from '@/server/dal/employee/playground';
import { EmployeeTeam, TeamNote, TeamSubmission, PlaygroundRun } from '@/types';
import {
  Users,
  ArrowLeft,
  Pin,
  Plus,
  Trash2,
  FileText,
  Terminal,
  Trophy,
  ExternalLink,
  ChevronRight,
  Send,
  UserMinus,
  UserPlus,
  Target,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export default function TeamSpaceDetailPage() {
  const { actor } = usePersona();
  const params = useParams();
  const teamId = params?.id as string;

  const [team, setTeam] = useState<EmployeeTeam | null>(null);
  const [activeTab, setActiveTab] = useState<'notes' | 'members' | 'runs' | 'submission'>('notes');
  const [notes, setNotes] = useState<TeamNote[]>([]);
  const [submission, setSubmission] = useState<TeamSubmission | null>(null);
  const [sharedRuns, setSharedRuns] = useState<PlaygroundRun[]>([]);

  // Note form state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  // Submission form state
  const [subTitle, setSubTitle] = useState('');
  const [subSummary, setSubSummary] = useState('');
  const [subDemo, setSubDemo] = useState('');
  const [subRepo, setSubRepo] = useState('');
  const [subSuccess, setSubSuccess] = useState(false);

  const isLead = actor?.userId === team?.leadId;
  const isMember = (team?.memberIds.includes(actor?.userId || '') ?? false) || isLead;

  const loadData = () => {
    if (!actor?.isVerifiedEmployee || !teamId) return;
    try {
      const t = getTeamById(actor, teamId);
      if (t) setTeam(t);

      const n = getTeamNotes(actor, teamId);
      setNotes(n);

      const s = getTeamSubmission(actor, teamId);
      if (s) {
        setSubmission(s);
        setSubTitle(s.title);
        setSubSummary(s.summary);
        setSubDemo(s.demoUrl || '');
        setSubRepo(s.repoUrl || '');
      }

      const runs = getPlaygroundRuns(actor);
      setSharedRuns(runs.slice(0, 3));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [actor, teamId]);

  const handleJoin = () => {
    if (!actor || !team) return;
    try {
      const updated = joinTeam(actor, team.id);
      setTeam({ ...updated });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to join');
    }
  };

  const handleLeave = () => {
    if (!actor || !team) return;
    if (confirm('Leave this team?')) {
      try {
        const updated = leaveTeam(actor, team.id);
        setTeam({ ...updated });
        loadData();
      } catch (err: any) {
        alert(err.message || 'Failed to leave');
      }
    }
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || !team || !noteTitle.trim()) return;
    try {
      createTeamNote(actor, {
        teamId: team.id,
        title: noteTitle,
        content: noteContent,
      });
      setNoteTitle('');
      setNoteContent('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create note');
    }
  };

  const handleTogglePin = (noteId: string) => {
    if (!actor) return;
    try {
      togglePinTeamNote(actor, noteId);
      loadData();
    } catch (e: any) {
      alert(e.message || 'Only team leads can pin/unpin notes');
    }
  };

  const handleDeleteNote = (noteId: string) => {
    if (!actor) return;
    if (confirm('Delete this note?')) {
      try {
        deleteTeamNote(actor, noteId);
        loadData();
      } catch (err: any) {
        alert(err.message || 'Failed to delete note');
      }
    }
  };

  const handleSaveSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || !team) return;
    try {
      const saved = saveTeamSubmission(actor, {
        teamId: team.id,
        title: subTitle,
        summary: subSummary,
        demoUrl: subDemo || undefined,
        repoUrl: subRepo || undefined,
      });
      setSubmission(saved);
      setSubSuccess(true);
      setTimeout(() => setSubSuccess(false), 2000);
    } catch (err: any) {
      alert(err.message || 'Failed to save submission');
    }
  };

  if (!actor?.isVerifiedEmployee) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold">Employee Access Required</h2>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <Users className="w-12 h-12 text-muted-foreground mx-auto" />
        <h2 className="text-xl font-bold">Team Space Not Found</h2>
        <Link
          href="/employee/teams"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Teams</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header Card */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/employee/teams"
              className="p-2 rounded-xl border border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground text-xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-blue-500">{team.id}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground">
                  {team.memberIds.length} / {team.maxMembers} Members
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  {team.status}
                </span>
              </div>
              <h1 className="text-xl sm:text-3xl font-extrabold text-foreground mt-0.5">{team.name}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {isMember && !isLead ? (
              <button
                onClick={handleLeave}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-destructive/30 text-destructive text-xs font-semibold hover:bg-destructive/10"
              >
                <UserMinus className="w-3.5 h-3.5" />
                <span>Leave Team</span>
              </button>
            ) : !isMember ? (
              <button
                onClick={handleJoin}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Join Team</span>
              </button>
            ) : null}
          </div>
        </div>

        <div className="flex items-start gap-2 text-xs sm:text-sm text-foreground/90 pt-1">
          <Target className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <span><strong>Primary Goal: </strong>{team.goal}</span>
        </div>

        <p className="text-xs text-muted-foreground">{team.description}</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 bg-muted/60 p-1 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'notes' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-primary" />
          <span>Notes Board ({notes.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'members' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-blue-500" />
          <span>Members ({team.memberIds.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('runs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'runs' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-indigo-500" />
          <span>Shared Runs ({sharedRuns.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('submission')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'submission' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          <span>Hackathon Submission</span>
        </button>
      </div>

      {/* Tab 1: Notes Board */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          {/* Create Note (Members only) */}
          {isMember && (
            <form onSubmit={handleCreateNote} className="bg-card border border-border rounded-3xl p-5 shadow-xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Post Team Architecture or Research Note
              </h4>
              <input
                required
                type="text"
                placeholder="Note Title..."
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs outline-none"
              />
              <textarea
                required
                rows={3}
                placeholder="Markdown content, algorithm steps, benchmark observations..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs font-mono outline-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90"
                >
                  Post Note
                </button>
              </div>
            </form>
          )}

          {/* Notes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className={`p-5 rounded-3xl border transition-all space-y-3 ${
                  note.pinned
                    ? 'border-primary/40 bg-primary/5 shadow-xs'
                    : 'border-border bg-card'
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    {note.pinned && <Pin className="w-3.5 h-3.5 text-primary fill-primary" />}
                    <h4 className="text-sm font-bold text-foreground">{note.title}</h4>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {isLead && (
                      <button
                        onClick={() => handleTogglePin(note.id)}
                        className="text-muted-foreground hover:text-primary"
                        title={note.pinned ? 'Unpin' : 'Pin to top'}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {note.authorId === actor.userId && (
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-xs text-foreground/90 whitespace-pre-line leading-relaxed font-mono">
                  {note.content}
                </div>

                <div className="pt-2 text-[10px] text-muted-foreground flex items-center justify-between border-t border-border/40">
                  <span>Author: {note.authorName}</span>
                  <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Members */}
      {activeTab === 'members' && (
        <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-foreground">Team Roster</h3>
          <div className="divide-y divide-border/60">
            {team.memberIds.map((mId) => {
              const isUserLead = mId === team.leadId;
              return (
                <div key={mId} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                      {isUserLead ? '★' : 'M'}
                    </div>
                    <div>
                      <div className="font-bold text-foreground">{isUserLead ? team.leadName : mId}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {isUserLead ? 'Team Lead & Founder' : 'Active Contributor'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                    {isUserLead ? 'Team Lead' : 'Member'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Shared Runs */}
      {activeTab === 'runs' && (
        <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h3 className="text-sm font-bold text-foreground">Shared Simulation Benchmarks</h3>
              <p className="text-xs text-muted-foreground">Deterministic traces and scenarios explored by team members.</p>
            </div>
            <Link
              href="/employee/playground"
              className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
            >
              Run New Simulation
            </Link>
          </div>

          <div className="space-y-3">
            {sharedRuns.map((r) => (
              <div key={r.id} className="p-4 rounded-2xl bg-muted/20 border border-border/60 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-primary">{r.id}</span>
                    <span className="text-foreground font-semibold">{r.scenarioTitle}</span>
                  </div>
                  <p className="text-muted-foreground text-[11px] mt-0.5">{r.outputSummary}</p>
                </div>
                <Link
                  href={`/employee/playground/${r.id}`}
                  className="px-3 py-1 rounded-lg bg-card border border-border hover:bg-muted text-xs font-semibold flex items-center gap-1"
                >
                  <span>Open Trace</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Hackathon Submission */}
      {activeTab === 'submission' && (
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-bold text-foreground">FinTech Hackathon Project Submission</h3>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Submit final demonstration video and git repository links for executive judging.
              </p>
            </div>

            {submission && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                Submitted on {new Date(submission.submittedAt).toLocaleDateString()}
              </span>
            )}
          </div>

          {subSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Hackathon submission saved and registered!</span>
            </div>
          )}

          <form onSubmit={handleSaveSubmission} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Project Submission Title *</label>
              <input
                required
                type="text"
                placeholder="e.g. Autonomous Multimodal Credit Appraisal Copilot"
                value={subTitle}
                onChange={(e) => setSubTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Executive Solution Summary *</label>
              <textarea
                required
                rows={3}
                placeholder="High-level solution overview, architecture, and business value..."
                value={subSummary}
                onChange={(e) => setSubSummary(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Live Demo / Prototype URL</label>
                <input
                  type="url"
                  placeholder="https://demo.azentio.internal/..."
                  value={subDemo}
                  onChange={(e) => setSubDemo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Git Repository URL</label>
                <input
                  type="url"
                  placeholder="https://github.com/azentio-internal/..."
                  value={subRepo}
                  onChange={(e) => setSubRepo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 shadow-md shadow-primary/20"
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>{submission ? 'Update Submission' : 'Submit Project'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

