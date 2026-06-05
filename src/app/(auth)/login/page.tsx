"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useVisaAppContext } from "../../../components/providers/VisaAppContext";
import Auth from "../../../components/Auth";
import LoadingScreen from "../../../components/ui/LoadingScreen";

export default function LoginRoute() {
  const router = useRouter();
  const { session, loadingSession } = useVisaAppContext();

  useEffect(() => {
    if (!loadingSession && session) {
      router.push("/dashboard");
    }
  }, [session, loadingSession, router]);

  if (loadingSession) {
    return <LoadingScreen />;
  }

  if (session) {
    return <LoadingScreen />;
  }

  const handleAuthSuccess = () => {
    router.push("/dashboard");
  };

  return <Auth onAuthSuccess={handleAuthSuccess} />;
}
