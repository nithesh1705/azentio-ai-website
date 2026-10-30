'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import {
  Terminal,
  Radio,
  Lightbulb,
  BookOpen,
  FlaskConical,
  Layers,
  Sparkles,
  Users,
  Search,
  Bell,
  Menu,
  X,
  ChevronRight,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  Building2,
  ExternalLink,
  ChevronDown,
  BrainCircuit,
  FileText,
  AlertCircle,
} from 'lucide-react';

interface EmployeeNavCategory {
  title?: string;
  items: {
    href: string;
    label: string;
    icon: React.ElementType;
    badge?: string;
    grantRequired?: string;
  }[];
}

const EMPLOYEE_NAV: EmployeeNavCategory[] = [
  {
    items: [
      { href: '/employee', label: 'Dashboard', icon: Terminal },
      { href: '/employee/playground', label: 'Playground', icon: Sparkles, badge: 'Synthetic' },
      { href: '/employee/live', label: 'Live Broadcasts', icon: Radio, badge: 'Stream' },
      { href: '/employee/experiments', label: 'Experiments', icon: FlaskConical },
      { href: '/employee/teams', label: 'Hackathon Teams', icon: Users },
      { href: '/employee/knowledge', label: 'Knowledge Library', icon: BookOpen },
      { href: '/employee/releases', label: 'Release Notes', icon: Layers },
      { href: '/employee/ideas', label: 'Assigned Ideas', icon: Lightbulb },
      { href: '/employee/learning', label: 'Learning Work', icon: BrainCircuit },
    ],
  },
  {
    title: 'Privileged Grants',
    items: [
      {
        href: '/moderation/queue',
        label: 'Moderation Queue',
        icon: ShieldCheck,
        grantRequired: 'learning_moderator',
      },
      {
        href: '/publisher/content',
        label: 'Content Publisher',
        icon: FileText,
        grantRequired: 'content_publisher',
      },
      {
        href: '/admin/orgs',
        label: 'Portal Admin',
        icon: Building2,
        grantRequired: 'portal_admin',
      },
    ],
  },
];

export function EmployeeShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { actor, setPersona } = usePersona();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
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
        setUserDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Access check: Gate 1 + Gate 2
  const isEmployee = actor.isVerifiedEmployee;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/employee/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Compute breadcrumb path parts
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbItems = pathSegments.map((segment, index) => {
    const href = '/' + pathSegments.slice(0, index + 1).join('/');
    const title = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    return { href, title, isLast: index === pathSegments.length - 1 };
  });

  if (!isEmployee) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-16">
        <div className="max-w-md w-full glass-panel p-8 rounded-3xl border border-border text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto border border-destructive/20">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Employee Portal Restricted</h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Access to this space requires an active identity with a verified <code className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono">@azentio.com</code> domain and provisioning in the authorized employee allowlist.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/signin"
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
            >
              Sign In with Authorized Employee Credentials
            </Link>
            <Link
              href="/"
              className="w-full py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground text-xs font-semibold hover:bg-accent transition-all"
            >
              Return to Public Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const renderNavLinks = () => (
    <div className="space-y-6">
      {EMPLOYEE_NAV.map((group, groupIdx) => {
        // Filter items based on user grants
        const visibleItems = group.items.filter((item) => {
          if (!item.grantRequired) return true;
          return actor.platformGrants.includes(item.grantRequired);
        });

        if (visibleItems.length === 0) return null;

        return (
          <div key={groupIdx} className="space-y-1">
            {group.title && (
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 px-3 mb-1.5 flex items-center justify-between">
                <span>{group.title}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            )}
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/employee'
                  ? pathname === '/employee'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-primary/10 text-primary font-bold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-md font-mono bg-muted font-bold text-muted-foreground uppercase">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* ── TOP BAR (Sticky) ───────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 h-16 border-b border-border/80 bg-background/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0">
        {/* Left: Mobile hamburger + Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="lg:hidden p-2 rounded-xl border border-border/60 hover:bg-accent text-muted-foreground hover:text-foreground"
            aria-label="Open navigation drawer"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop Logo Link */}
          <Link href="/employee" className="hidden lg:flex items-center gap-2 group mr-2">
            <Image
              src="/logo.png"
              alt="Azentio Logo"
              width={30}
              height={30}
              className="w-7 h-7 rounded-lg object-contain shadow-sm group-hover:scale-105 transition-transform"
              priority
            />
            <span className="font-extrabold text-xs tracking-tight text-foreground">
              azentio.ai
            </span>
          </Link>

          {/* Breadcrumb Trail */}
          <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground truncate">
            <Link href="/employee" className="hover:text-foreground transition-colors font-medium">
              Employee
            </Link>
            {breadcrumbItems.slice(1).map((item) => (
              <React.Fragment key={item.href}>
                <ChevronRight className="w-3.5 h-3.5 opacity-40 shrink-0" />
                {item.isLast ? (
                  <span className="font-bold text-foreground truncate">{item.title}</span>
                ) : (
                  <Link href={item.href} className="hover:text-foreground transition-colors truncate">
                    {item.title}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Center: Global Employee Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-2">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search experiments, knowledge, releases, teams..."
              className="w-full bg-muted/50 hover:bg-muted/70 pl-8 pr-4 py-1.5 rounded-xl text-xs text-foreground placeholder:text-muted-foreground border border-border/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />
          </form>
        </div>

        {/* Right Actions: Notifications, Theme, User Menu */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Notification Bell */}
          <Link
            href="/notifications"
            className="relative p-2 rounded-xl border border-border/60 bg-card hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            title="Notification Center"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </Link>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Profile Button */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl border border-border/60 bg-card hover:bg-accent transition-all text-xs font-semibold shadow-xs"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold text-[11px] shrink-0">
                {actor.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline font-semibold text-foreground truncate max-w-[100px]">
                {actor.name}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {userDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-card border border-border shadow-2xl p-2 z-50 space-y-1"
                >
                  <div className="px-3 py-2 border-b border-border/60">
                    <div className="font-bold text-xs text-foreground">{actor.name}</div>
                    <div className="text-[10px] text-muted-foreground font-mono truncate">{actor.email}</div>
                    <div className="mt-1 flex items-center gap-1">
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 font-bold uppercase font-mono">
                        Verified Employee
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/account"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium hover:bg-accent text-foreground transition-colors"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Account Settings</span>
                  </Link>

                  <Link
                    href="/"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium hover:bg-accent text-foreground transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Public Website</span>
                  </Link>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      setPersona('public');
                      window.location.href = '/';
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* ── MAIN WORKSPACE AREA: SIDEBAR + CONTENT ─────────────────────────── */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Desktop Fixed Left Sidebar (≥1024px) */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-border/80 bg-card/60 backdrop-blur-md shrink-0 select-none">
          {/* Top Brand Banner */}
          <div className="p-4 border-b border-border/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs border border-emerald-500/20">
                <Terminal className="w-4 h-4" />
              </div>
              <div className="leading-tight">
                <div className="font-extrabold text-xs text-foreground">Employee Portal</div>
                <div className="text-[10px] text-muted-foreground font-mono">Platform Workspace</div>
              </div>
            </div>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold uppercase font-mono">
              Internal
            </span>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto p-3.5">
            {renderNavLinks()}
          </div>

          {/* Bottom Session Footer */}
          <div className="p-3 border-t border-border/60 text-[10px] text-muted-foreground flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Allowlist Verified</span>
            </span>
            <span className="font-mono">v1.0-2026</span>
          </div>
        </aside>

        {/* Mobile Slide-in Drawer (<1024px) */}
        <AnimatePresence>
          {mobileDrawerOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileDrawerOpen(false)}
                className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs"
              />

              {/* Drawer Container with Focus Trap */}
              <motion.div
                ref={drawerRef}
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 280 }}
                className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-background border-r border-border shadow-2xl flex flex-col"
              >
                {/* Drawer Header */}
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Image
                      src="/logo.png"
                      alt="Azentio Logo"
                      width={28}
                      height={28}
                      className="w-7 h-7 rounded-lg object-contain"
                    />
                    <span className="font-extrabold text-sm text-foreground">Employee Portal</span>
                  </div>
                  <button
                    onClick={() => setMobileDrawerOpen(false)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
                    aria-label="Close drawer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Search */}
                <div className="p-3 border-b border-border">
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search employee tools..."
                      className="w-full bg-muted/60 pl-8 pr-3 py-1.5 rounded-xl text-xs text-foreground border border-border"
                    />
                  </form>
                </div>

                {/* Drawer Links */}
                <div className="flex-1 overflow-y-auto p-4">
                  {renderNavLinks()}
                </div>

                {/* Drawer Footer */}
                <div className="p-4 border-t border-border">
                  <button
                    onClick={() => {
                      setPersona('public');
                      window.location.href = '/';
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold text-destructive bg-destructive/10 hover:bg-destructive/20 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
