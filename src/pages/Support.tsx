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
  { q: 'What is your return policy?', a: 'We offer 30-day returns on all unworn items with original tags. Equipment has a 14-day return window. Free return shipping on domestic orders.' },
  { q: 'How long does shipping take?', a: 'Standard shipping takes 5-7 business days. Express is 2-3 business days. Orders ship within 1-2 business days of placement.' },
  { q: 'Do you ship internationally?', a: 'Currently we ship to the US, Canada, and select EU countries. International orders may have additional duties and taxes.' },
  { q: 'How do I track my order?', a: 'Once shipped, you\'ll receive a tracking email. You can also enter your order number below to check status.' },
  { q: 'What warranty do your products have?', a: 'Equipment: 1-year limited warranty. Apparel: 90-day quality guarantee. Accessories: 90-day warranty against defects.' },
  { q: 'Can I change my order after placing it?', a: 'Orders can be modified within 1 hour of placement. After that, please contact support and we\'ll do our best to help.' },
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
    toast.info(`Order ${orderNum}: Currently being processed. Estimated delivery in 5-7 business days.`);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <h1 className="font-heading font-extrabold text-3xl md:text-4xl uppercase tracking-tight mb-12 text-center">
          Support
        </h1>

        <div className="max-w-3xl mx-auto space-y-16">
          {/* FAQ */}
          <section>
            <h2 className="font-heading font-extrabold text-2xl uppercase tracking-tight mb-6">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible>
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="font-heading font-bold text-sm uppercase tracking-wide text-left">
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
            <h2 className="font-heading font-extrabold text-2xl uppercase tracking-tight mb-6">
              Track Your Order
            </h2>
            <form onSubmit={handleTrack} className="flex gap-3">
              <input
                type="text" required placeholder="Enter order number (e.g., APX-XXXXX)"
                value={orderNum} onChange={e => setOrderNum(e.target.value)}
                className="flex-1 px-4 py-3 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button type="submit" className="px-6 py-3 bg-primary text-primary-foreground font-heading font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-secondary transition-all">
                Track
              </button>
            </form>
          </section>

          {/* Contact */}
          <section>
            <h2 className="font-heading font-extrabold text-2xl uppercase tracking-tight mb-6">
              Contact Us
            </h2>
            <form onSubmit={handleContact} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input required placeholder="Your name" value={contactForm.name}
                  onChange={e => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                  className="px-4 py-3 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent" />
                <input type="email" required placeholder="Your email" value={contactForm.email}
                  onChange={e => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                  className="px-4 py-3 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
              <textarea required rows={5} placeholder="How can we help?" value={contactForm.message}
                onChange={e => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                className="w-full px-4 py-3 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent resize-none" />
              <button type="submit" className="px-8 py-3.5 bg-primary text-primary-foreground font-heading font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-secondary transition-all">
                Send Message
              </button>
            </form>
          </section>
        </div>
      </div>
    </Layout>
  );
}
