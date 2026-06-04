import React, { useState } from "react";
import { Mail, Lock, User, Building, Phone, ArrowRight, Globe, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "../lib/supabase";


interface AuthProps {
  onAuthSuccess: () => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [roleType, setRoleType] = useState<'individual' | 'business'>('individual');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
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

  return (
    <div className="min-h-screen bg-[#090a0f] text-[#f4f5f6] flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
      
      {/* Background radial glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#0066ff]/10 blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[150px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10 space-y-6">
        
        {/* Branding header */}
        <div className="text-center space-y-2">
          <div className="inline-flex bg-[#0066ff]/10 p-2.5 rounded-2xl border border-[#0066ff]/20 mb-1">
            <Globe className="w-8 h-8 text-[#0066ff]" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            MyVisa<span className="text-[#0066ff]">.mn</span>
          </h1>
          <p className="text-xs text-[#8f95b2]">ЭСЯ-ны нэгдсэн цахим виз мэдүүлгийн платформ</p>
        </div>

        {/* Success/Error Alerts */}
        {errorMessage && (
          <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-xs text-rose-400 flex gap-2.5 items-start">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-xs text-emerald-400 flex gap-2.5 items-start">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Auth Glass Card */}
        <div className="premium-card p-6 md:p-8 bg-[#0e0f15] border border-[#1e2030] rounded-2xl shadow-2xl space-y-6">
          
          {/* Signin vs Signup switch */}
          <div className="flex p-1 bg-[#090a0f] rounded-xl border border-[#1e2030]">
            <button 
              onClick={() => {
                setActiveTab('login');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'login' 
                  ? 'bg-[#181922] text-[#0066ff] border border-[#1e2030]' 
                  : 'text-[#8f95b2] hover:text-white'
              }`}
            >
              Нэвтрэх
            </button>
            <button 
              onClick={() => {
                setActiveTab('register');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'register' 
                  ? 'bg-[#181922] text-[#0066ff] border border-[#1e2030]' 
                  : 'text-[#8f95b2] hover:text-white'
              }`}
            >
              Бүртгүүлэх
            </button>
          </div>

          {activeTab === 'login' ? (
            /* LOGIN FORM */
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-[#8f95b2] font-mono uppercase tracking-wider block">И-мэйл хаяг</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8f95b2] absolute left-3 top-3" />
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
                <label className="text-[10px] text-[#8f95b2] font-mono uppercase tracking-wider block">Нууц үг</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8f95b2] absolute left-3 top-3" />
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
                className="w-full py-2.5 bg-[#0066ff] hover:bg-opacity-95 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Уншиж байна...
                  </>
                ) : (
                  <>
                    Нэвтрэх <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-[#1e2030]/60"></div>
                <span className="flex-shrink mx-3 text-[10px] text-[#8f95b2] font-mono uppercase tracking-wider">Эсвэл</span>
                <div className="flex-grow border-t border-[#1e2030]/60"></div>
              </div>

              <button
                type="button"
                onClick={() => handleOAuthLogin('google')}
                className="w-full py-2.5 bg-[#12131a] hover:bg-[#1a1c29] border border-[#1e2030] hover:border-zinc-700 text-white text-[11px] font-bold rounded-xl flex items-center justify-center gap-2.5 transition-all shadow"
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
          ) : (
            /* REGISTER FLOW */
            <div className="space-y-4">
              
              {/* Role Type Selector */}
              <div className="flex gap-4 p-1 bg-[#090a0f] rounded-lg border border-[#1e2030]">
                <button 
                  onClick={() => setRoleType('individual')}
                  className={`flex-1 py-1.5 text-[10.5px] font-semibold rounded transition-all ${
                    roleType === 'individual' 
                      ? 'bg-[#181922] text-[#0066ff]' 
                      : 'text-[#8f95b2]'
                  }`}
                >
                  Иргэн (B2C)
                </button>
                <button 
                  onClick={() => setRoleType('business')}
                  className={`flex-1 py-1.5 text-[10.5px] font-semibold rounded transition-all ${
                    roleType === 'business' 
                      ? 'bg-[#181922] text-[#0066ff]' 
                      : 'text-[#8f95b2]'
                  }`}
                >
                  Бизнес/Аж ахуйн нэгж (B2B)
                </button>
              </div>

              {roleType === 'individual' ? (
                /* REGISTER INDIVIDUAL FORM */
                <form onSubmit={handleRegisterIndividual} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-[#8f95b2] font-mono uppercase tracking-wider block">Бүтэн Нэр (Англи)</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#8f95b2] absolute left-3 top-3" />
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

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-[#8f95b2] font-mono uppercase tracking-wider block">Регистрийн №</label>
                      <input 
                        type="text" 
                        required
                        placeholder="УУ94021512" 
                        maxLength={10}
                        value={indRegisterNo}
                        onChange={(e) => setIndRegisterNo(e.target.value)}
                        className="w-full bg-[#090a0f] border border-[#1e2030] hover:border-zinc-700 focus:border-[#0066ff] rounded-xl px-3 py-2.5 text-xs font-mono text-white focus:outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-[#8f95b2] font-mono uppercase tracking-wider block">Утасны дугаар</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-[#8f95b2] absolute left-3 top-3" />
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
                    <label className="text-[10px] text-[#8f95b2] font-mono uppercase tracking-wider block">И-мэйл хаяг</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#8f95b2] absolute left-3 top-3" />
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
                    <label className="text-[10px] text-[#8f95b2] font-mono uppercase tracking-wider block">Нууц үг</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#8f95b2] absolute left-3 top-3" />
                      <input 
                        type="password" 
                        required
                        placeholder="••••••••" 
                        value={indPassword}
                        onChange={(e) => setIndPassword(e.target.value)}
                        className="input-field pl-9"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-2.5 bg-[#0066ff] hover:bg-opacity-95 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow disabled:opacity-50 mt-2"
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
                </form>
              ) : (
                /* REGISTER BUSINESS FORM */
                <form onSubmit={handleRegisterBusiness} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-[#8f95b2] font-mono uppercase tracking-wider block">Байгууллагын нэр</label>
                      <div className="relative">
                        <Building className="w-4 h-4 text-[#8f95b2] absolute left-3 top-3" />
                        <input 
                          type="text" 
                          required
                          placeholder="Юнител Групп ХХК" 
                          value={compName}
                          onChange={(e) => setCompName(e.target.value)}
                          className="input-field pl-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-[#8f95b2] font-mono uppercase tracking-wider block">Байгууллагын РД</label>
                      <input 
                        type="text" 
                        required
                        placeholder="5091234" 
                        value={compRegNo}
                        onChange={(e) => setCompRegNo(e.target.value)}
                        className="w-full bg-[#090a0f] border border-[#1e2030] hover:border-zinc-700 focus:border-[#0066ff] rounded-xl px-3 py-2.5 text-xs font-mono text-white focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-[#8f95b2] font-mono uppercase tracking-wider block">Администраторын нэр (Англи)</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#8f95b2] absolute left-3 top-3" />
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
                    <label className="text-[10px] text-[#8f95b2] font-mono uppercase tracking-wider block">Утасны дугаар</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#8f95b2] absolute left-3 top-3" />
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
                    <label className="text-[10px] text-[#8f95b2] font-mono uppercase tracking-wider block">И-мэйл хаяг</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#8f95b2] absolute left-3 top-3" />
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
                    <label className="text-[10px] text-[#8f95b2] font-mono uppercase tracking-wider block">Нууц үг</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#8f95b2] absolute left-3 top-3" />
                      <input 
                        type="password" 
                        required
                        placeholder="••••••••" 
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="input-field pl-9"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-2.5 bg-[#0066ff] hover:bg-opacity-95 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow disabled:opacity-50 mt-2"
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
                </form>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
