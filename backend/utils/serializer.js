const { hasActivePremium, isProSubscriber, resolveAccent, entitlementsFor } = require('./premium');

const sanitizeSocialHandles = (socialHandles = {}) => ({
  twitter: String(socialHandles.twitter || '').trim(),
  github: String(socialHandles.github || '').trim(),
  linkedin: String(socialHandles.linkedin || '').trim(),
  website: String(socialHandles.website || '').trim(),
  instagram: String(socialHandles.instagram || '').trim()
});

const serializeUser = (user) => {
  const isPro = hasActivePremium(user);

  return {
    id: user._id,
    name: user.name,
    username: user.username || '',
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    isAffiliated: Boolean(user.isAffiliated),
    plan: isPro ? 'pro' : 'free',
    premiumStatus: user.premiumStatus || 'none',
    isProSubscriber: isProSubscriber(user),
    premiumExpiresAt: user.premiumExpiresAt || null,
    accent: resolveAccent(user.theme?.accent),
    entitlements: entitlementsFor(user),
    bio: user.bio || '',
    profilePicture: user.profilePicture || '',
    socialHandles: sanitizeSocialHandles(user.socialHandles)
  };
};

module.exports = { sanitizeSocialHandles, serializeUser };
