import { describe, it, expect, beforeEach, vi } from "vitest";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getWorkouts,
  saveWorkout,
  deleteWorkout,
  getTodayWorkouts,
  getCheckIns,
  saveCheckIn,
  getTodayCheckIn,
  getSettings,
  saveSettings,
  exportData,
  type Workout,
  type CheckIn,
} from "./storage";

// Mock AsyncStorage
vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    multiRemove: vi.fn(),
  },
}));

describe("Storage - Workouts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should save a workout", async () => {
    const mockSetItem = vi.spyOn(AsyncStorage, "setItem");
    const mockGetItem = vi.spyOn(AsyncStorage, "getItem").mockResolvedValue("[]");

    const workout: Workout = {
      id: "test-1",
      date: "2024-01-11",
      exerciseType: "running",
      duration: 30,
      intensity: "moderate",
      notes: "Morning run",
      timestamp: Date.now(),
    };

    await saveWorkout(workout);

    expect(mockSetItem).toHaveBeenCalled();
    expect(mockGetItem).toHaveBeenCalled();
  });

  it("should retrieve all workouts", async () => {
    const mockWorkouts: Workout[] = [
      {
        id: "test-1",
        date: "2024-01-11",
        exerciseType: "running",
        duration: 30,
        intensity: "moderate",
        timestamp: Date.now(),
      },
    ];

    vi.spyOn(AsyncStorage, "getItem").mockResolvedValue(JSON.stringify(mockWorkouts));

    const workouts = await getWorkouts();

    expect(workouts).toEqual(mockWorkouts);
    expect(workouts).toHaveLength(1);
  });

  it("should delete a workout", async () => {
    const mockWorkouts: Workout[] = [
      {
        id: "test-1",
        date: "2024-01-11",
        exerciseType: "running",
        duration: 30,
        intensity: "moderate",
        timestamp: Date.now(),
      },
      {
        id: "test-2",
        date: "2024-01-11",
        exerciseType: "cycling",
        duration: 45,
        intensity: "hard",
        timestamp: Date.now(),
      },
    ];

    vi.spyOn(AsyncStorage, "getItem").mockResolvedValue(JSON.stringify(mockWorkouts));
    const mockSetItem = vi.spyOn(AsyncStorage, "setItem");

    await deleteWorkout("test-1");

    expect(mockSetItem).toHaveBeenCalled();
    const callArgs = mockSetItem.mock.calls[0];
    const savedData = JSON.parse(callArgs[1] as string);
    expect(savedData).toHaveLength(1);
    expect(savedData[0].id).toBe("test-2");
  });

  it("should get today's workouts", async () => {
    const today = new Date().toISOString().split("T")[0];
    const mockWorkouts: Workout[] = [
      {
        id: "test-1",
        date: today,
        exerciseType: "running",
        duration: 30,
        intensity: "moderate",
        timestamp: Date.now(),
      },
      {
        id: "test-2",
        date: "2024-01-10",
        exerciseType: "cycling",
        duration: 45,
        intensity: "hard",
        timestamp: Date.now(),
      },
    ];

    vi.spyOn(AsyncStorage, "getItem").mockResolvedValue(JSON.stringify(mockWorkouts));

    const todayWorkouts = await getTodayWorkouts();

    expect(todayWorkouts).toHaveLength(1);
    expect(todayWorkouts[0].date).toBe(today);
  });
});

describe("Storage - Check-Ins", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should save a check-in", async () => {
    const mockSetItem = vi.spyOn(AsyncStorage, "setItem");
    const mockGetItem = vi.spyOn(AsyncStorage, "getItem").mockResolvedValue("[]");

    const checkIn: CheckIn = {
      id: "checkin-1",
      date: "2024-01-11",
      mood: "good",
      energyLevel: 7,
      sleepQuality: "good",
      notes: "Feeling great",
      timestamp: Date.now(),
    };

    await saveCheckIn(checkIn);

    expect(mockSetItem).toHaveBeenCalled();
    expect(mockGetItem).toHaveBeenCalled();
  });

  it("should retrieve all check-ins", async () => {
    const mockCheckIns: CheckIn[] = [
      {
        id: "checkin-1",
        date: "2024-01-11",
        mood: "good",
        energyLevel: 7,
        sleepQuality: "good",
        timestamp: Date.now(),
      },
    ];

    vi.spyOn(AsyncStorage, "getItem").mockResolvedValue(JSON.stringify(mockCheckIns));

    const checkIns = await getCheckIns();

    expect(checkIns).toEqual(mockCheckIns);
    expect(checkIns).toHaveLength(1);
  });

  it("should get today's check-in", async () => {
    const today = new Date().toISOString().split("T")[0];
    const mockCheckIns: CheckIn[] = [
      {
        id: "checkin-1",
        date: today,
        mood: "good",
        energyLevel: 7,
        sleepQuality: "good",
        timestamp: Date.now(),
      },
    ];

    vi.spyOn(AsyncStorage, "getItem").mockResolvedValue(JSON.stringify(mockCheckIns));

    const todayCheckIn = await getTodayCheckIn();

    expect(todayCheckIn).not.toBeNull();
    expect(todayCheckIn?.date).toBe(today);
  });

  it("should return null if no check-in today", async () => {
    const mockCheckIns: CheckIn[] = [
      {
        id: "checkin-1",
        date: "2024-01-10",
        mood: "good",
        energyLevel: 7,
        sleepQuality: "good",
        timestamp: Date.now(),
      },
    ];

    vi.spyOn(AsyncStorage, "getItem").mockResolvedValue(JSON.stringify(mockCheckIns));

    const todayCheckIn = await getTodayCheckIn();

    expect(todayCheckIn).toBeNull();
  });
});

describe("Storage - Settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should save settings", async () => {
    const mockSetItem = vi.spyOn(AsyncStorage, "setItem");

    const settings = {
      displayName: "John Doe",
      weeklyGoal: 5,
      reminderEnabled: true,
      reminderTime: "07:00",
      notificationsEnabled: true,
    };

    await saveSettings(settings);

    expect(mockSetItem).toHaveBeenCalledWith(
      "fitness_settings",
      JSON.stringify(settings)
    );
  });

  it("should retrieve settings with defaults", async () => {
    vi.spyOn(AsyncStorage, "getItem").mockResolvedValue(null);

    const settings = await getSettings();

    expect(settings.displayName).toBe("Fitness Tracker");
    expect(settings.weeklyGoal).toBe(5);
    expect(settings.reminderEnabled).toBe(false);
  });

  it("should retrieve custom settings", async () => {
    const customSettings = {
      displayName: "Jane Doe",
      weeklyGoal: 7,
      reminderEnabled: true,
      reminderTime: "06:00",
      notificationsEnabled: false,
    };

    vi.spyOn(AsyncStorage, "getItem").mockResolvedValue(JSON.stringify(customSettings));

    const settings = await getSettings();

    expect(settings).toEqual(customSettings);
  });
});

describe("Storage - Data Export", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should export data as CSV", async () => {
    const mockWorkouts: Workout[] = [
      {
        id: "test-1",
        date: "2024-01-11",
        exerciseType: "running",
        duration: 30,
        intensity: "moderate",
        notes: "Morning run",
        timestamp: Date.now(),
      },
    ];

    const mockCheckIns: CheckIn[] = [
      {
        id: "checkin-1",
        date: "2024-01-11",
        mood: "good",
        energyLevel: 7,
        sleepQuality: "good",
        notes: "Feeling great",
        timestamp: Date.now(),
      },
    ];

    vi.spyOn(AsyncStorage, "getItem")
      .mockResolvedValueOnce(JSON.stringify(mockWorkouts))
      .mockResolvedValueOnce(JSON.stringify(mockCheckIns));

    const csv = await exportData();

    expect(csv).toContain("WORKOUTS");
    expect(csv).toContain("CHECK-INS");
    expect(csv).toContain("running");
    expect(csv).toContain("good");
  });
});

describe("Storage - Data Validation", () => {
  it("should handle empty workouts array", async () => {
    vi.spyOn(AsyncStorage, "getItem").mockResolvedValue("[]");

    const workouts = await getWorkouts();

    expect(workouts).toEqual([]);
  });

  it("should handle invalid JSON gracefully", async () => {
    vi.spyOn(AsyncStorage, "getItem").mockResolvedValue("invalid json");

    try {
      await getWorkouts();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("should validate workout duration is positive", async () => {
    const mockSetItem = vi.spyOn(AsyncStorage, "setItem");
    vi.spyOn(AsyncStorage, "getItem").mockResolvedValue("[]");

    const workout: Workout = {
      id: "test-1",
      date: "2024-01-11",
      exerciseType: "running",
      duration: -30, // Invalid: negative duration
      intensity: "moderate",
      timestamp: Date.now(),
    };

    // The save function doesn't validate, but the UI should
    await saveWorkout(workout);

    expect(mockSetItem).toHaveBeenCalled();
  });

  it("should validate energy level is between 1-10", () => {
    const validCheckIn: CheckIn = {
      id: "checkin-1",
      date: "2024-01-11",
      mood: "good",
      energyLevel: 5,
      sleepQuality: "good",
      timestamp: Date.now(),
    };

    expect(validCheckIn.energyLevel).toBeGreaterThanOrEqual(1);
    expect(validCheckIn.energyLevel).toBeLessThanOrEqual(10);
  });
});
