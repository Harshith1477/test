const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

interface AttemptRecord {
  count: number;
  firstAttempt: number;
  lockedUntil?: number;
}

const attempts = new Map<string, AttemptRecord>();

export function isLoginLocked(identifier: string): boolean {
  const record = attempts.get(identifier);
  if (!record) return false;

  if (record.lockedUntil) {
    if (Date.now() < record.lockedUntil) return true;
    attempts.delete(identifier);
    return false;
  }

  if (Date.now() - record.firstAttempt > WINDOW_MS) {
    attempts.delete(identifier);
    return false;
  }

  return false;
}

export function recordFailedLoginAttempt(identifier: string): void {
  const now = Date.now();
  const record = attempts.get(identifier);

  if (!record || now - record.firstAttempt > WINDOW_MS) {
    attempts.set(identifier, { count: 1, firstAttempt: now });
    return;
  }

  record.count += 1;
  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_MS;
  }
}

export function resetLoginAttempts(identifier: string): void {
  attempts.delete(identifier);
}
