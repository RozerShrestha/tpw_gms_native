export const API_BASE_URL = "http://202.51.74.51:2222";
//export const API_BASE_URL = "http://localhost:50893";


export const ENDPOINTS = {
  TOKEN: "/token",
  MEMBER_INFO: "/api/getMemberLoginInfo",
  PER_HOUR_ATTENDANCE: "/api/GetClientPerHourAttendancePerGym",
  FEE_STRUCTURE: "/api/GetFeeStructure",
  TOP_TEN_CHECKINS: "/api/GetTopTenCheckins",
  UPLOAD_PROFILE_PICTURE: "/api/UploadProfilePicture",
  RESET_PASSWORD: "/api/ResetPassword",
  INSERT_BODY_MEASUREMENT: "/api/InsertBodyMeasurement",
  UPDATE_BODY_MEASUREMENT: "/api/UpdateBodyMeasurement",
  DELETE_BODY_MEASUREMENT: "/api/DeleteBodyMeasurement",
  GET_QR_FOR_STAFF: "/api/GetQRForStaff",
  GET_BRANCH_INFORMATION: "/api/GetBranchInformation",
  GENERATE_OTP: "/api/GenerateOtp",
  FORGET_PASSWORD: "/api/ForgetPassword",
} as const;
