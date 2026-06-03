import React from "react";
import { motion } from "framer-motion";
import { VisaApplication } from "../types/visa";

interface ApplicationsListProps {
  userRole: 'individual' | 'business_admin';
  applications: VisaApplication[];
  openQPayInvoice: (appId: string, amount: number) => void;
  getStatusConfig: (status: VisaApplication['status']) => { text: string; bg: string; bar: string };
}

export default function ApplicationsList({
  userRole,
  applications,
  openQPayInvoice,
  getStatusConfig,
}: ApplicationsListProps) {
  
  const filteredApps = applications.filter(a => 
    userRole === 'business_admin' ? a.applicantType === 'employee' : a.applicantType !== 'employee'
  );

  return (
    <motion.div 
      key="applications"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.15 }}
      className="space-y-6 max-w-4xl"
    >
      <div className="space-y-1">
        <h3 className="text-base font-bold text-white">
          {userRole === 'business_admin' ? 'Ажилчдын виз мэдүүлгүүд' : 'Миний виз мэдүүлгүүд'}
        </h3>
        <p className="text-xs text-[#8f95b2]">
          {userRole === 'business_admin' 
            ? 'Байгууллагын ажилчдын нэр дээр гаргасан нийт визний явцыг хянах.'
            : 'ЭСЯ-нд илгээсэн болон төлбөр төлөх шаардлагатай мэдүүлгүүд.'}
        </p>
      </div>

      {filteredApps.map((app) => (
        <div key={app.id} className="premium-card p-5 space-y-4 relative overflow-hidden bg-[#0e0f15] border border-[#1e2030] rounded-xl">
          
          <div className={`absolute top-0 bottom-0 left-0 w-1 ${getStatusConfig(app.status).bar}`}></div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#181922] flex items-center justify-center font-bold text-xs text-white border border-[#1e2030] shrink-0">
                {app.countryCode}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  {app.country}
                  <span className="text-[9px] font-mono text-[#8f95b2] bg-[#1e2030] px-1.5 py-0.5 rounded border border-[#1e2030]">ID: {app.id}</span>
                </h4>
                <div className="flex items-center gap-2 text-xs text-[#8f95b2] mt-0.5">
                  <span>{app.visaType}</span>
                  <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                  <span className="font-semibold text-slate-300">
                    {app.applicantType === 'myself' ? 'Мэдүүлэгч: Өөрөө' : `${app.applicantRelation || 'Ажилтан'}: ${app.applicantName}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col items-end gap-2 shrink-0">
              <span className="text-xs font-mono text-slate-300">Нийт: {(app.embassyFee + app.serviceFee).toLocaleString()} ₮</span>
              <div className="flex items-center gap-2 mt-1">
                {(() => {
                  const conf = getStatusConfig(app.status);
                  return (
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${conf.bg}`}>
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
          </div>

          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-[#1e2030]">
            {[
              { title: "DAN Бүртгэл", active: true },
              { title: "KHUR Лавлагаа", active: app.status !== 'draft' },
              { title: "Төлбөр төлөлт", active: app.paymentStatus === 'paid' },
              { title: "ЭСЯ хяналт", active: app.status === 'approved', pulse: app.status === 'submitted' }
            ].map((step, idx) => (
              <div key={idx} className="space-y-1">
                <div className={`h-1 rounded transition-all ${
                  step.pulse 
                    ? 'bg-[#0066ff] animate-pulse' 
                    : step.active 
                      ? 'bg-[#10b981]' 
                      : 'bg-[#1e2030]'
                }`}></div>
                <p className={`text-[10px] font-bold ${step.active || step.pulse ? 'text-slate-200' : 'text-[#8f95b2]'}`}>{step.title}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </motion.div>
  );
}
