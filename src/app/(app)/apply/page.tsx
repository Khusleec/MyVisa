"use client";

import React from "react";
import { useVisaAppContext } from "../../../components/providers/VisaAppContext";
import ApplicationForm from "../../../components/ApplicationForm";

export default function ApplyRoute() {
  const {
    userRole,
    employees,
    newApp,
    setNewApp,
    handleCountryChange,
    handleApplicantTypeChange,
    handleEmployeeSelection,
    pullKhurData,
    handleFileUpload,
    handleNextToPricing,
    handleGenerateInvoice,
    handleSaveAsDraft,
    khurLoading,
    uploadingFile,
    user,
    setIsDanModalOpen,
    formError,
    setFormError,
    allowedCountries,
    allCompanies
  } = useVisaAppContext();

  return (
    <div className="w-full max-w-3xl mx-auto">
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
        uploadingFile={uploadingFile}
        isUserVerified={user.isVerified}
        onOpenDanModal={() => setIsDanModalOpen(true)}
        formError={formError}
        onClearFormError={() => setFormError(null)}
        allowedCountries={allowedCountries}
        companiesList={allCompanies}
      />
    </div>
  );
}
