import React from "react";
import { motion } from "framer-motion";
import { FileText, Plus } from "lucide-react";
import { VisaApplication } from "../types/visa";
import PageHeader from "./ui/PageHeader";
import EmptyState from "./ui/EmptyState";

interface ApplicationsListProps {
  userRole: "individual" | "business_admin";
  applications: VisaApplication[];
  openQPayInvoice: (appId: string, amount: number) => void;
  getStatusConfig: (status: VisaApplication["status"]) => {
    text: string;
    bg: string;
    bar: string;
  };
  onGoToApply?: () => void;
}

export default function ApplicationsList({
  userRole,
  applications,
  openQPayInvoice,
  getStatusConfig,
  onGoToApply,
}: ApplicationsListProps) {
  const filteredApps = applications.filter((a) =>
    userRole === "business_admin"
      ? a.applicantType === "employee"
      : a.applicantType !== "employee"
  );

  return (
    <motion.div
      key="applications"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.15 }}
      className="space-y-6 max-w-4xl"
    >
      <PageHeader
        title={
          userRole === "business_admin"
            ? "Ажилчдын виз мэдүүлгүүд"
            : "Миний виз мэдүүлгүүд"
        }
        description={
          userRole === "business_admin"
            ? "Байгууллагын ажилчдын нэр дээрх бүх визийн явц."
            : "ЭСЯ-д илгээсэн болон төлбөр төлөх шаардлагатай мэдүүлгүүд."
        }
        action={
          onGoToApply ? (
            <button type="button" onClick={onGoToApply} className="btn-primary">
              <Plus className="w-4 h-4" />
              Шинэ
            </button>
          ) : undefined
        }
      />

      {filteredApps.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Мэдүүлэг олдсонгүй"
          description="Одоогоор хадгалагдсан виз мэдүүлэг байхгүй. Шинэ мэдүүлэг үүсгэнэ үү."
          action={
            onGoToApply ? (
              <button type="button" onClick={onGoToApply} className="btn-primary">
                Виз мэдүүлэх
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredApps.map((app) => (
            <article
              key={app.id}
              className="premium-card p-5 space-y-4 relative overflow-hidden bg-[#0e0f15] border border-[#1e2030] rounded-xl"
            >
              <div
                className={`absolute top-0 bottom-0 left-0 w-1 ${getStatusConfig(app.status).bar}`}
                aria-hidden
              />

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pl-2">
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className="w-10 h-10 rounded-lg bg-[#181922] flex items-center justify-center font-bold text-xs text-white border border-[#1e2030] shrink-0"
                    aria-hidden
                  >
                    {app.countryCode}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white flex flex-wrap items-center gap-2">
                      {app.country}
                      <span className="text-[9px] font-mono text-[#8f95b2] bg-[#1e2030] px-1.5 py-0.5 rounded border border-[#1e2030] truncate max-w-[140px]">
                        {app.id.slice(0, 8)}…
                      </span>
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#8f95b2] mt-0.5">
                      <span className="truncate">{app.visaType}</span>
                      <span className="w-1 h-1 rounded-full bg-zinc-700 shrink-0" aria-hidden />
                      <span className="font-semibold text-slate-300">
                        {app.applicantType === "myself"
                          ? "Өөрөө"
                          : `${app.applicantRelation || "Ажилтан"}: ${app.applicantName}`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-end gap-2 shrink-0 w-full sm:w-auto">
                  <span className="text-xs font-mono text-slate-300">
                    {(app.embassyFee + app.serviceFee).toLocaleString()} ₮
                  </span>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const conf = getStatusConfig(app.status);
                      return (
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${conf.bg}`}
                        >
                          {conf.text}
                        </span>
                      );
                    })()}
                    {app.status === "payment_pending" && (
                      <button
                        type="button"
                        onClick={() =>
                          openQPayInvoice(app.id, app.embassyFee + app.serviceFee)
                        }
                        className="btn-primary text-[11px] py-1 px-3"
                      >
                        Төлөх
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div
                className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-[#1e2030] pl-2"
                role="list"
                aria-label="Явцын алхмууд"
              >
                {[
                  { title: "DAN", active: true },
                  { title: "ХУР", active: app.status !== "draft" },
                  { title: "Төлбөр", active: app.paymentStatus === "paid" },
                  {
                    title: "ЭСЯ",
                    active: app.status === "approved",
                    pulse: app.status === "submitted",
                  },
                ].map((step, idx) => (
                  <div key={idx} className="space-y-1" role="listitem">
                    <div
                      className={`h-1 rounded transition-all ${
                        step.pulse
                          ? "bg-[#0066ff] animate-pulse"
                          : step.active
                            ? "bg-[#10b981]"
                            : "bg-[#1e2030]"
                      }`}
                    />
                    <p
                      className={`text-[10px] font-bold ${
                        step.active || step.pulse ? "text-slate-200" : "text-[#8f95b2]"
                      }`}
                    >
                      {step.title}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </motion.div>
  );
}
