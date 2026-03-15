import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  Image,
  Dimensions,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useAppTheme } from "../context/AppThemeContext";
import { resetPassword, generateOtp, forgetPassword } from "../api/auth";

const { width: SCREEN_W } = Dimensions.get("window");
const LOGO_W = Math.min(SCREEN_W * 0.55, 240);

const ACCENT = "#C62828";

function getColors(isDark: boolean) {
  return isDark
    ? {
        bg: "#0B0B0F",
        card: "#141418",
        inputBg: "#1C1C22",
        border: "#2A2A30",
        text: "#ffffff",
        textSecondary: "#888888",
        textMuted: "#555555",
        placeholder: "#555",
        focusBg: "#1A1014",
        modalOverlay: "rgba(0,0,0,0.85)",
        footerText: "#333",
      }
    : {
        bg: "#F5F5F8",
        card: "#FFFFFF",
        inputBg: "#F0F0F5",
        border: "#E0E0E6",
        text: "#1a1a2e",
        textSecondary: "#666666",
        textMuted: "#999999",
        placeholder: "#aaa",
        focusBg: "#FFF0F0",
        modalOverlay: "rgba(0,0,0,0.45)",
        footerText: "#bbb",
      };
}

/** Cross-platform alert (Alert.alert is unsupported on web) */
function showAlert(title: string, message: string) {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

export default function LoginScreen() {
  const { login } = useAuth();
  const { isDark } = useAppTheme();
  const C = useMemo(() => getColors(isDark), [isDark]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Reset password state
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [resetUsername, setResetUsername] = useState("");
  const [resetCurrentPassword, setResetCurrentPassword] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  // Forgot password state
  const [forgotModalVisible, setForgotModalVisible] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotOtpSent, setForgotOtpSent] = useState(false);

  const handleLogin = async () => {
    const trimmedUser = username.trim();
    if (!trimmedUser || !password) {
      showAlert("Validation", "Please enter both username and password.");
      return;
    }

    setLoading(true);
    try {
      await login(trimmedUser, password);
    } catch (err: any) {
      showAlert(
        "Login Failed",
        err?.message || "An unexpected error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const trimmedUser = resetUsername.trim();
    if (!trimmedUser || !resetCurrentPassword || !resetNewPassword) {
      showAlert("Validation", "Please fill in all fields.");
      return;
    }

    setResetLoading(true);
    try {
      const message = await resetPassword(
        trimmedUser,
        resetCurrentPassword,
        resetNewPassword
      );
      showAlert("Success", message || "Password reset successfully.");
      setResetModalVisible(false);
      setResetUsername("");
      setResetCurrentPassword("");
      setResetNewPassword("");
    } catch (err: any) {
      showAlert(
        "Reset Failed",
        err?.message || "An unexpected error occurred. Please try again."
      );
    } finally {
      setResetLoading(false);
    }
  };

  const handleGenerateOtp = async () => {
    const trimmedEmail = forgotEmail.trim();
    if (!trimmedEmail) {
      showAlert("Validation", "Please enter your email.");
      return;
    }
    setForgotLoading(true);
    try {
      const result = await generateOtp(trimmedEmail);
      if (result.status === 200) {
        showAlert("Success", result.message);
        setForgotOtpSent(true);
      } else {
        showAlert("Failed", result.message || "Failed to send OTP. Please try again.");
      }
    } catch (err: any) {
      showAlert("Error", err?.message || "An unexpected error occurred.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const trimmedEmail = forgotEmail.trim();
    const trimmedOtp = forgotOtp.trim();
    if (!trimmedEmail || !trimmedOtp || !forgotNewPassword || !forgotConfirmPassword) {
      showAlert("Validation", "Please fill in all fields.");
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      showAlert("Validation", "New password and confirm password do not match.");
      return;
    }
    setForgotLoading(true);
    try {
      const result = await forgetPassword(trimmedEmail, trimmedOtp, forgotNewPassword, forgotConfirmPassword);
      if (result.status === 200) {
        showAlert("Success", result.message || "Password changed successfully.");
        setForgotModalVisible(false);
        setForgotEmail("");
        setForgotOtp("");
        setForgotNewPassword("");
        setForgotConfirmPassword("");
        setForgotOtpSent(false);
      } else {
        showAlert("Failed", result.message || "Failed to reset password.");
      }
    } catch (err: any) {
      showAlert("Error", err?.message || "An unexpected error occurred.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: C.bg }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Logo & Branding ── */}
        <View style={styles.logoSection}>
          <View style={[styles.logoContainer, !isDark && styles.logoContainerLight]}>
            <Image
              source={require("../../assets/tpw-logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* ── Divider accent line ── */}
        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: C.border }]} />
          <Text style={styles.dividerText}>SIGN IN</Text>
          <View style={[styles.dividerLine, { backgroundColor: C.border }]} />
        </View>

        {/* ── Login Card ── */}
        <View style={[styles.card, { backgroundColor: C.card, borderColor: C.border }]}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: C.textSecondary }]}>USERNAME</Text>
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: C.inputBg, borderColor: C.border },
                usernameFocused && { borderColor: ACCENT, backgroundColor: C.focusBg },
              ]}
            >
              <Text style={styles.inputIcon}>👤</Text>
              <TextInput
                style={[styles.input, { color: C.text }]}
                placeholder="Enter your username"
                placeholderTextColor={C.placeholder}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                onFocus={() => setUsernameFocused(true)}
                onBlur={() => setUsernameFocused(false)}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: C.textSecondary }]}>PASSWORD</Text>
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: C.inputBg, borderColor: C.border },
                passwordFocused && { borderColor: ACCENT, backgroundColor: C.focusBg },
              ]}
            >
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={[styles.input, { color: C.text }]}
                placeholder="Enter your password"
                placeholderTextColor={C.placeholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.loginBtnText}>LOG IN</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setResetUsername(username);
              setResetModalVisible(true);
            }}
            activeOpacity={0.7}
            style={styles.forgotLink}
          >
            <Text style={[styles.forgotLinkText, { color: C.textSecondary }]}>Reset Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setForgotModalVisible(true)}
            activeOpacity={0.7}
            style={styles.forgotLink}
          >
            <Text style={[styles.forgotLinkText, { color: ACCENT }]}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {/* ── Reset Password Modal ── */}
        <Modal
          visible={resetModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setResetModalVisible(false)}
        >
          <View style={[styles.modalOverlay, { backgroundColor: C.modalOverlay }]}>
            <View style={[styles.modalCard, { backgroundColor: C.card, borderColor: C.border }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: C.text }]}>Reset Password</Text>
                <Text style={[styles.modalSubtitle, { color: C.textMuted }]}>
                  Enter your credentials and new password
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: C.textSecondary }]}>USERNAME</Text>
                <View style={[styles.inputWrapper, { backgroundColor: C.inputBg, borderColor: C.border }]}>
                  <Text style={styles.inputIcon}>👤</Text>
                  <TextInput
                    style={[styles.input, { color: C.text }]}
                    placeholder="Enter your username"
                    placeholderTextColor={C.placeholder}
                    value={resetUsername}
                    onChangeText={setResetUsername}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!resetLoading}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: C.textSecondary }]}>CURRENT PASSWORD</Text>
                <View style={[styles.inputWrapper, { backgroundColor: C.inputBg, borderColor: C.border }]}>
                  <Text style={styles.inputIcon}>🔒</Text>
                  <TextInput
                    style={[styles.input, { color: C.text }]}
                    placeholder="Enter current password"
                    placeholderTextColor={C.placeholder}
                    value={resetCurrentPassword}
                    onChangeText={setResetCurrentPassword}
                    secureTextEntry
                    editable={!resetLoading}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: C.textSecondary }]}>NEW PASSWORD</Text>
                <View style={[styles.inputWrapper, { backgroundColor: C.inputBg, borderColor: C.border }]}>
                  <Text style={styles.inputIcon}>🔑</Text>
                  <TextInput
                    style={[styles.input, { color: C.text }]}
                    placeholder="Enter new password"
                    placeholderTextColor={C.placeholder}
                    value={resetNewPassword}
                    onChangeText={setResetNewPassword}
                    secureTextEntry
                    editable={!resetLoading}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.loginBtn,
                  resetLoading && styles.loginBtnDisabled,
                ]}
                onPress={handleResetPassword}
                disabled={resetLoading}
                activeOpacity={0.8}
              >
                {resetLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.loginBtnText}>RESET PASSWORD</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setResetModalVisible(false)}
                activeOpacity={0.7}
                style={styles.cancelBtn}
                disabled={resetLoading}
              >
                <Text style={[styles.cancelBtnText, { color: C.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* ── Forgot Password Modal ── */}
        <Modal
          visible={forgotModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => {
            if (!forgotLoading) {
              setForgotModalVisible(false);
              setForgotOtpSent(false);
              setForgotEmail("");
              setForgotOtp("");
              setForgotNewPassword("");
              setForgotConfirmPassword("");
            }
          }}
        >
          <View style={[styles.modalOverlay, { backgroundColor: C.modalOverlay }]}>
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }} keyboardShouldPersistTaps="handled">
            <View style={[styles.modalCard, { backgroundColor: C.card, borderColor: C.border }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: C.text }]}>Forgot Password</Text>
                <Text style={[styles.modalSubtitle, { color: C.textMuted }]}>
                  {forgotOtpSent ? "Enter the OTP and your new password" : "Enter your email to receive an OTP"}
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: C.textSecondary }]}>EMAIL</Text>
                <View style={[styles.inputWrapper, { backgroundColor: C.inputBg, borderColor: C.border }]}>
                  <Text style={styles.inputIcon}>📧</Text>
                  <TextInput
                    style={[styles.input, { color: C.text }]}
                    placeholder="Enter your email"
                    placeholderTextColor={C.placeholder}
                    value={forgotEmail}
                    onChangeText={setForgotEmail}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    editable={!forgotLoading && !forgotOtpSent}
                  />
                </View>
              </View>

              {!forgotOtpSent ? (
                <TouchableOpacity
                  style={[styles.loginBtn, forgotLoading && styles.loginBtnDisabled]}
                  onPress={handleGenerateOtp}
                  disabled={forgotLoading}
                  activeOpacity={0.8}
                >
                  {forgotLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.loginBtnText}>GENERATE OTP</Text>
                  )}
                </TouchableOpacity>
              ) : (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: C.textSecondary }]}>OTP</Text>
                    <View style={[styles.inputWrapper, { backgroundColor: C.inputBg, borderColor: C.border }]}>
                      <Text style={styles.inputIcon}>🔢</Text>
                      <TextInput
                        style={[styles.input, { color: C.text }]}
                        placeholder="Enter OTP"
                        placeholderTextColor={C.placeholder}
                        value={forgotOtp}
                        onChangeText={setForgotOtp}
                        keyboardType="number-pad"
                        editable={!forgotLoading}
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: C.textSecondary }]}>NEW PASSWORD</Text>
                    <View style={[styles.inputWrapper, { backgroundColor: C.inputBg, borderColor: C.border }]}>
                      <Text style={styles.inputIcon}>🔑</Text>
                      <TextInput
                        style={[styles.input, { color: C.text }]}
                        placeholder="Enter new password"
                        placeholderTextColor={C.placeholder}
                        value={forgotNewPassword}
                        onChangeText={setForgotNewPassword}
                        secureTextEntry
                        editable={!forgotLoading}
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: C.textSecondary }]}>CONFIRM PASSWORD</Text>
                    <View style={[styles.inputWrapper, { backgroundColor: C.inputBg, borderColor: C.border }]}>
                      <Text style={styles.inputIcon}>🔑</Text>
                      <TextInput
                        style={[styles.input, { color: C.text }]}
                        placeholder="Confirm new password"
                        placeholderTextColor={C.placeholder}
                        value={forgotConfirmPassword}
                        onChangeText={setForgotConfirmPassword}
                        secureTextEntry
                        editable={!forgotLoading}
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.loginBtn, forgotLoading && styles.loginBtnDisabled]}
                    onPress={handleForgotPassword}
                    disabled={forgotLoading}
                    activeOpacity={0.8}
                  >
                    {forgotLoading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.loginBtnText}>CHANGE PASSWORD</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity
                onPress={() => {
                  setForgotModalVisible(false);
                  setForgotOtpSent(false);
                  setForgotEmail("");
                  setForgotOtp("");
                  setForgotNewPassword("");
                  setForgotConfirmPassword("");
                }}
                activeOpacity={0.7}
                style={styles.cancelBtn}
                disabled={forgotLoading}
              >
                <Text style={[styles.cancelBtnText, { color: C.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
            </ScrollView>
          </View>
        </Modal>

        {/* ── Footer ── */}
        <Text style={[styles.footer, { color: C.footerText }]}>
          © The Physique Workshop
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  /* ── Layout ── */
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 40,
  },

  /* ── Logo ── */
  logoSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoContainer: {
    backgroundColor: "#0B0B0F",
    borderRadius: 18,
    paddingHorizontal: 24,
    paddingVertical: 16,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 30,
    elevation: 12,
  },
  logoContainerLight: {
    backgroundColor: "#1e1e26",
    shadowColor: "#1e1e26",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 4,
  },
  logo: {
    width: LOGO_W,
    height: LOGO_W * 0.55,
  },

  /* ── Divider ── */
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
    paddingHorizontal: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    color: ACCENT,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 3,
    marginHorizontal: 16,
  },

  /* ── Card ── */
  card: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
  },

  /* ── Inputs ── */
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 10,
    opacity: 0.6,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },

  /* ── Login Button ── */
  loginBtn: {
    backgroundColor: ACCENT,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  loginBtnDisabled: {
    opacity: 0.5,
  },
  loginBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 3,
  },

  /* ── Forgot Link ── */
  forgotLink: {
    marginTop: 18,
    alignItems: "center",
  },
  forgotLinkText: {
    fontSize: 13,
    fontWeight: "500",
  },

  /* ── Footer ── */
  footer: {
    textAlign: "center",
    fontSize: 11,
    marginTop: 32,
    letterSpacing: 1,
  },

  /* ── Modal ── */
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  modalCard: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
  },
  modalHeader: {
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
  },
  cancelBtn: {
    marginTop: 14,
    alignItems: "center",
    paddingVertical: 10,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
