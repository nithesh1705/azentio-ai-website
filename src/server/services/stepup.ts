import { StepupVerification } from '@/types';
import crypto from 'crypto';

// In-memory step-up token cache
const stepupStore = new Map<string, {
  userId: string;
  codeHash: string;
  expiresAt: number; // timestamp ms
  verifiedAt?: number;
  purpose: string;
}>();

// Standard window: 10 minutes
export const STEPUP_TTL_MS = 10 * 60 * 1000;

function hashToken(code: string): string {
  return crypto.createHash('sha256').update(code.trim()).digest('hex');
}

/**
 * Initiates a step-up verification code for sensitive admin actions.
 * In production, this would dispatch an email or SMS OTP.
 * In demo/development environments, a standard predictable OTP '123456' is provisioned.
 */
export function requestStepup(userId: string, purpose: string): { verificationId: string; expiresAt: string; code: string } {
  const code = '123456'; // Default demo OTP code
  const codeHash = hashToken(code);
  const now = Date.now();
  const expiresAtMs = now + STEPUP_TTL_MS;
  const verificationId = `stepup-${userId}-${now}`;

  stepupStore.set(userId, {
    userId,
    codeHash,
    expiresAt: expiresAtMs,
    purpose,
  });

  return {
    verificationId,
    expiresAt: new Date(expiresAtMs).toISOString(),
    code,
  };
}

/**
 * Validates a submitted step-up code against the active session.
 */
export function verifyStepup(userId: string, code: string, purpose?: string): { success: boolean; error?: string } {
  const entry = stepupStore.get(userId);
  if (!entry) {
    return { success: false, error: 'No active step-up request found. Please request a new code.' };
  }

  if (Date.now() > entry.expiresAt) {
    stepupStore.delete(userId);
    return { success: false, error: 'Verification code has expired (10 minute limit). Please request a new code.' };
  }

  const submittedHash = hashToken(code);
  if (submittedHash !== entry.codeHash) {
    return { success: false, error: 'Invalid verification code. Please check and try again.' };
  }

  // Mark as verified
  entry.verifiedAt = Date.now();
  // Reset TTL from moment of verification for 10 minutes of active elevated privileges
  entry.expiresAt = Date.now() + STEPUP_TTL_MS;
  stepupStore.set(userId, entry);

  return { success: true };
}

/**
 * Checks if the user holds an active, unexpired step-up clearance (within 10 minutes).
 */
export function isStepupValid(userId: string): boolean {
  const entry = stepupStore.get(userId);
  if (!entry) return false;
  if (!entry.verifiedAt) return false;
  if (Date.now() > entry.expiresAt) {
    stepupStore.delete(userId);
    return false;
  }
  return true;
}

/**
 * Invalidate elevation after critical action completes if desired.
 */
export function clearStepup(userId: string): void {
  stepupStore.delete(userId);
}
