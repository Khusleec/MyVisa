"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useVisaAppContext } from "../../../components/providers/VisaAppContext";
import Dashboard from "../../../components/Dashboard";

export default function DashboardRoute() {
  const router = useRouter();
  const {
    userRole,
    user,
    company,
    employees,
    applications,
    bulkSelectIds,
    handleBulkCheckboxToggle,
    openBulkPaymentInvoice,
    openQPayInvoice,
    handleStartEmployeeVisa,
    handleStartB2CVisa,
    getStatusConfig,
    setIsDanModalOpen,
    setFormError,
    allCompanies,
    startChatWithCompany,
    pendingInvites,
    inviteEmployee,
  } = useVisaAppContext();

  const handleStartEmployee = (empId: string) => {
    handleStartEmployeeVisa(empId);
    router.push("/apply");
  };

  const handleStartB2C = (countryName: string, countryCode: string, eFee: number, sFee: number, companyId?: string) => {
    handleStartB2CVisa(countryName, countryCode, eFee, sFee, companyId);
    router.push("/apply");
  };

  const handleGoToApply = () => {
    setFormError(null);
    router.push("/apply");
  };

  const handleStartChat = async (companyId: string, companyName: string) => {
    const success = await startChatWithCompany(companyId, companyName);
    if (success) {
      router.push("/chat");
      return true;
    }
    return false;
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
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
        onStartEmployeeVisa={handleStartEmployee}
        onStartB2CVisa={handleStartB2C}
        getStatusConfig={getStatusConfig}
        isUserVerified={user.isVerified}
        onOpenDanModal={() => setIsDanModalOpen(true)}
        onGoToApply={handleGoToApply}
        companiesList={allCompanies}
        onStartChatWithCompany={handleStartChat}
        pendingInvites={pendingInvites}
        onInviteEmployee={inviteEmployee}
      />
    </div>
  );
}
