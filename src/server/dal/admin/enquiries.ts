import { Actor, DemoEnquiry, HackathonRegistration } from '@/types';
import { authorize } from '@/server/policy/authorize';
import { store } from '@/server/dal/store';
import { appendAuditEvent } from '@/server/services/audit';

export interface ExtendedDemoEnquiry extends DemoEnquiry {
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'closed';
  notes?: string;
}

const INITIAL_DEMO_ENQUIRIES: ExtendedDemoEnquiry[] = [
  {
    id: 'enquiry-seed-001',
    fullName: 'Sarah Jenkins',
    workEmail: 'sarah.jenkins@sc.com',
    companyName: 'Standard Chartered Singapore',
    offeringSlug: 'aml-transaction-monitoring',
    message: 'Evaluating multi-tier AML transaction monitoring for APAC regional pilot.',
    submittedAt: '2026-10-28T09:30:00Z',
    status: 'qualified',
    notes: 'Scheduled technical deep-dive for Nov 4 with product engineering.',
  },
  {
    id: 'enquiry-seed-002',
    fullName: 'Rajesh Kumar',
    workEmail: 'rajesh.kumar@dbs.com',
    companyName: 'DBS Bank Ltd',
    offeringSlug: 'real-time-fraud-sentinel',
    message: 'Interested in exploring latency benchmarks under 25k TPS load.',
    submittedAt: '2026-10-29T14:15:00Z',
    status: 'contacted',
    notes: 'Initial intro call held. Sent technical architecture whitepaper.',
  },
  {
    id: 'enquiry-seed-003',
    fullName: 'Michael Tan',
    workEmail: 'm.tan@uob.com.sg',
    companyName: 'United Overseas Bank',
    offeringSlug: 'trade-finance-digitization',
    message: 'Requesting sandbox access to test bill-of-lading OCR extraction pipeline.',
    submittedAt: '2026-10-30T16:00:00Z',
    status: 'new',
  },
];

const INITIAL_HACKATHONS: HackathonRegistration[] = [
  {
    id: 'hack-seed-001',
    fullName: 'Alex Chen',
    workEmail: 'alex.chen@fintechbuilders.io',
    track: 'AI Agent Workflows for Treasury Operations',
    teamSize: 4,
    notes: 'Building autonomous settlement reconciliation agent using Azentio LLM API.',
    submittedAt: '2026-10-27T11:00:00Z',
  },
  {
    id: 'hack-seed-002',
    fullName: 'Priya Sharma',
    workEmail: 'priya.s@quantlabs.sg',
    track: 'Generative Synthesis of Private Financial Data',
    teamSize: 3,
    notes: 'Researching differential privacy protections for cross-tenant observations.',
    submittedAt: '2026-10-29T17:45:00Z',
  },
];

class EnquiriesStore {
  demos: ExtendedDemoEnquiry[] = JSON.parse(JSON.stringify(INITIAL_DEMO_ENQUIRIES));
  hackathons: HackathonRegistration[] = JSON.parse(JSON.stringify(INITIAL_HACKATHONS));

  reset() {
    this.demos = JSON.parse(JSON.stringify(INITIAL_DEMO_ENQUIRIES));
    this.hackathons = JSON.parse(JSON.stringify(INITIAL_HACKATHONS));
  }
}

export const enquiriesStore = new EnquiriesStore();

function checkPortalAdmin(actor: Actor) {
  const auth = authorize(actor, 'manage_org', { kind: 'org', audience: 'public' });
  if (!auth.allow) {
    throw new Error(auth.reason || 'Requires portal_admin platform grant.');
  }
}

export function getAdminDemoEnquiries(actor: Actor): ExtendedDemoEnquiry[] {
  checkPortalAdmin(actor);
  return [...enquiriesStore.demos];
}

export function updateDemoEnquiryStatus(
  actor: Actor,
  id: string,
  status: ExtendedDemoEnquiry['status'],
  notes?: string
): { success: boolean; enquiry: ExtendedDemoEnquiry } {
  checkPortalAdmin(actor);

  const enquiry = enquiriesStore.demos.find((e) => e.id === id);
  if (!enquiry) {
    throw new Error('Demo enquiry not found.');
  }

  enquiry.status = status;
  if (notes !== undefined) {
    enquiry.notes = notes;
  }

  appendAuditEvent(
    actor,
    'admin.enquiry.update_status',
    'demo_enquiry',
    id,
    `Updated enquiry status to "${status}" for ${enquiry.companyName}.`
  );

  return { success: true, enquiry };
}

export function getAdminHackathonRegistrations(actor: Actor): HackathonRegistration[] {
  checkPortalAdmin(actor);
  return [...enquiriesStore.hackathons];
}

export function exportEnquiriesCSV(actor: Actor, type: 'demos' | 'hackathons'): string {
  checkPortalAdmin(actor);

  if (type === 'demos') {
    const headers = ['ID', 'Submitted At', 'Full Name', 'Work Email', 'Company Name', 'Offering Slug', 'Status', 'Message', 'Notes'];
    const rows = enquiriesStore.demos.map((d) => [
      d.id,
      d.submittedAt,
      `"${d.fullName.replace(/"/g, '""')}"`,
      d.workEmail,
      `"${d.companyName.replace(/"/g, '""')}"`,
      d.offeringSlug,
      d.status,
      `"${d.message.replace(/"/g, '""')}"`,
      `"${(d.notes || '').replace(/"/g, '""')}"`,
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  } else {
    const headers = ['ID', 'Submitted At', 'Full Name', 'Work Email', 'Track', 'Team Size', 'Notes'];
    const rows = enquiriesStore.hackathons.map((h) => [
      h.id,
      h.submittedAt,
      `"${h.fullName.replace(/"/g, '""')}"`,
      h.workEmail,
      `"${h.track.replace(/"/g, '""')}"`,
      h.teamSize,
      `"${(h.notes || '').replace(/"/g, '""')}"`,
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}
