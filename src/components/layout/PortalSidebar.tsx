'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import {
  Building2,
  Terminal,
  ShieldCheck,
  FileText,
  PlusCircle,
  BrainCircuit,
  TrendingUp,
  Cpu,
  Layers,
  Users,
  Settings,
  Radio,
  BookOpen,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ChevronDown,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

export function PortalSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { actor, currentPersonaKey, setPersona, activeTenant, setActiveTenantId, availableOrganisations } = usePersona();
  const [collapsed, setCollapsed] = useState(false);
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);

  // Only render on portal routes or when explicitly authenticated
  const isPortalRoute =
    pathname.startsWith('/client') ||
    pathname.startsWith('/employee') ||
    pathname.startsWith('/moderation') ||
    pathname.startsWith('/publisher') ||
    pathname.startsWith('/admin');

  const isPublic = currentPersonaKey === 'public' && actor.userId === 'usr-anonymous';

  // Do not render sidebar on purely public informational pages unless user is authenticated and navigating portal
  if (!isPortalRoute && isPublic) {
    return null;
  }

  const isEmployee = actor.isVerifiedEmployee;
  const isClient = actor.memberships && actor.memberships.length > 0;
  const isModerator = actor.platformGrants.includes('learning_moderator');
  const isPublisher = actor.platformGrants.includes('content_publisher');
  const isProductOwner = actor.platformGrants.includes('product_owner');
  const isAdmin = actor.platformGrants.includes('portal_admin');
  const isClientAdmin = actor.memberships.some(
    (m) => m.orgId === actor.activeTenantId && m.role === 'client_admin'
  );

  // Available client memberships for multi-org tenant switching
  const userClientMemberships = actor.memberships || [];
  const hasMultipleOrgs = userClientMemberships.length > 1;

  const handleSignOut = () => {
    setPersona('public');
    router.push('/');
  };

  return (
    <aside
      className={`relative z-30 shrink-0 border-r border-border/80 bg-card/60 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Section */}
      <div className="p-3.5 space-y-4">
        {/* Workspace Brand & Collapse Toggle */}
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-sm font-bold text-xs">
                AI
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xs tracking-tight text-foreground">
                  Workspace Portal
                </span>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                  {isEmployee ? 'Azentio Platform' : 'Client Tenant'}
                </span>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-xs mx-auto">
              AI
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Organisation Selector / Indicator */}
        {!collapsed ? (
          <div className="relative">
            {hasMultipleOrgs ? (
              <div>
                <button
                  onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
                  className="w-full p-2.5 rounded-xl border border-border/80 bg-card hover:bg-accent text-left transition-all flex items-center justify-between text-xs group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Building2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div className="truncate">
                      <div className="font-bold text-foreground truncate">
                        {activeTenant ? activeTenant.name : 'Select Tenant'}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {activeTenant?.domain}
                      </div>
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-transform shrink-0" />
                </button>

                <AnimatePresence>
                  {orgDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute left-0 right-0 top-full mt-1.5 rounded-xl bg-card border border-border shadow-xl p-1.5 z-50 space-y-1"
                    >
                      <div className="text-[10px] uppercase font-bold text-muted-foreground px-2 py-1">
                        Switch Active Tenant
                      </div>
                      {userClientMemberships.map((m) => {
                        const org = availableOrganisations.find((o) => o.id === m.orgId);
                        const isCurrent = actor.activeTenantId === m.orgId;
                        return (
                          <button
                            key={m.orgId}
                            onClick={() => {
                              setActiveTenantId(m.orgId);
                              setOrgDropdownOpen(false);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                              isCurrent
                                ? 'bg-primary/10 text-primary font-bold'
                                : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <span className="truncate">{org ? org.name : m.orgId}</span>
                            <span className="text-[9px] uppercase font-mono px-1 py-0.2 rounded bg-muted">
                              {m.role}
                            </span>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl border border-border/60 bg-muted/30 text-xs flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <div className="truncate">
                  <div className="font-bold text-foreground truncate text-[11px]">
                    {isEmployee ? 'Azentio Platform' : activeTenant ? activeTenant.name : 'Client Portal'}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono truncate">
                    {isEmployee ? 'azentio.com' : activeTenant?.domain || 'Multi-Tenant'}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center" title={activeTenant?.name || 'Organisation'}>
            <Building2 className="w-5 h-5 text-emerald-500" />
          </div>
        )}

        {/* Navigation Sections */}
        <div className="space-y-6 pt-1 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
          {/* Client Navigation */}
          {isClient && (
            <div className="space-y-1">
              {!collapsed && (
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-1.5 flex items-center justify-between">
                  <span>Client Workspace</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-500/10 text-cyan-500 font-mono">
                    Tenant
                  </span>
                </div>
              )}
              <SidebarItem
                href="/client"
                icon={Layers}
                label="Workspace Hub"
                active={pathname === '/client'}
                collapsed={collapsed}
              />
              <SidebarItem
                href="/client/demos"
                icon={Cpu}
                label="Entitled Sandboxes"
                active={pathname === '/client/demos'}
                collapsed={collapsed}
              />
              <SidebarItem
                href="/client/observations"
                icon={FileText}
                label="My Observations"
                active={pathname === '/client/observations'}
                collapsed={collapsed}
              />
              <SidebarItem
                href="/client/observations/new"
                icon={PlusCircle}
                label="Submit Observation"
                active={pathname === '/client/observations/new'}
                collapsed={collapsed}
              />
              <SidebarItem
                href="/client/shared"
                icon={BrainCircuit}
                label="Collective Feed"
                active={pathname === '/client/shared'}
                collapsed={collapsed}
              />
              <SidebarItem
                href="/client/themes"
                icon={TrendingUp}
                label="Safe Trend Themes"
                active={pathname === '/client/themes'}
                collapsed={collapsed}
              />
              {isClientAdmin && (
                <SidebarItem
                  href="/client/admin/members"
                  icon={Users}
                  label="Team & Invitations"
                  active={pathname === '/client/admin/members'}
                  collapsed={collapsed}
                />
              )}
            </div>
          )}

          {/* Employee Navigation */}
          {isEmployee && (
            <div className="space-y-1">
              {!collapsed && (
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-1.5 flex items-center justify-between">
                  <span>Employee Portal</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-500 font-mono">
                    Internal
                  </span>
                </div>
              )}
              <SidebarItem
                href="/employee"
                icon={Terminal}
                label="Overview"
                active={pathname === '/employee'}
                collapsed={collapsed}
              />
              <SidebarItem
                href="/employee/playground"
                icon={Sparkles}
                label="Guided Playground"
                active={pathname === '/employee/playground'}
                collapsed={collapsed}
              />
              <SidebarItem
                href="/employee/live"
                icon={Radio}
                label="Live Broadcast"
                active={pathname === '/employee/live'}
                collapsed={collapsed}
              />
              <SidebarItem
                href="/employee/knowledge"
                icon={BookOpen}
                label="Knowledge Library"
                active={pathname === '/employee/knowledge'}
                collapsed={collapsed}
              />
              <SidebarItem
                href="/employee/experiments"
                icon={Cpu}
                label="Innovation Lab"
                active={pathname === '/employee/experiments'}
                collapsed={collapsed}
              />
              <SidebarItem
                href="/employee/releases"
                icon={Layers}
                label="Releases & Changes"
                active={pathname === '/employee/releases'}
                collapsed={collapsed}
              />

              {/* Product Owner Improvement Loop */}
              {isProductOwner && (
                <SidebarItem
                  href="/employee/ideas"
                  icon={TrendingUp}
                  label="Product Ideas Backlog"
                  active={pathname === '/employee/ideas'}
                  collapsed={collapsed}
                />
              )}
            </div>
          )}

          {/* Governance & Administration Section */}
          {(isModerator || isPublisher || isAdmin) && (
            <div className="space-y-1 pt-2 border-t border-border/50">
              {!collapsed && (
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-1.5 flex items-center justify-between">
                  <span>Governance & Admin</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-rose-500/10 text-rose-500 font-mono">
                    Privileged
                  </span>
                </div>
              )}

              {isModerator && (
                <SidebarItem
                  href="/moderation/queue"
                  icon={ShieldCheck}
                  label="Moderation Queue"
                  active={pathname.startsWith('/moderation')}
                  collapsed={collapsed}
                />
              )}

              {isPublisher && (
                <SidebarItem
                  href="/publisher/content"
                  icon={FileText}
                  label="Content Publisher"
                  active={pathname.startsWith('/publisher')}
                  collapsed={collapsed}
                />
              )}

              {isAdmin && (
                <>
                  <SidebarItem
                    href="/admin/orgs"
                    icon={Building2}
                    label="Manage Organisations"
                    active={pathname === '/admin/orgs'}
                    collapsed={collapsed}
                  />
                  <SidebarItem
                    href="/admin/audit"
                    icon={ShieldAlert}
                    label="Security Audit Trail"
                    active={pathname === '/admin/audit'}
                    collapsed={collapsed}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom User Profile & Sign Out Section */}
      <div className="p-3 border-t border-border/70 space-y-2 bg-card/40">
        {!collapsed ? (
          <div className="p-2 rounded-xl bg-card border border-border/60 flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-xs shrink-0">
                {actor.name.charAt(0)}
              </div>
              <div className="truncate">
                <div className="font-semibold text-xs text-foreground truncate">{actor.name}</div>
                <div className="text-[10px] text-muted-foreground font-mono truncate">{actor.email}</div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleSignOut}
            className="w-full p-2 rounded-xl text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors flex justify-center"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}

        {/* Back to Public View Link */}
        <Link
          href="/"
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
          title="Return to Public Website"
        >
          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          {!collapsed && <span>Public Website</span>}
        </Link>
      </div>
    </aside>
  );
}

function SidebarItem({
  href,
  icon: Icon,
  label,
  active,
  collapsed,
}: {
  href: string;
  icon: any;
  label: string;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-all ${
        active
          ? 'bg-primary text-primary-foreground font-semibold shadow-sm shadow-primary/20'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent/70'
      } ${collapsed ? 'justify-center px-0' : ''}`}
      title={collapsed ? label : undefined}
    >
      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-primary-foreground' : 'text-emerald-500'}`} />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}

