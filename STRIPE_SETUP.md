# Stripe Integration Setup Guide

## 🚀 Complete Stripe Integration for BudgetFlow Pro

### 1. Environment Variables Required

Add these to your `.env.local` file:

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PRICE_ID=price_your_price_id

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 2. Stripe Dashboard Setup

1. **Create Stripe Account**
   - Go to [stripe.com](https://stripe.com) and create an account
   - Get your API keys from the Dashboard → Developers → API keys

2. **Create Product & Price**
   - Go to Dashboard → Products
   - Create a new product called "BudgetFlow Pro"
   - Add a recurring price of $9.99/month
   - Copy the Price ID (starts with `price_`)

3. **Set up Webhooks**
   - Go to Dashboard → Developers → Webhooks
   - Add endpoint: `https://your-domain.com/api/stripe/webhook`
   - Select these events:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`
   - Copy the webhook secret (starts with `whsec_`)

### 3. Files Created

✅ **Stripe Configuration**: `src/lib/stripe.ts`
✅ **Checkout API**: `src/app/api/stripe/create-checkout-session/route.ts`
✅ **Webhook Handler**: `src/app/api/stripe/webhook/route.ts`
✅ **Customer Portal**: `src/app/api/stripe/create-portal-session/route.ts`
✅ **Frontend Hook**: `src/hooks/useStripe.ts`
✅ **Updated UI**: `src/components/subscription-status.tsx`

### 4. Features Implemented

- ✅ **Stripe Checkout** - Secure payment processing
- ✅ **Webhook Handling** - Automatic subscription status updates
- ✅ **Customer Portal** - Subscription management for Pro users
- ✅ **Feature Gating** - Unlimited features for Pro users
- ✅ **Error Handling** - Toast notifications for errors
- ✅ **Loading States** - UI feedback during processing

### 5. How It Works

1. **Free User Clicks Upgrade**
   - Creates Stripe checkout session
   - Redirects to Stripe payment page
   - User enters payment details

2. **Payment Successful**
   - Stripe webhook updates user status to 'pro'
   - User gets unlimited access to all features
   - Graphs and unlimited items become available

3. **Pro User Management**
   - "Manage Subscription" button opens Stripe customer portal
   - Users can update payment methods, cancel, etc.
   - Changes automatically sync via webhooks

### 6. Testing

- Use Stripe test cards for testing
- Test webhook locally with Stripe CLI
- Verify subscription status updates in database

### 7. Production Deployment

- Update `NEXT_PUBLIC_APP_URL` to your production domain
- Use production Stripe keys
- Set up production webhook endpoint
- Test the complete flow

## 🎯 Ready to Go!

Once you add the environment variables and set up your Stripe account, the premium version will be fully functional!
