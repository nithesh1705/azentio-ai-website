'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import { getEmployeeTeams, createEmployeeTeam, joinTeam } from '@/server/dal/employee/teams';
import { EmployeeTeam } from '@/types';
import {
  Users,
  PlusCircle,
  Search,
  Filter,
  UserPlus,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  X,
  Tag,
  Target,
} from 'lucide-react';

export default function EmployeeTeamsPage() {
  const { actor } = usePersona();
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [teams, setTeams] = useState<EmployeeTeam[]>([]);
  const [search, setSearch] = useState('');

  // Create team modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [description, setDescription] = useState('');
  const [maxMembers, setMaxMembers] = useState(5);
  const [tagInput, setTagInput] = useState('Hackathon, AI, Lending');

  const loadData = () => {
    if (!actor?.isVerifiedEmployee) return;
    try {
      const data = getEmployeeTeams(actor, activeTab, search);
      setTeams(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [actor, activeTab, search]);

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) return;
    try {
      const newTeam = createEmployeeTeam(actor, {
        name,
        goal,
        description,
        maxMembers,
        tags: tagInput.split(',').map((t) => t.trim()).filter(Boolean),
      });

      setShowCreateModal(false);
      setName('');
      setGoal('');
      setDescription('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create team');
    }
  };

  const handleJoinTeam = (teamId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!actor) return;
    try {
      joinTeam(actor, teamId);
      loadData();
      alert('Joined team space successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to join team');
    }
  };

  if (!actor?.isVerifiedEmployee) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold">Employee Access Required</h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Cross-Functional Squads
            </span>
            <span className="text-xs text-muted-foreground font-mono">Employee Quarantined</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Hackathon & Project Team Spaces
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Collaborate on innovation spikes, share simulation runs, and submit hackathon prototypes.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Team Space</span>
        </button>
      </div>

      {/* Tabs and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-2 bg-muted/60 p-1 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All Innovation Teams
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'my'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            My Teams
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search teams by name, goal, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-input bg-background text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Teams Grid */}
      {teams.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border rounded-3xl bg-card">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-40" />
          <h3 className="text-base font-bold text-foreground">No teams found</h3>
          <p className="text-xs text-muted-foreground mt-1">Form a new squad for the FinTech hackathon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => {
            const isMember = team.memberIds.includes(actor.userId);
            const isFull = team.memberIds.length >= team.maxMembers;

            return (
              <Link
                key={team.id}
                href={`/employee/teams/${team.id}`}
                className="rounded-3xl border border-border bg-card p-5 hover:border-primary/40 transition-all flex flex-col justify-between group shadow-xs"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground">
                      {team.memberIds.length} / {team.maxMembers} Members
                    </span>
                    {isMember && (
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        Member
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                    {team.name}
                  </h3>

                  <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <Target className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{team.goal}</span>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2">{team.description}</p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {team.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Lead: <strong className="text-foreground">{team.leadName}</strong>
                  </span>

                  {!isMember && !isFull && (
                    <button
                      onClick={(e) => handleJoinTeam(team.id, e)}
                      className="px-3 py-1 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90"
                    >
                      Join Team
                    </button>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-card border border-border rounded-3xl p-6 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h3 className="text-lg font-bold text-foreground">Create Innovation Team Space</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-xl text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Team Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Autonomous Trade Screener Squad"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Project Goal *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Prototype real-time maritime AIS transshipment graph"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Description & Plan</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Outline the team's spike approach and desired skills..."
                  className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Max Members</label>
                  <input
                    type="number"
                    min={2}
                    max={10}
                    value={maxMembers}
                    onChange={(e) => setMaxMembers(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Tags</label>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-input bg-background text-xs outline-none"
                  />
                </div>
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
                  Create Team
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
