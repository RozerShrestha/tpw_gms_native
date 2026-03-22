import { Platform } from "react-native";
import { API_BASE_URL, ENDPOINTS } from "./config";
import { MemberLoginInfo, HourlyAttendance, FeeStructureItem, TopCheckinItem, BodyMeasurement, BranchInfo } from "../types/api";

/**
 * Fetch member login info using Bearer token and x-www-form-urlencoded body.
 * Uses manual encoding to handle special characters in Base64 memberId (/, +, =).
 */
export async function fetchMemberLoginInfo(
  accessToken: string,
  memberId: string
): Promise<MemberLoginInfo> {
  // Manually encode to handle Base64 special chars in memberId
  const body = `memberId=${encodeURIComponent(memberId)}`;

  const response = await fetch(
    `${API_BASE_URL}${ENDPOINTS.MEMBER_INFO}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to fetch member info (status ${response.status})`
    );
  }

  const data: MemberLoginInfo = await response.json();
  return data;
}

/**
 * Fetch per-hour attendance data for a given branch and date.
 */
export async function fetchHourlyAttendance(
  accessToken: string,
  branch: string,
  targetDate?: string
): Promise<HourlyAttendance[]> {
  const date =
    targetDate ?? new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const url = `${API_BASE_URL}${ENDPOINTS.PER_HOUR_ATTENDANCE}?branch=${encodeURIComponent(branch)}&targetDate=${encodeURIComponent(date)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to fetch hourly attendance (status ${response.status})`
    );
  }

  const json = await response.json();

  // API now returns { status, message, data: [...] }
  const data: HourlyAttendance[] = Array.isArray(json) ? json : (json.data ?? []);
  return data;
}

/**
 * Fetch fee structure for the gym.
 */
export async function fetchFeeStructure(
  accessToken: string
): Promise<FeeStructureItem[]> {
  const url = `${API_BASE_URL}${ENDPOINTS.FEE_STRUCTURE}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to fetch fee structure (status ${response.status})`
    );
  }

  const data: FeeStructureItem[] = await response.json();
  return data;
}

/**
 * Fetch top 10 checkins leaderboard with member rank.
 */
export async function fetchTopTenCheckins(
  accessToken: string,
  branchName: string,
  memberId: string
): Promise<TopCheckinItem[]> {
  const url = `${API_BASE_URL}${ENDPOINTS.TOP_TEN_CHECKINS}?branchName=${encodeURIComponent(branchName)}&memberId=${encodeURIComponent(memberId)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || `Failed to fetch top checkins (status ${response.status})`
    );
  }

  const json = await response.json();

  // API now returns { status, message, data: [...] }
  const data: TopCheckinItem[] = Array.isArray(json) ? json : (json.data ?? []);
  return data;
}

/**
 * Upload a profile picture for the given member.
 * Handles both web (Blob/File) and native (uri object) FormData conventions.
 */
export async function uploadProfilePicture(
  accessToken: string,
  memberId: string,
  fileUri: string,
  fileName: string,
  mimeType: string
): Promise<{ status: string; message: string; filePath: string }> {
  const url = `${API_BASE_URL}${ENDPOINTS.UPLOAD_PROFILE_PICTURE}`;

  const formData = new FormData();

  if (Platform.OS === "web") {
    // On web, fetch the blob from the URI and append as a proper File/Blob
    const blob = await fetch(fileUri).then((r) => r.blob());
    const file = new File([blob], fileName, { type: mimeType });
    formData.append("file", file);
  } else {
    // On native React Native, use the { uri, name, type } convention
    formData.append("file", {
      uri: fileUri,
      name: fileName,
      type: mimeType,
    } as any);
  }

  formData.append("memberId", memberId);

  // Use fetch on web (XHR with RN file objects can be unreliable on web)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseText = await response.text().catch(() => "");

    if (!response.ok) {
      throw new Error(responseText || `Upload failed (status ${response.status})`);
    }

    try {
      const json = JSON.parse(responseText);
      // Server may return an error status even with 200 OK
      if (json.status && json.status.toLowerCase() !== "success") {
        throw new Error(json.message || "Upload failed on server.");
      }
      return json;
    } catch (parseErr: any) {
      // If it was a rethrown error from status check above, propagate it
      if (parseErr?.message && parseErr.message !== "Unexpected token") {
        throw parseErr;
      }
      return { status: "Success", message: "", filePath: "" };
    }
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err?.name === "AbortError") {
      throw new Error("Upload timed out. Please try again.");
    }
    throw err;
  }
}

/**
 * Insert body measurement for a member.
 */
export async function insertBodyMeasurement(
  accessToken: string,
  data: BodyMeasurement
): Promise<string> {
  const body = [
    `memberId=${encodeURIComponent(data.memberId)}`,
    `measurementDate=${encodeURIComponent(data.measurementDate)}`,
    `weight=${encodeURIComponent(data.weight)}`,
    `height=${encodeURIComponent(data.height)}`,
    `upperArm=${encodeURIComponent(data.upperArm)}`,
    `foreArm=${encodeURIComponent(data.foreArm)}`,
    `chest=${encodeURIComponent(data.chest)}`,
    `waist=${encodeURIComponent(data.waist)}`,
    `thigh=${encodeURIComponent(data.thigh)}`,
    `calf=${encodeURIComponent(data.calf)}`,
  ].join("&");

  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.INSERT_BODY_MEASUREMENT}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const text = await response.text();

  if (!response.ok) {
    try {
      const errorData = JSON.parse(text);
      throw new Error(errorData.Message || errorData.message || text);
    } catch (e: any) {
      if (e instanceof SyntaxError) {
        throw new Error(text || `Failed to save body measurement (status ${response.status})`);
      }
      throw e;
    }
  }

  try {
    const parsed = JSON.parse(text);
    return typeof parsed === "string" ? parsed : (parsed.Message || parsed.message || text);
  } catch {
    return text;
  }
}

/**
 * Update an existing body measurement for a member.
 * Returns { message, updatedData } from the API response.
 */
export async function updateBodyMeasurement(
  accessToken: string,
  data: BodyMeasurement
): Promise<{ message: string; updatedData: BodyMeasurement | null }> {
  const body = [
    `memberId=${encodeURIComponent(data.memberId)}`,
    `measurementDate=${encodeURIComponent(data.measurementDate)}`,
    `weight=${encodeURIComponent(data.weight)}`,
    `height=${encodeURIComponent(data.height)}`,
    `upperArm=${encodeURIComponent(data.upperArm)}`,
    `foreArm=${encodeURIComponent(data.foreArm)}`,
    `chest=${encodeURIComponent(data.chest)}`,
    `waist=${encodeURIComponent(data.waist)}`,
    `thigh=${encodeURIComponent(data.thigh)}`,
    `calf=${encodeURIComponent(data.calf)}`,
    `measurementId=${encodeURIComponent(data.measurementId ?? "")}`,
  ].join("&");

  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.UPDATE_BODY_MEASUREMENT}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const text = await response.text();

  if (!response.ok) {
    try {
      const errorData = JSON.parse(text);
      throw new Error(errorData.Message || errorData.message || text);
    } catch (e: any) {
      if (e instanceof SyntaxError) {
        throw new Error(text || `Failed to update body measurement (status ${response.status})`);
      }
      throw e;
    }
  }

  try {
    const parsed = JSON.parse(text);
    return {
      message: parsed.message || parsed.Message || "Body measurement updated successfully.",
      updatedData: parsed.data ?? null,
    };
  } catch {
    return { message: text, updatedData: null };
  }
}

/**
 * Delete a body measurement by its ID.
 */
export async function deleteBodyMeasurement(
  accessToken: string,
  measurementId: number
): Promise<string> {
  const url = `${API_BASE_URL}${ENDPOINTS.DELETE_BODY_MEASUREMENT}?id=${encodeURIComponent(measurementId)}`;
  console.log("[deleteBodyMeasurement] URL:", url, "id:", measurementId);

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const text = await response.text();

  if (!response.ok) {
    try {
      const errorData = JSON.parse(text);
      throw new Error(errorData.Message || errorData.message || text);
    } catch (e: any) {
      if (e instanceof SyntaxError) {
        throw new Error(text || `Failed to delete body measurement (status ${response.status})`);
      }
      throw e;
    }
  }

  try {
    const parsed = JSON.parse(text);
    return parsed.message || parsed.Message || "Body measurement deleted successfully.";
  } catch {
    return text || "Body measurement deleted successfully.";
  }
}

/**
 * Fetch extended QR code data for staff/employee.
 * Sends the encrypted memberId as raw JSON body.
 * Returns the QR string from response.data.
 */
export async function fetchQRForStaff(
  accessToken: string,
  memberId: string
): Promise<string> {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.GET_QR_FOR_STAFF}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(memberId),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Failed to fetch staff QR (status ${response.status})`);
  }

  const json = await response.json();
  // Response: { status: 200, message: "...", data: "r/..." }
  return json.data ?? json;
}

/**
 * Fetch branch information (locations, phone numbers).
 */
export async function fetchBranchInformation(
  accessToken: string
): Promise<BranchInfo[]> {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.GET_BRANCH_INFORMATION}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Failed to fetch branch information (status ${response.status})`);
  }

  const json = await response.json();
  return json.data ?? [];
}
