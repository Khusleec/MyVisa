"use client";

import React from "react";
import { useVisaAppContext } from "../../../components/providers/VisaAppContext";
import Chat from "../../../components/Chat";

export default function ChatRoute() {
  const { profile } = useVisaAppContext();

  if (!profile) return null;

  return <Chat currentProfile={profile} />;
}
