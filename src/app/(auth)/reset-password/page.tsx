"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, RefreshCw, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import LoadingScreen from "../../../components/ui/LoadingScreen";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is actually authenticated (recovery link automatically signs user in)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setErrorMessage("Нууц үг сэргээх холбоос хүчингүй эсвэл хугацаа нь дууссан байна. Та дахин хүсэлт илгээнэ үү.");
      }
      setCheckingSession(false);
    });
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (newPassword !== confirmPassword) {
      setErrorMessage("Шинэ нууц үгнүүд хоорондоо тохирохгүй байна.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("Нууц үг хамгийн багадаа 6 оронтой байх ёстой.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setSuccessMessage("Нууц үг амжилттай шинэчлэгдлээ! Та шинэ нууц үгээрээ нэвтэрнэ үү.");
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || "Нууц үг шинэчлэхэд алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-surface text-foreground flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-accent/10 blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[150px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10 space-y-6">
        {/* Branding header */}
        <div className="text-center space-y-2">
          <div className="inline-flex bg-white p-2 rounded-2xl border border-accent/20 shadow-[0_0_30px_rgba(0,102,255,0.12)] mb-1">
            <Image src="/logo.png" alt="MyVisa.mn Logo" width={48} height={48} className="object-contain" priority />
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            MyVisa<span className="text-accent">.mn</span>
          </h1>
          <p className="text-xs text-muted">ЭСЯ-ны нэгдсэн цахим виз мэдүүлгийн платформ</p>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-xs text-rose-400 flex gap-2.5 items-start">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-xs text-emerald-400 flex gap-2.5 items-start">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form Card */}
        <div className="premium-card p-6 md:p-8 bg-surface border border-line rounded-2xl shadow-2xl space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-sm font-bold text-foreground">Шинэ нууц үг тохируулах</h3>
            <p className="text-[10px] text-muted">Та одоо системд нэвтрэх шинэ нууц үгээ оруулна уу.</p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-muted font-mono uppercase tracking-wider block">Шинэ нууц үг</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field pl-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-muted font-mono uppercase tracking-wider block">Шинэ нууц үг давтах</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field pl-9"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || (!!errorMessage && !successMessage)}
              className="w-full py-2.5 bg-accent hover:bg-opacity-95 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow disabled:opacity-50 mt-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Шинэчилж байна...
                </>
              ) : (
                <>
                  Нууц үг шинэчлэх <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => router.push("/login")}
              className="w-full py-2 text-xs font-bold text-muted hover:text-foreground transition-all block text-center cursor-pointer"
            >
              Нэвтрэх хэсэг рүү очих
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
