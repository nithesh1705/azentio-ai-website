'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlatformGrant, GrantRecord, UserRecord } from '@/types';
import { StepupModal } from '@/components/admin/StepupModal';
import {
  KeyRound,
  Users,
  Shield,
  Plus,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  Search,
  Filter,
  Trash2,
} from 'lucide-react';

export default function AdminGrantsPage() {
  const [activeTab, setActiveTab] = useState<'grants' | 'allowlist'>('grants');
  const [grants, setGrants] = useState<GrantRecord[]>([]);
  const [allowlist, setAllowlist] = useState<any[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filters
  const [grantFilter, setGrantFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Assign Grant Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [targetUserId, setTargetUserId] = useState('');
  const [selectedGrant, setSelectedGrant] = useState<PlatformGrant>('content_publisher');
  const [grantReason, setGrantReason] = useState('');
  const [showStepup, setShowStepup] = useState(false);

  // Add Employee Allowlist Modal State
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empDept, setEmpDept] = useState('');
  const [empTitle, setEmpTitle] = useState('');

  // Bulk Allowlist Modal State
  const [showBulkAllowlistModal, setShowBulkAllowlistModal] = useState(false);
  const [bulkCsvText, setBulkCsvText] = useState('');
  const [bulkDryRun, setBulkDryRun] = useState<{ total: number; valid: any[]; errors: any[] } | null>(null);
  const [bulkExecuting, setBulkExecuting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [grantsRes, allowRes, usersRes] = await Promise.all([
        fetch('/api/admin/grants?view=grants'),
        fetch('/api/admin/grants?view=allowlist'),
        fetch('/api/admin/users'),
      ]);

      if (grantsRes.ok) {
        const data = await grantsRes.json();
        setGrants(data.grants || []);
      }
      if (allowRes.ok) {
        const data = await allowRes.json();
        setAllowlist(data.allowlist || []);
      }
      if (usersRes.ok) {
        const data = await usersRes.json();
        const employees = (data.users || []).filter((u: UserRecord) => u.isVerifiedEmployee);
        setUsers(employees);
        if (employees.length > 0 && !targetUserId) {
          setTargetUserId(employees[0].id);
        }
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const isDualControlRequired =
    selectedGrant === 'portal_admin' || targetUserId === 'usr-admin-max';

  const handleAssignGrantSubmit = async () => {
    try {
      const res = await fetch('/api/admin/grants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assign_grant',
          targetUserId,
          grant: selectedGrant,
          reason: grantReason,
          skipStepup: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ type: 'error', message: data.error || 'Failed to assign grant' });
        return;
      }

      if (data.status === 'pending_approval') {
        setFeedback({
          type: 'success',
          message:
            'Dual-control request created! A second administrator must approve this privileged grant assignment in the Approvals Inbox.',
        });
      } else {
        setFeedback({ type: 'success', message: `Successfully assigned grant '${selectedGrant}'.` });
      }

      setShowAssignModal(false);
      setShowStepup(false);
      setGrantReason('');
      fetchData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleRevokeGrant = async (grantRecordId: string) => {
    try {
      const res = await fetch('/api/admin/grants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'revoke_grant',
          grantRecordId,
          reason: 'Administrative revocation',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ type: 'error', message: data.error || 'Failed to revoke grant' });
        return;
      }

      setFeedback({ type: 'success', message: 'Grant successfully revoked.' });
      fetchData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/grants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_allowlist',
          name: empName,
          email: empEmail,
          department: empDept,
          title: empTitle,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ type: 'error', message: data.error || 'Failed to add employee' });
        return;
      }

      setFeedback({ type: 'success', message: `${empName} added to the verified employee allowlist.` });
      setShowAddEmployeeModal(false);
      setEmpName('');
      setEmpEmail('');
      setEmpDept('');
      setEmpTitle('');
      fetchData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleRunBulkDryRun = async () => {
    if (!bulkCsvText.trim()) return;
    try {
      const res = await fetch('/api/admin/grants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'validate_bulk_allowlist',
          csvText: bulkCsvText,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBulkDryRun(data.dryRun);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleExecuteBulkAllowlist = async () => {
    if (!bulkDryRun || bulkDryRun.valid.length === 0) return;
    setBulkExecuting(true);
    try {
      const res = await fetch('/api/admin/grants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'execute_bulk_allowlist',
          validRows: bulkDryRun.valid,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: 'success',
          message: `Successfully provisioned ${data.count} employees onto the verified allowlist.`,
        });
        setShowBulkAllowlistModal(false);
        setBulkDryRun(null);
        setBulkCsvText('');
        fetchData();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setBulkExecuting(false);
    }
  };

  const filteredGrants = grants.filter((g) => {
    const matchesFilter = grantFilter === 'all' || g.grant === grantFilter;
    const matchesSearch =
      g.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      g.grant.toLowerCase().includes(search.toLowerCase()) ||
      g.grantedByName.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
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
            <KeyRound className="w-6 h-6 text-primary" />
            <span>Platform Grants & Employee Allowlist</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Enforce least-privilege role segregation across learning moderation, content publishing, product ownership, and portal administration.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {activeTab === 'grants' ? (
            <button
              onClick={() => {
                setShowAssignModal(true);
                setGrantReason('');
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Assign Platform Grant</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowBulkAllowlistModal(true);
                  setBulkDryRun(null);
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Bulk CSV Allowlist</span>
              </button>
              <button
                onClick={() => setShowAddEmployeeModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="w-4 h-4" />
                <span>Add Employee</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-border text-xs">
        <button
          onClick={() => setActiveTab('grants')}
          className={`px-4 py-2.5 font-medium border-b-2 transition-colors ${
            activeTab === 'grants'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Platform Grants ({grants.filter((g) => g.status === 'active').length} Active)
        </button>
        <button
          onClick={() => setActiveTab('allowlist')}
          className={`px-4 py-2.5 font-medium border-b-2 transition-colors ${
            activeTab === 'allowlist'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Verified Employee Allowlist ({allowlist.length})
        </button>
      </div>

      {/* Tab 1: Platform Grants */}
      {activeTab === 'grants' && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-4 shadow-sm">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg text-xs overflow-x-auto">
              {[
                { id: 'all', label: 'All Grants' },
                { id: 'portal_admin', label: 'Portal Admin' },
                { id: 'content_publisher', label: 'Content Publisher' },
                { id: 'learning_moderator', label: 'Learning Moderator' },
                { id: 'product_owner', label: 'Product Owner' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setGrantFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-md font-medium capitalize transition-colors whitespace-nowrap ${
                    grantFilter === tab.id
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search grants by email or title..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-medium">
                  <th className="py-3 px-3">Grant Role</th>
                  <th className="py-3 px-3">Authorized Employee</th>
                  <th className="py-3 px-3">Assigned By</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Operational Reason</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredGrants.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No platform grants found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredGrants.map((g) => (
                    <tr key={g.id} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-mono font-semibold text-primary">{g.grant}</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-foreground font-medium">{g.userEmail}</td>
                      <td className="py-3 px-3 text-muted-foreground">{g.grantedByName}</td>
                      <td className="py-3 px-3 text-muted-foreground font-mono">
                        {new Date(g.grantedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground max-w-xs truncate">{g.reason}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold capitalize ${
                            g.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {g.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {g.status === 'active' && (
                          <button
                            onClick={() => handleRevokeGrant(g.id)}
                            className="px-2 py-1 text-[11px] rounded text-destructive hover:bg-destructive/10 font-medium transition-colors"
                            title="Anti-lockout enforced: Cannot revoke last portal administrator"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Employee Allowlist */}
      {activeTab === 'allowlist' && (
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Azentio Verified Employee Directory (@azentio.com)
            </h3>
            <span className="text-xs text-muted-foreground">
              Only listed employees can be invited to internal workspaces or receive platform grants.
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-medium">
                  <th className="py-3 px-3">Employee Name</th>
                  <th className="py-3 px-3">Corporate Email</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Title</th>
                  <th className="py-3 px-3">Added Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {allowlist.map((emp) => (
                  <tr key={emp.id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-3 font-semibold text-foreground">{emp.name}</td>
                    <td className="py-3 px-3 font-mono text-primary font-medium">{emp.email}</td>
                    <td className="py-3 px-3 text-foreground">{emp.department}</td>
                    <td className="py-3 px-3 text-muted-foreground">{emp.title}</td>
                    <td className="py-3 px-3 text-muted-foreground font-mono">
                      {new Date(emp.addedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assign Grant Modal */}
      {showAssignModal && !showStepup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-2.5 border-b border-border pb-3">
              <KeyRound className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Assign Platform Grant</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Target Employee (@azentio.com)
                </label>
                <select
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Platform Grant Role
                </label>
                <select
                  value={selectedGrant}
                  onChange={(e) => setSelectedGrant(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="content_publisher">content_publisher (Publish Blogs/Cases/Banners)</option>
                  <option value="learning_moderator">learning_moderator (Observation Moderation)</option>
                  <option value="product_owner">product_owner (Manage Improvement Ideas)</option>
                  <option value="portal_admin">portal_admin (Full Admin Console + Governance)</option>
                </select>
              </div>

              {/* Dual Control Alert Warning */}
              {isDualControlRequired && (
                <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-semibold">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>Dual Control Governance Mandatory</span>
                  </div>
                  <p className="leading-relaxed">
                    Granting <strong>portal_admin</strong> or <strong>self-granting any role</strong> requires step-up verification and approval by a second platform administrator.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Operational Justification (minimum 5 characters)
                </label>
                <textarea
                  value={grantReason}
                  onChange={(e) => setGrantReason(e.target.value)}
                  placeholder="Detail why this employee requires elevated access..."
                  rows={3}
                  className="w-full p-2.5 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-3.5 py-2 text-xs font-medium rounded-lg border border-border hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={grantReason.trim().length < 5}
                  onClick={() => {
                    if (isDualControlRequired) {
                      setShowStepup(true);
                    } else {
                      handleAssignGrantSubmit();
                    }
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {isDualControlRequired ? 'Proceed to Step-Up' : 'Assign Grant Directly'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stepup Modal for Privileged Grant */}
      <StepupModal
        isOpen={showStepup}
        purpose={`Assign ${selectedGrant} grant to user`}
        onSuccess={handleAssignGrantSubmit}
        onCancel={() => setShowStepup(false)}
      />

      {/* Add Single Employee Allowlist Modal */}
      {showAddEmployeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6 space-y-4">
            <h3 className="font-semibold text-foreground text-sm">Add Employee to Verified Allowlist</h3>

            <form onSubmit={handleAddEmployee} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Full Name</label>
                <input
                  type="text"
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  placeholder="e.g. Cheteshwar Pujara"
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Corporate Email (@azentio.com required)
                </label>
                <input
                  type="email"
                  value={empEmail}
                  onChange={(e) => setEmpEmail(e.target.value)}
                  placeholder="e.g. cheteshwar_p@azentio.com"
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Department</label>
                <input
                  type="text"
                  value={empDept}
                  onChange={(e) => setEmpDept(e.target.value)}
                  placeholder="e.g. Product Engineering"
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Job Title</label>
                <input
                  type="text"
                  value={empTitle}
                  onChange={(e) => setEmpTitle(e.target.value)}
                  placeholder="e.g. Staff Architect"
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddEmployeeModal(false)}
                  className="px-3.5 py-2 text-xs font-medium rounded-lg border border-border hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Add to Allowlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Allowlist Modal */}
      {showBulkAllowlistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-card border border-border rounded-xl shadow-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <h3 className="font-semibold text-foreground text-sm">Bulk Allowlist Import (Dry-Run Preview)</h3>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-foreground">
                    Paste CSV Content (Format: <code>name,email,department,title</code>)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setBulkCsvText(
                        `name,email,department,title\nSachin Tendulkar,sachin_t@azentio.com,Engineering,Principal Specialist\nRahul Sharma,rahul_s@azentio.com,Compliance,Chief Risk Officer\nInvalid Domain,someone@gmail.com,Finance,Analyst`
                      )
                    }
                    className="text-[11px] text-primary hover:underline"
                  >
                    Insert Sample CSV
                  </button>
                </div>
                <textarea
                  value={bulkCsvText}
                  onChange={(e) => {
                    setBulkCsvText(e.target.value);
                    setBulkDryRun(null);
                  }}
                  rows={5}
                  placeholder="name,email,department,title..."
                  className="w-full p-2.5 text-xs font-mono rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={handleRunBulkDryRun}
                  disabled={!bulkCsvText.trim()}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-muted hover:bg-muted/80 text-foreground disabled:opacity-50"
                >
                  Run Validation
                </button>

                {bulkDryRun && (
                  <button
                    type="button"
                    onClick={handleExecuteBulkAllowlist}
                    disabled={bulkExecuting || bulkDryRun.valid.length === 0}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {bulkExecuting ? 'Adding...' : `Add ${bulkDryRun.valid.length} Valid Employees`}
                  </button>
                )}
              </div>

              {/* Dry-run table */}
              {bulkDryRun && (
                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-emerald-600 font-semibold">Valid: {bulkDryRun.valid.length}</span>
                    <span className="text-destructive font-semibold">Invalid: {bulkDryRun.errors.length}</span>
                  </div>

                  <div className="max-h-48 overflow-y-auto border border-border rounded-lg text-[11px]">
                    {bulkDryRun.valid.map((r, i) => (
                      <div key={i} className="p-2 border-b border-border/50 flex items-center justify-between bg-emerald-500/5">
                        <span className="font-mono">{r.email}</span>
                        <span className="text-emerald-600 font-semibold">Valid (@azentio.com)</span>
                      </div>
                    ))}
                    {bulkDryRun.errors.map((e, i) => (
                      <div key={i} className="p-2 border-b border-border/50 flex items-center justify-between bg-destructive/5 text-destructive">
                        <span className="font-mono">{e.email}</span>
                        <span>{e.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2 border-t border-border">
                <button
                  onClick={() => setShowBulkAllowlistModal(false)}
                  className="px-3.5 py-2 text-xs font-medium rounded-lg border border-border"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
