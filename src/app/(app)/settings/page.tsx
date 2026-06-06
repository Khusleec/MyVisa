"use client";

import React from "react";
import { useVisaAppContext } from "../../../components/providers/VisaAppContext";
import Settings from "../../../components/Settings";

export default function SettingsRoute() {
  const {
    userRole,
    user,
    company,
    session,
    updateUser,
    setIsDanModalOpen,
    handleSignOut
  } = useVisaAppContext();

  if (!session) return null;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Settings
        userRole={userRole}
        user={user}
        userEmail={session.user.email || ""}
        companyName={company.name}
        companyRegistration={company.registrationNo}
        onUpdateUser={updateUser}
        onOpenDanModal={() => setIsDanModalOpen(true)}
        onSignOut={handleSignOut}
      />
    </div>
  );
}
