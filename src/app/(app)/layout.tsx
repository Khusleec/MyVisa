"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
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
  } = useVisaAppContext();
  const router = useRouter();

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
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[9999] bg-accent text-white px-4 py-2 rounded-lg font-bold shadow-lg text-xs">
        Үндсэн контент руу очих
      </a>
      <Navbar />
      <main id="main-content" className="flex-1 flex flex-col min-h-0 mobile-nav-safe">
        <div className="page-shell mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-10 min-w-0">
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

