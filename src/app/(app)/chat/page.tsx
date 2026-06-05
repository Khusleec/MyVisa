"use client";

import React from "react";
import { useVisaAppContext } from "../../../components/providers/VisaAppContext";
import Chat from "../../../components/Chat";

export default function ChatRoute() {
  const { profile } = useVisaAppContext();

  if (!profile) return null;

  return (
    <div className="w-full max-w-5xl mx-auto">
      <Chat currentProfile={profile} />
    </div>
  );
}
