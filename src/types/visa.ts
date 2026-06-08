export interface VisaApplication {
  id: string;
  applicantType: 'myself' | 'family' | 'employee';
  applicantName: string;
  applicantRelation?: string;
  companyName?: string;
  country: string;
  countryCode: string;
  visaType: string;
  status: 'draft' | 'dan_verified' | 'khur_checked' | 'payment_pending' | 'submitted' | 'approved' | 'rejected';
  userRegister: string;
  khurSalary?: number;
  khurEmployer?: string;
  khurInsuranceMonths?: number;
  passportUrl?: string;
  photoUrl?: string;
  bankStatementUrl?: string;
  passportFile?: string | null;
  photoFile?: string | null;
  bankStatementFile?: string | null;
  embassyFee: number;
  serviceFee: number;
  createdAt: string;
  paymentStatus: 'unpaid' | 'paid';
}

export interface Employee {
  id: string;
  name: string;
  registerNo: string;
  position: string;
  danVerified: boolean;
  activeVisaId?: string;
}

export interface EmployeeInvite {
  id: string;
  company_id: string;
  email: string;
  name: string;
  register_no: string;
  position: string;
  created_at: string;
}
