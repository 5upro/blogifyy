import React, { useState } from 'react';
import { X, ShieldCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../../Auth/AuthContext';
import { premiumAPI } from '../../api';
import { formatPrice, loadRazorpayScript } from '../../premium/plans';

export default function CheckoutModal({ plan, onClose, onSuccess }) {
  const { user, refreshSubscription } = useAuth();
  const [status, setStatus] = useState({ loading: false, error: '' });

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

        {status.error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-300">
            {status.error}
          </div>
        )}

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

        <p className="mt-4 flex items-center justify-center gap-2 text-xs text-white/30 text-center">
          <ShieldCheck size={14} />
          Payments are processed by Razorpay. Blogify never stores your card details.
        </p>
      </div>
    </div>
  );
}
