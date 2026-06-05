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
    smsNotifications,
    setSmsNotifications,
    setIsDanModalOpen,
    handleSignOut
  } = useVisaAppContext();

  if (!session) return null;

  return (
    <Settings
      userRole={userRole}
      userName={user.name}
      userRegister={user.registerNo}
      userPhone={user.phone}
      userEmail={session.user.email || ""}
      isUserVerified={user.isVerified}
      companyName={company.name}
      companyRegistration={company.registrationNo}
      smsNotifications={smsNotifications}
      onSmsToggle={setSmsNotifications}
      onOpenDanModal={() => setIsDanModalOpen(true)}
      onSignOut={handleSignOut}
    />
  );
}
