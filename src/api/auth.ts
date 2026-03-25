import { API_BASE_URL, ENDPOINTS } from "./config";
import { TokenResponse } from "../types/api";

/**
 * Reset password using username, current password, and new password.
 * Returns the success message string from server.
 */
export async function resetPassword(
  username: string,
  password: string,
  newPassword: string
): Promise<string> {
  const body = [
    `username=${encodeURIComponent(username)}`,
    `password=${encodeURIComponent(password)}`,
    `newPassword=${encodeURIComponent(newPassword)}`,
  ].join("&");

  console.log("[ResetPassword] Calling:", `${API_BASE_URL}${ENDPOINTS.RESET_PASSWORD}`);
  console.log("[ResetPassword] Body:", body);

  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.RESET_PASSWORD}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const text = await response.text();

  if (!response.ok) {
    // Server returns { "Message": "{\"status\":400,\"message\":\"...\",\"data\":null}" }
    try {
      const outer = JSON.parse(text);
      const msgStr = outer.Message || outer.message || "";
      // The Message field itself may be a JSON string
      try {
        const inner = JSON.parse(msgStr);
        throw new Error(inner.message || inner.Message || msgStr);
      } catch (innerErr: any) {
        if (innerErr instanceof SyntaxError) {
          throw new Error(msgStr || text);
        }
        throw innerErr;
      }
    } catch (e: any) {
      if (e instanceof SyntaxError) {
        throw new Error(text || `Password reset failed with status ${response.status}`);
      }
      throw e;
    }
  }

  // Success: { "status": 200, "message": "Password reset successfully.", "data": null }
  try {
    const data = JSON.parse(text);
    return data.message || data.Message || (typeof data === "string" ? data : text);
  } catch {
    return text;
  }
}

/**
 * Generate OTP for forgot password flow.
 * GET api/GenerateOtp?email=...
 */
export async function generateOtp(email: string): Promise<{ status: number; message: string }> {
  const url = `${API_BASE_URL}${ENDPOINTS.GENERATE_OTP}?email=${encodeURIComponent(email)}`;
  console.log("[GenerateOtp] Calling:", url);

  const response = await fetch(url, { method: "GET" });
  const text = await response.text();
  console.log("[GenerateOtp] Raw response:", text);

  try {
    const data = JSON.parse(text);
    // Handle wrapped response: { "Message": "{\"status\":...,\"message\":...}" }
    if (data.Message && !data.status) {
      try {
        const inner = JSON.parse(data.Message);
        return { status: inner.status ?? response.status, message: inner.message || inner.Message || data.Message };
      } catch {
        return { status: response.status, message: data.Message };
      }
    }
    return { status: data.status ?? response.status, message: data.message || data.Message || "" };
  } catch {
    throw new Error(text || `Request failed with status ${response.status}`);
  }
}

/**
 * Reset password using OTP (forgot password flow).
 * GET api/ForgetPassword?email=...&otp=...&newPassword=...&confirmPassword=...
 */
export async function forgetPassword(
  email: string,
  otp: string,
  newPassword: string,
  confirmPassword: string
): Promise<{ status: number; message: string }> {
  const url = `${API_BASE_URL}${ENDPOINTS.FORGET_PASSWORD}?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}&newPassword=${encodeURIComponent(newPassword)}&confirmPassword=${encodeURIComponent(confirmPassword)}`;
  console.log("[ForgetPassword] Calling:", url);

  const response = await fetch(url, { method: "GET" });
  const text = await response.text();
  console.log("[ForgetPassword] Raw response:", text);

  try {
    const data = JSON.parse(text);
    if (data.Message && !data.status) {
      try {
        const inner = JSON.parse(data.Message);
        return { status: inner.status ?? response.status, message: inner.message || inner.Message || data.Message };
      } catch {
        return { status: response.status, message: data.Message };
      }
    }
    return { status: data.status ?? response.status, message: data.message || data.Message || "" };
  } catch {
    throw new Error(text || `Request failed with status ${response.status}`);
  }
}

/**
 * Authenticate with username/password using x-www-form-urlencoded.
 * Returns the parsed TokenResponse on success; throws on failure.
 */
export async function loginWithPassword(username: string, password: string): Promise<TokenResponse> {
  const params = new URLSearchParams();
  params.append("grant_type", "password");
  params.append("username", username);
  params.append("password", password);

  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.TOKEN}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error("Invalid username or password.");
    }
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Login failed with status ${response.status}`
    );
  }

  const raw = await response.json();
  console.log("[Auth] Raw /token response keys:", Object.keys(raw));
  console.log("[Auth] Raw /token response:", JSON.stringify(raw));

  const data: TokenResponse = raw;

  if (!data.access_token) {
    throw new Error("No access token received from server.");
  }

  // memberId might come as "memberId", "MemberId", or "memberID" depending on role
  if (!data.memberId) {
    const altKey = Object.keys(raw).find(
      (k) => k.toLowerCase() === "memberid"
    );
    if (altKey && raw[altKey]) {
      data.memberId = raw[altKey];
      console.log("[Auth] Found memberId under alternate key:", altKey);
    } else {
      console.log("[Auth] WARNING: No memberId in response. Keys:", Object.keys(raw));
      throw new Error("No memberId received from server.");
    }
  }

  // role might also have different casing
  if (!data.role) {
    const altKey = Object.keys(raw).find(
      (k) => k.toLowerCase() === "role"
    );
    if (altKey && raw[altKey]) {
      data.role = raw[altKey];
    } else {
      data.role = "client"; // default if missing
      console.log("[Auth] WARNING: No role in response, defaulting to 'client'");
    }
  }

  return data;
}
