"use client";
import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SEO from "@/src/components/SEO";

const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="border-b border-black/5">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex justify-between items-center text-left hover:text-gray-600 transition-colors"
      >
        <span className="font-bold text-lg tracking-tight">{question}</span>
        {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-gray-500 text-sm leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function FAQ() {
  const faqs = [
    {
      question: "How do I order bulk fabric?",
      answer: "Select the fabric you like, enter the required meters (minimum 50m), and add to cart. You will be required to pay a 50% advance via Stripe to confirm the order. Our team will contact you for the remaining balance and shipping details."
    },
    {
      question: "What is GSM in fabric details?",
      answer: "GSM stands for Grams per Square Meter. It measures the weight and thickness of the fabric. Higher GSM indicates a heavier, thicker fabric, while lower GSM indicates a lighter, thinner fabric."
    },
    {
      question: "Can I get a sample of the fabric before ordering bulk?",
      answer: "Yes, we offer sample swatches for most of our fabric collections. Please contact our sales team to request a sample pack."
    },
    {
      question: "How long does shipping take for clothing?",
      answer: "Standard shipping typically takes 5-7 business days. Express options are available at checkout for faster delivery."
    },
    {
      question: "Is there a return policy for fabric?",
      answer: "Because fabric is cut to your specific length requirements, we cannot accept returns unless the fabric is defective or damaged upon arrival."
    }
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-24">
      <SEO 
        title="Frequently Asked Questions"
        description="Find answers to common questions about Premiura's premium clothing, fabric sourcing, shipping, and returns."
        keywords="FAQ, common questions, Premiura help"
      />
      <h1 className="text-5xl font-bold tracking-tighter mb-12">FREQUENTLY ASKED QUESTIONS</h1>
      <div className="space-y-2">
        {faqs.map((faq, idx) => (
          <FAQItem key={idx} {...faq} />
        ))}
      </div>
    </div>
  );
};
