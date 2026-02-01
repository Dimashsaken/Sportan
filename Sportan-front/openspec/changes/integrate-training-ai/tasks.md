## 1. Training Module Integration
- [x] 1.1 Update `data/mockData.ts` with `assignWorkout` and `fetchAssignedWorkouts` functions using `api`.
- [x] 1.2 Update `data/mockData.ts` with `logWorkout` function.
- [x] 1.3 Refactor `app/coach/assign-workout.tsx` to use `assignWorkout`.
- [x] 1.4 Refactor `app/coach/athletes/[id].tsx` to display real assigned workouts (`fetchAssignedWorkouts`).
- [x] 1.5 Implement "Mark Complete" logic in `WorkoutDetailModal` using `logWorkout` or `PATCH /assigned-workouts`.

## 2. AI Module Integration
- [x] 2.1 Update `data/mockData.ts` with `generateTalentReport` and `fetchTalentReport`.
- [x] 2.2 Refactor `app/coach/talent-report/[athleteId].tsx` to fetch real report data.
- [x] 2.3 Implement specific error handling for AI timeouts (Toast notification).

## 3. Dashboard Cleanup
- [x] 3.1 Update `fetchDashboardData` to aggregate real "Recent Activity" from workout logs.
- [x] 3.2 Verify all "Mock" comments are removed from `data/mockData.ts`.

## 4. Verification
- [ ] 4.1 Verify creating a workout assignment appears on the athlete's profile.
- [ ] 4.2 Verify running an AI report returns real Gemini data.
