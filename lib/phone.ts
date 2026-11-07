// Free mobile-number login (no SMS): each mobile number gets a private login address
// like 9876543210@m.gharloop.com behind the scenes. Users only ever see their number.
const LOGIN_DOMAIN = 'm.gharloop.com';

/** Turns "+91 98765-43210", "098765 43210" etc. into "9876543210", or null if it isn't an Indian mobile. */
export function cleanMobile(input: string): string | null {
  let digits = input.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

export const mobileLogin = (mobile: string) => `${mobile}@${LOGIN_DOMAIN}`;

/** The mobile number behind a login address, or null for a normal email account. */
export function mobileFromLogin(email?: string | null): string | null {
  const m = email?.match(/^(\d{10})@m\.gharloop\.com$/);
  return m ? m[1] : null;
}

export const showMobile = (mobile: string) => `+91 ${mobile.slice(0, 5)} ${mobile.slice(5)}`;

export type LoginMode = 'mobile' | 'email';
export const LOGIN_MODES: { key: LoginMode; label: string }[] = [
  { key: 'mobile', label: 'Mobile number' },
  { key: 'email', label: 'Email' },
];
