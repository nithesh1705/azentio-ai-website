'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import {
  Sparkles,
  ChevronDown,
  LogIn,
  LogOut,
  Menu,
  X,
  Calendar,
  FileText,
  Briefcase,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { actor, setPersona } = usePersona();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [insightsDropdownOpen, setInsightsDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // isSignedIn = any real authenticated actor (not the anonymous public visitor)
  const isSignedIn =
    actor.userId !== 'usr-anonymous' &&
    (actor.isVerifiedEmployee || actor.memberships.length > 0 || actor.platformGrants.length > 0);

  // isPortalRoute = user is inside an authenticated workspace area
  const isPortalRoute =
    pathname.startsWith('/client') ||
    pathname.startsWith('/employee') ||
    pathname.startsWith('/moderation') ||
    pathname.startsWith('/publisher') ||
    pathname.startsWith('/admin');

  // Determine portal home path based on grants
  const getPortalHome = () => {
    if (actor.platformGrants.includes('portal_admin')) return '/admin/orgs';
    if (actor.platformGrants.includes('product_owner')) return '/employee/ideas';
    if (actor.platformGrants.includes('learning_moderator')) return '/moderation/queue';
    if (actor.platformGrants.includes('content_publisher')) return '/publisher/content';
    if (actor.isVerifiedEmployee) return '/employee';
    if (actor.memberships.length > 0) return '/client';
    return '/';
  };

  // Human-readable role label
  const roleLabel = actor.platformGrants.includes('portal_admin')
    ? 'Portal Admin'
    : actor.platformGrants.includes('product_owner')
    ? 'Product Owner'
    : actor.platformGrants.includes('learning_moderator')
    ? 'Moderator'
    : actor.platformGrants.includes('content_publisher')
    ? 'Publisher'
    : actor.isVerifiedEmployee
    ? 'Employee'
    : actor.memberships.some((m) => m.role === 'client_admin')
    ? 'Client Admin'
    : 'Client';

  // ── SIGNED-IN PORTAL TOPBAR ────────────────────────────────────────────────
  // Only show the minimal topbar when inside an actual portal workspace route.
  // On public pages (home, about, etc.) show the full public nav instead.
  if (isSignedIn && isPortalRoute) {
    return (
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/90 backdrop-blur-md transition-colors shrink-0">
        <div className="h-14 px-4 flex items-center justify-between">
          {/* Logo — links to portal home */}
          <Link href={getPortalHome()} className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-sm tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400">
              azentio.ai
            </span>
          </Link>

          {/* Right: theme toggle + user dropdown */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* User profile button */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-border/60 bg-card/80 hover:bg-accent transition-all text-xs font-medium shadow-sm"
              >
                {/* Avatar initial */}
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold text-[11px] shrink-0">
                  {actor.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:flex flex-col items-start leading-tight">
                  <span className="font-semibold text-foreground truncate max-w-[100px]">{actor.name}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{roleLabel}</span>
                </div>
                {/* Online indicator */}
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-card border border-border shadow-2xl p-2 z-50"
                  >
                    {/* User info */}
                    <div className="px-3 py-2.5 border-b border-border/60 mb-1">
                      <div className="font-semibold text-sm text-foreground">{actor.name}</div>
                      <div className="text-[11px] text-muted-foreground font-mono mt-0.5 truncate">{actor.email}</div>
                      <div className="text-[10px] mt-1.5 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wide w-fit">
                        {roleLabel}
                      </div>
                    </div>

                    <Link
                      href={getPortalHome()}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium hover:bg-accent text-foreground transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                      My Workspace
                    </Link>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        setPersona('public');
                        window.location.href = '/';
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition-colors mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // ── PUBLIC NAVBAR ─────────────────────────────────────────────────────────
  // Shown on all public pages. If the user is signed in (but browsing the public
  // site), replace "Sign In" with "Go to Dashboard" so they can jump back.
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/80 backdrop-blur-md transition-colors shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
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

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1.5">
          <NavLink href="/" active={pathname === '/'}>Home</NavLink>
          <NavLink href="/about" active={pathname === '/about'}>About</NavLink>
          <NavLink href="/our-leadership" active={pathname === '/our-leadership'}>Leadership</NavLink>
          <NavLink href="/our-presence" active={pathname === '/our-presence'}>Presence</NavLink>
          <NavLink href="/products" active={pathname.startsWith('/products')}>Products</NavLink>

          {/* Insights dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setInsightsDropdownOpen(true)}
            onMouseLeave={() => setInsightsDropdownOpen(false)}
          >
            <Link
              href="/insights"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith('/insights') || pathname === '/careers'
                  ? 'text-primary bg-primary/10 font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <span>Insights</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${insightsDropdownOpen ? 'rotate-180' : ''}`} />
            </Link>

            <AnimatePresence>
              {insightsDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full mt-1 w-64 rounded-2xl bg-card border border-border shadow-2xl p-2 z-50 space-y-1"
                >
                  <InsightsDropdownItem href="/insights/case-studies" icon={FileText} title="Case Studies" desc="Client success & transformation stories" active={pathname === '/insights/case-studies'} />
                  <InsightsDropdownItem href="/insights/blogs" icon={BookOpen} title="Blogs & Research" desc="Technical analysis & whitepapers" active={pathname === '/insights/blogs'} />
                  <InsightsDropdownItem href="/insights/events" icon={Calendar} title="Events & Summits" desc="Global AI summits & webinars" active={pathname === '/insights/events'} />
                  <InsightsDropdownItem href="/insights/hackathons" icon={Sparkles} title="AI Hackathons" desc="Global Agentic AI banking competition" active={pathname === '/insights/hackathons'} />
                  <InsightsDropdownItem href="/careers" icon={Briefcase} title="Careers" desc="Open technology & domain positions" active={pathname === '/careers'} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <NavLink href="/contact" active={pathname === '/contact' || pathname === '/contact-us'}>Contact us</NavLink>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          <Link
            href="/demo-request"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm shadow-primary/20 hover:scale-105 active:scale-95"
          >
            <span>Demo</span>
          </Link>

          {/* Auth Action: "Go to Dashboard" if already signed in, else "Sign In" */}
          {isSignedIn ? (
            <Link
              href={getPortalHome()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all shadow-sm shadow-emerald-500/10 hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>Go to Dashboard</span>
            </Link>
          ) : (
            <Link
              href="/signin"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all shadow-sm shadow-emerald-500/10 hover:scale-105 active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-b border-border bg-background px-4 py-4 space-y-2 text-sm"
          >
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg font-medium hover:bg-accent">Home</Link>
            <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg font-medium hover:bg-accent">About</Link>
            <Link href="/our-leadership" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg font-medium hover:bg-accent">Leadership</Link>
            <Link href="/our-presence" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg font-medium hover:bg-accent">Presence</Link>
            <Link href="/products" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg font-medium hover:bg-accent">Products</Link>

            <div className="pt-1 pb-1">
              <div className="px-3 py-1 text-xs font-bold uppercase text-muted-foreground tracking-wider">Insights</div>
              <div className="pl-2 space-y-1 mt-1">
                <Link href="/insights/case-studies" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs hover:bg-accent text-foreground"><FileText className="w-3.5 h-3.5 text-emerald-500" /><span>Case Studies</span></Link>
                <Link href="/insights/blogs" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs hover:bg-accent text-foreground"><BookOpen className="w-3.5 h-3.5 text-amber-500" /><span>Blogs & Research</span></Link>
                <Link href="/insights/events" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs hover:bg-accent text-foreground"><Calendar className="w-3.5 h-3.5 text-cyan-500" /><span>Events</span></Link>
                <Link href="/insights/hackathons" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs hover:bg-accent text-foreground"><Sparkles className="w-3.5 h-3.5 text-teal-500" /><span>Hackathons</span></Link>
                <Link href="/careers" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs hover:bg-accent text-foreground"><Briefcase className="w-3.5 h-3.5 text-indigo-500" /><span>Careers</span></Link>
              </div>
            </div>

            <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg font-medium hover:bg-accent">Contact us</Link>
            <Link href="/demo-request" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg font-semibold text-primary hover:bg-accent">Demo</Link>

            <div className="pt-2 border-t border-border mt-2">
              {isSignedIn ? (
                <Link
                  href={getPortalHome()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-emerald-500 hover:bg-emerald-500/10"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Go to Dashboard</span>
                </Link>
              ) : (
                <Link
                  href="/signin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-emerald-500 hover:bg-emerald-500/10"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
        active ? 'text-primary bg-primary/10 font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-accent'
      }`}
    >
      {children}
    </Link>
  );
}

function InsightsDropdownItem({
  href,
  icon: Icon,
  title,
  desc,
  active,
}: {
  href: string;
  icon: any;
  title: string;
  desc: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
        active ? 'bg-primary/10 text-primary' : 'hover:bg-accent/80 text-foreground'
      }`}
    >
      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <div className="text-xs font-bold leading-tight flex items-center gap-1">
          <span>{title}</span>
          <ArrowRight className="w-2.5 h-2.5 opacity-40" />
        </div>
        <div className="text-[11px] text-muted-foreground leading-tight mt-0.5">{desc}</div>
      </div>
    </Link>
  );
}
