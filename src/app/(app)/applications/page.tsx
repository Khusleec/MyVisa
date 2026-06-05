"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useVisaAppContext } from "../../../components/providers/VisaAppContext";
import ApplicationsList from "../../../components/ApplicationsList";

export default function ApplicationsRoute() {
  const router = useRouter();
  const {
    userRole,
    applications,
    openQPayInvoice,
    getStatusConfig,
    setFormError
  } = useVisaAppContext();

  const handleGoToApply = () => {
    setFormError(null);
    router.push("/apply");
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <ApplicationsList
        userRole={userRole as 'individual' | 'business_admin'}
        applications={applications}
        openQPayInvoice={openQPayInvoice}
        getStatusConfig={getStatusConfig}
        onGoToApply={handleGoToApply}
      />
    </div>
  );
}
