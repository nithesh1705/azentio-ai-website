'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import {
  Sparkles,
  Bell,
  Menu,
  X,
  ChevronDown,
  Building,
  Terminal,
  ShieldCheck,
  Compass,
  FileText,
  Radio,
  BookOpen,
  Layers,
  Settings,
  Users,
} from 'lucide-react';
import { getNotifications } from '@/server/dal/store';

export function Navbar() {
  const pathname = usePathname();
  const { actor, currentPersonaKey, activeTenant } = usePersona();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Retrieve in-app notifications for active persona
  const notifications = getNotifications(actor);
  const unreadCount = notifications.filter((n) => n.state === 'stored').length;

  const isPublic = currentPersonaKey === 'public';
  const isEmployee = actor.isVerifiedEmployee;
  const isClient = actor.memberships.some((m) => m.status === 'active');
  const isModerator = actor.platformGrants.includes('learning_moderator');
  const isPublisher = actor.platformGrants.includes('content_publisher');
  const isAdmin = actor.platformGrants.includes('portal_admin');
  const isClientAdmin = actor.memberships.some(
    (m) => m.orgId === actor.activeTenantId && m.role === 'client_admin'
  );

  return (
    <header className="sticky top-7 z-40 w-full border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400">
              azentio.ai
            </span>
            <span className="text-[10px] tracking-wider uppercase font-semibold text-muted-foreground -mt-1">
              Enterprise Collective AI
            </span>
          </div>
        </Link>

        {/* Dynamic Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {/* Public links */}
          <NavLink href="/" active={pathname === '/'}>
            Home
          </NavLink>
          <NavLink href="/offerings" active={pathname.startsWith('/offerings')}>
            Offerings
          </NavLink>
          <NavLink href="/solutions" active={pathname === '/solutions'}>
            Solutions
          </NavLink>
          <NavLink href="/insights" active={pathname === '/insights'}>
            Public Insights
          </NavLink>

          {/* Client Experience */}
          {isClient && (
            <div className="relative group">
              <button
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith('/client')
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <Building className="w-4 h-4 text-emerald-500" />
                <span>Client Hub</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>
              <div className="absolute left-0 top-full mt-1 w-56 rounded-xl bg-card border border-border shadow-xl p-2 hidden group-hover:block transition-all">
                <DropdownItem href="/client" label="Workspace Dashboard" active={pathname === '/client'} />
                <DropdownItem href="/client/demos" label="Entitled Sandboxes" active={pathname === '/client/demos'} />
                <DropdownItem href="/client/observations" label="My Observations" active={pathname === '/client/observations'} />
                <DropdownItem href="/client/observations/new" label="Submit Observation" active={pathname === '/client/observations/new'} />
                <DropdownItem href="/client/shared" label="Collective Learning Feed" active={pathname === '/client/shared'} />
                <DropdownItem href="/client/themes" label="Safe Trend Themes" active={pathname === '/client/themes'} />
                <DropdownItem href="/client/ideas" label="Improvement Status" active={pathname === '/client/ideas'} />
                {isClientAdmin && (
                  <DropdownItem href="/client/admin/members" label="Manage Members" active={pathname === '/client/admin/members'} />
                )}
              </div>
            </div>
          )}

          {/* Employee Experience */}
          {isEmployee && (
            <div className="relative group">
              <button
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith('/employee')
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <Terminal className="w-4 h-4 text-indigo-500" />
                <span>Employee Portal</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>
              <div className="absolute left-0 top-full mt-1 w-52 rounded-xl bg-card border border-border shadow-xl p-2 hidden group-hover:block transition-all">
                <DropdownItem href="/employee" label="Internal Dashboard" active={pathname === '/employee'} />
                <DropdownItem href="/employee/playground" label="Guided Playground" active={pathname === '/employee/playground'} />
                <DropdownItem href="/employee/live" label="Live Broadcasts" active={pathname === '/employee/live'} />
                <DropdownItem href="/employee/ideas" label="Product Owner Ideas" active={pathname === '/employee/ideas'} />
                <DropdownItem href="/employee/knowledge" label="Knowledge Library" active={pathname === '/employee/knowledge'} />
                <DropdownItem href="/employee/experiments" label="Experiments & Lab" active={pathname === '/employee/experiments'} />
              </div>
            </div>
          )}

          {/* Moderation Queue */}
          {isModerator && (
            <NavLink href="/moderation/queue" active={pathname.startsWith('/moderation')}>
              <ShieldCheck className="w-4 h-4 text-amber-500 inline mr-1" />
              Moderation
            </NavLink>
          )}

          {/* Publisher */}
          {isPublisher && (
            <NavLink href="/publisher/content" active={pathname.startsWith('/publisher')}>
              Publisher
            </NavLink>
          )}

          {/* Admin */}
          {isAdmin && (
            <NavLink href="/admin/orgs" active={pathname.startsWith('/admin')}>
              <Settings className="w-4 h-4 inline mr-1 text-rose-500" />
              Admin
            </NavLink>
          )}

          <NavLink href="/events/hackathon" active={pathname === '/events/hackathon'}>
            Hackathon
          </NavLink>
        </nav>

        {/* Right side: Actions, Theme, Notifications */}
        <div className="flex items-center gap-2.5">
          {/* Notifications Popover */}
          {!isPublic && (
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-80 rounded-2xl bg-card border border-border shadow-2xl p-4 z-50"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-border">
                      <div className="flex items-center gap-1.5">
                        <Bell className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-sm">Notifications</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        Outbox Pattern
                      </span>
                    </div>

                    <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-6">
                          No notifications yet.
                        </p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className="p-2.5 rounded-xl bg-muted/50 border border-border/60 hover:bg-muted text-xs space-y-1 transition-colors"
                          >
                            <div className="font-semibold text-foreground flex items-center justify-between">
                              <span>{n.title}</span>
                              <span className="text-[10px] text-muted-foreground font-mono">
                                {n.deliveredChannelState}
                              </span>
                            </div>
                            <p className="text-muted-foreground line-clamp-2">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Demo Request Button */}
          <Link
            href="/demo-request"
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm shadow-primary/20 hover:scale-105 active:scale-95"
          >
            <span>Request Demo</span>
          </Link>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-b border-border bg-background px-4 py-4 space-y-2"
          >
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-accent"
            >
              Home
            </Link>
            <Link
              href="/offerings"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-accent"
            >
              Offerings
            </Link>
            <Link
              href="/solutions"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-accent"
            >
              Solutions
            </Link>
            <Link
              href="/insights"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-accent"
            >
              Public Insights
            </Link>
            {isClient && (
              <Link
                href="/client"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-emerald-500 hover:bg-accent"
              >
                Client Workspace ({activeTenant?.name})
              </Link>
            )}
            {isEmployee && (
              <Link
                href="/employee"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-indigo-500 hover:bg-accent"
              >
                Employee Portal
              </Link>
            )}
            {isModerator && (
              <Link
                href="/moderation/queue"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-amber-500 hover:bg-accent"
              >
                Moderation Queue
              </Link>
            )}
            <Link
              href="/demo-request"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-primary hover:bg-accent"
            >
              Request Demo
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
        active
          ? 'text-primary bg-primary/10 font-semibold'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
      }`}
    >
      {children}
    </Link>
  );
}

function DropdownItem({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
        active
          ? 'bg-primary/10 text-primary font-semibold'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      }`}
    >
      {label}
    </Link>
  );
}
