import React from "react";
import { 
  Info, CreditCard, Check, CheckSquare, Square, FileText, Plus, 
  Building2, Phone, MapPin, CheckCircle, Globe,
  Zap, Wifi, Coins, Compass, Apple, Shield, LucideIcon,
  ArrowLeft, MessageSquare, ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { VisaApplication, Employee } from "../types/visa";
import PageHeader from "./ui/PageHeader";
import EmptyState from "./ui/EmptyState";

const companyLogos: Record<string, LucideIcon> = {
  'c0000000-0000-0000-0000-000000000001': Zap,       // Терасофт
  'c0000000-0000-0000-0000-000000000002': Wifi,      // Солонго
  'c0000000-0000-0000-0000-000000000003': Coins,     // Ази Капитал
  'c0000000-0000-0000-0000-000000000004': Compass,   // Номад
  'c0000000-0000-0000-0000-000000000005': Apple,     // Эрдэнэт Хүнс
  'c0000000-0000-0000-0000-000000000006': Shield,    // Мөнх Групп
};

const getLogoIcon = (companyId: string): LucideIcon => {
  const icons = [Zap, Wifi, Coins, Compass, Apple, Shield];
  if (!companyId) return Building2;
  
  let hash = 0;
  for (let i = 0; i < companyId.length; i++) {
    hash = (hash << 5) - hash + companyId.charCodeAt(i);
    hash |= 0;
  }
  hash = Math.abs(hash);
  return companyLogos[companyId] || icons[hash % icons.length] || Building2;
};

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
  onStartB2CVisa: (countryName: string, countryCode: string, embassyFee: number, serviceFee: number, companyId?: string) => void;
  getStatusConfig: (status: VisaApplication['status']) => { text: string; bg: string; bar: string };
  isUserVerified: boolean;
  onOpenDanModal: () => void;
  onGoToApply?: () => void;
  companiesList?: { id: string; name: string; registration_no: string; allowed_countries: string[]; phone?: string; address?: string; advantages?: string[] }[];
  onStartChatWithCompany?: (companyId: string, companyName: string) => Promise<boolean>;
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
  companiesList = [],
  onStartChatWithCompany,
}: DashboardProps) {
  
  const [selectedCompanyDetailId, setSelectedCompanyDetailId] = React.useState<string | null>(null);
  
  const b2bApplications = applications.filter(a => a.applicantType === 'employee');
  const b2cApplications = applications.filter(a => a.applicantType !== 'employee');

  const selectedCompany = companiesList.find(c => c.id === selectedCompanyDetailId);

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
      ) : selectedCompany ? (
        <motion.div 
          key="company-detail"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.15 }}
          className="space-y-6"
        >
          {/* Back Button */}
          <button
            onClick={() => setSelectedCompanyDetailId(null)}
            className="flex items-center gap-2 text-xs font-bold text-muted hover:text-foreground transition-colors py-2 group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Байгууллагуудын жагсаалт руу буцах</span>
          </button>

          {/* Detail Card */}
          <div className="premium-card p-6 md:p-8 bg-surface border border-line rounded-2xl relative overflow-hidden space-y-6">
            {/* Logo Watermark inside detail */}
            <div className="absolute right-6 top-6 text-accent/5 pointer-events-none transform rotate-12 shrink-0">
              {(() => {
                const SelectedLogo = getLogoIcon(selectedCompany.id);
                return <SelectedLogo className="w-48 h-48 md:w-64 md:h-64" />;
              })()}
            </div>

            <div className="relative z-10 space-y-6">
              {/* Header info */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-line pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-foreground">{selectedCompany.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono text-muted uppercase tracking-wider bg-elevated px-2.5 py-0.5 rounded border border-line">РД: {selectedCompany.registration_no}</span>
                      <span className="text-[10px] font-bold text-positive bg-positive/10 border border-positive/20 px-2 py-0.5 rounded">Идэвхтэй түнш</span>
                    </div>
                  </div>
                </div>

                {/* Chat action */}
                <button
                  type="button"
                  onClick={() => onStartChatWithCompany?.(selectedCompany.id, selectedCompany.name)}
                  className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold shadow-md shadow-accent/10 hover:shadow-accent/20 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Зурвас холбоо эхлүүлэх</span>
                </button>
              </div>

              {/* Description & Advantages */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted font-mono mb-2.5">Байгууллагын давуу талууд</h4>
                    {selectedCompany.advantages && selectedCompany.advantages.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedCompany.advantages.map((adv, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-elevated/40 border border-line">
                            <CheckCircle className="w-4.5 h-4.5 text-positive shrink-0 mt-0.5" />
                            <span className="text-xs font-medium text-foreground">{adv}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted">Давуу тал бүртгэгдээгүй байна.</p>
                    )}
                  </div>
                </div>

                {/* Contact info */}
                <div className="space-y-4 bg-elevated/20 p-5 rounded-xl border border-line/60">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted font-mono">Холбоо барих мэдээлэл</h4>
                  <div className="space-y-3.5 text-xs">
                    {selectedCompany.phone && (
                      <div className="space-y-1">
                        <span className="text-muted block text-[10px] uppercase font-mono tracking-wider">Утасны дугаар</span>
                        <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                          <Phone className="w-4 h-4 text-accent shrink-0" />
                          <span>{selectedCompany.phone}</span>
                        </div>
                      </div>
                    )}
                    {selectedCompany.address && (
                      <div className="space-y-1">
                        <span className="text-muted block text-[10px] uppercase font-mono tracking-wider">Хаяг байршил</span>
                        <div className="flex items-start gap-2 text-foreground leading-relaxed">
                          <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                          <span>{selectedCompany.address}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Allowed countries and application */}
              <div className="pt-4 border-t border-line space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted font-mono">Виз мэдүүлэх боломжтой улсууд</h4>
                  <p className="text-[11px] text-muted mt-1">Тус байгууллагаар дамжуулан виз мэдүүлгээ эхлүүлэх улсаа сонгоно уу.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedCompany.allowed_countries.map((code) => {
                    const countriesMap: Record<string, { name: string; label: string; flag: string; eFee: number; sFee: number; desc: string }> = {
                      KR: { name: "Бүгд Найрамдах Солонгос Улс", label: "БНСУ", flag: "🇰🇷", eFee: 110000, sFee: 40000, desc: "C-3-9 аялал жуулчлалын виз. НД шимтгэл 6+ сар төлсөн байх шаардлагатай." },
                      JP: { name: "Япон Улс", label: "Япон", flag: "🇯🇵", eFee: 50000, sFee: 30000, desc: "Богино хугацааны жуулчин. Дансны хуулга шаардлагатай." },
                      DE: { name: "Герман (Шенген)", label: "Герман", flag: "🇩🇪", eFee: 290000, sFee: 50000, desc: "Шенгений жуулчны виз. Биометрик хурууны хээгээ биеэр өгнө." },
                      AU: { name: "Австрали Улс", label: "Австрали", flag: "🇦🇺", eFee: 350000, sFee: 60000, desc: "Австрали улсын жуулчны виз. Санхүүгийн баталгаа шаардлагатай." }
                    };
                    const country = countriesMap[code];
                    if (!country) return null;
                    return (
                      <div key={code} className="p-4 rounded-xl bg-elevated/35 border border-line hover:border-zinc-700 transition-all flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{country.flag}</span>
                            <span className="text-sm font-extrabold text-foreground">{country.name}</span>
                          </div>
                          <p className="text-[11px] text-muted leading-relaxed">{country.desc}</p>
                          <div className="flex items-center gap-4 text-[10px] font-mono text-muted pt-1">
                            <span>Хураамж: <strong className="text-foreground">{(country.eFee + country.sFee).toLocaleString()}₮</strong></span>
                            <span>Хугацаа: <strong className="text-foreground">5-7 хоног</strong></span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onStartB2CVisa(country.name, code, country.eFee, country.sFee, selectedCompany.id)}
                          className="w-full btn-primary text-xs py-2 flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>Виз мэдүүлэг эхлүүлэх</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {/* B2C Available Companies and Visas list */}
          <div className="space-y-4">
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted font-mono">Гэрээт байгууллагууд (Виз зуучлал)</h4>
              <p className="text-[11px] text-muted">Та өөрийн виз мэдүүлгийг дараах баталгаат байгууллагуудын аль нэгийг сонгон илгээх боломжтой.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {companiesList.map((comp) => {
                const countriesMap: Record<string, { name: string; label: string; flag: string; eFee: number; sFee: number }> = {
                  KR: { name: "Бүгд Найрамдах Солонгос Улс", label: "БНСУ", flag: "🇰🇷", eFee: 110000, sFee: 40000 },
                  JP: { name: "Япон Улс", label: "Япон", flag: "🇯🇵", eFee: 50000, sFee: 30000 },
                  DE: { name: "Герман (Шенген)", label: "Герман", flag: "🇩🇪", eFee: 290000, sFee: 50000 },
                  AU: { name: "Австрали Улс", label: "Австрали", flag: "🇦🇺", eFee: 350000, sFee: 60000 }
                };

                const LogoIcon = getLogoIcon(comp.id);

                return (
                  <div 
                    key={comp.id}
                    onClick={() => setSelectedCompanyDetailId(comp.id)}
                    className="premium-card p-5 flex flex-col justify-between bg-surface border border-line rounded-xl hover:border-zinc-700 hover:shadow-lg hover:shadow-accent/5 transition-all space-y-4 relative overflow-hidden group cursor-pointer hover:-translate-y-0.5 duration-300"
                  >
                    {/* Background Logo Watermark */}
                    <div className="absolute -right-8 -bottom-8 text-accent/5 pointer-events-none transform -rotate-12 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-0 shrink-0">
                      <LogoIcon className="w-44 h-44" />
                    </div>
                    <div className="space-y-3 relative z-10">
                      {/* Top: Header Info */}
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <h5 className="text-sm font-bold text-foreground line-clamp-1">{comp.name}</h5>
                            <p className="text-[10px] text-muted font-mono mt-0.5">РД: {comp.registration_no}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-bold text-positive bg-positive/10 border border-positive/20 px-2 py-0.5 rounded">Идэвхтэй</span>
                          <ChevronRight className="w-4 h-4 text-muted group-hover:text-accent transition-colors" />
                        </div>
                      </div>

                      {/* Middle: Fictional advantages / Davuu tal */}
                      {comp.advantages && comp.advantages.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted font-mono">Давуу талууд:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {comp.advantages.map((adv, idx) => (
                              <span key={idx} className="inline-flex items-center gap-1 text-[10.5px] font-medium text-foreground bg-elevated px-2 py-0.5 rounded-md border border-line">
                                <CheckCircle className="w-3 h-3 text-positive shrink-0" />
                                {adv}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Contacts: Utas & Hayg */}
                      <div className="text-[11px] text-muted space-y-1 pt-1 bg-elevated/20 p-2.5 rounded-lg border border-line/50">
                        {comp.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-muted shrink-0" />
                            <span>Утас: <strong className="text-foreground">{comp.phone}</strong></span>
                          </div>
                        )}
                        {comp.address && (
                          <div className="flex items-start gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-muted shrink-0 mt-0.5" />
                            <span className="line-clamp-1">Хаяг: <span className="text-foreground">{comp.address}</span></span>
                          </div>
                        )}
                      </div>

                      {/* Allowed countries tags */}
                      <div className="space-y-1 pt-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted font-mono">Мэдүүлэх боломжтой улсууд:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {comp.allowed_countries.map((code) => {
                            const country = countriesMap[code];
                            return (
                              <span key={code} className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-foreground bg-accent/5 px-2 py-0.5 rounded-md border border-accent/10">
                                <span className="text-xs">{country?.flag || "🌐"}</span>
                                {country?.label || code}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Bottom action: select a country to start applying through this company */}
                    <div className="border-t border-line pt-4 mt-2 relative z-10" onClick={(e) => e.stopPropagation()}>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted font-mono mb-2">Виз мэдүүлэх улсаа сонгоно уу:</p>
                      <div className="flex flex-wrap gap-2">
                        {comp.allowed_countries.map((code) => {
                          const country = countriesMap[code];
                          if (!country) return null;
                          return (
                            <button
                              key={code}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onStartB2CVisa(country.name, code, country.eFee, country.sFee, comp.id);
                              }}
                              className="text-[10.5px] font-bold text-white bg-accent hover:bg-opacity-95 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 shadow-sm shrink-0 cursor-pointer"
                            >
                              <span>{country.flag}</span>
                              {country.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
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
