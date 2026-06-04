"use client";

import React from "react";
import { motion } from "framer-motion";
import { BellRing, Shield, User, Building, LogOut, Globe } from "lucide-react";
import PageHeader from "./ui/PageHeader";

interface SettingsProps {
  userRole: "individual" | "business_admin" | "visa_issuer";
  userName: string;
  userRegister: string;
  userPhone: string;
  userEmail?: string;
  isUserVerified: boolean;
  companyName: string;
  companyRegistration: string;
  smsNotifications: boolean;
  onSmsToggle: (value: boolean) => void;
  onOpenDanModal: () => void;
  onSignOut: () => void;
}

export default function Settings({
  userRole,
  userName,
  userRegister,
  userPhone,
  userEmail,
  isUserVerified,
  companyName,
  companyRegistration,
  smsNotifications,
  onSmsToggle,
  onOpenDanModal,
  onSignOut,
}: SettingsProps) {
  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.15 }}
      className="space-y-6 max-w-2xl"
    >
      <PageHeader
        title="Тохиргоо"
        description="Профайл, мэдэгдэл болон баталгаажуулалтын тохиргоог эндээс удирдана."
      />

      <section className="premium-card p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-overlay border border-line flex items-center justify-center">
            {userRole === "business_admin" ? (
              <Building className="w-4 h-4 text-accent" />
            ) : userRole === "visa_issuer" ? (
              <Globe className="w-4 h-4 text-accent" />
            ) : (
              <User className="w-4 h-4 text-accent" />
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">
              {userRole === "business_admin" ? companyName : userName}
            </p>
            <p className="text-[10px] font-mono text-muted">
              {userRole === "business_admin"
                ? `РД: ${companyRegistration}`
                : userRole === "visa_issuer"
                  ? "Визний Ажилтан"
                  : userRegister}
            </p>
          </div>
        </div>
        <dl className="grid gap-2 text-xs border-t border-line pt-4">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Утас</dt>
            <dd className="font-mono text-foreground">{userPhone}</dd>
          </div>
          {userEmail && (
            <div className="flex justify-between gap-4">
              <dt className="text-muted">И-мэйл</dt>
              <dd className="text-foreground truncate max-w-[60%]">{userEmail}</dd>
            </div>
          )}
        </dl>
      </section>

      <section className="premium-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-accent" />
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">DAN баталгаажуулалт</h3>
        </div>
        <p className="text-xs text-muted leading-relaxed">
          Төрийн цахим нэвтрэлтээр ХУР лавлагаа татах эрхийг идэвхжүүлнэ.
        </p>
        <div className="flex items-center justify-between gap-3">
          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
              isUserVerified
                ? "bg-positive/10 text-positive border-positive/20"
                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
            }`}
          >
            {isUserVerified ? "Холбогдсон" : "Холбогдоогүй"}
          </span>
          {!isUserVerified && userRole === "individual" && (
            <button type="button" onClick={onOpenDanModal} className="btn-primary text-xs py-2 px-4">
              DAN холбох
            </button>
          )}
        </div>
      </section>

      <section className="premium-card p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <BellRing className="w-4 h-4 text-accent mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-foreground">SMS мэдэгдэл</p>
              <p className="text-[11px] text-muted mt-0.5">
                Визийн явц, төлбөр болон баталгаажуулалтын мэдээлэл
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={smsNotifications}
            onClick={() => onSmsToggle(!smsNotifications)}
            className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
              smsNotifications ? "bg-accent" : "bg-line"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                smsNotifications ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </section>

      <button
        type="button"
        onClick={onSignOut}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-negative/20 bg-negative/5 text-negative hover:bg-negative hover:text-white text-xs font-bold transition-all md:hidden"
      >
        <LogOut className="w-4 h-4" />
        Гарах
      </button>
    </motion.div>
  );
}
