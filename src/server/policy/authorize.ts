import { Actor, Action, ResourceRef, Decision } from '@/types';

/**
 * Authoritative single policy module for azentio.ai
 * Conformant to SOURCE_OF_TRUTH.md §7.1 and §6.1.1
 * Every access decision is DENY unless explicitly permitted.
 */
export function authorize(
  actor: Actor,
  action: Action,
  resource: ResourceRef
): Decision {
  // 1. Guard against null or missing audience
  if (!resource || !resource.audience) {
    return { allow: false, reason: 'Deny by default: resource audience metadata is missing' };
  }

  // 2. Public audience handling
  if (resource.audience === 'public') {
    if (action === 'read') {
      return { allow: true, reason: 'Public resources are readable by all' };
    }
    if (action === 'create' && (resource.kind === 'demo_enquiry' || resource.kind === 'hackathon_registration')) {
      return { allow: true, reason: 'Public visitors may submit enquiries and registrations' };
    }
    if (action === 'manage_content') {
      if (actor.platformGrants.includes('content_publisher') || actor.platformGrants.includes('portal_admin')) {
        return { allow: true, reason: 'Content publisher may manage public content' };
      }
      return { allow: false, reason: 'Requires content_publisher or portal_admin grant to modify public content' };
    }
  }

  // 3. Unauthenticated / Public visitor restrictions
  const isAnonymous = !actor.userId || actor.userId === 'anonymous';
  if (isAnonymous) {
    return {
      allow: false,
      reason: 'Deny by default: unauthenticated actors cannot access non-public resources',
    };
  }

  // 4. Learning Moderator Boundary (Contributions)
  if (
    resource.kind === 'contribution' &&
    (action === 'claim' ||
      action === 'request_clarification' ||
      action === 'publish' ||
      action === 'reject' ||
      action === 'unpublish')
  ) {
    if (!actor.platformGrants.includes('learning_moderator')) {
      return { allow: false, reason: 'Requires learning_moderator grant for moderation actions' };
    }
    // Hard boundary: Moderators have NO access to unsubmitted private drafts
    if (resource.isDraft) {
      return { allow: false, reason: 'Moderators cannot view or act upon unsubmitted private drafts' };
    }
    return { allow: true, reason: 'Authorized learning moderator action' };
  }

  // If reading contribution in moderation queue
  if (resource.kind === 'contribution' && action === 'read' && actor.platformGrants.includes('learning_moderator')) {
    if (resource.isDraft) {
      return { allow: false, reason: 'Moderators cannot inspect unsubmitted client drafts' };
    }
    return { allow: true, reason: 'Learning moderator permitted to inspect submitted or reviewed contribution' };
  }

  // 5. Shared Learning audience
  if (resource.audience === 'shared_learning') {
    if (action === 'read') {
      // Authorised participants: signed-in clients or employees
      const isClientMember = actor.memberships.some((m) => m.status === 'active');
      if (actor.isVerifiedEmployee || isClientMember) {
        return { allow: true, reason: 'Authorized participant permitted to read approved shared learning' };
      }
      return { allow: false, reason: 'Shared learning requires verified employee or active client membership' };
    }
    if (action === 'report') {
      return { allow: true, reason: 'Any authorized participant may report shared content' };
    }
  }

  // 6. Author-only audience
  if (resource.audience === 'author_only') {
    if (resource.authorId === actor.userId) {
      return { allow: true, reason: 'Author has exclusive access' };
    }
    return { allow: false, reason: 'Access restricted strictly to the record author' };
  }

  // 7. Employee-only audience
  if (resource.audience === 'employee') {
    if (!actor.isVerifiedEmployee) {
      return { allow: false, reason: 'Employee-only resources require verified employee status' };
    }
    // Content publisher required for configuring live broadcasts or publishing release notes
    if (
      action === 'publish' ||
      action === 'manage_content' ||
      (action === 'create' && (resource.kind === 'live_session' || resource.kind === 'release_note'))
    ) {
      if (
        actor.platformGrants.includes('content_publisher') ||
        actor.platformGrants.includes('portal_admin')
      ) {
        return { allow: true, reason: 'Content publisher permitted for employee broadcast/release management' };
      }
      return { allow: false, reason: 'Requires content_publisher or portal_admin grant' };
    }
    // Product Owner idea management restriction
    if (resource.kind === 'idea' && (action === 'update' || action === 'create' || action === 'delete')) {
      if (!actor.platformGrants.includes('product_owner') && !actor.platformGrants.includes('portal_admin')) {
        return { allow: false, reason: 'Managing improvement ideas requires product_owner assignment' };
      }
      return { allow: true, reason: 'Product owner permitted to manage improvement ideas' };
    }
    // Update/delete ownership checks for experiments, knowledge, teams
    if (action === 'update' || action === 'delete') {
      if (
        resource.authorId &&
        resource.authorId !== actor.userId &&
        !actor.platformGrants.includes('portal_admin')
      ) {
        return { allow: false, reason: 'Only the author/owner can modify this employee record' };
      }
      return { allow: true, reason: 'Owner or admin permitted to modify employee record' };
    }
    // Verified employee permitted for read, run_sandbox, create, join, invite, comment, review, search
    return { allow: true, reason: 'Verified employee permitted for employee workspace action' };
  }

  // 8. Tenant audience checks (Client Workspace)
  if (resource.audience === 'tenant' || resource.audience === 'tenant_team') {
    if (!actor.activeTenantId) {
      return { allow: false, reason: 'Active workspace is required for tenant-scoped operations' };
    }

    const membership = actor.memberships.find(
      (m) => m.orgId === actor.activeTenantId && m.status === 'active'
    );

    if (!membership) {
      return { allow: false, reason: 'No active membership found for the selected tenant' };
    }

    // Must match the resource's organization
    if (resource.orgId && resource.orgId !== actor.activeTenantId) {
      // Check if employee has explicit, approved support authorization
      const hasSupportGrant =
        actor.platformGrants.includes('support_authorisation') ||
        actor.platformGrants.includes('portal_admin');
      if (!hasSupportGrant) {
        return {
          allow: false,
          reason: 'Tenant isolation violation: cannot access another organization resources',
        };
      }
    }

    // Client Admin actions
    if (action === 'invite_member' || action === 'manage_roles') {
      if (membership.role !== 'client_admin') {
        return { allow: false, reason: 'Only client administrators can manage members within their organisation' };
      }
      return { allow: true, reason: 'Client admin permitted to manage members in own organisation' };
    }

    // Contribution creation / editing
    if (resource.kind === 'contribution') {
      if (action === 'create' || action === 'submit') {
        return { allow: true, reason: 'Client member permitted to create and submit observations' };
      }
      if (action === 'withdraw') {
        // Author or client admin in own org
        if (resource.authorId === actor.userId || membership.role === 'client_admin') {
          return { allow: true, reason: 'Author or client admin permitted to withdraw contribution' };
        }
        return { allow: false, reason: 'Only author or client admin can withdraw contribution' };
      }
      if (action === 'update') {
        if (resource.authorId === actor.userId) {
          return { allow: true, reason: 'Author permitted to update draft or amend returned contribution' };
        }
        return { allow: false, reason: 'Only the author can update their contribution' };
      }
      if (action === 'delete') {
        if (resource.authorId === actor.userId && resource.isDraft) {
          return { allow: true, reason: 'Author can delete private draft' };
        }
        return { allow: false, reason: 'Only author can delete unsubmitted draft' };
      }
      if (action === 'read') {
        return { allow: true, reason: 'Permitted to read organisation observation' };
      }
    }

    if (action === 'read' || action === 'run_sandbox') {
      return { allow: true, reason: 'Permitted client member access within active tenant' };
    }
  }

  // 9. Entitled audience (Product Sandboxes)
  if (resource.audience === 'entitled') {
    if (!actor.activeTenantId) {
      return { allow: false, reason: 'Active workspace required to verify product entitlements' };
    }
    return { allow: true, reason: 'Entitled workspace feature accessible' };
  }

  // 10. Platform Administration
  if (
    action === 'manage_org' ||
    action === 'admin.org.suspend' ||
    action === 'admin.org.archive' ||
    action === 'grant_platform_role' ||
    action === 'admin.grant.assign' ||
    action === 'admin.audit.export' ||
    action === 'admin.user.anonymise' ||
    action === 'notify.broadcast' ||
    action === 'access_support'
  ) {
    if (!actor.isVerifiedEmployee) {
      return { allow: false, reason: 'Platform administration requires verified employee status' };
    }
    if (actor.platformGrants.includes('portal_admin')) {
      return { allow: true, reason: 'Portal administrator permitted' };
    }
    return { allow: false, reason: 'Requires portal_admin grant' };
  }

  // 10b. Content Publishing & Support Access Scopes
  if (action === 'content.publish') {
    if (actor.platformGrants.includes('content_publisher')) {
      return { allow: true, reason: 'Content publisher permitted to publish content' };
    }
    return { allow: false, reason: 'Requires content_publisher grant (portal admin cannot publish without content_publisher)' };
  }

  if (action === 'support.view') {
    if (actor.platformGrants.includes('support_authorisation')) {
      return { allow: true, reason: 'Support authorisation active for requested resource' };
    }
    return { allow: false, reason: 'Requires approved, active support authorisation scoped to this resource' };
  }

  // 11. Product Owner Improvement Loop
  if (resource.kind === 'idea') {
    if (action === 'read') {
      return { allow: true, reason: 'Ideas or their client visible projections are readable' };
    }
    if (action === 'update' || action === 'create') {
      if (
        actor.platformGrants.includes('product_owner') ||
        actor.platformGrants.includes('portal_admin')
      ) {
        return { allow: true, reason: 'Product owner permitted to manage improvement ideas' };
      }
      return { allow: false, reason: 'Requires product_owner assignment to manage ideas' };
    }
  }

  // Catch-all deny
  return { allow: false, reason: 'Deny by default: no matching policy rule found' };
}

