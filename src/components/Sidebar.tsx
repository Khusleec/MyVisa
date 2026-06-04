import React from "react";
import {
  Globe,
  Database,
  Plus,
  Users,
  FileText,
  Building,
  User,
  Settings,
  LogOut,
  MessageSquare,
  Sun,
  Moon,
} from "lucide-react";

export type AppTab = "dashboard" | "apply" | "applications" | "settings" | "chat";

interface SidebarProps {
  userRole: "individual" | "business_admin" | "visa_issuer";
  onRoleChange: (role: "individual" | "business_admin") => void;
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  applicationsCount: number;
  userName: string;
  userRegister: string;
  companyName: string;
  companyRegistration: string;
  onSignOut?: () => void;
  /** Hide demo role switcher when user only has one role from DB */
  showRoleSwitcher?: boolean;
  theme?: "light" | "dark";
  onThemeToggle?: () => void;
}

const navBtnClass = (active: boolean) =>
  `w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
    active
      ? "nav-item-active"
      : "text-[#8f95b2] hover:text-white hover:bg-[#12131a]/50"
  }`;

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
  onSignOut,
  showRoleSwitcher = true,
  theme = "dark",
  onThemeToggle,
}: SidebarProps) {
  const allNavItems: { id: AppTab; icon: React.ElementType; label: string; mobileLabel: string }[] = [
    {
      id: "dashboard",
      icon: Database,
      label: userRole === "business_admin" ? "Байгууллагын нүүр" : "Миний нүүр",
      mobileLabel: "Нүүр",
    },
    {
      id: "apply",
      icon: Plus,
      label: userRole === "business_admin" ? "Ажилтанд виз мэдүүлэх" : "Виз мэдүүлэх",
      mobileLabel: "Мэдүүлэх",
    },
    {
      id: "applications",
      icon: userRole === "business_admin" ? Users : FileText,
      label: userRole === "business_admin" ? "Ажилчдын визүүд" : "Миний визүүд",
      mobileLabel: "Визүүд",
    },
    {
      id: "chat",
      icon: MessageSquare,
      label: "Зурвас холбоо",
      mobileLabel: "Холбоо",
    },
    {
      id: "settings",
      icon: Settings,
      label: "Тохиргоо",
      mobileLabel: "Тохиргоо",
    },
  ];

  const navItems = allNavItems.filter(item => {
    if (userRole === 'visa_issuer') {
      return item.id === 'chat' || item.id === 'settings';
    }
    return true;
  });

  return (
    <>
      <aside className="w-full md:w-64 bg-[#0e0f15] border-b md:border-b-0 md:border-r border-[#1e2030] flex flex-col justify-between shrink-0 h-auto md:h-screen sticky top-0 z-30">
        <div>
          <div className="p-5 md:p-6 border-b border-[#1e2030] space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#0066ff] p-1.5 rounded-lg shadow-[0_0_20px_rgba(0,102,255,0.25)]">
                <Globe className="w-5 h-5 text-white" aria-hidden />
              </div>
              <div>
                <h1 className="text-base font-bold text-white tracking-tight">
                  MyVisa<span className="text-[#0066ff]">.mn</span>
                </h1>
                <p className="text-[9px] text-[#8f95b2] tracking-wider uppercase font-mono">
                  Виз мэдүүлэг
                </p>
              </div>
            </div>

            {showRoleSwitcher && (
              <div
                className="flex p-0.5 bg-[#090a0f] rounded-lg border border-[#1e2030]"
                role="tablist"
                aria-label="Хэрэглэгчийн төрөл"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={userRole === "individual"}
                  onClick={() => onRoleChange("individual")}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all ${
                    userRole === "individual"
                      ? "bg-[#181922] text-[#0066ff] border border-[#1e2030]"
                      : "text-[#8f95b2]"
                  }`}
                >
                  Иргэн
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={userRole === "business_admin"}
                  onClick={() => onRoleChange("business_admin")}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all ${
                    userRole === "business_admin"
                      ? "bg-[#181922] text-[#0066ff] border border-[#1e2030]"
                      : "text-[#8f95b2]"
                  }`}
                >
                  Бизнес
                </button>
              </div>
            )}
          </div>

          <nav className="hidden md:block p-4 space-y-1" aria-label="Үндсэн цэс">
            {navItems.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => onTabChange(id)}
                aria-current={activeTab === id ? "page" : undefined}
                className={
                  id === "applications"
                    ? `${navBtnClass(activeTab === id)} justify-between`
                    : navBtnClass(activeTab === id)
                }
              >
                <span className="flex items-center gap-3">
                  <Icon className="w-4 h-4" aria-hidden />
                  {label}
                </span>
                {id === "applications" && (
                  <span className="bg-[#1e2030] text-[#f4f5f6] text-[9.5px] px-2 py-0.5 rounded-full font-mono min-w-[1.25rem] text-center">
                    {applicationsCount}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="hidden md:block p-4 border-t border-[#1e2030]">
          <div className="flex flex-col gap-2.5 p-3 rounded-xl bg-[#12131a] border border-[#1e2030]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-[#1a1c29] flex items-center justify-center border border-[#1e2030] shrink-0">
                {userRole === "business_admin" ? (
                  <Building className="w-4 h-4 text-[#0066ff]" aria-hidden />
                ) : (
                  <User className="w-4 h-4 text-[#0066ff]" aria-hidden />
                )}
              </div>
              <div className="overflow-hidden min-w-0">
                <p className="text-[11.5px] font-bold text-white truncate">
                  {userRole === "business_admin" ? companyName : userName}
                </p>
                <p className="text-[9.5px] font-mono text-[#8f95b2] truncate">
                  {userRole === "business_admin"
                    ? `РД: ${companyRegistration}`
                    : userRegister}
                </p>
              </div>
            </div>
            {onThemeToggle && (
              <button
                type="button"
                onClick={onThemeToggle}
                className="w-full py-1.5 rounded-lg bg-[#1a1c29]/60 hover:bg-[#1f2133]/80 text-[#8f95b2] hover:text-white text-[10px] font-bold transition-all border border-[#1e2030] flex items-center justify-center gap-1.5 shadow-sm"
              >
                {theme === 'light' ? (
                  <>
                    <Moon className="w-3 h-3 text-[#3b82f6]" />
                    <span>Харанхуй горим</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-3 h-3 text-amber-400 animate-pulse" />
                    <span>Гэрэлт горим</span>
                  </>
                )}
              </button>
            )}
            {onSignOut && (
              <button
                type="button"
                onClick={onSignOut}
                className="w-full py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white text-[10px] font-bold transition-all border border-rose-500/20 flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" aria-hidden />
                Гарах
              </button>
            )}
          </div>
        </div>
      </aside>

      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0e0f15]/95 backdrop-blur-md border-t border-[#1e2030] pb-[var(--safe-bottom)]"
        aria-label="Гар утасны цэс"
      >
        <div className="flex justify-around items-center h-16 px-2 max-w-lg mx-auto">
          {navItems.map(({ id, icon: Icon, mobileLabel }) => (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              aria-current={activeTab === id ? "page" : undefined}
              className={`relative flex flex-col items-center justify-center gap-0.5 min-w-[4rem] py-2 rounded-lg transition-colors ${
                activeTab === id ? "text-[#0066ff]" : "text-[#8f95b2]"
              }`}
            >
              {activeTab === id && (
                <span
                  className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#0066ff] rounded-full"
                  aria-hidden
                />
              )}
              <span className="relative">
                <Icon className="w-5 h-5" aria-hidden />
                {id === "applications" && applicationsCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] px-0.5 rounded-full bg-[#0066ff] text-[8px] font-bold text-white flex items-center justify-center">
                    {applicationsCount > 9 ? "9+" : applicationsCount}
                  </span>
                )}
              </span>
              <span className="text-[9px] font-bold">{mobileLabel}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
