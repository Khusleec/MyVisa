"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, User, Building, LogOut, Globe,
  Pencil, Camera, Check, X, Phone, Mail,
  CreditCard, AlertCircle, Upload, Trash2
} from "lucide-react";
import PageHeader from "./ui/PageHeader";
import ApplicationsList from "./ApplicationsList";
import { VisaApplication } from "../types/visa";

interface UserProfile {
  name: string;
  registerNo: string;
  phone: string;
  isVerified: boolean;
  profilePhoto: string | null;
}

interface SettingsProps {
  userRole: "individual" | "business_admin" | "visa_issuer";
  user: UserProfile;
  userEmail?: string;
  companyName: string;
  companyRegistration: string;
  onUpdateUser: (updates: Partial<UserProfile>) => void;
  onOpenDanModal: () => void;
  onSignOut: () => void;
  applications: VisaApplication[];
  openQPayInvoice: (appId: string, amount: number) => void;
  getStatusConfig: (status: VisaApplication["status"]) => { text: string; bg: string; bar: string };
  onGoToApply?: () => void;
}

export default function Settings({
  userRole,
  user,
  userEmail,
  companyName,
  companyRegistration,
  onUpdateUser,
  onOpenDanModal,
  onSignOut,
  applications,
  openQPayInvoice,
  getStatusConfig,
  onGoToApply,
}: SettingsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editPhone, setEditPhone] = useState(user.phone);
  const [editPhoto, setEditPhoto] = useState<string | null>(user.profilePhoto);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStartEdit = () => {
    setEditName(user.name);
    setEditPhone(user.phone);
    setEditPhoto(user.profilePhoto);
    setPhotoError(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditName(user.name);
    setEditPhone(user.phone);
    setEditPhoto(user.profilePhoto);
    setPhotoError(null);
    setIsEditing(false);
  };

  const handleSave = () => {
    onUpdateUser({
      name: editName.trim() || user.name,
      phone: editPhone.trim() || user.phone,
      profilePhoto: editPhoto,
    });
    setSaveSuccess(true);
    setIsEditing(false);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError(null);

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setPhotoError("Зөвхөн зураг оруулна уу (JPG, PNG, HEIC).");
      return;
    }
    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Зургийн хэмжээ 5MB-аас хэтрэхгүй байх ёстой.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setEditPhoto(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
    // reset input so same file can be reselected
    e.target.value = "";
  };

  const handleRemovePhoto = () => {
    setEditPhoto(null);
    setPhotoError(null);
  };

  const displayName = userRole === "business_admin" ? companyName : user.name;
  const displaySub =
    userRole === "business_admin"
      ? `РД: ${companyRegistration}`
      : userRole === "visa_issuer"
      ? "Визний Ажилтан"
      : user.registerNo;

  const currentPhoto = isEditing ? editPhoto : user.profilePhoto;

  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.15 }}
      className="space-y-5 max-w-2xl"
    >
      <PageHeader
        title="Тохиргоо"
        description="Профайл мэдээлэл, зураг болон баталгаажуулалтыг эндээс удирдана."
      />

      {/* ── Profile Card ── */}
      <section className="premium-card overflow-hidden">
        {/* Header strip */}
        <div
          className="h-16 w-full"
          style={{
            background:
              "linear-gradient(135deg, var(--color-cta) 0%, #60a5fa 100%)",
            opacity: 0.18,
          }}
        />

        <div className="px-5 pb-5 -mt-8 space-y-4">
          {/* Avatar + edit button row */}
          <div className="flex items-end justify-between">
            {/* Avatar */}
            <div className="relative group">
              <div
                className="w-16 h-16 rounded-2xl border-2 overflow-hidden flex items-center justify-center shadow-lg"
                style={{ borderColor: "var(--color-cta)", background: "var(--bg-card)" }}
              >
                {currentPhoto ? (
                  <img
                    src={currentPhoto}
                    alt="Профайл зураг"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ background: "var(--color-panel-hover-val)" }}
                  >
                    {userRole === "business_admin" ? (
                      <Building className="w-7 h-7 text-accent" />
                    ) : userRole === "visa_issuer" ? (
                      <Globe className="w-7 h-7 text-accent" />
                    ) : (
                      <User className="w-7 h-7 text-accent" />
                    )}
                  </div>
                )}
              </div>

              {/* Camera overlay when editing */}
              {isEditing && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 rounded-2xl flex items-center justify-center transition-all"
                  style={{ background: "rgba(0,0,0,0.45)" }}
                  aria-label="Зураг солих"
                >
                  <Camera className="w-5 h-5 text-white" />
                </button>
              )}

              {/* Verified badge */}
              {user.isVerified && (
                <span
                  className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center border-2 border-surface"
                  style={{ background: "var(--color-success)" }}
                >
                  <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                </span>
              )}
            </div>

            {/* Edit / Save / Cancel buttons */}
            <div className="flex items-center gap-2">
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.div
                    key="editing-btns"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center gap-2"
                  >
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line text-xs font-semibold text-muted hover:text-foreground hover:bg-elevated transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                      Болих
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      className="btn-primary flex items-center gap-1.5 px-4 py-1.5 text-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Хадгалах
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="view-btns"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center gap-2"
                  >
                    {saveSuccess && (
                      <span className="text-[11px] text-positive font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Хадгалагдлаа
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={handleStartEdit}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line text-xs font-semibold text-muted hover:text-foreground hover:bg-elevated transition-all"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Засах
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Profile info — view vs edit */}
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="edit-form"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="space-y-4"
              >
                {/* ID Photo upload area */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-muted uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-3 h-3" />
                    Иргэний үнэмлэхний зураг (Profile Photo)
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />

                  {editPhoto ? (
                    <div className="relative w-32 h-32 mx-auto rounded-2xl overflow-hidden border border-line bg-overlay flex items-center justify-center">
                      <img
                        src={editPhoto}
                        alt="ID зураг"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="p-1.5 rounded-lg bg-surface/85 border border-line hover:bg-elevated transition-all"
                          aria-label="Зураг солих"
                        >
                          <Upload className="w-3.5 h-3.5 text-accent" />
                        </button>
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="p-1.5 rounded-lg bg-surface/85 border border-negative/30 hover:bg-negative/10 transition-all"
                          aria-label="Зураг устгах"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-negative" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full rounded-xl border-2 border-dashed border-line hover:border-accent/50 hover:bg-accent/3 transition-all py-6 flex flex-col items-center justify-center gap-2 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-overlay group-hover:bg-accent/10 border border-line flex items-center justify-center transition-all">
                        <Camera className="w-5 h-5 text-muted group-hover:text-accent transition-colors" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-semibold text-foreground">Иргэний үнэмлэхний зураг оруулах</p>
                        <p className="text-[10px] text-muted mt-0.5">JPG, PNG, HEIC · Дээд тал нь 5MB</p>
                      </div>
                    </button>
                  )}

                  {photoError && (
                    <p className="text-[11px] text-negative flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {photoError}
                    </p>
                  )}
                </div>

                {/* Name field */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-muted uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3 h-3" />
                    Овог нэр
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="input-field text-sm font-semibold"
                    placeholder="Овог нэр оруулна уу"
                  />
                </div>

                {/* Phone field */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-muted uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="w-3 h-3" />
                    Утасны дугаар
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="input-field font-mono"
                    placeholder="+976 XXXX-XXXX"
                  />
                </div>

                {/* Register — read-only */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-muted uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-3 h-3" />
                    Регистрийн дугаар
                    <span className="ml-auto text-[9px] bg-overlay px-1.5 py-0.5 rounded font-normal">Өөрчлөх боломжгүй</span>
                  </label>
                  <input
                    type="text"
                    value={user.registerNo}
                    readOnly
                    className="input-field font-mono opacity-50 cursor-not-allowed"
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="view-info"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="space-y-1"
              >
                <p className="text-base font-bold text-foreground">{displayName}</p>
                <p className="text-[11px] font-mono text-muted">{displaySub}</p>

                <dl className="grid gap-2 text-xs pt-3 border-t border-line mt-3">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-muted flex items-center gap-1.5">
                      <Phone className="w-3 h-3" /> Утас
                    </dt>
                    <dd className="font-mono text-foreground">{user.phone}</dd>
                  </div>
                  {userEmail && (
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-muted flex items-center gap-1.5">
                        <Mail className="w-3 h-3" /> И-мэйл
                      </dt>
                      <dd className="text-foreground truncate max-w-[60%]">{userEmail}</dd>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-muted flex items-center gap-1.5">
                      <CreditCard className="w-3 h-3" /> Регистр
                    </dt>
                    <dd className="font-mono text-foreground">{user.registerNo}</dd>
                  </div>
                </dl>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── DAN verification ── */}
      {userRole !== "business_admin" && (
        <section className="premium-card p-5 space-y-3">
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
                user.isVerified
                  ? "bg-positive/10 text-positive border-positive/20"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
              }`}
            >
              {user.isVerified ? "✓ Холбогдсон" : "Холбогдоогүй"}
            </span>
            {!user.isVerified && userRole === "individual" && (
              <button type="button" onClick={onOpenDanModal} className="btn-primary text-xs py-2 px-4">
                DAN холбох
              </button>
            )}
          </div>
        </section>
      )}

      {/* ── Applications / Requests list ── */}
      {userRole !== 'visa_issuer' && (
        <section className="pt-4 border-t border-line mt-4">
          <ApplicationsList
            userRole={userRole as 'individual' | 'business_admin'}
            applications={applications}
            openQPayInvoice={openQPayInvoice}
            getStatusConfig={getStatusConfig}
            onGoToApply={onGoToApply}
          />
        </section>
      )}

      {/* ── Sign out (mobile only) ── */}
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
