# Fitness Tracker App - Design Document

## Overview
A mobile fitness tracking app designed for iOS (portrait orientation, 9:16) that enables users to log workouts, track daily check-ins, and monitor progress over time. The app follows Apple Human Interface Guidelines for a native iOS feel.

---

## Screen List

1. **Home Screen** - Dashboard with today's summary and quick actions
2. **Workout Log Screen** - Create and view workout entries
3. **Check-In Screen** - Daily mood/energy check-in
4. **Progress Screen** - Charts and statistics for workout history
5. **Settings Screen** - App configuration and preferences

---

## Screen Details

### 1. Home Screen (Dashboard)
**Purpose:** Provide a quick overview of today's activity and motivation.

**Primary Content:**
- Today's date and greeting
- Quick stats card showing:
  - Workouts completed today
  - Total duration (minutes)
  - Check-in status (completed/pending)
- Recent workout list (last 3 workouts)
- Two prominent action buttons:
  - "Log Workout" (primary, blue)
  - "Check-In" (secondary, outline)

**Functionality:**
- Tap "Log Workout" → Navigate to Workout Log Screen
- Tap "Check-In" → Navigate to Check-In Screen
- Tap recent workout item → View workout details
- Pull-to-refresh to reload today's data

---

### 2. Workout Log Screen
**Purpose:** Record new workouts or view existing ones.

**Primary Content:**
- Form to create new workout:
  - Exercise type dropdown (Running, Cycling, Strength, Yoga, Other)
  - Duration input (minutes)
  - Intensity level (Easy, Moderate, Hard)
  - Notes text field (optional)
  - "Save Workout" button
- List of today's workouts below form
- Each workout item shows:
  - Exercise type icon
  - Duration and intensity
  - Time logged
  - Delete option (swipe left)

**Functionality:**
- Select exercise type from dropdown
- Input duration and intensity
- Save workout to local storage
- View all workouts logged today
- Delete individual workouts
- Validation: duration must be > 0

---

### 3. Check-In Screen
**Purpose:** Record daily mood and energy levels.

**Primary Content:**
- "How are you feeling today?" prompt
- Mood selector (5 emoji options):
  - 😄 Great
  - 😊 Good
  - 😐 Okay
  - 😕 Tired
  - 😞 Not great
- Energy level slider (1-10)
- Sleep quality selector (Poor, Fair, Good, Excellent)
- Notes field (optional)
- "Save Check-In" button

**Functionality:**
- Select mood emoji (visual feedback on tap)
- Adjust energy slider
- Select sleep quality
- Save check-in with timestamp
- Show confirmation message after save
- Display last check-in date/time

---

### 4. Progress Screen
**Purpose:** Visualize workout trends and achievements.

**Primary Content:**
- Time period selector (Week, Month, All Time)
- Chart showing:
  - Total workouts per day (bar chart)
  - Total duration per day (line chart)
- Stats summary:
  - Total workouts (selected period)
  - Average duration per workout
  - Most frequent exercise type
  - Streak (consecutive days with workouts)
- Mood trend (small sparkline showing mood over time)

**Functionality:**
- Switch between time periods
- Charts update based on selection
- Tap on chart data points for details
- View streak counter

---

### 5. Settings Screen
**Purpose:** Configure app preferences.

**Primary Content:**
- Profile section:
  - Display name input
  - Goal (weekly workouts target)
- Notifications:
  - Daily reminder toggle (time picker)
  - Workout completion notification toggle
- Data:
  - Export workout data button
  - Clear all data button (with confirmation)
- About:
  - App version
  - Help/FAQ link

**Functionality:**
- Update display name and goal
- Toggle notifications
- Set reminder time
- Export data as CSV
- Clear all data with confirmation dialog

---

## Key User Flows

### Flow 1: Log a Workout
1. User taps "Log Workout" on Home Screen
2. Navigates to Workout Log Screen
3. Selects exercise type (e.g., Running)
4. Enters duration (30 minutes)
5. Selects intensity (Moderate)
6. Optionally adds notes
7. Taps "Save Workout"
8. Confirmation message appears
9. Returns to Home Screen with updated stats

### Flow 2: Daily Check-In
1. User taps "Check-In" on Home Screen
2. Navigates to Check-In Screen
3. Selects mood (😊 Good)
4. Adjusts energy level (7/10)
5. Selects sleep quality (Good)
6. Optionally adds notes
7. Taps "Save Check-In"
8. Confirmation message appears
9. Returns to Home Screen

### Flow 3: View Progress
1. User taps "Progress" tab
2. Navigates to Progress Screen
3. Selects time period (Month)
4. Views workout frequency chart
5. Sees stats summary
6. Can switch to different time period
7. Observes streak counter

### Flow 4: Manage Settings
1. User taps "Settings" tab
2. Navigates to Settings Screen
3. Updates display name or goal
4. Toggles notifications
5. Sets reminder time
6. Taps "Save" (auto-saves)
7. Returns to Settings Screen

---

## Color Choices

The app uses a clean, health-focused color palette:

| Element | Color | Hex | Purpose |
|---------|-------|-----|---------|
| Primary | Blue | #0a7ea4 | Action buttons, active states, primary CTA |
| Background | White (light) / Dark Gray (dark) | #ffffff / #151718 | Screen backgrounds |
| Surface | Light Gray (light) / Darker Gray (dark) | #f5f5f5 / #1e2022 | Cards, elevated surfaces |
| Text Primary | Dark Gray (light) / Light Gray (dark) | #11181C / #ECEDEE | Main text |
| Text Secondary | Medium Gray | #687076 / #9BA1A6 | Secondary text, labels |
| Success | Green | #22C55E | Completion, positive feedback |
| Warning | Orange | #F59E0B | Alerts, caution |
| Error | Red | #EF4444 | Errors, destructive actions |

---

## Interaction Design

### Press Feedback
- **Primary buttons:** Scale 0.97 + haptic feedback (light impact)
- **List items:** Opacity 0.7 on press
- **Icons/toggles:** Opacity 0.6 on press

### Animations
- Screen transitions: Slide from right (iOS standard)
- Button press: 80ms scale animation
- Chart updates: 300ms fade-in
- Confirmation messages: 200ms fade-in, 2s display, 200ms fade-out

### Haptics
- Workout saved: Light impact
- Check-in completed: Medium impact
- Streak milestone: Success notification
- Delete action: Error notification (confirmation)

---

## Navigation Structure

```
Root
├── (tabs)
│   ├── Home (index)
│   ├── Workout Log
│   ├── Progress
│   └── Settings
└── Modals (if needed)
    ├── Workout Detail
    └── Confirmation Dialogs
```

Tab bar icons (bottom):
- Home: house.fill
- Workout: dumbbell (or activity)
- Progress: chart.bar.fill
- Settings: gear

---

## Data Model

### Workout Entry
```typescript
{
  id: string;
  date: Date;
  exerciseType: 'running' | 'cycling' | 'strength' | 'yoga' | 'other';
  duration: number; // minutes
  intensity: 'easy' | 'moderate' | 'hard';
  notes?: string;
  timestamp: Date;
}
```

### Check-In Entry
```typescript
{
  id: string;
  date: Date;
  mood: 'great' | 'good' | 'okay' | 'tired' | 'not_great';
  energyLevel: number; // 1-10
  sleepQuality: 'poor' | 'fair' | 'good' | 'excellent';
  notes?: string;
  timestamp: Date;
}
```

### User Settings
```typescript
{
  displayName: string;
  weeklyGoal: number; // target workouts per week
  reminderEnabled: boolean;
  reminderTime: string; // HH:mm format
  notificationsEnabled: boolean;
}
```

---

## Accessibility Considerations

- All buttons have minimum 44pt touch target
- Color is not the only indicator (use icons + text)
- Text contrast meets WCAG AA standards
- Screen reader support for all interactive elements
- Haptic feedback provides non-visual feedback

---

## Performance Notes

- Use FlatList for workout/check-in lists (never ScrollView with .map())
- Cache charts data to avoid recalculation on every render
- Lazy-load historical data for Progress screen
- Use AsyncStorage for local persistence (no backend required unless user requests cloud sync)

