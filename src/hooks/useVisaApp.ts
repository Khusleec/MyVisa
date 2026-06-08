import { useState, useEffect, useMemo } from "react";
import { VisaApplication, Employee, EmployeeInvite } from "../types/visa";
import { useToast } from "../components/ui/Toast";
import { supabase } from "../lib/supabase";
import { Session } from "@supabase/supabase-js";
import type { AppTab } from "../components/Sidebar";

export const ALL_COUNTRIES = [
  { name: "Бүгд Найрамдах Солонгос Улс", code: "KR", eFee: 110000, sFee: 40000, desc: "C-3-9 аялал жуулчлалын ангилал. НД шимтгэл 6+ сар төлсөн байх шаардлагатай." },
  { name: "Япон Улс", code: "JP", eFee: 50000, sFee: 30000, desc: "Богино хугацааны жуулчин. Хэвлэмэл бус QR-тай дансны хуулга шаардлагатай." },
  { name: "Герман (Шенген)", code: "DE", eFee: 290000, sFee: 50000, desc: "Шенгений жуулчны виз. Биометрик хурууны хээгээ биеэр өгнө." },
  { name: "Австрали Улс", code: "AU", eFee: 350000, sFee: 60000, desc: "Австрали улсын жуулчны виз. Санхүүгийн баталгаа болон ажлын тодорхойлолт шаардлагатай." }
];

export const PRESET_COMPANIES = [
  { 
    id: 'c0000000-0000-0000-0000-000000000001', 
    name: 'Терасофт Технологи ХХК', 
    registration_no: '5091234', 
    allowed_countries: ['KR', 'JP', 'DE'],
    phone: '7575-1111', 
    address: 'Сүхбаатар дүүрэг, 1-р хороо, Олимпын гудамж, Терасофт Тауэр', 
    advantages: ['Хурдан шуурхай', 'Найдвартай хамт олон', '24/7 хэрэглэгчийн дэмжлэг']
  },
  { 
    id: 'c0000000-0000-0000-0000-000000000002', 
    name: 'Солонго Телеком ХХК', 
    registration_no: '2054321', 
    allowed_countries: ['JP', 'DE', 'AU'],
    phone: '7575-2222', 
    address: 'Чингэлтэй дүүрэг, 3-р хороо, Энхтайваны өргөн чөлөө, Солонго оффис', 
    advantages: ['Бүрэн дижитал систем', 'Хамгийн хямд хураамж', 'Олон жилийн туршлага']
  },
  { 
    id: 'c0000000-0000-0000-0000-000000000003', 
    name: 'Ази Капитал Банк ХХК', 
    registration_no: '5078912', 
    allowed_countries: ['KR', 'AU'],
    phone: '7575-3333', 
    address: 'Сүхбаатар дүүрэг, 8-р хороо, Сүхбаатарын талбай 2, Ази Капитал төв', 
    advantages: ['Дансны баталгаа үнэгүй', 'VIP үйлчилгээ', 'Зээлийн нөхцөлүүд']
  },
  { 
    id: 'c0000000-0000-0000-0000-000000000004', 
    name: 'Номад Трэйд ХХК', 
    registration_no: '5012345', 
    allowed_countries: ['DE'],
    phone: '7575-4444', 
    address: 'Баянзүрх дүүрэг, 26-р хороо, Их Монгол улсын гудамж, Номад плаза', 
    advantages: ['Шенгений визний өндөр хувь', 'Материал орчуулга үнэгүй']
  },
  { 
    id: 'c0000000-0000-0000-0000-000000000005', 
    name: 'Эрдэнэт Хүнс ХК', 
    registration_no: '2011223', 
    allowed_countries: ['KR', 'JP', 'DE', 'AU'],
    phone: '7575-5555', 
    address: 'Баянгол дүүрэг, 4-р хороо, Үйлдвэрчний эвлэлийн гудамж, Эрдэнэт цогцолбор', 
    advantages: ['Бүх төрлийн баримт бүрдүүлэлт', 'Хөнгөлөлттэй үнэ']
  },
  { 
    id: 'c0000000-0000-0000-0000-000000000006', 
    name: 'Мөнх Групп ХХК', 
    registration_no: '9011022', 
    allowed_countries: ['KR', 'JP'],
    phone: '7575-6666', 
    address: 'Хан-Уул дүүрэг, 15-р хороо, Махатма Гандийн гудамж, Мөнх плаза', 
    advantages: ['Элчингийн найдвартай түнш', 'Өндөр баталгаа']
  }
];

export function getCompanyAllowedCountries(companyId: string | null): typeof ALL_COUNTRIES {
  if (!companyId) return ALL_COUNTRIES;
  // Simple deterministic hash of company ID
  let hash = 0;
  for (let i = 0; i < companyId.length; i++) {
    hash = (hash << 5) - hash + companyId.charCodeAt(i);
    hash |= 0;
  }
  hash = Math.abs(hash);
  // Pick between 1 and 4 countries
  const count = (hash % 4) + 1;
  const picked: typeof ALL_COUNTRIES = [];
  const temp = [...ALL_COUNTRIES];
  for (let i = 0; i < count; i++) {
    const idx = (hash + i) % temp.length;
    picked.push(temp.splice(idx, 1)[0]);
  }
  return picked.sort((a, b) => a.code.localeCompare(b.code));
}

export function getFallbackCompany(email: string | undefined, profileName: string) {
  const domain = email?.split('@')[1]?.toLowerCase();
  const presets: Record<string, { name: string; registrationNo: string; industry: string; allowed_countries: string[] }> = {
    'terasoft.mn': { name: 'Терасофт Технологи ХХК', registrationNo: '5091234', industry: 'Мэдээлэл Технологи', allowed_countries: ['KR', 'JP', 'DE'] },
    'solongo.mn': { name: 'Солонго Телеком ХХК', registrationNo: '2054321', industry: 'Харилцаа Холбоо', allowed_countries: ['JP', 'DE', 'AU'] },
    'asiacapital.mn': { name: 'Ази Капитал Банк ХХК', registrationNo: '5078912', industry: 'Банк Санхүү', allowed_countries: ['KR', 'AU'] },
    'nomadtrade.mn': { name: 'Номад Трэйд ХХК', registrationNo: '5012345', industry: 'Худалдаа Үйлчилгээ', allowed_countries: ['DE'] },
    'erdenetfood.mn': { name: 'Эрдэнэт Хүнс ХК', registrationNo: '2011223', industry: 'Үйлдвэрлэл', allowed_countries: ['KR', 'JP', 'DE', 'AU'] },
    'munkhgroup.mn': { name: 'Мөнх Групп ХХК', registrationNo: '9011022', industry: 'Групп Хөрөнгө Оруулалт', allowed_countries: ['KR', 'JP'] },
  };

  if (domain && presets[domain]) {
    return presets[domain];
  }

  // Deterministic fallback based on profileName hash
  let hash = 0;
  const str = profileName || "Шинэ";
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  hash = Math.abs(hash);
  const pickedCountries = getCompanyAllowedCountries(hash.toString()).map(c => c.code);

  const cleanName = profileName || "Шинэ Хэрэглэгч";
  return {
    name: cleanName.includes("ХХК") || cleanName.includes("ХК") ? cleanName : `${cleanName} ХХК`,
    registrationNo: "901" + String((hash % 9000) + 1000),
    industry: "Худалдаа Үйлчилгээ",
    allowed_countries: pickedCountries
  };
}

export function useVisaApp() {
  const { toast } = useToast();

  const [session, setSession] = useState<Session | null>(null);
  const [loadingSession, setLoadingSession] = useState<boolean>(true);
  const [profile, setProfile] = useState<{ id: string; role: 'individual' | 'business_admin' | 'business_employee' | 'visa_issuer'; company_id: string | null; name: string } | null>(null);
  const [activeChatContact, setActiveChatContact] = useState<{
    id: string;
    name: string;
    role: string;
    company_id: string | null;
    company_name?: string;
  } | null>(null);

  const [userRole, setUserRole] = useState<'individual' | 'business_admin' | 'visa_issuer'>('individual');
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [formError, setFormError] = useState<string | null>(null);
  const [isDanModalOpen, setIsDanModalOpen] = useState<boolean>(false);


  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };
  
  // Consumer profile
  const [user, setUser] = useState({
    name: "Бат-Эрдэнэ Болд",
    registerNo: "УУ94021512",
    phone: "+976 9911-2233",
    isVerified: false,
    profilePhoto: null as string | null,
  });

  const updateUser = async (updates: Partial<{ name: string; registerNo: string; phone: string; isVerified: boolean; profilePhoto: string | null }>) => {
    setUser(prev => ({ ...prev, ...updates }));

    const userId = session?.user?.id;
    if (!userId) return;

    // Save to localStorage as fallback
    if (updates.profilePhoto !== undefined && typeof window !== 'undefined') {
      if (updates.profilePhoto) {
        localStorage.setItem(`profile_photo_${userId}`, updates.profilePhoto);
      } else {
        localStorage.removeItem(`profile_photo_${userId}`);
      }
    }

    try {
      const dbUpdates: Record<string, string | null> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.profilePhoto !== undefined) dbUpdates.profile_photo = updates.profilePhoto;

      const { error } = await supabase
        .from("profiles")
        .update(dbUpdates)
        .eq("id", userId);

      if (error) {
        console.warn("DB update warning (might be missing profile_photo column):", error.message);
        toast("Мэдээлэл хадгалагдлаа", "success");
      } else {
        toast("Мэдээлэл амжилттай хадгалагдлаа", "success");
      }
    } catch (e: unknown) {
      console.error("updateUser error:", e);
    }
  };

  // Business Profile
  const [company, setCompany] = useState({
    name: "Терасофт Технологи ХХК",
    registrationNo: "5091234",
    industry: "Мэдээлэл Технологи",
    employeesCount: 0,
    allowed_countries: null as string[] | null
  });

  const [allCompanies, setAllCompanies] = useState(PRESET_COMPANIES);

  // Form State for new application
  const [newApp, setNewApp] = useState({
    applicantType: "myself" as 'myself' | 'family' | 'employee',
    applicantRelation: "Эхнэр/Нөхөр",
    applicantName: "",
    selectedEmployeeId: "",
    selectedCompanyId: "",
    country: "Бүгд Найрамдах Солонгос Улс",
    countryCode: "KR",
    visaType: "Аялал жуулчлалын виз (C-3-9)",
    registerNo: "",
    step: 1, 
    khurSalary: 0,
    khurEmployer: "",
    khurInsuranceMonths: 0,
    khurChecked: false,
    passportFile: null as string | null,
    bankStatementFile: null as string | null,
    photoFile: null as string | null,
    embassyFee: 110000,
    serviceFee: 40000,
    qpayInvoice: "",
    paymentStatus: "unpaid" as 'unpaid' | 'paid'
  });

  useEffect(() => {
    const fetchAllCompanies = async () => {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('*');

        if (!error && data && data.length > 0) {
          const mapped = data.map(c => ({
            id: c.id,
            name: c.name,
            registration_no: c.registration_no,
            allowed_countries: c.allowed_countries || ['KR', 'JP', 'DE'],
            phone: c.phone || '7575-1111',
            address: c.address || 'Сүхбаатар дүүрэг, Олимпын гудамж',
            advantages: c.advantages || ['Найдвартай үйлчилгээ', 'Хурдан шуурхай']
          }));
          setAllCompanies(mapped);
        }
      } catch (e) {
        console.error("fetchAllCompanies error:", e);
      }
    };
    fetchAllCompanies();
  }, []);

  // Allowed countries list
  const allowedCountries = useMemo(() => {
    if (userRole !== 'business_admin') {
      return ALL_COUNTRIES; // Individual users see all countries
    }
    if (company && company.allowed_countries) {
      return ALL_COUNTRIES.filter(c => company.allowed_countries?.includes(c.code));
    }
    // Fallback based on profile company_id
    if (profile?.company_id) {
      return getCompanyAllowedCountries(profile?.company_id);
    }
    // Fallback if no company_id is set
    return getCompanyAllowedCountries(null);
  }, [userRole, profile?.company_id, company]);

  // Dynamic initialization of newApp country when allowedCountries change
  useEffect(() => {
    if (allowedCountries.length > 0) {
      const defaultCountry = allowedCountries[0];
      const timer = setTimeout(() => {
        setNewApp(prev => {
          if (!allowedCountries.some(c => c.code === prev.countryCode)) {
            return {
              ...prev,
              country: defaultCountry.name,
              countryCode: defaultCountry.code,
              visaType: defaultCountry.code === 'KR' 
                ? "Аялал жуулчлалын виз (C-3-9)" 
                : defaultCountry.code === 'JP' 
                ? "Богино хугацааны виз" 
                : defaultCountry.code === 'DE'
                ? "Шенгений виз"
                : "Жуулчны виз",
              embassyFee: defaultCountry.eFee,
              serviceFee: defaultCountry.sFee,
            };
          }
          return prev;
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [allowedCountries]);

  // Company Employees & Invites
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [pendingInvites, setPendingInvites] = useState<EmployeeInvite[]>([]);

  // Visa applications database
  const [applications, setApplications] = useState<VisaApplication[]>([]);

  // Bulk Payment States for B2B
  const [bulkSelectIds, setBulkSelectIds] = useState<string[]>([]);

  // Local integration simulators
  const [khurLoading, setKhurLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState<'passport' | 'statement' | 'photo' | null>(null);
  const [isQPayModalOpen, setIsQPayModalOpen] = useState(false);
  const [activePaymentId, setActivePaymentId] = useState<string | null>(null);
  const [qpayAmount, setQpayAmount] = useState<number>(0);
  const [qpayCountdown, setQpayCountdown] = useState<number>(300);



  const loadEmployees = async (companyId: string) => {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, register_no, position, is_verified')
        .eq('company_id', companyId)
        .eq('role', 'business_employee');

      if (!profilesError && profilesData) {
        const mappedEmps: Employee[] = profilesData.map(p => ({
          id: p.id,
          name: p.name,
          registerNo: p.register_no || "",
          position: p.position || "Ажилтан",
          danVerified: p.is_verified
        }));
        setEmployees(mappedEmps);
      }

      const { data: invitesData, error: invitesError } = await supabase
        .from('employee_invites')
        .select('*')
        .eq('company_id', companyId);

      if (!invitesError && invitesData) {
        setPendingInvites(invitesData);
      }
    } catch (e) {
      console.error("loadEmployees error:", e);
    }
  };

  const inviteEmployee = async (name: string, email: string, registerNo: string, position: string) => {
    if (!profile || !profile.company_id) return;
    try {
      const { error } = await supabase
        .from('employee_invites')
        .insert({
          company_id: profile.company_id,
          name,
          email,
          register_no: registerNo.toUpperCase(),
          position
        });

      if (error) throw error;

      toast("Ажилтныг амжилттай урилаа", "success");
      await loadEmployees(profile.company_id);
    } catch (e: unknown) {
      console.error("Invite error:", e);
      const err = e as Error;
      toast(`Урилга илгээхэд алдаа: ${err.message}`, "error");
    }
  };

  const loadUserData = async (userId: string) => {
    setLoadingSession(true);
    try {
      // 1. Fetch Profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError || !profileData) {
        console.error("Error loading profile:", profileError);
        setLoadingSession(false);
        return;
      }

      setProfile(profileData);
      setUserRole(profileData.role);
      if (profileData.role === 'visa_issuer') {
        setActiveTab('chat');
      }
      // Fallback to localStorage if profile_photo is missing or not migrated in the database
      let localPhoto = null;
      if (typeof window !== 'undefined') {
        localPhoto = localStorage.getItem(`profile_photo_${userId}`);
      }

      setUser({
        name: profileData.name,
        registerNo: profileData.register_no || "",
        phone: profileData.phone || "",
        isVerified: profileData.is_verified || false,
        profilePhoto: localPhoto || profileData.profile_photo || null
      });

      // 2. If Corporate Admin, fetch company info
      if (profileData.role === 'business_admin') {
        let loadedComp = null;
        if (profileData.company_id) {
          const { data: compData, error: compError } = await supabase
            .from('companies')
            .select('*')
            .eq('id', profileData.company_id)
            .single();

          if (!compError && compData) {
            loadedComp = {
              name: compData.name,
              registrationNo: compData.registration_no,
              industry: compData.industry || "Бусад",
              employeesCount: 0,
              allowed_countries: compData.allowed_countries || null
            };
          }
        }

        if (!loadedComp) {
          // Fallback based on registration email domain or profile name
          const { data: { user: authUser } } = await supabase.auth.getUser();
          const fallback = getFallbackCompany(authUser?.email, profileData.name);
          loadedComp = {
            name: fallback.name,
            registrationNo: fallback.registrationNo,
            industry: fallback.industry,
            employeesCount: 0,
            allowed_countries: fallback.allowed_countries
          };
        }
        setCompany(loadedComp);
        if (profileData.company_id) {
          await loadEmployees(profileData.company_id);
        }
      }

      // 3. Load applications
      await loadApplications(profileData);

    } catch (err) {
      console.error("Error loading user initial data:", err);
    } finally {
      setLoadingSession(false);
    }
  };

  const loadApplications = async (userProfile: { id: string; role: string; company_id: string | null }) => {
    try {
      let query = supabase.from('visa_applications').select('*');

      if (userProfile.role === 'visa_issuer') {
        // Visa issuers see all applications submitted to the embassy
      } else if (userProfile.role === 'business_admin' && userProfile.company_id) {
        query = query.eq('company_id', userProfile.company_id);
      } else {
        query = query.eq('created_by', userProfile.id);
      }

      const { data: appsData, error } = await query.order('created_at', { ascending: false });

      if (!error && appsData) {
        const formattedApps: VisaApplication[] = appsData.map(app => {
          const countryObj = ALL_COUNTRIES.find(c => c.code === app.country_code);
          const eFee = countryObj ? countryObj.eFee : 290000;
          const sFee = countryObj ? countryObj.sFee : 50000;
          const visaTypeStr = countryObj 
            ? (app.country_code === 'KR' ? 'Аялал жуулчлалын виз (C-3-9)' : app.country_code === 'JP' ? 'Богино хугацааны виз' : app.country_code === 'DE' ? 'Шенгений виз' : 'Жуулчны виз')
            : 'Жуулчны виз';
          return {
            id: app.id,
            applicantType: app.user_id ? 'myself' : app.applicant_relation === 'Employee' ? 'employee' : 'family',
            applicantRelation: app.applicant_relation === 'Self' ? 'Эхнэр/Нөхөр' : app.applicant_relation,
            applicantName: app.applicant_name,
            country: app.country,
            countryCode: app.country_code,
            visaType: visaTypeStr,
            userRegister: app.register_no || "",
            status: app.status as VisaApplication['status'],
            khurSalary: app.khur_salary || undefined,
            khurEmployer: app.khur_employer || undefined,
            khurInsuranceMonths: app.khur_insurance_months || undefined,
            khurChecked: !!app.khur_salary,
            passportFile: app.passport_url || null,
            photoFile: app.photo_url || null,
            bankStatementFile: app.bank_statement_url || null,
            embassyFee: eFee,
            serviceFee: sFee,
            createdAt: app.created_at,
            paymentStatus: app.status === 'draft' || app.status === 'payment_pending' ? 'unpaid' : 'paid'
          };
        });
        setApplications(formattedApps);
      }
    } catch (err) {
      console.error("Error loading apps:", err);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        loadUserData(session.user.id);
      } else {
        setProfile(null);
        setLoadingSession(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        if (typeof window !== 'undefined') {
          window.location.assign('/reset-password');
        }
        return;
      }
      setSession(session);
      if (session) {
        loadUserData(session.user.id);
      } else {
        setProfile(null);
        setLoadingSession(false);
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isQPayModalOpen && qpayCountdown > 0) {
      timer = setTimeout(() => setQpayCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [isQPayModalOpen, qpayCountdown]);

  const getStatusConfig = (status: VisaApplication['status']) => {
    const config = {
      draft: {
        text: 'Ноорог',
        bg: 'bg-faded/10 text-muted border-line',
        bar: 'bg-faded',
      },
      dan_verified: {
        text: 'DAN баталгаажсан',
        bg: 'bg-accent/10 text-accent border-accent/20',
        bar: 'bg-accent',
      },
      khur_checked: {
        text: 'ХУР лавлагаатай',
        bg: 'bg-accent/10 text-accent border-accent/20',
        bar: 'bg-accent',
      },
      payment_pending: {
        text: 'Төлбөр хүлээгдэж буй',
        bg: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        bar: 'bg-amber-500',
      },
      submitted: {
        text: 'ЭСЯ-нд илгээсэн',
        bg: 'bg-accent/10 text-accent border-accent/20',
        bar: 'bg-accent',
      },
      approved: {
        text: 'Виз олгогдсон',
        bg: 'bg-positive/10 text-positive border-positive/20',
        bar: 'bg-positive',
      },
      rejected: {
        text: 'Татгалзсан',
        bg: 'bg-negative/10 text-negative border-negative/20',
        bar: 'bg-negative',
      },
    };
    return config[status] || config.draft;
  };

  const handleCountryChange = (countryName: string, code: string, eFee: number, sFee: number) => {
    setNewApp(prev => ({
      ...prev,
      country: countryName,
      countryCode: code,
      visaType: code === 'KR' 
        ? "Аялал жуулчлалын виз (C-3-9)" 
        : code === 'JP' 
        ? "Богино хугацааны виз" 
        : code === 'DE'
        ? "Шенгений виз"
        : "Жуулчны виз",
      embassyFee: eFee,
      serviceFee: sFee
    }));
  };

  const handleApplicantTypeChange = (type: 'myself' | 'family' | 'employee') => {
    let name = "";
    let regNo = "";
    if (type === 'myself') {
      name = user.name;
      regNo = user.registerNo;
    }

    setNewApp(prev => ({
      ...prev,
      applicantType: type,
      applicantName: name,
      registerNo: regNo,
      khurChecked: type === 'myself' ? prev.khurChecked : false,
      khurSalary: type === 'myself' ? prev.khurSalary : 0,
      khurEmployer: type === 'myself' ? prev.khurEmployer : "",
      khurInsuranceMonths: type === 'myself' ? prev.khurInsuranceMonths : 0
    }));
  };

  const handleEmployeeSelection = (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    if (emp) {
      setNewApp(prev => ({
        ...prev,
        selectedEmployeeId: empId,
        applicantName: emp.name,
        registerNo: emp.registerNo,
        khurChecked: false
      }));
    }
  };

  const pullKhurData = () => {
    setKhurLoading(true);
    setTimeout(() => {
      setKhurLoading(false);
      setNewApp(prev => ({
        ...prev,
        khurSalary: prev.applicantType === 'myself' ? 2850000 : prev.applicantType === 'employee' ? 3800000 : 0,
        khurEmployer: prev.applicantType === 'myself' || prev.applicantType === 'employee' ? (company?.name || "Терасофт Технологи ХХК") : "Бусад",
        khurInsuranceMonths: prev.applicantType === 'myself' ? 24 : prev.applicantType === 'employee' ? 36 : 0,
        khurChecked: true
      }));
    }, 1800);
  };

  const handleFileUpload = async (type: 'passport' | 'statement' | 'photo', file: File) => {
    if (!profile) {
      toast("Та нэвтэрсэн байх шаардлагатай", "error");
      return;
    }
    setUploadingFile(type);
    try {
      const fileExt = file.name.split('.').pop() || '';
      const uniqueId = Math.random().toString(36).substring(2, 10);
      const cleanReg = (newApp.registerNo || "guest").replace(/[^a-zA-Z0-9]/g, '');
      const filePath = `${profile.id}/${type}_${cleanReg}_${uniqueId}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      const stateKey = type === 'statement' ? 'bankStatementFile' : `${type}File`;
      setNewApp(prev => ({
        ...prev,
        [stateKey]: data.path
      }));
      toast("Файл амжилттай хуулагдлаа", "success");
    } catch (e: unknown) {
      console.error("Upload error:", e);
      const err = e as Error;
      toast(`Файл хуулахад алдаа: ${err.message}`, "error");
    } finally {
      setUploadingFile(null);
    }
  };

  const handleNextToPricing = () => {
    if (!newApp.passportFile || !newApp.photoFile) {
      const msg = "Гадаад паспорт болон цээж зургийг заавал оруулна уу.";
      setFormError(msg);
      toast(msg, "error");
      return;
    }
    if (newApp.countryCode === 'KR' && !newApp.bankStatementFile) {
      const msg = "Солонгос улсын визэнд дансны хуулга шаардлагатай.";
      setFormError(msg);
      toast(msg, "error");
      return;
    }
    setFormError(null);
    setNewApp(prev => ({ ...prev, step: 4 }));
  };

  const openQPayInvoice = (appId: string, amount: number) => {
    setActivePaymentId(appId);
    setQpayAmount(amount);
    setQpayCountdown(300);
    setIsQPayModalOpen(true);
  };

  const handleGenerateInvoice = () => {
    const mockInvoice = `QPAY-INV-${Math.floor(100000 + Math.random() * 900000)}`;
    setNewApp(prev => ({
      ...prev,
      qpayInvoice: mockInvoice,
      step: 5
    }));
    openQPayInvoice('new_app_invoice', newApp.embassyFee + newApp.serviceFee);
  };

  const openBulkPaymentInvoice = () => {
    const totalAmount = applications
      .filter(app => bulkSelectIds.includes(app.id))
      .reduce((sum, app) => sum + app.embassyFee + app.serviceFee, 0);
    
    openQPayInvoice('bulk_invoice', totalAmount);
  };

  const handleBulkCheckboxToggle = (appId: string) => {
    setBulkSelectIds(prev => 
      prev.includes(appId) ? prev.filter(id => id !== appId) : [...prev, appId]
    );
  };

  const simulatePaymentSuccess = async () => {
    if (!profile) return;

    try {
      if (activePaymentId === 'bulk_invoice') {
        const unpaidApps = applications.filter(app => bulkSelectIds.includes(app.id));
        
        for (const app of unpaidApps) {
          await supabase
            .from('visa_applications')
            .update({ status: 'submitted' })
            .eq('id', app.id);
          
          await supabase
            .from('payments')
            .insert({
              application_id: app.id,
              company_id: profile.company_id || null,
              amount: app.embassyFee + app.serviceFee,
              qpay_invoice: `QPAY-INV-${Math.floor(100000 + Math.random() * 900000)}`,
              status: 'paid'
            });
        }
        
        setBulkSelectIds([]);
      } else if (activePaymentId && activePaymentId !== 'new_app_invoice') {
        const app = applications.find(a => a.id === activePaymentId);
        if (app) {
          await supabase
            .from('visa_applications')
            .update({ status: 'submitted' })
            .eq('id', activePaymentId);

          await supabase
            .from('payments')
            .insert({
              application_id: activePaymentId,
              company_id: profile.company_id || null,
              amount: app.embassyFee + app.serviceFee,
              qpay_invoice: `QPAY-INV-${Math.floor(100000 + Math.random() * 900000)}`,
              status: 'paid'
            });
        }
      } else {
        const applicantRel = newApp.applicantType === 'myself' ? 'Self' : newApp.applicantType === 'employee' ? 'Employee' : newApp.applicantRelation;

        const { data: newDbApp, error: appError } = await supabase
          .from('visa_applications')
          .insert({
            user_id: newApp.applicantType === 'myself' ? profile.id : null,
            created_by: profile.id,
            company_id: newApp.applicantType === 'employee' ? profile.company_id : (newApp.selectedCompanyId || null),
            applicant_name: newApp.applicantName,
            applicant_relation: applicantRel,
            country: newApp.country,
            country_code: newApp.countryCode,
            status: 'submitted',
            khur_salary: newApp.khurSalary || null,
            khur_employer: newApp.khurEmployer || null,
            khur_insurance_months: newApp.khurInsuranceMonths || null,
            passport_url: newApp.passportFile,
            photo_url: newApp.photoFile,
            bank_statement_url: newApp.bankStatementFile,
          })
          .select('*')
          .single();

        if (appError) throw appError;

        await supabase
          .from('payments')
          .insert({
            application_id: newDbApp.id,
            company_id: newApp.applicantType === 'employee' ? profile.company_id : (newApp.selectedCompanyId || null),
            amount: newApp.embassyFee + newApp.serviceFee,
            qpay_invoice: newApp.qpayInvoice || `QPAY-INV-${Math.floor(100000 + Math.random() * 900000)}`,
            status: 'paid'
          });
      }

      await loadApplications(profile);
      setActiveTab('applications');
      toast("Төлбөр амжилттай баталгаажлаа", "success");
      
      const defaultCountry = allowedCountries[0] || ALL_COUNTRIES[0];
      setNewApp({
        applicantType: userRole === 'business_admin' ? 'employee' : 'myself',
        applicantRelation: "Эхнэр/Нөхөр",
        applicantName: userRole === 'business_admin' ? "" : user.name,
        selectedEmployeeId: "",
        selectedCompanyId: "",
        country: defaultCountry.name,
        countryCode: defaultCountry.code,
        visaType: defaultCountry.code === 'KR' 
          ? "Аялал жуулчлалын виз (C-3-9)" 
          : defaultCountry.code === 'JP' 
          ? "Богино хугацааны виз" 
          : defaultCountry.code === 'DE'
          ? "Шенгений виз"
          : "Жуулчны виз",
        registerNo: userRole === 'business_admin' ? "" : user.registerNo,
        step: 1,
        khurSalary: 0,
        khurEmployer: "",
        khurInsuranceMonths: 0,
        khurChecked: false,
        passportFile: null,
        bankStatementFile: null,
        photoFile: null,
        embassyFee: defaultCountry.eFee,
        serviceFee: defaultCountry.sFee,
        qpayInvoice: "",
        paymentStatus: "unpaid"
      });

    } catch (e: unknown) {
      const error = e as Error;
      toast(`Төлбөр баталгаажуулахад алдаа: ${error.message}`, "error");
    } finally {
      setActivePaymentId(null);
      setIsQPayModalOpen(false);
    }
  };

  const handleDanSuccess = async () => {
    if (!profile) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: true })
        .eq('id', profile.id);

      if (error) throw error;
      
      setUser(prev => ({ ...prev, isVerified: true }));
      toast("DAN баталгаажуулалт амжилттай", "success");
    } catch (e: unknown) {
      console.error("Error saving DAN verification:", e);
      toast("DAN хадгалахад алдаа гарлаа", "error");
    }
  };

  const handleRoleToggle = (role: 'individual' | 'business_admin') => {
    setUserRole(role);
    setActiveTab('dashboard');
    setNewApp(prev => ({
      ...prev,
      applicantType: role === 'business_admin' ? 'employee' : 'myself',
      applicantName: role === 'business_admin' ? "" : user.name,
      registerNo: role === 'business_admin' ? "" : user.registerNo,
      step: 1,
      khurChecked: false
    }));
  };

  const handleStartEmployeeVisa = (empId: string) => {
    handleRoleToggle('business_admin');
    handleEmployeeSelection(empId);
    setActiveTab('apply');
  };

  const handleStartB2CVisa = (countryName: string, countryCode: string, eFee: number, sFee: number, companyId?: string) => {
    handleRoleToggle('individual');
    handleCountryChange(countryName, countryCode, eFee, sFee);
    setNewApp(prev => ({
      ...prev,
      selectedCompanyId: companyId || ""
    }));
    setActiveTab('apply');
  };

  const handleSaveAsDraft = async () => {
    if (!profile) return;
    
    try {
      const applicantRel = newApp.applicantType === 'myself' ? 'Self' : newApp.applicantType === 'employee' ? 'Employee' : newApp.applicantRelation;

      const { error } = await supabase
        .from('visa_applications')
        .insert({
          user_id: newApp.applicantType === 'myself' ? profile.id : null,
          created_by: profile.id,
          company_id: newApp.applicantType === 'employee' ? profile.company_id : (newApp.selectedCompanyId || null),
          applicant_name: newApp.applicantName,
          applicant_relation: applicantRel,
          country: newApp.country,
          country_code: newApp.countryCode,
          status: 'draft',
          khur_salary: newApp.khurSalary || null,
          khur_employer: newApp.khurEmployer || null,
          khur_insurance_months: newApp.khurInsuranceMonths || null,
          passport_url: newApp.passportFile,
          photo_url: newApp.photoFile,
          bank_statement_url: newApp.bankStatementFile,
        })
        .select('*')
        .single();

      if (error) throw error;

      await loadApplications(profile);
      setActiveTab('dashboard');
      toast("Ноорог амжилттай хадгалагдлаа", "success");
    } catch (e: unknown) {
      const error = e as Error;
      toast(`Ноорог хадгалахад алдаа: ${error.message}`, "error");
    }
  };

  const startChatWithCompany = async (companyId: string, companyName: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, company_id, role')
        .eq('company_id', companyId)
        .eq('role', 'business_admin')
        .limit(1)
        .single();
        
      if (error || !data) {
        toast("Байгууллагын админ олдсонгүй эсвэл чат эхлүүлэх боломжгүй байна.", "error");
        return false;
      }
      
      setActiveChatContact({
        id: data.id,
        name: data.name,
        role: data.role,
        company_id: data.company_id,
        company_name: companyName
      });
      return true;
    } catch (e) {
      console.error("startChatWithCompany error:", e);
      toast("Алдаа гарлаа. Дахин оролдоно уу.", "error");
      return false;
    }
  };

  const updateApplicationStatus = async (appId: string, newStatus: VisaApplication['status']) => {
    try {
      const { error } = await supabase
        .from('visa_applications')
        .update({ status: newStatus })
        .eq('id', appId);

      if (error) throw error;

      toast("Амжилтай шинэчлэгдлээ", "success");
      if (profile) {
        await loadUserData(profile.id);
      }
    } catch (e: unknown) {
      console.error("updateApplicationStatus error:", e);
      const err = e as Error;
      toast(`Алдаа гарлаа: ${err.message}`, "error");
    }
  };

  const getDocumentUrl = async (path: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(path, 600);
      if (error) throw error;
      return data.signedUrl;
    } catch (e) {
      console.error("getDocumentUrl error:", e);
      return null;
    }
  };

  return {
    session,
    loadingSession,
    profile,
    userRole,
    activeTab,
    setActiveTab,
    formError,
    setFormError,
    isDanModalOpen,
    setIsDanModalOpen,

    theme,
    toggleTheme,
    user,
    company,
    employees,
    applications,
    newApp,
    setNewApp,
    bulkSelectIds,
    allowedCountries,
    allCompanies,
    khurLoading,
    uploadingFile,
    isQPayModalOpen,
    setIsQPayModalOpen,
    activePaymentId,
    setActivePaymentId,
    qpayAmount,
    qpayCountdown,
    pendingInvites,
    inviteEmployee,

    updateUser,
    handleSignOut,
    getStatusConfig,
    handleCountryChange,
    handleApplicantTypeChange,
    handleEmployeeSelection,
    pullKhurData,
    handleFileUpload,
    handleNextToPricing,
    openQPayInvoice,
    handleGenerateInvoice,
    openBulkPaymentInvoice,
    handleBulkCheckboxToggle,
    simulatePaymentSuccess,
    handleSaveAsDraft,
    handleDanSuccess,
    handleRoleToggle,
    handleStartEmployeeVisa,
    handleStartB2CVisa,
    activeChatContact,
    setActiveChatContact,
    startChatWithCompany,
    updateApplicationStatus,
    getDocumentUrl,
  };
}
