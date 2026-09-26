const crypto = require('crypto');

const RAZORPAY_API_BASE = 'https://api.razorpay.com/v1';

const getCredentials = () => ({
    keyId: (process.env.RAZORPAY_KEY_ID || '').trim(),
    keySecret: (process.env.RAZORPAY_KEY_SECRET || '').trim()
});

const isConfigured = () => {
    const { keyId, keySecret } = getCredentials();
    return Boolean(keyId && keySecret);
};

const isProduction = () => process.env.NODE_ENV === 'production';

const isDemoMode = () => {
    const requested = (process.env.RAZORPAY_DEMO_MODE || '').trim().toLowerCase() === 'true';
    if (!requested) return false;
    if (isProduction()) {
        console.error('RAZORPAY_DEMO_MODE is set but NODE_ENV is production. Demo mode stays off.');
        return false;
    }
    return true;
};

const getPublicKeyId = () => getCredentials().keyId;

const basicAuthHeader = () => {
    const { keyId, keySecret } = getCredentials();
    return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;
};

const createOrder = async ({ amount, currency, receipt }) => {
    if (isDemoMode()) {
        return {
            id: `order_demo_${crypto.randomBytes(10).toString('hex')}`,
            amount,
            currency,
            demo: true
        };
    }

    if (!isConfigured()) {
        const error = new Error('Razorpay is not configured on the server.');
        error.code = 'PAYMENT_NOT_CONFIGURED';
        throw error;
    }

    const response = await fetch(`${RAZORPAY_API_BASE}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: basicAuthHeader()
        },
        body: JSON.stringify({
            amount,
            currency,
            receipt,
            payment_capture: 1
        })
    });

    const payload = await response.json();

    if (!response.ok) {
        const error = new Error(payload?.error?.description || 'Unable to create payment order.');
        error.code = 'PAYMENT_ORDER_FAILED';
        throw error;
    }

    return {
        id: payload.id,
        amount: payload.amount,
        currency: payload.currency
    };
};

const verifyPaymentSignature = ({ orderId, paymentId, signature }) => {
    if (isDemoMode()) return true;

    const { keySecret } = getCredentials();
    if (!keySecret) return false;

    const expected = crypto
        .createHmac('sha256', keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

    const expectedBuffer = Buffer.from(expected, 'utf8');
    const receivedBuffer = Buffer.from(String(signature || ''), 'utf8');

    if (expectedBuffer.length !== receivedBuffer.length) return false;

    return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
};

module.exports = { isConfigured, isDemoMode, getPublicKeyId, createOrder, verifyPaymentSignature };
