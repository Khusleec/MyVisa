import Image from "next/image";
import { RefreshCw } from "lucide-react";

export default function LoadingScreen({ message = "Ачаалж байна..." }: { message?: string }) {
  return (
    <div className="min-h-screen bg-surface text-foreground flex flex-col items-center justify-center gap-6 p-6">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-accent/15 blur-2xl scale-[2] animate-pulse" aria-hidden />
        <div className="relative w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center border border-line/50">
          <Image src="/logo.png" alt="MyVisa.mn" width={44} height={44} className="object-contain" priority />
        </div>
      </div>
      <div className="flex flex-col items-center gap-2.5">
        <RefreshCw className="w-5 h-5 text-accent animate-spin" aria-hidden />
        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-foreground">{message}</p>
          <p className="text-[10px] text-muted font-mono uppercase tracking-wider">MyVisa.mn</p>
        </div>
      </div>
    </div>
  );
}
