import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
  Switch,
} from "react-native";
import {
  DrawerContentScrollView,
  DrawerContentComponentProps,
} from "@react-navigation/drawer";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../context/AuthContext";
import { useMemberInfo } from "../../context/MemberInfoContext";
import { useAppTheme } from "../../context/AppThemeContext";
import { DashboardTheme, THEME_MALE } from "./theme";
import { API_BASE_URL } from "../../api/config";
import { uploadProfilePicture, fetchMemberLoginInfo } from "../../api/member";

interface DrawerItem {
  key: string;
  label: string;
  icon: string;
  screen: string;
}

interface CustomDrawerContentProps extends DrawerContentComponentProps {
  theme?: DashboardTheme;
  fullname?: string;
  memberId?: string | null;
  memberOption?: string | null;
  role?: string | null;
  memberStatus?: string | null;
  imageLoc?: string | null;
}

export default function CustomDrawerContent(
  props: CustomDrawerContentProps
) {
  const { logout, accessToken, memberId: authMemberId } = useAuth();
  const { memberInfo, setMemberInfo: setGlobalMemberInfo } = useMemberInfo();
  const { isDark, toggleTheme } = useAppTheme();
  const T = props.theme ?? THEME_MALE;
  const { fullname, memberId, memberOption, role, memberStatus, imageLoc } = props;
  // The plain-text memberId (e.g. "TPW-02-06013872") comes from memberInfo
  const plainMemberId = memberInfo?.memberId ?? null;
  const isEmployee = role === "employee";
  const isClient = role === "client";
  const isGuest = role === "guest";

  const [uploading, setUploading] = useState(false);
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);

  // Check if imageLoc has a real image (not just the folder path)
  const hasImage = !!imageLoc && imageLoc.trim().replace(/\/+$/, "") !== "Image/Members" && imageLoc.trim().length > "Image/Members/".length;
  const imageUri = localImageUri ?? (hasImage ? `${API_BASE_URL}/${imageLoc}` : null);

  const handlePickImage = async () => {
    try {
      if (!plainMemberId || !accessToken || !authMemberId) {
        Alert.alert("Error", "Missing member info. Please log in again.");
        return;
      }

      // Request permission
      const permResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permResult.status !== "granted") {
        Alert.alert("Permission Required", "Please allow access to your photo library to upload a profile picture.");
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];

      // Validate file size (< 1 MB) — on web, fileSize may be undefined so fetch the blob to check
      let fileSize = asset.fileSize;
      if (!fileSize && Platform.OS === "web") {
        try {
          const blob = await fetch(asset.uri).then((r) => r.blob());
          fileSize = blob.size;
        } catch { /* proceed without size check */ }
      }

      if (fileSize && fileSize > 1024 * 1024) {
        Alert.alert("File Too Large", `Please select an image smaller than 1 MB.\nSelected file: ${(fileSize / (1024 * 1024)).toFixed(2)} MB`);
        return;
      }

      const fileName = asset.fileName ?? `profile_${Date.now()}.jpg`;
      const mimeType = asset.mimeType ?? "image/jpeg";

      // Show loading
      setUploading(true);

      // Use plain-text memberId (e.g. "TPW-02-06013872") for the upload API
      const response = await uploadProfilePicture(accessToken, plainMemberId, asset.uri, fileName, mimeType);

      // Update local image immediately
      setLocalImageUri(asset.uri);

      // Refresh member info from server (uses auth memberId for the info API)
      try {
        const updatedInfo = await fetchMemberLoginInfo(accessToken, authMemberId);
        setGlobalMemberInfo(updatedInfo);
      } catch { /* ignore refresh error */ }

      Alert.alert("Success", "Profile picture updated successfully!");
    } catch (err: any) {
      Alert.alert("Upload Failed", err?.message ?? "Could not upload profile picture. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const currentRoute =
    props.state.routes[props.state.index]?.name ?? "Dashboard";

  // ─── Build menu items based on role ────────────────────────
  const primaryItems: DrawerItem[] = [
    { key: "profile", label: "Profile", icon: "\u{1F464}", screen: "Profile" },
    { key: "dashboard", label: "Dashboard", icon: "\u{1F3E0}", screen: "Dashboard" },
  ];

  if (isEmployee) {
    primaryItems.push({
      key: "staff-attendance",
      label: "My Attendance",
      icon: "\u{1F4CB}",
      screen: "StaffAttendance",
    });
  }

  if (isClient) {
    primaryItems.push({
      key: "my-attendance",
      label: "My Attendance",
      icon: "\u{1F4CB}",
      screen: "MemberAttendance",
    });
    primaryItems.push({
      key: "payment-history",
      label: "Payment History",
      icon: "\u{1F4B3}",
      screen: "PaymentHistory",
    });
    primaryItems.push({
      key: "reward-points",
      label: "Reward Points",
      icon: "\u{1F3C6}",
      screen: "RewardPoints",
    });
  }

  if (isGuest) {
    primaryItems.push({
      key: "guest-attendance",
      label: "My Attendance",
      icon: "\u{1F4CB}",
      screen: "MemberAttendance",
    });
  }

  // Fee Structure is available to all roles
  primaryItems.push({
    key: "fee-structure",
    label: "Fee Structure",
    icon: "\u{1F4B0}",
    screen: "FeeStructure",
  });

  // Body Measurement is available to clients and employees
  if (isClient || isEmployee) {
    primaryItems.push({
      key: "body-measurement",
      label: "Body Measurement",
      icon: "\u{1F4CF}",
      screen: "BodyMeasurement",
    });
  }

  // Branch is available to all roles
  primaryItems.push({
    key: "branch",
    label: "Our Branches",
    icon: "\u{1F3E2}",
    screen: "Branch",
  });



  const handleNavigate = (screen: string) => {
    props.navigation.navigate(screen);
  };

  const handleLogout = () => {
    props.navigation.closeDrawer();
    logout();
  };

  return (
    <View style={[styles.container, { backgroundColor: T.bg }]}>
      {/* ── Drawer Header ──────────────────────────────────── */}
      <View style={[styles.header, { backgroundColor: T.accent }]}>
        <View style={styles.avatarContainer}>
          <TouchableOpacity
            onPress={handlePickImage}
            activeOpacity={0.7}
            disabled={uploading}
          >
            <View style={[styles.avatar, { borderColor: "#fff" }]}>
              {uploading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={styles.avatarText}>
                  {fullname?.charAt(0)?.toUpperCase() ?? "?"}
                </Text>
              )}
            </View>
            {/* Camera icon overlay */}
            <View style={styles.cameraIconWrapper}>
              <Text style={styles.cameraIcon}>📷</Text>
            </View>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerName} numberOfLines={1}>
          {fullname ?? "User"}
        </Text>
        <Text style={styles.headerId}>{memberOption ?? ""}</Text>
        {memberStatus && (
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {memberStatus.toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      {/* ── Menu Items ─────────────────────────────────────── */}
      <ScrollView style={styles.menuContainer}>
        {primaryItems.map((item) => {
          const isActive = currentRoute === item.screen;
          return (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.menuItem,
                isActive && {
                  backgroundColor: T.accentLight,
                  borderRightWidth: 3,
                  borderRightColor: T.accent,
                },
              ]}
              onPress={() => handleNavigate(item.screen)}
              activeOpacity={0.6}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text
                style={[
                  styles.menuLabel,
                  { color: T.textSecondary },
                  isActive && { color: T.accent, fontWeight: "700" },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* ── Divider ──────────────────────────────────────── */}
        <View style={[styles.divider, { backgroundColor: T.border }]} />

        {/* ── Theme Toggle ─────────────────────────────────── */}
        <View style={styles.themeToggleRow}>
          <Text style={[styles.menuIcon, { fontSize: 20 }]}>
            {isDark ? "\u{1F319}" : "\u{2600}\u{FE0F}"}
          </Text>
          <Text style={[styles.menuLabel, { color: T.textSecondary }]}>
            {isDark ? "Dark Mode" : "Light Mode"}
          </Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: "#ccc", true: T.accent }}
            thumbColor="#fff"
          />
        </View>
      </ScrollView>

      {/* ── Logout Button ──────────────────────────────────── */}
      <View style={[styles.footer, { borderTopColor: T.border }]}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.6}
        >
          <Text style={styles.logoutIcon}>{"\u{1F6AA}"}</Text>
          <Text style={styles.logoutLabel}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Header
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    marginBottom: 12,
    alignSelf: "flex-start",
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: 86,
    height: 86,
    borderRadius: 43,
    resizeMode: "cover",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
  },
  cameraIconWrapper: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  cameraIcon: {
    fontSize: 14,
  },
  headerName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
    textTransform: "capitalize",
  },
  headerId: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  statusBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.8,
  },
  // Menu
  menuContainer: {
    flex: 1,
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 16,
  },
  menuIcon: {
    fontSize: 20,
    width: 28,
    textAlign: "center",
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#ccc",
  },
  themeToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 16,
  },
  divider: {
    height: 1,
    marginVertical: 8,
    marginHorizontal: 20,
  },
  // Footer
  footer: {
    borderTopWidth: 1,
    paddingVertical: 8,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 16,
  },
  logoutIcon: {
    fontSize: 20,
    width: 28,
    textAlign: "center",
  },
  logoutLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ef4444",
  },
});
