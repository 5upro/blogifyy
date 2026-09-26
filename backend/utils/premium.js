const FREE_BLOG_LIMIT = 10;

const PAID_PLANS = {
    pro_monthly: {
        key: 'pro_monthly',
        name: 'Pro',
        billing: 'monthly',
        amount: 49900,
        currency: 'INR',
        durationDays: 30,
        tagline: 'Everything a serious writer needs, billed monthly.'
    },
    pro_yearly: {
        key: 'pro_yearly',
        name: 'Pro',
        billing: 'yearly',
        amount: 499900,
        currency: 'INR',
        durationDays: 365,
        tagline: 'Two months free compared to the monthly plan.'
    }
};

const FREE_PLAN = {
    key: 'free',
    name: 'Free',
    billing: 'lifetime',
    amount: 0,
    currency: 'INR',
    durationDays: 0,
    tagline: 'Start writing and publish your first 10 posts.'
};

const PLAN_CATALOG = [FREE_PLAN, PAID_PLANS.pro_monthly, PAID_PLANS.pro_yearly];

const PLAN_FEATURE_MATRIX = {
    free: {
        blogLimit: FREE_BLOG_LIMIT,
        featuredImage: false,
        privatePosts: false,
        customTheme: false,
        premiumBadge: false
    },
    pro: {
        blogLimit: null,
        featuredImage: true,
        privatePosts: true,
        customTheme: true,
        premiumBadge: true
    }
};

const ACCENTS = [
    { key: 'indigo', label: 'Indigo', hex: '#6366f1' },
    { key: 'violet', label: 'Violet', hex: '#8b5cf6' },
    { key: 'fuchsia', label: 'Fuchsia', hex: '#d946ef' },
    { key: 'rose', label: 'Rose', hex: '#f43f5e' },
    { key: 'amber', label: 'Amber', hex: '#f59e0b' },
    { key: 'emerald', label: 'Emerald', hex: '#10b981' },
    { key: 'cyan', label: 'Cyan', hex: '#06b6d4' },
    { key: 'sky', label: 'Sky', hex: '#0ea5e9' }
];

const DEFAULT_ACCENT = 'indigo';

const ACCENT_KEYS = ACCENTS.map((accent) => accent.key);

const isValidAccent = (accent) => ACCENT_KEYS.includes(accent);

const isPaidPlan = (planKey) => Object.prototype.hasOwnProperty.call(PAID_PLANS, planKey);

const resolveAccent = (accent) => (isValidAccent(accent) ? accent : DEFAULT_ACCENT);

const isExpired = (user) => {
    if (!user.premiumExpiresAt) return false;
    return new Date(user.premiumExpiresAt).getTime() <= Date.now();
};

const hasActivePremium = (user) => {
    if (!user || user.plan !== 'pro') return false;
    if (user.premiumStatus !== 'active' && user.premiumStatus !== 'cancelled') return false;
    return !isExpired(user);
};

const isProSubscriber = (user) => {
    if (!user || user.plan !== 'pro') return false;
    if (user.premiumStatus !== 'active') return false;
    return !isExpired(user);
};

const entitlementsFor = (user) => (hasActivePremium(user) ? PLAN_FEATURE_MATRIX.pro : PLAN_FEATURE_MATRIX.free);

module.exports = {
    FREE_BLOG_LIMIT,
    FREE_PLAN,
    PAID_PLANS,
    PLAN_CATALOG,
    PLAN_FEATURE_MATRIX,
    ACCENTS,
    ACCENT_KEYS,
    DEFAULT_ACCENT,
    isValidAccent,
    isPaidPlan,
    resolveAccent,
    isExpired,
    hasActivePremium,
    isProSubscriber,
    entitlementsFor
};
