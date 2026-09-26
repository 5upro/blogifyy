require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user');
const { PAID_PLANS, ACCENT_KEYS } = require('../utils/premium');

const VALID_ROLES = ['user', 'admin'];
const VALID_PLANS = ['free', ...Object.keys(PAID_PLANS)];

const parseArgs = () => {
  const [email, ...rest] = process.argv.slice(2);
  const options = {};

  rest.forEach((arg) => {
    const [key, ...values] = arg.replace(/^--/, '').split('=');
    options[key] = values.length > 0 ? values.join('=') : true;
  });

  if (!email) {
    console.error('Usage: node scripts/grant-access.js <email> [--role=admin|user] [--plan=pro_monthly|pro_yearly|free] [--accent=key] [--verify] [--affiliate] [--unaffiliate]');
    process.exit(1);
  }

  if (options.role && !VALID_ROLES.includes(options.role)) {
    console.error(`Invalid role. Use one of: ${VALID_ROLES.join(', ')}`);
    process.exit(1);
  }

  if (options.plan && !VALID_PLANS.includes(options.plan)) {
    console.error(`Invalid plan. Use one of: ${VALID_PLANS.join(', ')}`);
    process.exit(1);
  }

  if (options.accent && !ACCENT_KEYS.includes(options.accent)) {
    console.error(`Invalid accent. Use one of: ${ACCENT_KEYS.join(', ')}`);
    process.exit(1);
  }

  return { email: email.trim().toLowerCase(), options };
};

const describe = (user) => ({
  email: user.email,
  username: user.username,
  role: user.role,
  isVerified: user.isVerified,
  isAffiliated: user.isAffiliated,
  plan: user.plan,
  premiumStatus: user.premiumStatus,
  premiumExpiresAt: user.premiumExpiresAt,
  accent: user.theme?.accent
});

const run = async () => {
  const { email, options } = parseArgs();

  await mongoose.connect(process.env.MONGO_URI);
  console.log(`Connected to database: ${mongoose.connection.name}`);

  const user = await User.findOne({ email });
  if (!user) {
    console.error(`No user found for ${email}`);
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log('Before:', JSON.stringify(describe(user), null, 2));

  if (options.verify) {
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    console.log('Email marked as verified');
  }

  if (options.role) {
    user.role = options.role;
    console.log(`Role set to ${options.role}`);
  }

  if (options.plan) {
    if (options.plan === 'free') {
      user.expirePremium();
      console.log('Premium removed, account downgraded to Free');
    } else {
      const plan = PAID_PLANS[options.plan];
      user.activatePremium(plan.key, plan.durationDays, 'manual_grant');
      console.log(`Premium activated on ${plan.name} (${plan.billing}) for ${plan.durationDays} days`);
    }
  }

  if (options.accent) {
    user.theme.accent = options.accent;
    console.log(`Accent set to ${options.accent}`);
  }

  if (options.affiliate) {
    user.isAffiliated = true;
    console.log('Marked as affiliated with Blogify');
  }

  if (options.unaffiliate) {
    user.isAffiliated = false;
    console.log('Removed Blogify affiliation');
  }

  if (options.verify || options.role || options.plan || options.accent || options.affiliate || options.unaffiliate) {
    await user.save();
    console.log('Saved');
  } else {
    console.log('No changes requested. Pass --role, --plan, --accent, --verify, --affiliate or --unaffiliate to make changes.');
  }

  const updated = await User.findById(user._id);
  console.log('After:', JSON.stringify(describe(updated), null, 2));

  await mongoose.disconnect();
};

run().catch((error) => {
  console.error('Grant failed:', error.message);
  process.exit(1);
});
