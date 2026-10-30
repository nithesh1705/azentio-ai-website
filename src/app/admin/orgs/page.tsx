'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import {
  Settings,
  Building2,
  Users,
  UserPlus,
  Trash2,
  Edit2,
  ShieldCheck,
  PlusCircle,
  X,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Layers,
  Lock,
  Globe,
  RefreshCw,
} from 'lucide-react';
import { Organisation, UserRecord } from '@/types';

export default function AdminOrgsManagementPage() {
  const { actor, refreshOrganisations } = usePersona();
  const isAdmin = actor.platformGrants.includes('portal_admin');

  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('org-azentio');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals state
  const [showAddOrgModal, setShowAddOrgModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);

  // New Org Form
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgDomain, setNewOrgDomain] = useState('');
  const [newOrgTier, setNewOrgTier] = useState<'Enterprise' | 'Core' | 'Standard'>('Enterprise');

  // New User Form
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('client_member');

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [orgsRes, usersRes] = await Promise.all([
        fetch('/api/admin/orgs'),
        fetch('/api/admin/users'),
      ]);

      if (orgsRes.ok) {
        const orgsData = await orgsRes.json();
        setOrganisations(orgsData.organisations || []);
        if (orgsData.organisations?.length > 0 && !selectedOrgId) {
          setSelectedOrgId(orgsData.organisations[0].id);
        }
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-destructive mx-auto" />
        <h1 className="text-2xl font-bold text-foreground">Portal Admin Access Restricted</h1>
        <p className="text-sm text-muted-foreground">
          Organisation and user governance requires the &ldquo;portal_admin&rdquo; platform grant.
          Please switch to Max Verstappen (Portal Admin) using the top persona switcher or sign-in page.
        </p>
      </div>
    );
  }

  const selectedOrg = organisations.find((o) => o.id === selectedOrgId) || organisations[0];
  const isSelectedOrgPlatform = selectedOrg?.id === 'org-azentio' || selectedOrg?.type === 'platform';
  const orgUsers = users.filter((u) => u.orgId === selectedOrg?.id);

  // Handle Add Organisation
  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName || !newOrgDomain) return;

    try {
      const res = await fetch('/api/admin/orgs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actor,
          name: newOrgName,
          domain: newOrgDomain,
          tier: newOrgTier,
          entitledOfferings: ['offering-fai', 'offering-cbe'],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setNotification({ type: 'success', message: `Organisation "${newOrgName}" created successfully.` });
      setShowAddOrgModal(false);
      setNewOrgName('');
      setNewOrgDomain('');
      await fetchData();
      await refreshOrganisations();
      setSelectedOrgId(data.organisation.id);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  // Handle Delete Organisation
  const handleDeleteOrg = async (orgId: string) => {
    if (orgId === 'org-azentio') {
      alert('The Azentio Platform organization cannot be deleted.');
      return;
    }

    if (!confirm('Are you sure you want to delete this organisation? All its member users will be removed.')) {
      return;
    }

    try {
      const res = await fetch('/api/admin/orgs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actor, orgId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setNotification({ type: 'success', message: 'Organisation deleted and tenant records purged.' });
      await fetchData();
      await refreshOrganisations();
      setSelectedOrgId('org-azentio');
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  // Handle Add User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !selectedOrg) return;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actor,
          name: newUserName,
          email: newUserEmail,
          orgId: selectedOrg.id,
          role: newUserRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setNotification({
        type: 'success',
        message: `User ${data.user.name} added to ${selectedOrg.name} as "${newUserRole}".`,
      });
      setShowAddUserModal(false);
      setNewUserName('');
      setNewUserEmail('');
      await fetchData();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  // Handle Edit User
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actor,
          userId: editingUser.id,
          name: editingUser.name,
          email: editingUser.email,
          role: editingUser.role,
          orgId: editingUser.orgId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setNotification({
        type: 'success',
        message: `Updated user ${editingUser.name}.`,
      });
      setEditingUser(null);
      await fetchData();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to remove user "${email}"?`)) return;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actor, userId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setNotification({ type: 'success', message: `User "${email}" removed from database.` });
      await fetchData();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    }
  };

  // Role choices depending on Org
  const azentioRoles = [
    { value: 'employee', label: 'Employee (Base Platform)' },
    { value: 'learning_moderator', label: 'Learning Moderator (Queue & Review)' },
    { value: 'content_publisher', label: 'Content Publisher (Banners & Media)' },
    { value: 'product_owner', label: 'Product Owner (Improvement Loop)' },
    { value: 'portal_admin', label: 'Portal Administrator (Full Admin)' },
  ];

  const clientRoles = [
    { value: 'client_member', label: 'Client Member (Observations & Sandboxes)' },
    { value: 'client_admin', label: 'Client Administrator (Manage Org Members)' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs uppercase tracking-widest font-bold text-rose-500">
              Portal Governance Console
            </span>
            <span className="badge-synthetic text-xs">Admin Audit Active</span>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
            Organisation & User IAM Management
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Manage organizations (Azentio, ABCD, XYZ), create/remove tenants, and administer user CRUD with role segregation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddOrgModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-md shadow-emerald-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Organisation</span>
          </button>

          <Link
            href="/admin/audit"
            className="px-4 py-2.5 rounded-xl bg-card border border-border text-xs font-semibold text-foreground hover:bg-muted transition-all"
          >
            <span>View Audit Logs</span>
          </Link>
        </div>
      </div>

      {/* Notifications banner */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-6 p-4 rounded-2xl border text-xs flex items-center justify-between ${
              notification.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                : 'bg-destructive/10 border-destructive/20 text-destructive'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-destructive" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="font-bold hover:underline ml-4"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Organisation Navigation Tabs */}
      <div className="mb-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border">
          {organisations.map((org) => {
            const isPlatform = org.id === 'org-azentio' || org.type === 'platform';
            const isSelected = selectedOrg?.id === org.id;

            return (
              <button
                key={org.id}
                onClick={() => setSelectedOrgId(org.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {isPlatform ? (
                  <Building2 className="w-4 h-4 text-indigo-400" />
                ) : (
                  <Globe className="w-4 h-4 text-emerald-500" />
                )}
                <span>{org.name}</span>
                <span className="text-[10px] opacity-75 font-mono">({users.filter(u => u.orgId === org.id).length})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Organisation Workspace Detail */}
      {selectedOrg && (
        <div className="space-y-8">
          {/* Org Summary Card */}
          <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-border flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    isSelectedOrgPlatform
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                  }`}
                >
                  {isSelectedOrgPlatform ? 'Platform Master Organisation' : `${selectedOrg.tier} Client Tenant`}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  Domain: {selectedOrg.domain}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-foreground">{selectedOrg.name}</h2>
              <p className="text-xs text-muted-foreground">
                {isSelectedOrgPlatform
                  ? 'Internal Azentio engineering, moderation, product management, and platform administration team.'
                  : `Isolated client workspace with entitled product sandboxes and granular member access.`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setNewUserRole(isSelectedOrgPlatform ? 'employee' : 'client_member');
                  setShowAddUserModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add User to {selectedOrg.slug}</span>
              </button>

              {!isSelectedOrgPlatform && (
                <button
                  onClick={() => handleDeleteOrg(selectedOrg.id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 text-xs font-semibold hover:bg-destructive/20 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Organisation</span>
                </button>
              )}
            </div>
          </div>

          {/* Users Table for the selected Org */}
          <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-border">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-base text-foreground">
                  Registered Users in {selectedOrg.name} ({orgUsers.length})
                </h3>
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                Roles restricted by organisation type
              </span>
            </div>

            <div className="mt-6 space-y-3">
              {orgUsers.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl">
                  No users currently assigned to this organisation. Click &ldquo;Add User&rdquo; above.
                </div>
              ) : (
                orgUsers.map((u) => {
                  const isPlatformRole = ['employee', 'learning_moderator', 'content_publisher', 'product_owner', 'portal_admin'].includes(u.role);

                  return (
                    <div
                      key={u.id}
                      className="p-4 rounded-2xl bg-muted/30 border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-foreground">{u.name}</span>
                          <span
                            className={`text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded ${
                              isPlatformRole
                                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            }`}
                          >
                            {u.role.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">{u.email}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingUser(u)}
                          className="p-2 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted text-xs"
                          title="Edit User"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteUser(u.id, u.email)}
                          className="p-2 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 text-xs"
                          title="Remove User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Organisation */}
      <AnimatePresence>
        {showAddOrgModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-card border border-border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-foreground">Create New Client Organisation</h3>
                <button
                  onClick={() => setShowAddOrgModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateOrg} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Organisation Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    placeholder="e.g. Apex Global Bank"
                    className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Corporate Domain
                  </label>
                  <input
                    type="text"
                    required
                    value={newOrgDomain}
                    onChange={(e) => setNewOrgDomain(e.target.value)}
                    placeholder="e.g. apexbank.com"
                    className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Tier
                  </label>
                  <select
                    value={newOrgTier}
                    onChange={(e) => setNewOrgTier(e.target.value as any)}
                    className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Enterprise">Enterprise</option>
                    <option value="Core">Core</option>
                    <option value="Standard">Standard</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowAddOrgModal(false)}
                    className="px-4 py-2 rounded-xl text-muted-foreground hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
                  >
                    Create Organisation
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Add User */}
      <AnimatePresence>
        {showAddUserModal && selectedOrg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-card border border-border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-foreground">Add User to {selectedOrg.name}</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Assign role appropriate for {isSelectedOrgPlatform ? 'Azentio Platform' : 'Client Organisation'}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Work Email
                  </label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder={`user@${selectedOrg.domain}`}
                    className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Assigned Role ({isSelectedOrgPlatform ? 'Azentio Platform Roles' : 'Client Tenant Roles'})
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {isSelectedOrgPlatform
                      ? azentioRoles.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))
                      : clientRoles.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                    className="px-4 py-2 rounded-xl text-muted-foreground hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
                  >
                    Save User to Database
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Edit User */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-card border border-border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-foreground">Edit User Account</h3>
                <button
                  onClick={() => setEditingUser(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateUser} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Role
                  </label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {editingUser.orgId === 'org-azentio'
                      ? azentioRoles.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))
                      : clientRoles.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 rounded-xl text-muted-foreground hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
                  >
                    Update User
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
