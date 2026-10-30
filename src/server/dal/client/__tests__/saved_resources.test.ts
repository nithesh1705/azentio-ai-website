import { describe, it, expect, beforeEach } from 'vitest';
import {
  getSavedSearches,
  createSavedSearch,
  deleteSavedSearch,
  getBookmarks,
  toggleBookmark,
  removeBookmark,
} from '../saved';
import {
  getClientResources,
  registerForWebinar,
  generateIcsContent,
  CLIENT_RESOURCES_DATA,
} from '../resources';
import { store } from '@/server/dal/store';
import { Actor } from '@/types';

describe('Client Saved Searches, Bookmarks & Resources DAL', () => {
  beforeEach(() => {
    store.reset();
  });

  const memberActor: Actor = {
    userId: 'usr-client-virat',
    email: 'virat_kohli@abcd.in',
    name: 'Virat Kohli',
    isVerifiedEmployee: false,
    activeTenantId: 'org-abcd',
    memberships: [{ orgId: 'org-abcd', role: 'client_member', status: 'active' }],
    platformGrants: [],
  };

  it('manages saved searches scoped to user and tenant', () => {
    const saved = createSavedSearch(memberActor, {
      title: 'High Velocity AML Transfers',
      query: 'AML SWIFT',
    });

    expect(saved.id).toBeDefined();
    expect(saved.orgId).toBe('org-abcd');

    const searches = getSavedSearches(memberActor);
    expect(searches.some((s) => s.id === saved.id)).toBe(true);

    const deleted = deleteSavedSearch(memberActor, saved.id);
    expect(deleted).toBe(true);
  });

  it('toggles bookmarks for items in workspace', () => {
    const toggleRes = toggleBookmark(memberActor, {
      targetType: 'observation',
      targetId: 'obs-sample-123',
      title: 'Sample Test Finding',
      url: '/client/observations/obs-sample-123',
    });

    expect(toggleRes.bookmarked).toBe(true);

    const bms = getBookmarks(memberActor);
    expect(bms.some((b) => b.targetId === 'obs-sample-123')).toBe(true);

    // Toggle again removes it
    const untoggleRes = toggleBookmark(memberActor, {
      targetType: 'observation',
      targetId: 'obs-sample-123',
      title: 'Sample Test Finding',
      url: '/client/observations/obs-sample-123',
    });
    expect(untoggleRes.bookmarked).toBe(false);
  });

  it('filters licensed client resources according to tenant entitlements', () => {
    const resources = getClientResources(memberActor);
    expect(resources.length).toBeGreaterThan(0);

    // org-abcd has offering-fai, offering-cbe, offering-aml (NOT offering-dls)
    resources.forEach((r) => {
      if (r.offeringId) {
        expect(['offering-fai', 'offering-cbe', 'offering-aml']).toContain(r.offeringId);
      }
    });
  });

  it('registers for webinar and generates a valid RFC-compliant .ics file', () => {
    const webinar = CLIENT_RESOURCES_DATA.find((r) => r.type === 'webinar')!;
    const reg = registerForWebinar(memberActor, webinar.id);

    expect(reg.success).toBe(true);
    expect(reg.icsContent).toContain('BEGIN:VCALENDAR');
    expect(reg.icsContent).toContain('BEGIN:VEVENT');
    expect(reg.icsContent).toContain(`UID:${webinar.id}@azentio.ai`);
    expect(reg.icsContent).toContain('END:VCALENDAR');
  });
});

