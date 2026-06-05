"use client";

import React from "react";
import Image from "next/image";
import Sidebar from "../components/Sidebar";
import Dashboard from "../components/Dashboard";
import ApplicationForm from "../components/ApplicationForm";
import ApplicationsList from "../components/ApplicationsList";
import DanModal from "../components/modals/DanModal";
import QPayModal from "../components/modals/QPayModal";
import Auth from "../components/Auth";
import Settings from "../components/Settings";
import Chat from "../components/Chat";
import LoadingScreen from "../components/ui/LoadingScreen";
import { AnimatePresence } from "framer-motion";
import { useVisaApp } from "../hooks/useVisaApp";
import type { AppTab } from "../components/Sidebar";

const TAB_TITLES: Record<AppTab, string> = {
  dashboard: "Нүүр",
  apply: "Мэдүүлэх",
  applications: "Визүүд",
  chat: "Зурвас холбоо",
  settings: "Тохиргоо",
};

export default function Home() {
  const {
    session,
    loadingSession,
    profile,
    userRole,
    activeTab,
    setActiveTab,
    formError,
    setFormError,
    isDanModalOpen,
    setIsDanModalOpen,
    smsNotifications,
    setSmsNotifications,
    theme,
    toggleTheme,
    user,
    company,
    employees,
    applications,
    newApp,
    setNewApp,
    bulkSelectIds,
    khurLoading,
    isQPayModalOpen,
    setIsQPayModalOpen,
    activePaymentId,
    setActivePaymentId,
    qpayAmount,
    qpayCountdown,
    sendingSmsId,
    smsSentEmployees,
    handleSignOut,
    getStatusConfig,
    handleCountryChange,
    handleApplicantTypeChange,
    handleEmployeeSelection,
    pullKhurData,
    handleFileUpload,
    handleNextToPricing,
    openQPayInvoice,
    handleGenerateInvoice,
    openBulkPaymentInvoice,
    handleBulkCheckboxToggle,
    simulatePaymentSuccess,
    handleSaveAsDraft,
    handleDanSuccess,
    handleRoleToggle,
    handleStartEmployeeVisa,
    handleStartB2CVisa,
    handleSendEmployeeSms,
  } = useVisaApp();

  // Profile Loader View
  if (loadingSession) {
    return <LoadingScreen />;
  }

  // Not Logged In View
  if (!session) {
    return <Auth onAuthSuccess={() => {}} />;
  }

  const applicationsCount = userRole === 'business_admin' 
    ? applications.filter(a => a.applicantType === 'employee').length 
    : applications.filter(a => a.applicantType !== 'employee').length;

  const goToApply = () => {
    setFormError(null);
    setActiveTab("apply");
  };

  const showRoleSwitcher = profile?.role === "business_admin";

  return (
    <div className="min-h-screen bg-surface text-foreground flex flex-col md:flex-row antialiased font-sans mobile-nav-safe">
      
      <Sidebar 
        userRole={userRole}
        onRoleChange={handleRoleToggle}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        applicationsCount={applicationsCount}
        userName={user.name}
        userRegister={user.registerNo}
        companyName={company.name}
        companyRegistration={company.registrationNo}
        onSignOut={handleSignOut}
        showRoleSwitcher={showRoleSwitcher}
        theme={theme}
        onThemeToggle={toggleTheme}
      />

      <main className="flex-1 flex flex-col min-h-0 bg-surface overflow-y-auto">
        <header className="md:hidden sticky top-0 z-20 flex items-center justify-between px-4 py-3 border-b border-line bg-surface/90 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center shadow-sm border border-line/50 shrink-0">
              <Image src="/logo.png" alt="MyVisa.mn" width={20} height={20} className="object-contain" />
            </div>
            <div>
              <p className="text-[10px] font-mono text-muted uppercase tracking-wider">MyVisa.mn</p>
              <h2 className="text-sm font-bold text-foreground">{TAB_TITLES[activeTab]}</h2>
            </div>
          </div>
          {!user.isVerified && userRole === "individual" && activeTab !== "settings" && (
            <button
              type="button"
              onClick={() => setIsDanModalOpen(true)}
              className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/25"
            >
              DAN
            </button>
          )}
        </header>

        <div className="flex-1 p-4 md:p-8">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: Dashboard */}
          {activeTab === 'dashboard' && (
            <Dashboard 
              userRole={userRole as 'individual' | 'business_admin'}
              userName={user.name}
              companyName={company.name}
              companyRegistration={company.registrationNo}
              companyIndustry={company.industry}
              userPhone={user.phone}
              employees={employees}
              applications={applications}
              bulkSelectIds={bulkSelectIds}
              onBulkSelectToggle={handleBulkCheckboxToggle}
              openBulkPaymentInvoice={openBulkPaymentInvoice}
              openQPayInvoice={openQPayInvoice}
              onStartEmployeeVisa={handleStartEmployeeVisa}
              onStartB2CVisa={handleStartB2CVisa}
              getStatusConfig={getStatusConfig}
              isUserVerified={user.isVerified}
              onOpenDanModal={() => setIsDanModalOpen(true)}
              onGoToApply={goToApply}
            />
          )}

          {activeTab === 'apply' && (
            <ApplicationForm 
              userRole={userRole as 'individual' | 'business_admin'}
              employees={employees}
              newApp={newApp}
              setNewApp={setNewApp}
              onCountryChange={handleCountryChange}
              onApplicantTypeChange={handleApplicantTypeChange}
              onEmployeeSelection={handleEmployeeSelection}
              onPullKhurData={pullKhurData}
              onFileUpload={handleFileUpload}
              onNextToPricing={handleNextToPricing}
              onGenerateInvoice={handleGenerateInvoice}
              onSaveAsDraft={handleSaveAsDraft}
              khurLoading={khurLoading}
              smsNotifications={smsNotifications}
              setSmsNotifications={setSmsNotifications}
              isUserVerified={user.isVerified}
              onOpenDanModal={() => setIsDanModalOpen(true)}
              sendingSmsId={sendingSmsId}
              smsSentEmployees={smsSentEmployees}
              onSendEmployeeSms={handleSendEmployeeSms}
              formError={formError}
              onClearFormError={() => setFormError(null)}
            />
          )}

          {activeTab === 'applications' && (
            <ApplicationsList 
              userRole={userRole as 'individual' | 'business_admin'}
              applications={applications}
              openQPayInvoice={openQPayInvoice}
              getStatusConfig={getStatusConfig}
              onGoToApply={goToApply}
            />
          )}

          {activeTab === "settings" && (
            <Settings
              userRole={userRole}
              userName={user.name}
              userRegister={user.registerNo}
              userPhone={user.phone}
              userEmail={session.user.email}
              isUserVerified={user.isVerified}
              companyName={company.name}
              companyRegistration={company.registrationNo}
              smsNotifications={smsNotifications}
              onSmsToggle={setSmsNotifications}
              onOpenDanModal={() => setIsDanModalOpen(true)}
              onSignOut={handleSignOut}
            />
          )}

          {activeTab === "chat" && profile && (
            <Chat currentProfile={profile} />
          )}

        </AnimatePresence>
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
