import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useMemberInfo } from "../context/MemberInfoContext";
import { insertBodyMeasurement, updateBodyMeasurement, deleteBodyMeasurement, fetchMemberLoginInfo } from "../api/member";
import { BodyMeasurement } from "../types/api";
import { useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";

type FormMode = "insert" | "update";

export default function BodyMeasurementScreen() {
  const { accessToken, memberId: authMemberId } = useAuth();
  const { memberInfo, setMemberInfo, theme } = useMemberInfo();
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const T = theme;

  const memberId = memberInfo?.memberId ?? "";
  const measurements = memberInfo?.bodyMeasurements ?? [];

  // Form modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("insert");
  const [editingId, setEditingId] = useState<number | undefined>(undefined);

  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [upperArm, setUpperArm] = useState("");
  const [foreArm, setForeArm] = useState("");
  const [chest, setChest] = useState("");
  const [waist, setWaist] = useState("");
  const [thigh, setThigh] = useState("");
  const [calf, setCalf] = useState("");
  const [loading, setLoading] = useState(false);

  const getTodayDate = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}/${m}/${d}`;
  };

  const clearForm = () => {
    setWeight("");
    setHeight("");
    setUpperArm("");
    setForeArm("");
    setChest("");
    setWaist("");
    setThigh("");
    setCalf("");
    setEditingId(undefined);
  };

  const openInsertForm = () => {
    clearForm();
    setFormMode("insert");
    setModalVisible(true);
  };

  const openUpdateForm = (m: BodyMeasurement) => {
    setWeight(m.weight ?? "");
    setHeight(m.height ?? "");
    setUpperArm(m.upperArm ?? "");
    setForeArm(m.foreArm ?? "");
    setChest(m.chest ?? "");
    setWaist(m.waist ?? "");
    setThigh(m.thigh ?? "");
    setCalf(m.calf ?? "");
    setEditingId(m.measurementId);
    setFormMode("update");
    setModalVisible(true);
  };

  const refreshMemberInfo = useCallback(async () => {
    if (!accessToken || !authMemberId) {
      console.log("[BodyMeasurement] Cannot refresh: missing token or memberId");
      return;
    }
    try {
      console.log("[BodyMeasurement] Refreshing member info...");
      const updated = await fetchMemberLoginInfo(accessToken, authMemberId);
      console.log("[BodyMeasurement] Refreshed. bodyMeasurements count:", updated?.bodyMeasurements?.length ?? 0);
      setMemberInfo(updated);
    } catch (err: any) {
      console.log("[BodyMeasurement] Refresh failed:", err?.message);
    }
  }, [accessToken, authMemberId, setMemberInfo]);

  const handleSubmit = async () => {
    if (!weight && !height && !upperArm && !foreArm && !chest && !waist && !thigh && !calf) {
      Alert.alert("Validation", "Please fill in at least one measurement.");
      return;
    }
    if (!accessToken || !memberId) {
      Alert.alert("Error", "You must be logged in to submit measurements.");
      return;
    }

    setLoading(true);
    try {
      const data: BodyMeasurement = {
        memberId,
        measurementDate: getTodayDate(),
        weight,
        height,
        upperArm,
        foreArm,
        chest,
        waist,
        thigh,
        calf,
      };

      let message: string;
      if (formMode === "update" && editingId != null) {
        data.measurementId = editingId;
        const result = await updateBodyMeasurement(accessToken, data);
        message = result.message;

        // Update local bodyMeasurements with returned data (no need to re-fetch)
        if (result.updatedData && memberInfo) {
          const updatedList = (memberInfo.bodyMeasurements ?? []).map((m) =>
            m.measurementId === editingId ? result.updatedData! : m
          );
          setMemberInfo({ ...memberInfo, bodyMeasurements: updatedList });
        }
      } else {
        message = await insertBodyMeasurement(accessToken, data);
        // For insert, refresh from server to get the new entry with measurementId
        await refreshMemberInfo();
      }

      setModalVisible(false);
      clearForm();

      Alert.alert("Success", message || "Body measurement saved successfully.");
    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.message || "Failed to save body measurement. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (m: BodyMeasurement) => {
    console.log("[BodyMeasurement] Delete pressed, measurementId:", m.measurementId);
    if (m.measurementId == null) {
      console.log("[BodyMeasurement] No measurementId, skipping delete");
      return;
    }

    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        `Are you sure you want to delete the measurement from ${m.measurementDate}?`
      );
      if (confirmed) {
        performDelete(m.measurementId!);
      }
    } else {
      Alert.alert(
        "Delete Measurement",
        `Are you sure you want to delete the measurement from ${m.measurementDate}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => performDelete(m.measurementId!),
          },
        ]
      );
    }
  };

  const performDelete = async (measurementId: number) => {
    if (!accessToken) return;
    setLoading(true);
    try {
      console.log("[BodyMeasurement] Calling deleteBodyMeasurement API, id:", measurementId);
      const message = await deleteBodyMeasurement(accessToken, measurementId);
      console.log("[BodyMeasurement] Delete success:", message);
      if (memberInfo) {
        const updatedList = (memberInfo.bodyMeasurements ?? []).filter(
          (item) => item.measurementId !== measurementId
        );
        setMemberInfo({ ...memberInfo, bodyMeasurements: updatedList });
      }
      Alert.alert("Success", message);
    } catch (err: any) {
      console.log("[BodyMeasurement] Delete failed:", err?.message);
      Alert.alert("Error", err?.message || "Failed to delete measurement.");
    } finally {
      setLoading(false);
    }
  };

  const formFields = [
    { label: "Weight", value: weight, setter: setWeight, placeholder: "e.g. 80", icon: "⚖️", suffix: "kg" },
    { label: "Height", value: height, setter: setHeight, placeholder: "e.g. 5 feet 10 inch", icon: "📏", suffix: "" },
    { label: "Upper Arm", value: upperArm, setter: setUpperArm, placeholder: "e.g. 14 inch", icon: "💪", suffix: "inch" },
    { label: "Fore Arm", value: foreArm, setter: setForeArm, placeholder: "e.g. 12 inch", icon: "💪", suffix: "inch" },
    { label: "Chest", value: chest, setter: setChest, placeholder: "e.g. 40 inch", icon: "🫁", suffix: "inch" },
    { label: "Waist", value: waist, setter: setWaist, placeholder: "e.g. 28 inch", icon: "📐", suffix: "inch" },
    { label: "Thigh", value: thigh, setter: setThigh, placeholder: "e.g. 20 inch", icon: "🦵", suffix: "inch" },
    { label: "Calf", value: calf, setter: setCalf, placeholder: "e.g. 16 inch", icon: "🦶", suffix: "inch" },
  ];

  const displayLabels = [
    { key: "weight", label: "Weight", icon: "⚖️", suffix: "kg" },
    { key: "height", label: "Height", icon: "📏", suffix: "" },
    { key: "upperArm", label: "Upper Arm", icon: "💪", suffix: "" },
    { key: "foreArm", label: "Fore Arm", icon: "💪", suffix: "" },
    { key: "chest", label: "Chest", icon: "🫁", suffix: "" },
    { key: "waist", label: "Waist", icon: "📐", suffix: "" },
    { key: "thigh", label: "Thigh", icon: "🦵", suffix: "" },
    { key: "calf", label: "Calf", icon: "🦶", suffix: "" },
  ];

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: T.bg }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: T.card, borderBottomColor: T.border }]}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuBtn}>
          <Text style={[styles.menuIcon, { color: T.text }]}>☰</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: T.text }]}>Body Measurement</Text>
        <View style={styles.menuBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Add New Measurement Button */}
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: T.accent }]}
          onPress={openInsertForm}
          activeOpacity={0.85}
        >
          <Text style={styles.addBtnText}>+ NEW MEASUREMENT</Text>
        </TouchableOpacity>

        {/* Measurements List */}
        {measurements.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: T.card, borderColor: T.border }]}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={[styles.emptyText, { color: T.textSecondary }]}>No measurements recorded yet</Text>
            <Text style={[styles.emptySubtext, { color: T.textMuted }]}>Tap the button above to add your first measurement</Text>
          </View>
        ) : (
          measurements.map((m, index) => (
            <View
              key={m.measurementId ?? index}
              style={[styles.measurementCard, { backgroundColor: T.card, borderColor: T.border }]}
            >
              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View>
                  <Text style={[styles.cardDate, { color: T.accent }]}>
                    📅 {m.measurementDate}
                  </Text>
                  {m.measurementId != null && (
                    <Text style={styles.cardId}>ID: {m.measurementId}</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={[styles.editBtn, { borderColor: T.accent }]}
                  onPress={() => openUpdateForm(m)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.editBtnText, { color: T.accent }]}>✏️ Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.editBtn, { borderColor: "#e74c3c" }]}
                  onPress={() => handleDelete(m)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.editBtnText, { color: "#e74c3c" }]}>🗑️ Delete</Text>
                </TouchableOpacity>
              </View>

              {/* Measurement Values Grid */}
              <View style={styles.grid}>
                {displayLabels.map((dl) => {
                  const val = (m as any)[dl.key];
                  if (!val && val !== 0) return null;
                  return (
                    <View key={dl.key} style={styles.gridItem}>
                      <Text style={styles.gridIcon}>{dl.icon}</Text>
                      <View>
                        <Text style={[styles.gridLabel, { color: T.textSecondary }]}>{dl.label}</Text>
                        <Text style={[styles.gridValue, { color: T.text }]}>
                          {val}{dl.suffix ? ` ${dl.suffix}` : ""}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Insert / Update Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => !loading && setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: T.card, borderColor: T.border }]}>
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <Text style={[styles.modalTitle, { color: T.accent }]}>
                  {formMode === "update" ? "✏️ Update Measurement" : "📋 New Measurement"}
                </Text>

                {/* Member & Date info */}
                <View style={styles.modalInfo}>
                  <Text style={styles.modalInfoText}>Member: {memberId}</Text>
                  <Text style={styles.modalInfoText}>Date: {getTodayDate()}</Text>
                </View>

                {/* Fields */}
                {formFields.map((field) => (
                  <View key={field.label} style={styles.fieldRow}>
                    <Text style={styles.fieldIcon}>{field.icon}</Text>
                    <View style={styles.fieldContent}>
                      <Text style={[styles.fieldLabel, { color: T.textSecondary }]}>{field.label}</Text>
                      <View style={styles.inputRow}>
                        <TextInput
                          style={[styles.input, { borderColor: T.border, backgroundColor: T.bg, color: T.text }]}
                          placeholder={field.placeholder}
                          placeholderTextColor={T.textMuted}
                          value={field.value}
                          onChangeText={field.setter}
                          editable={!loading}
                        />
                        {field.suffix ? (
                          <Text style={styles.suffix}>{field.suffix}</Text>
                        ) : null}
                      </View>
                    </View>
                  </View>
                ))}

                {/* Submit */}
                <TouchableOpacity
                  style={[styles.submitBtn, { backgroundColor: T.accent }, loading && styles.submitBtnDisabled]}
                  onPress={handleSubmit}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitBtnText}>
                      {formMode === "update" ? "UPDATE MEASUREMENT" : "SAVE MEASUREMENT"}
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Cancel */}
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  activeOpacity={0.7}
                  style={styles.cancelLink}
                  disabled={loading}
                >
                  <Text style={[styles.cancelText, { color: T.accent }]}>Cancel</Text>
                </TouchableOpacity>

                <View style={{ height: 20 }} />
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 54 : 36,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  menuBtn: {
    width: 40,
    alignItems: "center",
  },
  menuIcon: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  scrollContent: {
    padding: 16,
  },
  addBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  addBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  emptyCard: {
    borderRadius: 16,
    padding: 40,
    borderWidth: 1,
    alignItems: "center",
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 13,
    textAlign: "center",
  },
  measurementCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128,128,128,0.2)",
    paddingBottom: 12,
  },
  cardDate: {
    fontSize: 15,
    fontWeight: "700",
  },
  cardId: {
    fontSize: 11,
    color: "#999",
    marginTop: 2,
  },
  editBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  gridItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "50%",
    marginBottom: 10,
  },
  gridIcon: {
    fontSize: 16,
    width: 26,
    textAlign: "center",
  },
  gridLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  gridValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    maxHeight: "90%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  modalInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128,128,128,0.2)",
  },
  modalInfoText: {
    fontSize: 12,
    color: "#999",
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  fieldIcon: {
    fontSize: 18,
    width: 28,
    textAlign: "center",
  },
  fieldContent: {
    flex: 1,
    marginLeft: 8,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  suffix: {
    fontSize: 13,
    color: "#999",
    marginLeft: 8,
    fontWeight: "600",
  },
  submitBtn: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  cancelLink: {
    marginTop: 12,
    alignItems: "center",
    paddingVertical: 8,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
