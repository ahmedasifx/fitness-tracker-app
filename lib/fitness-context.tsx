import React, { createContext, useContext, useReducer, useCallback, useEffect } from "react";
import {
  Workout,
  CheckIn,
  UserSettings,
  getWorkouts,
  getCheckIns,
  getSettings,
  saveWorkout,
  saveCheckIn,
  saveSettings,
  deleteWorkout,
  getTodayWorkouts,
  getTodayCheckIn,
} from "./storage";

interface FitnessState {
  workouts: Workout[];
  checkIns: CheckIn[];
  settings: UserSettings;
  todayWorkouts: Workout[];
  todayCheckIn: CheckIn | null;
  loading: boolean;
  error: string | null;
}

type FitnessAction =
  | { type: "SET_WORKOUTS"; payload: Workout[] }
  | { type: "SET_CHECKINS"; payload: CheckIn[] }
  | { type: "SET_SETTINGS"; payload: UserSettings }
  | { type: "SET_TODAY_WORKOUTS"; payload: Workout[] }
  | { type: "SET_TODAY_CHECKIN"; payload: CheckIn | null }
  | { type: "ADD_WORKOUT"; payload: Workout }
  | { type: "ADD_CHECKIN"; payload: CheckIn }
  | { type: "DELETE_WORKOUT"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

const initialState: FitnessState = {
  workouts: [],
  checkIns: [],
  settings: {
    displayName: "Fitness Tracker",
    weeklyGoal: 5,
    reminderEnabled: false,
    reminderTime: "07:00",
    notificationsEnabled: true,
  },
  todayWorkouts: [],
  todayCheckIn: null,
  loading: true,
  error: null,
};

function fitnessReducer(state: FitnessState, action: FitnessAction): FitnessState {
  switch (action.type) {
    case "SET_WORKOUTS":
      return { ...state, workouts: action.payload };
    case "SET_CHECKINS":
      return { ...state, checkIns: action.payload };
    case "SET_SETTINGS":
      return { ...state, settings: action.payload };
    case "SET_TODAY_WORKOUTS":
      return { ...state, todayWorkouts: action.payload };
    case "SET_TODAY_CHECKIN":
      return { ...state, todayCheckIn: action.payload };
    case "ADD_WORKOUT":
      return {
        ...state,
        workouts: [...state.workouts, action.payload],
        todayWorkouts: [
          ...state.todayWorkouts,
          action.payload,
        ],
      };
    case "ADD_CHECKIN":
      return {
        ...state,
        checkIns: [...state.checkIns, action.payload],
        todayCheckIn: action.payload,
      };
    case "DELETE_WORKOUT":
      return {
        ...state,
        workouts: state.workouts.filter((w) => w.id !== action.payload),
        todayWorkouts: state.todayWorkouts.filter((w) => w.id !== action.payload),
      };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

const FitnessContext = createContext<
  | {
      state: FitnessState;
      addWorkout: (workout: Omit<Workout, "id" | "timestamp">) => Promise<void>;
      addCheckIn: (checkIn: Omit<CheckIn, "id" | "timestamp">) => Promise<void>;
      removeWorkout: (id: string) => Promise<void>;
      updateSettings: (settings: UserSettings) => Promise<void>;
      refreshData: () => Promise<void>;
    }
  | undefined
>(undefined);

export function FitnessProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(fitnessReducer, initialState);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        dispatch({ type: "SET_LOADING", payload: true });
        const [workouts, checkIns, settings] = await Promise.all([
          getWorkouts(),
          getCheckIns(),
          getSettings(),
        ]);
        dispatch({ type: "SET_WORKOUTS", payload: workouts });
        dispatch({ type: "SET_CHECKINS", payload: checkIns });
        dispatch({ type: "SET_SETTINGS", payload: settings });

        // Load today's data
        const todayWorkouts = await getTodayWorkouts();
        const todayCheckIn = await getTodayCheckIn();
        dispatch({ type: "SET_TODAY_WORKOUTS", payload: todayWorkouts });
        dispatch({ type: "SET_TODAY_CHECKIN", payload: todayCheckIn });

        dispatch({ type: "SET_ERROR", payload: null });
      } catch (error) {
        dispatch({
          type: "SET_ERROR",
          payload: error instanceof Error ? error.message : "Failed to load data",
        });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    loadData();
  }, []);

  const addWorkout = useCallback(
    async (workoutData: Omit<Workout, "id" | "timestamp">) => {
      try {
        const workout: Workout = {
          ...workoutData,
          id: `workout_${Date.now()}`,
          timestamp: Date.now(),
        };
        await saveWorkout(workout);
        dispatch({ type: "ADD_WORKOUT", payload: workout });
      } catch (error) {
        dispatch({
          type: "SET_ERROR",
          payload: error instanceof Error ? error.message : "Failed to save workout",
        });
        throw error;
      }
    },
    []
  );

  const addCheckIn = useCallback(
    async (checkInData: Omit<CheckIn, "id" | "timestamp">) => {
      try {
        const checkIn: CheckIn = {
          ...checkInData,
          id: `checkin_${Date.now()}`,
          timestamp: Date.now(),
        };
        await saveCheckIn(checkIn);
        dispatch({ type: "ADD_CHECKIN", payload: checkIn });
      } catch (error) {
        dispatch({
          type: "SET_ERROR",
          payload: error instanceof Error ? error.message : "Failed to save check-in",
        });
        throw error;
      }
    },
    []
  );

  const removeWorkout = useCallback(async (id: string) => {
    try {
      await deleteWorkout(id);
      dispatch({ type: "DELETE_WORKOUT", payload: id });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Failed to delete workout",
      });
      throw error;
    }
  }, []);

  const updateSettings = useCallback(async (settings: UserSettings) => {
    try {
      await saveSettings(settings);
      dispatch({ type: "SET_SETTINGS", payload: settings });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Failed to save settings",
      });
      throw error;
    }
  }, []);

  const refreshData = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const [workouts, checkIns] = await Promise.all([
        getWorkouts(),
        getCheckIns(),
      ]);
      dispatch({ type: "SET_WORKOUTS", payload: workouts });
      dispatch({ type: "SET_CHECKINS", payload: checkIns });

      const todayWorkouts = await getTodayWorkouts();
      const todayCheckIn = await getTodayCheckIn();
      dispatch({ type: "SET_TODAY_WORKOUTS", payload: todayWorkouts });
      dispatch({ type: "SET_TODAY_CHECKIN", payload: todayCheckIn });

      dispatch({ type: "SET_ERROR", payload: null });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Failed to refresh data",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  return (
    <FitnessContext.Provider
      value={{
        state,
        addWorkout,
        addCheckIn,
        removeWorkout,
        updateSettings,
        refreshData,
      }}
    >
      {children}
    </FitnessContext.Provider>
  );
}

export function useFitness() {
  const context = useContext(FitnessContext);
  if (!context) {
    throw new Error("useFitness must be used within FitnessProvider");
  }
  return context;
}
