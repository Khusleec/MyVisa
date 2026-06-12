import React from "react";
import Link from "next/link";
import { Check, ChevronRight, Info, HelpCircle, Lock, Upload, RefreshCw, AlertCircle, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { slideInRight, motionTransition, springGentle, staggerContainer, staggerItem } from "../lib/motion";
import { Employee } from "../types/visa";
import PageHeader from "./ui/PageHeader";
import StepWizard from "./ui/StepWizard";

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
  const reduceMotion = useReducedMotion();

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
    <div className="p-4 rounded-2xl border border-positive/20 bg-gradient-to-r from-positive/8 to-transparent flex items-start gap-3 text-sm text-muted">
      <div className="w-9 h-9 rounded-xl bg-positive/15 border border-positive/20 flex items-center justify-center shrink-0">
        <Lock className="w-4 h-4 text-positive" />
      </div>
      <span className="flex-1 leading-relaxed">
        Таны мэдээлэл 256-бит шифрлэгдсэн — зөвхөн ЭСЯ-ны хянагч харах эрхтэй.{" "}
        <Link href="/legal" target="_blank" className="text-accent hover:underline font-semibold">
          Нууцлалын бодлого
        </Link>
      </span>
    </div>
  );

  const StepSection = ({ title, description, hint }: { title: string; description: string; hint?: string }) => (
    <div className="space-y-1.5">
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
      <p className="text-sm text-muted leading-relaxed">{description}</p>
      {hint && <p className="text-sm font-medium text-accent">{hint}</p>}
    </div>
  );

  const FormFooter = ({ children }: { children: React.ReactNode }) => (
    <div className="form-footer form-footer--sticky">{children}</div>
  );

  return (
    <motion.div 
      key="apply"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.15 }}
      className="space-y-4 sm:space-y-6 max-w-3xl w-full min-w-0"
    >
      <PageHeader
        eyebrow={`Алхам ${newApp.step} / 4`}
        title={userRole === "business_admin" ? "Ажилтанд виз мэдүүлэх" : "Виз мэдүүлэх"}
        description={steps.find((s) => s.step === newApp.step)?.full}
      />

      <StepWizard
        steps={steps}
        currentStep={newApp.step}
        onStepClick={(step) => {
          onClearFormError?.();
          setNewApp((prev) => ({ ...prev, step }));
        }}
      />

      <AnimatePresence mode="wait">
        {formError && (
          <motion.div
            key="form-error"
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={motionTransition(reduceMotion, springGentle)}
            className="form-error-banner p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 text-xs text-rose-400 flex gap-2.5 items-start overflow-hidden"
            role="alert"
          >
            <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" aria-hidden />
            <span className="flex-1 leading-normal">{formError}</span>
            {onClearFormError && (
              <button type="button" onClick={onClearFormError} className="text-xs font-bold underline shrink-0 cursor-pointer">
                Хаах
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="premium-card p-4 sm:p-6 md:p-8 bg-elevated/40 border border-line rounded-2xl space-y-5 sm:space-y-6 min-w-0 overflow-hidden">
        <AnimatePresence mode="wait">
        {/* STEP 1: Country select */}
        {newApp.step === 1 && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, x: reduceMotion ? 0 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: reduceMotion ? 0 : -16 }}
            transition={motionTransition(reduceMotion, springGentle)}
            className="space-y-6"
          >
            <StepSection
              title="Виз мэдүүлэх улсаа сонгоно уу"
              description="Визийн шаардлага болон хураамж улс бүрээр өөр өөр байна."
              hint="Улсаа сонгоод хураамж, шаардлагатай баримтуудтай танилцана уу."
            />

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              {allowedCountries.map((country) => (
                <motion.button
                  key={country.code}
                  type="button"
                  variants={staggerItem}
                  whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                  onClick={() => onCountryChange(country.name, country.code, country.eFee, country.sFee)}
                  className={`selection-card flex justify-between items-center cursor-pointer ${
                    newApp.countryCode === country.code ? "selection-card--selected" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl shrink-0" role="img" aria-label={country.name}>
                      {getFlagEmoji(country.code)}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{country.name}</p>
                      <p className="text-xs text-muted mt-0.5 font-mono">
                        {(country.eFee + country.sFee).toLocaleString()} ₮
                      </p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                    newApp.countryCode === country.code ? 'border-accent bg-accent text-white' : 'border-line'
                  }`}>
                    {newApp.countryCode === country.code && <Check className="w-3 h-3" />}
                  </div>
                </motion.button>
              ))}
            </motion.div>

            {/* B2C Company Selector inside Wizard */}
            {userRole === 'individual' && newApp.countryCode && (
              <div className="space-y-4 pt-6 border-t border-line animate-in fade-in duration-200">
                <p className="text-sm font-bold text-foreground">Зуучлагч байгууллага</p>
                <p className="text-sm text-muted -mt-2">Тус улсын визийг хариуцан шийдвэрлэх итгэмжлэгдсэн байгууллага сонгоно уу.</p>
                <div className="grid grid-cols-1 gap-3">
                  {companiesList
                    .filter(comp => comp.allowed_countries.includes(newApp.countryCode))
                    .map(comp => (
                      <button
                        key={comp.id}
                        type="button"
                        onClick={() => setNewApp(prev => ({ ...prev, selectedCompanyId: comp.id }))}
                        className={`selection-card flex justify-between items-center cursor-pointer ${
                          newApp.selectedCompanyId === comp.id ? "selection-card--selected" : ""
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

            <FormFooter>
              <div className="form-footer__group form-footer__group--end w-full">
                <button 
                  type="button"
                  onClick={() => {
                    onClearFormError?.();
                    setNewApp(prev => ({ ...prev, step: 2 }));
                  }}
                  disabled={userRole === 'individual' && !newApp.selectedCompanyId}
                  className="btn-primary w-full sm:w-auto"
                >
                  Үргэлжлүүлэх <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              {userRole === 'individual' && !newApp.selectedCompanyId && (
                <p className="form-hint w-full text-center sm:text-right">Зуучлагч байгууллага сонгоно уу</p>
              )}
            </FormFooter>
          </motion.div>
        )}

        {/* STEP 2: Citizen/Employee data pulling */}
        {newApp.step === 2 && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, x: reduceMotion ? 0 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: reduceMotion ? 0 : -16 }}
            transition={motionTransition(reduceMotion, springGentle)}
            className="space-y-6"
          >
            <StepSection
              title="Мэдүүлэгчийн мэдээлэл"
              description="ЭСЯ руу илгээх хүний РД болон ХУР лавлагааг холбоно уу."
              hint="Нийгмийн даатгал, цалингийн мэдээллийг ХУР системээс шууд татна."
            />

            {/* Trust Strip */}
            <TrustStrip />

            {/* Show toggle options depending on role */}
            {userRole === 'business_admin' ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-surface border border-line space-y-3">
                  <span className="text-xs text-muted font-mono uppercase tracking-wider block">Виз мэдүүлэх ажилтан сонгох</span>
                  <div className="flex flex-wrap gap-2 sm:gap-2.5">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                <div className="segmented-control">
                  <button 
                    type="button"
                    onClick={() => onApplicantTypeChange('myself')}
                    className={`segmented-control__btn ${newApp.applicantType === 'myself' ? 'segmented-control__btn--active' : ''}`}
                  >
                    Миний бие өөрөө
                  </button>
                  <button 
                    type="button"
                    onClick={() => onApplicantTypeChange('family')}
                    className={`segmented-control__btn ${newApp.applicantType === 'family' ? 'segmented-control__btn--active' : ''}`}
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs font-mono text-muted pt-1">
                        <div>Ажил олгогч: <span className="text-foreground font-bold">{newApp.khurEmployer}</span></div>
                        <div>Сүүлийн сарын цалин: <span className="text-foreground font-bold">{newApp.khurSalary.toLocaleString()} ₮</span></div>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={onPullKhurData}
                      className="btn-primary w-full"
                    >
                      ХУР лавлагаа татах
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
                        className="btn-primary"
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
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs font-mono text-muted pt-1">
                            <div>Ажил олгогч: <span className="text-foreground font-bold">{newApp.khurEmployer}</span></div>
                            <div>Сүүлийн сарын цалин: <span className="text-foreground font-bold">{newApp.khurSalary.toLocaleString()} ₮</span></div>
                          </div>
                        </div>
                      ) : (
                        <button 
                          type="button"
                          onClick={onPullKhurData}
                          className="btn-primary w-full"
                        >
                          ХУР лавлагаа татах
                        </button>
                      )}
                    </>
                  )}
                </>
              )}
            </div>

            <FormFooter>
              <button 
                type="button"
                onClick={() => setNewApp(prev => ({ ...prev, step: 1 }))}
                className="btn-secondary text-sm w-full sm:w-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="sm:inline">Буцах</span>
              </button>
              <button 
                type="button"
                onClick={() => setNewApp(prev => ({ ...prev, step: 3 }))}
                disabled={
                  (userRole === 'business_admin' && (!newApp.selectedEmployeeId || !newApp.khurChecked)) || 
                  (userRole === 'individual' && newApp.applicantType === 'myself' && !newApp.khurChecked)
                }
                className="btn-primary text-sm w-full sm:w-auto"
              >
                Үргэлжлүүлэх <ChevronRight className="w-4 h-4" />
              </button>
            </FormFooter>
          </motion.div>
        )}

        {/* STEP 3: Material uploads with helpful B2C tips */}
        {newApp.step === 3 && (
          <motion.div
            key="step-3"
            initial={{ opacity: 0, x: reduceMotion ? 0 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: reduceMotion ? 0 : -16 }}
            transition={motionTransition(reduceMotion, springGentle)}
            className="space-y-6"
          >
            <StepSection
              title="Баримт бичгүүдийг хуулах"
              description="ЭСЯ-ны шаардлагын дагуу дараах баримтуудыг зөв хуулна уу."
              hint="Паспорт, цээж зураг, дансны хуулгыг зураг эсвэл PDF форматаар оруулна."
            />

            {/* Trust Strip */}
            <TrustStrip />

            {/* Consumer-friendly B2C hints */}
            <div className="p-4 rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/8 to-transparent text-sm leading-relaxed text-muted space-y-2">
              <p className="font-bold text-foreground flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />
                Зөв файл хуулах зөвлөмж
              </p>
              <ul className="list-disc pl-5 space-y-1.5 leading-relaxed text-sm">
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
                  className={`upload-zone ${item.file ? "upload-zone--done" : ""}`}
                >
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{item.title}</h4>
                    {item.key === 'statement' && newApp.countryCode !== 'KR' ? (
                      <p className="text-xs mt-1 font-semibold text-amber-500">Сонголттой</p>
                    ) : (
                      <p className="text-xs text-muted mt-1">Шаардлагатай</p>
                    )}
                  </div>

                  {uploadingFile === item.key ? (
                    <div className="py-4 flex items-center justify-center gap-2 text-sm text-muted">
                      <RefreshCw className="w-4 h-4 animate-spin text-accent" />
                      <span>Хуулж байна...</span>
                    </div>
                  ) : item.file ? (
                    <div className="p-3 rounded-xl bg-positive/10 border border-positive/25 flex items-center justify-between text-xs font-mono text-positive gap-2">
                      <span className="truncate">{item.file.split('/').pop()}</span>
                      <Lock className="w-4 h-4 shrink-0" />
                    </div>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => handleUploadClick(item.key as 'passport' | 'statement' | 'photo')}
                      className="btn-secondary w-full text-sm border-dashed"
                    >
                      <Upload className="w-4 h-4" /> Файл хуулах
                    </button>
                  )}
                </div>
              ))}
            </div>

            <FormFooter>
              <button 
                type="button"
                onClick={() => setNewApp(prev => ({ ...prev, step: 2 }))}
                className="btn-secondary text-sm w-full sm:w-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                Буцах
              </button>
              <button 
                type="button"
                onClick={onNextToPricing}
                className="btn-primary text-sm w-full sm:w-auto"
              >
                Дараах <ChevronRight className="w-4 h-4" />
              </button>
            </FormFooter>
          </motion.div>
        )}

        {/* STEP 4: Checkout billing invoice breakdown */}
        {newApp.step === 4 && (
          <motion.div
            key="step-4"
            initial={{ opacity: 0, x: reduceMotion ? 0 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: reduceMotion ? 0 : -16 }}
            transition={motionTransition(reduceMotion, springGentle)}
            className="space-y-6 max-w-lg mx-auto py-2"
          >
            <div className="text-center space-y-2">
              <StepSection
                title="Мэдүүлгийг хянах"
                description="ЭСЯ руу илгээхээс өмнө дүн болон мэдээллээ хянана уу."
                hint="Баримт бичиг, мэдүүлгийн дэлгэрэнгүйг эцсийн байдлаар шалгана уу."
              />
            </div>

            {/* Trust Strip */}
            <TrustStrip />

            <div className="premium-card p-6 space-y-4 bg-surface border border-line rounded-2xl">
              <div className="flex justify-between items-center text-sm">
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

              <div className="flex justify-between items-center p-3 rounded-xl bg-accent/8 border border-accent/15">
                <span className="text-sm font-bold text-foreground">Нийт төлөх дүн</span>
                <span className="text-xl font-bold font-mono text-accent">{(newApp.embassyFee + newApp.serviceFee).toLocaleString()} ₮</span>
              </div>
            </div>

            {userRole === 'business_admin' && (
              <div className="p-3.5 bg-surface rounded-lg border border-line text-xs leading-relaxed text-muted flex gap-2">
                <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <p>Одоо төлөх эсвэл түр хадгалаад бусад ажилтны мэдүүлэгтэй нэгдсэн QPay нэхэмжлэхээр төлөх боломжтой.</p>
              </div>
            )}

            <FormFooter>
              <button 
                type="button"
                onClick={() => setNewApp(prev => ({ ...prev, step: 3 }))}
                className="btn-secondary text-sm w-full sm:w-auto order-2 sm:order-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Буцах
              </button>
              
              <div className="form-footer__group form-footer__group--end order-1 sm:order-2 w-full sm:w-auto">
                {userRole === 'business_admin' && (
                  <button 
                    type="button"
                    onClick={onSaveAsDraft}
                    className="btn-secondary text-sm flex-1 sm:flex-none"
                  >
                    Түр хадгалах
                  </button>
                )}

                <button 
                  type="button"
                  onClick={onGenerateInvoice}
                  className="btn-primary text-sm flex-1 sm:flex-none"
                >
                  Төлбөр төлөх <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </FormFooter>
          </motion.div>
        )}
        </AnimatePresence>

      </div>
    </motion.div>
  );
}
