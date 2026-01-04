export interface WorkoutSession {
    id: string;
    date: Date;
    regimeId: string;
    regimeName: string;
    workoutId: string;
    workoutName: string;
    exercises: WorkoutSessionExercise[];
    createdAt: Date;
  }
  
  export interface WorkoutSessionExercise {
    exerciseId: string;
    exerciseName: string;
    exerciseType: 'Weight and Reps' | 'Distance and Time';
    sets: WorkoutSet[];
  }
  
  export interface WorkoutSet {
    setNumber: number;
    reps?: number;
    weight?: number;
    distance?: number;
    time?: number;
    completed: boolean;
    notes?: string;
  }
  
  