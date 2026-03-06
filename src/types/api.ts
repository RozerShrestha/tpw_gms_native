/** Response from POST /token */
export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  ".issued": string;
  ".expires": string;
  role: string;
  memberId: string;
}

/** A single staff attendance record (role: employee) */
export interface StaffAttendance {
  memberId: string;
  fullName: string;
  checkin: string;
  checkout: string;
  branch: string;
  checkinBranch: string;
  remark: string;
  lateFlag: boolean;
}

/** A single member attendance record (role: client) */
export interface MemberAttendance {
  memberId: string;
  fullName: string;
  checkin: string;
  checkout: string;
  branch: string;
  checkinBranch: string;
}

/** A single guest attendance record (role: guest) */
export interface GuestAttendance {
  fullName: string;
  email: string;
  checkin: string;
  checkout: string;
  branch: string | null;
  checkinBranch: string;
}

/** A single payment history record (role: client) */
export interface MemberPaymentHistory {
  memberId: string;
  receiptNo: string;
  memberBeginDate: string;
  memberExpireDate: string;
  memberOption: string;
  memberCatagory: string;
  memberPaymentType: string;
  finalAmount: string;
}

/** Locker information (nullable) */
export interface LockerInfo {
  memberId: string | null;
  fullName: string | null;
  mobileNumber: string | null;
  branch: string;
  lockerNumber: number;
  renewDate: string;
  duration: string;
  expireDate: string;
  isExpired: boolean;
  isAssigned: boolean | null;
  flag: string | null;
  charge: number | null;
  paymentMethod: string | null;
  receiptNoStatic: string | null;
  receiptNo: string | null;
}

/** Start/Stop (freeze) information */
export interface StartStopInfo {
  startStopId: number;
  memberId: string;
  stopDate: string | null;
  startDate: string | null;
  stopDays: number | null;
  stopLimit: number;
}

/** A single per-hour attendance record */
export interface HourlyAttendance {
  branch: string;
  CheckinDate: string;
  HourOfDay: number;
  NumberOfCheckins: number;
}

/** A single top-checkin leaderboard record */
export interface TopCheckinItem {
  fullname: string;
  TotalCheckins: number;
  branch: string;
  imageLoc: string;
}

/** A single fee structure record */
export interface FeeStructureItem {
  feeId: number;
  membershipOption: string;
  membershipType: string;
  oneMonth: string;
  threeMonth: string;
  sixMonth: string;
  twelveMonth: string;
  oneTenDays: string;
}

/** Response from POST /api/getMemberLoginInfo */
export interface MemberLoginInfo {
  memberId: string;
  fullname: string;
  memberOption: string;
  branch: string;
  shift: string;
  memberCatagory: string;
  memberPaymentType: string | null;
  memberDate: string;
  memberBeginDate: string;
  memberExpireDate: string;
  contactNo: string;
  email: string;
  dateOfBirth: string;
  address: string;
  finalAmount: number;
  receiptNo: string | null;
  dueAmount: number;
  ActiveInActive: string | null;
  gender: string;
  memberSubCatagory: string;
  imageLoc: string;
  EmergencyContactPerson: string | null;
  EmergencyContactPersonNumber: string | null;
  memberPaymentHistorys: MemberPaymentHistory[] | null;
  memberAttendances: MemberAttendance[] | null;
  staffAttendance: StaffAttendance[] | null;
  guestAttendance: GuestAttendance[] | null;
  status: string | null;
  locker: LockerInfo | null;
  FreezeInfo: string | null;
  startStop: StartStopInfo | null;
  bodyMeasurements: BodyMeasurement[] | null;
}

/** Body measurement data for a member */
export interface BodyMeasurement {
  measurementId?: number;
  memberId: string;
  measurementDate: string;
  weight: string;
  height: string;
  upperArm: string;
  foreArm: string;
  chest: string;
  waist: string;
  thigh: string;
  calf: string;
}

/** Branch information */
export interface BranchInfo {
  firstname: string;
  latitude: string;
  longitude: string;
  PhoneNumber: string;
}
