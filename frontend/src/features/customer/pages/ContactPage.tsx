import React, { useState } from 'react';
import SEO from '../../../shared/components/SEO';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { Textarea } from '../../../shared/components/ui/Textarea';
import { useToast } from '../../../shared/components/ui/Toast';
import { Mail, Phone, MapPin, Send, HelpCircle } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success(
        'Your message has been received! Our support dispatch will respond within 4 hours.',
      );
      setName('');
      setEmail('');
      setMessage('');
    }, 800);
  };

  return (
    <>
      <SEO
        title="Contact Customer Operations"
        description="Get in touch with Oven Xpress headquarters, log support claims, or clear outpost ordering inquiries."
        keywords="Contact Oven Xpress, customer service hotline, restaurant feedback, partner support"
      />

      <div className="max-w-5xl mx-auto px-6 py-12 md:py-16 space-y-12">
        {/* Page Head */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight text-white">
            Contact Dispatch
          </h1>
          <p className="text-muted-foreground text-sm font-sans max-w-md mx-auto">
            Encountering trouble at a dispatch outpost or have a custom catering inquiry? Drop our
            desk a line.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start border-t border-border/40 pt-12">
          {/* Support Channels Info */}
          <div className="md:col-span-5 space-y-6">
            <h2 className="text-lg font-display font-bold text-white tracking-wide">
              Support Channels
            </h2>

            <div className="space-y-4">
              <div className="flex gap-4 p-4 rounded-xl bg-card/45 border border-border/50">
                <Phone className="text-primary flex-shrink-0" size={18} />
                <div className="space-y-1 font-sans text-xs">
                  <h3 className="font-bold text-white">Operational Support</h3>
                  <p className="text-muted-foreground">+1 (800) 555-OVEN</p>
                  <p className="text-[10px] text-muted-foreground/60">
                    Mon-Sun: 8:00 AM - 11:00 PM EST
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-xl bg-card/45 border border-border/50">
                <Mail className="text-primary flex-shrink-0" size={18} />
                <div className="space-y-1 font-sans text-xs">
                  <h3 className="font-bold text-white">Digital Dispatch Desk</h3>
                  <p className="text-muted-foreground">support@ovenxpress.com</p>
                  <p className="text-[10px] text-muted-foreground/60">
                    Corporate/API requests: ops@ovenxpress.com
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-xl bg-card/45 border border-border/50">
                <MapPin className="text-primary flex-shrink-0" size={18} />
                <div className="space-y-1 font-sans text-xs">
                  <h3 className="font-bold text-white">Headquarters</h3>
                  <p className="text-muted-foreground">500 Fashion Ave, Fl 14</p>
                  <p className="text-[10px] text-muted-foreground/60">New York, NY 10018</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Message Form */}
          <div className="md:col-span-7 bg-card/60 border border-border/60 rounded-2xl p-6 md:p-8 space-y-6">
            <h2 className="text-lg font-display font-bold text-white tracking-wide flex items-center gap-2">
              <HelpCircle size={18} className="text-primary" />
              <span>Log Support Ticket</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  type="text"
                  label="Name"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-secondary/85 text-xs text-white"
                  required
                />
                <Input
                  type="email"
                  label="Email"
                  placeholder="e.g. john@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-secondary/85 text-xs text-white"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-wider font-semibold font-display text-foreground/80">
                  Detailed Query
                </label>
                <Textarea
                  placeholder="Describe your issue, order ID, or general proposal..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-secondary/85 text-xs text-white min-h-[120px] focus:border-primary"
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                className="w-full flex items-center justify-center gap-2 h-11 text-xs shadow-md"
              >
                <span>Dispatch Ticket</span>
                <Send size={14} />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;
