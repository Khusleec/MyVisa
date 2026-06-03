import React from "react";
import { Info, CreditCard, Check, CheckSquare, Square } from "lucide-react";
import { motion } from "framer-motion";
import { VisaApplication, Employee } from "../types/visa";

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
      {/* Header Headline */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white tracking-tight">
          {userRole === 'business_admin' ? `Байгууллагын хянах хэсэг: ${companyName}` : `Сайн байна уу, ${userName.split(" ")[1]}?`}
        </h2>
        <p className="text-xs text-[#8f95b2]">
          {userRole === 'business_admin' 
            ? 'Ажилтны визний мэдүүлгийг хянах, нэгдсэн төлбөр тооцоо болон байгууллагын бүртгэл хөтлөх хэсэг.'
            : 'Визийн материалаа гэрээсээ бэлдэж, ЭСЯ руу шууд илгээнэ үү.'}
        </p>
      </div>

      {/* B2B Dynamic Banner Info Alert */}
      {userRole === 'business_admin' && (
        <div className="p-4 rounded-xl border border-[#0066ff]/20 bg-[#0066ff]/5 flex gap-3 text-xs leading-relaxed text-slate-300">
          <Info className="w-4.5 h-4.5 text-[#0066ff] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-white">Байгууллагын нэгдсэн нэхэмжлэх & цалин шалгалт</p>
            <p className="text-[11px] text-[#8f95b2]">
              Та ажилчдынхаа регистрийг оруулан ХУР системээр нийгмийн даатгалыг нь баталгаажуулж, бэлэн болсон визний төлбөрүүдийг нэгтгэн **QPay нэгдсэн нэхэмжлэхээр** байгууллагын данснаас settle хийх боломжтой.
            </p>
          </div>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {userRole === 'business_admin' ? (
          <>
            <div className="premium-card p-5 space-y-1 bg-[#0e0f15] border border-[#1e2030] rounded-xl">
              <p className="text-[10px] text-[#8f95b2] font-mono uppercase tracking-wider">Идэвхтэй Ажилчид</p>
              <p className="text-sm font-bold text-white">{employees.length} ажилтан</p>
              <p className="text-[10px] text-[#10b981] font-mono">3 нь DAN баталгаажуулсан</p>
            </div>
            <div className="premium-card p-5 space-y-1 bg-[#0e0f15] border border-[#1e2030] rounded-xl">
              <p className="text-[10px] text-[#8f95b2] font-mono uppercase tracking-wider">Нэгдсэн Виз шийдвэрлэлт</p>
              <p className="text-sm font-bold text-white">
                {b2bApplications.length} мэдүүлэг
              </p>
              <p className="text-[10px] text-[#8f95b2]">Шалгагдаж буй: 1</p>
            </div>
            <div className="premium-card p-5 space-y-1 bg-[#0e0f15] border border-[#1e2030] rounded-xl">
              <p className="text-[10px] text-[#8f95b2] font-mono uppercase tracking-wider">Байгууллагын РД</p>
              <p className="text-sm font-bold text-white">{companyRegistration}</p>
              <p className="text-[10px] text-[#0066ff] font-mono">Industry: {companyIndustry}</p>
            </div>
          </>
        ) : (
          <>
            <div className="premium-card p-5 space-y-1 bg-[#0e0f15] border border-[#1e2030] rounded-xl">
              <p className="text-[10px] text-[#8f95b2] font-mono uppercase tracking-wider">Биеийн Баталгаажуулалт</p>
              <p className="text-sm font-bold text-white">DAN Холбогдсон</p>
              <p className="text-[10px] text-[#10b981] font-mono">Нийгмийн даатгал идэвхтэй</p>
            </div>
            <div className="premium-card p-5 space-y-1 bg-[#0e0f15] border border-[#1e2030] rounded-xl">
              <p className="text-[10px] text-[#8f95b2] font-mono uppercase tracking-wider">Миний мэдүүлгүүд</p>
              <p className="text-sm font-bold text-white">
                Нийт {b2cApplications.length} мэдүүлэг
              </p>
              <p className="text-[10px] text-[#8f95b2]">Гэр бүлийн гишүүн: 1</p>
            </div>
            <div className="premium-card p-5 space-y-1 bg-[#0e0f15] border border-[#1e2030] rounded-xl">
              <p className="text-[10px] text-[#8f95b2] font-mono uppercase tracking-wider">Явцын мэдээлэл</p>
              <p className="text-sm font-bold text-white">SMS суваг идэвхтэй</p>
              <p className="text-[10px] text-[#0066ff] font-mono">{userPhone}</p>
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
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#8f95b2] font-mono">Ажилчдын виз мэдүүлгийн түүх</h4>
              
              {/* Bulk pay button */}
              {bulkSelectIds.length > 0 && (
                <button 
                  onClick={openBulkPaymentInvoice}
                  className="px-3.5 py-1.5 rounded-lg bg-[#0066ff] text-white text-xs font-bold hover:bg-opacity-95 transition-all flex items-center gap-1.5 shadow"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Сонгосон төлбөрийг хамт төлөх ({bulkSelectIds.length})
                </button>
              )}
            </div>
            
            <div className="premium-card overflow-hidden bg-[#0e0f15] border border-[#1e2030] rounded-xl">
              <div className="overflow-x-auto text-[12px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#12131a] border-b border-[#1e2030] text-[10px] font-mono text-[#8f95b2] uppercase">
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
                  <tbody className="divide-y divide-[#1e2030]">
                    {b2bApplications.map((app) => (
                      <tr key={app.id} className="hover:bg-[#12131a]/50 transition-colors">
                        <td className="p-4">
                          {app.paymentStatus === 'unpaid' ? (
                            <button 
                              onClick={() => onBulkSelectToggle(app.id)}
                              className="text-slate-400 hover:text-white"
                            >
                              {bulkSelectIds.includes(app.id) ? (
                                <CheckSquare className="w-4 h-4 text-[#0066ff]" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>
                          ) : (
                            <Check className="w-4 h-4 text-[#10b981] mx-auto" />
                          )}
                        </td>
                        <td className="p-4 font-bold text-white">{app.applicantName}</td>
                        <td className="p-4">
                          <span className="font-semibold text-white">{app.country}</span>
                          <p className="text-[10px] text-[#8f95b2]">{app.visaType}</p>
                        </td>
                        <td className="p-4 font-mono text-[#8f95b2]">{app.userRegister}</td>
                        <td className="p-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            app.paymentStatus === 'paid' ? 'bg-[#10b981]/15 text-[#10b981]' : 'bg-amber-500/10 text-amber-500'
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
                              className="text-xs font-semibold text-white bg-[#0066ff] hover:bg-opacity-95 px-2.5 py-1 rounded transition-all"
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
          </div>

          {/* Company Staff list section */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#8f95b2] font-mono">Ажилчдын бүртгэл</h4>
            <div className="premium-card overflow-hidden bg-[#0e0f15] border border-[#1e2030] rounded-xl">
              <div className="overflow-x-auto text-[12px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#12131a] border-b border-[#1e2030] text-[10px] font-mono text-[#8f95b2] uppercase">
                      <th className="p-4">ID</th>
                      <th className="p-4">Нэр</th>
                      <th className="p-4">РД</th>
                      <th className="p-4">Албан тушаал</th>
                      <th className="p-4">DAN систем</th>
                      <th className="p-4 text-right">Виз үүсгэх</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2030]">
                    {employees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-[#12131a]/50">
                        <td className="p-4 font-mono text-[#8f95b2]">{emp.id}</td>
                        <td className="p-4 font-bold text-white">{emp.name}</td>
                        <td className="p-4 font-mono text-white">{emp.registerNo}</td>
                        <td className="p-4 text-[#8f95b2]">{emp.position}</td>
                        <td className="p-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            emp.danVerified ? 'bg-[#10b981]/15 text-[#10b981]' : 'bg-zinc-800 text-[#8f95b2]'
                          }`}>
                            {emp.danVerified ? 'Баталгаажсан' : 'Холболтгүй'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => onStartEmployeeVisa(emp.id)}
                            className="text-xs font-semibold text-[#0066ff] hover:text-white border border-[#0066ff]/20 hover:bg-[#0066ff] px-2.5 py-1 rounded transition-all"
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
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#8f95b2] font-mono">Боломжит виз мэдүүлгүүд</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { name: "Өмнөд Солонгос", code: "KR", eFee: 110000, sFee: 40000, desc: "C-3-9 аялал жуулчлалын ангилал. НД шимтгэл 6+ сар төлсөн байх шаардлагатай." },
                { name: "Япон Улс", code: "JP", eFee: 50000, sFee: 30000, desc: "Богино хугацааны жуулчин. Хэвлэмэл бус QR-тай дансны хуулга шаардлагатай." },
                { name: "Герман (Шенген)", code: "DE", eFee: 290000, sFee: 50000, desc: "Шенгений жуулчны виз. Биометрик хурууны хээгээ биеэр өгнө." }
              ].map((visa) => (
                <div 
                  key={visa.code}
                  className="premium-card p-5 flex flex-col justify-between h-64 hover:border-zinc-700 transition-all bg-[#0e0f15] border border-[#1e2030] rounded-xl"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-[10px] font-bold text-white bg-[#1e2030] px-2 py-0.5 rounded">{visa.code}</span>
                      <span className="text-[10px] text-[#10b981] font-bold">ХУР холбогдсон</span>
                    </div>
                    <h5 className="text-sm font-bold text-white">{visa.name}</h5>
                    <p className="text-[11px] text-[#8f95b2] leading-relaxed">{visa.desc}</p>
                  </div>

                  <div className="border-t border-[#1e2030] pt-4 mt-2 space-y-3">
                    <div className="flex justify-between text-[11px] font-mono text-[#8f95b2]">
                      <span>ЭСЯ хураамж:</span>
                      <span className="text-white">{visa.eFee.toLocaleString()} ₮</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-mono text-[#8f95b2]">
                      <span>Үйлчилгээ:</span>
                      <span className="text-white">{visa.sFee.toLocaleString()} ₮</span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-xs font-bold font-mono text-white">{(visa.eFee + visa.sFee).toLocaleString()} ₮</span>
                      <button 
                        onClick={() => onStartB2CVisa(visa.name, visa.code, visa.eFee, visa.sFee)}
                        className="text-xs font-bold text-white bg-[#0066ff] hover:bg-opacity-95 px-3 py-1.5 rounded transition-all"
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
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#8f95b2] font-mono">Миний виз мэдүүлгийн түүх</h4>
            <div className="space-y-3">
              {b2cApplications.map((app) => (
                <div key={app.id} className="premium-card p-5 space-y-4 bg-[#0e0f15] border border-[#1e2030] rounded-xl">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h5 className="text-sm font-bold text-white flex items-center gap-2">
                        {app.country}
                        <span className="text-[10px] font-normal text-[#8f95b2]">({app.applicantType === 'myself' ? 'Өөрийн мэдүүлэг' : `${app.applicantRelation}: ${app.applicantName}`})</span>
                      </h5>
                      <p className="text-[11px] text-[#8f95b2] mt-0.5">{app.visaType} • ID: {app.id}</p>
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
                          className="px-3 py-1 rounded bg-[#0066ff] hover:bg-opacity-95 text-white text-[11px] font-bold transition-all shadow"
                        >
                          Төлөх
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#1e2030]">
                    {[
                      { label: "Бүртгэл", active: true },
                      { label: "Төрийн лавлагаа", active: app.status !== 'draft' },
                      { label: "Төлбөр төлөлт", active: app.paymentStatus === 'paid' },
                      { label: "ЭСЯ хяналт", active: app.status === 'approved', pulse: app.status === 'submitted' }
                    ].map((s, i) => (
                      <div key={i} className="space-y-1">
                        <div className={`h-1 rounded ${s.pulse ? 'bg-[#0066ff] animate-pulse' : s.active ? 'bg-[#10b981]' : 'bg-[#1e2030]'}`}></div>
                        <span className="text-[10px] font-bold text-white block">{s.label}</span>
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
