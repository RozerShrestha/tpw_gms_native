import React, { useState } from "react";
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
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { resetPassword } from "../api/auth";

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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset password state
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [resetUsername, setResetUsername] = useState("");
  const [resetCurrentPassword, setResetCurrentPassword] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top decorative area */}
        <View style={styles.topSection}>
          <Text style={styles.icon}>&#x1F3CB;</Text>
          <Text style={styles.title}>TPW GMS</Text>
          <Text style={styles.subtitle}>Gym Management System</Text>
        </View>

        {/* Login card */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Welcome Back</Text>
          <Text style={styles.cardSubheading}>Sign in to your account</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your username"
              placeholderTextColor="#8a8a8a"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#8a8a8a"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>LOGIN</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setResetUsername(username);
              setResetModalVisible(true);
            }}
            activeOpacity={0.7}
            style={styles.resetLink}
          >
            <Text style={styles.resetLinkText}>Reset Password</Text>
          </TouchableOpacity>
        </View>

        {/* Reset Password Modal */}
        <Modal
          visible={resetModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setResetModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.cardHeading}>Reset Password</Text>
              <Text style={styles.cardSubheading}>Enter your credentials and new password</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your username"
                  placeholderTextColor="#8a8a8a"
                  value={resetUsername}
                  onChangeText={setResetUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!resetLoading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Current Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter current password"
                  placeholderTextColor="#8a8a8a"
                  value={resetCurrentPassword}
                  onChangeText={setResetCurrentPassword}
                  secureTextEntry
                  editable={!resetLoading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>New Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter new password"
                  placeholderTextColor="#8a8a8a"
                  value={resetNewPassword}
                  onChangeText={setResetNewPassword}
                  secureTextEntry
                  editable={!resetLoading}
                />
              </View>

              <TouchableOpacity
                style={[styles.button, resetLoading && styles.buttonDisabled]}
                onPress={handleResetPassword}
                disabled={resetLoading}
                activeOpacity={0.85}
              >
                {resetLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>RESET PASSWORD</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setResetModalVisible(false)}
                activeOpacity={0.7}
                style={styles.cancelLink}
                disabled={resetLoading}
              >
                <Text style={styles.resetLinkText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Text style={styles.footerText}>
          Powered by TPW Gym Management System
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  topSection: {
    alignItems: "center",
    marginBottom: 28,
  },
  icon: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    textAlign: "center",
    color: "#FF6B35",
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 13,
    color: "#aaa",
    textAlign: "center",
    marginTop: 4,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: "#16213e",
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: "#2a2a4a",
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  cardHeading: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  cardSubheading: {
    fontSize: 13,
    color: "#888",
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ccc",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#2a2a4a",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#fff",
    backgroundColor: "#0f1629",
  },
  button: {
    backgroundColor: "#FF6B35",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 2,
  },
  footerText: {
    textAlign: "center",
    color: "#555",
    fontSize: 12,
    marginTop: 24,
  },
  resetLink: {
    marginTop: 16,
    alignItems: "center",
  },
  resetLinkText: {
    color: "#FF6B35",
    fontSize: 14,
    fontWeight: "600",
  },
  cancelLink: {
    marginTop: 12,
    alignItems: "center",
    paddingVertical: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#16213e",
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: "#2a2a4a",
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
});
