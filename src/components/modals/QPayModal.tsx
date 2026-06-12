import React, { useState } from "react";
import { X, QrCode, Clock, RefreshCw, Check, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEscapeKey } from "../../hooks/useEscapeKey";

interface QPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string;
  amount: number;
  countdown: number;
  onPaymentSuccess: () => void;
}

export default function QPayModal({ isOpen, onClose, invoiceId, amount, countdown, onPaymentSuccess }: QPayModalProps) {
  const [qpayPolling, setQpayPolling] = useState<boolean>(false);
  useEscapeKey(isOpen, onClose);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const simulatePaymentSuccess = () => {
    setQpayPolling(true);
    setTimeout(() => {
      setQpayPolling(false);
      onPaymentSuccess();
      onClose();
    }, 1200);
  };

  const isBulk = invoiceId === 'bulk_invoice';

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 modal-overlay"
          role="presentation"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="qpay-modal-title"
            onClick={(e) => e.stopPropagation()}
            className="bg-elevated border border-line rounded-t-3xl sm:rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative"
          >
            <div className="sm:hidden flex justify-center pt-3 pb-1" aria-hidden>
              <div className="w-10 h-1 rounded-full bg-line" />
            </div>

            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 text-muted hover:text-foreground p-2 rounded-xl hover:bg-overlay/60 transition-colors"
              aria-label="Хаах"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="px-6 pt-6 pb-4 border-b border-line space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-[10px] font-bold text-accent uppercase tracking-wider">
                <Shield className="w-3 h-3" />
                QPay аюулгүй төлбөр
              </div>
              <h4 id="qpay-modal-title" className="text-lg font-bold text-foreground pr-8">
                {isBulk ? 'Нэгдсэн нэхэмжлэх' : 'Төлбөрийн нэхэмжлэх'}
              </h4>
              <p className="text-xs text-muted font-mono">
                {isBulk ? 'Олон мэдүүлгийн нэгдсэн төлбөр' : `Invoice: ${invoiceId}`}
              </p>
            </div>

            <div className="px-6 py-6 flex flex-col items-center space-y-5">
              <div className="w-44 h-44 bg-white p-4 rounded-2xl flex items-center justify-center border-2 border-line relative shadow-inner">
                <QrCode className="w-full h-full text-slate-900" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-red-600 flex items-center justify-center font-extrabold text-xs text-white shadow-md">
                  q
                </div>
              </div>

              <div className="text-center space-y-1 w-full">
                <p className="text-2xl font-bold text-foreground font-mono tracking-tight">
                  {amount.toLocaleString()} ₮
                </p>
                <p className="text-sm text-amber-500 font-semibold flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4" />
                  {formatTime(countdown)} үлдсэн
                </p>
              </div>
            </div>

            <div className="px-6 pb-2">
              <p className="text-[11px] text-muted uppercase tracking-wider font-semibold mb-3">
                Банкны апп-аар төлөх
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {[
                  { name: "Хаан", bg: "bg-emerald-700" },
                  { name: "ТӨХБ", bg: "bg-blue-700" },
                  { name: "ХХБ", bg: "bg-blue-900" },
                  { name: "Хас", bg: "bg-red-800" },
                  { name: "Голомт", bg: "bg-sky-700" }
                ].map((bank) => (
                  <button
                    key={bank.name}
                    type="button"
                    onClick={simulatePaymentSuccess}
                    className={`py-2.5 rounded-xl text-[11px] font-bold text-center text-white ${bank.bg} hover:opacity-90 active:scale-[0.98] transition-all`}
                  >
                    {bank.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-6 py-5 border-t border-line flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1 text-sm"
              >
                Буцах
              </button>
              <button
                type="button"
                onClick={simulatePaymentSuccess}
                disabled={qpayPolling}
                className="flex-1 btn-primary text-sm !bg-positive !shadow-none disabled:opacity-50"
                style={{ background: 'var(--color-success)' }}
              >
                {qpayPolling ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Шалгаж байна...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Төлөлт шалгах
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
