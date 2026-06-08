"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Zap,
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  Send,
  Sparkles,
  RefreshCw,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Check,
  Search,
  ArrowRight,
  ShieldCheck,
  Percent,
  Sliders,
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
  Activity,
  Award
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Custom Google Font Injections and Animation overrides via Inline CSS
const CustomPremiumStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
    
    .premium-font-heading {
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .premium-font-stats {
      font-family: 'Space Grotesk', sans-serif;
    }
    .premium-font-mono {
      font-family: 'JetBrains Mono', monospace;
    }

    /* Drift Ambient Blobs */
    @keyframes blob-drift-slow {
      0% { transform: translate(0px, 0px) scale(1); }
      50% { transform: translate(40px, -60px) scale(1.15); }
      100% { transform: translate(0px, 0px) scale(1); }
    }
    @keyframes blob-drift-fast {
      0% { transform: translate(0px, 0px) scale(1); }
      50% { transform: translate(-60px, 40px) scale(0.9); }
      100% { transform: translate(0px, 0px) scale(1); }
    }
    .animate-blob-drift-1 {
      animation: blob-drift-slow 25s infinite alternate ease-in-out;
    }
    .animate-blob-drift-2 {
      animation: blob-drift-fast 20s infinite alternate ease-in-out;
    }

    /* Glow utilities */
    .glow-cyan {
      box-shadow: 0 0 20px rgba(6, 182, 212, 0.15);
    }
    .glow-violet {
      box-shadow: 0 0 20px rgba(139, 92, 246, 0.15);
    }
    
    /* Custom Scrollbar */
    .premium-scrollbar::-webkit-scrollbar {
      width: 4px;
      height: 4px;
    }
    .premium-scrollbar::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.02);
      border-radius: 99px;
    }
    .premium-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 99px;
    }
    .premium-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(6, 182, 212, 0.3);
    }
  `}} />
);

// Types
interface Asset {
  symbol: string;
  name: string;
  amount: number;
  currentPrice: number;
  change24h: number;
  color: string;
}

interface Transaction {
  id: string;
  type: "send" | "receive" | "trade";
  amount: string;
  asset: string;
  date: string;
  status: "success" | "pending";
}

interface CardDetails {
  id: string;
  name: string;
  number: string;
  expiry: string;
  cvv: string;
  isFrozen: boolean;
  color: string;
  accent: string;
}

// Sparkline component with beautiful neon SVG paths
function NeonSparkline({ data, color }: { data: number[]; color: string }) {
  const width = 100;
  const height = 35;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;
  
  const points = data
    .map((val, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <filter id={`sparkline-glow-${color.replace("#", "")}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#sparkline-glow-${color.replace("#", "")})`}
        points={points}
      />
    </svg>
  );
}

export default function PremiumTradePro() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeView, setActiveView] = useState<"overview" | "markets" | "cards" | "copilot">("overview");
  
  // Sandbox Account Balance
  const [cashBalance, setCashBalance] = useState(54820.50);

  // Asset holdings with colors
  const [assets, setAssets] = useState<Asset[]>([
    { symbol: "BTC", name: "Bitcoin", amount: 1.45, currentPrice: 62450, change24h: 3.42, color: "#06b6d4" }, // Cyan
    { symbol: "ETH", name: "Ethereum", amount: 9.8, currentPrice: 3420, change24h: 5.12, color: "#8b5cf6" },  // Purple
    { symbol: "NVDA", name: "Nvidia", amount: 22, currentPrice: 895.4, change24h: 8.94, color: "#10b981" },  // Emerald
    { symbol: "AAPL", name: "Apple", amount: 35, currentPrice: 182.3, change24h: -0.65, color: "#f43f5e" }   // Rose
  ]);

  // Digital card details
  const [cards, setCards] = useState<CardDetails[]>([
    { id: "c1", name: "TradePro Obsidian Infinite", number: "4532 9845 1204 8839", expiry: "12/30", cvv: "842", isFrozen: false, color: "from-[#111827] via-[#0F172A] to-[#020617]", accent: "#06b6d4" },
    { id: "c2", name: "TradePro Emerald Club", number: "5102 7741 9934 0012", expiry: "08/29", cvv: "305", isFrozen: true, color: "from-[#022c22] via-[#020617] to-[#042f2e]", accent: "#10b981" }
  ]);
  const [activeCardIdx, setActiveCardIdx] = useState(0);
  const [revealCard, setRevealCard] = useState(false);

  // Card Mouse Move 3D Tilt Coordinates
  const [cardRotateX, setCardRotateX] = useState(0);
  const [cardRotateY, setCardRotateY] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current.getBoundingClientRect();
    const x = e.clientX - card.left - card.width / 2;
    const y = e.clientY - card.top - card.height / 2;
    // Limit rotations to max 12 degrees for premium feel
    setCardRotateX(-y / 9);
    setCardRotateY(x / 9);
  };

  const handleCardMouseLeave = () => {
    setCardRotateX(0);
    setCardRotateY(0);
  };

  // Transfer simulation
  const [transferAmount, setTransferAmount] = useState("");
  const [transferTarget, setTransferTarget] = useState("");
  const [sliderVal, setSliderVal] = useState(0); 
  const [isTransferring, setIsTransferring] = useState(false);

  // Active asset for trading simulation
  const [tradeAsset, setTradeAsset] = useState("BTC");
  const [tradeAmount, setTradeAmount] = useState("");
  const [tradeAction, setTradeAction] = useState<"buy" | "sell">("buy");

  // Notifications
  const [toasts, setToasts] = useState<{ id: string; msg: string; type: "success" | "error" | "info" }[]>([]);
  const triggerToast = (msg: string, type: "success" | "error" | "info" = "success") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Transaction Ledger
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: "t1", type: "receive", amount: "+$2,500.00", asset: "USD", date: "Today, 10:24 AM", status: "success" },
    { id: "t2", type: "trade", amount: "-0.05 BTC", asset: "BTC", date: "Yesterday, 4:12 PM", status: "success" },
    { id: "t3", type: "send", amount: "-$120.00", asset: "USD", date: "May 29, 2:15 PM", status: "success" }
  ]);

  // AI assistant states
  const [chatOpen, setChatOpen] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [chatLog, setChatLog] = useState<{ sender: "user" | "ai"; text: string }[]>([
    { sender: "ai", text: "Welcome to your premium command deck, Khuslen. I stand ready to execute commands or analyze your portfolio holdings." }
  ]);

  // Calculations
  const assetsValue = useMemo(() => {
    return assets.reduce((sum, a) => sum + a.amount * a.currentPrice, 0);
  }, [assets]);

  const totalPortfolioValue = useMemo(() => {
    return cashBalance + assetsValue;
  }, [cashBalance, assetsValue]);

  // Data segments for Radial Dial
  const radialSegments = useMemo(() => {
    const total = totalPortfolioValue;
    if (total === 0) return [];
    
    let cumulativePercent = 0;
    
    // Add Cash segment
    const cashPercent = (cashBalance / total) * 100;
    const cashSeg = {
      label: "Liquid Cash",
      value: cashBalance,
      percent: cashPercent,
      color: "#64748b", // Slate
      startPercent: 0
    };
    cumulativePercent += cashPercent;

    // Add asset segments
    const assetSegs = assets.map((a) => {
      const val = a.amount * a.currentPrice;
      const pct = (val / total) * 100;
      const seg = {
        label: a.symbol,
        value: val,
        percent: pct,
        color: a.color,
        startPercent: cumulativePercent
      };
      cumulativePercent += pct;
      return seg;
    });

    return [cashSeg, ...assetSegs];
  }, [cashBalance, assets, totalPortfolioValue]);

  // Segment hover state
  const [focusedSegment, setFocusedSegment] = useState<{ label: string; value: number } | null>(null);

  const handleExecuteTransfer = useCallback(() => {
    const amt = parseFloat(transferAmount);
    if (!transferTarget.trim()) {
      triggerToast("Recipient address or email is required.", "error");
      setSliderVal(0);
      return;
    }
    if (isNaN(amt) || amt <= 0) {
      triggerToast("Please enter a valid amount.", "error");
      setSliderVal(0);
      return;
    }
    if (amt > cashBalance) {
      triggerToast("Insufficient cash balance.", "error");
      setSliderVal(0);
      return;
    }

    setIsTransferring(true);
    setTimeout(() => {
      setCashBalance((prev) => prev - amt);
      setTransactions((prev) => [
        {
          id: `t${Date.now()}`,
          type: "send",
          amount: `-$${amt.toLocaleString()}`,
          asset: "USD",
          date: "Just now",
          status: "success"
        },
        ...prev
      ]);
      triggerToast(`Successfully wired $${amt.toLocaleString()} to ${transferTarget}!`, "success");
      setTransferAmount("");
      setTransferTarget("");
      setSliderVal(0);
      setIsTransferring(false);
    }, 1500);
  }, [transferAmount, transferTarget, cashBalance, triggerToast]);

  // Swipe-to-confirm trigger
  useEffect(() => {
    if (sliderVal >= 92) {
      const handler = setTimeout(() => {
        setSliderVal(100);
        handleExecuteTransfer();
      }, 0);
      return () => clearTimeout(handler);
    }
  }, [sliderVal, handleExecuteTransfer]);

  // Buy/Sell executor
  const handleExecuteTrade = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(tradeAmount);
    if (isNaN(qty) || qty <= 0) {
      triggerToast("Please specify a valid quantity.", "error");
      return;
    }

    const target = assets.find((a) => a.symbol === tradeAsset);
    if (!target) return;

    const totalCost = qty * target.currentPrice;

    if (tradeAction === "buy") {
      if (totalCost > cashBalance) {
        triggerToast("Insufficient cash balance for trade.", "error");
        return;
      }
      setCashBalance((prev) => prev - totalCost);
      setAssets((prev) =>
        prev.map((a) => (a.symbol === tradeAsset ? { ...a, amount: a.amount + qty } : a))
      );
      setTransactions((prev) => [
        { id: `t${Date.now()}`, type: "trade", amount: `+${qty} ${tradeAsset}`, asset: tradeAsset, date: "Just now", status: "success" },
        ...prev
      ]);
      triggerToast(`Purchased ${qty} ${tradeAsset} for $${totalCost.toLocaleString()}`, "success");
    } else {
      if (target.amount < qty) {
        triggerToast(`Insufficient ${tradeAsset} balance to sell.`, "error");
        return;
      }
      setCashBalance((prev) => prev + totalCost);
      setAssets((prev) =>
        prev.map((a) => (a.symbol === tradeAsset ? { ...a, amount: a.amount - qty } : a))
      );
      setTransactions((prev) => [
        { id: `t${Date.now()}`, type: "trade", amount: `-${qty} ${tradeAsset}`, asset: tradeAsset, date: "Just now", status: "success" },
        ...prev
      ]);
      triggerToast(`Sold ${qty} ${tradeAsset} for $${totalCost.toLocaleString()}`, "success");
    }
    setTradeAmount("");
  };

  // Card Freeze
  const handleFreezeCard = (id: string) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          triggerToast(c.isFrozen ? "Card Unlocked" : "Card Frozen", "info");
          return { ...c, isFrozen: !c.isFrozen };
        }
        return c;
      })
    );
  };

  // AI Dialog submission
  const handleAiSend = (suggestedText?: string) => {
    const text = suggestedText || aiInput;
    if (!text.trim()) return;

    if (!suggestedText) setAiInput("");

    setChatLog((prev) => [...prev, { sender: "user", text }]);
    setTimeout(() => {
      let reply = "Processing command... I stand ready to assist. Type 'breakdown' or 'market signal'.";
      if (text.toLowerCase().includes("breakdown")) {
        reply = `Your portfolio breakdown: Liquid cash holds ${(cashBalance/totalPortfolioValue*100).toFixed(1)}%. Digital assets hold ${(assetsValue/totalPortfolioValue*100).toFixed(1)}%.`;
      } else if (text.toLowerCase().includes("signal")) {
        reply = "Analysis: BTC is consolidating with structural support at $61,200. EMA-50 shows strong buy pressure on higher timeframes.";
      }
      setChatLog((prev) => [...prev, { sender: "ai", text: reply }]);
    }, 1000);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "light") {
      root.classList.add("light-theme");
    } else {
      root.classList.remove("light-theme");
    }
  }, [theme]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#07090E] text-[#E2E8F0] overflow-y-auto p-4 md:p-8 transition-colors duration-500 relative select-none">
      
      {/* Load Custom Stylesheets */}
      <CustomPremiumStyles />

      {/* Ambient Moving Blur Blobs */}
      <div className="absolute top-1/6 left-1/4 w-[450px] h-[450px] rounded-full bg-cyan-500/10 blur-[130px] animate-blob-drift-1 pointer-events-none" />
      <div className="absolute bottom-1/6 right-1/4 w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[150px] animate-blob-drift-2 pointer-events-none" />

      {/* Floating Dynamic Toasts */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, scale: 0.95, y: -15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`px-4 py-3 rounded-2xl border text-xs font-semibold shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center gap-3 backdrop-blur-3xl premium-font-heading ${
                t.type === "success"
                  ? "bg-emerald-950/80 border-emerald-500/30 text-emerald-300"
                  : t.type === "error"
                  ? "bg-rose-950/80 border-rose-500/30 text-rose-300"
                  : "bg-slate-900/90 border-slate-700/40 text-slate-200"
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${t.type === "success" ? "bg-emerald-400 animate-ping" : t.type === "error" ? "bg-rose-400 animate-ping" : "bg-cyan-400 animate-ping"}`} />
              <span>{t.msg}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Centered Floating Deck Workspace Frame */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-4xl bg-[#0D111A]/80 backdrop-blur-3xl border border-white/[0.08] rounded-[36px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col relative z-10"
      >
        
        {/* Glow Top Border Line Accent */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

        {/* Top Header Row */}
        <header className="px-6 py-5 border-b border-white/[0.05] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-white block premium-font-heading">TradePro Workspace</span>
              <span className="text-[9px] text-cyan-400/80 font-mono tracking-wider">HOLO EDITION</span>
            </div>
          </div>

          {/* Navigation Tab Menu */}
          <nav className="flex items-center bg-black/45 p-1 rounded-full border border-white/[0.05]">
            {(["overview", "markets", "cards", "copilot"] as const).map((v) => (
              <button
                key={v}
                onClick={() => {
                  setActiveView(v);
                  triggerToast(`Opened ${v} view`, "info");
                }}
                className={`px-4.5 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest transition-all duration-300 premium-font-heading ${
                  activeView === v
                    ? "bg-white/10 text-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)] border border-white/[0.05]"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {v}
              </button>
            ))}
          </nav>

          {/* Theme switcher */}
          <button
            onClick={() => {
              setTheme((prev) => (prev === "dark" ? "light" : "dark"));
              triggerToast(`Switched theme`, "info");
            }}
            className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-slate-400 hover:text-white transition-all shadow-inner"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </header>

        {/* View Layout Container */}
        <div className="p-6 md:p-8 flex-1">
          <AnimatePresence mode="wait">
            
            {/* VIEW 1: Overview Dashboard (Visual centerpiece with Circular Dial) */}
            {activeView === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
              >
                
                {/* Visual Dial (Left Column) */}
                <div className="flex flex-col items-center justify-center space-y-5">
                  <div className="relative w-64 h-64 flex items-center justify-center bg-black/25 rounded-full border border-white/[0.02] shadow-inner">
                    
                    {/* SVG Radial Ring */}
                    <svg className="w-full h-full transform -rotate-90 overflow-visible" viewBox="0 0 100 100">
                      <defs>
                        <filter id="neon-glow-dial" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="2.5" result="blur" />
                          <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>

                      {/* Background Dial Track Ring */}
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.02)" strokeWidth="9" />

                      {radialSegments.map((seg, idx) => {
                        const radius = 40;
                        const circumference = 2 * Math.PI * radius;
                        const strokeDashoffset = circumference - (seg.percent / 100) * circumference;
                        const strokeDasharray = `${circumference} ${circumference}`;
                        const rotateAngle = (seg.startPercent / 100) * 360;

                        return (
                          <circle
                            key={idx}
                            cx="50"
                            cy="50"
                            r={radius}
                            fill="transparent"
                            stroke={seg.color}
                            strokeWidth="8.5"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            transform={`rotate(${rotateAngle} 50 50)`}
                            filter="url(#neon-glow-dial)"
                            className="transition-all duration-300 cursor-pointer hover:stroke-[11.5]"
                            onMouseEnter={() => setFocusedSegment({ label: seg.label, value: seg.value })}
                            onMouseLeave={() => setFocusedSegment(null)}
                          />
                        );
                      })}
                    </svg>

                    {/* Centered Portfolio Value Metric */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                      <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest premium-font-heading">
                        {focusedSegment ? focusedSegment.label : "Net Balance"}
                      </p>
                      <h3 className="text-2xl font-extrabold text-white premium-font-stats tracking-tight my-1">
                        ${(focusedSegment ? focusedSegment.value : totalPortfolioValue).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </h3>
                      <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] text-emerald-400 font-extrabold flex items-center gap-0.5">
                        <TrendingUp className="w-2.5 h-2.5" /> +4.25%
                      </div>
                    </div>

                  </div>

                  {/* Legends */}
                  <div className="grid grid-cols-2 gap-2 w-full max-w-sm text-[9px] font-bold premium-font-heading">
                    {radialSegments.map((seg, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.04] text-slate-300"
                        style={{ borderLeftWidth: "3px", borderLeftColor: seg.color }}
                      >
                        <span>{seg.label}</span>
                        <span className="text-white font-mono">{seg.percent.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Interactive Control Desk (Quick Send + Actions) */}
                <div className="space-y-6">
                  
                  {/* Swipe Payout Module */}
                  <div className="bg-white/[0.02] border border-white/[0.05] p-5.5 rounded-[28px] space-y-4 shadow-xl">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-widest premium-font-heading">Fast Cash Wire</h4>
                      <p className="text-[10px] text-slate-400 premium-font-heading">Instantly execute transactions to contacts</p>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2.5">
                        <input
                          type="text"
                          placeholder="Recipient address"
                          value={transferTarget}
                          onChange={(e) => setTransferTarget(e.target.value)}
                          className="bg-black/35 border border-white/[0.05] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/70 transition-all font-medium"
                        />
                        <input
                          type="number"
                          placeholder="USD Value"
                          value={transferAmount}
                          onChange={(e) => setTransferAmount(e.target.value)}
                          className="bg-black/35 border border-white/[0.05] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/70 transition-all premium-font-mono"
                        />
                      </div>

                      {/* Premium Swipe to Confirm slider */}
                      <div className="relative w-full h-12 bg-black/45 border border-white/[0.05] rounded-full p-1 flex items-center select-none overflow-hidden">
                        <motion.div
                          className="absolute top-1 bottom-1 left-1 bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-full flex items-center justify-end px-3.5 cursor-grab active:cursor-grabbing text-xs text-white font-bold"
                          style={{
                            width: `${Math.max(15, sliderVal)}%`,
                            boxShadow: "0 0 15px rgba(6,182,212,0.3)"
                          }}
                          drag="x"
                          dragConstraints={{ left: 0, right: 280 }}
                          dragElastic={0.05}
                          onDrag={(e, info) => {
                            const containerWidth = 280;
                            const currentVal = Math.min(100, Math.max(0, (info.point.x / containerWidth) * 100));
                            setSliderVal(currentVal);
                          }}
                          onDragEnd={() => {
                            if (sliderVal < 90) {
                              setSliderVal(0);
                            }
                          }}
                        >
                          <ArrowRight className="w-4 h-4" />
                        </motion.div>
                        <span className="w-full text-center text-[10px] font-extrabold uppercase tracking-widest text-slate-500 pointer-events-none z-0 premium-font-heading">
                          {isTransferring ? "Processing Transfer..." : "Swipe to confirm wire"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Transaction Ledger Log */}
                  <div className="bg-white/[0.02] border border-white/[0.05] p-5 rounded-[28px] space-y-3 shadow-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest premium-font-heading">Transactions Ledger</span>
                    <div className="space-y-2 max-h-32 overflow-y-auto pr-1 premium-scrollbar">
                      {transactions.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between text-xs py-2 border-b border-white/[0.04] last:border-b-0">
                          <div className="flex items-center gap-2">
                            <div className={`w-6.5 h-6.5 rounded-lg flex items-center justify-center ${
                              tx.type === "receive" ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-500/10 text-slate-300"
                            }`}>
                              {tx.type === "receive" ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                            </div>
                            <div>
                              <p className="font-bold text-white uppercase premium-font-heading text-[10px]">{tx.type} {tx.asset}</p>
                              <p className="text-[9px] text-slate-500 font-mono">{tx.date}</p>
                            </div>
                          </div>
                          <span className={`font-mono font-bold ${tx.type === "receive" ? "text-emerald-400" : "text-slate-300"}`}>
                            {tx.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </motion.div>
            )}

            {/* VIEW 2: Markets & Asset Details */}
            {activeView === "markets" && (
              <motion.div
                key="markets"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left Column: Asset Selection Grid */}
                  <div className="md:col-span-2 space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest premium-font-heading">Trading Markets</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {assets.map((a) => {
                        const positive = a.change24h >= 0;
                        const mockHistory = positive
                          ? [a.currentPrice * 0.95, a.currentPrice * 0.94, a.currentPrice * 0.96, a.currentPrice * 0.97, a.currentPrice * 0.96, a.currentPrice * 0.98, a.currentPrice]
                          : [a.currentPrice * 1.05, a.currentPrice * 1.03, a.currentPrice * 1.04, a.currentPrice * 1.02, a.currentPrice * 1.01, a.currentPrice];

                        return (
                          <div
                            key={a.symbol}
                            onClick={() => {
                              setTradeAsset(a.symbol);
                              triggerToast(`Selected asset: ${a.symbol}`, "info");
                            }}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 relative overflow-hidden ${
                              tradeAsset === a.symbol
                                ? "bg-cyan-500/10 border-cyan-500/40 shadow-lg shadow-cyan-500/5"
                                : "bg-white/[0.02] border-white/[0.05] hover:border-white/15"
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-extrabold text-white text-xs block premium-font-heading">{a.symbol}</span>
                                <span className="text-[9px] text-slate-400 font-medium premium-font-heading">{a.name}</span>
                              </div>
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${positive ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                                {positive ? "+" : ""}{a.change24h}%
                              </span>
                            </div>

                            <div className="mt-3 flex justify-between items-end">
                              <span className="text-sm font-bold text-white premium-font-stats">${a.currentPrice.toLocaleString()}</span>
                              <div className="pb-1 shrink-0">
                                <NeonSparkline data={mockHistory} color={a.color} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Execution Form */}
                  <div className="bg-white/[0.02] border border-white/[0.05] p-5.5 rounded-[28px] space-y-4 shadow-xl">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-widest premium-font-heading">Execute Trade</h4>
                      <p className="text-[10px] text-slate-400 premium-font-heading">Sandbox instant order execution</p>
                    </div>

                    <form onSubmit={handleExecuteTrade} className="space-y-4">
                      {/* Action selector */}
                      <div className="grid grid-cols-2 bg-black/45 p-0.5 rounded-xl border border-white/[0.05]">
                        <button
                          type="button"
                          onClick={() => setTradeAction("buy")}
                          className={`py-1.5 text-[10px] font-extrabold uppercase rounded-lg transition-all ${
                            tradeAction === "buy" ? "bg-emerald-500 text-white shadow" : "text-slate-400"
                          }`}
                        >
                          Buy
                        </button>
                        <button
                          type="button"
                          onClick={() => setTradeAction("sell")}
                          className={`py-1.5 text-[10px] font-extrabold uppercase rounded-lg transition-all ${
                            tradeAction === "sell" ? "bg-rose-500 text-white shadow" : "text-slate-400"
                          }`}
                        >
                          Sell
                        </button>
                      </div>

                      {/* Quantity input */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide premium-font-heading">Quantity ({tradeAsset})</label>
                        <input
                          type="number"
                          step="any"
                          placeholder="0.00"
                          value={tradeAmount}
                          onChange={(e) => setTradeAmount(e.target.value)}
                          className="w-full bg-black/20 border border-white/[0.05] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/70 font-mono"
                        />
                      </div>

                      {/* Estimation */}
                      {tradeAmount && parseFloat(tradeAmount) > 0 && (
                        <div className="p-3 bg-black/35 rounded-xl border border-white/[0.05] text-[10px] font-semibold text-slate-400 space-y-1">
                          <div className="flex justify-between">
                            <span>Cost:</span>
                            <span className="text-white">
                              ${(parseFloat(tradeAmount) * (assets.find(a=>a.symbol===tradeAsset)?.currentPrice || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      )}

                      <button
                        type="submit"
                        className={`w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all ${
                          tradeAction === "buy" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-rose-500 hover:bg-rose-600"
                        }`}
                      >
                        Execute {tradeAction === "buy" ? "Purchase" : "Sale"}
                      </button>
                    </form>
                  </div>
                </div>
              </motion.div>
            )}

            {/* VIEW 3: Swipeable Digital Card Deck */}
            {activeView === "cards" && (
              <motion.div
                key="cards"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="flex flex-col items-center justify-center space-y-8"
              >
                
                {/* Visual swipe indicators */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      setActiveCardIdx((prev) => (prev === 0 ? cards.length - 1 : prev - 1));
                      setRevealCard(false);
                    }}
                    className="p-2 rounded-full bg-white/[0.03] hover:bg-white/10 border border-white/[0.05] text-slate-400 hover:text-white transition-all shadow-inner"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest premium-font-heading">
                    Card {activeCardIdx + 1} of {cards.length}
                  </span>
                  <button
                    onClick={() => {
                      setActiveCardIdx((prev) => (prev === cards.length - 1 ? 0 : prev + 1));
                      setRevealCard(false);
                    }}
                    className="p-2 rounded-full bg-white/[0.03] hover:bg-white/10 border border-white/[0.05] text-slate-400 hover:text-white transition-all shadow-inner"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Card visual stack wrapper with mouse-tilt interaction */}
                <div className="perspective-[1000px] py-4">
                  <motion.div
                    ref={cardRef}
                    onMouseMove={handleCardMouseMove}
                    onMouseLeave={handleCardMouseLeave}
                    style={{
                      rotateX: cardRotateX,
                      rotateY: cardRotateY,
                      transformStyle: "preserve-3d"
                    }}
                    className="relative w-80 md:w-[340px] aspect-[1.586/1] rounded-[24px] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-white/[0.1] cursor-pointer"
                  >
                    {/* Glowing backplate gradient */}
                    <div
                      className="absolute inset-0 bg-gradient-to-tr transition-all duration-300"
                      style={{
                        background: `radial-gradient(circle at center, ${cards[activeCardIdx].accent}33 0%, transparent 70%)`
                      }}
                    />

                    {/* Gradient background */}
                    <div className={`absolute inset-0 bg-gradient-to-tr ${cards[activeCardIdx].color}`} />
                    
                    {/* Holographic texture served via local public folder */}
                    <div className="absolute inset-0 bg-[url('/premium_card_texture.png')] bg-cover bg-center mix-blend-overlay opacity-[0.55]" />

                    {/* Frozen state overlay */}
                    {cards[activeCardIdx].isFrozen && (
                      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-10 flex flex-col items-center justify-center gap-1.5">
                        <Lock className="w-8 h-8 text-cyan-400 animate-pulse" />
                        <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-widest premium-font-heading">Locked Shield</span>
                      </div>
                    )}

                    {/* Card details inside with translateZ depth */}
                    <div
                      style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }}
                      className="absolute inset-0 p-6 flex flex-col justify-between text-white z-0"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[8px] text-white/50 font-extrabold uppercase tracking-widest premium-font-heading">Debit Platinum</span>
                          <h4 className="text-xs font-bold text-white premium-font-heading">{cards[activeCardIdx].name}</h4>
                        </div>
                        <span className="text-xl">💎</span>
                      </div>

                      <div className="space-y-4">
                        {/* Card number */}
                        <p className="text-base md:text-lg font-mono tracking-widest font-bold">
                          {revealCard
                            ? cards[activeCardIdx].number
                            : `•••• •••• •••• ${cards[activeCardIdx].number.split(" ").slice(-1)[0]}`}
                        </p>

                        <div className="flex justify-between items-end text-[10px]">
                          <div>
                            <p className="text-[7px] text-white/40 uppercase tracking-widest premium-font-heading">Expiry</p>
                            <p className="font-mono font-bold">{cards[activeCardIdx].expiry}</p>
                          </div>
                          <div>
                            <p className="text-[7px] text-white/40 uppercase tracking-widest premium-font-heading">CVV</p>
                            <p className="font-mono font-bold">{revealCard ? cards[activeCardIdx].cvv : "•••"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Card actions deck */}
                <div className="flex gap-4 text-[10px]">
                  <button
                    onClick={() => {
                      setRevealCard((prev) => !prev);
                      triggerToast(revealCard ? "Details masked" : "Details revealed", "info");
                    }}
                    className="px-4.5 py-2.5 rounded-xl bg-white/[0.02] hover:bg-white/10 border border-white/[0.05] text-white font-extrabold flex items-center gap-1.5 transition-all shadow-inner"
                  >
                    {revealCard ? <EyeOff className="w-4.5 h-4.5 text-cyan-400" /> : <Eye className="w-4.5 h-4.5 text-cyan-400" />}
                    {revealCard ? "Hide Details" : "Show Details"}
                  </button>
                  <button
                    onClick={() => handleFreezeCard(cards[activeCardIdx].id)}
                    className={`px-4.5 py-2.5 rounded-xl text-white font-extrabold flex items-center gap-1.5 transition-all shadow-inner ${
                      cards[activeCardIdx].isFrozen ? "bg-emerald-500 hover:bg-emerald-600" : "bg-rose-500 hover:bg-rose-600"
                    }`}
                  >
                    {cards[activeCardIdx].isFrozen ? <Unlock className="w-4.5 h-4.5" /> : <Lock className="w-4.5 h-4.5" />}
                    {cards[activeCardIdx].isFrozen ? "Unlock Shield" : "Lock Shield"}
                  </button>
                </div>

              </motion.div>
            )}

            {/* VIEW 4: AI Assistant Drawer */}
            {activeView === "copilot" && (
              <motion.div
                key="copilot"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 max-w-md mx-auto"
              >
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-5 h-64 overflow-y-auto space-y-3 premium-scrollbar">
                  {chatLog.map((msg, i) => (
                    <div key={i} className={`flex flex-col max-w-[85%] ${msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"}`}>
                      <div className={`p-3 rounded-2xl text-[11px] leading-relaxed font-semibold premium-font-heading ${
                        msg.sender === "user" ? "bg-cyan-500 text-white rounded-tr-none" : "bg-black/35 text-slate-300 border border-white/5 rounded-tl-none"
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Suggested Prompts */}
                <div className="flex gap-2 justify-center">
                  {["breakdown", "market signal"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleAiSend(p)}
                      className="px-3.5 py-1.5 rounded-full bg-white/[0.03] hover:bg-white/10 border border-white/[0.05] text-[9px] font-extrabold text-slate-300 transition-all uppercase tracking-widest premium-font-heading"
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAiSend();
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    placeholder="Ask TradePro AI..."
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    className="flex-1 bg-black/20 border border-white/[0.05] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/70"
                  />
                  <button type="submit" className="px-4.5 py-2.5 bg-cyan-500 hover:bg-cyan-600 rounded-xl text-white font-extrabold text-xs premium-font-heading">
                    Send
                  </button>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Floating Ticker tape footer */}
        <footer className="bg-black/45 px-6 py-4.5 border-t border-white/[0.05] flex items-center justify-between text-[9px] font-semibold text-slate-500 select-none tracking-widest">
          <div className="flex items-center gap-1.5 font-mono uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            Holo Engine Node Online
          </div>
          <span className="font-mono">VER 3.5.0 (SANDBOX MODE)</span>
        </footer>

      </motion.div>

    </div>
  );
}
