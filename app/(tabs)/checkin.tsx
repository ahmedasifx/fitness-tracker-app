import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useFitness } from "@/lib/fitness-context";
import { useState } from "react";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

const MOOD_OPTIONS = [
  { label: "Great", emoji: "😄", value: "great" },
  { label: "Good", emoji: "😊", value: "good" },
  { label: "Okay", emoji: "😐", value: "okay" },
  { label: "Tired", emoji: "😕", value: "tired" },
  { label: "Not Great", emoji: "😞", value: "not_great" },
];

const SLEEP_QUALITY = [
  { label: "Poor", value: "poor" },
  { label: "Fair", value: "fair" },
  { label: "Good", value: "good" },
  { label: "Excellent", value: "excellent" },
];

export default function CheckInScreen() {
  const { state, addCheckIn } = useFitness();
  const colors = useColors();
  const [selectedMood, setSelectedMood] = useState<string>("good");
  const [energyLevel, setEnergyLevel] = useState<number>(5);
  const [selectedSleep, setSelectedSleep] = useState<string>("good");
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSaveCheckIn = async () => {
    setLoading(true);
    try {
      await addCheckIn({
        date: new Date().toISOString().split("T")[0],
        mood: selectedMood as any,
        energyLevel,
        sleepQuality: selectedSleep as any,
        notes: notes || undefined,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", "Check-in saved!");

      // Reset form
      setSelectedMood("good");
      setEnergyLevel(5);
      setSelectedSleep("good");
      setNotes("");
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Failed to save check-in");
    } finally {
      setLoading(false);
    }
  };

  const getMoodEmoji = (value: string) => {
    return MOOD_OPTIONS.find((m) => m.value === value)?.emoji || "😐";
  };

  const lastCheckIn = state.todayCheckIn;

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-3xl font-bold text-foreground">Daily Check-In</Text>
          <Text className="text-sm text-muted mt-1">How are you feeling today?</Text>
        </View>

        {/* Form Section */}
        <View className="px-6 mb-6 bg-surface rounded-2xl p-6 border border-border">
          {/* Mood Selector */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-foreground mb-3">
              How's your mood?
            </Text>
            <View className="flex-row justify-between gap-2">
              {MOOD_OPTIONS.map((mood) => (
                <TouchableOpacity
                  key={mood.value}
                  onPress={() => {
                    setSelectedMood(mood.value);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  activeOpacity={0.7}
                  style={{
                    flex: 1,
                    backgroundColor:
                      selectedMood === mood.value ? colors.primary : colors.border,
                    borderRadius: 12,
                    paddingVertical: 12,
                    paddingHorizontal: 8,
                    alignItems: "center",
                  }}
                >
                  <Text className="text-2xl mb-1">{mood.emoji}</Text>
                  <Text
                    className={
                      selectedMood === mood.value
                        ? "text-white font-semibold text-xs text-center"
                        : "text-foreground font-semibold text-xs text-center"
                    }
                  >
                    {mood.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Energy Level Slider */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-sm font-semibold text-foreground">
                Energy Level
              </Text>
              <View
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 8,
                  paddingVertical: 4,
                  paddingHorizontal: 12,
                }}
              >
                <Text className="text-white font-bold text-sm">{energyLevel}/10</Text>
              </View>
            </View>
            <View className="flex-row gap-1">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                <TouchableOpacity
                  key={num}
                  onPress={() => {
                    setEnergyLevel(num);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  activeOpacity={0.7}
                  style={{
                    flex: 1,
                    height: 40,
                    backgroundColor: energyLevel >= num ? colors.primary : colors.border,
                    borderRadius: 6,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    className={
                      energyLevel >= num ? "text-white font-bold text-xs" : "text-muted text-xs"
                    }
                  >
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sleep Quality */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-foreground mb-3">
              Sleep Quality
            </Text>
            <View className="flex-row gap-2">
              {SLEEP_QUALITY.map((sleep) => (
                <TouchableOpacity
                  key={sleep.value}
                  onPress={() => {
                    setSelectedSleep(sleep.value);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  activeOpacity={0.7}
                  style={{
                    flex: 1,
                    backgroundColor:
                      selectedSleep === sleep.value ? colors.primary : colors.border,
                    borderRadius: 8,
                    paddingVertical: 10,
                  }}
                >
                  <Text
                    className={
                      selectedSleep === sleep.value
                        ? "text-white font-semibold text-sm text-center"
                        : "text-foreground font-semibold text-sm text-center"
                    }
                  >
                    {sleep.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Notes */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-foreground mb-2">
              Notes (optional)
            </Text>
            <TextInput
              className="border border-border rounded-lg px-4 py-3 text-foreground"
              placeholder="How's your day going?"
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={3}
              value={notes}
              onChangeText={setNotes}
              textAlignVertical="top"
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSaveCheckIn}
            disabled={loading}
            activeOpacity={0.8}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 12,
              paddingVertical: 14,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-center text-white font-semibold text-base">
                Save Check-In
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Last Check-In Info */}
        {lastCheckIn && (
          <View className="px-6 mb-6">
            <View className="bg-success/10 rounded-xl p-4 border border-success">
              <Text className="text-sm font-semibold text-foreground mb-2">
                ✓ Today's Check-In Completed
              </Text>
              <Text className="text-xs text-muted">
                Mood: {getMoodEmoji(lastCheckIn.mood)} {lastCheckIn.mood} • Energy:{" "}
                {lastCheckIn.energyLevel}/10 • Sleep: {lastCheckIn.sleepQuality}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
