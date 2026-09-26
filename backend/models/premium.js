const mongoose = require('mongoose');

const premiumOrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    plan: {
        type: String,
        enum: ['pro_monthly', 'pro_yearly'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    provider: {
        type: String,
        default: 'razorpay'
    },
    providerOrderId: {
        type: String,
        required: true,
        unique: true
    },
    providerPaymentId: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['created', 'paid', 'failed'],
        default: 'created'
    }
}, {
    timestamps: true
});

premiumOrderSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('PremiumOrder', premiumOrderSchema);
