import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2023-10-16' as any, // Using latest or required api version
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, successUrl, cancelUrl, isFabric, currency = 'usd' } = body;

    const lineItems = items.map((item: any) => {
      const amount = item.isFabric ? (item.price * 0.5) : item.price;
      return {
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: item.isFabric ? `${item.name} (50% Advance)` : item.name,
            images: item.images && item.images.length > 0 ? [item.images[0]] : [],
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: item.quantity,
      };
    });

    const paymentMethodTypes: any[] = ['card'];
    
    if (currency.toLowerCase() === 'inr') {
      paymentMethodTypes.push('upi');
      paymentMethodTypes.push('netbanking');
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: paymentMethodTypes,
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['IN', 'US', 'GB', 'CA', 'AU', 'FR', 'DE', 'IT', 'ES', 'NL', 'BE', 'SG', 'MY', 'AE'],
      },
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (error: any) {
    console.error('Stripe Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
