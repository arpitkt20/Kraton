# Kraton - Workout Logging Application

A comprehensive workout tracking and body measurement application built with React, TypeScript, and Vite.

## Table of Contents

- [Project Structure](#project-structure)
- [Core Features](#core-features)
- [Components](#components)
- [Data Management](#data-management)
- [Utilities](#utilities)
- [Type Definitions](#type-definitions)
- [Key Functionality](#key-functionality)

## Project Structure

```
Kraton/
├── src/
│   ├── components/
│   │   ├── WorkoutLog.tsx              # Main home page component
│   │   ├── CalendarModal.tsx           # Calendar date picker modal
│   │   ├── ExerciseModal.tsx            # Create new exercise modal
│   │   ├── ExerciseDatabase.tsx        # Exercise database list and filter screen
│   │   ├── BodyTracker.tsx             # Body tracking main component
│   │   │   ├── MeasurementTab.tsx      # Body measurements input form
│   │   │   ├── ChartsTab.tsx           # Body measurement charts
│   │   │   └── HistoryTab.tsx          # Body measurement history list
│   │   ├── WorkoutRegimes.tsx         # Workout regimes list screen
│   │   ├── RegimeEditor.tsx           # Create/edit workout regime screen
│   │   ├── WorkoutEditor.tsx          # Create/edit workout screen (adds exercises)
│   │   ├── RegimeSelector.tsx         # Select regime for starting workout
│   │   ├── WorkoutSelector.tsx        # Select workout from regime
│   │   ├── ActiveWorkout.tsx          # Active workout session with exercises
│   │   ├── LoggedWorkouts.tsx        # Display logged workouts for a date
│   │   ├── SplashScreen.tsx          # App splash screen (first launch)
│   │   ├── Analytics.tsx             # Analytics page with tabs
│   │   │   ├── WorkoutsTab.tsx      # Workouts analytics tab
│   │   │   ├── BreakdownTab.tsx     # Breakdown analytics tab
│   │   │   └── ExercisesTab.tsx     # Exercises analytics tab
│   │   └── Settings.tsx              # Settings page
│   ├── db/
│   │   ├── database.ts                 # Dexie database configuration
│   │   └── migration.ts                # localStorage to Dexie migration utility
│   ├── data/
│   │   └── exercises.ts                # Pre-populated exercise bank (100+ exercises)
│   ├── types/
│   │   ├── bodyTracker.ts              # Body measurement type definitions
│   │   ├── workoutRegime.ts           # Workout regime type definitions
│   │   └── workoutSession.ts          # Workout session type definitions
│   ├── utils/
│   │   ├── exerciseUtils.ts            # Exercise database utility functions (async)
│   │   ├── bodyTrackerUtils.ts         # Body measurement utility functions (async)
│   │   ├── workoutRegimeUtils.ts      # Workout regime utility functions (async)
│   │   └── workoutSessionUtils.ts     # Workout session utility functions (async)
│   ├── resources/
│   │   └── icon.png                   # App icon (favicon and header logo)
│   ├── public/
│   │   ├── icon.png                   # App icon for PWA
│   │   ├── favicon.png                # Favicon (weight plate icon)
│   │   ├── kraton_banner.png          # KRATON banner logo
│   │   └── manifest.json              # PWA manifest file
│   ├── App.tsx                         # Root application component
│   └── main.tsx                        # Application entry point
├── package.json
├── tsconfig.json
├── vite.config.ts
└── index.html                          # HTML entry point with favicon
```

## Core Features

### 1. Workout Log Home Page
- Date navigation with calendar picker
- Displays logged workouts for selected date
- Edit and delete functionality for logged workouts
- Empty state with action buttons when no workouts
- Menu system with multiple options (Settings, Analytics, Body Tracker, Workout DB, Export/Import DB)
- Exercise database management
- KRATON banner logo in header (clickable to go home)
- Calendar shows visual indicators for days with workout entries
- Copy Previous Workout feature
- One workout session per day restriction

### 2. Body Tracker
- Three-tab interface (Measurement, Charts, History)
- Track 18 different body metrics
- Visual charts with time-based filtering
- Historical data tracking

### 3. Workout Regimes
- Create and edit workout regimes
- Regimes contain multiple workouts
- Each workout contains exercises
- Manage exercise parameters (sets, reps) in workouts
- Hierarchical structure: Regime → Workouts → Exercises

### 4. Start New Workout Flow
- Click "Start New Workout" button (only shown when no workout exists for the day)
- Select from available regimes
- Select workout from chosen regime
- Active workout screen with exercises
- Pre-populates with previous workout data
- Track sets, reps, weight (or distance/time)
- Add notes for each set (icon button with popup modal)
- Add/delete sets and exercises dynamically
- Reorder exercises via drag and drop
- Rest timer with countdown (configurable in Settings)
- Save workout sessions by date
- Edit logged workouts anytime
- View exercise history by clicking exercise name

### 5. Workout Sessions
- Logged workouts displayed on home page by date
- View workout summaries with exercise details
- Edit and delete any logged workout
- Track completion status per set
- Set notes displayed in workout summaries
- Historical data for previous values
- One workout session per day (updates existing if present)

### 6. Exercise Database
- Pre-populated with 100+ exercises
- Browse all exercises categorized by muscle groups
- Filter exercises by muscle group
- **Enhanced dropdown with search and grouping**
  - Search exercises by name or category
  - Grouped by muscle type in dropdown
  - Real-time filtering as you type
- Create custom exercises
- Export/Import full database (exercises, body measurements, workout sessions, regimes)
- All exercises persisted in IndexedDB (Dexie)
- Exercise history view (click exercise name during workout)

### 7. Analytics Page
- Accessible from three-dot menu
- Three-tab interface:
  - **WORKOUTS**: Workout statistics and insights
  - **BREAKDOWN**: Detailed breakdown of workout data
  - **EXERCISES**: Exercise performance and statistics

### 8. Settings
- Configure default rest time (in seconds)
- Rest time used for automatic countdown timer
- Timer runs in background even when app is minimized
- Browser notifications when timer completes

### 9. Splash Screen
- Shows app icon and branding on first launch
- Displays for 5 seconds
- Only shown once (tracked in localStorage)
- Responsive design (80% screen coverage)
- Smooth fade animations

## Components

### WorkoutLog.tsx
**Location:** `src/components/WorkoutLog.tsx`

**Purpose:** Main home page component displaying the workout log for a selected date.

**Key State:**
- `selectedDate`: Currently selected date (defaults to Dec 30, 2024)
- `isCalendarOpen`: Controls calendar modal visibility
- `isMenuOpen`: Controls dropdown menu visibility
- `isExerciseModalOpen`: Controls exercise creation modal
- `showBodyTracker`: Controls body tracker screen visibility
- `showWorkoutRegimes`: Controls workout regimes screen visibility
- `showRegimeEditor`: Controls regime editor screen visibility
- `showRegimeSelector`: Controls regime selector screen visibility
- `showWorkoutSelector`: Controls workout selector screen visibility
- `showActiveWorkout`: Controls active workout screen visibility
- `editingRegimeId`: ID of regime being edited (null for new)
- `editingSessionId`: ID of workout session being edited (null for new)
- `selectedRegime`: Currently selected regime for workout
- `selectedWorkout`: Currently selected workout
- `loggedWorkouts`: Array of workout sessions for selected date

**Key Methods:**
- `handleDateSelect(date: Date)`: Updates selected date
- `handlePrevDay()`: Navigate to previous day
- `handleNextDay()`: Navigate to next day
- `handleCalendarIconClick()`: Opens calendar modal
- `handleMenuToggle()`: Toggles dropdown menu
- `handleMenuOptionClick(option: string)`: Handles menu item clicks
  - "Workout DB" → Opens ExerciseDatabase screen
  - "Export DB" → Exports exercise database as JSON
  - "Import DB" → Opens file picker to import exercises
  - "Body Tracker" → Opens body tracker screen
- `handleHomeClick()`: Resets to today's date, closes all modals
- `handlePlusIconClick()`: Opens workout Regimes screen
- `handleStartNewWorkout()`: Opens regime selector to start new workout
- `handleRegimeSelect(regime)`: Selects regime and shows workout selector
- `handleWorkoutSelect(workout)`: Selects workout and shows active workout screen
- `handleEditWorkout(session)`: Opens active workout screen in edit mode
- `handleWorkoutComplete()`: Saves workout and refreshes logged workouts
- `handleExerciseSave(exercise: ExerciseData)`: Saves new exercise to database (async)
- `handleExportDB()`: Exports all exercises to JSON file (async)
- `handleImportDB()`: Triggers file input for importing
- `handleFileChange(event)`: Processes imported JSON file
- `handleCreateNewRegime(RegimeId: string | null)`: Opens Regime editor
- `handleEditRegime(RegimeId: string)`: Opens Regime editor in edit mode
- `handleRegimeEditorBack()`: Returns from editor to Regimes list
- `handleRegimeSaved()`: Handles successful Regime save

**Features:**
- Header with Kraton app icon (clickable to go home)
- Calendar icon opens date picker
- Plus icon opens workout regimes
- Three-dot menu with: Settings, Analytics, Body Tracker, Workout DB, Export DB, Import DB
- Copy Previous Workout feature
- Delete workout functionality
- Date navigation bar with prev/next arrows
- Displays logged workouts for selected date (if any)
- Edit button on each logged workout
- Empty state with "Start New Workout" and "Copy Previous Workout" buttons (when no workouts)
- Auto-refreshes logged workouts when date changes

---

### ExerciseDatabase.tsx
**Location:** `src/components/ExerciseDatabase.tsx`

**Purpose:** Screen displaying all exercises in the database, categorized by muscle group with filtering capabilities.

**Props:**
- `onBack: () => void` - Return to home page
- `onCreateExercise: () => void` - Open exercise creation modal
- `refreshTrigger?: boolean` - Triggers refresh when modal closes

**State:**
- `exercises: ExerciseData[]` - List of all exercises
- `selectedCategory: string` - Currently selected category filter ('All' or specific muscle group)
- `categories: string[]` - Available categories for filter

**Key Methods:**
- `handleRefresh()`: Loads exercises from database (async)
- `useEffect`: Listens for window focus and custom events to refresh list

**Features:**
- Large "Create New Exercise" button at top
- Category filter dropdown (All, Abs, Back, Biceps, Cardio, Chest, Forearms, Legs, Neck, Shoulders, Triceps)
- Exercises displayed in grid layout grouped by category
- Each category shows exercise count
- Each exercise card shows: name, type, and notes (if available)
- Auto-refreshes when new exercises are added
- Responsive design for mobile and desktop

**Data Loading:**
- Uses `getAllExercises()` from `exerciseUtils.ts` (async)
- Uses `getAllCategories()` from `exerciseUtils.ts` (async)
- Automatically refreshes when ExerciseModal closes after saving

---

### CalendarModal.tsx
**Location:** `src/components/CalendarModal.tsx`

**Purpose:** Calendar date picker modal that opens when calendar icon is clicked.

**Props:**
- `isOpen: boolean` - Controls modal visibility
- `selectedDate: Date` - Currently selected date
- `onDateSelect: (date: Date) => void` - Callback when date is selected
- `onClose: () => void` - Callback to close modal

**Key Methods:**
- `handlePrevMonth()`: Navigate to previous month
- `handleNextMonth()`: Navigate to next month
- `handleDateClick(day: number)`: Selects a date and closes modal
- `isSelectedDate(day: number)`: Checks if day matches selected date
- `isToday(day: number)`: Checks if day is today

**Features:**
- Always opens to the month of the selected date
- Highlights today's date in vibrant orange
- Highlights selected date in blue
- Month/year navigation
- Click outside to close

---

### ExerciseModal.tsx
**Location:** `src/components/ExerciseModal.tsx`

**Purpose:** Modal for creating new custom exercises.

**Props:**
- `isOpen: boolean` - Controls modal visibility
- `onClose: () => void` - Callback to close modal
- `onSave: (exercise: ExerciseData) => void` - Callback when exercise is saved

**Form Fields:**
- **Name** (required): Text input for exercise name
- **Notes** (optional): Textarea for additional notes
- **Category** (required): Dropdown with options:
  - Abs, Back, Biceps, Cardio, Chest, Forearms, Legs, Neck, Shoulders, Triceps
- **Type** (required): Dropdown with options:
  - "Weight and Reps"
  - "Distance and Time"

**Key Methods:**
- `handleSubmit(e: React.FormEvent)`: Validates and saves exercise
- `handleClose()`: Resets form and closes modal

**Validation:**
- Name, Category, and Type are required
- Shows error messages for missing required fields

---

### BodyTracker.tsx
**Location:** `src/components/BodyTracker.tsx`

**Purpose:** Main component for body measurement tracking with three tabs.

**Props:**
- `onBack: () => void` - Callback to return to home page

**State:**
- `activeTab: 'measurement' | 'charts' | 'history'` - Currently active tab

**Tabs:**
1. **Measurement Tab**: Form to input body measurements
2. **Charts Tab**: Visual charts showing measurement trends
3. **History Tab**: List view of all measurements

**Features:**
- Tab navigation
- Back button to return home
- Responsive design

---

### MeasurementTab.tsx
**Location:** `src/components/BodyTracker/MeasurementTab.tsx`

**Purpose:** Form for entering body measurements.

**Body Metrics Tracked (18 total):**
- Neck, Shoulders, Left Biceps, Right Biceps, Chest
- Left Forearms, Right Forearms, Upper Abs, Lower Abs
- Waist, Hips, Left Thighs, Right Thighs, Left Calf, Right Calf
- Weight, Body Fat (%), Body Fat (Kg)

**Key Methods:**
- `getLatestValue(fieldKey)`: Gets the most recent value for a field (async)
- `handleInputChange(field, value)`: Updates form field value
- `handleSubmit(e: React.FormEvent)`: Saves measurement to database (async)
- `useEffect`: Loads latest values for all body parts on mount (async)

**Features:**
- Row-based layout (label + input on same row)
- Shows latest value below each label
- Latest value also shown as placeholder in input
- Only saves fields that have values
- Validates at least one measurement is entered
- Automatically refreshes latest values after saving

**Data Storage:**
- Uses `saveMeasurement()` from `bodyTrackerUtils.ts` (async)
- Uses `getMeasurementsByBodyPart()` from `bodyTrackerUtils.ts` (async)
- Stored in IndexedDB via Dexie (table: `bodyMeasurements`)

---

### ChartsTab.tsx
**Location:** `src/components/BodyTracker/ChartsTab.tsx`

**Purpose:** Visual charts showing body measurement trends over time.

**State:**
- `selectedBodyPart: BodyPart` - Currently selected body part for chart
- `selectedInterval: TimeInterval` - Time range filter ('1mo', '3mo', '6mo', '1yr', 'All')
- `measurements: BodyMeasurement[]` - Loaded measurements for selected body part

**Key Methods:**
- `renderChart()`: Generates SVG chart with data points
- `useEffect`: Loads measurements when body part changes (async)
- Uses `useMemo` to calculate chart data based on selected filters

**Data Loading:**
- Uses `getMeasurementsByBodyPart()` from `bodyTrackerUtils.ts` (async)

**Features:**
- Body part dropdown selector (styled as button)
- Time interval tabs: All, 1y, 6mo, 3mo, 1mo
- SVG-based line chart
- X-axis shows dates (formatted as "MMM DD")
- Y-axis shows measurement values
- Grid lines for readability
- Data points with hover tooltips
- Responsive chart dimensions (smaller on mobile)
- Empty state when no data available

**Chart Calculation:**
- Filters measurements by body part
- Filters by time interval
- Calculates min/max values for Y-axis scaling
- Calculates date range for X-axis scaling
- Plots points and connects with line

---

### HistoryTab.tsx
**Location:** `src/components/BodyTracker/HistoryTab.tsx`

**Purpose:** List view of all measurements for a selected body part.

**State:**
- `selectedBodyPart: BodyPart` - Currently selected body part
- `measurements: BodyMeasurement[]` - Loaded measurements for selected body part

**Key Methods:**
- `useEffect`: Loads measurements when body part changes (async)

**Features:**
- Body part dropdown selector
- List of all measurements sorted by date (newest first)
- Shows date and value for each measurement
- Empty state when no measurements exist
- Responsive table-like layout

**Data Loading:**
- Uses `getMeasurementsByBodyPart()` from `bodyTrackerUtils.ts` (async)

---

### WorkoutRegimes.tsx
**Location:** `src/components/WorkoutRegimes.tsx`

**Purpose:** Screen showing list of all workout regimes.

**Props:**
- `onBack: () => void` - Return to home page
- `onCreateNew: (regimeId: string | null) => void` - Open regime editor (null for new)
- `onEditRegime: (regimeId: string) => void` - Open regime editor in edit mode

**State:**
- `regimes: WorkoutRegime[]` - List of all regimes

**Key Methods:**
- `useEffect`: Loads regimes from database on mount (async)

**Features:**
- Large "Create New Workout Regime" button at top
- List of all regimes showing:
  - Regime name
  - Number of exercises
  - Last updated date
- Clickable regime items to edit
- Empty state when no regimes exist

**Data Loading:**
- Uses `getAllRegimes()` from `workoutRegimeUtils.ts` (async)
- Regimes sorted by updated date (newest first)

---

### RegimeEditor.tsx
**Location:** `src/components/RegimeEditor.tsx`

**Purpose:** Screen for creating or editing workout regimes.

**Props:**
- `regimeId: string | null` - null for new regime, string ID for editing
- `onBack: () => void` - Return to regimes list
- `onSave: () => void` - Callback after successful save

**State:**
- `regimeName: string` - Regime name
- `description: string` - Optional description
- `workouts: Workout[]` - List of workouts in regime
- `showWorkoutEditor: boolean` - Controls workout editor visibility
- `editingWorkout: Workout | null` - Workout being edited (null for new)
- `errors: { [key: string]: string }` - Form validation errors

**Key Methods:**
- `handleSave()`: Validates and saves regime (new or update) (async)
- `useEffect`: Loads existing regime data on mount (async)
- `handleCreateWorkout()`: Opens workout editor for new workout
- `handleEditWorkout(workout)`: Opens workout editor in edit mode
- `handleWorkoutSave(workout)`: Saves workout to regime
- `handleRemoveWorkout(workoutId)`: Removes workout from regime

**Form Fields:**
- **Regime Name** (required): Text input
- **Description** (optional): Textarea

**Workout Management:**
- "Create Workout" button to add new workouts
- List of workouts showing name and exercise count
- Edit button on each workout
- Remove button on each workout
- Clicking workout opens WorkoutEditor

**Features:**
- Pre-fills name and description when editing
- Pre-loads existing workouts when editing
- Validates regime name is required
- Saves to database using `saveRegime()` or `updateRegime()` (async)
- Integrates with WorkoutEditor component

**Data Loading:**
- Uses `getRegimeById()` from `workoutRegimeUtils.ts` (async)

---

### WorkoutEditor.tsx
**Location:** `src/components/WorkoutEditor.tsx`

**Purpose:** Screen for creating or editing workouts within a regime.

**Props:**
- `workout: Workout | null` - null for new workout, Workout for editing
- `onBack: () => void` - Return to regime editor
- `onSave: (workout: Workout) => void` - Callback with saved workout

**State:**
- `workoutName: string` - Workout name
- `exercises: RegimeExercise[]` - List of exercises in workout
- `availableExercises: ExerciseData[]` - All available exercises from bank
- `showExerciseSelector: boolean` - Controls exercise dropdown visibility
- `searchTerm: string` - Search filter for exercises
- `errors: { [key: string]: string }` - Form validation errors

**Key Methods:**
- `handleSave()`: Validates and saves workout
- `useEffect`: Loads available exercises and existing workout data on mount (async)
- `handleAddExercise(exerciseId)`: Adds selected exercise to workout
- `handleRemoveExercise(index: number)`: Removes exercise from workout
- `handleExerciseChange(index, field, value)`: Updates exercise parameter
- `getGroupedExercises()`: Groups exercises by category with search filtering

**Form Fields:**
- **Workout Name** (required): Text input

**Exercise Management:**
- **Enhanced Exercise Selector:**
  - Search input with real-time filtering
  - Exercises grouped by muscle type (category)
  - Category headers (Abs, Back, Biceps, etc.)
  - Click exercise to add directly
  - Cancel button to close selector
- For each exercise, shows fields:
  - **Sets**: Number input
  - **Reps**: Number input
  - Fields displayed in single row with even spacing
  - Mobile-optimized layout

**Features:**
- Pre-fills name when editing
- Pre-loads existing exercises when editing
- Validates workout name is required
- Mobile-responsive design
- Compact single-row layout for Sets and Reps
- Weight field removed (only Sets and Reps)

**Data Loading:**
- Uses `getAllExercises()` from `exerciseUtils.ts` (async)

---

### RegimeSelector.tsx
**Location:** `src/components/RegimeSelector.tsx`

**Purpose:** Screen for selecting a regime when starting a new workout.

**Props:**
- `onSelectRegime: (regime: WorkoutRegime) => void` - Callback when regime is selected
- `onBack: () => void` - Return to home page

**State:**
- `regimes: WorkoutRegime[]` - List of all regimes

**Key Methods:**
- `useEffect`: Loads all regimes from database on mount (async)

**Features:**
- Lists all available workout regimes
- Shows workout count for each regime
- Clickable regime items
- Empty state when no regimes exist
- Back button to return home

**Data Loading:**
- Uses `getAllRegimes()` from `workoutRegimeUtils.ts` (async)

---

### WorkoutSelector.tsx
**Location:** `src/components/WorkoutSelector.tsx`

**Purpose:** Screen for selecting a workout from a chosen regime.

**Props:**
- `regime: WorkoutRegime` - Selected regime
- `onSelectWorkout: (workout: Workout) => void` - Callback when workout is selected
- `onBack: () => void` - Return to regime selector

**State:**
- None (uses props)

**Features:**
- Lists all workouts in the selected regime
- Shows exercise count for each workout
- Clickable workout items
- Empty state when no workouts exist
- Back button to return to regime selector

---

### ActiveWorkout.tsx
**Location:** `src/components/ActiveWorkout.tsx`

**Purpose:** Screen for logging a workout session with exercises and sets.

**Props:**
- `regime: WorkoutRegime` - Selected regime
- `workout: Workout` - Selected workout
- `selectedDate: Date` - Date for the workout session
- `sessionId?: string | null` - ID of existing session for editing (optional)
- `onBack: () => void` - Return to workout selector
- `onComplete: () => void` - Callback after saving workout

**State:**
- `exercises: WorkoutSessionExercise[]` - Exercises with sets data
- `availableExercises: ExerciseData[]` - All available exercises
- `isSaving: boolean` - Saving state

**Key Methods:**
- `useEffect`: Loads exercises and previous values (or existing session data) (async)
- `handleSetChange(exerciseIndex, setIndex, field, value)`: Updates set data
- `handleToggleComplete(exerciseIndex, setIndex)`: Toggles set completion
- `handleSave()`: Saves or updates workout session (async)

**Features:**
- Displays all exercises from selected workout
- Pre-populates with previous workout values
- For "Weight and Reps" exercises: Shows Reps and Weight fields
- For "Distance and Time" exercises: Shows Distance and Time fields
- Completion toggle for each set
- **Dynamic Set Management**: Add and delete sets during workout
- **Dynamic Exercise Management**: Add and delete exercises during workout
- **Exercise Reordering**: Drag and drop to reorder exercises
- **Set Notes**: Icon button to add notes for each set (popup modal with visual indicator)
- **Exercise History**: Click exercise name to view complete workout history
- **Rest Timer**: Automatic countdown timer in header after completing sets
- Save button to persist workout session
- Edit mode: Loads existing session data when `sessionId` provided
- Create mode: Uses previous values as defaults

**Data Loading:**
- Uses `getAllExercises()` from `exerciseUtils.ts` (async)
- Uses `getPreviousExerciseValues()` from `workoutSessionUtils.ts` (async)
- Uses `getSessionById()` from `workoutSessionUtils.ts` (async, when editing)

---

### LoggedWorkouts.tsx
**Location:** `src/components/LoggedWorkouts.tsx`

**Purpose:** Component to display logged workouts for a selected date.

**Props:**
- `workouts: WorkoutSession[]` - Array of workout sessions to display
- `onEdit: (session: WorkoutSession) => void` - Callback when edit button clicked

**State:**
- None (uses props)

**Features:**
- Displays workout cards for each logged session
- Shows workout name and regime name
- Exercise summaries with completed sets
- Displays values (reps/weight or distance/time) for completed sets
- Edit button on each workout card
- Empty state handling (returns null if no workouts)
- Mobile-responsive design

**Display Format:**
- Workout name and regime name in header
- Exercise summaries showing:
  - Exercise name
  - Completed sets count (e.g., "3/4 sets")
  - Set details with values

---

## Data Management

### Database Configuration
**Location:** `src/db/database.ts`

**Technology:** Dexie (IndexedDB wrapper)

**Database Name:** `KratonDB`

**Tables:**
1. **exercises** - Stores exercise data
   - Primary key: `id` (auto-increment)
   - Indexes: `name`, `category`, `type`
2. **bodyMeasurements** - Stores body measurement data
   - Primary key: `id` (string)
   - Index: `date`
3. **workoutRegimes** - Stores workout regime data
   - Primary key: `id` (string)
   - Indexes: `createdAt`, `updatedAt`
4. **workoutSessions** - Stores workout session data (Version 3)
   - Primary key: `id` (string)
   - Indexes: `date`, `regimeId`, `workoutId`, `createdAt`

**Migration:**
- Automatic migration from localStorage to Dexie on first app load
- Migration utility: `src/db/migration.ts`
- Runs once and marks completion in localStorage
- Preserves all existing data

---

### Exercise Database
**Location:** `src/data/exercises.ts` (seed data) + Dexie `exercises` table

**Structure:**
- Pre-populated with 100+ exercises across 10 categories
- Each exercise has: name, category, type, notes
- Custom exercises added by users are persisted in database

**Categories:**
- Abs (10 exercises)
- Back (11 exercises)
- Biceps (8 exercises)
- Cardio (9 exercises)
- Chest (9 exercises)
- Forearms (6 exercises)
- Legs (15 exercises)
- Neck (4 exercises)
- Shoulders (9 exercises)
- Triceps (7 exercises)

**Storage:**
- Seed data in `exercises.ts` is loaded into Dexie on first use
- All exercises (including custom ones) stored in IndexedDB
- Can be exported/imported as JSON
- Persisted across browser sessions

**Operations (all async):**
- `getAllExercises()`: Retrieves all exercises from database
- `addExercise()`: Adds custom exercise to database
- `getExercisesByCategory()`: Filters by category
- `getExercisesByType()`: Filters by type
- `searchExercises()`: Searches by name
- `getAllCategories()`: Returns unique categories
- `getAllTypes()`: Returns unique types
- `getExerciseByName()`: Finds exercise by name
- `getExerciseCount()`: Returns total count
- `getExerciseCountByCategory()`: Returns count per category

---

### Body Measurements
**Storage:** Dexie `bodyMeasurements` table

**Structure:**
- Each measurement includes:
  - `id: string` - Unique identifier
  - `date: Date` - Measurement date
  - Optional fields for each of 18 body metrics

**Operations (all async):**
- `getAllMeasurements()`: Retrieves all measurements
- `saveMeasurement()`: Adds new measurement
- `getMeasurementsByBodyPart()`: Filters by body part
- `filterByTimeInterval()`: Filters by time range

---

### Workout Regimes
**Storage:** Dexie `workoutRegimes` table

**Structure:**
- Each regime includes:
  - `id: string` - Unique identifier
  - `name: string` - Regime name
  - `description?: string` - Optional description
  - `workouts: Workout[]` - List of workouts (NEW: changed from exercises)
  - `createdAt: Date` - Creation timestamp
  - `updatedAt: Date` - Last update timestamp

**Workout Structure:**
- Each workout includes:
  - `id: string` - Unique identifier
  - `name: string` - Workout name
  - `exercises: RegimeExercise[]` - List of exercises

**RegimeExercise Structure:**
- `exerciseId: string` - Reference to exercise
- `exerciseName: string` - Exercise name
- `sets: number` - Number of sets
- `reps?: number` - Reps (for Weight and Reps type)
- `weight?: number` - Weight in kg (removed from UI, kept in data)
- `distance?: number` - Distance (for Distance and Time type)
- `time?: number` - Time in minutes (for Distance and Time type)

**Operations (all async):**
- `getAllRegimes()`: Retrieves all regimes (with automatic migration from old structure)
- `saveRegime()`: Creates new regime
- `updateRegime()`: Updates existing regime
- `deleteRegime()`: Removes regime
- `getRegimeById()`: Gets specific regime (with automatic migration)

**Migration:**
- Automatic migration from old structure (exercises) to new structure (workouts)
- Old regimes with exercises are converted to a "Default Workout" containing those exercises

---

### Workout Sessions
**Storage:** Dexie `workoutSessions` table

**Structure:**
- Each session includes:
  - `id: string` - Unique identifier
  - `date: Date` - Workout date
  - `regimeId: string` - Reference to regime
  - `regimeName: string` - Regime name
  - `workoutId: string` - Reference to workout
  - `workoutName: string` - Workout name
  - `exercises: WorkoutSessionExercise[]` - Exercises with set data
  - `createdAt: Date` - Creation timestamp

**WorkoutSessionExercise Structure:**
- `exerciseId: string` - Reference to exercise
- `exerciseName: string` - Exercise name
- `exerciseType: 'Weight and Reps' | 'Distance and Time'` - Exercise type
- `sets: WorkoutSet[]` - Array of sets

**WorkoutSet Structure:**
- `setNumber: number` - Set number (1, 2, 3, etc.)
- `reps?: number` - Reps (for Weight and Reps type)
- `weight?: number` - Weight in kg (for Weight and Reps type)
- `distance?: number` - Distance (for Distance and Time type)
- `time?: number` - Time in minutes (for Distance and Time type)
- `completed: boolean` - Whether set was completed
- `notes?: string` - Optional notes for the set

**Operations (all async):**
- `getAllSessions()`: Retrieves all workout sessions
- `getSessionsByDate(date)`: Gets sessions for a specific date
- `getSessionsByWorkout(workoutId)`: Gets sessions for a specific workout
- `getLatestSessionForWorkout(workoutId)`: Gets most recent session for a workout
- `getPreviousExerciseValues(workoutId, exerciseId)`: Gets previous values for an exercise
- `getSessionById(sessionId)`: Gets specific session by ID
- `saveWorkoutSession(session)`: Creates new workout session
- `updateWorkoutSession(sessionId, session)`: Updates existing workout session
- `deleteWorkoutSession(sessionId)`: Removes workout session

---

## Utilities

**Important:** All utility functions are now **async** and use Dexie (IndexedDB) instead of localStorage.

### exerciseUtils.ts
**Location:** `src/utils/exerciseUtils.ts`

**Functions (all async):**
- `initializeExercises()`: Initializes database with seed data if empty
- `getAllExercises()`: Returns all exercises from database (Promise)
- `getExercisesByCategory(category: string)`: Filters by category (Promise)
- `getExercisesByType(type: string)`: Filters by type (Promise)
- `searchExercises(searchTerm: string)`: Searches by name (Promise)
- `getAllCategories()`: Returns unique categories (Promise)
- `getAllTypes()`: Returns unique types (Promise)
- `getExerciseByName(name: string)`: Finds exercise by name (Promise)
- `addExercise(exercise: ExerciseData)`: Adds custom exercise to database (Promise)
- `getExerciseCount()`: Returns total count (Promise)
- `getExerciseCountByCategory()`: Returns count per category (Promise)

**Note:** Exercises are now persisted in IndexedDB. Seed data from `exercises.ts` is automatically loaded on first use.

---

### bodyTrackerUtils.ts
**Location:** `src/utils/bodyTrackerUtils.ts`

**Functions (all async):**
- `getAllMeasurements()`: Retrieves all from database (Promise)
- `saveMeasurement(measurement)`: Saves new measurement to database (Promise)
- `getMeasurementsByBodyPart(bodyPart: BodyPart)`: Filters by body part (Promise)
- `getFieldNameForBodyPart(bodyPart: BodyPart)`: Maps body part to field name (synchronous helper)
- `getAllBodyParts()`: Returns all 18 body parts (synchronous helper)
- `filterByTimeInterval(measurements, interval)`: Filters by time range (synchronous helper)

**Time Intervals:**
- '1mo' - Last 1 month
- '3mo' - Last 3 months
- '6mo' - Last 6 months
- '1yr' - Last 1 year
- 'All' - All time

---

### workoutRegimeUtils.ts
**Location:** `src/utils/workoutRegimeUtils.ts`

**Functions (all async):**
- `getAllRegimes()`: Retrieves all from database with automatic migration (Promise)
- `saveRegime(regime)`: Creates new regime in database (Promise)
- `updateRegime(regimeId, regime)`: Updates existing regime in database (Promise)
- `deleteRegime(regimeId)`: Removes regime from database (Promise)
- `getRegimeById(regimeId)`: Gets specific regime from database with automatic migration (Promise)

**Migration Function:**
- `migrateRegimeStructure(regime)`: Automatically converts old structure (exercises) to new structure (workouts)
  - Creates a "Default Workout" containing old exercises
  - Runs automatically when loading regimes

---

### workoutSessionUtils.ts
**Location:** `src/utils/workoutSessionUtils.ts`

**Functions (all async):**
- `getAllSessions()`: Retrieves all workout sessions (Promise)
- `getSessionsByDate(date)`: Gets sessions for a specific date (Promise)
- `getSessionsByWorkout(workoutId)`: Gets sessions for a specific workout (Promise)
- `getLatestSessionForWorkout(workoutId)`: Gets most recent session for a workout (Promise)
- `getPreviousExerciseValues(workoutId, exerciseId)`: Gets previous values for an exercise (Promise)
- `getSessionById(sessionId)`: Gets specific session by ID (Promise)
- `saveWorkoutSession(session)`: Creates new workout session (Promise)
- `updateWorkoutSession(sessionId, session)`: Updates existing workout session (Promise)
- `deleteWorkoutSession(sessionId)`: Removes workout session (Promise)

---

### migration.ts
**Location:** `src/db/migration.ts`

**Purpose:** Handles one-time migration from localStorage to Dexie database

**Functions:**
- `migrateFromLocalStorage()`: Migrates body measurements and workout regimes from localStorage to Dexie (async)
  - Checks if migration already completed
  - Migrates `kraton-body-measurements` to `bodyMeasurements` table
  - Migrates `kraton-workout-Regimes` to `workoutRegimes` table
  - Marks migration as complete in localStorage
  - Only runs once per installation

---

## Type Definitions

### bodyTracker.ts
**Location:** `src/types/bodyTracker.ts`

**Interfaces:**
- `BodyMeasurement`: Measurement data structure with all 18 optional metrics
- `BodyPart`: Union type of all 18 body part names
- `TimeInterval`: Union type of time filter options

---

### workoutRegime.ts
**Location:** `src/types/workoutRegime.ts`

**Interfaces:**
- `WorkoutRegime`: Complete regime structure
  - `id: string` - Unique identifier
  - `name: string` - Regime name
  - `description?: string` - Optional description
  - `workouts: Workout[]` - List of workouts (changed from exercises)
  - `createdAt: Date` - Creation timestamp
  - `updatedAt: Date` - Last update timestamp
- `Workout`: Workout within a regime
  - `id: string` - Unique identifier
  - `name: string` - Workout name
  - `exercises: RegimeExercise[]` - List of exercises
- `RegimeExercise`: Exercise within a workout
  - `exerciseId: string` - Reference to exercise
  - `exerciseName: string` - Exercise name
  - `sets: number` - Number of sets
  - `reps?: number` - Reps (for Weight and Reps type)
  - `weight?: number` - Weight in kg (optional, not shown in UI)
  - `distance?: number` - Distance (for Distance and Time type)
  - `time?: number` - Time in minutes (for Distance and Time type)
  - `restTime?: number` - Rest time in seconds (optional, not displayed in UI)
  - `notes?: string` - Optional notes

---

### workoutSession.ts
**Location:** `src/types/workoutSession.ts`

**Interfaces:**
- `WorkoutSession`: Complete workout session structure
  - `id: string` - Unique identifier
  - `date: Date` - Workout date
  - `regimeId: string` - Reference to regime
  - `regimeName: string` - Regime name
  - `workoutId: string` - Reference to workout
  - `workoutName: string` - Workout name
  - `exercises: WorkoutSessionExercise[]` - Exercises with set data
  - `createdAt: Date` - Creation timestamp
- `WorkoutSessionExercise`: Exercise within a session
  - `exerciseId: string` - Reference to exercise
  - `exerciseName: string` - Exercise name
  - `exerciseType: 'Weight and Reps' | 'Distance and Time'` - Exercise type
  - `sets: WorkoutSet[]` - Array of sets
- `WorkoutSet`: Individual set data
  - `setNumber: number` - Set number
  - `reps?: number` - Reps (for Weight and Reps type)
  - `weight?: number` - Weight in kg (for Weight and Reps type)
  - `distance?: number` - Distance (for Distance and Time type)
  - `time?: number` - Time in minutes (for Distance and Time type)
  - `completed: boolean` - Whether set was completed

---

### ExerciseModal.tsx (ExerciseData)
**Location:** `src/components/ExerciseModal.tsx`

**Interface:**
- `ExerciseData`: Exercise structure with name, notes, category, type

---

## Key Functionality

### Navigation Flow

1. **Home Page (WorkoutLog)**
   - Click calendar icon → Opens CalendarModal
   - Click + icon → Opens WorkoutRegimes
   - Click three-dot menu → Shows dropdown
     - Workout DB → Opens ExerciseDatabase screen
     - Export DB → Downloads JSON file
     - Import DB → Opens file picker
     - Body Tracker → Opens BodyTracker
   - Click "Start New Workout" → Opens RegimeSelector
   - View logged workouts for selected date
   - Click edit button on workout → Opens ActiveWorkout in edit mode

2. **Start New Workout Flow**
   - Click "Start New Workout" → Opens RegimeSelector
   - Select regime → Opens WorkoutSelector
   - Select workout → Opens ActiveWorkout
   - Enter workout data → Click Save → Returns to home, refreshes logged workouts

3. **Workout Regimes Screen**
   - Click "Create New" → Opens RegimeEditor (regimeId = null)
   - Click regime item → Opens RegimeEditor (regimeId = regime.id)

4. **Regime Editor**
   - Fill name/description
   - Click "Create Workout" → Opens WorkoutEditor
   - Edit workouts (add/remove exercises)
   - Click Save → Returns to WorkoutRegimes list

5. **Workout Editor**
   - Fill workout name
   - Click "Add Exercise" → Opens enhanced exercise selector
   - Search and select exercises (grouped by muscle type)
   - Configure Sets and Reps for each exercise
   - Click Save → Returns to RegimeEditor

6. **Active Workout**
   - View all exercises from selected workout
   - Pre-populated with previous values
   - Enter sets, reps, weight (or distance/time)
   - Toggle completion for each set
   - Click Save → Saves workout session
   - Edit mode: Loads existing session data

7. **Body Tracker**
   - Three tabs: Measurement, Charts, History
   - Measurement: Enter body metrics
   - Charts: View trends with filters
   - History: View all measurements

### Data Flow

**Database Initialization:**
- On app startup, `App.tsx` runs `migrateFromLocalStorage()`
- If localStorage has data and Dexie is empty, data is migrated
- Migration runs once and is marked complete

**Exercises:**
- Seed data pre-populated in `exercises.ts`
- On first use, `initializeExercises()` loads seed data into Dexie
- Custom exercises added via `addExercise()` → Saved to Dexie `exercises` table
- All exercises persisted in IndexedDB
- Export: Retrieves all from database, converts to JSON and downloads
- Import: Parses JSON, validates, adds to database

**Body Measurements:**
- Stored in Dexie `bodyMeasurements` table
- Dates stored as Date objects (Dexie handles serialization)
- Sorted by date (newest first) when retrieved
- All operations are async

**Workout Regimes:**
- Stored in Dexie `workoutRegimes` table
- Dates stored as Date objects (Dexie handles serialization)
- Sorted by updatedAt (newest first) when retrieved
- Structure: Regime → Workouts → Exercises
- Automatic migration from old structure (exercises) to new structure (workouts)
- All operations are async

**Workout Sessions:**
- Stored in Dexie `workoutSessions` table
- Dates stored as Date objects (Dexie handles serialization)
- Indexed by date, regimeId, workoutId, createdAt
- Sorted by date (newest first) when retrieved
- All operations are async

### Styling Approach

**Modern Design System with CSS Variables**

The application uses a comprehensive design system built with CSS custom properties (variables) for consistency and maintainability.

#### Color Palette
- **Primary Gradient**: Vibrant purple/indigo gradient (#6366f1 → #8b5cf6) for primary actions and accents
- **Secondary**: Orange accent (#f97316) for highlights and special indicators
- **Success**: Green (#10b981) for completed states and positive actions
- **Danger**: Red (#ef4444) for delete actions and errors
- **Backgrounds**: Light gray (#f8fafc) for main background, white (#ffffff) for cards
- **Dark Headers**: Deep gradient (#0f172a → #1e293b) for headers and navigation
- **Text**: Dark gray (#1e293b) for primary text, lighter grays for secondary text

#### Design Tokens
- **Spacing Scale**: Consistent spacing from 4px (xs) to 64px (3xl)
- **Border Radius**: 6px (sm) to 16px (xl), with full rounded (9999px) for circular elements
- **Typography**: SF Pro Display system font stack with responsive font sizes
- **Shadows**: Layered shadow system (sm, md, lg, xl, 2xl) with colored variants for interactive elements
- **Transitions**: Smooth cubic-bezier animations (150ms, 200ms, 300ms)

#### Touch Optimization (iPhone 14 Plus)
- **Minimum Touch Targets**: 44px (Apple's recommended minimum)
- **Comfortable Touch Targets**: 48px for frequently used buttons
- **Responsive Breakpoints**: Optimized for 428x926 resolution (iPhone 14 Plus)
- **Safe Area Insets**: Support for notch and home indicator areas
- **Smooth Scrolling**: `-webkit-overflow-scrolling: touch` enabled for native iOS feel
- **Text Size Adjustment**: Prevents iOS auto-zoom on input focus

#### Modern UI Elements
- **Gradient Buttons**: Primary actions use vibrant gradients with colored shadows
- **Card Design**: Elevated cards with subtle shadows and hover effects
- **Modal Design**: Backdrop blur effects with smooth slide-up animations
- **Input Styling**: Modern inputs with focus rings and smooth transitions
- **Interactive Feedback**: Scale transforms and shadow changes on hover/active states
- **Border Images**: Gradient borders using CSS border-image for modern aesthetics

### Key Design Patterns

1. **Modal Pattern**: CalendarModal, ExerciseModal use overlay + modal structure
2. **Tab Pattern**: BodyTracker uses tab navigation
3. **List Pattern**: WorkoutRegimes, HistoryTab, ExerciseDatabase show clickable list items
4. **Form Pattern**: MeasurementTab, RegimeEditor use form inputs with validation
5. **State Management**: React useState for local state, Dexie (IndexedDB) for persistence
6. **Async Pattern**: All database operations are async and must be awaited

---

## Development

### Setup
```bash
npm install
npm run dev
```

### Build
```bash
npm run build
```

### Build for GitHub Pages
```bash
npm run build:gh-pages
```

### Deploy to GitHub Pages
```bash
npm run deploy
```

**Note:** Make sure you have `gh-pages` installed globally or as a dev dependency:
```bash
npm install --save-dev gh-pages
```

### Tech Stack
- React 18.2.0
- TypeScript 5.2.2
- Vite 5.0.0
- Dexie (IndexedDB wrapper) - Database persistence
- **Modern CSS3** with CSS Custom Properties (Design System)
  - No external UI libraries
  - Custom design tokens for colors, spacing, typography
  - Gradient-based color scheme
  - Touch-optimized for mobile devices
- PWA support with manifest.json and app icons

---

## File Summary

### Components (20 files)
1. **WorkoutLog.tsx** - Main home page with logged workouts display
2. **CalendarModal.tsx** - Date picker with workout indicators
3. **ExerciseModal.tsx** - Create exercise form
4. **ExerciseDatabase.tsx** - Exercise database list and filter screen
5. **BodyTracker.tsx** - Body tracking container
6. **MeasurementTab.tsx** - Measurement input form
7. **ChartsTab.tsx** - Measurement charts
8. **HistoryTab.tsx** - Measurement history
9. **WorkoutRegimes.tsx** - Regimes list
10. **RegimeEditor.tsx** - Regime create/edit form (manages workouts)
11. **WorkoutEditor.tsx** - Workout create/edit form (manages exercises)
12. **RegimeSelector.tsx** - Select regime for starting workout
13. **WorkoutSelector.tsx** - Select workout from regime
14. **ActiveWorkout.tsx** - Active workout session with exercises, sets, notes, and timer
15. **LoggedWorkouts.tsx** - Display logged workouts for a date (with edit/delete)
16. **SplashScreen.tsx** - App splash screen (first launch only)
17. **Analytics.tsx** - Analytics page container with tabs
18. **WorkoutsTab.tsx** - Workouts analytics tab
19. **BreakdownTab.tsx** - Breakdown analytics tab
20. **ExercisesTab.tsx** - Exercises analytics tab
21. **Settings.tsx** - Settings page (rest timer configuration)

### Database Files (2 files)
1. **database.ts** - Dexie database configuration and schema (Version 3 with workoutSessions)
2. **migration.ts** - localStorage to Dexie migration utility

### Data Files (1 file)
1. **exercises.ts** - Pre-populated exercise bank (seed data)

### Type Definitions (3 files)
1. **bodyTracker.ts** - Body measurement types
2. **workoutRegime.ts** - Workout regime types (updated with Workout interface)
3. **workoutSession.ts** - Workout session types

### Utilities (4 files)
1. **exerciseUtils.ts** - Exercise database operations (async)
2. **bodyTrackerUtils.ts** - Body measurement operations (async)
3. **workoutRegimeUtils.ts** - Workout regime operations (async, with migration)
4. **workoutSessionUtils.ts** - Workout session operations (async)

---

## Notes for AI/Developers

### Important Patterns
- **All data persistence uses Dexie (IndexedDB)** - No localStorage for data storage
- **All database operations are async** - Must use `await` or `.then()` when calling utility functions
- Dates are handled by Dexie automatically (stored as Date objects)
- Components use conditional rendering for navigation (no router)
- State management is local to components
- Migration from localStorage happens automatically on first load

### Async Operations
When working with database operations, remember:
- All utility functions return Promises
- Use `async/await` in component methods
- Use `useEffect` with async functions properly:
  ```typescript
  useEffect(() => {
    const loadData = async () => {
      const data = await getAllExercises();
      setExercises(data);
    };
    loadData();
  }, []);
  ```

### Extension Points
- Exercise database can be extended with more exercises (add to seed data or via UI)
- Body metrics can be added by extending `BodyMeasurement` interface and updating database schema
- Regime exercise parameters can be extended
- New menu options can be added to three-dot menu
- Database schema can be versioned in `database.ts` for future migrations

### Database Schema Updates
To update the database schema:
1. Increment version number in `database.ts`
2. Add new stores or indexes in the version definition
3. Dexie will automatically handle schema migration

### Recent Updates (2024)

#### Modern Design System Refactoring
- **Complete CSS Overhaul**: Refactored entire CSS codebase with modern design system
- **Design Tokens**: Implemented CSS custom properties for colors, spacing, typography, shadows, and transitions
- **Modern Color Scheme**: Vibrant purple/indigo gradient primary colors, orange accents, and modern grays
- **Touch Optimization**: All interactive elements optimized for iPhone 14 Plus (428x926) with 44px+ touch targets
- **Gradient Design**: Modern gradient buttons, headers, and borders throughout the application
- **Enhanced Animations**: Smooth transitions, hover effects, and active state feedback
- **Responsive Design**: Mobile-first approach with iPhone 14 Plus specific optimizations
- **Safe Area Support**: Proper handling of notch and home indicator areas
- **Consistent Styling**: Unified design language across all components with reusable utility classes

#### Workout Structure Refactoring
- **Changed from**: Regime → Exercises
- **Changed to**: Regime → Workouts → Exercises
- Added WorkoutEditor component for managing workouts
- Automatic migration from old structure to new structure
- WorkoutEditor optimized for mobile with single-row Sets/Reps layout

#### Enhanced Exercise Selector
- Added search functionality with real-time filtering
- Exercises grouped by muscle type (category) in dropdown
- Category headers (Abs, Back, Biceps, etc.)
- Click exercise to add directly
- Mobile-optimized design

#### Start New Workout Flow
- Complete workflow: RegimeSelector → WorkoutSelector → ActiveWorkout
- Pre-populates exercises with previous workout values
- Tracks sets, reps, weight (or distance/time)
- Save workout sessions by date
- Edit logged workouts anytime

#### Workout Session Tracking
- New workoutSessions database table
- Display logged workouts on home page by date
- Edit and delete functionality for logged workouts
- Historical data tracking for previous values
- One workout session per day restriction

#### Active Workout Enhancements
- **Dynamic Set Management**: Add and delete sets during workout
- **Dynamic Exercise Management**: Add and delete exercises during workout
- **Exercise Reordering**: Drag and drop to reorder exercises
- **Set Notes**: Icon button to add notes for each set (popup modal)
- **Exercise History**: Click exercise name to view complete history
- **Rest Timer**: Automatic countdown timer after completing sets
  - Configurable rest time in Settings
  - Runs in background even when app is minimized
  - Browser notifications when timer completes
  - Visual indicator in header

#### Calendar Enhancements
- Visual indicators (colored dots) for days with workout entries
- Copy Previous Workout feature (select date from calendar)
- Improved date normalization to prevent timezone issues

#### Home Page Improvements
- KRATON banner logo replaces text in header
- Copy Previous Workout button in empty state
- Delete workout functionality
- Improved alignment and styling for empty state
- Single workout styling enhancement

#### Analytics Page
- New Analytics page accessible from menu
- Three tabs: WORKOUTS, BREAKDOWN, EXERCISES
- Tab-based navigation similar to Body Tracker

#### Settings Page
- Rest time configuration (default: 60 seconds)
- Settings accessible from three-dot menu
- Persistent storage in localStorage

#### Splash Screen
- First-launch splash screen with app branding
- 5-second display duration
- One-time display (tracked in localStorage)
- Responsive design (80% screen coverage)
- Smooth fade animations

#### Database Export/Import
- **Full Database Export**: Exports all data types (exercises, body measurements, workout sessions, workout regimes)
- **Full Database Import**: Imports all data types from JSON file
- **Backward Compatible**: Still supports old exercise-only format
- **Data Validation**: Validates imported data before insertion
- **Confirmation Dialog**: Warns before replacing existing data

#### GitHub Pages Deployment
- Configured for GitHub Pages deployment
- Base path configuration for subdirectory hosting
- GitHub Actions workflow for automatic deployment
- Cross-platform build scripts (Windows PowerShell compatible)
- Deployment documentation

#### App Icon Integration
- KRATON banner logo in header (clickable to go home)
- Weight plate favicon
- PWA manifest.json for mobile app installation
- Apple touch icon support

#### Mobile Optimization
- WorkoutEditor redesigned for phone screens
- Single-row layout for Sets and Reps
- Compact exercise cards
- Responsive design throughout
- Mobile-optimized modals and popups

### Known Limitations
- No routing library (uses conditional rendering)
- No backend (all data in IndexedDB)
- No user authentication
- Migration from localStorage is one-way (localStorage data is not deleted after migration)
- Database operations require async handling throughout the codebase
- Weight field removed from WorkoutEditor UI (only Sets and Reps shown)
