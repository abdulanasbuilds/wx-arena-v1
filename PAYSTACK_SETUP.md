# WX Arena - Paystack Integration Guide

## Why Paystack?

- ✅ Supports Nigeria, Ghana, Kenya, South Africa
- ✅ Mobile money (M-Pesa, MTN Mobile Money)
- ✅ Card payments (Visa, Mastercard, Verve)
- ✅ Bank transfers
- ✅ USSD payments
- ✅ Lower fees than Stripe for African markets
- ✅ Easy integration

## Setup Instructions

### 1. Create Paystack Account

1. Go to [https://paystack.com](https://paystack.com)
2. Sign up as a business
3. Complete KYC verification (required for live mode)
4. Get your API keys from Dashboard → Settings → API Keys

### 2. Environment Variables

Add to `.env.local`:
```
PAYSTACK_PUBLIC_KEY=pk_test_your_key_here
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_key_here
```

### 3. Install Dependencies

```bash
npm install @paystack/inline-js
```

### 4. Test Mode

Use test cards:
- Card: 4084 0840 8408 4081
- Expiry: Any future date
- CVV: 000
- PIN: 1234

### 5. Go Live

1. Switch to live keys
2. Complete business verification
3. Set up webhook endpoint: `/api/payments/webhook`
4. Configure payout account

## Features Implemented

- ✅ Buy Points page
- ✅ Multiple point packages
- ✅ Secure payment popup
- ✅ Webhook verification
- ✅ Automatic point crediting
- ✅ Transaction history
- ✅ Withdrawal system

## API Endpoints

- `POST /api/payments/initialize` - Start payment
- `POST /api/payments/verify` - Verify transaction
- `POST /api/payments/webhook` - Paystack webhook
- `POST /api/payments/withdraw` - Request withdrawal

## Security

- Webhook signature verification
- Transaction reference validation
- Idempotency checks
- HTTPS only

## Support

- Paystack Docs: https://paystack.com/docs
- Support: support@paystack.com
