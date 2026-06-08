import React from "react";
import Link from "next/link";
import { Check, ChevronRight, Info, HelpCircle, Lock, Upload, RefreshCw, AlertCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Employee } from "../types/visa";
import PageHeader from "./ui/PageHeader";

interface ApplicationFormProps {
  userRole: 'individual' | 'business_admin';
  employees: Employee[];
  
  newApp: {
    applicantType: 'myself' | 'family' | 'employee';
    applicantRelation: string;
    applicantName: string;
    selectedEmployeeId: string;
    selectedCompanyId: string;
    country: string;
    countryCode: string;
    visaType: string;
    registerNo: string;
    step: number;
    khurSalary: number;
    khurEmployer: string;
    khurInsuranceMonths: number;
    khurChecked: boolean;
    passportFile: string | null;
    bankStatementFile: string | null;
    photoFile: string | null;
    embassyFee: number;
    serviceFee: number;
    qpayInvoice: string;
    paymentStatus: 'unpaid' | 'paid';
  };
  setNewApp: React.Dispatch<React.SetStateAction<ApplicationFormProps['newApp']>>;
  
  onCountryChange: (countryName: string, code: string, eFee: number, sFee: number) => void;
  onApplicantTypeChange: (type: 'myself' | 'family' | 'employee') => void;
  onEmployeeSelection: (empId: string) => void;
  onPullKhurData: () => void;
  onFileUpload: (type: 'passport' | 'statement' | 'photo', file: File) => void;
  onNextToPricing: () => void;
  onGenerateInvoice: () => void;
  onSaveAsDraft: () => void;
  
  khurLoading: boolean;
  uploadingFile?: 'passport' | 'statement' | 'photo' | null;
  isUserVerified: boolean;
  onOpenDanModal: () => void;
  formError?: string | null;
  onClearFormError?: () => void;
  allowedCountries?: { name: string; code: string; eFee: number; sFee: number; desc?: string }[];
  companiesList?: { id: string; name: string; registration_no: string; allowed_countries: string[]; phone: string; address: string }[];
}

export default function ApplicationForm({
  userRole,
  employees,
  newApp,
  setNewApp,
  onCountryChange,
  onApplicantTypeChange,
  onEmployeeSelection,
  onPullKhurData,
  onFileUpload,
  onNextToPricing,
  onGenerateInvoice,
  onSaveAsDraft,
  khurLoading,
  uploadingFile,
  isUserVerified,
  onOpenDanModal,
  formError,
  onClearFormError,
  allowedCountries = [],
  companiesList = [],
}: ApplicationFormProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [activeUploadType, setActiveUploadType] = React.useState<'passport' | 'statement' | 'photo' | null>(null);

  const handleUploadClick = (type: 'passport' | 'statement' | 'photo') => {
    setActiveUploadType(type);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeUploadType) {
      onFileUpload(activeUploadType, file);
    }
  };

  const getFlagEmoji = (code: string) => {
    switch (code) {
      case 'KR': return '🇰🇷';
      case 'JP': return '🇯🇵';
      case 'DE': return '🇩🇪';
      case 'AU': return '🇦🇺';
      default: return '🏳️';
    }
  };

  const steps = [
    { step: 1, label: "Улс", full: "Улс сонгох" },
    { step: 2, label: "ХУР", full: "Лавлагаа (ХУР)" },
    { step: 3, label: "Баримт", full: "Баримт бичиг" },
    { step: 4, label: "Хяналт", full: "Материал хянах" },
  ];

  const TrustStrip = () => (
    <div className="p-3.5 rounded-xl border border-emerald-500/25 bg-emerald-500/5 flex items-center gap-2.5 text-xs text-muted">
      <Lock className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
      <span className="flex-1 leading-relaxed">
        Таны хувийн мэдээлэл болон баримт бичгүүдийг 256-бит шифрлэлтээр хамгаалсан бөгөөд зөвхөн ЭСЯ-ны хянагч харах эрхтэй.{" "}
        <Link href="/legal" target="_blank" className="text-accent hover:underline font-bold inline-flex items-center gap-0.5">
          Мэдээлэл боловсруулах зөвшөөрөл
        </Link>
      </span>
    </div>
  );

  return (
    <motion.div 
      key="apply"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.15 }}
      className="space-y-6 max-w-3xl"
    >
      <PageHeader
        title={userRole === "business_admin" ? "Ажилтанд виз мэдүүлэх" : "Виз мэдүүлэх"}
        description={`Алхам ${newApp.step} / 4 — ${steps.find((s) => s.step === newApp.step)?.full}`}
      />

      {/* Step indicators */}
      <div className="premium-card p-4 md:p-5 bg-surface border border-line rounded-xl overflow-x-auto">
        <div className="flex items-center min-w-[min(100%,20rem)] max-w-xl mx-auto gap-0" role="list" aria-label="Мэдүүлгийн алхмууд">
          {steps.map((s, i) => {
            const isCompleted = newApp.step > s.step;
            const isActiveStep = newApp.step === s.step;
            const isAccessible = s.step <= newApp.step;

            return (
              <React.Fragment key={s.step}>
                <div className="flex flex-col items-center flex-1 min-w-[4rem]" role="listitem">
                  <button
                    type="button"
                    disabled={!isAccessible}
                    onClick={() => {
                      if (isAccessible) {
                        onClearFormError?.();
                        setNewApp(prev => ({ ...prev, step: s.step }));
                      }
                    }}
                    className={`w-9 h-9 rounded-full border text-xs font-bold font-mono flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-accent ${
                      isAccessible ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                    } ${
                      isActiveStep
                        ? "bg-accent border-accent text-white shadow-[0_0_12px_rgba(0,102,255,0.35)]"
                        : isCompleted
                          ? "bg-positive border-positive text-white hover:bg-opacity-85"
                          : "bg-surface border-line text-muted"
                    }`}
                    aria-current={isActiveStep ? "step" : undefined}
                    title={s.full}
                  >
                    {isCompleted ? <Check className="w-4 h-4" aria-hidden /> : s.step}
                  </button>
                  <span
                    className={`text-xs mt-2 font-bold text-center ${
                      isActiveStep ? "text-foreground" : "text-muted"
                    }`}
                  >
                    <span className="sm:hidden">{s.label}</span>
                    <span className="hidden sm:inline">{s.full}</span>
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`h-px flex-1 min-w-[8px] mb-6 ${
                      isCompleted ? "bg-positive" : "bg-line"
                    }`}
                    aria-hidden
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {formError && (
        <div className="form-error-banner p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 text-xs text-rose-400 flex gap-2.5 items-start" role="alert">
          <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" aria-hidden />
          <span className="flex-1 leading-normal">{formError}</span>
          {onClearFormError && (
            <button type="button" onClick={onClearFormError} className="text-xs font-bold underline shrink-0 cursor-pointer">
              Хаах
            </button>
          )}
        </div>
      )}

      <div className="premium-card p-6 md:p-8 bg-surface border border-line rounded-xl space-y-6">
        
        {/* STEP 1: Country select */}
        {newApp.step === 1 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">Виз мэдүүлэх улсаа сонгоно уу</h3>
              <p className="text-xs text-muted">Визийн шаардлага болон хураамж улс бүрээр өөр өөр байна.</p>
              <p className="text-xs font-semibold text-accent mt-1">Виз мэдүүлэх улсаа сонгож, хураамж болон шаардлагатай баримтуудтай танилцана уу.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {allowedCountries.map((country) => (
                <button 
                  key={country.code}
                  type="button"
                  onClick={() => onCountryChange(country.name, country.code, country.eFee, country.sFee)}
                  className={`p-4 rounded-xl border transition-all flex justify-between items-center w-full text-left focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer min-h-[56px] ${
                    newApp.countryCode === country.code 
                      ? 'bg-elevated border-accent shadow-sm' 
                      : 'bg-surface border-line hover:border-muted'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl" role="img" aria-label={country.name}>
                      {getFlagEmoji(country.code)}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-foreground">{country.name}</p>
                      <p className="text-xs text-muted mt-0.5">Нийт хураамж: {(country.eFee + country.sFee).toLocaleString()} ₮</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                    newApp.countryCode === country.code ? 'border-accent bg-accent text-white' : 'border-line'
                  }`}>
                    {newApp.countryCode === country.code && <Check className="w-3.5 h-3.5" />}
                  </div>
                </button>
              ))}
            </div>

            {/* B2C Company Selector inside Wizard */}
            {userRole === 'individual' && newApp.countryCode && (
              <div className="space-y-4 pt-6 border-t border-line animate-in fade-in duration-200">
                <span className="text-xs font-bold text-foreground block uppercase tracking-wider font-mono">2. Зуучлагч байгууллага сонгох</span>
                <p className="text-xs text-muted">Тус улсын визийг хариуцан шийдвэрлэх итгэмжлэгдсэн байгууллага сонгоно уу.</p>
                <div className="grid grid-cols-1 gap-3">
                  {companiesList
                    .filter(comp => comp.allowed_countries.includes(newApp.countryCode))
                    .map(comp => (
                      <button
                        key={comp.id}
                        type="button"
                        onClick={() => setNewApp(prev => ({ ...prev, selectedCompanyId: comp.id }))}
                        className={`p-4 rounded-xl border text-left flex justify-between items-center transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent ${
                          newApp.selectedCompanyId === comp.id
                            ? 'bg-elevated border-accent shadow-sm'
                            : 'bg-surface border-line hover:border-muted'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-bold text-foreground">{comp.name}</p>
                          <p className="text-xs text-muted mt-1">Хаяг: {comp.address}</p>
                          <p className="text-xs text-accent mt-0.5">Утас: {comp.phone}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                          newApp.selectedCompanyId === comp.id ? 'border-accent bg-accent text-white' : 'border-line'
                        }`}>
                          {newApp.selectedCompanyId === comp.id && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-line">
              <div className="flex flex-col items-end gap-1">
                <button 
                  type="button"
                  onClick={() => {
                    onClearFormError?.();
                    setNewApp(prev => ({ ...prev, step: 2 }));
                  }}
                  disabled={userRole === 'individual' && !newApp.selectedCompanyId}
                  className="btn-primary min-h-[44px] px-6 cursor-pointer"
                >
                  Үргэлжлүүлэх <ChevronRight className="w-4 h-4" />
                </button>
                {userRole === 'individual' && !newApp.selectedCompanyId && (
                  <span className="text-[10px] text-muted font-medium">Зуучлагч байгууллага сонгоно уу.</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Citizen/Employee data pulling */}
        {newApp.step === 2 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">Мэдүүлэгчийн мэдээлэл болон Лавлагаа шалгах</h3>
              <p className="text-xs text-muted">ЭСЯ руу илгээх хүний хувийн РД болон төрийн ХУР лавлагаа мэдээллийг холбоно уу.</p>
              <p className="text-xs font-semibold text-accent mt-1">Таны нийгмийн даатгалын шимтгэл төлөлт болон сарын цалингийн мэдээллийг ХУР системээс шууд татна.</p>
            </div>

            {/* Trust Strip */}
            <TrustStrip />

            {/* Show toggle options depending on role */}
            {userRole === 'business_admin' ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-surface border border-line space-y-3">
                  <span className="text-xs text-muted font-mono uppercase tracking-wider block">Виз мэдүүлэх ажилтан сонгох</span>
                  <div className="flex flex-wrap gap-2">
                    {employees.map(emp => (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => onEmployeeSelection(emp.id)}
                        className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer min-h-[40px] ${
                          newApp.selectedEmployeeId === emp.id 
                            ? 'bg-accent/10 border-accent text-white font-bold' 
                            : 'bg-surface border-line text-muted hover:text-foreground hover:bg-elevated/40'
                        }`}
                      >
                        {emp.name} ({emp.position})
                      </button>
                    ))}
                  </div>
                </div>

                {newApp.selectedEmployeeId && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-surface border border-line">
                      <span className="text-xs text-muted font-mono">Ажилтны бүтэн нэр:</span>
                      <p className="text-sm font-bold text-foreground mt-1">{newApp.applicantName}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-surface border border-line">
                      <span className="text-xs text-muted font-mono">Регистрийн дугаар:</span>
                      <p className="text-sm font-mono font-bold text-foreground mt-1">{newApp.registerNo}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Selector B2C Tabs */}
                <div className="flex gap-4 p-1.5 bg-surface rounded-lg border border-line">
                  <button 
                    type="button"
                    onClick={() => onApplicantTypeChange('myself')}
                    className={`flex-1 py-2.5 text-xs font-bold rounded transition-all cursor-pointer min-h-[40px] ${newApp.applicantType === 'myself' ? 'bg-elevated text-accent border border-line shadow-sm' : 'text-muted'}`}
                  >
                    Миний бие өөрөө
                  </button>
                  <button 
                    type="button"
                    onClick={() => onApplicantTypeChange('family')}
                    className={`flex-1 py-2.5 text-xs font-bold rounded transition-all cursor-pointer min-h-[40px] ${newApp.applicantType === 'family' ? 'bg-elevated text-accent border border-line shadow-sm' : 'text-muted'}`}
                  >
                    Гэр бүлийн гишүүн
                  </button>
                </div>

                {newApp.applicantType === 'family' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-surface border border-line space-y-1.5">
                      <span className="text-xs text-muted font-mono uppercase tracking-wider block">Хамаарал</span>
                      <select 
                        value={newApp.applicantRelation}
                        onChange={(e) => setNewApp(prev => ({ ...prev, applicantRelation: e.target.value }))}
                        className="w-full bg-surface border border-line rounded px-2.5 py-2 text-xs text-foreground focus:outline-none min-h-[40px]"
                      >
                        <option>Эхнэр/Нөхөр</option>
                        <option>Охин</option>
                        <option>Хүү</option>
                        <option>Аав</option>
                        <option>Ээж</option>
                      </select>
                    </div>
                    <div className="p-4 rounded-xl bg-surface border border-line space-y-1.5">
                      <span className="text-xs text-muted font-mono uppercase tracking-wider block">Англи бүтэн нэр</span>
                      <input 
                        type="text" 
                        placeholder="Nergui Amin-Erdene"
                        value={newApp.applicantName} 
                        onChange={(e) => setNewApp(prev => ({ ...prev, applicantName: e.target.value }))}
                        className="w-full bg-surface border border-line rounded px-2.5 py-2 text-xs text-foreground focus:outline-none min-h-[40px]"
                      />
                    </div>
                    <div className="p-4 rounded-xl bg-surface border border-line space-y-1.5">
                      <span className="text-xs text-muted font-mono uppercase tracking-wider block">Регистрийн дугаар</span>
                      <input 
                        type="text" 
                        placeholder="УУ18230492"
                        value={newApp.registerNo} 
                        onChange={(e) => setNewApp(prev => ({ ...prev, registerNo: e.target.value.toUpperCase() }))}
                        maxLength={10}
                        className="w-full bg-surface border border-line rounded px-2.5 py-2 text-xs font-mono text-foreground focus:outline-none min-h-[40px]"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* KHUR Verification trigger */}
            <div className="space-y-4 pt-4 border-t border-line">
              <span className="text-sm font-bold text-foreground block">Төрийн мэдээлэл баталгаажуулалт (ХУР)</span>

              {userRole === 'business_admin' && (
                <>
                  {khurLoading ? (
                    <div className="p-6 bg-surface rounded-xl border border-line flex flex-col items-center justify-center gap-3 text-center">
                      <RefreshCw className="w-6 h-6 text-accent animate-spin" />
                      <p className="text-xs font-mono text-muted">API холболтоор ХУР системээс лавлагаа шалгаж байна...</p>
                    </div>
                  ) : newApp.khurChecked ? (
                    <div className="p-4 bg-positive/5 border border-positive/25 rounded-xl space-y-3 animate-in fade-in duration-200">
                      <p className="text-sm text-foreground font-bold flex items-center gap-1.5">
                        <Check className="w-5 h-5 text-positive" /> Нийгмийн Даатгалын шимтгэл төлөлт баталгаажлаа.
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-xs font-mono text-muted pt-1">
                        <div>Ажил олгогч: <span className="text-foreground font-bold">{newApp.khurEmployer}</span></div>
                        <div>Сүүлийн сарын цалин: <span className="text-foreground font-bold">{newApp.khurSalary.toLocaleString()} ₮</span></div>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={onPullKhurData}
                      className="w-full py-3 rounded-lg bg-accent hover:bg-opacity-95 text-xs font-bold text-white transition-all shadow cursor-pointer min-h-[44px]"
                    >
                      ХУР системээс ажил олгогч, даатгалын лавлагааг татах
                    </button>
                  )}
                </>
              )}

              {userRole === 'individual' && newApp.applicantType === 'myself' && (
                <>
                  {!isUserVerified ? (
                    <div className="p-4 bg-amber-500/5 border border-amber-500/25 rounded-xl space-y-3">
                      <p className="text-sm text-amber-500 font-bold">
                        ДАН цахим системээр холбогдох шаардлагатай
                      </p>
                      <p className="text-xs text-muted leading-relaxed">
                        ХУР системээс таны нийгмийн даатгал, ажлын тодорхойлолт зэрэг нууц мэдээллийг татахын тулд Үндэсний цахим танилт нэвтрэлтийн ДАН системээр таныг хэн болохыг аюулгүй баталгаажуулах шаардлагатай.
                      </p>
                      <button
                        type="button"
                        onClick={onOpenDanModal}
                        className="px-5 py-2.5 rounded-lg bg-accent hover:bg-opacity-95 text-xs font-bold text-white transition-all shadow cursor-pointer min-h-[44px]"
                      >
                        ДАН системээр нэвтрэх
                      </button>
                    </div>
                  ) : (
                    <>
                      {khurLoading ? (
                        <div className="p-6 bg-surface rounded-xl border border-line flex flex-col items-center justify-center gap-3 text-center">
                          <RefreshCw className="w-6 h-6 text-accent animate-spin" />
                          <p className="text-xs font-mono text-muted">ХУР төрийн мэдээлэл солилцооны системээс аюулгүй лавлагаа татаж байна...</p>
                        </div>
                      ) : newApp.khurChecked ? (
                        <div className="p-4 bg-positive/5 border border-positive/25 rounded-xl space-y-3 animate-in fade-in duration-200">
                          <p className="text-sm text-foreground font-bold flex items-center gap-1.5">
                            <Check className="w-5 h-5 text-positive" /> Нийгмийн Даатгалын шимтгэл төлөлт баталгаажлаа.
                          </p>
                          <div className="grid grid-cols-2 gap-4 text-xs font-mono text-muted pt-1">
                            <div>Ажил олгогч: <span className="text-foreground font-bold">{newApp.khurEmployer}</span></div>
                            <div>Сүүлийн сарын цалин: <span className="text-foreground font-bold">{newApp.khurSalary.toLocaleString()} ₮</span></div>
                          </div>
                        </div>
                      ) : (
                        <button 
                          type="button"
                          onClick={onPullKhurData}
                          className="w-full py-3 rounded-lg bg-accent hover:bg-opacity-95 text-xs font-bold text-white transition-all shadow cursor-pointer min-h-[44px]"
                        >
                          ХУР системээс ажил олгогч, даатгалын лавлагааг татах
                        </button>
                      )}
                    </>
                  )}
                </>
              )}
            </div>

            <div className="flex justify-between pt-4 border-t border-line">
              <button 
                type="button"
                onClick={() => setNewApp(prev => ({ ...prev, step: 1 }))}
                className="px-4 py-2.5 rounded-lg border border-line hover:bg-elevated text-xs font-bold text-muted hover:text-foreground transition-all cursor-pointer min-h-[44px]"
              >
                Буцах (Улс сонгох)
              </button>
              <button 
                type="button"
                onClick={() => setNewApp(prev => ({ ...prev, step: 3 }))}
                disabled={
                  (userRole === 'business_admin' && (!newApp.selectedEmployeeId || !newApp.khurChecked)) || 
                  (userRole === 'individual' && newApp.applicantType === 'myself' && !newApp.khurChecked)
                }
                className="px-5 py-2.5 rounded-lg bg-accent hover:bg-opacity-95 text-white font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer min-h-[44px]"
              >
                Үргэлжлүүлэх <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Material uploads with helpful B2C tips */}
        {newApp.step === 3 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">Баримт бичгүүдийг хуулах</h3>
              <p className="text-xs text-muted">ЭСЯ-ны шаардлагын дагуу дараах баримтуудыг зөв хуулна уу.</p>
              <p className="text-xs font-semibold text-accent mt-1">Гадаад паспорт, цээж зураг, дансны хуулга зэрэг баримтуудыг зураг болон PDF форматаар оруулна.</p>
            </div>

            {/* Trust Strip */}
            <TrustStrip />

            {/* Consumer-friendly B2C hints */}
            <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-xs leading-relaxed text-muted space-y-1.5">
              <p className="font-bold text-foreground flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-500" />
                Зөв файл хуулах зөвлөмж:
              </p>
              <ul className="list-disc pl-5 space-y-1 leading-relaxed">
                <li>Гадаад паспортыг гэрэл гялбахгүй, дөрвөн өнцөг нь бүтэн харагдахаар уншуулна уу.</li>
                <li>Цээж зураг заавал цагаан дэвсгэртэй, чих ил гарсан, эгц харсан байна.</li>
                <li>Дансны хуулгыг банкны аппликейшнээс шууд татсан, баруун дээд буландаа QR баталгаажуулалттай PDF файлаар оруулна.</li>
              </ul>
            </div>

            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,application/pdf"
              style={{ display: 'none' }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {[
                { key: 'passport', title: "Гадаад паспорт", file: newApp.passportFile },
                { key: 'photo', title: "Цээж зураг (3х4)", file: newApp.photoFile },
                { key: 'statement', title: "Дансны хуулга (Сүүлийн 6 сар)", file: newApp.bankStatementFile }
              ].map((item) => (
                <div 
                  key={item.key} 
                  className="p-5 rounded-xl border border-line bg-surface/50 flex flex-col justify-between h-48"
                >
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{item.title}</h4>
                    {item.key === 'statement' && newApp.countryCode !== 'KR' ? (
                      <p className="text-xs mt-1 font-semibold text-amber-500 font-mono">Сонголттой (Заавал биш)</p>
                    ) : (
                      <p className="text-xs text-muted mt-1 font-mono">Шаардлагатай баримт</p>
                    )}
                  </div>

                  {uploadingFile === item.key ? (
                    <div className="py-3 flex items-center justify-center gap-2 text-xs text-muted">
                      <RefreshCw className="w-4 h-4 animate-spin text-accent" />
                      <span>Хуулж байна...</span>
                    </div>
                  ) : item.file ? (
                    <div className="p-2.5 rounded bg-positive/10 border border-positive/20 flex items-center justify-between text-xs font-mono text-positive overflow-hidden">
                      <span className="truncate max-w-[130px]">{item.file.split('/').pop()}</span>
                      <Lock className="w-3.5 h-3.5 shrink-0 ml-1" />
                    </div>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => handleUploadClick(item.key as 'passport' | 'statement' | 'photo')}
                      className="py-2.5 rounded-lg border border-dashed border-line hover:border-muted text-xs font-bold text-muted hover:text-foreground flex items-center justify-center gap-1.5 transition-all bg-surface/50 cursor-pointer min-h-[44px]"
                    >
                      <Upload className="w-4 h-4" /> Файл хуулах
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4 border-t border-line">
              <button 
                type="button"
                onClick={() => setNewApp(prev => ({ ...prev, step: 2 }))}
                className="px-4 py-2.5 rounded-lg border border-line hover:bg-elevated text-xs font-bold text-muted hover:text-foreground transition-all cursor-pointer min-h-[44px]"
              >
                Буцах (Мэдээлэл холбох)
              </button>
              <button 
                type="button"
                onClick={onNextToPricing}
                className="px-5 py-2.5 rounded-lg bg-accent hover:opacity-90 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow cursor-pointer min-h-[44px]"
              >
                Дараах <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Checkout billing invoice breakdown */}
        {newApp.step === 4 && (
          <div className="space-y-6 max-w-lg mx-auto py-2">
            <div className="space-y-1 text-center">
              <h3 className="text-base font-bold text-foreground">Мэдүүлгийг хянах</h3>
              <p className="text-xs text-muted">ЭСЯ руу илгээхээс өмнө өөрийн мэдүүлгийн дүн болон мэдээллээ хянана уу.</p>
              <p className="text-xs font-semibold text-accent mt-1">Оруулсан баримт бичиг болон мэдүүлгийн дэлгэрэнгүйг эцсийн байдлаар шалгаж, баталгаажуулна уу.</p>
            </div>

            {/* Trust Strip */}
            <TrustStrip />

            <div className="premium-card p-5 space-y-4 bg-surface border border-line rounded-xl">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted">Мэдүүлэгч:</span>
                <span className="font-semibold text-foreground">
                  {newApp.applicantName} 
                  {newApp.applicantType === 'family' && ` (${newApp.applicantRelation})`}
                  {newApp.applicantType === 'employee' && ` (Ажилтан)`}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted">Улс / Виз:</span>
                <span className="font-semibold text-foreground">{newApp.country} ({newApp.visaType})</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted">Регистрийн дугаар:</span>
                <span className="font-mono text-foreground">{newApp.registerNo}</span>
              </div>

              <div className="h-px bg-line"></div>

              <div className="space-y-2 text-xs font-mono text-muted">
                <div className="flex justify-between">
                  <span>ЭСЯ визний хураамж:</span>
                  <span className="text-foreground">{newApp.embassyFee.toLocaleString()} ₮</span>
                </div>
                <div className="flex justify-between">
                  <span>Үйлчилгээний хөлс:</span>
                  <span className="text-foreground">{newApp.serviceFee.toLocaleString()} ₮</span>
                </div>
              </div>

              <div className="h-px bg-line"></div>

              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-muted">Нийт төлөх дүн:</span>
                <span className="font-mono text-accent">{(newApp.embassyFee + newApp.serviceFee).toLocaleString()} ₮</span>
              </div>
            </div>

            {userRole === 'business_admin' && (
              <div className="p-3.5 bg-surface rounded-lg border border-line text-xs leading-relaxed text-muted flex gap-2">
                <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <p>Одоо төлөх эсвэл түр хадгалаад бусад ажилтны мэдүүлэгтэй нэгдсэн QPay нэхэмжлэхээр төлөх боломжтой.</p>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-line gap-3">
              <button 
                type="button"
                onClick={() => setNewApp(prev => ({ ...prev, step: 3 }))}
                className="px-4 py-2.5 rounded-lg border border-line hover:bg-surface text-xs font-bold text-muted hover:text-foreground cursor-pointer min-h-[44px]"
              >
                Буцах (Баримт хуулах)
              </button>
              
              {userRole === 'business_admin' && (
                <button 
                  type="button"
                  onClick={onSaveAsDraft}
                  className="px-4 py-2.5 rounded-lg border border-zinc-700 hover:bg-surface text-xs font-bold text-muted hover:text-foreground cursor-pointer min-h-[44px]"
                >
                  Түр хадгалах
                </button>
              )}

              <button 
                type="button"
                onClick={onGenerateInvoice}
                className="px-5 py-2.5 rounded-lg bg-accent hover:bg-opacity-95 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow cursor-pointer min-h-[44px]"
              >
                Төлбөр төлөх <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </motion.div>
  );
}
