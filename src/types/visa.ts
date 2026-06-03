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
