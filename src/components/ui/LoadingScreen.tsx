import { RefreshCw } from "lucide-react";

export default function LoadingScreen({ message = "Ачаалж байна..." }: { message?: string }) {
  return (
    <div className="min-h-screen bg-surface text-foreground flex flex-col items-center justify-center gap-5 p-6">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-accent/20 blur-xl scale-150" aria-hidden />
        <RefreshCw className="w-9 h-9 text-accent animate-spin relative" aria-hidden />
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-semibold text-foreground">{message}</p>
        <p className="text-[10px] text-muted font-mono uppercase tracking-wider">MyVisa.mn</p>
      </div>
    </div>
  );
}
