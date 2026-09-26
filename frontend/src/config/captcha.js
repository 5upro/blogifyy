export const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

export const RECAPTCHA_ENABLED = import.meta.env.PROD && Boolean(RECAPTCHA_SITE_KEY);

if (import.meta.env.PROD && !RECAPTCHA_SITE_KEY) {
  console.warn('VITE_RECAPTCHA_SITE_KEY is not set - reCAPTCHA disabled in production.');
}
