"use client";
import React from 'react';
import SEO from "@/src/components/SEO";

export default function Shipping() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-24">
      <SEO 
        title="Shipping Policy"
        description="Learn about our shipping methods, costs, and delivery times for premium clothing and bulk fabric orders at Premiura."
        keywords="shipping policy, delivery times, Premiura shipping"
      />
      <h1 className="text-5xl font-bold tracking-tighter mb-12">SHIPPING POLICY</h1>
      
      <div className="prose prose-sm max-w-none space-y-12 text-gray-600">
        <section>
          <h2 className="text-xl font-bold text-black mb-4">1. Shipping Methods & Costs</h2>
          <p>We offer several shipping options to meet your needs. Shipping costs are calculated based on the weight of your order and the destination address.</p>
          <ul className="list-disc pl-5 mt-4 space-y-2">
            <li>Standard Shipping (5-7 business days): Free for orders over $200</li>
            <li>Express Shipping (2-3 business days): $25.00</li>
            <li>Next Day Delivery: $45.00 (Available in select locations)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-black mb-4">2. Bulk Fabric Shipping</h2>
          <p>Due to the weight and volume of bulk fabric orders, specialized freight shipping is used. Shipping costs for fabric orders are quoted separately after the 50% advance payment is received.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-black mb-4">3. International Shipping</h2>
          <p>Premiura ships worldwide. Please note that international orders may be subject to import duties and taxes, which are the responsibility of the recipient.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-black mb-4">4. Tracking Your Order</h2>
          <p>Once your order has shipped, you will receive an email with a tracking number and a link to track your package in real-time.</p>
        </section>
      </div>
    </div>
  );
};
