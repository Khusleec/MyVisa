"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useVisaAppContext } from "../../components/providers/VisaAppContext";
import LoadingScreen from "../../components/ui/LoadingScreen";
import Navbar from "../../components/Navbar";
import DanModal from "../../components/modals/DanModal";
import QPayModal from "../../components/modals/QPayModal";


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const {
    session,
    loadingSession,
    isDanModalOpen,
    setIsDanModalOpen,
    handleDanSuccess,
    isQPayModalOpen,
    setIsQPayModalOpen,
    activePaymentId,
    setActivePaymentId,
    newApp,
    qpayAmount,
    qpayCountdown,
    simulatePaymentSuccess,
    activeTab,
    setActiveTab
  } = useVisaAppContext();
  const router = useRouter();
  const pathname = usePathname();

  // Sync activeTab context change to Next.js route
  useEffect(() => {
    const tabToPath: Record<string, string> = {
      dashboard: "/dashboard",
      apply: "/apply",
      applications: "/applications",
      chat: "/chat",
      settings: "/settings",
    };
    if (tabToPath[activeTab] && tabToPath[activeTab] !== pathname) {
      router.push(tabToPath[activeTab]);
    }
  }, [activeTab, pathname, router]);

  // Sync route change to activeTab context
  useEffect(() => {
    const pathToTab: Record<string, string> = {
      "/dashboard": "dashboard",
      "/apply": "apply",
      "/applications": "applications",
      "/chat": "chat",
      "/settings": "settings",
    };
    const tab = pathToTab[pathname];
    if (tab && tab !== activeTab) {
      setActiveTab(tab as any);
    }
  }, [pathname, activeTab, setActiveTab]);

  useEffect(() => {
    if (!loadingSession && !session) {
      router.push("/login");
    }
  }, [session, loadingSession, router]);


  if (loadingSession) {
    return <LoadingScreen />;
  }

  if (!session) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface text-foreground transition-colors duration-200 antialiased font-sans">
      <Navbar />
      <main className="flex-1 flex flex-col min-h-0 bg-surface">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          {children}
        </div>
      </main>

      {/* DAN SYSTEM MODAL SIMULATOR */}
      <DanModal 
        isOpen={isDanModalOpen}
        onClose={() => setIsDanModalOpen(false)}
        onSuccess={handleDanSuccess}
      />

      {/* QPAY SIMULATION INVOICE MODAL */}
      <QPayModal 
        isOpen={isQPayModalOpen}
        onClose={() => {
          setIsQPayModalOpen(false);
          setActivePaymentId(null);
        }}
        invoiceId={activePaymentId || newApp.qpayInvoice}
        amount={qpayAmount}
        countdown={qpayCountdown}
        onPaymentSuccess={simulatePaymentSuccess}
      />
    </div>
  );
}

