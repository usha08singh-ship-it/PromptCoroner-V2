'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string | undefined;
}

export function PaymentModal({ isOpen, onClose, userEmail }: PaymentModalProps) {
  const [utr, setUtr] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utr.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ utr_number: utr, email: userEmail }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        alert('Failed to submit payment request. Please try again.');
      }
    } catch(err) {
      alert('Error submitting request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="glass-panel max-w-md w-full rounded-xl p-8 relative overflow-hidden bg-gradient-to-br from-surface-container-low/80 to-surface-container-lowest/40">
        {/* Glow behind modal */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-[80px] -z-10" />

        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-outline hover:text-on-surface transition-colors bg-surface-container hover:bg-surface-container-highest p-1 rounded-full border border-outline-variant/50"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        {success ? (
          <div className="text-center py-10 animate-fade-in-up relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary/10 border border-secondary/30 mb-6 shadow-[0_0_30px_rgba(173,198,255,0.2)]">
              <span className="material-symbols-outlined text-[40px] text-secondary">check_circle</span>
            </div>
            <h3 className="font-headline-lg text-headline-lg text-on-surface mb-3">PAYMENT_SUBMITTED</h3>
            <p className="font-body-sm text-on-surface-variant leading-relaxed max-w-xs mx-auto">
              Clearance upgrade will be processed within 2 hours post transaction verification.
            </p>
            <button 
              onClick={onClose}
              className="mt-8 w-full py-3 bg-surface-container border border-outline-variant hover:border-outline text-on-surface font-label-code text-label-code uppercase rounded-DEFAULT transition-all"
            >
              ACKNOWLEDGE
            </button>
          </div>
        ) : (
          <div className="animate-fade-in-up relative z-10">
            <div className="text-center mb-8">
              <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-2 uppercase">UPGRADE_CLEARANCE</h2>
              <span className="font-label-code text-[12px] font-bold text-primary bg-primary/10 px-3 py-1 rounded border border-primary/20 uppercase tracking-widest">
                ₹199/month — unlimited
              </span>
            </div>

            <div className="bg-[#ffffff] p-2 rounded-xl flex items-center justify-center mb-6 w-48 h-48 mx-auto shadow-[0_0_40px_rgba(208,188,255,0.15)] border-2 border-primary/30">
              <img 
                src="/upi-qr.png"
                alt="UPI QR Code" 
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            
            <div className="text-center font-label-code text-label-code text-primary-fixed mb-6 bg-[#000000]/80 py-3 rounded-DEFAULT border border-outline-variant/30 shadow-inner">
              6203759065@fam
            </div>

            <p className="font-body-sm text-on-surface-variant text-center mb-8 leading-relaxed px-4">
              Scan the QR or transfer <span className="text-on-surface font-bold">₹199</span> to the UPI ID above, then input the UTR below.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block font-label-code text-[10px] text-outline uppercase tracking-widest mb-2 px-1">
                  TRANSACTION_ID (UTR)
                </label>
                <input 
                  type="text"
                  required
                  value={utr}
                  onChange={e => setUtr(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  placeholder="e.g. 301234567890"
                  pattern="\d{12}"
                  title="UTR must be exactly 12 numeric digits"
                  className="w-full bg-[#000000] border border-outline-variant text-on-surface rounded-DEFAULT p-3 font-label-code text-label-code focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all shadow-inner placeholder:text-outline/50"
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-gradient-to-r from-primary-container to-inverse-primary hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-on-primary-container font-label-code text-label-code font-bold py-3 rounded-DEFAULT transition-all duration-300 tech-glow flex items-center justify-center gap-2 group border border-primary/30"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-on-primary-container/30 border-t-on-primary-container rounded-full animate-spin"></div>
                    VERIFYING...
                  </>
                ) : (
                  <>
                    PAYMENT_COMPLETE
                    <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
