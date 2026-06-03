import React from "react";
import { Globe, Database, Plus, Users, FileText, Building, User } from "lucide-react";

interface SidebarProps {
  userRole: 'individual' | 'business_admin';
  onRoleChange: (role: 'individual' | 'business_admin') => void;
  activeTab: 'dashboard' | 'apply' | 'applications' | 'settings';
  onTabChange: (tab: 'dashboard' | 'apply' | 'applications' | 'settings') => void;
  applicationsCount: number;
  userName: string;
  userRegister: string;
  companyName: string;
  companyRegistration: string;
}

export default function Sidebar({
  userRole,
  onRoleChange,
  activeTab,
  onTabChange,
  applicationsCount,
  userName,
  userRegister,
  companyName,
  companyRegistration,
}: SidebarProps) {
  return (
    <>
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-[#0e0f15] border-b md:border-b-0 md:border-r border-[#1e2030] flex flex-col justify-between shrink-0 h-auto md:h-screen sticky top-0 z-30">
        <div>
          {/* Brand Logo & Role Switcher */}
          <div className="p-6 border-b border-[#1e2030] space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#0066ff] p-1.5 rounded-lg">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-0.5">
                  MyVisa<span className="text-[#0066ff]">.mn</span>
                </h1>
                <p className="text-[9px] text-[#8f95b2] tracking-wider uppercase font-mono">Mongolian Portal</p>
              </div>
            </div>

            {/* B2C & B2B Switcher */}
            <div className="flex p-0.5 bg-[#090a0f] rounded-lg border border-[#1e2030]">
              <button 
                onClick={() => onRoleChange('individual')}
                className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all ${userRole === 'individual' ? 'bg-[#181922] text-[#0066ff] border border-[#1e2030]' : 'text-[#8f95b2]'}`}
              >
                Иргэн 
              </button>
              <button 
                onClick={() => onRoleChange('business_admin')}
                className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all ${userRole === 'business_admin' ? 'bg-[#181922] text-[#0066ff] border border-[#1e2030]' : 'text-[#8f95b2]'}`}
              >
                Бизнес 
              </button>
            </div>
          </div>

          {/* Desktop Navigation Items */}
          <nav className="hidden md:block p-4 space-y-1.5">
            <button 
              onClick={() => onTabChange('dashboard')} 
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'dashboard' ? 'bg-[#181922] text-[#0066ff] border-l-2 border-[#0066ff]' : 'text-[#8f95b2] hover:text-white hover:bg-[#12131a]/50'}`}
            >
              <Database className="w-4 h-4" />
              {userRole === 'business_admin' ? 'Байгууллагын нүүр' : 'Миний нүүр'}
            </button>
            <button 
              onClick={() => onTabChange('apply')} 
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'apply' ? 'bg-[#181922] text-[#0066ff] border-l-2 border-[#0066ff]' : 'text-[#8f95b2] hover:text-white hover:bg-[#12131a]/50'}`}
            >
              <span className="flex items-center gap-3">
                <Plus className="w-4 h-4" />
                {userRole === 'business_admin' ? 'Ажилтанд виз мэдүүлэх' : 'Виз мэдүүлэх'}
              </span>
            </button>
            <button 
              onClick={() => onTabChange('applications')} 
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'applications' ? 'bg-[#181922] text-[#0066ff] border-l-2 border-[#0066ff]' : 'text-[#8f95b2] hover:text-white hover:bg-[#12131a]/50'}`}
            >
              <span className="flex items-center gap-3">
                {userRole === 'business_admin' ? <Users className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                {userRole === 'business_admin' ? 'Ажилчдын визүүд' : 'Миний визүүд'}
              </span>
              <span className="bg-[#1e2030] text-[#f4f5f6] text-[9.5px] px-2 py-0.5 rounded-full font-mono">
                {applicationsCount}
              </span>
            </button>
          </nav>
        </div>

        {/* Desktop Profile Status */}
        <div className="hidden md:block p-4 border-t border-[#1e2030] space-y-4">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-[#12131a] border border-[#1e2030]">
            <div className="w-9 h-9 rounded-lg bg-[#1a1c29] flex items-center justify-center border border-[#1e2030] shrink-0 text-slate-300">
              {userRole === 'business_admin' ? <Building className="w-4 h-4 text-[#0066ff]" /> : <User className="w-4 h-4" />}
            </div>
            <div className="overflow-hidden">
              <p className="text-[11.5px] font-bold text-white truncate flex items-center gap-1">
                {userRole === 'business_admin' ? companyName : userName}
              </p>
              <p className="text-[9.5px] font-mono text-[#8f95b2] truncate">
                {userRole === 'business_admin' ? `Бүртгэл: ${companyRegistration}` : userRegister}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE BOTTOM TAB NAVIGATION */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0e0f15] border-t border-[#1e2030] z-40 flex justify-around items-center px-4">
        <button 
          onClick={() => onTabChange('dashboard')} 
          className={`flex flex-col items-center gap-1 text-[9px] font-bold transition-all ${activeTab === 'dashboard' ? 'text-[#0066ff]' : 'text-[#8f95b2]'}`}
        >
          <Database className="w-5 h-5" />
          <span>Нүүр</span>
        </button>
        <button 
          onClick={() => onTabChange('apply')} 
          className={`flex flex-col items-center gap-1 text-[9px] font-bold transition-all ${activeTab === 'apply' ? 'text-[#0066ff]' : 'text-[#8f95b2]'}`}
        >
          <Plus className="w-5 h-5" />
          <span>Мэдүүлэх</span>
        </button>
        <button 
          onClick={() => onTabChange('applications')} 
          className={`flex flex-col items-center gap-1 text-[9px] font-bold transition-all ${activeTab === 'applications' ? 'text-[#0066ff]' : 'text-[#8f95b2]'}`}
        >
          <Users className="w-5 h-5" />
          <span>Визүүд</span>
        </button>
      </div>
    </>
  );
}
