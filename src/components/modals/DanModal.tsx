import React, { useState } from "react";
import { X, QrCode, RefreshCw, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEscapeKey } from "../../hooks/useEscapeKey";

interface DanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DanModal({ isOpen, onClose, onSuccess }: DanModalProps) {
  const [danAuthMethod, setDanAuthMethod] = useState<'qr' | 'otp'>('qr');
  const [danOtpSent, setDanOtpSent] = useState<boolean>(false);
  const [danOtpCode, setDanOtpCode] = useState<string>("");
  const [danVerifying, setDanVerifying] = useState<boolean>(false);

  useEscapeKey(isOpen, onClose);

  const startDanVerification = () => {
    setDanVerifying(true);
    setTimeout(() => {
      setDanVerifying(false);
      onSuccess();
      onClose();
      // Reset state for next time
      setDanOtpSent(false);
      setDanOtpCode("");
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
            aria-labelledby="dan-modal-title"
            onClick={(e) => e.stopPropagation()}
            className="bg-surface border border-line rounded-xl w-full max-w-sm p-6 overflow-hidden shadow-2xl relative"
          >
            <button 
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 text-muted hover:text-foreground p-1 rounded-lg"
              aria-label="Хаах"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center pb-4 border-b border-line space-y-2">
              <span className="inline-block bg-accent/15 text-accent border border-accent/30 text-[9.5px] font-mono px-3 py-1 rounded-full uppercase tracking-wider font-bold">
                DAN • Таних систем
              </span>
              <h4 id="dan-modal-title" className="text-sm font-bold text-foreground">Төрийн Цахим Нэвтрэлт</h4>
            </div>

            <div className="flex gap-2 p-1 bg-surface rounded-lg border border-line my-4">
              <button 
                onClick={() => setDanAuthMethod('qr')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded transition-all ${danAuthMethod === 'qr' ? 'bg-accent text-white' : 'text-muted hover:text-foreground'}`}
              >
                DAN QR Уншуулах
              </button>
              <button 
                onClick={() => setDanAuthMethod('otp')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded transition-all ${danAuthMethod === 'otp' ? 'bg-accent text-white' : 'text-muted hover:text-foreground'}`}
              >
                OTP код авах
              </button>
            </div>

            <div className="py-2 text-center">
              {danAuthMethod === 'qr' ? (
                <div className="space-y-4">
                  <div className="w-40 h-40 bg-white p-4 rounded-xl mx-auto flex items-center justify-center border border-zinc-700 relative">
                    <QrCode className="w-full h-full text-slate-900" />
                    <div className="absolute inset-0 bg-surface/80 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-xl">
                      <p className="text-[10px] text-white font-semibold">Уншуулах...</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted">
                    E-Mongolia апп-аар QR кодыг уншуулж нэвтрэлтийг баталгаажуулна уу.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 text-left">
                  {!danOtpSent ? (
                    <div className="space-y-3">
                      <label className="text-[10px] text-muted font-mono uppercase tracking-wider block">Гар утасны дугаар</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="99112233" 
                          className="flex-1 bg-surface border border-line rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                        />
                        <button 
                          onClick={() => setDanOtpSent(true)}
                          className="bg-accent hover:bg-opacity-95 text-white text-xs px-3 py-2 rounded-lg font-bold"
                        >
                          Код авах
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 animate-fade-in">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] text-muted font-mono uppercase tracking-wider block">Нэг удаагийн нууц код (OTP)</label>
                        <button 
                          onClick={() => setDanOtpSent(false)}
                          className="text-[10px] text-accent font-semibold hover:underline"
                        >
                          Дугаар солих
                        </button>
                      </div>
                      <input 
                        type="text" 
                        placeholder="6 оронтой код" 
                        maxLength={6}
                        value={danOtpCode}
                        onChange={(e) => setDanOtpCode(e.target.value)}
                        className="w-full bg-surface border border-line rounded-lg px-3 py-2 text-xs font-mono text-center text-white focus:outline-none tracking-widest text-base"
                      />
                      <p className="text-[10px] text-muted">Таны утсанд ирсэн 6 оронтой нууц кодыг оруулна уу.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-line flex gap-3 mt-4">
              <button 
                onClick={onClose}
                className="flex-1 py-2 rounded bg-elevated hover:bg-opacity-80 text-muted text-xs font-bold transition-all border border-line"
              >
                Буцах
              </button>
              <button 
                onClick={startDanVerification}
                disabled={danVerifying || (danAuthMethod === 'otp' && !danOtpSent)}
                className="flex-1 py-2 rounded bg-accent hover:bg-opacity-95 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow disabled:opacity-50"
              >
                {danVerifying ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Холбож байна...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" /> Баталгаажуулах
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
