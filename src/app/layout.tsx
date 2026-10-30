import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { PersonaProvider } from '@/context/PersonaContext';
import { PersonaSwitcherBar } from '@/components/layout/PersonaSwitcherBar';
import { Navbar } from '@/components/layout/Navbar';
import { AIRAWidget } from '@/components/aira/AIRAWidget';
import Link from 'next/link';
import { Sparkles, Shield, Cpu, ExternalLink } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'azentio.ai — Enterprise AI & Governed Collective Learning',
  description:
    'Enterprise AI showcase, exclusive client and employee portals, and governed collective learning for financial services.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col bg-background text-foreground`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <PersonaProvider>
            {/* Top Interactive Evaluation Switcher */}
            <PersonaSwitcherBar />

            {/* Main Navigation */}
            <Navbar />

            {/* Page Content */}
            <main className="flex-1">{children}</main>

            {/* Interactive AIRA AI Assistant */}
            <AIRAWidget />

            {/* Enterprise Footer */}
            <footer className="border-t border-border bg-card/50 backdrop-blur-sm mt-20 text-xs text-muted-foreground">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-foreground text-sm tracking-tight">azentio.ai</span>
                    </div>
                    <p className="text-xs leading-relaxed">
                      Enterprise AI solutions and governed collective learning platform. Empowering financial institutions with verifiable intelligence.
                    </p>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[11px] font-medium">
                      <span>Notice: Synthetic Data Sandbox Only</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-3 text-sm">Offerings</h4>
                    <ul className="space-y-2">
                      <li>
                        <Link href="/offerings/financial-analysis-intelligence" className="hover:text-foreground transition-colors">
                          Financial Analysis Intelligence
                        </Link>
                      </li>
                      <li>
                        <Link href="/offerings/core-banking-engine" className="hover:text-foreground transition-colors">
                          Core Banking Engine
                        </Link>
                      </li>
                      <li>
                        <Link href="/offerings/aml-compliance-monitor" className="hover:text-foreground transition-colors">
                          AML & Fraud Surveillance
                        </Link>
                      </li>
                      <li>
                        <Link href="/offerings/digital-lending-suite" className="hover:text-foreground transition-colors">
                          Digital Lending Suite
                        </Link>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-3 text-sm">Governance & Portal</h4>
                    <ul className="space-y-2">
                      <li>
                        <Link href="/client" className="hover:text-foreground transition-colors">
                          Client Workspace
                        </Link>
                      </li>
                      <li>
                        <Link href="/client/shared" className="hover:text-foreground transition-colors">
                          Collective Learning Hub
                        </Link>
                      </li>
                      <li>
                        <Link href="/employee" className="hover:text-foreground transition-colors">
                          Employee Innovation Lab
                        </Link>
                      </li>
                      <li>
                        <Link href="/moderation/queue" className="hover:text-foreground transition-colors">
                          Moderation Queue
                        </Link>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-3 text-sm">Integrity & Policies</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Deny-by-default Policy</span>
                      </li>
                      <li>
                        <span>4-Part Granular Consents</span>
                      </li>
                      <li>
                        <span>Synchronous Withdrawal (&le; 60s)</span>
                      </li>
                      <li>
                        <span>Aggregation Safeguard (MIN_ORGS &ge; 3)</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
                  <p>&copy; {new Date().getFullYear()} Azentio Software. Built for Intelligent Collaboration Challenge.</p>
                  <div className="flex items-center gap-6">
                    <Link href="/onboarding/terms" className="hover:text-foreground">
                      Terms of Collaboration
                    </Link>
                    <Link href="/about" className="hover:text-foreground">
                      About Azentio
                    </Link>
                    <Link href="/events/hackathon" className="text-primary hover:underline font-semibold">
                      Hackathon Registry
                    </Link>
                  </div>
                </div>
              </div>
            </footer>
          </PersonaProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

