import React from "react";
import { Info, CreditCard, Check, CheckSquare, Square, FileText, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { VisaApplication, Employee } from "../types/visa";
import PageHeader from "./ui/PageHeader";
import EmptyState from "./ui/EmptyState";

interface DashboardProps {
  userRole: 'individual' | 'business_admin';
  userName: string;
  companyName: string;
  companyRegistration: string;
  companyIndustry: string;
  userPhone: string;
  employees: Employee[];
  applications: VisaApplication[];
  bulkSelectIds: string[];
  onBulkSelectToggle: (appId: string) => void;
  openBulkPaymentInvoice: () => void;
  openQPayInvoice: (appId: string, amount: number) => void;
  onStartEmployeeVisa: (employeeId: string) => void;
  onStartB2CVisa: (countryName: string, countryCode: string, embassyFee: number, serviceFee: number) => void;
  getStatusConfig: (status: VisaApplication['status']) => { text: string; bg: string; bar: string };
  isUserVerified: boolean;
  onOpenDanModal: () => void;
  onGoToApply?: () => void;
}

export default function Dashboard({
  userRole,
  userName,
  companyName,
  companyRegistration,
  companyIndustry,
  userPhone,
  employees,
  applications,
  bulkSelectIds,
  onBulkSelectToggle,
  openBulkPaymentInvoice,
  openQPayInvoice,
  onStartEmployeeVisa,
  onStartB2CVisa,
  getStatusConfig,
  isUserVerified,
  onOpenDanModal,
  onGoToApply,
}: DashboardProps) {
  
  const b2bApplications = applications.filter(a => a.applicantType === 'employee');
  const b2cApplications = applications.filter(a => a.applicantType !== 'employee');

  return (
    <motion.div 
      key="dashboard"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.15 }}
      className="space-y-6 max-w-5xl"
    >
      <PageHeader
        title={
          userRole === "business_admin"
            ? `Байгууллагын хянах хэсэг`
            : `Сайн байна уу, ${userName.split(" ").slice(-1)[0] || userName}?`
        }
        description={
          userRole === "business_admin"
            ? `${companyName} — ажилтны виз, нэгдсэн төлбөр, бүртгэл.`
            : "Визийн материалаа гэрээсээ бэлдэж, ЭСЯ руу шууд илгээнэ үү."
        }
        action={
          onGoToApply ? (
            <button type="button" onClick={onGoToApply} className="btn-primary">
              <Plus className="w-4 h-4" />
              Шинэ мэдүүлэг
            </button>
          ) : undefined
        }
      />

      {/* B2B Dynamic Banner Info Alert */}
      {userRole === 'business_admin' && (
        <div className="p-4 rounded-xl border border-accent/20 bg-accent/5 flex gap-3 text-xs leading-relaxed text-muted">
          <Info className="w-4.5 h-4.5 text-accent shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-foreground">Байгууллагын нэгдсэн нэхэмжлэх & цалин шалгалт</p>
            <p className="text-[11px] text-muted">
              Ажилчдын регистрээр ХУР-аар нийгмийн даатгал баталгаажуулж, бэлэн төлбөрүүдийг QPay нэгдсэн нэхэмжлэхээр төлнө.
            </p>
          </div>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {userRole === 'business_admin' ? (
          <>
            <div className="premium-card p-5 space-y-1 bg-surface border border-line rounded-xl">
              <p className="text-[10px] text-muted font-mono uppercase tracking-wider">Идэвхтэй Ажилчид</p>
              <p className="text-sm font-bold text-foreground">{employees.length} ажилтан</p>
              <p className="text-[10px] text-positive font-mono">
                {employees.filter((e) => e.danVerified).length} нь DAN баталгаажсан
              </p>
            </div>
            <div className="premium-card p-5 space-y-1 bg-surface border border-line rounded-xl">
              <p className="text-[10px] text-muted font-mono uppercase tracking-wider">Нэгдсэн Виз шийдвэрлэлт</p>
              <p className="text-sm font-bold text-foreground">
                {b2bApplications.length} мэдүүлэг
              </p>
              <p className="text-[10px] text-muted">
                Төлбөр хүлээгдэж буй:{" "}
                {b2bApplications.filter((a) => a.status === "payment_pending").length}
              </p>
            </div>
            <div className="premium-card p-5 space-y-1 bg-surface border border-line rounded-xl">
              <p className="text-[10px] text-muted font-mono uppercase tracking-wider">Байгууллагын РД</p>
              <p className="text-sm font-bold text-foreground">{companyRegistration}</p>
              <p className="text-[10px] text-accent font-mono">Industry: {companyIndustry}</p>
            </div>
          </>
        ) : (
          <>
            <div className="premium-card p-5 space-y-1.5 bg-surface border border-line rounded-xl flex flex-col justify-between">
              <div>
                <p className="text-[10px] text-muted font-mono uppercase tracking-wider">Биеийн Баталгаажуулалт</p>
                <p className="text-sm font-bold text-foreground">
                  {isUserVerified ? "DAN Холбогдсон" : "DAN Холбогдоогүй"}
                </p>
                <p className={`text-[10px] font-mono ${isUserVerified ? "text-positive" : "text-amber-500"}`}>
                  {isUserVerified ? "Нийгмийн даатгал идэвхтэй" : "Лавлагаа татах боломжгүй"}
                </p>
              </div>
              {!isUserVerified && (
                <button
                  type="button"
                  onClick={onOpenDanModal}
                  className="w-full mt-1.5 btn-primary text-[10px] py-1.5"
                >
                  DAN холбох
                </button>
              )}
            </div>
            <div className="premium-card p-5 space-y-1 bg-surface border border-line rounded-xl">
              <p className="text-[10px] text-muted font-mono uppercase tracking-wider">Миний мэдүүлгүүд</p>
              <p className="text-sm font-bold text-foreground">
                Нийт {b2cApplications.length} мэдүүлэг
              </p>
              <p className="text-[10px] text-muted">
                Гэр бүл: {b2cApplications.filter((a) => a.applicantType === "family").length}
              </p>
            </div>
            <div className="premium-card p-5 space-y-1 bg-surface border border-line rounded-xl">
              <p className="text-[10px] text-muted font-mono uppercase tracking-wider">Холбоо барих</p>
              <p className="text-sm font-bold text-foreground">Зурвас суваг идэвхтэй</p>
              <p className="text-[10px] text-accent font-mono">{userPhone}</p>
            </div>
          </>
        )}
      </div>

      {/* B2B Sections vs B2C Selection */}
      {userRole === 'business_admin' ? (
        <div className="space-y-6">
          {/* Employees Visa Applications Status Table */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted font-mono">Ажилчдын виз мэдүүлгийн түүх</h4>
              
              {/* Bulk pay button */}
              {bulkSelectIds.length > 0 && (
                <button 
                  onClick={openBulkPaymentInvoice}
                  className="px-3.5 py-1.5 rounded-lg bg-accent text-white text-xs font-bold hover:bg-opacity-95 transition-all flex items-center gap-1.5 shadow"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Сонгосон төлбөрийг хамт төлөх ({bulkSelectIds.length})
                </button>
              )}
            </div>
            
            {b2bApplications.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="Ажилчдын виз байхгүй"
                description="Эхлээд ажилтанд виз мэдүүлэг үүсгэж, төлбөр болон явцыг энд хянана."
                action={
                  onGoToApply ? (
                    <button type="button" onClick={onGoToApply} className="btn-primary">
                      Виз мэдүүлэх
                    </button>
                  ) : undefined
                }
              />
            ) : (
            <div className="premium-card overflow-hidden bg-surface border border-line rounded-xl">
              <div className="overflow-x-auto text-[12px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-elevated border-b border-line text-[10px] font-mono text-muted uppercase">
                      <th className="p-4 w-10">
                        <span className="sr-only">Сонгох</span>
                      </th>
                      <th className="p-4 font-semibold">Ажилтан</th>
                      <th className="p-4 font-semibold">Улс / Ангилал</th>
                      <th className="p-4 font-semibold">РД</th>
                      <th className="p-4 font-semibold">Төлбөр</th>
                      <th className="p-4 font-semibold">Явцын статус</th>
                      <th className="p-4 font-semibold text-right">Үйлдэл</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {b2bApplications.map((app) => (
                      <tr key={app.id} className="hover:bg-elevated/50 transition-colors">
                        <td className="p-4">
                          {app.paymentStatus === 'unpaid' ? (
                            <button 
                              onClick={() => onBulkSelectToggle(app.id)}
                              className="text-slate-400 hover:text-foreground"
                            >
                              {bulkSelectIds.includes(app.id) ? (
                                <CheckSquare className="w-4 h-4 text-accent" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>
                          ) : (
                            <Check className="w-4 h-4 text-positive mx-auto" />
                          )}
                        </td>
                        <td className="p-4 font-bold text-foreground">{app.applicantName}</td>
                        <td className="p-4">
                          <span className="font-semibold text-foreground">{app.country}</span>
                          <p className="text-[10px] text-muted">{app.visaType}</p>
                        </td>
                        <td className="p-4 font-mono text-muted">{app.userRegister}</td>
                        <td className="p-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            app.paymentStatus === 'paid' ? 'bg-positive/15 text-positive' : 'bg-amber-500/10 text-amber-500'
                          }`}>
                            {app.paymentStatus === 'paid' ? 'Төлөгдсөн' : 'Нэхэмжлэх гарсан'}
                          </span>
                        </td>
                        <td className="p-4">
                          {(() => {
                            const conf = getStatusConfig(app.status);
                            return (
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold border ${conf.bg}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${conf.bar}`}></span>
                                {conf.text}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="p-4 text-right">
                          {app.paymentStatus === 'unpaid' && (
                            <button 
                              onClick={() => openQPayInvoice(app.id, app.embassyFee + app.serviceFee)}
                              className="text-xs font-semibold text-white bg-accent hover:bg-opacity-95 px-2.5 py-1 rounded transition-all"
                            >
                              Төлөх
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            )}
          </div>

          {/* Company Staff list section */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted font-mono">Ажилчдын бүртгэл</h4>
            <div className="premium-card overflow-hidden bg-surface border border-line rounded-xl">
              <div className="overflow-x-auto text-[12px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-elevated border-b border-line text-[10px] font-mono text-muted uppercase">
                      <th className="p-4">ID</th>
                      <th className="p-4">Нэр</th>
                      <th className="p-4">РД</th>
                      <th className="p-4">Албан тушаал</th>
                      <th className="p-4">DAN систем</th>
                      <th className="p-4 text-right">Виз үүсгэх</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {employees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-elevated/50">
                        <td className="p-4 font-mono text-muted">{emp.id}</td>
                        <td className="p-4 font-bold text-foreground">{emp.name}</td>
                        <td className="p-4 font-mono text-foreground">{emp.registerNo}</td>
                        <td className="p-4 text-muted">{emp.position}</td>
                        <td className="p-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            emp.danVerified ? 'bg-positive/15 text-positive' : 'bg-zinc-800 text-muted'
                          }`}>
                            {emp.danVerified ? 'Баталгаажсан' : 'Холболтгүй'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => onStartEmployeeVisa(emp.id)}
                            className="text-xs font-semibold text-accent hover:text-white border border-accent/20 hover:bg-accent px-2.5 py-1 rounded transition-all"
                          >
                            Виз эхлүүлэх
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* B2C Available Visas list */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted font-mono">Боломжит виз мэдүүлгүүд</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { name: "Өмнөд Солонгос", code: "KR", eFee: 110000, sFee: 40000, desc: "C-3-9 аялал жуулчлалын ангилал. НД шимтгэл 6+ сар төлсөн байх шаардлагатай." },
                { name: "Япон Улс", code: "JP", eFee: 50000, sFee: 30000, desc: "Богино хугацааны жуулчин. Хэвлэмэл бус QR-тай дансны хуулга шаардлагатай." },
                { name: "Герман (Шенген)", code: "DE", eFee: 290000, sFee: 50000, desc: "Шенгений жуулчны виз. Биометрик хурууны хээгээ биеэр өгнө." }
              ].map((visa) => (
                <div 
                  key={visa.code}
                  className="premium-card p-5 flex flex-col justify-between h-64 hover:border-zinc-700 transition-all bg-surface border border-line rounded-xl"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-[10px] font-bold text-foreground bg-line px-2 py-0.5 rounded">{visa.code}</span>
                      <span className="text-[10px] text-positive font-bold">ХУР холбогдсон</span>
                    </div>
                    <h5 className="text-sm font-bold text-foreground">{visa.name}</h5>
                    <p className="text-[11px] text-muted leading-relaxed">{visa.desc}</p>
                  </div>

                  <div className="border-t border-line pt-4 mt-2 space-y-3">
                    <div className="flex justify-between text-[11px] font-mono text-muted">
                      <span>ЭСЯ хураамж:</span>
                      <span className="text-foreground">{visa.eFee.toLocaleString()} ₮</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-mono text-muted">
                      <span>Үйлчилгээ:</span>
                      <span className="text-foreground">{visa.sFee.toLocaleString()} ₮</span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-xs font-bold font-mono text-foreground">{(visa.eFee + visa.sFee).toLocaleString()} ₮</span>
                      <button 
                        onClick={() => onStartB2CVisa(visa.name, visa.code, visa.eFee, visa.sFee)}
                        className="text-xs font-bold text-white bg-accent hover:bg-opacity-95 px-3 py-1.5 rounded transition-all"
                      >
                        Мэдүүлэх
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* B2C Visa Tracking History */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted font-mono">Миний виз мэдүүлгийн түүх</h4>
            <div className="space-y-3">
              {b2cApplications.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="Виз мэдүүлэг байхгүй"
                  description="Доорх улсаас сонгож эхний мэдүүлгээ эхлүүлнэ үү."
                />
              ) : null}
              {b2cApplications.map((app) => (
                <div key={app.id} className="premium-card p-5 space-y-4 bg-surface border border-line rounded-xl">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h5 className="text-sm font-bold text-foreground flex items-center gap-2">
                        {app.country}
                        <span className="text-[10px] font-normal text-muted">({app.applicantType === 'myself' ? 'Өөрийн мэдүүлэг' : `${app.applicantRelation}: ${app.applicantName}`})</span>
                      </h5>
                      <p className="text-[11px] text-muted mt-0.5">{app.visaType} • ID: {app.id}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {(() => {
                        const conf = getStatusConfig(app.status);
                        return (
                          <span className={`px-2.5 py-0.5 rounded text-[10.5px] font-bold border ${conf.bg}`}>
                            {conf.text}
                          </span>
                        );
                      })()}
                      {app.status === 'payment_pending' && (
                        <button 
                          onClick={() => openQPayInvoice(app.id, app.embassyFee + app.serviceFee)}
                          className="px-3 py-1 rounded bg-accent hover:bg-opacity-95 text-white text-[11px] font-bold transition-all shadow"
                        >
                          Төлөх
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-line">
                    {[
                      { label: "Бүртгэл", active: true },
                      { label: "Төрийн лавлагаа", active: app.status !== 'draft' },
                      { label: "Төлбөр төлөлт", active: app.paymentStatus === 'paid' },
                      { label: "ЭСЯ хяналт", active: app.status === 'approved', pulse: app.status === 'submitted' }
                    ].map((s, i) => (
                      <div key={i} className="space-y-1">
                        <div className={`h-1 rounded ${s.pulse ? 'bg-accent animate-pulse' : s.active ? 'bg-positive' : 'bg-line'}`}></div>
                        <span className="text-[10px] font-bold text-foreground block">{s.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
