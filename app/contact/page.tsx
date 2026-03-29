"use client";
import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { motion } from 'motion/react';
import SEO from "@/src/components/SEO";

export default function Contact() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-24">
      <SEO 
        title="Contact Us"
        description="Get in touch with Premiura for any questions about our premium clothing collections or bulk fabric orders. We're here to help."
        keywords="contact Premiura, customer support, fabric inquiries, fashion help"
      />
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold tracking-tighter mb-4">GET IN TOUCH</h1>
        <p className="text-gray-500 max-w-lg mx-auto">
          Have questions about our premium collections or bulk fabric orders? We're here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-12"
        >
          <div className="space-y-8">
            <div className="flex items-start space-x-6">
              <div className="bg-black text-white p-4 rounded-2xl">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Email Us</h3>
                <p className="text-gray-500">support@premiura.com</p>
                <p className="text-gray-500">sales@premiura.com</p>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="bg-black text-white p-4 rounded-2xl">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Call Us</h3>
                <p className="text-gray-500">+1 (555) 123-4567</p>
                <p className="text-gray-500">Mon-Fri, 9am - 6pm EST</p>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="bg-black text-white p-4 rounded-2xl">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Visit Us</h3>
                <p className="text-gray-500">123 Fashion Avenue, Suite 500</p>
                <p className="text-gray-500">New York, NY 10001</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-50 p-10 rounded-3xl border border-black/5"
        >
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Full Name</label>
                <input type="text" className="w-full bg-white border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black/5" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Email Address</label>
                <input type="email" className="w-full bg-white border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black/5" placeholder="john@example.com" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Subject</label>
              <input type="text" className="w-full bg-white border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black/5" placeholder="Bulk Order Inquiry" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Message</label>
              <textarea rows={5} className="w-full bg-white border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black/5" placeholder="How can we help you?"></textarea>
            </div>
            <button className="w-full bg-black text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-3 hover:bg-black/90 transition-all">
              <Send className="w-4 h-4" />
              <span>Send Message</span>
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};
