'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { PortalSidebar } from './PortalSidebar';
import { AIRAWidget } from '@/components/aira/AIRAWidget';
import { PeekingRobot } from '@/components/widgets/PeekingRobot';
import Link from 'next/link';
import { Sparkles, Shield, Cpu, ExternalLink } from 'lucide-react';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Determine if on an internal portal workspace
  const isPortalArea =
    pathname.startsWith('/client') ||
    pathname.startsWith('/employee') ||
    pathname.startsWith('/moderation') ||
    pathname.startsWith('/publisher') ||
    pathname.startsWith('/admin');

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Top Navigation Bar — always visible */}
      <Navbar />

      {/* Main Layout Area: Sidebar (fixed height) + Scrollable Content */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Persistent Sidebar — fixed to remaining height, never scrolls */}
        <PortalSidebar />

        {/* Page Content — only this area scrolls */}
        <main className="flex-1 overflow-y-auto">
          {children}

          {/* Enterprise Footer — only on public/non-portal pages */}
          {!isPortalArea && (
            <footer className="border-t border-border bg-card/50 backdrop-blur-sm mt-20 text-xs text-muted-foreground">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-foreground">azentio.ai</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Governed Collective Intelligence and Enterprise AI for Tier-1 Financial Services.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="font-semibold text-foreground">Offerings</div>
                    <ul className="space-y-1.5">
                      <li>
                        <Link href="/offerings/financial-analysis-intelligence" className="hover:text-foreground">
                          Financial Analysis AI
                        </Link>
                      </li>
                      <li>
                        <Link href="/offerings/core-banking-engine" className="hover:text-foreground">
                          Core Banking Engine
                        </Link>
                      </li>
                      <li>
                        <Link href="/offerings/aml-compliance-monitor" className="hover:text-foreground">
                          AML & Surveillance
                        </Link>
                      </li>
                      <li>
                        <Link href="/offerings/digital-lending-suite" className="hover:text-foreground">
                          Digital Lending Suite
                        </Link>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <div className="font-semibold text-foreground">Insights & Careers</div>
                    <ul className="space-y-1.5">
                      <li>
                        <Link href="/insights/events" className="hover:text-foreground">
                          Industry Summits & Events
                        </Link>
                      </li>
                      <li>
                        <Link href="/insights/hackathons" className="hover:text-foreground">
                          Global AI Hackathon 2026
                        </Link>
                      </li>
                      <li>
                        <Link href="/insights/blogs" className="hover:text-foreground">
                          Research & Technical Blogs
                        </Link>
                      </li>
                      <li>
                        <Link href="/careers" className="hover:text-foreground">
                          Careers & Open Positions
                        </Link>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <div className="font-semibold text-foreground">Enterprise Portals</div>
                    <ul className="space-y-1.5">
                      <li>
                        <Link href="/signin" className="hover:text-foreground font-medium text-emerald-500">
                          Sign In to Portal
                        </Link>
                      </li>
                      <li>
                        <Link href="/demo-request" className="hover:text-foreground">
                          Request Demonstration
                        </Link>
                      </li>
                      <li>
                        <Link href="/contact" className="hover:text-foreground">
                          Contact Global Hubs
                        </Link>
                      </li>
                      <li>
                        <Link href="/onboarding/terms" className="hover:text-foreground">
                          Charter & Security Terms
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
                  <p>© 2026 Azentio Software Private Limited. All rights reserved.</p>
                  <div className="flex items-center gap-4">
                    <Link href="/onboarding/terms" className="hover:text-foreground">
                      Terms of Service
                    </Link>
                    <Link href="/onboarding/terms" className="hover:text-foreground">
                      Privacy & Data Charter
                    </Link>
                    <Link href="/contact" className="hover:text-foreground">
                      Security Disclosure
                    </Link>
                  </div>
                </div>
              </div>
            </footer>
          )}
        </main>
      </div>

      {/* Interactive AIRA AI Assistant */}
      <AIRAWidget />

      {/* Peeking Robot for Public Pages */}
      <PeekingRobot />
    </div>
  );
}

