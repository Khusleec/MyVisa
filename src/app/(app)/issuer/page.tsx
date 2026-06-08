"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useVisaAppContext } from "../../../components/providers/VisaAppContext";
import PageHeader from "../../../components/ui/PageHeader";
import EmptyState from "../../../components/ui/EmptyState";
import { FileText } from "lucide-react";

export default function IssuerRoute() {
  const router = useRouter();
  const {
    userRole,
    applications,
    updateApplicationStatus,
    getDocumentUrl,
    getStatusConfig,
    startChatWithCompany,
  } = useVisaAppContext();

  // Redirect if not visa_issuer
  useEffect(() => {
    if (userRole && userRole !== "visa_issuer") {
      router.push("/dashboard");
    }
  }, [userRole, router]);

  const handleStartChat = async (appId: string, applicantName: string) => {
    const success = await startChatWithCompany(appId, applicantName);
    if (success) {
      router.push("/chat");
    }
  };

  const reviewApps = applications.filter(
    (a) => a.status !== "draft" && a.status !== "payment_pending"
  );

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="ЭСЯ-ны Шүүгчийн хянах хэсэг"
        description="Виз мэдүүлгийн материалыг хянах, зөвшөөрөх/татгалзах шийдвэр гаргах."
      />

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="premium-card p-5 space-y-1 bg-surface border border-line rounded-xl">
          <p className="text-xs text-muted font-mono uppercase tracking-wider">Шүүх мэдүүлгүүд</p>
          <p className="text-sm font-bold text-foreground">
            {applications.filter((a) => a.status === "submitted" || a.status === "khur_checked").length} мэдүүлэг
          </p>
          <p className="text-xs text-accent font-mono">Шийдвэрлэлт хүлээж буй</p>
        </div>
        <div className="premium-card p-5 space-y-1 bg-surface border border-line rounded-xl">
          <p className="text-xs text-muted font-mono uppercase tracking-wider">Зөвшөөрсөн</p>
          <p className="text-sm font-bold text-positive">
            {applications.filter((a) => a.status === "approved").length} мэдүүлэг
          </p>
          <p className="text-xs text-positive font-mono">Олгосон виз</p>
        </div>
        <div className="premium-card p-5 space-y-1 bg-surface border border-line rounded-xl">
          <p className="text-xs text-muted font-mono uppercase tracking-wider">Татгалзсан</p>
          <p className="text-sm font-bold text-negative">
            {applications.filter((a) => a.status === "rejected").length} мэдүүлэг
          </p>
          <p className="text-xs text-negative font-mono">Буцаасан материал</p>
        </div>
      </div>

      {/* Review Table */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted font-mono">
            Шүүгдэх хүлээгдэж буй мэдүүлгүүд ({applications.filter(a => a.status === 'submitted' || a.status === 'khur_checked').length})
          </h4>
        </div>

        {reviewApps.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Мэдүүлэг байхгүй"
            description="Шинээр ирсэн виз мэдүүлгийн материал одоогоор байхгүй байна."
          />
        ) : (
          <div className="premium-card overflow-hidden bg-surface border border-line rounded-xl text-xs">
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-elevated border-b border-line text-xs font-mono text-muted uppercase">
                    <th className="p-4">Мэдүүлэгч</th>
                    <th className="p-4">Улс / Виз</th>
                    <th className="p-4">Бичиг баримтууд</th>
                    <th className="p-4">Төлөв</th>
                    <th className="p-4 text-right">Үйлдэл</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/45">
                  {reviewApps.map((app) => {
                    const statusConfig = getStatusConfig(app.status);
                    return (
                      <tr key={app.id} className="hover:bg-overlay/20 transition-colors">
                        <td className="p-4 text-xs">
                          <div className="font-bold text-foreground text-xs">{app.applicantName}</div>
                          <div className="text-xs text-muted font-mono mt-0.5">{app.userRegister}</div>
                        </td>
                        <td className="p-4 text-xs">
                          <div className="font-semibold text-foreground text-xs">{app.country}</div>
                          <div className="text-xs text-muted mt-0.5">{app.visaType}</div>
                        </td>
                        <td className="p-4 space-y-1.5 text-xs">
                          {app.passportFile ? (
                            <button
                              type="button"
                              onClick={async () => {
                                const url = await getDocumentUrl(app.passportFile!);
                                if (url) window.open(url, '_blank');
                              }}
                              className="text-xs text-accent hover:underline block text-left cursor-pointer"
                            >
                              📄 Гадаад паспорт
                            </button>
                          ) : (
                            <span className="text-xs text-muted block">📄 Пасспорт байхгүй</span>
                          )}
                          {app.photoFile ? (
                            <button
                              type="button"
                              onClick={async () => {
                                const url = await getDocumentUrl(app.photoFile!);
                                if (url) window.open(url, '_blank');
                              }}
                              className="text-xs text-accent hover:underline block text-left cursor-pointer"
                            >
                              🖼 Цээж зураг
                            </button>
                          ) : (
                            <span className="text-xs text-muted block">🖼 Зураг байхгүй</span>
                          )}
                          {app.bankStatementFile ? (
                            <button
                              type="button"
                              onClick={async () => {
                                const url = await getDocumentUrl(app.bankStatementFile!);
                                if (url) window.open(url, '_blank');
                              }}
                              className="text-xs text-accent hover:underline block text-left cursor-pointer"
                            >
                              🏦 Дансны хуулга
                            </button>
                          ) : null}
                        </td>
                        <td className="p-4 text-xs">
                          <span className={`inline-flex px-2.5 py-0.5 rounded text-xs font-bold border ${statusConfig.bg}`}>
                            {statusConfig.text}
                          </span>
                        </td>
                        <td className="p-4 text-right text-xs">
                          <div className="flex justify-end gap-1.5">
                            {(app.status === 'submitted' || app.status === 'khur_checked') && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => updateApplicationStatus(app.id, 'approved')}
                                  className="px-2 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-400 text-xs font-bold rounded-lg transition-all cursor-pointer min-h-[36px]"
                                >
                                  Зөвшөөрөх
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateApplicationStatus(app.id, 'rejected')}
                                  className="px-2 py-1.5 bg-rose-500/20 hover:bg-rose-500/35 text-rose-400 text-xs font-bold rounded-lg transition-all cursor-pointer min-h-[36px]"
                                >
                                  Татгалзах
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() => handleStartChat(app.id, app.applicantName)}
                              className="px-2 py-1.5 bg-accent/20 hover:bg-accent/35 text-accent text-xs font-bold rounded-lg transition-all cursor-pointer min-h-[36px]"
                            >
                              Чатлах
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
