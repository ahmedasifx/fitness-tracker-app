import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Workout {
  id: string;
  date: string; // ISO date string
  exerciseType: "running" | "cycling" | "strength" | "yoga" | "other";
  duration: number; // minutes
  intensity: "easy" | "moderate" | "hard";
  notes?: string;
  timestamp: number; // milliseconds
}

export interface CheckIn {
  id: string;
  date: string; // ISO date string
  mood: "great" | "good" | "okay" | "tired" | "not_great";
  energyLevel: number; // 1-10
  sleepQuality: "poor" | "fair" | "good" | "excellent";
  notes?: string;
  timestamp: number; // milliseconds
}

export interface UserSettings {
  displayName: string;
  weeklyGoal: number;
  reminderEnabled: boolean;
  reminderTime: string; // HH:mm format
  notificationsEnabled: boolean;
}

const WORKOUTS_KEY = "fitness_workouts";
const CHECKINS_KEY = "fitness_checkins";
const SETTINGS_KEY = "fitness_settings";

const DEFAULT_SETTINGS: UserSettings = {
  displayName: "Fitness Tracker",
  weeklyGoal: 5,
  reminderEnabled: false,
  reminderTime: "07:00",
  notificationsEnabled: true,
};

// Workout storage functions
export async function getWorkouts(): Promise<Workout[]> {
  try {
    const data = await AsyncStorage.getItem(WORKOUTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading workouts:", error);
    return [];
  }
}

export async function saveWorkout(workout: Workout): Promise<void> {
  try {
    const workouts = await getWorkouts();
    workouts.push(workout);
    await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
  } catch (error) {
    console.error("Error saving workout:", error);
    throw error;
  }
}

export async function deleteWorkout(id: string): Promise<void> {
  try {
    const workouts = await getWorkouts();
    const filtered = workouts.filter((w) => w.id !== id);
    await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error deleting workout:", error);
    throw error;
  }
}

export async function getTodayWorkouts(): Promise<Workout[]> {
  try {
    const workouts = await getWorkouts();
    const today = new Date().toISOString().split("T")[0];
    return workouts.filter((w) => w.date === today);
  } catch (error) {
    console.error("Error reading today's workouts:", error);
    return [];
  }
}

export async function getWorkoutsByDateRange(
  startDate: string,
  endDate: string
): Promise<Workout[]> {
  try {
    const workouts = await getWorkouts();
    return workouts.filter((w) => w.date >= startDate && w.date <= endDate);
  } catch (error) {
    console.error("Error reading workouts by date range:", error);
    return [];
  }
}

// Check-in storage functions
export async function getCheckIns(): Promise<CheckIn[]> {
  try {
    const data = await AsyncStorage.getItem(CHECKINS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading check-ins:", error);
    return [];
  }
}

export async function saveCheckIn(checkIn: CheckIn): Promise<void> {
  try {
    const checkIns = await getCheckIns();
    checkIns.push(checkIn);
    await AsyncStorage.setItem(CHECKINS_KEY, JSON.stringify(checkIns));
  } catch (error) {
    console.error("Error saving check-in:", error);
    throw error;
  }
}

export async function getTodayCheckIn(): Promise<CheckIn | null> {
  try {
    const checkIns = await getCheckIns();
    const today = new Date().toISOString().split("T")[0];
    return checkIns.find((c) => c.date === today) || null;
  } catch (error) {
    console.error("Error reading today's check-in:", error);
    return null;
  }
}

export async function getCheckInsByDateRange(
  startDate: string,
  endDate: string
): Promise<CheckIn[]> {
  try {
    const checkIns = await getCheckIns();
    return checkIns.filter((c) => c.date >= startDate && c.date <= endDate);
  } catch (error) {
    console.error("Error reading check-ins by date range:", error);
    return [];
  }
}

// Settings storage functions
export async function getSettings(): Promise<UserSettings> {
  try {
    const data = await AsyncStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  } catch (error) {
    console.error("Error reading settings:", error);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving settings:", error);
    throw error;
  }
}

// Data export and clear functions
export async function exportData(): Promise<string> {
  try {
    const workouts = await getWorkouts();
    const checkIns = await getCheckIns();
    const settings = await getSettings();

    const csvContent = [
      "Fitness Tracker Data Export",
      new Date().toISOString(),
      "",
      "WORKOUTS",
      "Date,Exercise Type,Duration (min),Intensity,Notes,Timestamp",
      ...workouts.map(
        (w) =>
          `${w.date},${w.exerciseType},${w.duration},${w.intensity},"${w.notes || ''}",${w.timestamp}`
      ),
      "",
      "CHECK-INS",
      "Date,Mood,Energy Level,Sleep Quality,Notes,Timestamp",
      ...checkIns.map(
        (c) =>
          `${c.date},${c.mood},${c.energyLevel},${c.sleepQuality},"${c.notes || ''}",${c.timestamp}`
      ),
    ].join("\n");

    return csvContent;
  } catch (error) {
    console.error("Error exporting data:", error);
    throw error;
  }
}

export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([WORKOUTS_KEY, CHECKINS_KEY, SETTINGS_KEY]);
  } catch (error) {
    console.error("Error clearing data:", error);
    throw error;
  }
}
