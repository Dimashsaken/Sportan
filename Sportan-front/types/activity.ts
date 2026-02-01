export type ActivityType =
  | 'workout_completed'
  | 'workout_assigned'
  | 'assessment_completed'
  | 'athlete_joined'
  | 'streak_achieved';

export interface Activity {
  id: string;
  type: ActivityType;
  athleteName: string;
  athleteAvatar?: string;
  description: string;
  timestamp: string;
  metadata?: {
    workoutName?: string;
    streak?: number;
  };
}
