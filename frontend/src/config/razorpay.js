export const RAZORPAY_KEY_ID = (import.meta.env.VITE_RAZORPAY_KEY_ID || '').trim();

export const RAZORPAY_PREVIEW_ENABLED = Boolean(import.meta.env.DEV && RAZORPAY_KEY_ID);
