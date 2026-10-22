export type AuthFailure = 'offline' | 'rejected';

export function isEmailAddress(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isOtpCode(value: string): boolean {
  return /^\d{6}$/.test(value.trim());
}

export function authFailure(error: unknown): AuthFailure {
  return error instanceof Error && error.message === 'offline' ? 'offline' : 'rejected';
}
