import React, { useState } from "react";
import { X, QrCode, Clock, RefreshCw, Check } from "lucide-react";
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
          role="presentation"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="qpay-modal-title"
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0e0f15] border border-[#1e2030] rounded-xl w-full max-w-sm p-6 overflow-hidden shadow-2xl relative"
          >
            <button 
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 text-[#8f95b2] hover:text-white p-1 rounded-lg"
              aria-label="Хаах"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center pb-4 border-b border-[#1e2030] space-y-1">
              <span className="text-[10px] font-bold text-red-500 font-mono tracking-widest uppercase">qpay • төлбөр</span>
              <h4 id="qpay-modal-title" className="text-sm font-bold text-white">
                {invoiceId === 'bulk_invoice' ? 'Байгууллагын нэгдсэн нэхэмжлэх' : 'Төлбөрийн нэхэмжлэх'}
              </h4>
            </div>

            <div className="py-6 flex flex-col items-center justify-center space-y-4">
              <div className="w-36 h-36 bg-white p-3 rounded-lg mx-auto flex items-center justify-center border border-zinc-700 relative">
                <QrCode className="w-full h-full text-slate-900" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-red-600 flex items-center justify-center font-extrabold text-[11px] text-white">
                  q
                </div>
              </div>

              <div className="text-center space-y-1">
                <p className="text-base font-mono font-bold text-white">
                  {amount.toLocaleString()} ₮
                </p>
                <p className="text-[10px] text-[#8f95b2] font-mono font-semibold">Invoice: {invoiceId}</p>
                <p className="text-[10.5px] text-amber-500 font-mono flex items-center justify-center gap-1.5 mt-1 font-bold">
                  <Clock className="w-3.5 h-3.5" /> {formatTime(countdown)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[9px] text-[#8f95b2] uppercase font-mono tracking-wider">Банкны апп-аар төлөх (холбоос):</span>
              <div className="grid grid-cols-5 gap-1.5 pb-4">
                {[
                  { name: "Хаан", bg: "bg-green-800/80 text-white border-green-700" },
                  { name: "ТӨХБ", bg: "bg-blue-800/80 text-white border-blue-700" },
                  { name: "ХХБ", bg: "bg-blue-950/80 text-white border-blue-900" },
                  { name: "Хас", bg: "bg-red-950/80 text-white border-red-900" },
                  { name: "Голомт", bg: "bg-sky-950/80 text-white border-sky-900" }
                ].map((bank) => (
                  <button 
                    key={bank.name} 
                    onClick={simulatePaymentSuccess}
                    className={`py-1 rounded text-[10px] font-bold text-center ${bank.bg} hover:opacity-90 active:scale-95 transition-all truncate border`}
                  >
                    {bank.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#1e2030] flex gap-3">
              <button 
                onClick={onClose}
                className="flex-1 py-2 rounded bg-[#12131a] hover:bg-opacity-80 text-[#8f95b2] text-xs font-bold transition-all border border-[#1e2030]"
              >
                Буцах
              </button>
              <button 
                onClick={simulatePaymentSuccess}
                disabled={qpayPolling}
                className="flex-1 py-2 rounded bg-[#10b981] hover:bg-opacity-95 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow disabled:opacity-50"
              >
                {qpayPolling ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Шалгаж байна...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" /> Төлөлт шалгах
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
