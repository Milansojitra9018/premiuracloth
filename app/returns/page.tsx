"use client";
import React from 'react';
import SEO from "@/src/components/SEO";

export default function Returns() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-24">
      <SEO 
        title="Returns & Exchanges"
        description="Read our returns and exchanges policy. We want you to be completely satisfied with your premium clothing and fabric purchases at Premiura."
        keywords="returns policy, exchanges, Premiura returns"
      />
      <h1 className="text-5xl font-bold tracking-tighter mb-12">RETURNS & EXCHANGES</h1>
      
      <div className="prose prose-sm max-w-none space-y-12 text-gray-600">
        <section>
          <h2 className="text-xl font-bold text-black mb-4">1. Return Eligibility</h2>
          <p>We want you to be completely satisfied with your purchase. You may return most new, unopened items within 30 days of delivery for a full refund.</p>
          <p className="mt-4 font-bold text-amber-600 italic">Note: Fabric cut to specific lengths cannot be returned unless there is a manufacturing defect.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-black mb-4">2. How to Initiate a Return</h2>
          <p>To start a return, please log in to your account, go to your order history, and select the item you wish to return. Alternatively, contact our support team at returns@premiura.com.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-black mb-4">3. Refunds</h2>
          <p>Once we receive and inspect your return, we will process your refund within 5-7 business days. The refund will be issued to the original payment method.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-black mb-4">4. Exchanges</h2>
          <p>If you need a different size or color for a clothing item, we recommend returning the original item for a refund and placing a new order for the desired item.</p>
        </section>
      </div>
    </div>
  );
};
