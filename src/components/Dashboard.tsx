import React from "react";
import { 
  Info, CreditCard, Check, CheckSquare, Square, FileText, Plus, 
  Building2, Phone, MapPin, CheckCircle, Globe,
  Zap, Wifi, Coins, Compass, Apple, Shield, LucideIcon,
  ArrowLeft, MessageSquare, ChevronRight, X, RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { VisaApplication, Employee, EmployeeInvite } from "../types/visa";
import PageHeader from "./ui/PageHeader";
import EmptyState from "./ui/EmptyState";

interface DashboardProps {
  userRole: 'individual' | 'business_admin' | 'visa_issuer';
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
  onStartB2CVisa: (countryName: string, countryCode: string, embassyFee: number, serviceFee: number, companyId?: string) => void;
  getStatusConfig: (status: VisaApplication['status']) => { text: string; bg: string; bar: string };
  isUserVerified: boolean;
  onOpenDanModal: () => void;
  onGoToApply?: () => void;
  onUpdateApplicationStatus?: (appId: string, newStatus: VisaApplication['status']) => Promise<void>;
  onGetDocumentUrl?: (path: string) => Promise<string | null>;
  pendingInvites?: EmployeeInvite[];
  onInviteEmployee?: (name: string, email: string, registerNo: string, position: string) => Promise<void>;
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
  pendingInvites = [],
  onInviteEmployee,
  onUpdateApplicationStatus,
  onGetDocumentUrl,
}: DashboardProps) {
  
  const [isInviteModalOpen, setIsInviteModalOpen] = React.useState(false);
  const [inviteName, setInviteName] = React.useState("");
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteRegisterNo, setInviteRegisterNo] = React.useState("");
  const [invitePosition, setInvitePosition] = React.useState("");
  const [inviting, setInviting] = React.useState(false);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail || !inviteRegisterNo || !invitePosition) return;
    setInviting(true);
    try {
      if (onInviteEmployee) {
        await onInviteEmployee(inviteName, inviteEmail, inviteRegisterNo, invitePosition);
        setIsInviteModalOpen(false);
        setInviteName("");
        setInviteEmail("");
        setInviteRegisterNo("");
        setInvitePosition("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setInviting(false);
    }
  };

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
          userRole === "visa_issuer"
            ? "ЭСЯ-ны Шүүгчийн хянах хэсэг"
            : userRole === "business_admin"
            ? `Байгууллагын хянах хэсэг`
            : `Сайн байна уу, ${userName.split(" ").slice(-1)[0] || userName}?`
        }
        description={
          userRole === "visa_issuer"
            ? "Виз мэдүүлгийн материалыг хянах, зөвшөөрөх/татгалзах шийдвэр гаргах."
            : userRole === "business_admin"
            ? `${companyName} — ажилтны виз, нэгдсэн төлбөр, бүртгэл.`
            : "Визийн материалаа гэрээсээ бэлдэж, ЭСЯ руу шууд илгээнэ үү."
        }
        action={
          onGoToApply && userRole !== 'visa_issuer' ? (
            <button type="button" onClick={onGoToApply} className="btn-primary">
              <Plus className="w-4 h-4" />
              Шинэ мэдүүлэг
            </button>
          ) : undefined
        }
      />

      {/* B2B Dynamic Banner Info Alert */}
      {userRole === 'business_admin' && (
        <div className="p-4 rounded-xl border border-accent/20 bg-accent/5 flex gap-3 text-xs leading-relaxed text-muted animate-in fade-in duration-200">
          <Info className="w-4.5 h-4.5 text-accent shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-foreground">Байгууллагын нэгдсэн нэхэмжлэх & цалин шалгалт</p>
            <p className="text-xs text-muted">
              Ажилчдын регистрээр ХУР-аар нийгмийн даатгал баталгаажуулж, бэлэн төлбөрүүдийг QPay нэгдсэн нэхэмжлэхээр төлнө.
            </p>
          </div>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {userRole === 'visa_issuer' ? (
          <></>
        ) : userRole === 'business_admin' ? (
          <>
            <div className="premium-card p-5 space-y-1 bg-surface border border-line rounded-xl">
              <p className="text-xs text-muted font-mono uppercase tracking-wider">Идэвхтэй Ажилчид</p>
              <p className="text-sm font-bold text-foreground">{employees.length} ажилтан</p>
              <p className="text-xs text-positive font-mono">
                {employees.filter((e) => e.danVerified).length} нь DAN баталгаажсан
              </p>
            </div>
            <div className="premium-card p-5 space-y-1 bg-surface border border-line rounded-xl">
              <p className="text-xs text-muted font-mono uppercase tracking-wider">Нэгдсэн Виз шийдвэрлэлт</p>
              <p className="text-sm font-bold text-foreground">
                {b2bApplications.length} мэдүүлэг
              </p>
              <p className="text-xs text-muted">
                Төлбөр хүлээгдэж буй:{" "}
                {b2bApplications.filter((a) => a.status === "payment_pending").length}
              </p>
            </div>
            <div className="premium-card p-5 space-y-1 bg-surface border border-line rounded-xl">
              <p className="text-xs text-muted font-mono uppercase tracking-wider">Байгууллагын РД</p>
              <p className="text-sm font-bold text-foreground">{companyRegistration}</p>
              <p className="text-xs text-accent font-mono">Бизнес: {companyIndustry}</p>
            </div>
          </>
        ) : (
          <>
            <div className="premium-card p-5 space-y-1.5 bg-surface border border-line rounded-xl flex flex-col justify-between">
              <div>
                <p className="text-xs text-muted font-mono uppercase tracking-wider">Биеийн Баталгаажуулалт</p>
                <p className={`text-sm font-bold text-foreground ${!isUserVerified ? "animate-pulse" : ""}`}>
                  {isUserVerified ? "DAN Холбогдсон" : "DAN Холбогдоогүй"}
                </p>
                <p className={`text-xs font-mono ${isUserVerified ? "text-positive" : "text-amber-500"}`}>
                  {isUserVerified ? "Нийгмийн даатгал идэвхтэй" : "Лавлагаа татах боломжгүй"}
                </p>
              </div>
              {!isUserVerified && (
                <button
                  type="button"
                  onClick={onOpenDanModal}
                  className="w-full mt-1.5 btn-primary text-xs py-1.5 min-h-[36px]"
                >
                  DAN холбох
                </button>
              )}
            </div>
            <div className="premium-card p-5 space-y-1 bg-surface border border-line rounded-xl">
              <p className="text-xs text-muted font-mono uppercase tracking-wider">Миний мэдүүлгүүд</p>
              <p className="text-sm font-bold text-foreground">
                Нийт {b2cApplications.length} мэдүүлэг
              </p>
              <p className="text-xs text-muted">
                Гэр бүл: {b2cApplications.filter((a) => a.applicantType === "family").length}
              </p>
            </div>
            <div className="premium-card p-5 space-y-1 bg-surface border border-line rounded-xl">
              <p className="text-xs text-muted font-mono uppercase tracking-wider">Холбоо барих</p>
              <p className="text-sm font-bold text-foreground">Зурвас суваг идэвхтэй</p>
              <p className="text-xs text-accent font-mono">{userPhone}</p>
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
                  className="px-3.5 py-1.5 rounded-lg bg-accent text-white text-xs font-bold hover:bg-opacity-95 transition-all flex items-center gap-1.5 shadow min-h-[36px]"
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
                    <button type="button" onClick={onGoToApply} className="btn-primary min-h-[36px]">
                      Виз мэдүүлэх
                    </button>
                  ) : undefined
                }
              />
            ) : (
            <div className="premium-card overflow-hidden bg-surface border border-line rounded-xl">
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-elevated border-b border-line text-xs font-mono text-muted uppercase">
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
                  <tbody className="divide-y divide-line text-xs">
                    {b2bApplications.map((app) => (
                      <tr key={app.id} className="hover:bg-elevated/50 transition-colors text-xs">
                        <td className="p-4">
                          {app.paymentStatus === 'unpaid' ? (
                            <button 
                              onClick={() => onBulkSelectToggle(app.id)}
                              className="text-slate-400 hover:text-foreground flex items-center justify-center"
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
                        <td className="p-4 font-bold text-foreground text-xs">{app.applicantName}</td>
                        <td className="p-4 text-xs">
                          <span className="font-semibold text-foreground text-xs">{app.country}</span>
                          <p className="text-xs text-muted mt-0.5">{app.visaType}</p>
                        </td>
                        <td className="p-4 font-mono text-muted text-xs">{app.userRegister}</td>
                        <td className="p-4 text-xs">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                            app.paymentStatus === 'paid' ? 'bg-positive/15 text-positive' : 'bg-amber-500/10 text-amber-500'
                          }`}>
                            {app.paymentStatus === 'paid' ? 'Төлөгдсөн' : 'Нэхэмжлэх гарсан'}
                          </span>
                        </td>
                        <td className="p-4 text-xs">
                          {(() => {
                            const conf = getStatusConfig(app.status);
                            return (
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold border ${conf.bg}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${conf.bar}`}></span>
                                {conf.text}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="p-4 text-right text-xs">
                          {app.paymentStatus === 'unpaid' && (
                            <button 
                              onClick={() => openQPayInvoice(app.id, app.embassyFee + app.serviceFee)}
                              className="text-xs font-semibold text-white bg-accent hover:bg-opacity-95 px-2.5 py-1.5 rounded transition-all min-h-[36px]"
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
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted font-mono">Ажилчдын бүртгэл</h4>
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(true)}
                className="btn-primary flex items-center gap-1.5 px-3 py-1.5 text-xs cursor-pointer min-h-[36px]"
              >
                <Plus className="w-3.5 h-3.5" />
                Ажилтан урих
              </button>
            </div>

            {employees.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted border border-dashed border-line rounded-xl bg-surface/30">
                Бүртгэлтэй ажилтан байхгүй байна. &quot;Ажилтан урих&quot; товчийг дарж ажилтан нэмнэ үү.
              </div>
            ) : (
              <div className="premium-card overflow-hidden bg-surface border border-line rounded-xl text-xs">
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-elevated border-b border-line text-xs font-mono text-muted uppercase">
                        <th className="p-4">Нэр</th>
                        <th className="p-4">РД</th>
                        <th className="p-4">Албан тушаал</th>
                        <th className="p-4">DAN систем</th>
                        <th className="p-4 text-right">Виз үүсгэх</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line text-xs">
                      {employees.map((emp) => (
                        <tr key={emp.id} className="hover:bg-elevated/50 text-xs">
                          <td className="p-4 font-bold text-foreground text-xs">{emp.name}</td>
                          <td className="p-4 font-mono text-foreground text-xs">{emp.registerNo}</td>
                          <td className="p-4 text-muted text-xs">{emp.position}</td>
                          <td className="p-4 text-xs">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                              emp.danVerified ? 'bg-positive/15 text-positive' : 'bg-zinc-800 text-muted'
                            }`}>
                              {emp.danVerified ? 'Баталгаажсан' : 'Холболтгүй'}
                            </span>
                          </td>
                          <td className="p-4 text-right text-xs">
                            <button 
                              onClick={() => onStartEmployeeVisa(emp.id)}
                              className="text-xs font-semibold text-accent hover:text-white border border-accent/20 hover:bg-accent px-2.5 py-1.5 rounded transition-all cursor-pointer min-h-[36px]"
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
            )}

            {/* Pending Invites list */}
            {pendingInvites && pendingInvites.length > 0 && (
              <div className="space-y-2 pt-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-muted font-mono">Хүлээгдэж буй урилгууд ({pendingInvites.length})</h5>
                <div className="premium-card overflow-hidden bg-surface border border-line rounded-xl text-xs">
                  <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-elevated border-b border-line text-xs font-mono text-muted uppercase">
                          <th className="p-3">Нэр</th>
                          <th className="p-3">И-мэйл</th>
                          <th className="p-3">РД</th>
                          <th className="p-3">Албан тушаал</th>
                          <th className="p-3 text-right">Төлөв</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line text-xs">
                        {pendingInvites.map((inv) => (
                          <tr key={inv.id} className="hover:bg-elevated/40 text-xs">
                            <td className="p-3 font-semibold text-foreground text-xs">{inv.name}</td>
                            <td className="p-3 text-muted text-xs">{inv.email}</td>
                            <td className="p-3 font-mono text-muted text-xs">{inv.register_no}</td>
                            <td className="p-3 text-muted text-xs">{inv.position}</td>
                            <td className="p-3 text-right text-xs">
                              <span className="text-xs font-bold px-2 py-0.5 rounded bg-zinc-800 text-muted">
                                Уригдсан
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Invite Employee Modal */}
          {isInviteModalOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
              onClick={(e) => { if (e.target === e.currentTarget) setIsInviteModalOpen(false); }}
            >
              <div
                className="w-full max-w-md p-6 rounded-2xl shadow-2xl space-y-4"
                style={{ background: "var(--bg-card)", border: "1px solid var(--color-border)" }}
              >
                <div className="flex justify-between items-center pb-2 border-b border-line">
                  <h3 className="text-sm font-bold text-foreground">Шинэ ажилтан урих</h3>
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="p-1 rounded hover:bg-overlay text-muted hover:text-foreground cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleInviteSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs text-muted font-mono uppercase tracking-wider block">Бүтэн Нэр</label>
                    <input
                      type="text"
                      required
                      placeholder="Бат-Эрдэнэ Болд"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      className="input-field min-h-[40px]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-muted font-mono uppercase tracking-wider block">И-мэйл хаяг</label>
                    <input
                      type="email"
                      required
                      placeholder="employee@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="input-field min-h-[40px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-muted font-mono uppercase tracking-wider block">Регистрийн №</label>
                      <input
                        type="text"
                        required
                        placeholder="УУ94021512"
                        maxLength={10}
                        value={inviteRegisterNo}
                        onChange={(e) => setInviteRegisterNo(e.target.value)}
                        className="w-full bg-surface border border-line hover:border-muted focus:border-accent rounded-xl px-3 py-2 text-xs font-mono text-foreground focus:outline-none transition-all min-h-[40px]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted font-mono uppercase tracking-wider block">Албан тушаал</label>
                      <input
                        type="text"
                        required
                        placeholder="Ахлах Инженер"
                        value={invitePosition}
                        onChange={(e) => setInvitePosition(e.target.value)}
                        className="input-field min-h-[40px]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={inviting}
                    className="w-full py-2 bg-accent hover:bg-opacity-95 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow disabled:opacity-50 mt-4 cursor-pointer min-h-[40px]"
                  >
                    {inviting ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span>Урилга илгээх</span>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      ) : userRole === 'visa_issuer' ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Issuer CTA Section */}
          <div className="premium-card p-6 md:p-8 bg-surface border border-line rounded-xl text-center space-y-4 relative overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent/5 blur-[100px] pointer-events-none"></div>
            <h3 className="text-base font-bold text-foreground">ЭСЯ-ны Шүүх Хэсэг</h3>
            <p className="text-xs text-muted max-w-lg mx-auto leading-relaxed">
              Шинээр ирсэн визний мэдүүлгийн материалуудыг хянаж шийдвэрлэх, зөвшөөрөх болон татгалзах үйлдлүүдийг хийнэ үү.
            </p>
            <Link
              href="/issuer"
              className="btn-primary min-h-[44px] px-8 text-xs font-bold cursor-pointer shadow-md inline-flex items-center justify-center gap-2 max-w-xs mx-auto text-white"
            >
              Виз хянах хэсэг рүү очих
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* B2C Hero CTA Section */}
          <div className="premium-card p-6 md:p-8 bg-surface border border-line rounded-xl text-center space-y-4 relative overflow-hidden animate-in fade-in duration-200">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent/5 blur-[100px] pointer-events-none"></div>
            <h3 className="text-base font-bold text-foreground">Цахим виз мэдүүлэг эхлүүлэх</h3>
            <p className="text-xs text-muted max-w-lg mx-auto leading-relaxed">
              БНСУ, Япон, Герман, Австрали улсын визний мэдүүлгийг ДАН баталгаажуулалт, ХУР системийн төрийн лавлагаатайгаар хялбар мэдүүлнэ үү.
            </p>
            <button
              type="button"
              onClick={onGoToApply}
              className="btn-primary min-h-[44px] px-8 text-xs font-bold cursor-pointer shadow-md inline-flex items-center gap-2 mx-auto justify-center"
            >
              <Plus className="w-4.5 h-4.5" />
              Шинэ виз мэдүүлэх
            </button>
          </div>

          {/* B2C Visa Tracking History */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted font-mono">Миний виз мэдүүлгийн түүх</h4>
            <div className="space-y-3">
              {b2cApplications.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="Виз мэдүүлэг байхгүй"
                  description="Дээрх 'Шинэ виз мэдүүлэх' товч дээр дарж эхний мэдүүлгээ эхлүүлнэ үү."
                />
              ) : null}
              {b2cApplications.map((app) => (
                <div key={app.id} className="premium-card p-5 space-y-4 bg-surface border border-line rounded-xl">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h5 className="text-sm font-bold text-foreground flex items-center gap-2">
                        {app.country}
                        <span className="text-xs font-normal text-muted">({app.applicantType === 'myself' ? 'Өөрийн мэдүүлэг' : `${app.applicantRelation}: ${app.applicantName}`})</span>
                      </h5>
                      <p className="text-xs text-muted mt-0.5">{app.visaType} • ID: {app.id}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {(() => {
                        const conf = getStatusConfig(app.status);
                        return (
                          <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${conf.bg}`}>
                            {conf.text}
                          </span>
                        );
                      })()}
                      {app.status === 'payment_pending' && (
                        <button 
                          onClick={() => openQPayInvoice(app.id, app.embassyFee + app.serviceFee)}
                          className="px-3 py-1.5 rounded bg-accent hover:bg-opacity-95 text-white text-xs font-bold transition-all shadow cursor-pointer min-h-[36px]"
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
                        <span className="text-xs font-bold text-foreground block">{s.label}</span>
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
