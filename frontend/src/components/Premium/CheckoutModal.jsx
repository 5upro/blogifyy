import React, { useState } from 'react';
import { X, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../Auth/AuthContext';
import { premiumAPI } from '../../api';
import { formatPrice, loadRazorpayScript } from '../../premium/plans';
import { RAZORPAY_KEY_ID, RAZORPAY_PREVIEW_ENABLED } from '../../config/razorpay';

export default function CheckoutModal({ plan, onClose, onSuccess }) {
  const { user, refreshSubscription } = useAuth();
  const [status, setStatus] = useState({ loading: false, error: '' });
  const [pendingOrder, setPendingOrder] = useState(null);
  const [scriptState, setScriptState] = useState('idle');
  const [previewState, setPreviewState] = useState('idle');

  const openRazorpayPreview = async () => {
    setPreviewState('loading');

    try {
      await loadRazorpayScript();

      if (!window.Razorpay) {
        setPreviewState('unavailable');
        return;
      }

      const checkout = new window.Razorpay({
        key: RAZORPAY_KEY_ID,
        amount: plan.amount,
        currency: plan.currency,
        name: 'Blogify',
        description: `${plan.name} plan, UI preview only`,
        order_id: '',
        prefill: {
          name: user?.name || '',
          email: user?.email || ''
        },
        theme: {
          color: '#6366f1'
        },
        handler: () => {
          setPreviewState('finished');
        },
        modal: {
          ondismiss: () => setPreviewState('idle')
        }
      });

      checkout.open();
      setPreviewState('open');
    } catch {
      setPreviewState('unavailable');
    }
  };

  const completeDemoPayment = async () => {
    if (!pendingOrder) return;

    setStatus({ loading: true, error: '' });

    try {
      await premiumAPI.verifyPayment({
        orderId: pendingOrder.orderId,
        paymentId: `pay_demo_${pendingOrder.orderId}`,
        signature: 'demo'
      });

      await refreshSubscription();
      onSuccess();
    } catch (error) {
      setStatus({
        loading: false,
        error: error.response?.data?.message || 'Demo payment could not be completed.'
      });
    }
  };

  const close = () => {
    if (status.loading) return;
    onClose();
  };

  const handlePay = async () => {
    if (!plan) return;

    setStatus({ loading: true, error: '' });

    try {
      const orderResponse = await premiumAPI.createOrder(plan.key);
      const order = orderResponse.data;

      if (order.demo) {
        setPendingOrder(order);
        setStatus({ loading: false, error: '' });
        setScriptState('loading');

        try {
          await loadRazorpayScript();
          setScriptState(window.Razorpay ? 'ready' : 'missing');
        } catch {
          setScriptState('failed');
        }

        return;
      }

      await loadRazorpayScript();

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Blogify',
        description: `${order.plan.name} subscription`,
        order_id: order.orderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || ''
        },
        theme: {
          color: '#6366f1'
        },
        handler: async (payment) => {
          try {
            await premiumAPI.verifyPayment({
              orderId: payment.razorpay_order_id,
              paymentId: payment.razorpay_payment_id,
              signature: payment.razorpay_signature
            });

            await refreshSubscription();
            onSuccess();
          } catch (error) {
            setStatus({
              loading: false,
              error: error.response?.data?.message || 'Payment verification failed. Contact support if you were charged.'
            });
          }
        },
        modal: {
          ondismiss: () => setStatus({ loading: false, error: '' })
        }
      });

      checkout.open();
    } catch (error) {
      setStatus({
        loading: false,
        error: error.response?.data?.message || 'Unable to start the payment. Please try again.'
      });
    }
  };

  if (!plan) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={close}
    >
      <div
        className="w-full max-w-md bg-[#101018] border border-white/[0.08] rounded-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-lg font-semibold text-white/90">
              {plan.name} plan
            </h3>
            <p className="text-sm text-white/40 mt-0.5">{plan.tagline}</p>
          </div>
          <button
            type="button"
            onClick={close}
            className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.06] transition-all"
            aria-label="Close checkout"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl flex items-center justify-between">
          <span className="text-sm text-white/60">
            Billed {plan.billing === 'yearly' ? 'yearly' : 'monthly'}
          </span>
          <span className="text-xl font-bold text-white/90">
            {formatPrice(plan.amount, plan.currency)}
          </span>
        </div>

        {pendingOrder && (
          <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <p className="text-sm font-medium text-amber-200">Demo mode</p>
            <p className="text-xs text-amber-200/70 mt-1 leading-relaxed">
              No payment provider is configured on this server, so the payment step is simulated. Nothing is charged
              and no money moves.
            </p>
            <p className="text-xs text-amber-200/60 mt-3 flex items-center gap-2">
              {scriptState === 'loading' && (
                <>
                  <Loader2 size={12} className="animate-spin" />
                  Loading the Razorpay script from Razorpay CDN
                </>
              )}
              {scriptState === 'ready' && (
                <>
                  <ShieldCheck size={12} />
                  Razorpay script loaded, checkout.js is available
                </>
              )}
              {scriptState === 'missing' && (
                <>
                  <AlertCircle size={12} />
                  Script downloaded but window.Razorpay is undefined
                </>
              )}
              {scriptState === 'failed' && (
                <>
                  <AlertCircle size={12} />
                  Could not load checkout.js, likely blocked by the network or an extension
                </>
              )}
            </p>
          </div>
        )}

        {status.error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-300">
            {status.error}
          </div>
        )}

        {pendingOrder ? (
          <button
            type="button"
            onClick={completeDemoPayment}
            disabled={status.loading}
            className="mt-5 w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold transition-all disabled:opacity-50 hover:shadow-[0_0_24px_-4px_rgba(99,102,241,0.5)]"
          >
            {status.loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Activating Pro
              </>
            ) : (
              'Complete demo payment'
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={handlePay}
            disabled={status.loading}
            className="mt-5 w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold transition-all disabled:opacity-50 hover:shadow-[0_0_24px_-4px_rgba(99,102,241,0.5)]"
          >
            {status.loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Preparing payment
              </>
            ) : (
              'Pay securely with Razorpay'
            )}
          </button>
        )}

        {RAZORPAY_PREVIEW_ENABLED && (
          <div className="mt-4 pt-4 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={openRazorpayPreview}
              disabled={previewState === 'loading'}
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.08] text-sm font-medium transition-all disabled:opacity-50"
            >
              {previewState === 'loading' ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Loading Razorpay
                </>
              ) : previewState === 'open' ? (
                'Razorpay opened, dismiss it to try again'
              ) : previewState === 'finished' ? (
                'Preview closed, no payment was taken'
              ) : previewState === 'unavailable' ? (
                'checkout.js could not be loaded, check your connection'
              ) : (
                'Preview the official Razorpay checkout'
              )}
            </button>
            <p className="mt-2 text-[11px] text-white/25 text-center leading-relaxed">
              Development only. Opens Razorpay's real checkout sheet with no order behind it, so the payment step
              itself will be rejected. No plan is granted.
            </p>
          </div>
        )}

        <p className="mt-4 flex items-center justify-center gap-2 text-xs text-white/30 text-center">
          <ShieldCheck size={14} />
          Payments are processed by Razorpay. Blogify never stores your card details.
        </p>
      </div>
    </div>
  );
}
