import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useFitness } from "@/lib/fitness-context";
import { useState, useMemo } from "react";
import { useColors } from "@/hooks/use-colors";

type TimePeriod = "week" | "month" | "all";

export default function ProgressScreen() {
  const { state } = useFitness();
  const colors = useColors();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("week");

  const getDateRange = (period: TimePeriod) => {
    const today = new Date();
    let startDate = new Date();

    switch (period) {
      case "week":
        startDate.setDate(today.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(today.getMonth() - 1);
        break;
      case "all":
        startDate = new Date(0);
        break;
    }

    return {
      start: startDate.toISOString().split("T")[0],
      end: today.toISOString().split("T")[0],
    };
  };

  const stats = useMemo(() => {
    const { start, end } = getDateRange(timePeriod);
    const periodWorkouts = state.workouts.filter((w) => w.date >= start && w.date <= end);

    if (periodWorkouts.length === 0) {
      return {
        totalWorkouts: 0,
        totalDuration: 0,
        averageDuration: 0,
        mostFrequent: "N/A",
        streak: 0,
      };
    }

    const totalDuration = periodWorkouts.reduce((sum, w) => sum + w.duration, 0);
    const averageDuration = Math.round(totalDuration / periodWorkouts.length);

    // Most frequent exercise
    const exerciseCounts: Record<string, number> = {};
    periodWorkouts.forEach((w) => {
      exerciseCounts[w.exerciseType] = (exerciseCounts[w.exerciseType] || 0) + 1;
    });
    const mostFrequent = Object.entries(exerciseCounts).sort(
      ([, a], [, b]) => b - a
    )[0]?.[0] || "N/A";

    // Calculate streak (consecutive days with workouts)
    let streak = 0;
    let currentDate = new Date();
    while (true) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const hasWorkout = periodWorkouts.some((w) => w.date === dateStr);
      if (hasWorkout) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return {
      totalWorkouts: periodWorkouts.length,
      totalDuration,
      averageDuration,
      mostFrequent: mostFrequent.charAt(0).toUpperCase() + mostFrequent.slice(1),
      streak,
    };
  }, [state.workouts, timePeriod]);

  // Workout frequency data by day
  const workoutsByDay = useMemo(() => {
    const { start, end } = getDateRange(timePeriod);
    const periodWorkouts = state.workouts.filter((w) => w.date >= start && w.date <= end);

    const dayMap: Record<string, number> = {};
    periodWorkouts.forEach((w) => {
      dayMap[w.date] = (dayMap[w.date] || 0) + 1;
    });

    return dayMap;
  }, [state.workouts, timePeriod]);

  // Mood trend data
  const moodTrend = useMemo(() => {
    const { start, end } = getDateRange(timePeriod);
    const periodCheckIns = state.checkIns.filter((c) => c.date >= start && c.date <= end);

    const moodValues: Record<string, number> = {
      great: 5,
      good: 4,
      okay: 3,
      tired: 2,
      not_great: 1,
    };

    return periodCheckIns.map((c) => moodValues[c.mood] || 0);
  }, [state.checkIns, timePeriod]);

  const maxWorkoutsPerDay = Math.max(...Object.values(workoutsByDay), 1);

  return (
    <ScreenContainer className="p-0">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-3xl font-bold text-foreground">Progress</Text>
          <Text className="text-sm text-muted mt-1">Track your fitness journey</Text>
        </View>

        {/* Time Period Selector */}
        <View className="px-6 mb-6 flex-row gap-2">
          {(["week", "month", "all"] as const).map((period) => (
            <TouchableOpacity
              key={period}
              onPress={() => setTimePeriod(period)}
              activeOpacity={0.7}
              style={{
                flex: 1,
                backgroundColor: timePeriod === period ? colors.primary : colors.border,
                borderRadius: 8,
                paddingVertical: 10,
              }}
            >
              <Text
                className={
                  timePeriod === period
                    ? "text-white font-semibold text-sm text-center capitalize"
                    : "text-foreground font-semibold text-sm text-center capitalize"
                }
              >
                {period === "all" ? "All Time" : period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats Cards */}
        <View className="px-6 mb-6 gap-3">
          <View className="flex-row gap-3">
            <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
              <Text className="text-2xl font-bold text-primary">
                {stats.totalWorkouts}
              </Text>
              <Text className="text-xs text-muted mt-1">Total Workouts</Text>
            </View>
            <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
              <Text className="text-2xl font-bold text-primary">
                {stats.totalDuration}
              </Text>
              <Text className="text-xs text-muted mt-1">Total Minutes</Text>
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
              <Text className="text-2xl font-bold text-primary">
                {stats.averageDuration}
              </Text>
              <Text className="text-xs text-muted mt-1">Avg Duration</Text>
            </View>
            <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
              <Text className="text-2xl font-bold text-success">
                {stats.streak}
              </Text>
              <Text className="text-xs text-muted mt-1">Day Streak</Text>
            </View>
          </View>

          <View className="bg-surface rounded-xl p-4 border border-border">
            <Text className="text-2xl font-bold text-primary capitalize">
              {stats.mostFrequent}
            </Text>
            <Text className="text-xs text-muted mt-1">Most Frequent Exercise</Text>
          </View>
        </View>

        {/* Workout Frequency Chart */}
        {Object.keys(workoutsByDay).length > 0 && (
          <View className="px-6 mb-6 bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-lg font-semibold text-foreground mb-4">
              Workouts by Day
            </Text>
            <View className="flex-row items-end justify-between gap-1 h-32">
              {Array.from({ length: 7 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (6 - i));
                const dateStr = date.toISOString().split("T")[0];
                const count = workoutsByDay[dateStr] || 0;
                const height = maxWorkoutsPerDay > 0 ? (count / maxWorkoutsPerDay) * 100 : 0;

                return (
                  <View key={dateStr} className="flex-1 items-center">
                    <View
                      style={{
                        width: "100%",
                        height: `${height}%`,
                        backgroundColor: colors.primary,
                        borderRadius: 4,
                        minHeight: 8,
                      }}
                    />
                    <Text className="text-xs text-muted mt-2">
                      {date.toLocaleDateString("en-US", { weekday: "short" })[0]}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Mood Trend */}
        {moodTrend.length > 0 && (
          <View className="px-6 mb-6 bg-surface rounded-2xl p-6 border border-border">
            <Text className="text-lg font-semibold text-foreground mb-4">
              Mood Trend
            </Text>
            <View className="flex-row items-end justify-between gap-1 h-24">
              {moodTrend.slice(-7).map((mood, i) => (
                <View key={i} className="flex-1 items-center">
                  <View
                    style={{
                      width: "100%",
                      height: `${(mood / 5) * 100}%`,
                      backgroundColor: colors.primary,
                      borderRadius: 4,
                      minHeight: 4,
                    }}
                  />
                </View>
              ))}
            </View>
            <Text className="text-xs text-muted text-center mt-3">
              Last 7 check-ins
            </Text>
          </View>
        )}

        {/* Empty State */}
        {stats.totalWorkouts === 0 && (
          <View className="px-6 py-8 items-center">
            <Text className="text-base text-muted text-center">
              No data available for this period.{"\n"}Start logging workouts to see progress!
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
