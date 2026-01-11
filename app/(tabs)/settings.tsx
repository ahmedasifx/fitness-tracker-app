import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useFitness } from "@/lib/fitness-context";
import { useState, useEffect } from "react";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import { exportData, clearAllData } from "@/lib/storage";

export default function SettingsScreen() {
  const { state, updateSettings } = useFitness();
  const colors = useColors();
  const [displayName, setDisplayName] = useState("");
  const [weeklyGoal, setWeeklyGoal] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState("07:00");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (state.settings) {
      setDisplayName(state.settings.displayName);
      setWeeklyGoal(state.settings.weeklyGoal.toString());
      setReminderEnabled(state.settings.reminderEnabled);
      setReminderTime(state.settings.reminderTime);
      setNotificationsEnabled(state.settings.notificationsEnabled);
    }
  }, [state.settings]);

  const handleSaveSettings = async () => {
    if (!displayName.trim()) {
      Alert.alert("Invalid Input", "Please enter a display name");
      return;
    }

    const goal = parseInt(weeklyGoal);
    if (isNaN(goal) || goal <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid weekly goal");
      return;
    }

    setSaving(true);
    try {
      await updateSettings({
        displayName: displayName.trim(),
        weeklyGoal: goal,
        reminderEnabled,
        reminderTime,
        notificationsEnabled,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", "Settings saved!");
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const csvData = await exportData();
      Alert.alert("Data Exported", "Your fitness data has been exported to CSV format.", [
        { text: "OK" },
      ]);
      // In a real app, you would save this to a file or share it
      console.log("CSV Data:", csvData);
    } catch (error) {
      Alert.alert("Error", "Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "This will permanently delete all your workouts and check-ins. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await clearAllData();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert("Success", "All data has been cleared");
              // Refresh the app state by reloading
              window.location.reload?.();
            } catch (error) {
              Alert.alert("Error", "Failed to clear data");
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-3xl font-bold text-foreground">Settings</Text>
          <Text className="text-sm text-muted mt-1">Manage your preferences</Text>
        </View>

        {/* Profile Section */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-foreground mb-4">Profile</Text>
          <View className="bg-surface rounded-2xl p-6 border border-border gap-4">
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">
                Display Name
              </Text>
              <TextInput
                className="border border-border rounded-lg px-4 py-3 text-foreground"
                placeholder="Your name"
                placeholderTextColor={colors.muted}
                value={displayName}
                onChangeText={setDisplayName}
              />
            </View>

            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">
                Weekly Goal (workouts)
              </Text>
              <TextInput
                className="border border-border rounded-lg px-4 py-3 text-foreground"
                placeholder="5"
                placeholderTextColor={colors.muted}
                keyboardType="number-pad"
                value={weeklyGoal}
                onChangeText={setWeeklyGoal}
              />
            </View>
          </View>
        </View>

        {/* Notifications Section */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-foreground mb-4">
            Notifications
          </Text>
          <View className="bg-surface rounded-2xl p-6 border border-border gap-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-foreground">
                Enable Notifications
              </Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={(value) => {
                  setNotificationsEnabled(value);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={notificationsEnabled ? colors.primary : colors.muted}
              />
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-foreground">
                Daily Reminder
              </Text>
              <Switch
                value={reminderEnabled}
                onValueChange={(value) => {
                  setReminderEnabled(value);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={reminderEnabled ? colors.primary : colors.muted}
              />
            </View>

            {reminderEnabled && (
              <View>
                <Text className="text-sm font-semibold text-foreground mb-2">
                  Reminder Time
                </Text>
                <TextInput
                  className="border border-border rounded-lg px-4 py-3 text-foreground"
                  placeholder="07:00"
                  placeholderTextColor={colors.muted}
                  value={reminderTime}
                  onChangeText={setReminderTime}
                />
              </View>
            )}
          </View>
        </View>

        {/* Data Section */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-foreground mb-4">Data</Text>
          <View className="bg-surface rounded-2xl p-6 border border-border gap-3">
            <TouchableOpacity
              onPress={handleExportData}
              disabled={exporting}
              activeOpacity={0.7}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 12,
                paddingVertical: 12,
                opacity: exporting ? 0.6 : 1,
              }}
            >
              {exporting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-center text-white font-semibold">
                  Export Data as CSV
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleClearData}
              activeOpacity={0.7}
              style={{
                backgroundColor: colors.error,
                borderRadius: 12,
                paddingVertical: 12,
              }}
            >
              <Text className="text-center text-white font-semibold">
                Clear All Data
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Save Button */}
        <View className="px-6 mb-6">
          <TouchableOpacity
            onPress={handleSaveSettings}
            disabled={saving}
            activeOpacity={0.8}
            style={{
              backgroundColor: colors.success,
              borderRadius: 12,
              paddingVertical: 14,
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-center text-white font-semibold text-base">
                Save Settings
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View className="px-6 pb-6">
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-sm font-semibold text-foreground mb-2">
              Fitness Tracker
            </Text>
            <Text className="text-xs text-muted">Version 1.0.0</Text>
            <Text className="text-xs text-muted mt-4">
              Track your workouts, monitor your progress, and stay motivated on your fitness
              journey.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
