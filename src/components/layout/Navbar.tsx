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
  UserCheck,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { actor, currentPersonaKey, setPersona } = usePersona();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [insightsDropdownOpen, setInsightsDropdownOpen] = useState(false);

  const isPublic = currentPersonaKey === 'public' && actor.userId === 'usr-anonymous';

  // Determine portal home path if signed in
  const getPortalHome = () => {
    if (actor.platformGrants.includes('portal_admin')) return '/admin/orgs';
    if (actor.platformGrants.includes('product_owner')) return '/employee/ideas';
    if (actor.platformGrants.includes('learning_moderator')) return '/moderation/queue';
    if (actor.platformGrants.includes('content_publisher')) return '/publisher/content';
    if (actor.isVerifiedEmployee) return '/employee';
    if (actor.memberships.length > 0) return '/client';
    return '/';
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* azentio.ai (Logo) */}
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

        {/* Public Desktop Nav: Home, About, Products, Insights, Contact us */}
        <nav className="hidden lg:flex items-center gap-1.5">
          {/* Home */}
          <NavLink href="/" active={pathname === '/'}>
            Home
          </NavLink>

          {/* About */}
          <NavLink href="/about" active={pathname === '/about'}>
            About
          </NavLink>

          {/* Products */}
          <NavLink href="/offerings" active={pathname.startsWith('/offerings')}>
            Products
          </NavLink>

          {/* Insights (Dropdown: Events, Hackathons, Careers, Blogs) */}
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
                  <InsightsDropdownItem
                    href="/insights/events"
                    icon={Calendar}
                    title="Events"
                    desc="Global AI summits & webinars"
                    active={pathname === '/insights/events'}
                  />
                  <InsightsDropdownItem
                    href="/insights/hackathons"
                    icon={FileText}
                    title="Hackathons"
                    desc="Agentic AI banking hackathon"
                    active={pathname === '/insights/hackathons'}
                  />
                  <InsightsDropdownItem
                    href="/careers"
                    icon={Briefcase}
                    title="Careers"
                    desc="Open AI & engineering positions"
                    active={pathname === '/careers'}
                  />
                  <InsightsDropdownItem
                    href="/insights/blogs"
                    icon={BookOpen}
                    title="Blogs"
                    desc="Research papers & architectures"
                    active={pathname === '/insights/blogs'}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Contact us */}
          <NavLink href="/contact" active={pathname === '/contact'}>
            Contact us
          </NavLink>
        </nav>

        {/* Right Actions: Background Theme switch, Demo button, Sign in button */}
        <div className="flex items-center gap-2.5">
          {/* Background Theme Switch */}
          <ThemeToggle />

          {/* Demo Button */}
          <Link
            href="/demo-request"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm shadow-primary/20 hover:scale-105 active:scale-95"
          >
            <span>Demo</span>
          </Link>

          {/* Sign In Button / User Status */}
          {isPublic ? (
            <Link
              href="/signin"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all shadow-sm shadow-emerald-500/10 hover:scale-105 active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href={getPortalHome()}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-border bg-card/80 hover:bg-accent text-foreground transition-all shadow-sm"
                title="Go to Your Authorized Workspace"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold truncate max-w-[100px]">{actor.name}</span>
                <span className="text-[10px] text-muted-foreground uppercase px-1.5 py-0.2 rounded bg-muted/80">
                  {actor.isVerifiedEmployee ? 'Employee' : 'Client'}
                </span>
              </Link>
              <button
                onClick={() => {
                  setPersona('public');
                  window.location.href = '/';
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                title="Sign Out to Public View"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Sign Out</span>
              </button>
            </div>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent"
            aria-label="Toggle navigation menu"
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
            className="lg:hidden border-b border-border bg-background px-4 py-4 space-y-2 text-sm"
          >
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg font-medium hover:bg-accent"
            >
              Home
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg font-medium hover:bg-accent"
            >
              About
            </Link>
            <Link
              href="/offerings"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg font-medium hover:bg-accent"
            >
              Products
            </Link>

            {/* Insights Accordion / Group */}
            <div className="pt-1 pb-1">
              <div className="px-3 py-1 text-xs font-bold uppercase text-muted-foreground tracking-wider">
                Insights
              </div>
              <div className="pl-2 space-y-1 mt-1">
                <Link
                  href="/insights/events"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs hover:bg-accent text-foreground"
                >
                  <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Events</span>
                </Link>
                <Link
                  href="/insights/hackathons"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs hover:bg-accent text-foreground"
                >
                  <FileText className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Hackathons</span>
                </Link>
                <Link
                  href="/careers"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs hover:bg-accent text-foreground"
                >
                  <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Careers</span>
                </Link>
                <Link
                  href="/insights/blogs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs hover:bg-accent text-foreground"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                  <span>Blogs</span>
                </Link>
              </div>
            </div>

            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg font-medium hover:bg-accent"
            >
              Contact us
            </Link>

            <Link
              href="/demo-request"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg font-semibold text-primary hover:bg-accent"
            >
              Demo
            </Link>

            <div className="pt-2 border-t border-border mt-2">
              {isPublic ? (
                <Link
                  href="/signin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-emerald-500 hover:bg-emerald-500/10"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setPersona('public');
                    setMobileMenuOpen(false);
                    window.location.href = '/';
                  }}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg font-semibold text-rose-500 hover:bg-rose-500/10"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out ({actor.name})</span>
                </button>
              )}
            </div>
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
          <ArrowRight className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="text-[11px] text-muted-foreground leading-tight mt-0.5">{desc}</div>
      </div>
    </Link>
  );
}
