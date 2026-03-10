import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useMemberInfo } from "../context/MemberInfoContext";
import { fetchMemberLoginInfo } from "../api/member";
import { fetchQRForStaff } from "../api/member";
import { MemberLoginInfo } from "../types/api";
import { useNavigation } from "@react-navigation/native";
import {
  THEME_MALE,
  THEME_FEMALE,
  HeaderBar,
  ExpiredBanner,
  ExpiredBannerLocker,
  FreezeInfoBanner,
  RemainingDaysCard,
  QRCodeCard,
  PromoBanner,
  QuickStats,
  MembershipDates,
  LockerInfoCard,
  HourlyAttendanceChart,
  TopCheckinsCard,
} from "../components/dashboard";

// ─── Helpers ──────────────────────────────────────────────────
/** Normalise dates like "Jun 16 2025 9:02AM" → "Jun 16, 2025 9:02 AM" */
function normaliseDateStr(raw: string): string {
  return raw
    .replace(/(\d{1,2})\s+(\d{4})/, "$1, $2")
    .replace(/(\d)(AM|PM)/i, "$1 $2");
}

/** Try to parse a date string (supports "M/D/YYYY h:mm:ss A", "Jun 16 2025 9:02AM" & ISO) */
function parseDate(d: string | null | undefined): Date | null {
  if (!d) return null;
  const ms = Date.parse(normaliseDateStr(d));
  if (!isNaN(ms)) return new Date(ms);
  return null;
}

/** Sort array by checkin date descending (latest first) */
function sortByCheckinDesc<T extends { checkin: string }>(arr: T[]): T[] {
  return [...arr].sort((a, b) => {
    const da = parseDate(a.checkin)?.getTime() ?? 0;
    const db = parseDate(b.checkin)?.getTime() ?? 0;
    return db - da;
  });
}

/** Sort payment history by memberBeginDate desc */
function sortPaymentsDesc<T extends { memberBeginDate: string }>(
  arr: T[]
): T[] {
  return [...arr].sort((a, b) => {
    const da = parseDate(a.memberBeginDate)?.getTime() ?? 0;
    const db = parseDate(b.memberBeginDate)?.getTime() ?? 0;
    return db - da;
  });
}

/** Compute remaining days until expiry. Negative = already expired. */
function getRemainingDays(expireDate: string | null | undefined): number | null {
  const d = parseDate(expireDate);
  if (!d) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function DashboardScreen() {
  const { accessToken, memberId, role, logout } = useAuth();
  const { setMemberInfo: setGlobalMemberInfo, setTheme: setGlobalTheme } = useMemberInfo();
  const navigation = useNavigation<any>();
  const [memberInfo, setMemberInfo] = useState<MemberLoginInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [staffQR, setStaffQR] = useState<string | null>(null);
  const [refreshingQR, setRefreshingQR] = useState(false);

  const isEmployee = role === "employee";
  const isClient = role === "client";
  const isGuest = role === "guest";

  // ─── Gender-based theme ───────────────────────────────────
  const isFemale =
    memberInfo?.gender?.toLowerCase() === "female" ||
    memberInfo?.gender?.toLowerCase() === "f";
  const T = isFemale ? THEME_FEMALE : THEME_MALE;

  // Keep global theme in sync
  useEffect(() => {
    setGlobalTheme(T);
  }, [T, setGlobalTheme]);

  // ─── Remaining days / expired ─────────────────────────────
  const remainingDays = useMemo(
    () => getRemainingDays(memberInfo?.memberExpireDate),
    [memberInfo?.memberExpireDate]
  );
  const isExpired = remainingDays !== null && remainingDays < 0;

  // ─── Remaining days Locker / expired ─────────────────────────────
  const remainingDaysLocker = useMemo(
    () => getRemainingDays(memberInfo?.locker?.expireDate),
    [memberInfo?.locker?.expireDate]
  );

  // ─── Status color ─────────────────────────────────────────
  const memberStatus = memberInfo?.status ?? null;
  const statusColor =
    memberStatus?.toLowerCase() === "active" ? "#10b981" : "#ef4444";

  // ─── Locker expiry (Nepali date compare as string YYYY/MM/DD) ──
  const locker = memberInfo?.locker ?? null;
  const isLockerExpired = (() => {
    if (!locker?.expireDate) return false;
    const expiry = parseDate(locker.expireDate);
    if (!expiry) return true; // can't parse → treat as expired
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);
    return expiry.getTime() < today.getTime();
  })();

  // ─── Freeze info ──────────────────────────────────────────
  const freezeInfo = memberInfo?.FreezeInfo ?? "";
  const isFrozen = freezeInfo.length > 0;
  const freezeDate = memberInfo?.startStop?.stopDate
    ? memberInfo.startStop.stopDate.split("T")[0]
    : null;

  const loadData = useCallback(
    async (isRefresh = false) => {
      if (!accessToken || !memberId) return;

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        console.log("[Dashboard] Fetching member info... role:", role);
        const data = await fetchMemberLoginInfo(accessToken, memberId);
        console.log("[Dashboard] Member info loaded:", data?.fullname);
        setMemberInfo(data);
        setGlobalMemberInfo(data);

        // Fetch extended QR for staff/employee
        if (role === "employee") {
          try {
            const qr = await fetchQRForStaff(accessToken, memberId);
            console.log("[Dashboard] Staff QR fetched:", qr?.substring(0, 20) + "...");
            setStaffQR(qr);
          } catch (qrErr: any) {
            console.log("[Dashboard] Staff QR fetch failed:", qrErr?.message);
          }
        }
      } catch (err: any) {
        const msg =
          err?.message || "Failed to load member information. Please try again.";
        setError(msg);
        Alert.alert("Error", msg);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accessToken, memberId, role]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          console.log("[Dashboard] Logout button pressed");
          logout();
        },
      },
    ]);
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: T.bg }]}>
        <ActivityIndicator size="large" color={T.accent} />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  // Error state with retry
  if (error && !memberInfo) {
    return (
      <View style={[styles.centered, { backgroundColor: T.bg }]}>
        <Text style={styles.errorIcon}>&#x26A0;</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: T.accent }]}
          onPress={() => loadData()}
        >
          <Text style={styles.retryText}>TRY AGAIN</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutBtnAlt} onPress={handleLogout}>
          <Text style={styles.logoutBtnAltText}>Logout</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Sorted & limited data ────────────────────────────────
  const staffAttendance = sortByCheckinDesc(memberInfo?.staffAttendance ?? []);
  const memberAttendances = sortByCheckinDesc(memberInfo?.memberAttendances ?? []);
  const guestAttendance = sortByCheckinDesc(memberInfo?.guestAttendance ?? []);

  // ─── Remaining-days display helpers ───────────────────────
  let daysLabel = "";
  let daysColor = T.accent;
  if (remainingDays !== null) {
    if (isExpired) {
      daysLabel = `Expired ${Math.abs(remainingDays)} day${Math.abs(remainingDays) !== 1 ? "s" : ""} ago`;
      daysColor = "#ef4444";
    } else if (remainingDays === 0) {
      daysLabel = "Expires today!";
      daysColor = "#f59e0b";
    } else if (remainingDays <= 7) {
      daysLabel = `${remainingDays} day${remainingDays !== 1 ? "s" : ""} left`;
      daysColor = "#f59e0b";
    } else {
      daysLabel = `${remainingDays} days left`;
      daysColor = "#10b981";
    }
  }

// ─── Remaining-days Locker display helpers ───────────────────────
  let daysLabelLocker = "";
  let daysColorLocker = T.accent;
  if (remainingDaysLocker !== null) {
    if (isExpired) {
      daysLabelLocker = `Expired ${Math.abs(remainingDaysLocker)} day${Math.abs(remainingDaysLocker) !== 1 ? "s" : ""} ago`;
      daysColorLocker = "#ef4444";
    } else if (remainingDaysLocker === 0) {
      daysLabelLocker = "Expires today!";
      daysColorLocker = "#f59e0b";
    } else if (remainingDaysLocker <= 7) {
      daysLabelLocker = `${remainingDaysLocker} day${remainingDaysLocker !== 1 ? "s" : ""} left`;
      daysColorLocker = "#f59e0b";
    } else {
      daysLabelLocker = `${remainingDaysLocker} days left`;
      daysColorLocker = "#10b981";
    }
  }


  return (
    <View style={[styles.container, { backgroundColor: T.bg }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadData(true)}
            colors={[T.accent]}
            tintColor={T.accent}
            progressBackgroundColor={T.card}
          />
        }
      >
        {/* Header bar */}
        <HeaderBar
          fullname={memberInfo?.fullname}
          isEmployee={isEmployee}
          isClient={isClient}
          memberStatus={memberStatus}
          statusColor={statusColor}
          theme={T}
          onMenuPress={() => navigation.openDrawer()}
        />

        {/* Expired Banner */}
        {isClient && isExpired && <ExpiredBanner remainingDays={remainingDays!} />}

        {/* Expired Banner Locker */}
        {isClient && isLockerExpired && <ExpiredBannerLocker remainingDays={remainingDaysLocker!} />}

        {/* Freeze Info Banner (client only) */}
        {isClient && isFrozen && (
          <FreezeInfoBanner freezeInfo={freezeInfo} freezeDate={freezeDate} />
        )}

        {/* Remaining Days Card */}
        {remainingDays !== null && !isExpired && (
          <RemainingDaysCard
            remainingDays={remainingDays}
            daysColor={daysColor}
            expireDate={memberInfo?.memberExpireDate}
            theme={T}
          />
        )}

        {/* QR Code Card */}
        {isEmployee && staffQR && (
          <QRCodeCard
            memberId={staffQR}
            theme={T}
            isEmployee
            refreshingQR={refreshingQR}
            onRefreshQR={async () => {
              if (!accessToken || !memberId) return;
              setRefreshingQR(true);
              try {
                const qr = await fetchQRForStaff(accessToken, memberId);
                setStaffQR(qr);
              } catch { /* ignore */ }
              setRefreshingQR(false);
            }}
          />
        )}
        {!isEmployee && memberId && <QRCodeCard memberId={memberId} theme={T} />}

        {/* Promo banner */}
        {/* {isClient && <PromoBanner theme={T} />} */}

        {/* Quick Stats */}
        <QuickStats
          checkInsCount={
            isEmployee
              ? staffAttendance.length
              : isGuest
                ? guestAttendance.length
                : memberAttendances.length
          }
          branch={memberInfo?.branch}
          dueAmount={memberInfo?.dueAmount}
          theme={T}
        />

        {/* Top 10 Check-ins Leaderboard */}
        {accessToken && (
          <TopCheckinsCard accessToken={accessToken} branch={memberInfo?.branch ?? ""} theme={T} />
        )}

        {/* Hourly Gym Traffic Chart */}
        {accessToken && (
          <HourlyAttendanceChart
            accessToken={accessToken}
            branch=""
            theme={T}
          />
        )}

        

        {/* Membership Dates (hide for employees) */}
        {!isEmployee && (
          <MembershipDates
            isClient={isClient}
            isGuest={isGuest}
            isExpired={isExpired}
            memberDate={memberInfo?.memberDate}
            memberBeginDate={memberInfo?.memberBeginDate}
            memberExpireDate={memberInfo?.memberExpireDate}
            daysLabel={daysLabel}
            daysColor={daysColor}
            theme={T}
          />
        )}

        {/* Locker Info Card (client only, hide for employees) */}
        {!isEmployee && isClient && locker && (
          <LockerInfoCard
            locker={locker}
            isLockerExpired={isLockerExpired}
            daysLabel={daysLabelLocker}
            daysColor={daysColorLocker}
            theme={T}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: "#888",
    letterSpacing: 0.5,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 15,
    color: "#ef4444",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    borderRadius: 10,
    paddingHorizontal: 32,
    paddingVertical: 12,
    marginBottom: 12,
  },
  retryText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 1,
  },
  logoutBtnAlt: {
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  logoutBtnAltText: {
    color: "#888",
    fontWeight: "600",
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    paddingTop: 56,
    paddingBottom: 40,
  },
});
