"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useVisaAppContext } from "../components/providers/VisaAppContext";
import LoadingScreen from "../components/ui/LoadingScreen";

export default function RootPage() {
  const router = useRouter();
  const { session, loadingSession } = useVisaAppContext();

  useEffect(() => {
    if (!loadingSession) {
      if (session) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [session, loadingSession, router]);

  return <LoadingScreen />;
}
