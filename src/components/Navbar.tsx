"use client";

import React, { useState } from "react";
import { motion, LayoutGroup, useReducedMotion } from "framer-motion";
import { springGentle } from "../lib/motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Database,
  Plus,
  FileText,
  Building,
  User as UserIcon,
  Settings as SettingsIcon,
  LogOut,
  MessageSquare,
  Sun,
  Moon,
  ChevronDown
} from "lucide-react";
import { useVisaAppContext } from "./providers/VisaAppContext";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const reduceMotion = useReducedMotion();

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

  const allNavItems = [
    {
      href: "/dashboard",
      icon: Database,
      label: userRole === "business_admin" ? "Байгууллагын нүүр" : "Нүүр",
      mobileLabel: "Нүүр",
    },
    {
      href: "/issuer",
      icon: FileText,
      label: "Виз хянах",
      mobileLabel: "Хянах",
    },
    {
      href: "/apply",
      icon: Plus,
      label: userRole === "business_admin" ? "Ажилтанд виз мэдүүлэх" : "Виз мэдүүлэх",
      mobileLabel: "Мэдүүлэх",
    },
    {
      href: "/applications",
      icon: FileText,
      label: "Миний хүсэлтүүд",
      mobileLabel: "Хүсэлтүүд",
      badge: applicationsCount,
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
      return item.href === '/issuer' || item.href === '/chat' || item.href === '/settings';
    }
    return item.href !== '/issuer';
  });

  const isActive = (href: string) => pathname === href;

  return (
    <div className="sticky top-3 z-40 px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto">
      <header className="border border-line/80 rounded-2xl bg-elevated/90 backdrop-blur-xl transition-all duration-200 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.12)]">
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
                <span className="text-xs text-muted tracking-wider uppercase font-mono leading-none">
                  Виз мэдүүлэг
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <LayoutGroup>
            <nav className="hidden md:flex items-center gap-1.5" aria-label="Үндсэн цэс">
              {navItems.map(({ href, icon: Icon, label, badge }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors duration-150 ${
                      active ? "text-accent" : "text-muted hover:text-foreground"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="desktop-nav-active"
                        className="absolute inset-0 bg-accent/10 border border-accent/20 rounded-xl shadow-sm"
                        transition={reduceMotion ? { duration: 0 } : springGentle}
                      />
                    )}
                    <Icon className="w-3.5 h-3.5 relative z-10" />
                    <span className="relative z-10">{label}</span>
                    {badge !== undefined && badge > 0 && (
                      <span className="relative z-10 ml-1 bg-accent/10 text-accent text-xs px-1.5 py-0.5 rounded-full font-mono font-bold">
                        {badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
            </LayoutGroup>
          </div>

          {/* Desktop Right: Controls & Profile */}
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
                  className={`py-1 px-3 text-xs font-bold rounded transition-all cursor-pointer ${
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
                  className={`py-1 px-3 text-xs font-bold rounded transition-all cursor-pointer ${
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
              className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-elevated/50 transition-colors border border-line/40 cursor-pointer"
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
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-elevated/50 transition-all border border-line/40 cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-overlay flex items-center justify-center border border-line shrink-0">
                  {userRole === "business_admin" ? (
                    <Building className="w-3.5 h-3.5 text-accent" />
                  ) : (
                    <UserIcon className="w-3.5 h-3.5 text-accent" />
                  )}
                </div>
                <div className="text-left max-w-[120px]">
                  <p className="text-xs font-bold text-foreground truncate leading-tight">
                    {userRole === "business_admin" ? company.name : user.name}
                  </p>
                  <p className="text-xs font-mono text-muted truncate leading-none mt-0.5">
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
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-negative hover:bg-negative/10 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Гарах</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile Right Controls: Profile Menu Toggle + Theme Toggle */}
          <div className="flex md:hidden items-center gap-2">
            {/* Theme Toggle Mobile */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-elevated/50 transition-colors cursor-pointer"
              aria-label="Харанхуй/гэрэлт горим шилжүүлэх"
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4 text-accent" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>
            
            {/* Mobile Profile Trigger (Replaces hamburger for clean space) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 rounded-xl hover:bg-elevated/50 transition-all border border-line/40 shrink-0 cursor-pointer"
              aria-label="Хэрэглэгчийн цэс"
            >
              <div className="w-7 h-7 rounded-lg bg-overlay flex items-center justify-center border border-line">
                {userRole === "business_admin" ? (
                  <Building className="w-4 h-4 text-accent" />
                ) : (
                  <UserIcon className="w-4 h-4 text-accent" />
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Profile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-line bg-surface px-4 py-3 space-y-3 shadow-lg animate-in slide-in-from-top duration-200">
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
                  <p className="text-xs font-mono text-muted truncate mt-0.5">
                    {userRole === "business_admin" ? `РД: ${company.registrationNo}` : user.registerNo}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleSignOut();
                }}
                className="py-1.5 px-3 rounded-lg bg-negative/15 text-negative border border-negative/20 text-xs font-bold flex items-center gap-1 hover:bg-negative hover:text-white transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Гарах</span>
              </button>
            </div>

            {/* Mobile Settings Link inside profile menu */}
            <div className="flex flex-col gap-2">
              <Link
                href="/settings"
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-elevated border border-line hover:bg-overlay/60 transition-colors text-xs font-bold text-foreground cursor-pointer"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <SettingsIcon className="w-4 h-4 text-accent" />
                <span>Тохиргоо</span>
              </Link>
            </div>

            {/* Role switcher inside mobile menu */}
            {showRoleSwitcher && (
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-mono text-muted uppercase tracking-wider block px-1">Харагдах байдал солих</span>
                <div className="flex p-0.5 bg-elevated rounded-lg border border-line w-full">
                  <button
                    type="button"
                    onClick={() => {
                      handleRoleToggle("individual");
                      router.push("/dashboard");
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex-1 py-1.5 text-xs font-bold rounded transition-all cursor-pointer ${
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
                    className={`flex-1 py-1.5 text-xs font-bold rounded transition-all cursor-pointer ${
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
          </div>
        )}
      </header>

      {/* Mobile Bottom Tab Bar */}
      <nav
        className="fixed bottom-3 left-3 right-3 z-50 md:hidden flex justify-around items-stretch gap-1 bg-elevated/92 backdrop-blur-xl border border-line/80 rounded-2xl shadow-[0_8px_32px_-8px_rgba(0,0,0,0.25)] px-1.5 py-1.5"
        style={{ height: "var(--mobile-nav-height)", marginBottom: "var(--safe-bottom)" }}
        aria-label="Гар утасны цэс"
      >
        <LayoutGroup>
        {navItems
          .filter((item) => item.href !== "/settings")
          .map(({ href, icon: Icon, mobileLabel, badge }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center justify-center flex-1 min-h-[44px] min-w-[44px] rounded-xl transition-colors relative ${
                  active ? "text-accent" : "text-muted hover:text-foreground"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="mobile-nav-active"
                    className="absolute inset-0 bg-accent/10 rounded-xl"
                    transition={reduceMotion ? { duration: 0 } : springGentle}
                  />
                )}
                <div className="relative z-10">
                  <Icon className="w-5 h-5" />
                  {badge !== undefined && badge > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 bg-negative text-white text-[9px] min-w-[1rem] h-4 px-1 rounded-full font-mono font-bold leading-none flex items-center justify-center">
                      {badge > 9 ? "9+" : badge}
                    </span>
                  )}
                </div>
                <span className={`relative z-10 text-[10px] font-semibold mt-1 ${active ? "text-accent" : ""}`}>
                  {mobileLabel}
                </span>
              </Link>
            );
          })}
        </LayoutGroup>
      </nav>
    </div>
  );
}
