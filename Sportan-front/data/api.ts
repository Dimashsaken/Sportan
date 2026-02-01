import { api } from '@/lib/api';
import type { Activity } from '@/types/activity';

// Interfaces
export interface Athlete {
  id: string;
  name: string;
  avatar?: string;
  groupId: string;
  groupName: string;
  email?: string;
  phone?: string;
  age?: number;
  height?: string;
  weight?: string;
  sport?: string;
  position?: string;
  joinedDate?: string;
  completionRate: number;
  workoutsThisWeek: number;
  workoutsThisMonth: number;
  currentStreak: number;
  missedWorkouts: number;
  totalWorkouts: number;
  personalBests?: {
    sprint100m?: string;
    sprint200m?: string;
    verticalJump?: string;
    benchPress?: string;
    squat?: string;
  };
  recentWorkouts?: WorkoutSession[];
}

export interface WorkoutSession {
  id: string;
  name: string;
  date: string;
  duration: string;
  status: 'completed' | 'pending' | 'missed';
  exercises?: Exercise[];
}

export interface Exercise {
  id: string;
  name: string;
  sets?: number;
  reps?: number;
  weight?: string;
  notes?: string;
}

export interface Group {
  id: string;
  name: string;
  athleteCount: number;
  avgCompletion: number;
  pendingWorkouts: number;
  color: string;
  sport?: string;
  ageCategory?: string;
  trainingLevel?: string;
  description?: string;
}

export interface PendingWorkout {
  id: string;
  groupName: string;
  groupId: string;
  pending: number;
  total: number;
}

export interface CoachDashboardMetrics {
  totalAthletes: number;
  workoutsThisWeek: number;
  completionRate: number;
  assessmentsThisMonth: number;
}

// Student invitation interface
export interface StudentInvitation {
  name: string;
  email: string;
  groupId?: string;
}

// Create group interface
export interface CreateGroupData {
  name: string;
  sport: string;
  ageCategory: string;
  trainingLevel?: string;
  description?: string;
}

// Exercise Library (Static for now)
export type ExerciseCategory = 'strength' | 'cardio' | 'plyometrics' | 'mobility' | 'core' | 'speed';

export interface ExerciseTemplate {
  id: string;
  name: string;
  category: ExerciseCategory;
  defaultSets: number;
  defaultReps: string;
  description?: string;
}

export const exerciseCategories: { key: ExerciseCategory; label: string; icon: string }[] = [
  { key: 'strength', label: 'Strength', icon: 'barbell-outline' },
  { key: 'cardio', label: 'Cardio', icon: 'heart-outline' },
  { key: 'plyometrics', label: 'Plyometrics', icon: 'flash-outline' },
  { key: 'speed', label: 'Speed', icon: 'speedometer-outline' },
  { key: 'core', label: 'Core', icon: 'body-outline' },
  { key: 'mobility', label: 'Mobility', icon: 'fitness-outline' },
];

export const exerciseLibrary: ExerciseTemplate[] = [
  { id: 'ex1', name: 'Barbell Squat', category: 'strength', defaultSets: 4, defaultReps: '8-10', description: 'Back squat with barbell' },
  { id: 'ex2', name: 'Deadlift', category: 'strength', defaultSets: 4, defaultReps: '6-8', description: 'Conventional deadlift' },
  { id: 'ex3', name: 'Bench Press', category: 'strength', defaultSets: 4, defaultReps: '8-10', description: 'Flat barbell bench press' },
  { id: 'ex4', name: 'Overhead Press', category: 'strength', defaultSets: 3, defaultReps: '8-10', description: 'Standing barbell overhead press' },
  { id: 'ex5', name: 'Barbell Row', category: 'strength', defaultSets: 4, defaultReps: '8-10', description: 'Bent-over barbell row' },
  { id: 'ex6', name: 'Pull-ups', category: 'strength', defaultSets: 3, defaultReps: '8-12', description: 'Bodyweight pull-ups' },
  { id: 'ex7', name: 'Lunges', category: 'strength', defaultSets: 3, defaultReps: '10 each', description: 'Walking or stationary lunges' },
  { id: 'ex8', name: 'Romanian Deadlift', category: 'strength', defaultSets: 3, defaultReps: '10-12', description: 'RDL for hamstrings' },
  { id: 'ex9', name: 'Treadmill Run', category: 'cardio', defaultSets: 1, defaultReps: '20 min', description: 'Steady state running' },
  { id: 'ex10', name: 'Bike Intervals', category: 'cardio', defaultSets: 8, defaultReps: '30s on/30s off', description: 'High intensity bike intervals' },
  { id: 'ex11', name: 'Rowing Machine', category: 'cardio', defaultSets: 1, defaultReps: '2000m', description: 'Rowing for distance' },
  { id: 'ex12', name: 'Jump Rope', category: 'cardio', defaultSets: 3, defaultReps: '2 min', description: 'Continuous jump rope' },
  { id: 'ex13', name: 'Battle Ropes', category: 'cardio', defaultSets: 4, defaultReps: '30s', description: 'Alternating waves' },
  { id: 'ex14', name: 'Box Jumps', category: 'plyometrics', defaultSets: 4, defaultReps: '8', description: 'Jump onto box, step down' },
  { id: 'ex15', name: 'Broad Jumps', category: 'plyometrics', defaultSets: 4, defaultReps: '6', description: 'Standing long jump' },
  { id: 'ex16', name: 'Depth Jumps', category: 'plyometrics', defaultSets: 3, defaultReps: '6', description: 'Step off box, jump immediately' },
  { id: 'ex17', name: 'Bounding', category: 'plyometrics', defaultSets: 4, defaultReps: '20m', description: 'Alternating single-leg bounds' },
  { id: 'ex18', name: 'Hurdle Hops', category: 'plyometrics', defaultSets: 4, defaultReps: '5 hurdles', description: 'Continuous hurdle jumps' },
  { id: 'ex19', name: 'Sprint Intervals', category: 'speed', defaultSets: 6, defaultReps: '100m', description: '100m sprints at 90%' },
  { id: 'ex20', name: 'Acceleration Drills', category: 'speed', defaultSets: 6, defaultReps: '30m', description: '30m acceleration sprints' },
  { id: 'ex21', name: 'Flying Sprints', category: 'speed', defaultSets: 4, defaultReps: '40m', description: 'Build up then max speed' },
  { id: 'ex22', name: 'Ladder Drills', category: 'speed', defaultSets: 4, defaultReps: '2 patterns', description: 'Agility ladder footwork' },
  { id: 'ex23', name: 'Cone Drills', category: 'speed', defaultSets: 4, defaultReps: '4 reps', description: 'Change of direction work' },
  { id: 'ex24', name: 'Plank Hold', category: 'core', defaultSets: 3, defaultReps: '45s', description: 'Front plank position' },
  { id: 'ex25', name: 'Dead Bug', category: 'core', defaultSets: 3, defaultReps: '10 each', description: 'Alternating arm/leg extension' },
  { id: 'ex26', name: 'Russian Twists', category: 'core', defaultSets: 3, defaultReps: '20', description: 'Seated rotation with weight' },
  { id: 'ex27', name: 'Hanging Leg Raises', category: 'core', defaultSets: 3, defaultReps: '12', description: 'Legs to parallel or higher' },
  { id: 'ex28', name: 'Ab Wheel Rollouts', category: 'core', defaultSets: 3, defaultReps: '10', description: 'Kneeling ab wheel rollout' },
  { id: 'ex29', name: 'Hip Circles', category: 'mobility', defaultSets: 2, defaultReps: '10 each', description: 'Standing hip rotations' },
  { id: 'ex30', name: 'World\'s Greatest Stretch', category: 'mobility', defaultSets: 2, defaultReps: '5 each', description: 'Lunge with rotation' },
  { id: 'ex31', name: 'Leg Swings', category: 'mobility', defaultSets: 2, defaultReps: '10 each', description: 'Front/back and lateral swings' },
  { id: 'ex32', name: 'Cat-Cow Stretch', category: 'mobility', defaultSets: 2, defaultReps: '10', description: 'Spinal flexion/extension' },
  { id: 'ex33', name: 'Foam Rolling', category: 'mobility', defaultSets: 1, defaultReps: '5 min', description: 'Full body foam roll' },
  { id: 'ex34', name: 'Dynamic Warm-up', category: 'mobility', defaultSets: 1, defaultReps: '10 min', description: 'Full dynamic warm-up routine' },
];

export const getExercisesByCategory = (category: ExerciseCategory): ExerciseTemplate[] => {
  return exerciseLibrary.filter(ex => ex.category === category);
};

export const searchExercises = (query: string): ExerciseTemplate[] => {
  const lowerQuery = query.toLowerCase();
  return exerciseLibrary.filter(ex => 
    ex.name.toLowerCase().includes(lowerQuery) ||
    ex.category.toLowerCase().includes(lowerQuery) ||
    ex.description?.toLowerCase().includes(lowerQuery)
  );
};

// API Functions

// Backend DTOs
interface BackendGroup {
  id: string;
  name: string;
  description?: string;
  member_count?: number;
  sport?: string;
  age_category?: string;
  training_level?: string;
}

interface BackendAthlete {
  id: string;
  name: string;
  email: string;
  phone?: string;
  group_id?: string;
  created_at?: string;
}

// Helper to map backend group to frontend Group
const mapGroup = (g: BackendGroup): Group => ({
  id: g.id,
  name: g.name,
  athleteCount: g.member_count || 0,
  avgCompletion: 0, // Placeholder
  pendingWorkouts: 0, // Placeholder
  color: '#6366f1', // Default color
  sport: g.sport || 'General',
  ageCategory: g.age_category || '',
  trainingLevel: g.training_level || '',
  description: g.description,
});

// Helper to map backend athlete to frontend Athlete
const mapAthlete = (a: BackendAthlete, groupName: string = ''): Athlete => ({
  id: a.id,
  name: a.name || 'Unknown',
  groupId: a.group_id || '',
  groupName: groupName,
  email: a.email,
  phone: a.phone,
  completionRate: 0, // Placeholder
  workoutsThisWeek: 0, // Placeholder
  workoutsThisMonth: 0, // Placeholder
  currentStreak: 0, // Placeholder
  missedWorkouts: 0, // Placeholder
  totalWorkouts: 0, // Placeholder
  joinedDate: a.created_at,
});

export const fetchGroups = async (): Promise<Group[]> => {
  try {
    const { data } = await api.get('/coach/groups');
    return data.map(mapGroup);
  } catch (error) {
    console.error('Fetch groups error:', error);
    return [];
  }
};

export const fetchGroupById = async (groupId: string): Promise<Group | undefined> => {
  try {
    const { data } = await api.get(`/coach/groups/${groupId}`);
    return mapGroup(data);
  } catch (error) {
    console.error('Fetch group error:', error);
    return undefined;
  }
};

export const fetchAthletesByGroup = async (groupId: string, groupName?: string): Promise<Athlete[]> => {
  try {
    const { data } = await api.get(`/coach/groups/${groupId}/athletes`);
    
    let resolvedGroupName = groupName;
    if (!resolvedGroupName) {
      const group = await fetchGroupById(groupId);
      resolvedGroupName = group?.name;
    }

    return data.map((a: any) => mapAthlete(a, resolvedGroupName));
  } catch (error) {
    console.error('Fetch athletes error:', error);
    return [];
  }
};

export const fetchAthleteById = async (athleteId: string): Promise<Athlete | undefined> => {
  try {
    const { data } = await api.get(`/coach/athletes/${athleteId}`);
    // We might need to fetch group name separately if not in response
    return mapAthlete(data);
  } catch (error) {
    console.error('Fetch athlete error:', error);
    return undefined;
  }
};

export const fetchAllAthletes = async (): Promise<Athlete[]> => {
  try {
    const groups = await fetchGroups();
    const allAthletes: Athlete[] = [];
    
    // Parallel fetch for MVP
    await Promise.all(groups.map(async (group) => {
      const athletes = await fetchAthletesByGroup(group.id, group.name);
      allAthletes.push(...athletes);
    }));
    
    return allAthletes;
  } catch (error) {
    console.error('Fetch all athletes error:', error);
    return [];
  }
};

export const createGroup = async (data: CreateGroupData): Promise<Group> => {
  try {
    const { data: newGroup } = await api.post('/coach/groups', {
      name: data.name,
      description: `${data.sport} - ${data.ageCategory}`, // Mapping to description for now
    });
    return mapGroup(newGroup);
  } catch (error) {
    console.error('Create group error:', error);
    throw error;
  }
};

export const inviteStudent = async (data: StudentInvitation): Promise<{ success: boolean; message: string }> => {
  if (!data.groupId) {
    throw new Error('Group ID is required for invitation');
  }
  
  try {
    // Backend spec: POST /coach/groups/{group_id}/athletes creates a new athlete
    // It implies creating the record. Real "invite" logic might be different.
    await api.post(`/coach/groups/${data.groupId}/athletes`, {
      name: data.name,
      email: data.email,
    });
    
    return {
      success: true,
      message: `Invitation sent to ${data.email}.`,
    };
  } catch (error) {
    console.error('Invite student error:', error);
    throw error;
  }
};

// Assign Workout Data Interface
export interface AssignWorkoutData {
  title: string;
  description: string;
  date: Date;
  schedule: {
    days: string[];
    durationWeeks: number;
  };
  assignTo: string;
  assignType: 'individual' | 'group';
  exercises: Exercise[];
}

export const assignWorkout = async (data: AssignWorkoutData): Promise<void> => {
  const payload = {
    title: data.title,
    description: data.description,
    scheduled_date: data.date.toISOString().split('T')[0], // Backend expects YYYY-MM-DD
    schedule: {
      days: data.schedule.days,
      duration_weeks: data.schedule.durationWeeks,
    },
    exercises: data.exercises,
  };

  if (data.assignType === 'group') {
    await api.post(`/coach/groups/${data.assignTo}/assigned-workouts`, payload);
  } else {
    await api.post(`/coach/athletes/${data.assignTo}/assigned-workouts`, payload);
  }
};

export const fetchAssignedWorkouts = async (athleteId: string): Promise<WorkoutSession[]> => {
  try {
    const { data } = await api.get(`/coach/athletes/${athleteId}/assigned-workouts`);
    
    // Map backend response to WorkoutSession
    return data.map((item: any) => ({
      id: item.id,
      name: item.title,
      date: item.scheduled_date,
      duration: '45 min', // Placeholder or calculate from exercises
      status: item.status, // 'pending' | 'completed' | 'skipped'
      exercises: [], // Backend might not return full details in list view
    }));
  } catch (error) {
    console.error('Fetch assigned workouts error:', error);
    return [];
  }
};

export const fetchWorkouts = async (athleteId: string): Promise<WorkoutSession[]> => {
  try {
    const { data } = await api.get(`/coach/athletes/${athleteId}/workouts`);
    return data.map((item: any) => ({
      id: item.id,
      name: item.title,
      date: item.date?.split?.('T')[0] || '', // ISO to YYYY-MM-DD
      duration: item.metrics?.duration || '0 min',
      status: item.status || 'completed',
      exercises: item.exercises || [],
    }));
  } catch (error) {
    console.error(`Fetch workouts error for athleteId=${athleteId}:`, error);
    return [];
  }
};

export const logWorkout = async (
  athleteId: string, 
  workoutData: { 
    title: string; 
    date: Date; 
    duration: string; 
    assignedWorkoutId?: string;
    exercises: Exercise[] 
  }
): Promise<void> => {
  const payload = {
    athlete_id: athleteId,
    assigned_workout_id: workoutData.assignedWorkoutId,
    title: workoutData.title,
    date: workoutData.date.toISOString(),
    metrics: { duration: workoutData.duration },
    exercises: workoutData.exercises,
  };
  
  await api.post('/workouts', payload);
};

// AI Module Interfaces
export interface TalentReport {
  id: string;
  athleteId: string;
  reportText: string;
  createdAt: string;
}

export const fetchTalentReport = async (athleteId: string): Promise<TalentReport | null> => {
  try {
    const { data } = await api.get(`/coach/athletes/${athleteId}/ai/talent-recognition`);
    return {
      id: data.id,
      athleteId: data.athlete_id,
      reportText: data.report_text,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error('Fetch talent report error:', error);
    return null;
  }
};

export const generateTalentReport = async (athleteId: string): Promise<TalentReport> => {
  try {
    const { data } = await api.post(`/coach/athletes/${athleteId}/ai/talent-recognition`);
    return {
      id: data.id,
      athleteId: data.athlete_id,
      reportText: data.report_text,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error('Generate talent report error:', error);
    throw error;
  }
};

export const fetchDashboardData = async () => {
  try {
    const groups = await fetchGroups();
    const athletes = await fetchAllAthletes();
    
    // Aggregate workouts for all athletes (Inefficient but MVP compliant)
    // TODO: Replace with a backend 'recent activity' endpoint to avoid N+1 fetches
    const allWorkouts: (WorkoutSession & { athleteName: string; athleteAvatar?: string })[] = [];
    
    await Promise.all(athletes.map(async (athlete) => {
      const workouts = await fetchWorkouts(athlete.id);
      workouts.forEach(w => {
        allWorkouts.push({
          ...w,
          athleteName: athlete.name,
          athleteAvatar: athlete.avatar,
        });
      });
    }));

    // Sort by date descending
    allWorkouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const recentActivity: Activity[] = allWorkouts.slice(0, 10).map(w => ({
      id: w.id,
      type: 'workout_completed',
      athleteName: w.athleteName,
      athleteAvatar: w.athleteAvatar,
      description: `completed ${w.name}`,
      timestamp: w.date,
    }));

    // Calculate metrics
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const workoutsThisWeek = allWorkouts.filter(w => new Date(w.date) >= startOfWeek).length;

    const metrics: CoachDashboardMetrics = {
      totalAthletes: athletes.length,
      workoutsThisWeek,
      completionRate: 85, // TODO: replace with assigned vs completed ratio once backend provides data
      assessmentsThisMonth: 0, // Placeholder
    };

    return {
      metrics,
      pendingWorkouts: [], // Placeholder
      atRiskAthletes: [], // Placeholder
      topPerformers: [], // Placeholder
      groups,
      recentActivity,
    };
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    throw error;
  }
};



