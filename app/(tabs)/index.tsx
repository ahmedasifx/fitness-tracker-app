import { ScrollView, Text, View, TouchableOpacity, RefreshControl, StyleSheet, type PressableStateCallbackType } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useFitness } from "@/lib/fitness-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

export default function HomeScreen() {
  const { state, refreshData } = useFitness();
  const router = useRouter();
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshData();
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogWorkout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/(tabs)/workout");
  };

  const handleCheckIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/(tabs)/checkin");
  };

  const getTotalDuration = () => {
    return state.todayWorkouts.reduce((sum, w) => sum + w.duration, 0);
  };

  const getCheckInStatus = () => {
    return state.todayCheckIn ? "Completed" : "Pending";
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const recentWorkouts = state.todayWorkouts.slice(0, 3);

  const handlePressStyle = (pressed: boolean) => ({
    opacity: pressed ? 0.8 : 1,
    transform: [{ scale: pressed ? 0.97 : 1 }],
  });

  return (
    <ScreenContainer className="p-0">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header Section */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-4xl font-bold text-foreground">
            {getGreeting()}
          </Text>
          <Text className="text-sm text-muted mt-1">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>

        {/* Quick Stats Card */}
        <View className="mx-6 mb-6 bg-surface rounded-2xl p-6 border border-border">
          <Text className="text-lg font-semibold text-foreground mb-4">
            Today's Summary
          </Text>
          <View className="flex-row justify-between mb-4">
            <View className="flex-1">
              <Text className="text-3xl font-bold text-primary">
                {state.todayWorkouts.length}
              </Text>
              <Text className="text-sm text-muted mt-1">Workouts</Text>
            </View>
            <View className="flex-1">
              <Text className="text-3xl font-bold text-primary">
                {getTotalDuration()}
              </Text>
              <Text className="text-sm text-muted mt-1">Minutes</Text>
            </View>
            <View className="flex-1">
              <Text className="text-3xl font-bold text-primary">
                {getCheckInStatus() === "Completed" ? "✓" : "○"}
              </Text>
              <Text className="text-sm text-muted mt-1">Check-In</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="px-6 mb-6 gap-3">
          <TouchableOpacity
            onPress={handleLogWorkout}
            activeOpacity={0.8}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 12,
              paddingVertical: 14,
              paddingHorizontal: 16,
            }}
          >
            <Text className="text-center text-white font-semibold text-base">
              Log Workout
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleCheckIn}
            activeOpacity={0.7}
            style={{
              borderColor: colors.primary,
              borderWidth: 2,
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 16,
            }}
          >
            <Text className="text-center text-primary font-semibold text-base">
              Daily Check-In
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recent Workouts */}
        {recentWorkouts.length > 0 && (
          <View className="px-6 mb-6">
            <Text className="text-lg font-semibold text-foreground mb-3">
              Today's Workouts
            </Text>
            <View className="gap-2">
              {recentWorkouts.map((workout) => (
                <View
                  key={workout.id}
                  className="bg-surface rounded-xl p-4 border border-border flex-row items-center justify-between"
                >
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground capitalize">
                      {workout.exerciseType}
                    </Text>
                    <View className="flex-row gap-2 mt-1">
                      <Text className="text-sm text-muted">
                        {workout.duration} min
                      </Text>
                      <Text className="text-sm text-muted">•</Text>
                      <Text className="text-sm text-muted capitalize">
                        {workout.intensity}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-xs text-muted">
                    {new Date(workout.timestamp).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Empty State */}
        {recentWorkouts.length === 0 && (
          <View className="px-6 py-8 items-center">
            <Text className="text-base text-muted text-center">
              No workouts logged yet today.{"\n"}Start by tapping "Log Workout"!
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
