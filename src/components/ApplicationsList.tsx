import React from "react";
import { motion } from "framer-motion";
import { FileText, Plus, CreditCard } from "lucide-react";
import { VisaApplication } from "../types/visa";
import PageHeader from "./ui/PageHeader";
import EmptyState from "./ui/EmptyState";
import StatusBadge from "./ui/StatusBadge";
import ProgressStepper from "./ui/ProgressStepper";

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
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="space-y-4 sm:space-y-6 max-w-4xl w-full min-w-0"
    >
      <PageHeader
        eyebrow={userRole === "business_admin" ? "Байгууллага" : "Хувь хүн"}
        title={
          userRole === "business_admin"
            ? "Ажилчдын визүүд"
            : "Миний хүсэлтүүд"
        }
        description={
          userRole === "business_admin"
            ? "Байгууллагын ажилчдын нэр дээрх бүх виз мэдүүлгийн явц."
            : "ЭСЯ-д илгээсэн болон төлбөр төлөх шаардлагатай мэдүүлгүүд."
        }
        action={
          onGoToApply ? (
            <button type="button" onClick={onGoToApply} className="btn-primary w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              Шинэ мэдүүлэг
            </button>
          ) : undefined
        }
      />

      {filteredApps.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Мэдүүлэг олдсонгүй"
          description="Одоогоор хадгалагдсан виз мэдүүлэг байхгүй. Шинэ мэдүүлэг үүсгэж эхлээрэй."
          action={
            onGoToApply ? (
              <button type="button" onClick={onGoToApply} className="btn-primary">
                Виз мэдүүлэх
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app, index) => {
            const conf = getStatusConfig(app.status);
            const totalFee = app.embassyFee + app.serviceFee;

            return (
              <motion.article
                key={app.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: 0.25 }}
                className="premium-card premium-card--interactive p-4 sm:p-6 space-y-4 sm:space-y-5 relative overflow-hidden bg-surface border border-line rounded-2xl min-w-0"
              >
                <div
                  className={`absolute top-0 bottom-0 left-0 w-1 ${conf.bar}`}
                  aria-hidden
                />

                <div className="flex flex-col lg:flex-row justify-between items-start gap-5 pl-2">
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div
                      className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center font-bold text-sm text-accent border border-accent/20 shrink-0"
                      aria-hidden
                    >
                      {app.countryCode}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-bold text-foreground">
                          {app.country}
                        </h4>
                        <StatusBadge text={conf.text} className={conf.bg} />
                      </div>
                      <p className="text-sm text-muted">{app.visaType}</p>
                      <p className="text-sm text-foreground/90">
                        {app.applicantType === "myself"
                          ? "Өөрөө"
                          : `${app.applicantRelation || "Ажилтан"}: ${app.applicantName}`}
                      </p>
                      <p className="text-[11px] font-mono text-muted">
                        #{app.id.slice(0, 8)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-3 w-full lg:w-auto shrink-0 pl-2 lg:pl-0">
                    <div className="text-left lg:text-right">
                      <p className="text-[11px] uppercase tracking-wider text-muted font-semibold">Нийт төлбөр</p>
                      <p className="text-lg font-bold text-foreground font-mono">
                        {totalFee.toLocaleString()} ₮
                      </p>
                    </div>
                    {app.status === "payment_pending" && (
                      <button
                        type="button"
                        onClick={() => openQPayInvoice(app.id, totalFee)}
                        className="btn-primary text-sm py-2 px-4"
                      >
                        <CreditCard className="w-4 h-4" />
                        Төлөх
                      </button>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-line pl-2">
                  <ProgressStepper
                    steps={[
                      { title: "DAN", active: true, complete: true },
                      {
                        title: "ХУР",
                        active: app.status !== "draft",
                        complete: app.status !== "draft",
                      },
                      {
                        title: "Төлбөр",
                        active: app.paymentStatus === "paid",
                        complete: app.paymentStatus === "paid",
                        pulse: app.status === "payment_pending",
                      },
                      {
                        title: "ЭСЯ",
                        active: app.status === "approved" || app.status === "rejected",
                        complete: app.status === "approved",
                        pulse: app.status === "submitted" || app.status === "khur_checked",
                      },
                    ]}
                  />
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
