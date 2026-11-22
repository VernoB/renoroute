export const OTP_LENGTH = 6;
export const OTP_RESEND_SECONDS = 60;

export function otpDigits(value: string): string {
  return value.replace(/\D/g, '').slice(0, OTP_LENGTH);
}

export function otpReady(code: string): boolean {
  return otpDigits(code).length === OTP_LENGTH;
}
