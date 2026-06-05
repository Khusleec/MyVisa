"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  Maximize2,
  DollarSign
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
}

export default function RedesignedTradePro() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeView, setActiveView] = useState<"overview" | "markets" | "cards" | "copilot">("overview");
  
  // Sandbox Account Balance
  const [cashBalance, setCashBalance] = useState(54820.50);

  // Asset holdings with color coding for the Radial Dial
  const [assets, setAssets] = useState<Asset[]>([
    { symbol: "BTC", name: "Bitcoin", amount: 1.45, currentPrice: 62450, change24h: 3.42, color: "#06b6d4" }, // Cyan
    { symbol: "ETH", name: "Ethereum", amount: 9.8, currentPrice: 3420, change24h: 5.12, color: "#8b5cf6" },  // Purple
    { symbol: "NVDA", name: "Nvidia", amount: 22, currentPrice: 895.4, change24h: 8.94, color: "#10b981" },  // Green
    { symbol: "AAPL", name: "Apple", amount: 35, currentPrice: 182.3, change24h: -0.65, color: "#f43f5e" }   // Rose
  ]);

  // Digital card details
  const [cards, setCards] = useState<CardDetails[]>([
    { id: "c1", name: "TradePro Black", number: "4532 9845 1204 8839", expiry: "12/30", cvv: "842", isFrozen: false, color: "from-slate-900 to-slate-950" },
    { id: "c2", name: "TradePro Emerald", number: "5102 7741 9934 0012", expiry: "08/29", cvv: "305", isFrozen: true, color: "from-emerald-950 to-slate-900" }
  ]);
  const [activeCardIdx, setActiveCardIdx] = useState(0);
  const [revealCard, setRevealCard] = useState(false);

  // Transfer simulation
  const [transferAmount, setTransferAmount] = useState("");
  const [transferTarget, setTransferTarget] = useState("");
  const [sliderVal, setSliderVal] = useState(0); // Swipe-to-confirm value (0 to 100)
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
    { sender: "ai", text: "Welcome to your minimalist trading deck. Type commands or select prompts." }
  ]);

  // --- Calculations ---
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
      label: "Cash",
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

  // State to track which segment is currently highlighted/focused
  const [focusedSegment, setFocusedSegment] = useState<{ label: string; value: number } | null>(null);

  // Swipe-to-confirm trigger
  useEffect(() => {
    if (sliderVal >= 95) {
      setSliderVal(100);
      handleExecuteTransfer();
    }
  }, [sliderVal]);

  const handleExecuteTransfer = () => {
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
      triggerToast(`Sent $${amt.toLocaleString()} to ${transferTarget}!`, "success");
      setTransferAmount("");
      setTransferTarget("");
      setSliderVal(0);
      setIsTransferring(false);
    }, 1500);
  };

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
      triggerToast(`Bought ${qty} ${tradeAsset} for $${totalCost.toLocaleString()}`, "success");
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

  // Card toggles
  const handleFreezeCard = (id: string) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          triggerToast(c.isFrozen ? "Card Unfrozen" : "Card Frozen", "info");
          return { ...c, isFrozen: !c.isFrozen };
        }
        return c;
      })
    );
  };

  // AI dialog submission
  const handleAiSend = (suggestedText?: string) => {
    const text = suggestedText || aiInput;
    if (!text.trim()) return;

    if (!suggestedText) setAiInput("");

    setChatLog((prev) => [...prev, { sender: "user", text }]);
    setTimeout(() => {
      let reply = "I'm ready to assist with your portfolio metrics. Try asking for: 'breakdown' or 'market signal'.";
      if (text.toLowerCase().includes("breakdown")) {
        reply = `Your portfolio breakdown: Cash holds ${(cashBalance/totalPortfolioValue*100).toFixed(1)}%. Digital assets hold ${(assetsValue/totalPortfolioValue*100).toFixed(1)}%.`;
      } else if (text.toLowerCase().includes("signal")) {
        reply = "Analysis: BTC is experiencing low volatility near $62,450. A breakout is forecasted if momentum exceeds resistance at $63,100.";
      }
      setChatLog((prev) => [...prev, { sender: "ai", text: reply }]);
    }, 1000);
  };

  // Apply light-theme class to HTML body
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "light") {
      root.classList.add("light-theme");
    } else {
      root.classList.remove("light-theme");
    }
  }, [theme]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#090A0F] text-[#E2E8F0] overflow-y-auto p-4 md:p-6 transition-colors duration-300 relative">
      
      {/* Dynamic Background Mesh Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950/20 via-indigo-950/10 to-transparent pointer-events-none" />

      {/* Floating Toast Area */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`px-4 py-3 rounded-2xl border text-xs font-semibold shadow-2xl flex items-center gap-2.5 backdrop-blur-xl ${
                t.type === "success"
                  ? "bg-emerald-950/85 border-emerald-500/30 text-emerald-300"
                  : t.type === "error"
                  ? "bg-rose-950/85 border-rose-500/30 text-rose-300"
                  : "bg-slate-900/90 border-slate-700/40 text-slate-200"
              }`}
            >
              {t.type === "success" && <Check className="w-4 h-4 text-emerald-400" />}
              {t.type === "error" && <Lock className="w-4 h-4 text-rose-400" />}
              {t.type === "info" && <Sparkles className="w-4 h-4 text-cyan-400" />}
              <span>{t.msg}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Centered Glassmorphic Deck Workspace Frame */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl bg-[#13151D]/75 backdrop-blur-2xl border border-white/10 rounded-[32px] overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.05)] flex flex-col"
      >
        
        {/* Top Navigation Row */}
        <header className="px-6 py-5 border-b border-white/5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center">
              <Zap className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight text-white">TradePro</span>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center bg-black/35 p-1 rounded-full border border-white/5">
            {(["overview", "markets", "cards", "copilot"] as const).map((v) => (
              <button
                key={v}
                onClick={() => {
                  setActiveView(v);
                  triggerToast(`Navigated to ${v}`, "info");
                }}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                  activeView === v
                    ? "bg-white/10 text-white shadow-inner"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {v}
              </button>
            ))}
          </nav>

          {/* Theme switcher */}
          <button
            onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
            className="p-2 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-all"
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
                className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
              >
                
                {/* Visual Dial (Left Column) */}
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="relative w-56 h-56 flex items-center justify-center">
                    
                    {/* SVG Radial Ring */}
                    <svg className="w-full h-full transform -rotate-90 overflow-visible" viewBox="0 0 100 100">
                      {radialSegments.map((seg, idx) => {
                        const radius = 40;
                        const circumference = 2 * Math.PI * radius;
                        const strokeDashoffset = circumference - (seg.percent / 100) * circumference;
                        const strokeDasharray = `${circumference} ${circumference}`;
                        
                        // Rotational offset calculated as stroke degrees
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
                            className="transition-all duration-300 cursor-pointer hover:stroke-[10.5]"
                            onMouseEnter={() => setFocusedSegment({ label: seg.label, value: seg.value })}
                            onMouseLeave={() => setFocusedSegment(null)}
                          />
                        );
                      })}
                    </svg>

                    {/* Centered Portfolio Value Metric */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        {focusedSegment ? focusedSegment.label : "Total Balance"}
                      </p>
                      <h3 className="text-xl font-extrabold text-white font-mono tracking-tight">
                        ${(focusedSegment ? focusedSegment.value : totalPortfolioValue).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </h3>
                      <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" /> +4.25%
                      </p>
                    </div>

                  </div>

                  {/* Visual Legends */}
                  <div className="flex flex-wrap justify-center gap-3 text-[10px] font-bold">
                    {radialSegments.map((seg, idx) => (
                      <span
                        key={idx}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/5 text-slate-300 cursor-default"
                        style={{ borderColor: `${seg.color}33` }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: seg.color }} />
                        {seg.label} ({seg.percent.toFixed(0)}%)
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right Interactive Controls Desk (Quick Send + Actions) */}
                <div className="space-y-6">
                  
                  {/* Swipe Payout Module */}
                  <div className="bg-[#1C1F2A]/60 border border-white/5 p-5 rounded-3xl space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Fast Cash Send</h4>
                      <p className="text-[10px] text-slate-400">Instantly execute transactions to contacts</p>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Recipient address"
                          value={transferTarget}
                          onChange={(e) => setTransferTarget(e.target.value)}
                          className="bg-black/20 border border-white/5 rounded-xl px-3 py-2 text-[11px] text-white focus:outline-none focus:border-cyan-500"
                        />
                        <input
                          type="number"
                          placeholder="USD Value"
                          value={transferAmount}
                          onChange={(e) => setTransferAmount(e.target.value)}
                          className="bg-black/20 border border-white/5 rounded-xl px-3 py-2 text-[11px] text-white focus:outline-none focus:border-cyan-500 font-mono"
                        />
                      </div>

                      {/* Premium Swipe to Confirm slider */}
                      <div className="relative w-full h-11 bg-black/40 border border-white/5 rounded-full p-1 flex items-center select-none overflow-hidden">
                        <motion.div
                          className="absolute top-1 bottom-1 left-1 bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-full flex items-center justify-end px-3 cursor-grab active:cursor-grabbing text-xs text-white font-bold"
                          style={{
                            width: `${Math.max(12, sliderVal)}%`,
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
                        <span className="w-full text-center text-[10px] font-bold uppercase tracking-widest text-slate-500 pointer-events-none z-0">
                          {isTransferring ? "Processing Payout..." : "Slide to confirm Payout"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Transaction Ledger Log */}
                  <div className="bg-[#1C1F2A]/60 border border-white/5 p-5 rounded-3xl space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transactions Ledger</span>
                    <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                      {transactions.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between text-[11px] py-1 border-b border-white/5 last:border-b-0">
                          <div>
                            <p className="font-bold text-white uppercase">{tx.type} {tx.asset}</p>
                            <p className="text-[9px] text-slate-500 font-mono">{tx.date}</p>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Left Column: Asset Selection Grid */}
                  <div className="md:col-span-2 space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Trading Markets</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {assets.map((a) => (
                        <div
                          key={a.symbol}
                          onClick={() => {
                            setTradeAsset(a.symbol);
                            triggerToast(`Focused asset: ${a.symbol}`, "info");
                          }}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                            tradeAsset === a.symbol
                              ? "bg-cyan-500/10 border-cyan-500/40"
                              : "bg-[#1C1F2A]/60 border-white/5 hover:border-white/10"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-extrabold text-white text-xs block">{a.symbol}</span>
                              <span className="text-[9px] text-slate-400 font-medium">{a.name}</span>
                            </div>
                            <span className={`text-[10px] font-bold ${a.change24h >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                              {a.change24h >= 0 ? "+" : ""}{a.change24h}%
                            </span>
                          </div>
                          <div className="mt-3 flex justify-between items-end">
                            <span className="text-sm font-bold text-white font-mono">${a.currentPrice.toLocaleString()}</span>
                            <span className="text-[9px] text-slate-400 font-mono">Qty: {a.amount}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Execution Form */}
                  <div className="bg-[#1C1F2A]/60 border border-white/5 p-5 rounded-3xl space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Execute Trade</h4>
                      <p className="text-[10px] text-slate-400">Sandbox instant order execution</p>
                    </div>

                    <form onSubmit={handleExecuteTrade} className="space-y-3">
                      {/* Action selector */}
                      <div className="grid grid-cols-2 bg-black/40 p-0.5 rounded-xl border border-white/5">
                        <button
                          type="button"
                          onClick={() => setTradeAction("buy")}
                          className={`py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all ${
                            tradeAction === "buy" ? "bg-emerald-500 text-white" : "text-slate-400"
                          }`}
                        >
                          Buy
                        </button>
                        <button
                          type="button"
                          onClick={() => setTradeAction("sell")}
                          className={`py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all ${
                            tradeAction === "sell" ? "bg-rose-500 text-white" : "text-slate-400"
                          }`}
                        >
                          Sell
                        </button>
                      </div>

                      {/* Quantity input */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Quantity ({tradeAsset})</label>
                        <input
                          type="number"
                          step="any"
                          placeholder="0.00"
                          value={tradeAmount}
                          onChange={(e) => setTradeAmount(e.target.value)}
                          className="w-full bg-black/20 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                        />
                      </div>

                      {/* Estimation */}
                      {tradeAmount && parseFloat(tradeAmount) > 0 && (
                        <div className="p-3 bg-black/35 rounded-xl border border-white/5 text-[10px] font-semibold text-slate-400 space-y-1">
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
                        className={`w-full py-2 rounded-xl text-xs font-bold text-white shadow-lg transition-all ${
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
                className="flex flex-col items-center justify-center space-y-6"
              >
                
                {/* Visual swipe indicators */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      setActiveCardIdx((prev) => (prev === 0 ? cards.length - 1 : prev - 1));
                      setRevealCard(false);
                    }}
                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    Card {activeCardIdx + 1} of {cards.length}
                  </span>
                  <button
                    onClick={() => {
                      setActiveCardIdx((prev) => (prev === cards.length - 1 ? 0 : prev + 1));
                      setRevealCard(false);
                    }}
                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Card visual stack wrapper */}
                <div className="relative w-80 aspect-[1.586/1] rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 border border-white/10 group">
                  <div className={`absolute inset-0 bg-gradient-to-tr ${cards[activeCardIdx].color}`} />
                  
                  {/* Holographic texture served via local public folder */}
                  <div className="absolute inset-0 bg-[url('/premium_card_texture.png')] bg-cover bg-center mix-blend-overlay opacity-60" />

                  {/* Frozen state overlay */}
                  {cards[activeCardIdx].isFrozen && (
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-1">
                      <Lock className="w-7 h-7 text-cyan-400" />
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Frozen</span>
                    </div>
                  )}

                  {/* Card markings */}
                  <div className="absolute inset-0 p-5 flex flex-col justify-between text-white">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] text-white/50 font-bold uppercase tracking-wider">Debit Credit</span>
                        <h4 className="text-xs font-bold text-white">{cards[activeCardIdx].name}</h4>
                      </div>
                      <span className="text-lg">💎</span>
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm md:text-base font-mono tracking-widest font-bold">
                        {revealCard
                          ? cards[activeCardIdx].number
                          : `•••• •••• •••• ${cards[activeCardIdx].number.split(" ").slice(-1)[0]}`}
                      </p>

                      <div className="flex justify-between items-end text-[10px]">
                        <div>
                          <p className="text-[7px] text-white/50 uppercase tracking-wider">Expiry</p>
                          <p className="font-mono font-bold">{cards[activeCardIdx].expiry}</p>
                        </div>
                        <div>
                          <p className="text-[7px] text-white/50 uppercase tracking-wider">CVV</p>
                          <p className="font-mono font-bold">{revealCard ? cards[activeCardIdx].cvv : "•••"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card actions deck */}
                <div className="flex gap-3 text-[10px]">
                  <button
                    onClick={() => {
                      setRevealCard((prev) => !prev);
                      triggerToast(revealCard ? "Details masked" : "Details revealed", "info");
                    }}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-white font-bold flex items-center gap-1.5"
                  >
                    {revealCard ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {revealCard ? "Hide Details" : "Show Details"}
                  </button>
                  <button
                    onClick={() => handleFreezeCard(cards[activeCardIdx].id)}
                    className={`px-4 py-2 rounded-xl text-white font-bold flex items-center gap-1.5 ${
                      cards[activeCardIdx].isFrozen ? "bg-emerald-500 hover:bg-emerald-600" : "bg-rose-500 hover:bg-rose-600"
                    }`}
                  >
                    {cards[activeCardIdx].isFrozen ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    {cards[activeCardIdx].isFrozen ? "Unfreeze Card" : "Freeze Card"}
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
                <div className="bg-[#1C1F2A]/60 border border-white/5 rounded-3xl p-5 h-64 overflow-y-auto space-y-3 scrollbar-thin">
                  {chatLog.map((msg, i) => (
                    <div key={i} className={`flex flex-col max-w-[85%] ${msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"}`}>
                      <div className={`p-3 rounded-2xl text-[11px] leading-relaxed font-semibold ${
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
                      className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-[9px] font-bold text-slate-300 transition-all"
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
                    className="flex-1 bg-black/20 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                  <button type="submit" className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-xl text-white font-bold text-xs">
                    Send
                  </button>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Floating Ticker tape footer */}
        <footer className="bg-black/45 px-6 py-3 border-t border-white/5 flex items-center justify-between text-[9px] font-semibold text-slate-500 select-none">
          <div className="flex items-center gap-1 font-mono uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Node Engine Online
          </div>
          <span className="font-mono">VER 2.4.0 (SANDBOX)</span>
        </footer>

      </motion.div>

    </div>
  );
}
