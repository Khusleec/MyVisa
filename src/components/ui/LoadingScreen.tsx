"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const TIPS = [
  { mn: "Таны мэдээллийг шалгаж байна...", en: "Verifying your information" },
  { mn: "Визийн мэдүүлгийг бэлтгэж байна...", en: "Preparing your visa application" },
  { mn: "Системтэй холбогдож байна...", en: "Connecting to the system" },
  { mn: "Таны бичиг баримтыг уншиж байна...", en: "Reading your documents" },
  { mn: "Аюулгүй холболт тогтоож байна...", en: "Establishing secure connection" },
  { mn: "Таны дансыг татаж байна...", en: "Loading your account" },
  { mn: "Бүх зүйл бэлэн болж байна...", en: "Getting everything ready" },
  { mn: "Таны өгөгдлийг хамгаалж байна...", en: "Protecting your data" },
];

export default function LoadingScreen({ message }: { message?: string }) {
  const [tipIndex, setTipIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(12);
  const [dotCount, setDotCount] = useState(1);

  // Cycle tips with fade transition
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setTipIndex((i) => (i + 1) % TIPS.length);
        setVisible(true);
      }, 350);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // Animated progress bar — slowly creeps toward 90%
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 88) return p;
        const step = Math.max(0.4, (88 - p) * 0.06);
        return Math.min(88, p + step);
      });
    }, 120);
    return () => clearInterval(interval);
  }, []);

  // Animated ellipsis dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount((d) => (d % 3) + 1);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const currentTip = TIPS[tipIndex];
  const displayMessage = message ?? currentTip.mn;
  const displaySub = message ? "Түр хүлээнэ үү" : currentTip.en;
  const dots = ".".repeat(dotCount);

  return (
    <div className="min-h-screen bg-surface text-foreground flex flex-col items-center justify-center gap-0 p-6 select-none">

      {/* Glow backdrop */}
      <div
        className="absolute w-72 h-72 rounded-full opacity-10 pointer-events-none"
        style={{
          background: "radial-gradient(circle, var(--color-cta) 0%, transparent 70%)",
          filter: "blur(48px)",
        }}
        aria-hidden
      />

      {/* Logo */}
      <div className="relative mb-8">
        <div
          className="absolute inset-0 rounded-2xl animate-pulse"
          style={{
            background: "var(--color-cta)",
            opacity: 0.12,
            transform: "scale(1.8)",
            filter: "blur(18px)",
          }}
          aria-hidden
        />
        <div className="relative w-20 h-20 rounded-2xl bg-white shadow-xl flex items-center justify-center border border-line/40">
          <Image src="/logo.png" alt="MyVisa.mn" width={52} height={52} className="object-contain" priority />
        </div>

        {/* Orbiting ring */}
        <div
          className="absolute inset-0 rounded-2xl border-2 border-dashed animate-spin"
          style={{
            borderColor: "var(--color-cta)",
            opacity: 0.25,
            animationDuration: "6s",
            transform: "scale(1.35)",
          }}
          aria-hidden
        />
      </div>

      {/* Branding */}
      <h1 className="text-base font-black text-foreground tracking-tight mb-0.5">
        MyVisa<span style={{ color: "var(--color-cta)" }}>.mn</span>
      </h1>
      <p className="text-[9px] font-mono text-muted uppercase tracking-[0.2em] mb-8">
        Visa Application System
      </p>

      {/* Dynamic message */}
      <div className="flex flex-col items-center gap-1.5 mb-7 min-h-[48px] justify-center">
        <p
          className="text-sm font-semibold text-foreground text-center transition-all duration-300 ease-in-out"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(6px)" }}
        >
          {displayMessage}{dots}
        </p>
        <p
          className="text-[10px] text-muted text-center transition-all duration-300 ease-in-out"
          style={{ opacity: visible ? 0.7 : 0, transform: visible ? "translateY(0)" : "translateY(4px)" }}
        >
          {displaySub}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-56 h-1 rounded-full overflow-hidden mb-4" style={{ background: "var(--color-border)" }}>
        <div
          className="h-full rounded-full transition-all duration-200 ease-out"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(90deg, var(--color-cta) 0%, #60a5fa 100%)",
          }}
        />
      </div>

      {/* Staggered dots */}
      <div className="flex items-center gap-1.5" aria-hidden>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: "var(--color-cta)",
              animation: `loadingBounce 1.2s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
              opacity: 0.8,
            }}
          />
        ))}
      </div>

      {/* Keyframe for dots */}
      <style>{`
        @keyframes loadingBounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
