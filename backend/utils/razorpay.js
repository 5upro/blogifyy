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

const getPublicKeyId = () => getCredentials().keyId;

const basicAuthHeader = () => {
    const { keyId, keySecret } = getCredentials();
    return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;
};

const createOrder = async ({ amount, currency, receipt }) => {
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

module.exports = { isConfigured, getPublicKeyId, createOrder, verifyPaymentSignature };
