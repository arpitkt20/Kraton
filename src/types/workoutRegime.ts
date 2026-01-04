export interface WorkoutRegime {
    id: string;
    name: string;
    description?: string;
    workouts: Workout[];
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Workout {
    id: string;
    name: string;
    exercises: RegimeExercise[];
  }
  
  export interface RegimeExercise {
    exerciseId: string;
    exerciseName: string;
    sets: number;
    reps?: number;
    weight?: number;
    distance?: number;
    time?: number;
    restTime?: number; // in seconds
    notes?: string;
  }
  
  