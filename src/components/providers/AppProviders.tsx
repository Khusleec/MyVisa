"use client";

import { ToastProvider } from "../ui/Toast";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
