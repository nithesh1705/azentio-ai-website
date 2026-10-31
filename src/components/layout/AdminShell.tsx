'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import {
  LayoutDashboard,
  Building2,
  Users,
  KeyRound,
  ShieldCheck,
  Layers,
  FileText,
  BookOpen,
  Award,
  MessageSquareQuote,
  Megaphone,
  HelpCircle,
  Image as ImageIcon,
  CheckSquare,
  Bell,
  LifeBuoy,
  History,
  Sliders,
  Inbox,
  Activity,
  Search,
  Menu,
  X,
  ChevronRight,
  LogOut,
  User as UserIcon,
  ShieldAlert,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  exact?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
  requiresContentPublisher?: boolean;
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { actor, setPersona } = usePersona();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(2);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const drawerRef = useRef<HTMLDivElement>(null);

  // Fetch live pending approvals count
  useEffect(() => {
    async function loadApprovalsCount() {
      try {
        const res = await fetch('/api/admin/approvals?status=pending');
        if (res.ok) {
          const data = await res.json();
          if (typeof data.pendingCount === 'number') {
            setPendingApprovalsCount(data.pendingCount);
          }
        }
      } catch {
        // Fallback to default
      }
    }
    loadApprovalsCount();
    const interval = setInterval(loadApprovalsCount, 15000);
    return () => clearInterval(interval);
  }, [pathname]);

  // Handle escape key to close drawer or search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        setShowSearchModal(false);
        setUserDropdownOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal((prev) => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close mobile drawer on route transition
  useEffect(() => {
    setMobileOpen(false);
    setUserDropdownOpen(false);
  }, [pathname]);

  const hasContentPublisher =
    actor.platformGrants.includes('content_publisher') ||
    actor.platformGrants.includes('portal_admin');

  const navSections: NavSection[] = [
    {
      title: 'Core Administration',
      items: [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
        { href: '/admin/orgs', label: 'Organisations', icon: Building2 },
        { href: '/admin/users', label: 'Users & Invites', icon: Users },
        { href: '/admin/grants', label: 'Platform Grants', icon: KeyRound },
        { href: '/admin/entitlement-requests', label: 'Entitlement Requests', icon: ShieldCheck },
        { href: '/admin/offerings', label: 'Offerings Catalogue', icon: Layers },
      ],
    },
    {
      title: 'Content Hub',
      requiresContentPublisher: true,
      items: [
        { href: '/admin/content', label: 'Content Overview', icon: FileText, exact: true },
        { href: '/admin/content/blogs', label: 'Blogs & Articles', icon: BookOpen },
        { href: '/admin/content/case-studies', label: 'Case Studies', icon: Award },
        { href: '/admin/content/testimonials', label: 'Testimonials', icon: MessageSquareQuote },
        { href: '/admin/content/banners', label: 'Broadcast Banners', icon: Megaphone },
        { href: '/admin/content/faqs', label: 'Knowledge & FAQs', icon: HelpCircle },
        { href: '/admin/content/media', label: 'Media Library', icon: ImageIcon },
      ],
    },
    {
      title: 'Governance & Operations',
      items: [
        {
          href: '/admin/approvals',
          label: 'Approvals Inbox',
          icon: CheckSquare,
          badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
        },
        { href: '/admin/notifications', label: 'Notifications', icon: Bell },
        { href: '/admin/support-access', label: 'Support Access', icon: LifeBuoy },
        { href: '/admin/audit', label: 'Audit Trail', icon: History },
        { href: '/admin/config', label: 'System Config', icon: Sliders },
        { href: '/admin/enquiries', label: 'Enquiries & Leads', icon: Inbox },
        { href: '/admin/ops', label: 'Operations Console', icon: Activity },
      ],
    },
  ];

  // Quick search directory items
  const allNavItems = navSections.flatMap((s) => s.items);
  const filteredNavItems = searchQuery.trim()
    ? allNavItems.filter((item) => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : allNavItems.slice(0, 6);

  // Derive breadcrumbs
  const pathParts = pathname.split('/').filter(Boolean);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-primary/20 selection:text-primary">
      {/* Top Banner: Global Admin Mode Indicator */}
      <div className="bg-gradient-to-r from-amber-500/15 via-primary/10 to-amber-500/15 border-b border-amber-500/20 px-4 py-1.5 text-xs text-amber-700 dark:text-amber-300 flex items-center justify-between font-medium">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
          <span>
            <strong>Portal Administrator Area</strong> — Operating with elevated governance privileges.
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-[11px] text-muted-foreground">
          <span>Dual Control Enforcement: <strong>Active</strong></span>
          <span>Hash-Chain Ledger: <strong>Secured</strong></span>
        </div>
      </div>

      {/* Main Top Header */}
      <header className="sticky top-0 z-40 h-16 border-b border-border bg-card/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo & Platform Name */}
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight flex items-center gap-1.5">
                <span>Azentio</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  Admin
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground hidden sm:block">Enterprise Governance Console</p>
            </div>
          </Link>

          {/* Breadcrumb Trail */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground ml-4 pl-4 border-l border-border">
            {pathParts.map((part, index) => {
              const href = '/' + pathParts.slice(0, index + 1).join('/');
              const isLast = index === pathParts.length - 1;
              const formatted = part.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
              return (
                <React.Fragment key={href}>
                  {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />}
                  {isLast ? (
                    <span className="font-semibold text-foreground">{formatted}</span>
                  ) : (
                    <Link href={href} className="hover:text-foreground transition-colors">
                      {formatted}
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Global Quick Search Trigger */}
          <button
            onClick={() => setShowSearchModal(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground bg-muted/50 hover:bg-muted border border-border rounded-lg transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search admin console...</span>
            <kbd className="text-[10px] font-mono bg-background border border-border px-1 rounded ml-1">⌘K</kbd>
          </button>

          {/* Pending Dual-Control Approvals Pill */}
          <Link
            href="/admin/approvals"
            className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
            title="Dual Control Approvals"
          >
            <CheckSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Approvals</span>
            {pendingApprovalsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                {pendingApprovalsCount}
              </span>
            )}
          </Link>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Account Menu */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted transition-colors text-left"
              aria-label="User profile menu"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-semibold text-xs">
                {actor.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <div className="hidden xl:block text-xs">
                <p className="font-semibold leading-none">{actor.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Portal Admin</p>
              </div>
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {userDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-card border border-border shadow-xl p-2 z-50 text-xs"
                >
                  <div className="px-3 py-2 border-b border-border/60 mb-1">
                    <p className="font-semibold text-foreground">{actor.name}</p>
                    <p className="text-muted-foreground truncate">{actor.email}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {actor.platformGrants.map((grant) => (
                        <span
                          key={grant}
                          className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-primary/10 text-primary border border-primary/20"
                        >
                          {grant}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Link
                    href="/admin/account"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-foreground"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Admin Profile & Grants</span>
                  </Link>
                  <Link
                    href="/employee"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-foreground"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Switch to Employee Portal</span>
                  </Link>

                  <div className="border-t border-border/60 my-1 pt-1">
                    <button
                      onClick={() => {
                        setPersona('public');
                        router.push('/');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Main Container: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar (>=1024px) */}
        <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-card/40 backdrop-blur-sm overflow-y-auto p-4 space-y-6 flex-shrink-0">
          {navSections.map((section) => {
            if (section.requiresContentPublisher && !hasContentPublisher) return null;
            return (
              <div key={section.title} className="space-y-1">
                <h4 className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground px-3 mb-2">
                  {section.title}
                </h4>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge !== undefined && (
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isActive
                                ? 'bg-primary-foreground text-primary'
                                : 'bg-amber-500 text-white'
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
        </aside>

        {/* Mobile Slide-In Drawer (<1024px) */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden"
              />

              {/* Drawer Container */}
              <motion.div
                ref={drawerRef}
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border shadow-2xl p-5 flex flex-col justify-between overflow-y-auto lg:hidden"
                role="dialog"
                aria-modal="true"
                aria-label="Navigation drawer"
              >
                <div>
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <ShieldAlert className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-bold text-sm tracking-tight">Admin Console</span>
                    </div>
                    <button
                      onClick={() => setMobileOpen(false)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      aria-label="Close navigation"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {navSections.map((section) => {
                      if (section.requiresContentPublisher && !hasContentPublisher) return null;
                      return (
                        <div key={section.title} className="space-y-1">
                          <h4 className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground px-2 mb-2">
                            {section.title}
                          </h4>
                          <div className="space-y-1">
                            {section.items.map((item) => {
                              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                              const Icon = item.icon;
                              return (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  onClick={() => setMobileOpen(false)}
                                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                                    isActive
                                      ? 'bg-primary text-primary-foreground font-semibold'
                                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <Icon className="w-4 h-4" />
                                    <span>{item.label}</span>
                                  </div>
                                  {item.badge !== undefined && (
                                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
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

                <div className="pt-6 border-t border-border mt-6">
                  <div className="flex items-center gap-3 px-2 py-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      {actor.name[0]}
                    </div>
                    <div className="text-xs flex-1 truncate">
                      <p className="font-semibold text-foreground">{actor.name}</p>
                      <p className="text-muted-foreground truncate">{actor.email}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-muted/10 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Global Search Dialog Modal (⌘K) */}
      <AnimatePresence>
        {showSearchModal && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
              role="dialog"
              aria-modal="true"
            >
              <div className="p-4 border-b border-border flex items-center gap-3">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Jump to page or admin capability..."
                  autoFocus
                  className="w-full bg-transparent text-sm focus:outline-none"
                />
                <button
                  onClick={() => setShowSearchModal(false)}
                  className="p-1 rounded text-muted-foreground hover:bg-muted"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-2 max-h-72 overflow-y-auto space-y-1">
                {filteredNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.href}
                      onClick={() => {
                        setShowSearchModal(false);
                        router.push(item.href);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg text-xs hover:bg-muted transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">{item.label}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono">{item.href}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

