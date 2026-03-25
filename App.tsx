import React from "react";
import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View, StyleSheet, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { AppThemeProvider } from "./src/context/AppThemeContext";
import { MemberInfoProvider, useMemberInfo } from "./src/context/MemberInfoContext";
import LoginScreen from "./src/screens/LoginScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import StaffAttendanceScreen from "./src/screens/StaffAttendanceScreen";
import MemberAttendanceScreen from "./src/screens/MemberAttendanceScreen";
import PaymentHistoryScreen from "./src/screens/PaymentHistoryScreen";
import FeeStructureScreen from "./src/screens/FeeStructureScreen";
import BodyMeasurementScreen from "./src/screens/BodyMeasurementScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import BranchScreen from "./src/screens/BranchScreen";
import RewardPointsScreen from "./src/screens/RewardPointsScreen";
import CustomDrawerContent from "./src/components/dashboard/CustomDrawerContent";

type AuthStackParamList = {
  Login: undefined;
};

type DrawerParamList = {
  Dashboard: undefined;
  StaffAttendance: undefined;
  MemberAttendance: undefined;
  PaymentHistory: undefined;
  FeeStructure: undefined;
  BodyMeasurement: undefined;
  Profile: undefined;
  Branch: undefined;
  RewardPoints: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Drawer = createDrawerNavigator<DrawerParamList>();

// Inject apple-touch-icon for iOS "Add to Home Screen" on web
if (Platform.OS === "web" && typeof document !== "undefined") {
  const addLink = (rel: string, href: string, sizes?: string) => {
    const link = document.createElement("link");
    link.rel = rel;
    link.href = href;
    if (sizes) link.setAttribute("sizes", sizes);
    document.head.appendChild(link);
  };
  if (!document.querySelector('link[rel="apple-touch-icon"]')) {
    addLink("apple-touch-icon", "/apple-touch-icon.png", "180x180");
  }
  if (!document.querySelector('link[rel="manifest"]')) {
    addLink("manifest", "/manifest.json");
  }
  const metaName = "apple-mobile-web-app-capable";
  if (!document.querySelector(`meta[name="${metaName}"]`)) {
    const meta = document.createElement("meta");
    meta.name = metaName;
    meta.content = "yes";
    document.head.appendChild(meta);
  }
  const metaTitle = "apple-mobile-web-app-title";
  if (!document.querySelector(`meta[name="${metaTitle}"]`)) {
    const meta = document.createElement("meta");
    meta.name = metaTitle;
    meta.content = "TPW";
    document.head.appendChild(meta);
  }
}

function DrawerNavigator() {
  const { memberId, role } = useAuth();
  const { memberInfo, theme } = useMemberInfo();

  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerType: "front",
        drawerStyle: { width: 280 },
      }}
      drawerContent={(props) => (
        <CustomDrawerContent
          {...props}
          theme={theme}
          fullname={memberInfo?.fullname}
          memberId={memberId}
          memberOption={memberInfo?.memberOption}
          role={role}
          memberStatus={memberInfo?.status}
          imageLoc={memberInfo?.imageLoc}
        />
      )}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="StaffAttendance" component={StaffAttendanceScreen} />
      <Drawer.Screen name="MemberAttendance" component={MemberAttendanceScreen} />
      <Drawer.Screen name="PaymentHistory" component={PaymentHistoryScreen} />
      <Drawer.Screen name="FeeStructure" component={FeeStructureScreen} />
      <Drawer.Screen name="BodyMeasurement" component={BodyMeasurementScreen} />
      <Drawer.Screen name="Branch" component={BranchScreen} />
      <Drawer.Screen name="RewardPoints" component={RewardPointsScreen} />
    </Drawer.Navigator>
  );
}

function RootNavigator() {
  const { accessToken, isLoading } = useAuth();

  console.log("[RootNavigator] isLoading:", isLoading, "accessToken:", accessToken ? "EXISTS" : "NULL");

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4361ee" />
      </View>
    );
  }

  const isLoggedIn = !!accessToken;
  console.log("[RootNavigator] isLoggedIn:", isLoggedIn, "-> showing:", isLoggedIn ? "Drawer" : "Login");

  if (isLoggedIn) {
    return <DrawerNavigator />;
  }

  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: "Login" }}
      />
    </AuthStack.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppThemeProvider>
        <AuthProvider>
          <MemberInfoProvider>
            <NavigationContainer>
              <StatusBar style="auto" />
              <RootNavigator />
            </NavigationContainer>
          </MemberInfoProvider>
        </AuthProvider>
      </AppThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a2e",
  },
});
