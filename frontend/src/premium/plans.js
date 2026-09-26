export const FREE_BLOG_LIMIT = 10;

export const ACCENTS = [
  { key: 'indigo', label: 'Indigo', hex: '#6366f1' },
  { key: 'violet', label: 'Violet', hex: '#8b5cf6' },
  { key: 'fuchsia', label: 'Fuchsia', hex: '#d946ef' },
  { key: 'rose', label: 'Rose', hex: '#f43f5e' },
  { key: 'amber', label: 'Amber', hex: '#f59e0b' },
  { key: 'emerald', label: 'Emerald', hex: '#10b981' },
  { key: 'cyan', label: 'Cyan', hex: '#06b6d4' },
  { key: 'sky', label: 'Sky', hex: '#0ea5e9' }
];

export const DEFAULT_ACCENT = 'indigo';

export const ACCENT_MAP = ACCENTS.reduce((map, accent) => {
  map[accent.key] = accent.hex;
  return map;
}, {});

export const accentHex = (key) => ACCENT_MAP[key] || ACCENT_MAP[DEFAULT_ACCENT];

export const FALLBACK_PLANS = [
  {
    key: 'free',
    name: 'Free',
    billing: 'lifetime',
    amount: 0,
    currency: 'INR',
    durationDays: 0,
    tagline: 'Start writing and publish your first 10 posts.',
    features: {
      blogLimit: FREE_BLOG_LIMIT,
      featuredImage: false,
      privatePosts: false,
      customTheme: false,
      premiumBadge: false
    }
  },
  {
    key: 'pro_monthly',
    name: 'Pro',
    billing: 'monthly',
    amount: 49900,
    currency: 'INR',
    durationDays: 30,
    tagline: 'Everything a serious writer needs, billed monthly.',
    features: {
      blogLimit: null,
      featuredImage: true,
      privatePosts: true,
      customTheme: true,
      premiumBadge: true
    }
  },
  {
    key: 'pro_yearly',
    name: 'Pro',
    billing: 'yearly',
    amount: 499900,
    currency: 'INR',
    durationDays: 365,
    tagline: 'Two months free compared to the monthly plan.',
    features: {
      blogLimit: null,
      featuredImage: true,
      privatePosts: true,
      customTheme: true,
      premiumBadge: true
    }
  }
];

export const FEATURE_LABELS = {
  featuredImage: 'Featured image on every post',
  privatePosts: 'Private posts that stay unlisted',
  customTheme: 'Custom accent theme',
  premiumBadge: 'Pro badge on your posts'
};

export const formatPrice = (amount, currency = 'INR') => {
  if (!amount) return 'Free';
  const value = (amount / 100).toFixed(0);
  return currency === 'INR' ? `₹${value}` : `${currency} ${value}`;
};

export const formatExpiry = (value) => {
  if (!value) return null;
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const loadRazorpayScript = () =>
  new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Razorpay requires a browser environment.'));
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existing = document.querySelector('script[data-razorpay="checkout"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => reject(new Error('Unable to load the payment window.')));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.dataset.razorpay = 'checkout';
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Unable to load the payment window.'));
    document.body.appendChild(script);
  });
