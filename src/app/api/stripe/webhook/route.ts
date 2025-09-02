import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createRouteHandlerClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature')!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createRouteHandlerClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const userId = session.metadata?.user_id;
        const subscriptionId = session.subscription;

        if (userId && subscriptionId) {
          // Update user's subscription status
          await supabase
            .from('profiles')
            .update({
              subscription_status: 'pro',
              stripe_subscription_id: subscriptionId,
            })
            .eq('user_id', userId);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        const userId = subscription.metadata?.user_id;

        if (userId) {
          const status = subscription.status === 'active' ? 'pro' : 'free';
          await supabase
            .from('profiles')
            .update({
              subscription_status: status,
              stripe_subscription_id: subscription.id,
            })
            .eq('user_id', userId);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        const userId = subscription.metadata?.user_id;

        if (userId) {
          await supabase
            .from('profiles')
            .update({
              subscription_status: 'free',
              stripe_subscription_id: null,
            })
            .eq('user_id', userId);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        const subscriptionId = invoice.subscription;

        if (subscriptionId) {
          // Find user by subscription ID and update status
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('stripe_subscription_id', subscriptionId)
            .single();

          if (profile) {
            await supabase
              .from('profiles')
              .update({
                subscription_status: 'free',
              })
              .eq('user_id', profile.user_id);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
