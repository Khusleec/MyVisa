import React from "react";
import { Check, ChevronRight, Info, HelpCircle, Lock, Upload, RefreshCw, AlertCircle } from "lucide-react";
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
  onFileUpload: (type: 'passport' | 'statement' | 'photo') => void;
  onNextToPricing: () => void;
  onGenerateInvoice: () => void;
  onSaveAsDraft: () => void;
  
  khurLoading: boolean;
  isUserVerified: boolean;
  onOpenDanModal: () => void;
  formError?: string | null;
  onClearFormError?: () => void;
  allowedCountries?: { name: string; code: string; eFee: number; sFee: number; desc?: string }[];
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
  isUserVerified,
  onOpenDanModal,
  formError,
  onClearFormError,
  allowedCountries = [],
}: ApplicationFormProps) {
  const steps = [
    { step: 1, label: "Улс", full: "Улс сонгох" },
    { step: 2, label: "ХУР", full: "Лавлагаа" },
    { step: 3, label: "Баримт", full: "Материал" },
    { step: 4, label: "Хяналт", full: "Хяналт" },
    { step: 5, label: "Төлбөр", full: "Төлбөр" },
  ];

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
        description={`Алхам ${newApp.step} / 5 — ${steps.find((s) => s.step === newApp.step)?.full}`}
      />

      <div className="premium-card p-4 md:p-5 bg-surface border border-line rounded-xl overflow-x-auto">
        <div className="flex items-center min-w-[min(100%,20rem)] max-w-xl mx-auto gap-0" role="list" aria-label="Мэдүүлгийн алхмууд">
          {steps.map((s, i) => (
            <React.Fragment key={s.step}>
              <div className="flex flex-col items-center flex-1 min-w-[3.5rem]" role="listitem">
                <div
                  className={`w-8 h-8 rounded-full border text-[11px] font-bold font-mono flex items-center justify-center transition-all ${
                    newApp.step === s.step
                      ? "bg-accent border-accent text-white shadow-[0_0_12px_rgba(0,102,255,0.35)]"
                      : newApp.step > s.step
                        ? "bg-positive border-positive text-white"
                        : "bg-surface border-line text-muted"
                  }`}
                  aria-current={newApp.step === s.step ? "step" : undefined}
                >
                  {newApp.step > s.step ? <Check className="w-3.5 h-3.5" aria-hidden /> : s.step}
                </div>
                <span
                  className={`text-[9px] sm:text-[10px] mt-1.5 font-bold text-center ${
                    newApp.step === s.step ? "text-foreground" : "text-muted"
                  }`}
                >
                  <span className="sm:hidden">{s.label}</span>
                  <span className="hidden sm:inline">{s.full}</span>
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`h-px flex-1 min-w-[8px] mb-5 ${
                    newApp.step > s.step ? "bg-positive" : "bg-line"
                  }`}
                  aria-hidden
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {formError && (
        <div className="form-error-banner" role="alert">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
          <span className="flex-1">{formError}</span>
          {onClearFormError && (
            <button type="button" onClick={onClearFormError} className="text-[10px] font-bold underline shrink-0">
              Хаах
            </button>
          )}
        </div>
      )}

      <div className="premium-card p-6 md:p-8 bg-surface border border-line rounded-xl">
        
        {/* STEP 1: Country select */}
        {newApp.step === 1 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">Виз мэдүүлэх улсаа сонгоно уу</h3>
              <p className="text-xs text-muted">Визийн шаардлага болон хураамж улс бүрээр өөр өөр байна.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {allowedCountries.map((country) => (
                <div 
                  key={country.code}
                  onClick={() => onCountryChange(country.name, country.code, country.eFee, country.sFee)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${
                    newApp.countryCode === country.code 
                      ? 'bg-elevated border-accent' 
                      : 'bg-surface border-line hover:border-muted'
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold text-foreground">{country.name}</p>
                    <p className="text-[10px] text-muted mt-0.5">Нийт дүн: {(country.eFee + country.sFee).toLocaleString()} ₮</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    newApp.countryCode === country.code ? 'border-accent bg-accent text-white' : 'border-zinc-700'
                  }`}>
                    {newApp.countryCode === country.code && <Check className="w-3 h-3" />}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-line">
              <button 
                type="button"
                onClick={() => {
                  onClearFormError?.();
                  setNewApp(prev => ({ ...prev, step: 2 }));
                }}
                className="btn-primary"
              >
                Үргэлжлүүлэх <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Citizen/Employee data pulling */}
        {newApp.step === 2 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">Мэдүүлэгчийн мэдээлэл болон Лавлагаа шалгах</h3>
              <p className="text-xs text-muted">ЭСЯ руу илгээх хүний хувийн РД болон төрийн ХУР лавлагаа мэдээллийг холбоно уу.</p>
            </div>

            {/* Show toggle options depending on role */}
            {userRole === 'business_admin' ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-surface border border-line space-y-3">
                  <span className="text-[10px] text-muted font-mono uppercase tracking-wider block">Виз мэдүүлэх ажилтан сонгох</span>
                  <div className="flex flex-wrap gap-2">
                    {employees.map(emp => (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => onEmployeeSelection(emp.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          newApp.selectedEmployeeId === emp.id 
                            ? 'bg-accent/10 border-accent text-white' 
                            : 'bg-surface border-line text-muted hover:text-foreground'
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
                      <span className="text-[10px] text-muted font-mono">Ажилтны бүтэн нэр:</span>
                      <p className="text-xs font-bold text-foreground mt-1">{newApp.applicantName}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-surface border border-line">
                      <span className="text-[10px] text-muted font-mono">Регистрийн дугаар:</span>
                      <p className="text-xs font-mono font-bold text-foreground mt-1">{newApp.registerNo}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Selector B2C Tabs */}
                <div className="flex gap-4 p-1 bg-surface rounded-lg border border-line">
                  <button 
                    type="button"
                    onClick={() => onApplicantTypeChange('myself')}
                    className={`flex-1 py-2 text-xs font-semibold rounded transition-all ${newApp.applicantType === 'myself' ? 'bg-elevated text-accent' : 'text-muted'}`}
                  >
                    Миний бие өөрөө
                  </button>
                  <button 
                    type="button"
                    onClick={() => onApplicantTypeChange('family')}
                    className={`flex-1 py-2 text-xs font-semibold rounded transition-all ${newApp.applicantType === 'family' ? 'bg-elevated text-accent' : 'text-muted'}`}
                  >
                    Гэр бүлийн гишүүн
                  </button>
                </div>

                {newApp.applicantType === 'family' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-surface border border-line space-y-1">
                      <span className="text-[10px] text-muted font-mono uppercase tracking-wider">Хамаарал</span>
                      <select 
                        value={newApp.applicantRelation}
                        onChange={(e) => setNewApp(prev => ({ ...prev, applicantRelation: e.target.value }))}
                        className="w-full bg-surface border border-line rounded p-1.5 text-xs text-white focus:outline-none"
                      >
                        <option>Эхнэр/Нөхөр</option>
                        <option>Охин</option>
                        <option>Хүү</option>
                        <option>Аав</option>
                        <option>Ээж</option>
                      </select>
                    </div>
                    <div className="p-4 rounded-xl bg-surface border border-line space-y-1">
                      <span className="text-[10px] text-muted font-mono uppercase tracking-wider">Англи бүтэн нэр</span>
                      <input 
                        type="text" 
                        placeholder="Nergui Amin-Erdene"
                        value={newApp.applicantName} 
                        onChange={(e) => setNewApp(prev => ({ ...prev, applicantName: e.target.value }))}
                        className="w-full bg-surface border border-line rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div className="p-4 rounded-xl bg-surface border border-line space-y-1">
                      <span className="text-[10px] text-muted font-mono uppercase tracking-wider">Регистрийн дугаар</span>
                      <input 
                        type="text" 
                        placeholder="УУ18230492"
                        value={newApp.registerNo} 
                        onChange={(e) => setNewApp(prev => ({ ...prev, registerNo: e.target.value.toUpperCase() }))}
                        maxLength={10}
                        className="w-full bg-surface border border-line rounded px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* KHUR Verification trigger */}
            <div className="space-y-4 pt-4 border-t border-line">
              <span className="text-xs font-bold text-foreground block">Төрийн мэдээлэл баталгаажуулалт (KHUR)</span>

              {userRole === 'business_admin' && (
                <>
                  {khurLoading ? (
                    <div className="p-6 bg-surface rounded-xl border border-line flex flex-col items-center justify-center gap-3 text-center">
                      <RefreshCw className="w-6 h-6 text-accent animate-spin" />
                      <p className="text-[10px] font-mono text-muted">API Query: 150.129.143.18 / E-Mongolia secure link</p>
                    </div>
                  ) : newApp.khurChecked ? (
                    <div className="p-4 bg-positive/5 border border-positive/25 rounded-xl space-y-3">
                      <p className="text-xs text-foreground font-bold flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-positive" /> Нийгмийн Даатгалын шимтгэл төлөлт баталгаажлаа.
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-[10.5px] font-mono text-muted pt-2">
                        <div>Ажил олгогч: <span className="text-foreground font-bold">{newApp.khurEmployer}</span></div>
                        <div>Сүүлийн цалин: <span className="text-foreground font-bold">{newApp.khurSalary.toLocaleString()} ₮</span></div>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={onPullKhurData}
                      className="w-full py-2.5 rounded-lg bg-accent hover:bg-opacity-95 text-xs font-bold text-white transition-all shadow"
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
                      <p className="text-xs text-amber-500 font-bold">
                        DAN системээр холбогдоогүй байна.
                      </p>
                      <p className="text-[10.5px] text-muted leading-relaxed">
                        ХУР системээс лавлагаа мэдээллээ татахын тулд эхлээд өөрийн биеэр нэвтэрч баталгаажсан байх шаардлагатай.
                      </p>
                      <button
                        type="button"
                        onClick={onOpenDanModal}
                        className="px-4 py-2 rounded-lg bg-accent hover:bg-opacity-95 text-xs font-bold text-white transition-all shadow"
                      >
                        DAN системээр нэвтрэх
                      </button>
                    </div>
                  ) : (
                    <>
                      {khurLoading ? (
                        <div className="p-6 bg-surface rounded-xl border border-line flex flex-col items-center justify-center gap-3 text-center">
                          <RefreshCw className="w-6 h-6 text-accent animate-spin" />
                          <p className="text-[10px] font-mono text-muted">API Query: 150.129.143.18 / E-Mongolia secure link</p>
                        </div>
                      ) : newApp.khurChecked ? (
                        <div className="p-4 bg-positive/5 border border-positive/25 rounded-xl space-y-3">
                          <p className="text-xs text-foreground font-bold flex items-center gap-1.5">
                            <Check className="w-4 h-4 text-positive" /> Нийгмийн Даатгалын шимтгэл төлөлт баталгаажлаа.
                          </p>
                          <div className="grid grid-cols-2 gap-4 text-[10.5px] font-mono text-muted pt-2">
                            <div>Ажил олгогч: <span className="text-foreground font-bold">{newApp.khurEmployer}</span></div>
                            <div>Сүүлийн цалин: <span className="text-foreground font-bold">{newApp.khurSalary.toLocaleString()} ₮</span></div>
                          </div>
                        </div>
                      ) : (
                        <button 
                          type="button"
                          onClick={onPullKhurData}
                          className="w-full py-2.5 rounded-lg bg-accent hover:bg-opacity-95 text-xs font-bold text-white transition-all shadow"
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
                className="px-4 py-2 rounded-lg border border-line hover:bg-surface text-xs font-semibold text-muted"
              >
                Өмнөх
              </button>
              <button 
                type="button"
                onClick={() => setNewApp(prev => ({ ...prev, step: 3 }))}
                disabled={
                  (userRole === 'business_admin' && (!newApp.selectedEmployeeId || !newApp.khurChecked)) || 
                  (userRole === 'individual' && newApp.applicantType === 'myself' && !newApp.khurChecked)
                }
                className="px-5 py-2.5 rounded-lg bg-accent hover:bg-opacity-95 text-white font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
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
            </div>

            {/* Consumer-friendly B2C hints */}
            <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-[11px] leading-relaxed text-muted space-y-1">
              <p className="font-bold text-foreground flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                Зөв файл хуулах зөвлөмж:
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Гадаад паспортыг гэрэл гялбахгүй, дөрвөн өнцөг нь бүтэн харагдахаар уншуулна уу.</li>
                <li>Цээж зураг заавал цагаан дэвсгэртэй, чих ил гарсан, эгц харсан байна.</li>
                <li>Дансны хуулгыг банкны аппликейшнээс шууд татсан, баруун дээд буландаа QR баталгаажуулалттай PDF файлаар оруулна.</li>
              </ul>
            </div>

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
                      <p className="text-[10px] mt-1 font-semibold text-amber-500 font-mono">Сонголттой (Заавал биш)</p>
                    ) : (
                      <p className="text-[10px] text-muted mt-1 font-mono">Шаардлагатай баримт</p>
                    )}
                  </div>

                  {item.file ? (
                    <div className="p-2 rounded bg-positive/10 border border-positive/20 flex items-center justify-between text-[9.5px] font-mono text-positive overflow-hidden">
                      <span className="truncate max-w-[130px]">{item.file}</span>
                      <Lock className="w-3 h-3 shrink-0 ml-1" />
                    </div>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => onFileUpload(item.key as 'passport' | 'statement' | 'photo')}
                      className="py-2.5 rounded-lg border border-dashed border-line hover:border-muted text-xs font-bold text-muted hover:text-foreground flex items-center justify-center gap-1.5 transition-all bg-surface/50"
                    >
                      <Upload className="w-3.5 h-3.5" /> Файл хуулах
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4 border-t border-line">
              <button 
                type="button"
                onClick={() => setNewApp(prev => ({ ...prev, step: 2 }))}
                className="px-4 py-2 rounded-lg border border-line hover:bg-elevated text-xs font-semibold text-muted hover:text-foreground transition-colors"
              >
                Өмнөх
              </button>
              <button 
                type="button"
                onClick={onNextToPricing}
                className="px-5 py-2.5 rounded-lg bg-accent hover:opacity-90 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow"
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
            </div>

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
              <div className="p-3 bg-surface rounded-lg border border-line text-[11px] leading-relaxed text-muted flex gap-2">
                <Info className="w-4 h-4 text-accent shrink-0" />
                <p>Одоо төлөх эсвэл түр хадгалаад бусад ажилтны мэдүүлэгтэй нэгдсэн QPay нэхэмжлэхээр төлөх боломжтой.</p>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-line gap-3">
              <button 
                type="button"
                onClick={() => setNewApp(prev => ({ ...prev, step: 3 }))}
                className="px-4 py-2 rounded-lg border border-line hover:bg-surface text-xs font-semibold text-muted"
              >
                Өмнөх
              </button>
              
              {userRole === 'business_admin' && (
                <button 
                  type="button"
                  onClick={onSaveAsDraft}
                  className="px-4 py-2.5 rounded-lg border border-zinc-700 hover:bg-surface text-xs font-bold text-muted"
                >
                  Түр хадгалах (Нэгтгэж төлөх)
                </button>
              )}

              <button 
                type="button"
                onClick={onGenerateInvoice}
                className="px-5 py-2.5 rounded-lg bg-accent hover:bg-opacity-95 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow"
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
