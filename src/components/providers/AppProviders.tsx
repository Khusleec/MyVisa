"use client";

import { ToastProvider } from "../ui/Toast";
import { VisaAppProvider } from "./VisaAppContext";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <VisaAppProvider>{children}</VisaAppProvider>
    </ToastProvider>
  );
}

