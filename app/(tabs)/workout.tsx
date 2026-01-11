import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useFitness } from "@/lib/fitness-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

const EXERCISE_TYPES = [
  { label: "Running", value: "running" },
  { label: "Cycling", value: "cycling" },
  { label: "Strength", value: "strength" },
  { label: "Yoga", value: "yoga" },
  { label: "Other", value: "other" },
];

const INTENSITY_LEVELS = [
  { label: "Easy", value: "easy" },
  { label: "Moderate", value: "moderate" },
  { label: "Hard", value: "hard" },
];

export default function WorkoutScreen() {
  const { state, addWorkout, removeWorkout } = useFitness();
  const router = useRouter();
  const colors = useColors();
  const [selectedExercise, setSelectedExercise] = useState<string>("running");
  const [duration, setDuration] = useState<string>("");
  const [selectedIntensity, setSelectedIntensity] = useState<string>("moderate");
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSaveWorkout = async () => {
    if (!duration || parseInt(duration) <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid duration in minutes");
      return;
    }

    setLoading(true);
    try {
      await addWorkout({
        date: new Date().toISOString().split("T")[0],
        exerciseType: selectedExercise as any,
        duration: parseInt(duration),
        intensity: selectedIntensity as any,
        notes: notes || undefined,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", "Workout saved!");

      // Reset form
      setDuration("");
      setSelectedExercise("running");
      setSelectedIntensity("moderate");
      setNotes("");
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Failed to save workout");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkout = (id: string) => {
    Alert.alert("Delete Workout", "Are you sure you want to delete this workout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await removeWorkout(id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch (error) {
            Alert.alert("Error", "Failed to delete workout");
          }
        },
      },
    ]);
  };

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-3xl font-bold text-foreground">Log Workout</Text>
          <Text className="text-sm text-muted mt-1">Track your exercise</Text>
        </View>

        {/* Form Section */}
        <View className="px-6 mb-6 bg-surface rounded-2xl p-6 border border-border">
          {/* Exercise Type */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-foreground mb-3">
              Exercise Type
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {EXERCISE_TYPES.map((exercise) => (
                <TouchableOpacity
                  key={exercise.value}
                  onPress={() => setSelectedExercise(exercise.value)}
                  activeOpacity={0.7}
                  style={{
                    backgroundColor:
                      selectedExercise === exercise.value
                        ? colors.primary
                        : colors.border,
                    borderRadius: 8,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                  }}
                >
                  <Text
                    className={
                      selectedExercise === exercise.value
                        ? "text-white font-semibold text-sm"
                        : "text-foreground font-semibold text-sm"
                    }
                  >
                    {exercise.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Duration */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-foreground mb-2">
              Duration (minutes)
            </Text>
            <TextInput
              className="border border-border rounded-lg px-4 py-3 text-foreground"
              placeholder="30"
              placeholderTextColor={colors.muted}
              keyboardType="number-pad"
              value={duration}
              onChangeText={setDuration}
            />
          </View>

          {/* Intensity */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-foreground mb-3">
              Intensity
            </Text>
            <View className="flex-row gap-2">
              {INTENSITY_LEVELS.map((intensity) => (
                <TouchableOpacity
                  key={intensity.value}
                  onPress={() => setSelectedIntensity(intensity.value)}
                  activeOpacity={0.7}
                  style={{
                    flex: 1,
                    backgroundColor:
                      selectedIntensity === intensity.value
                        ? colors.primary
                        : colors.border,
                    borderRadius: 8,
                    paddingVertical: 10,
                  }}
                >
                  <Text
                    className={
                      selectedIntensity === intensity.value
                        ? "text-white font-semibold text-sm text-center"
                        : "text-foreground font-semibold text-sm text-center"
                    }
                  >
                    {intensity.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Notes */}
          <View className="mb-5">
            <Text className="text-sm font-semibold text-foreground mb-2">
              Notes (optional)
            </Text>
            <TextInput
              className="border border-border rounded-lg px-4 py-3 text-foreground"
              placeholder="How did it feel?"
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
            onPress={handleSaveWorkout}
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
                Save Workout
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Today's Workouts */}
        {state.todayWorkouts.length > 0 && (
          <View className="px-6 mb-6">
            <Text className="text-lg font-semibold text-foreground mb-3">
              Today's Workouts
            </Text>
            <FlatList
              scrollEnabled={false}
              data={state.todayWorkouts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View className="bg-surface rounded-xl p-4 border border-border mb-2 flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground capitalize">
                      {item.exerciseType}
                    </Text>
                    <View className="flex-row gap-2 mt-1">
                      <Text className="text-sm text-muted">{item.duration} min</Text>
                      <Text className="text-sm text-muted">•</Text>
                      <Text className="text-sm text-muted capitalize">
                        {item.intensity}
                      </Text>
                    </View>
                    {item.notes && (
                      <Text className="text-xs text-muted mt-2">{item.notes}</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteWorkout(item.id)}
                    activeOpacity={0.6}
                  >
                    <Text className="text-red-500 font-semibold">Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        )}

        {state.todayWorkouts.length === 0 && (
          <View className="px-6 py-8 items-center">
            <Text className="text-base text-muted text-center">
              No workouts logged yet today.{"\n"}Start by filling out the form above!
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
