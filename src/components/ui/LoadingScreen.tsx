import { RefreshCw } from "lucide-react";

export default function LoadingScreen({ message = "Ачаалж байна..." }: { message?: string }) {
  return (
    <div className="min-h-screen bg-[#090a0f] text-[#f4f5f6] flex flex-col items-center justify-center gap-5 p-6">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-[#0066ff]/20 blur-xl scale-150" aria-hidden />
        <RefreshCw className="w-9 h-9 text-[#0066ff] animate-spin relative" aria-hidden />
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-semibold text-white">{message}</p>
        <p className="text-[10px] text-[#8f95b2] font-mono uppercase tracking-wider">MyVisa.mn</p>
      </div>
    </div>
  );
}
