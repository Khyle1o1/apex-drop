import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { toast } from 'sonner';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  { q: 'What is your return policy?', a: 'We offer 7-day returns on unworn items with original tags. Contact us at store@campus.edu.ph to initiate a return.' },
  { q: 'How long does shipping take?', a: 'Standard shipping takes 3–5 business days. Express shipping (1–2 days) is available at checkout for ₱250.' },
  { q: 'Do you offer student discounts?', a: 'Yes! Show your valid student ID at our physical store for a 10% discount, or use code STUDENT10 at checkout.' },
  { q: 'How do I track my order?', a: 'Once shipped, you\'ll receive a tracking email. You can also enter your order number below to check status.' },
  { q: 'Can I pick up my order on campus?', a: 'Yes! Select "Campus Pickup" at checkout and collect your order at Building 5, Ground Floor during store hours.' },
  { q: 'Can I change my order after placing it?', a: 'Orders can be modified within 1 hour of placement. After that, please contact us and we\'ll do our best to help.' },
];

export default function Support() {
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [orderNum, setOrderNum] = useState('');

  const handleContact = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Message sent! We\'ll get back to you within 24 hours.');
    setContactForm({ name: '', email: '', message: '' });
  };

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info(`Order ${orderNum}: Currently being processed. Estimated delivery in 3–5 business days.`);
  };

  const inputClass = "px-4 py-3 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent min-h-[44px]";

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-10">
        <h1 className="font-heading font-extrabold text-2xl md:text-3xl tracking-tight mb-10 text-center">
          Help & Support
        </h1>

        <div className="max-w-3xl mx-auto space-y-14">
          {/* FAQ */}
          <section>
            <h2 className="font-heading font-extrabold text-xl md:text-2xl tracking-tight mb-6">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible>
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="font-heading font-bold text-sm text-left">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* Order Tracking */}
          <section>
            <h2 className="font-heading font-extrabold text-xl md:text-2xl tracking-tight mb-6">
              Track Your Order
            </h2>
            <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text" required placeholder="Enter order number (e.g., CS-XXXXX)"
                value={orderNum} onChange={e => setOrderNum(e.target.value)}
                className={`flex-1 ${inputClass}`}
              />
              <button type="submit" className="px-6 py-3 bg-primary text-primary-foreground font-heading font-bold text-sm tracking-wider rounded-lg hover:bg-secondary transition-all min-h-[44px]">
                Track
              </button>
            </form>
          </section>

          {/* Contact */}
          <section>
            <h2 className="font-heading font-extrabold text-xl md:text-2xl tracking-tight mb-6">
              Contact Us
            </h2>
            <form onSubmit={handleContact} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input required placeholder="Your name" value={contactForm.name}
                  onChange={e => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                  className={inputClass} />
                <input type="email" required placeholder="Your email" value={contactForm.email}
                  onChange={e => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                  className={inputClass} />
              </div>
              <textarea required rows={5} placeholder="How can we help?" value={contactForm.message}
                onChange={e => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                className={`w-full ${inputClass} resize-none`} />
              <button type="submit" className="px-8 py-3.5 bg-primary text-primary-foreground font-heading font-bold text-sm tracking-wider rounded-lg hover:bg-secondary transition-all min-h-[44px]">
                Send Message
              </button>
            </form>
          </section>
        </div>
      </div>
    </Layout>
  );
}
