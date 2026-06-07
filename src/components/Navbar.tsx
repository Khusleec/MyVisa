"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Database,
  Plus,
  Users,
  FileText,
  Building,
  User as UserIcon,
  Settings as SettingsIcon,
  LogOut,
  MessageSquare,
  Sun,
  Moon,
  Menu,
  X,
  ChevronDown
} from "lucide-react";
import { useVisaAppContext } from "./providers/VisaAppContext";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const {
    userRole,
    handleRoleToggle,
    applications,
    user,
    company,
    profile,
    theme,
    toggleTheme,
    handleSignOut
  } = useVisaAppContext();

  // If user is not logged in, we don't render the navbar (handled at layout level)
  if (!profile) return null;

  const applicationsCount = userRole === 'business_admin' 
    ? applications.filter(a => a.applicantType === 'employee').length 
    : applications.filter(a => a.applicantType !== 'employee').length;

  const showRoleSwitcher = profile?.role === "business_admin";

  const allNavItems: { href: string; icon: React.ElementType; label: string; mobileLabel: string; badge?: number }[] = [
    {
      href: "/dashboard",
      icon: Database,
      label: userRole === "business_admin" ? "Байгууллагын нүүр" : "Нүүр",
      mobileLabel: "Нүүр",
    },
    {
      href: "/apply",
      icon: Plus,
      label: userRole === "business_admin" ? "Ажилтанд виз мэдүүлэх" : "Виз мэдүүлэх",
      mobileLabel: "Мэдүүлэх",
    },
    {
      href: "/chat",
      icon: MessageSquare,
      label: "Зурвас холбоо",
      mobileLabel: "Холбоо",
    },
    {
      href: "/settings",
      icon: SettingsIcon,
      label: "Тохиргоо",
      mobileLabel: "Тохиргоо",
    },
  ];

  const navItems = allNavItems.filter(item => {
    if (userRole === 'visa_issuer') {
      return item.href === '/chat' || item.href === '/settings';
    }
    return true;
  });

  const isActive = (href: string) => pathname === href;

  return (
    <div className="sticky top-4 z-40 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto">
      <header className="border border-line rounded-2xl bg-surface/80 backdrop-blur-md transition-all duration-200 shadow-md">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Branding */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2.5 transition-transform hover:scale-102">
            <div className="w-8 h-8 rounded-lg overflow-hidden shadow-[0_0_15px_rgba(59,130,246,0.2)] shrink-0 bg-white flex items-center justify-center border border-line/50">
              <Image src="/logo.png" alt="MyVisa.mn Logo" width={24} height={24} className="object-contain" priority />
            </div>
            <div>
              <h1 className="text-sm font-black text-foreground tracking-tight leading-none">
                MyVisa<span className="text-accent">.mn</span>
              </h1>
              <span className="text-[8.5px] text-muted tracking-wider uppercase font-mono leading-none">
                Виз мэдүүлэг
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5" aria-label="Үндсэн цэс">
            {navItems.map(({ href, icon: Icon, label, badge }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  isActive(href)
                    ? "bg-elevated text-accent border border-line"
                    : "text-muted hover:text-foreground hover:bg-elevated/40"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
                {badge !== undefined && badge > 0 && (
                  <span className="ml-1 bg-accent/10 text-accent text-[9.5px] px-1.5 py-0.5 rounded-full font-mono font-bold">
                    {badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right: Controls & Profile */}
        <div className="hidden md:flex items-center gap-3">
          {/* Role Switcher */}
          {showRoleSwitcher && (
            <div className="flex p-0.5 bg-surface rounded-lg border border-line" role="tablist" aria-label="Хэрэглэгчийн төрөл">
              <button
                type="button"
                onClick={() => {
                  handleRoleToggle("individual");
                  router.push("/dashboard");
                }}
                className={`py-1 px-3 text-[10px] font-bold rounded transition-all ${
                  userRole === "individual"
                    ? "bg-elevated text-accent border border-line shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                Иргэн
              </button>
              <button
                type="button"
                onClick={() => {
                  handleRoleToggle("business_admin");
                  router.push("/dashboard");
                }}
                className={`py-1 px-3 text-[10px] font-bold rounded transition-all ${
                  userRole === "business_admin"
                    ? "bg-elevated text-accent border border-line shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                Бизнес
              </button>
            </div>
          )}

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-elevated/50 transition-colors border border-line/40"
            aria-label="Харанхуй/гэрэлт горим шилжүүлэх"
          >
            {theme === "light" ? (
              <Moon className="w-4 h-4 text-accent" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-elevated/50 transition-all border border-line/40"
            >
              <div className="w-7 h-7 rounded-lg bg-overlay flex items-center justify-center border border-line shrink-0">
                {userRole === "business_admin" ? (
                  <Building className="w-3.5 h-3.5 text-accent" />
                ) : (
                  <UserIcon className="w-3.5 h-3.5 text-accent" />
                )}
              </div>
              <div className="text-left max-w-[120px]">
                <p className="text-[11px] font-bold text-foreground truncate leading-tight">
                  {userRole === "business_admin" ? company.name : user.name}
                </p>
                <p className="text-[9px] font-mono text-muted truncate leading-none">
                  {userRole === "business_admin" ? `РД: ${company.registrationNo}` : user.registerNo}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted shrink-0" />
            </button>

            {isProfileDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsProfileDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-elevated border border-line shadow-xl py-1 z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                  <Link
                    href="/settings"
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-foreground hover:bg-overlay/60 transition-colors"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    <SettingsIcon className="w-4 h-4 text-muted" />
                    <span>Тохиргоо</span>
                  </Link>
                  <hr className="border-line my-1" />
                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      handleSignOut();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-negative hover:bg-negative/10 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Гарах</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile controls: Burger Menu + Theme Toggle */}
        <div className="flex md:hidden items-center gap-2">
          {/* Theme Toggle Mobile */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-elevated/50 transition-colors"
            aria-label="Харанхуй/гэрэлт горим шилжүүлэх"
          >
            {theme === "light" ? (
              <Moon className="w-4 h-4 text-accent" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>
          
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-elevated/50 transition-colors border border-line/50"
            aria-label="Цэс нээх хаах"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-down Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-line bg-surface px-4 py-3 space-y-3 shadow-lg animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col gap-1">
            {navItems.map(({ href, icon: Icon, label, badge }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  isActive(href)
                    ? "bg-elevated text-accent border border-line"
                    : "text-muted hover:text-foreground hover:bg-elevated/40"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  {label}
                </span>
                {badge !== undefined && badge > 0 && (
                  <span className="bg-accent/10 text-accent text-[9.5px] px-2 py-0.5 rounded-full font-mono font-bold">
                    {badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <hr className="border-line" />

          {/* Role switcher inside mobile menu */}
          {showRoleSwitcher && (
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono text-muted uppercase tracking-wider block px-1">Хэрэглэгчийн Төрөл</span>
              <div className="flex p-0.5 bg-elevated rounded-lg border border-line w-full">
                <button
                  type="button"
                  onClick={() => {
                    handleRoleToggle("individual");
                    router.push("/dashboard");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all ${
                    userRole === "individual"
                      ? "bg-surface text-accent border border-line shadow-sm"
                      : "text-muted"
                  }`}
                >
                  Иргэн
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleRoleToggle("business_admin");
                    router.push("/dashboard");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all ${
                    userRole === "business_admin"
                      ? "bg-surface text-accent border border-line shadow-sm"
                      : "text-muted"
                  }`}
                >
                  Бизнес
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-elevated border border-line/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-overlay flex items-center justify-center border border-line shrink-0">
                {userRole === "business_admin" ? (
                  <Building className="w-4 h-4 text-accent" />
                ) : (
                  <UserIcon className="w-4 h-4 text-accent" />
                )}
              </div>
              <div className="overflow-hidden min-w-0">
                <p className="text-xs font-bold text-foreground truncate">
                  {userRole === "business_admin" ? company.name : user.name}
                </p>
                <p className="text-[9px] font-mono text-muted truncate">
                  {userRole === "business_admin" ? `РД: ${company.registrationNo}` : user.registerNo}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleSignOut();
              }}
              className="py-1.5 px-3 rounded-lg bg-negative/15 text-negative border border-negative/20 text-[10px] font-bold flex items-center gap-1 hover:bg-negative hover:text-white transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Гарах</span>
            </button>
          </div>
        </div>
      )}
      </header>
    </div>
  );
}
