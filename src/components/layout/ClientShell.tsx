'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import {
  Building2,
  FileText,
  PlusCircle,
  TrendingUp,
  Cpu,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Layers,
  AlertCircle,
  Users,
  Search,
  Bell,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  LogOut,
  User as UserIcon,
  Bookmark,
  BookOpen,
  Lightbulb,
  GraduationCap,
  FolderOpen,
  Check,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface ClientNavCategory {
  title?: string;
  items: {
    href: string;
    label: string;
    icon: React.ElementType;
    badge?: string;
    adminOnly?: boolean;
  }[];
}

const CLIENT_NAV: ClientNavCategory[] = [
  {
    items: [
      { href: '/client', label: 'Dashboard', icon: Building2 },
      { href: '/client/demos', label: 'Entitled Demos', icon: Cpu, badge: 'Sandbox' },
      { href: '/client/observations', label: 'Observations', icon: FileText },
      { href: '/client/shared', label: 'Shared Learning', icon: Sparkles },
      { href: '/client/themes', label: 'Market Themes', icon: TrendingUp },
      { href: '/client/ideas', label: 'Product Ideas', icon: Lightbulb },
      { href: '/client/saved', label: 'Saved & Bookmarks', icon: Bookmark },
      { href: '/client/resources', label: 'Client Resources', icon: BookOpen },
    ],
  },
  {
    title: 'Organisation Administration',
    items: [
      { href: '/client/admin/members', label: 'Members & Invites', icon: Users, adminOnly: true },
      { href: '/client/admin', label: 'Organisation Overview', icon: Building2, adminOnly: true },
      { href: '/client/admin/observations', label: 'Observation Oversight', icon: ShieldCheck, adminOnly: true },
    ],
  },
];

export function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { actor, activeTenant, availableOrganisations, setActiveTenantId, setPersona } = usePersona();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close mobile drawer on route change or Esc key
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileDrawerOpen(false);
        setWorkspaceDropdownOpen(false);
        setUserDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/client/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSwitchTenant = (orgId: string) => {
    setActiveTenantId(orgId);
    setWorkspaceDropdownOpen(false);
    router.refresh();
  };

  const isClientAdmin = actor.memberships?.some(
    (m) => m.orgId === actor.activeTenantId && m.role === 'client_admin'
  );

  const activeMemberships = actor.memberships?.filter((m) => m.status === 'active') || [];
  const hasMultipleMemberships = activeMemberships.length > 1;

  // Breadcrumbs generator
  const getBreadcrumbs = () => {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length <= 1) return null;

    return (
      <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/client" className="hover:text-foreground transition-colors font-medium">
          {activeTenant ? activeTenant.name : 'Client Portal'}
        </Link>
        {parts.slice(1).map((part, index) => {
          const href = `/${parts.slice(0, index + 2).join('/')}`;
          const isLast = index === parts.slice(1).length - 1;
          const formatted = part
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

          return (
            <React.Fragment key={href}>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
              {isLast ? (
                <span className="font-semibold text-foreground truncate max-w-[150px]">{formatted}</span>
              ) : (
                <Link href={href} className="hover:text-foreground transition-colors truncate max-w-[120px]">
                  {formatted}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased selection:bg-emerald-500/20 selection:text-emerald-500">
      {/* 1. TOP STICKY BAR */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-card/80 backdrop-blur-md transition-colors">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6 gap-4">
          {/* Left: Mobile hamburger + Active Workspace Badge & Switcher */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-border text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label="Open navigation menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Logo link to /client */}
            <Link href="/client" className="hidden lg:flex items-center gap-2 group">
              <Image
                src="/logo.png"
                alt="Azentio Logo"
                width={26}
                height={26}
                className="w-6 h-6 rounded-lg object-contain group-hover:scale-105 transition-transform"
              />
              <span className="font-extrabold text-sm tracking-tight text-foreground">azentio.ai</span>
            </Link>

            <span className="hidden lg:inline text-muted-foreground/40 font-light">|</span>

            {/* Active Workspace Switcher Dropdown */}
            <div className="relative">
              {activeTenant ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => hasMultipleMemberships && setWorkspaceDropdownOpen(!workspaceDropdownOpen)}
                    disabled={!hasMultipleMemberships}
                    className={`flex items-center gap-2 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all ${
                      hasMultipleMemberships
                        ? 'bg-card border-border hover:bg-muted hover:border-primary/40 cursor-pointer shadow-xs'
                        : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 cursor-default'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="font-bold truncate max-w-[140px] sm:max-w-[200px] text-foreground">
                      {activeTenant.name}
                    </span>
                    {hasMultipleMemberships && (
                      <ChevronDown className="w-3 h-3 text-muted-foreground ml-0.5" />
                    )}
                  </button>

                  <span className="hidden md:inline px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {isClientAdmin ? 'Client Admin' : 'Client Member'}
                  </span>
                </div>
              ) : (
                <Link
                  href="/choose-workspace"
                  className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Select Workspace</span>
                </Link>
              )}

              {/* Workspace Switcher Menu */}
              {workspaceDropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 rounded-2xl border border-border bg-card p-2 shadow-xl z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/60 mb-1">
                    Select Active Workspace
                  </div>
                  <div className="space-y-1">
                    {activeMemberships.map((m) => {
                      const org = availableOrganisations.find((o) => o.id === m.orgId);
                      const isSelected = m.orgId === actor.activeTenantId;
                      return (
                        <button
                          key={m.orgId}
                          onClick={() => handleSwitchTenant(m.orgId)}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-all ${
                            isSelected
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : 'text-foreground hover:bg-muted'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            <span className="truncate">{org?.name || m.orgId}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                  <div className="pt-2 mt-1 border-t border-border/60">
                    <Link
                      href="/choose-workspace"
                      onClick={() => setWorkspaceDropdownOpen(false)}
                      className="block text-center text-[11px] text-primary hover:underline font-semibold py-1"
                    >
                      Manage All Workspaces
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Breadcrumb path */}
            <div className="ml-2 hidden xl:block">{getBreadcrumbs()}</div>
          </div>

          {/* Right: Search, Notifications, Theme, User Menu */}
          <div className="flex items-center gap-2.5">
            {/* Global Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative hidden md:block">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search observations, themes, demos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 lg:w-64 pl-8 pr-3 py-1.5 rounded-xl border border-input bg-background text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20"
              />
            </form>

            {/* Notifications Bell */}
            <Link
              href="/notifications"
              className="relative p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground text-xs"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-background" />
            </Link>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs transition-all focus:outline-none"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-[11px]">
                  {actor.name ? actor.name.charAt(0) : 'C'}
                </div>
                <span className="hidden sm:inline font-semibold text-foreground max-w-[100px] truncate">
                  {actor.name}
                </span>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-border bg-card p-2 shadow-xl z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-border/60 mb-1">
                    <p className="text-xs font-bold text-foreground truncate">{actor.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{actor.email}</p>
                  </div>
                  <div className="space-y-1">
                    <Link
                      href="/account"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-foreground hover:bg-muted"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>Account Settings</span>
                    </Link>
                    {hasMultipleMemberships && (
                      <Link
                        href="/choose-workspace"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-foreground hover:bg-muted"
                      >
                        <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>Switch Workspace</span>
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setPersona('public');
                        router.push('/signin');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 2. BODY LAYOUT: DESKTOP SIDEBAR + MAIN SCROLLABLE CONTENT */}
      <div className="flex-1 flex min-h-0">
        {/* Desktop Fixed Left Sidebar (≥1024px) */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card shrink-0">
          <div className="p-4 flex-1 overflow-y-auto space-y-6">
            {CLIENT_NAV.map((category, idx) => {
              // Filter out admin-only items if current user is not client_admin
              const visibleItems = category.items.filter((item) => !item.adminOnly || isClientAdmin);
              if (visibleItems.length === 0) return null;

              return (
                <div key={idx} className="space-y-1">
                  {category.title && (
                    <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {category.title}
                    </div>
                  )}

                  <div className="space-y-0.5">
                    {visibleItems.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        item.href === '/client'
                          ? pathname === '/client'
                          : pathname.startsWith(item.href);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                            isActive
                              ? 'bg-primary text-primary-foreground shadow-xs'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon
                              className={`w-4 h-4 transition-colors ${
                                isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                              }`}
                            />
                            <span>{item.label}</span>
                          </div>

                          {item.badge && (
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md ${
                                isActive
                                  ? 'bg-primary-foreground/20 text-primary-foreground'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick contribute shortcut */}
          <div className="p-4 border-t border-border">
            <Link
              href="/client/observations/new"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Observation</span>
            </Link>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto min-w-0">{children}</main>
      </div>

      {/* 3. MOBILE SLIDE-IN DRAWER (<1024px with Focus Trap & Esc) */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileDrawerOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.div
              ref={drawerRef}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-80 max-w-[85vw] h-full bg-card border-r border-border p-5 flex flex-col justify-between shadow-2xl overflow-y-auto"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Image
                      src="/logo.png"
                      alt="Azentio Logo"
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded-lg object-contain"
                    />
                    <span className="font-bold text-sm text-foreground">Client Workspace</span>
                  </div>
                  <button
                    onClick={() => setMobileDrawerOpen(false)}
                    className="p-1 rounded-xl text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Search Input */}
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search client content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-input bg-background text-xs outline-none"
                  />
                </form>

                {/* Nav Links */}
                <div className="space-y-4">
                  {CLIENT_NAV.map((category, idx) => {
                    const visibleItems = category.items.filter((item) => !item.adminOnly || isClientAdmin);
                    if (visibleItems.length === 0) return null;

                    return (
                      <div key={idx} className="space-y-1">
                        {category.title && (
                          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            {category.title}
                          </div>
                        )}
                        <div className="space-y-1">
                          {visibleItems.map((item) => {
                            const Icon = item.icon;
                            const isActive =
                              item.href === '/client'
                                ? pathname === '/client'
                                : pathname.startsWith(item.href);

                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileDrawerOpen(false)}
                                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold ${
                                  isActive
                                    ? 'bg-primary text-primary-foreground font-bold'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <Icon className="w-4 h-4" />
                                  <span>{item.label}</span>
                                </div>
                                {item.badge && (
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-secondary text-secondary-foreground">
                                    {item.badge}
                                  </span>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-border space-y-2">
                <Link
                  href="/client/observations/new"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>New Observation</span>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
