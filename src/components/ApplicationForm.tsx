import React from "react";
import { Check, ChevronRight, Info, HelpCircle, Lock, Upload, BellRing, RefreshCw, AlertCircle } from "lucide-react";
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
  smsNotifications: boolean;
  setSmsNotifications: (val: boolean) => void;
  isUserVerified: boolean;
  onOpenDanModal: () => void;
  sendingSmsId: string | null;
  smsSentEmployees: string[];
  onSendEmployeeSms: (empId: string) => void;
  formError?: string | null;
  onClearFormError?: () => void;
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
  smsNotifications,
  setSmsNotifications,
  isUserVerified,
  onOpenDanModal,
  sendingSmsId,
  smsSentEmployees,
  onSendEmployeeSms,
  formError,
  onClearFormError,
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

      <div className="premium-card p-4 md:p-5 bg-[#0e0f15] border border-[#1e2030] rounded-xl overflow-x-auto">
        <div className="flex items-center min-w-[min(100%,20rem)] max-w-xl mx-auto gap-0" role="list" aria-label="Мэдүүлгийн алхмууд">
          {steps.map((s, i) => (
            <React.Fragment key={s.step}>
              <div className="flex flex-col items-center flex-1 min-w-[3.5rem]" role="listitem">
                <div
                  className={`w-8 h-8 rounded-full border text-[11px] font-bold font-mono flex items-center justify-center transition-all ${
                    newApp.step === s.step
                      ? "bg-[#0066ff] border-[#0066ff] text-white shadow-[0_0_12px_rgba(0,102,255,0.35)]"
                      : newApp.step > s.step
                        ? "bg-[#10b981] border-[#10b981] text-white"
                        : "bg-[#0e0f15] border-[#1e2030] text-[#8f95b2]"
                  }`}
                  aria-current={newApp.step === s.step ? "step" : undefined}
                >
                  {newApp.step > s.step ? <Check className="w-3.5 h-3.5" aria-hidden /> : s.step}
                </div>
                <span
                  className={`text-[9px] sm:text-[10px] mt-1.5 font-bold text-center ${
                    newApp.step === s.step ? "text-white" : "text-[#8f95b2]"
                  }`}
                >
                  <span className="sm:hidden">{s.label}</span>
                  <span className="hidden sm:inline">{s.full}</span>
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`h-px flex-1 min-w-[8px] mb-5 ${
                    newApp.step > s.step ? "bg-[#10b981]" : "bg-[#1e2030]"
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

      <div className="premium-card p-6 md:p-8 bg-[#0e0f15] border border-[#1e2030] rounded-xl">
        
        {/* STEP 1: Country select */}
        {newApp.step === 1 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Виз мэдүүлэх улсаа сонгоно уу</h3>
              <p className="text-xs text-[#8f95b2]">Визийн шаардлага болон хураамж улс бүрээр өөр өөр байна.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: "Бүгд Найрамдах Солонгос Улс", code: "KR", eFee: 110000, sFee: 40000 },
                { name: "Япон Улс", code: "JP", eFee: 50000, sFee: 30000 },
                { name: "Герман (Шенген)", code: "DE", eFee: 290000, sFee: 50000 }
              ].map((country) => (
                <div 
                  key={country.code}
                  onClick={() => onCountryChange(country.name, country.code, country.eFee, country.sFee)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${
                    newApp.countryCode === country.code 
                      ? 'bg-[#12131a] border-[#0066ff]' 
                      : 'bg-[#090a0f] border-[#1e2030] hover:border-zinc-700'
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold text-white">{country.name}</p>
                    <p className="text-[10px] text-[#8f95b2] mt-0.5">Нийт дүн: {(country.eFee + country.sFee).toLocaleString()} ₮</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    newApp.countryCode === country.code ? 'border-[#0066ff] bg-[#0066ff] text-white' : 'border-zinc-700'
                  }`}>
                    {newApp.countryCode === country.code && <Check className="w-3 h-3" />}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-[#1e2030]">
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
              <h3 className="text-base font-bold text-white">Мэдүүлэгчийн мэдээлэл болон Лавлагаа шалгах</h3>
              <p className="text-xs text-[#8f95b2]">ЭСЯ руу илгээх хүний хувийн РД болон төрийн ХУР лавлагаа мэдээллийг холбоно уу.</p>
            </div>

            {/* Show toggle options depending on role */}
            {userRole === 'business_admin' ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#0e0f15] border border-[#1e2030] space-y-3">
                  <span className="text-[10px] text-[#8f95b2] font-mono uppercase tracking-wider block">Виз мэдүүлэх ажилтан сонгох</span>
                  <div className="flex flex-wrap gap-2">
                    {employees.map(emp => (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => onEmployeeSelection(emp.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          newApp.selectedEmployeeId === emp.id 
                            ? 'bg-[#0066ff]/10 border-[#0066ff] text-white' 
                            : 'bg-[#090a0f] border-[#1e2030] text-[#8f95b2] hover:text-white'
                        }`}
                      >
                        {emp.name} ({emp.position})
                      </button>
                    ))}
                  </div>
                </div>

                {newApp.selectedEmployeeId && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#0e0f15] border border-[#1e2030]">
                      <span className="text-[10px] text-[#8f95b2] font-mono">Ажилтны бүтэн нэр:</span>
                      <p className="text-xs font-bold text-white mt-1">{newApp.applicantName}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-[#0e0f15] border border-[#1e2030]">
                      <span className="text-[10px] text-[#8f95b2] font-mono">Регистрийн дугаар:</span>
                      <p className="text-xs font-mono font-bold text-white mt-1">{newApp.registerNo}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Selector B2C Tabs */}
                <div className="flex gap-4 p-1 bg-[#090a0f] rounded-lg border border-[#1e2030]">
                  <button 
                    type="button"
                    onClick={() => onApplicantTypeChange('myself')}
                    className={`flex-1 py-2 text-xs font-semibold rounded transition-all ${newApp.applicantType === 'myself' ? 'bg-[#181922] text-[#0066ff]' : 'text-[#8f95b2]'}`}
                  >
                    Миний бие өөрөө
                  </button>
                  <button 
                    type="button"
                    onClick={() => onApplicantTypeChange('family')}
                    className={`flex-1 py-2 text-xs font-semibold rounded transition-all ${newApp.applicantType === 'family' ? 'bg-[#181922] text-[#0066ff]' : 'text-[#8f95b2]'}`}
                  >
                    Гэр бүлийн гишүүн
                  </button>
                </div>

                {newApp.applicantType === 'family' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-[#0e0f15] border border-[#1e2030] space-y-1">
                      <span className="text-[10px] text-[#8f95b2] font-mono uppercase tracking-wider">Хамаарал</span>
                      <select 
                        value={newApp.applicantRelation}
                        onChange={(e) => setNewApp(prev => ({ ...prev, applicantRelation: e.target.value }))}
                        className="w-full bg-[#090a0f] border border-[#1e2030] rounded p-1.5 text-xs text-white focus:outline-none"
                      >
                        <option>Эхнэр/Нөхөр</option>
                        <option>Охин</option>
                        <option>Хүү</option>
                        <option>Аав</option>
                        <option>Ээж</option>
                      </select>
                    </div>
                    <div className="p-4 rounded-xl bg-[#0e0f15] border border-[#1e2030] space-y-1">
                      <span className="text-[10px] text-[#8f95b2] font-mono uppercase tracking-wider">Англи бүтэн нэр</span>
                      <input 
                        type="text" 
                        placeholder="Nergui Amin-Erdene"
                        value={newApp.applicantName} 
                        onChange={(e) => setNewApp(prev => ({ ...prev, applicantName: e.target.value }))}
                        className="w-full bg-[#090a0f] border border-[#1e2030] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div className="p-4 rounded-xl bg-[#0e0f15] border border-[#1e2030] space-y-1">
                      <span className="text-[10px] text-[#8f95b2] font-mono uppercase tracking-wider">Регистрийн дугаар</span>
                      <input 
                        type="text" 
                        placeholder="УУ18230492"
                        value={newApp.registerNo} 
                        onChange={(e) => setNewApp(prev => ({ ...prev, registerNo: e.target.value.toUpperCase() }))}
                        maxLength={10}
                        className="w-full bg-[#090a0f] border border-[#1e2030] rounded px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* KHUR Verification trigger */}
            <div className="space-y-4 pt-4 border-t border-[#1e2030]">
              <span className="text-xs font-bold text-white block">Төрийн мэдээлэл баталгаажуулалт (KHUR)</span>
              
              {userRole === 'business_admin' && newApp.selectedEmployeeId && (
                (() => {
                  const selectedEmp = employees.find(e => e.id === newApp.selectedEmployeeId);
                  const isEmpVerified = selectedEmp?.danVerified;
                  
                  if (!isEmpVerified) {
                    return (
                      <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-xl space-y-3">
                        <p className="text-xs text-rose-400 font-bold">
                          Ажилтан DAN системээр нэвтэрч баталгаажуулаагүй байна.
                        </p>
                        <p className="text-[10.5px] text-[#8f95b2] leading-relaxed">
                          Мэдээллийг татахын тулд ажилтан руу баталгаажуулах хүсэлт илгээнэ үү. Ажилтан гар утсан дээрээ зөвшөөрсний дараа ХУР лавлагаа идэвхжинэ.
                        </p>
                        {sendingSmsId === selectedEmp?.id ? (
                          <div className="flex items-center gap-2 text-[11px] text-[#0066ff] font-semibold py-1">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> SMS хүсэлт илгээж байна...
                          </div>
                        ) : smsSentEmployees.includes(selectedEmp?.id || "") ? (
                          <div className="space-y-2">
                            <p className="text-[11px] text-[#10b981] font-bold">✓ SMS хүсэлт илгээгдсэн. Ажилтны хариуг хүлээж байна...</p>
                            <p className="text-[10px] text-[#8f95b2] font-mono italic">Ажилтан баталгаажуулж байгааг загварчлахын тулд 3 секундын дараа автоматаар шинэчлэгдэнэ.</p>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onSendEmployeeSms(selectedEmp!.id)}
                            className="px-4 py-2 rounded-lg bg-[#0066ff] hover:bg-opacity-95 text-xs font-bold text-white transition-all shadow"
                          >
                            Баталгаажуулах SMS илгээх
                          </button>
                        )}
                      </div>
                    );
                  }
                  
                  return (
                    <>
                      {khurLoading ? (
                        <div className="p-6 bg-[#0e0f15] rounded-xl border border-[#1e2030] flex flex-col items-center justify-center gap-3 text-center">
                          <RefreshCw className="w-6 h-6 text-[#0066ff] animate-spin" />
                          <p className="text-[10px] font-mono text-[#8f95b2]">API Query: 150.129.143.18 / E-Mongolia secure link</p>
                        </div>
                      ) : newApp.khurChecked ? (
                        <div className="p-4 bg-[#10b981]/5 border border-[#10b981]/25 rounded-xl space-y-3">
                          <p className="text-xs text-white font-bold flex items-center gap-1.5">
                            <Check className="w-4 h-4 text-[#10b981]" /> Нийгмийн Даатгалын шимтгэл төлөлт баталгаажлаа.
                          </p>
                          <div className="grid grid-cols-2 gap-4 text-[10.5px] font-mono text-[#8f95b2] pt-2">
                            <div>Ажил олгогч: <span className="text-white font-bold">{newApp.khurEmployer}</span></div>
                            <div>Сүүлийн цалин: <span className="text-white font-bold">{newApp.khurSalary.toLocaleString()} ₮</span></div>
                          </div>
                        </div>
                      ) : (
                        <button 
                          type="button"
                          onClick={onPullKhurData}
                          className="w-full py-2.5 rounded-lg bg-[#0066ff] hover:bg-opacity-95 text-xs font-bold text-white transition-all shadow"
                        >
                          ХУР системээс ажил олгогч, даатгалын лавлагааг татах
                        </button>
                      )}
                    </>
                  );
                })()
              )}

              {userRole === 'individual' && newApp.applicantType === 'myself' && (
                <>
                  {!isUserVerified ? (
                    <div className="p-4 bg-amber-500/5 border border-amber-500/25 rounded-xl space-y-3">
                      <p className="text-xs text-amber-500 font-bold">
                        DAN системээр холбогдоогүй байна.
                      </p>
                      <p className="text-[10.5px] text-[#8f95b2] leading-relaxed">
                        ХУР системээс лавлагаа мэдээллээ татахын тулд эхлээд өөрийн биеэр нэвтэрч баталгаажсан байх шаардлагатай.
                      </p>
                      <button
                        type="button"
                        onClick={onOpenDanModal}
                        className="px-4 py-2 rounded-lg bg-[#0066ff] hover:bg-opacity-95 text-xs font-bold text-white transition-all shadow"
                      >
                        DAN системээр нэвтрэх
                      </button>
                    </div>
                  ) : (
                    <>
                      {khurLoading ? (
                        <div className="p-6 bg-[#0e0f15] rounded-xl border border-[#1e2030] flex flex-col items-center justify-center gap-3 text-center">
                          <RefreshCw className="w-6 h-6 text-[#0066ff] animate-spin" />
                          <p className="text-[10px] font-mono text-[#8f95b2]">API Query: 150.129.143.18 / E-Mongolia secure link</p>
                        </div>
                      ) : newApp.khurChecked ? (
                        <div className="p-4 bg-[#10b981]/5 border border-[#10b981]/25 rounded-xl space-y-3">
                          <p className="text-xs text-white font-bold flex items-center gap-1.5">
                            <Check className="w-4 h-4 text-[#10b981]" /> Нийгмийн Даатгалын шимтгэл төлөлт баталгаажлаа.
                          </p>
                          <div className="grid grid-cols-2 gap-4 text-[10.5px] font-mono text-[#8f95b2] pt-2">
                            <div>Ажил олгогч: <span className="text-white font-bold">{newApp.khurEmployer}</span></div>
                            <div>Сүүлийн цалин: <span className="text-white font-bold">{newApp.khurSalary.toLocaleString()} ₮</span></div>
                          </div>
                        </div>
                      ) : (
                        <button 
                          type="button"
                          onClick={onPullKhurData}
                          className="w-full py-2.5 rounded-lg bg-[#0066ff] hover:bg-opacity-95 text-xs font-bold text-white transition-all shadow"
                        >
                          ХУР системээс ажил олгогч, даатгалын лавлагааг татах
                        </button>
                      )}
                    </>
                  )}
                </>
              )}
            </div>

            <div className="flex justify-between pt-4 border-t border-[#1e2030]">
              <button 
                type="button"
                onClick={() => setNewApp(prev => ({ ...prev, step: 1 }))}
                className="px-4 py-2 rounded-lg border border-[#1e2030] hover:bg-[#12131a] text-xs font-semibold text-[#8f95b2]"
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
                className="px-5 py-2.5 rounded-lg bg-[#0066ff] hover:bg-opacity-95 text-white font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
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
              <h3 className="text-base font-bold text-white">Баримт бичгүүдийг хуулах</h3>
              <p className="text-xs text-[#8f95b2]">ЭСЯ-ны шаардлагын дагуу дараах баримтуудыг зөв хуулна уу.</p>
            </div>

            {/* Consumer-friendly B2C hints */}
            <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-[11px] leading-relaxed text-[#8f95b2] space-y-1">
              <p className="font-bold text-white flex items-center gap-1">
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
                  className="p-5 rounded-xl border border-[#1e2030] bg-[#0e0f15]/50 flex flex-col justify-between h-48"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.title}</h4>
                    {item.key === 'statement' && newApp.countryCode !== 'KR' ? (
                      <p className="text-[10px] text-[#8f95b2] mt-1 font-semibold text-amber-500">Сонголттой (Заавал биш)</p>
                    ) : (
                      <p className="text-[10px] text-[#8f95b2] mt-1">Шаардлагатай баримт</p>
                    )}
                  </div>

                  {item.file ? (
                    <div className="p-2 rounded bg-[#10b981]/5 border border-[#10b981]/25 flex items-center justify-between text-[9.5px] font-mono text-[#10b981] overflow-hidden">
                      <span className="truncate max-w-[130px]">{item.file}</span>
                      <Lock className="w-3 h-3 shrink-0 ml-1" />
                    </div>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => onFileUpload(item.key as 'passport' | 'statement' | 'photo')}
                      className="py-2.5 rounded-lg border border-dashed border-[#1e2030] hover:border-zinc-600 text-xs font-bold text-[#8f95b2] hover:text-white flex items-center justify-center gap-1.5 transition-all bg-[#090a0f]/50"
                    >
                      <Upload className="w-3.5 h-3.5" /> Файл хуулах
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4 border-t border-[#1e2030]">
              <button 
                type="button"
                onClick={() => setNewApp(prev => ({ ...prev, step: 2 }))}
                className="px-4 py-2 rounded-lg border border-[#1e2030] hover:bg-[#12131a] text-xs font-semibold text-[#8f95b2]"
              >
                Өмнөх
              </button>
              <button 
                type="button"
                onClick={onNextToPricing}
                className="px-5 py-2.5 rounded-lg bg-[#0066ff] hover:bg-opacity-95 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
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
              <h3 className="text-base font-bold text-white">Мэдүүлгийг хянах</h3>
              <p className="text-xs text-[#8f95b2]">ЭСЯ руу илгээхээс өмнө өөрийн мэдүүлгийн дүн болон мэдээллээ хянана уу.</p>
            </div>

            <div className="premium-card p-5 space-y-4 bg-[#090a0f] border border-[#1e2030] rounded-xl">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#8f95b2]">Мэдүүлэгч:</span>
                <span className="font-semibold text-white">
                  {newApp.applicantName} 
                  {newApp.applicantType === 'family' && ` (${newApp.applicantRelation})`}
                  {newApp.applicantType === 'employee' && ` (Ажилтан)`}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#8f95b2]">Улс / Виз:</span>
                <span className="font-semibold text-white">{newApp.country} ({newApp.visaType})</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#8f95b2]">Регистрийн дугаар:</span>
                <span className="font-mono text-white">{newApp.registerNo}</span>
              </div>

              <div className="h-px bg-[#1e2030]"></div>

              <div className="space-y-2 text-xs font-mono text-[#8f95b2]">
                <div className="flex justify-between">
                  <span>ЭСЯ визний хураамж:</span>
                  <span className="text-white">{newApp.embassyFee.toLocaleString()} ₮</span>
                </div>
                <div className="flex justify-between">
                  <span>Үйлчилгээний хөлс:</span>
                  <span className="text-white">{newApp.serviceFee.toLocaleString()} ₮</span>
                </div>
              </div>

              <div className="h-px bg-[#1e2030]"></div>

              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-[#8f95b2]">Нийт төлөх дүн:</span>
                <span className="font-mono text-[#0066ff]">{(newApp.embassyFee + newApp.serviceFee).toLocaleString()} ₮</span>
              </div>
            </div>

            {userRole === 'business_admin' ? (
              <div className="p-3 bg-[#0e0f15] rounded-lg border border-[#1e2030] text-[11px] leading-relaxed text-[#8f95b2] flex gap-2">
                <Info className="w-4 h-4 text-[#0066ff] shrink-0" />
                <p>Одоо төлөх эсвэл түр хадгалаад бусад ажилтны мэдүүлэгтэй нэгдсэн QPay нэхэмжлэхээр төлөх боломжтой.</p>
              </div>
            ) : (
              <div className="p-3 bg-[#0e0f15] rounded-lg border border-[#1e2030] flex items-center justify-between">
                <span className="text-[11px] text-slate-300 flex items-center gap-1.5">
                  <BellRing className="w-4 h-4 text-[#0066ff]" />
                  Явцын мэдээллийг SMS-ээр үнэгүй авах уу?
                </span>
                <input 
                  type="checkbox" 
                  checked={smsNotifications}
                  onChange={(e) => setSmsNotifications(e.target.checked)}
                  className="w-4 h-4 accent-[#0066ff]"
                />
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-[#1e2030] gap-3">
              <button 
                type="button"
                onClick={() => setNewApp(prev => ({ ...prev, step: 3 }))}
                className="px-4 py-2 rounded-lg border border-[#1e2030] hover:bg-[#12131a] text-xs font-semibold text-[#8f95b2]"
              >
                Өмнөх
              </button>
              
              {userRole === 'business_admin' && (
                <button 
                  type="button"
                  onClick={onSaveAsDraft}
                  className="px-4 py-2.5 rounded-lg border border-zinc-700 hover:bg-[#12131a] text-xs font-bold text-[#8f95b2]"
                >
                  Түр хадгалах (Нэгтгэж төлөх)
                </button>
              )}

              <button 
                type="button"
                onClick={onGenerateInvoice}
                className="px-5 py-2.5 rounded-lg bg-[#0066ff] hover:bg-opacity-95 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow"
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
