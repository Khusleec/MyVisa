"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Mail, Lock, User, Building, Phone, ArrowRight, RefreshCw, AlertCircle, CheckCircle2, Shield, FileCheck, Zap } from "lucide-react";
import { supabase } from "../lib/supabase";
import { fadeUp, slideInLeft, slideInRight, staggerContainer, staggerItem, motionTransition, springGentle } from "../lib/motion";


interface AuthProps {
  onAuthSuccess: () => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot_password' | 'resend_verification'>('login');
  const [roleType, setRoleType] = useState<'individual' | 'business'>('individual');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Forgot password & Resend verification email states
  const [forgotEmail, setForgotEmail] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  
  // Register Individual form state
  const [indName, setIndName] = useState("");
  const [indRegisterNo, setIndRegisterNo] = useState("");
  const [indPhone, setIndPhone] = useState("");
  const [indEmail, setIndEmail] = useState("");
  const [indPassword, setIndPassword] = useState("");
  
  // Register Business form state
  const [compName, setCompName] = useState("");
  const [compRegNo, setCompRegNo] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined;
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      setSuccessMessage("Нууц үг сэргээх холбоос таны и-мэйл рүү илгээгдлээ. Та и-мэйлээ шалгана уу.");
      setActiveTab('login');
      setForgotEmail("");
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || "Алдаа гарлаа. Та дахин оролдоно уу.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}` : undefined;
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: resendEmail,
        options: {
          emailRedirectTo: redirectUrl,
        }
      });

      if (error) throw error;

      setSuccessMessage("Баталгаажуулах и-мэйл амжилттай дахин илгээгдлээ. Та и-мэйлээ шалгана уу.");
      setActiveTab('login');
      setResendEmail("");
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || "Алдаа гарлаа. Та дахин оролдоно уу.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.session) {
        onAuthSuccess();
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || "Нэвтрэхэд алдаа гарлаа. Та мэдээллээ шалгана уу.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google') => {
    setErrorMessage(null);
    setLoading(true);
    try {
      const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}` : undefined;
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl
        }
      });
      if (error) throw error;
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || "Нэвтрэхэд алдаа гарлаа.");
      setLoading(false);
    }
  };

  const handleRegisterIndividual = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (!indName || !indRegisterNo || !indPhone || !indEmail || !indPassword) {
        throw new Error("Бүх талбарыг бөглөнө үү.");
      }

      if (indRegisterNo.length !== 10) {
        throw new Error("Регистрийн дугаар 10 оронтой байх ёстой.");
      }

      const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}` : undefined;
      const { error } = await supabase.auth.signUp({
        email: indEmail,
        password: indPassword,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: indName,
            register_no: indRegisterNo.toUpperCase(),
            phone: indPhone,
            role: 'individual',
            is_verified: false, // Must verify via DAN
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      setSuccessMessage("Бүртгэл амжилттай үүслээ! Та и-мэйл хаягаа шалгана уу.");
      setActiveTab('login');
      setLoginEmail(indEmail);
      setLoginPassword("");
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || "Бүртгэл үүсгэхэд алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    let createdCompanyId: string | null = null;

    try {
      if (!compName || !compRegNo || !adminName || !adminPhone || !adminEmail || !adminPassword) {
        throw new Error("Бүх талбарыг бөглөнө үү.");
      }

      // 1. Insert Company
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: compName,
          registration_no: compRegNo,
        })
        .select('id')
        .single();

      if (companyError) {
        throw new Error(`Байгууллага бүртгэхэд алдаа гарлаа: ${companyError.message}`);
      }

      createdCompanyId = companyData.id;

      // 2. Sign Up Business Admin
      const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}` : undefined;
      const { error: signUpError } = await supabase.auth.signUp({
        email: adminEmail,
        password: adminPassword,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: adminName,
            phone: adminPhone,
            role: 'business_admin',
            company_id: createdCompanyId,
            is_verified: true, // Business admin is auto-verified
          }
        }
      });

      if (signUpError) {
        // Rollback company insert
        await supabase.from('companies').delete().eq('id', createdCompanyId);
        throw new Error(signUpError.message);
      }

      setSuccessMessage("Байгууллагын бүртгэл амжилттай! Та и-мэйл хаягаа шалгана уу.");
      setActiveTab('login');
      setLoginEmail(adminEmail);
      setLoginPassword("");
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || "Бүртгэл үүсгэхэд алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  };

  const reduceMotion = useReducedMotion();

  return (
    <div className="auth-shell bg-surface text-foreground relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-accent/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[150px] pointer-events-none" />

      <motion.div
        className="auth-centered"
        initial="initial"
        animate="animate"
        variants={fadeUp}
        transition={motionTransition(reduceMotion, springGentle)}
      >
        {/* Hero — desktop, sits beside form in center */}
        <motion.div
          className="auth-hero"
          variants={slideInLeft}
          initial="initial"
          animate="animate"
          transition={motionTransition(reduceMotion, { ...springGentle, delay: 0.05 })}
        >
          <motion.div
            className="space-y-6 lg:space-y-8"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={staggerItem} className="space-y-3 lg:space-y-4">
              <motion.div
                whileHover={reduceMotion ? undefined : { scale: 1.03, rotate: -2 }}
                transition={springGentle}
                className="inline-flex bg-white p-3 rounded-2xl border border-accent/20 shadow-lg"
              >
                <Image src="/logo.png" alt="MyVisa.mn Logo" width={56} height={56} className="object-contain" priority />
              </motion.div>
              <h1 className="text-3xl lg:text-4xl font-black text-foreground tracking-tight leading-tight">
                MyVisa<span className="text-accent">.mn</span>
              </h1>
              <p className="text-sm lg:text-base text-muted leading-relaxed max-w-sm">
                ЭСЯ-ны нэгдсэн цахим виз мэдүүлгийн платформ — гэрээсээ бүрэн, аюулгүй, хялбар.
              </p>
            </motion.div>

            <motion.ul variants={staggerContainer} className="space-y-3 lg:space-y-4">
              {[
                { icon: Shield, text: "256-бит шифрлэлт, ДАН баталгаажуулалт" },
                { icon: FileCheck, text: "ХУР лавлагаа, баримт бичгийг нэг дороос" },
                { icon: Zap, text: "QPay төлбөр, ЭСЯ руу шууд илгээх" },
              ].map(({ icon: Icon, text }) => (
                <motion.li key={text} variants={staggerItem} className="flex items-center gap-3 text-sm text-muted">
                  <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-accent" />
                  </div>
                  <span className="leading-snug">{text}</span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </motion.div>

        {/* Form */}
        <motion.div
          className="auth-form-panel"
          variants={slideInRight}
          initial="initial"
          animate="animate"
          transition={motionTransition(reduceMotion, { ...springGentle, delay: 0.1 })}
        >
        <div className="w-full space-y-4 sm:space-y-5 min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={motionTransition(reduceMotion, springGentle)}
            className="text-center space-y-2 lg:hidden"
          >
            <div className="inline-flex bg-white p-2 rounded-2xl border border-accent/20 shadow-lg mb-1">
              <Image src="/logo.png" alt="MyVisa.mn Logo" width={44} height={44} className="object-contain" priority />
            </div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">
              MyVisa<span className="text-accent">.mn</span>
            </h1>
            <p className="text-sm text-muted">ЭСЯ-ны нэгдсэн цахим виз мэдүүлгийн платформ</p>
          </motion.div>

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              className="auth-alert auth-alert--error"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              className="auth-alert auth-alert--success"
              role="status"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </motion.div>
          )}

        <motion.div
          layout
          className="premium-card p-5 sm:p-6 md:p-8 bg-elevated/60 border border-line rounded-2xl shadow-xl space-y-5 sm:space-y-6 min-w-0"
        >

          {/* Signin vs Signup switch */}
          {activeTab === 'forgot_password' ? (
            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-bold text-foreground">Нууц үг сэргээх</h3>
              <p className="text-sm text-muted">Бүртгэлтэй и-мэйл хаягаа оруулж нууц үг сэргээх заавар авна уу.</p>
            </div>
          ) : activeTab === 'resend_verification' ? (
            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-bold text-foreground">Баталгаажуулах холбоос дахин илгээх</h3>
              <p className="text-sm text-muted">Хэрэв танд баталгаажуулах холбоос ирээгүй бол доор и-мэйлээ оруулна уу.</p>
            </div>
          ) : (
            <div className="segmented-control">
              <button 
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setErrorMessage(null);
                }}
                className={`segmented-control__btn ${activeTab === 'login' ? 'segmented-control__btn--active' : ''}`}
              >
                Нэвтрэх
              </button>
              <button 
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setErrorMessage(null);
                }}
                className={`segmented-control__btn ${activeTab === 'register' ? 'segmented-control__btn--active' : ''}`}
              >
                Бүртгүүлэх
              </button>
            </div>
          )}

          {activeTab === 'login' && (
            /* LOGIN FORM */
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="form-label">И-мэйл хаяг</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted absolute left-3 top-3" />
                  <input 
                    type="email" 
                    required
                    placeholder="name@company.com" 
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="input-field pl-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="form-label">Нууц үг</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-muted absolute left-3 top-3" />
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••" 
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="input-field pl-9"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary w-full mt-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Уншиж байна...
                  </>
                ) : (
                  <>
                    Нэвтрэх <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex flex-col gap-2 text-xs mt-2 text-center font-semibold text-muted">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('forgot_password');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="hover:text-accent transition-colors cursor-pointer"
                >
                  Нууц үгээ мартсан уу?
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('resend_verification');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="hover:text-accent transition-colors cursor-pointer"
                >
                  Баталгаажуулах и-мэйл дахин илгээх
                </button>
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-line/60"></div>
                <span className="flex-shrink mx-3 text-xs text-muted font-mono uppercase tracking-wider">Эсвэл</span>
                <div className="flex-grow border-t border-line/60"></div>
              </div>

              <button
                type="button"
                onClick={() => handleOAuthLogin('google')}
                className="btn-secondary w-full"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                <span>Google бүртгэлээр нэвтрэх</span>
              </button>
            </form>
          )}

          {activeTab === 'register' && (
            /* REGISTER FLOW */
            <div className="space-y-4">
              
              {/* Role Type Selector */}
              <div className="segmented-control">
                <button 
                  type="button"
                  onClick={() => setRoleType('individual')}
                  className={`segmented-control__btn ${roleType === 'individual' ? 'segmented-control__btn--active' : ''}`}
                >
                  Иргэн (B2C)
                </button>
                <button 
                  type="button"
                  onClick={() => setRoleType('business')}
                  className={`segmented-control__btn ${roleType === 'business' ? 'segmented-control__btn--active' : ''}`}
                >
                  Бизнес (B2B)
                </button>
              </div>

              {roleType === 'individual' ? (
                /* REGISTER INDIVIDUAL FORM */
                <form onSubmit={handleRegisterIndividual} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="form-label">Бүтэн Нэр (Англи)</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-muted absolute left-3 top-3" />
                      <input 
                        type="text" 
                        required
                        placeholder="Bat-Erdene Bold" 
                        value={indName}
                        onChange={(e) => setIndName(e.target.value)}
                        className="input-field pl-9"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="form-label">Регистрийн №</label>
                      <input 
                        type="text" 
                        required
                        placeholder="УУ94021512" 
                        maxLength={10}
                        value={indRegisterNo}
                        onChange={(e) => setIndRegisterNo(e.target.value)}
                        className="input-field font-mono"
                      />
                      <p className="form-hint">Хэлбэр: УУ12345678 (крилл 2 үсэг + 8 орон)</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="form-label">Утасны дугаар</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-muted absolute left-3 top-3" />
                        <input 
                          type="tel" 
                          required
                          placeholder="99112233" 
                          value={indPhone}
                          onChange={(e) => setIndPhone(e.target.value)}
                          className="input-field pl-9"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="form-label">И-мэйл хаяг</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-muted absolute left-3 top-3" />
                      <input 
                        type="email" 
                        required
                        placeholder="name@domain.com" 
                        value={indEmail}
                        onChange={(e) => setIndEmail(e.target.value)}
                        className="input-field pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="form-label">Нууц үг</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-muted absolute left-3 top-3" />
                      <input 
                        type="password" 
                        required
                        placeholder="••••••••" 
                        value={indPassword}
                        onChange={(e) => setIndPassword(e.target.value)}
                        className="input-field pl-9"
                      />
                    </div>
                    <p className="form-hint">Хамгийн багадаа 6 оронтой, үсэг тоо орсон байна.</p>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="btn-primary w-full mt-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Бүртгэж байна...
                      </>
                    ) : (
                      <>
                        Иргэнээр бүртгүүлэх <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <p className="text-xs text-muted text-center mt-3">
                    Бүртгүүлснээр та манай{" "}
                    <Link href="/legal" className="text-accent hover:underline">
                      Үйлчилгээний нөхцөл
                    </Link>{" "}
                    болон{" "}
                    <Link href="/legal" className="text-accent hover:underline">
                      Нууцлалын бодлого
                    </Link>{" "}
                    буюу хувийн мэдээлэл боловсруулах зөвшөөрлийг хүлээн зөвшөөрч байгаа болно.
                  </p>
                </form>
              ) : (
                /* REGISTER BUSINESS FORM */
                <form onSubmit={handleRegisterBusiness} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="form-label">Байгууллагын нэр</label>
                      <div className="relative">
                        <Building className="w-4 h-4 text-muted absolute left-3 top-3" />
                        <input 
                          type="text" 
                          required
                          placeholder="Терасофт Технологи ХХК" 
                          value={compName}
                          onChange={(e) => setCompName(e.target.value)}
                          className="input-field pl-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="form-label">Байгууллагын РД</label>
                      <input 
                        type="text" 
                        required
                        placeholder="5091234" 
                        value={compRegNo}
                        onChange={(e) => setCompRegNo(e.target.value)}
                        className="input-field font-mono"
                      />
                      <p className="form-hint">Хэлбэр: 7 оронтой тоо</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="form-label">Администраторын нэр (Англи)</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-muted absolute left-3 top-3" />
                      <input 
                        type="text" 
                        required
                        placeholder="Bat-Erdene Bold" 
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        className="input-field pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="form-label">Утасны дугаар</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-muted absolute left-3 top-3" />
                      <input 
                        type="tel" 
                        required
                        placeholder="99112233" 
                        value={adminPhone}
                        onChange={(e) => setAdminPhone(e.target.value)}
                        className="input-field pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="form-label">И-мэйл хаяг</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-muted absolute left-3 top-3" />
                      <input 
                        type="email" 
                        required
                        placeholder="hr@company.com" 
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        className="input-field pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="form-label">Нууц үг</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-muted absolute left-3 top-3" />
                      <input 
                        type="password" 
                        required
                        placeholder="••••••••" 
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="input-field pl-9"
                      />
                    </div>
                    <p className="form-hint">Хамгийн багадаа 6 оронтой, үсэг тоо орсон байна.</p>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="btn-primary w-full mt-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Бүртгэж байна...
                      </>
                    ) : (
                      <>
                        Байгууллага бүртгүүлэх <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <p className="text-xs text-muted text-center mt-3">
                    Бүртгүүлснээр танай байгууллага манай{" "}
                    <Link href="/legal" className="text-accent hover:underline">
                      Үйлчилгээний нөхцөл
                    </Link>{" "}
                    болон{" "}
                    <Link href="/legal" className="text-accent hover:underline">
                      Нууцлалын бодлого
                    </Link>{" "}
                    буюу мэдээлэл боловсруулах зөвшөөрлийг хүлээн зөвшөөрч байгаа болно.
                  </p>
                </form>
              )}
            </div>
          )}

          {activeTab === 'forgot_password' && (
            /* FORGOT PASSWORD FORM */
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="form-label">И-мэйл хаяг</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted absolute left-3 top-3" />
                  <input 
                    type="email" 
                    required
                    placeholder="name@domain.com" 
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="input-field pl-9"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary w-full mt-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Илгээж байна...
                  </>
                ) : (
                  <span>Холбоос илгээх</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="w-full py-2 text-xs font-bold text-muted hover:text-foreground transition-all block text-center cursor-pointer"
              >
                Буцах
              </button>
            </form>
          )}

          {activeTab === 'resend_verification' && (
            /* RESEND VERIFICATION FORM */
            <form onSubmit={handleResendVerification} className="space-y-4">
              <div className="space-y-1.5">
                <label className="form-label">И-мэйл хаяг</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-muted absolute left-3 top-3" />
                  <input 
                    type="email" 
                    required
                    placeholder="name@domain.com" 
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    className="input-field pl-9"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary w-full mt-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Илгээж байна...
                  </>
                ) : (
                  <span>Баталгаажуулалт дахин илгээх</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="w-full py-2 text-xs font-bold text-muted hover:text-foreground transition-all block text-center cursor-pointer"
              >
                Буцах
              </button>
            </form>
          )}

        </motion.div>
        </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
