const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const User = require('../models/user');
const Blog = require('../models/blog');
const PremiumOrder = require('../models/premium');
const razorpay = require('../utils/razorpay');
const {
  PLAN_CATALOG,
  PAID_PLANS,
  ACCENTS,
  FREE_BLOG_LIMIT,
  isPaidPlan,
  hasActivePremium,
  entitlementsFor,
  resolveAccent
} = require('../utils/premium');
const {
  sendPremiumConfirmationEmail,
  sendPremiumCancelledEmail
} = require('../utils/email');
require('dotenv').config();

const router = express.Router();

const buildPlanView = (plan, entitlements) => ({
  key: plan.key,
  name: plan.name,
  billing: plan.billing,
  amount: plan.amount,
  currency: plan.currency,
  durationDays: plan.durationDays,
  tagline: plan.tagline,
  features: entitlements
});

const serializeSubscription = (user) => {
  const isPro = hasActivePremium(user);
  return {
    plan: isPro ? 'pro' : 'free',
    status: user.premiumStatus || 'none',
    planKey: user.premiumPlan || null,
    startedAt: user.premiumStartedAt || null,
    expiresAt: user.premiumExpiresAt || null,
    accent: resolveAccent(user.theme?.accent),
    entitlements: entitlementsFor(user)
  };
};

router.get('/plans', (req, res) => {
  try {
    const plans = PLAN_CATALOG.map((plan) =>
      buildPlanView(
        plan,
        plan.key === 'free'
          ? {
            blogLimit: FREE_BLOG_LIMIT,
            featuredImage: false,
            privatePosts: false,
            customTheme: false,
            premiumBadge: false
          }
          : {
            blogLimit: null,
            featuredImage: true,
            privatePosts: true,
            customTheme: true,
            premiumBadge: true
          }
      )
    );

    res.json({ plans, accents: ACCENTS, blogLimit: FREE_BLOG_LIMIT });
  } catch (error) {
    console.error('Fetch plans error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/me', auth, async (req, res) => {
  try {
    const totalBlogs = await Blog.countDocuments({ author: req.user._id });
    const blogLimit = hasActivePremium(req.user) ? null : FREE_BLOG_LIMIT;

    res.json({
      subscription: serializeSubscription(req.user),
      usage: {
        blogsUsed: totalBlogs,
        blogLimit,
        blogsRemaining: blogLimit === null ? null : Math.max(blogLimit - totalBlogs, 0)
      }
    });
  } catch (error) {
    console.error('Fetch subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post(
  '/create-order',
  [
    auth,
    body('plan').custom((value) => isPaidPlan(value)).withMessage('Select a valid Pro plan')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (hasActivePremium(req.user)) {
        return res.status(409).json({ message: 'Your account is already on Pro.' });
      }

      const plan = PAID_PLANS[req.body.plan];

      const order = await razorpay.createOrder({
        amount: plan.amount,
        currency: plan.currency,
        receipt: `premium_${req.user._id}_${Date.now()}`
      });

      await PremiumOrder.create({
        user: req.user._id,
        plan: plan.key,
        amount: order.amount,
        currency: order.currency,
        providerOrderId: order.id,
        status: 'created'
      });

      res.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        plan: {
          key: plan.key,
          name: `${plan.name} (${plan.billing})`,
          durationDays: plan.durationDays
        },
        keyId: razorpay.getPublicKeyId(),
        demo: Boolean(order.demo)
      });
    } catch (error) {
      console.error('Create order error:', error.message);
      if (error.code === 'PAYMENT_NOT_CONFIGURED') {
        return res.status(503).json({ message: error.message });
      }
      res.status(500).json({ message: 'Unable to start the payment. Please try again.' });
    }
  }
);

router.post(
  '/verify',
  [
    auth,
    body('orderId').notEmpty().withMessage('Order id is required'),
    body('paymentId').notEmpty().withMessage('Payment id is required'),
    body('signature').notEmpty().withMessage('Signature is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { orderId, paymentId, signature } = req.body;

      const order = await PremiumOrder.findOne({ providerOrderId: orderId });

      if (!order) {
        return res.status(404).json({ message: 'Payment order not found' });
      }

      if (order.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'This order belongs to another account' });
      }

      if (order.status === 'paid') {
        return res.json({
          message: 'Subscription already activated',
          subscription: serializeSubscription(req.user)
        });
      }

      const isValidSignature = razorpay.verifyPaymentSignature({ orderId, paymentId, signature });

      if (!isValidSignature) {
        order.status = 'failed';
        await order.save();
        return res.status(400).json({ message: 'Payment verification failed' });
      }

      const plan = PAID_PLANS[order.plan];

      order.status = 'paid';
      order.providerPaymentId = paymentId;
      await order.save();

      const user = await User.findById(req.user._id);
      user.activatePremium(plan.key, plan.durationDays, paymentId);
      await user.save();

      sendPremiumConfirmationEmail({
        toEmail: user.email,
        name: user.name,
        planName: `${plan.name} (${plan.billing})`,
        amount: order.amount,
        currency: order.currency,
        expiresAt: user.premiumExpiresAt
      }).catch((error) => console.error('Failed to send premium email:', error));

      res.json({
        message: 'Pro is now active on your account',
        subscription: serializeSubscription(user)
      });
    } catch (error) {
      console.error('Verify payment error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.post('/cancel', auth, async (req, res) => {
    try {
        if (!hasActivePremium(req.user)) {
            return res.status(400).json({ message: 'No active Pro subscription to cancel' });
        }

        if (req.user.premiumStatus === 'cancelled') {
            return res.json({
                message: 'This subscription is already cancelled. Pro stays active until the current period ends.',
                subscription: serializeSubscription(req.user)
            });
        }

        req.user.premiumStatus = 'cancelled';
        await req.user.save();

        sendPremiumCancelledEmail({
            toEmail: req.user.email,
            name: req.user.name,
            expiresAt: req.user.premiumExpiresAt
        }).catch((error) => console.error('Failed to send cancellation email:', error));

        res.json({
            message: 'Subscription cancelled. Pro stays active until the current period ends.',
            subscription: serializeSubscription(req.user)
        });
    } catch (error) {
        console.error('Cancel subscription error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
