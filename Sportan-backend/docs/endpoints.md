## 0. Notes / Global Rules

* Auth: Supabase Auth → JWT with `role = coach | parent | athlete` and `user_id`.
* Permissions enforced by:

  * role from JWT
  * `coach_id` on resources
  * `parent.athlete_id`
  * `athlete.user_id`
* Athletes can be in **multiple groups** via `group_athletes` table.
* We **do not allow** athletes with 0 groups (no “floating” athletes) except during cascade delete.

Statuses for **assigned workouts**:

* `pending` → default
* `completed` → when **Coach** logs a workout with `assigned_workout_id`, OR explicitly updates status to completed.
* `skipped` → when day after `scheduled_date` passes and no workout was logged/completed
  (set by backend job, not by manual edits)

Cascade rules (your choices):

* Deleting a **group** deletes:

  * that group
  * its `group_athletes` memberships
  * any athletes that are **only** in that group (and their data)
  * UI must show a **strong warning**.
* Deleting a **workout** that has `assigned_workout_id` deletes the **assigned_workout** too.
* Deleting an **assigned_workout** deletes its linked workout log.

---

## 1. Coach API – `/coach/...`

### 1.1 Coach profile

**GET `/coach/me`**

* **Role:** coach
* **What:** Return current coach profile.
* **Notes:** Uses `user_id` from JWT.

---

### 1.2 Groups

**POST `/coach/groups`**

* **Role:** coach
* **What:** Create a new group (squad/class).
* **Body (example):** `{ "name": "U12 Football AM", "description": "Morning group" }`

**GET `/coach/groups`**

* **Role:** coach
* **What:** List all groups owned by this coach.

**GET `/coach/groups/{group_id}`**

* **Role:** coach
* **What:** Get group details (name, description, maybe counts).

**PUT `/coach/groups/{group_id}`**

* **Role:** coach
* **What:** Update group info (rename, change description).

**DELETE `/coach/groups/{group_id}`**

* **Role:** coach
* **What:** Delete this group.
* **Behavior:**

  * Deletes memberships in `group_athletes`.
  * Deletes athletes that are **only** in this group, and cascades to their workouts, assigned workouts, AI, parent, etc.
  * Athletes who belong to other groups remain.
  * UI must show a **strong warning**.

---

### 1.3 Group–Athlete membership

**GET `/coach/groups/{group_id}/athletes`**

* **Role:** coach
* **What:** List athletes in this group.

**POST `/coach/groups/{group_id}/athletes`**

* **Role:** coach
* **What:** Create a **new athlete** and add them to this group.
* **Notes:** Athlete is also linked to this coach (`coach_id`).

**POST `/coach/groups/{group_id}/athletes/{athlete_id}`**

* **Role:** coach
* **What:** Add an **existing** athlete to this group (multi-group case).
* **Notes:** Athlete must belong to the same coach.

**DELETE `/coach/groups/{group_id}/athletes/{athlete_id}`**

* **Role:** coach
* **What:** Remove athlete from this group.
* **Rule:**

  * If this is the **last group** for that athlete → **reject** the request (to avoid a floating athlete).
  * To fully remove athlete, coach should use `DELETE /coach/athletes/{athlete_id}` instead.

---

### 1.4 Athletes (coach view)

**GET `/coach/athletes/{athlete_id}`**

* **Role:** coach
* **What:** Full athlete profile (name, age, meta).
* **Check:** `athlete.coach_id == coach.id`.

**PUT `/coach/athletes/{athlete_id}`**

* **Role:** coach
* **What:** Update athlete information (name, DOB, notes).

**DELETE `/coach/athletes/{athlete_id}`**

* **Role:** coach
* **What:** Completely delete athlete.
* **Behavior:**

  * Remove from all groups (`group_athletes`).
  * Delete workouts, assigned workouts, AI reports.
  * Optionally delete linked parent record.

**GET `/coach/athletes/{athlete_id}/summary`**

* **Role:** coach
* **What:** Non-AI summary for this athlete.
* **Typical fields:**

  * total workouts
  * workouts this week / this month
  * number of assessments
  * maybe last few workouts
    (No attendance %, no “performance score”, no AI.)

**GET `/coach/athletes/{athlete_id}/workouts`**

* **Role:** coach
* **What:** Get all workouts for this athlete.

**GET `/coach/athletes/{athlete_id}/assigned-workouts`**

* **Role:** coach
* **What:** All assigned workouts for this athlete with status `pending/completed/skipped`.

---

### 1.5 Assigned Workouts (coach planning)

**POST `/coach/groups/{group_id}/assigned-workouts`**

* **Role:** coach
* **What:** Assign a workout to **all athletes in this group**.
* **Behavior:**

  * Backend creates an `assigned_workout` per athlete in that group.

**POST `/coach/athletes/{athlete_id}/assigned-workouts`**

* **Role:** coach
* **What:** Assign a workout to a **single** athlete.

**PATCH `/coach/assigned-workouts/{assigned_workout_id}`**

* **Role:** coach
* **What:** Manually update status (e.g., mark as `completed`).
* **Body:** `{ "status": "completed" }`
* **Notes:** Use this if the coach wants to mark it done without logging a full workout entry.

**GET `/coach/groups/{group_id}/assigned-workouts`** *(optional but nice)*

* **Role:** coach
* **What:** All assignments created for this group (for tracking what you’ve planned).

---

### 1.6 Parents (managed by coach)

**POST `/coach/parents`**

* **Role:** coach
* **What:** Create parent + link to an athlete.
* **Body (example):**

  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "athlete_id": "uuid"
  }
  ```
* **Behavior:**

  * Create parent record.
  * Create Supabase user with `role = parent`.

**GET `/coach/parents/{parent_id}`**

* **Role:** coach
* **What:** Parent info (name, email, which athlete they’re linked to).

**PUT `/coach/parents/{parent_id}`**

* **Role:** coach
* **What:** Update parent info (email, name, phone).

**DELETE `/coach/parents/{parent_id}`**

* **Role:** coach
* **What:** Remove parent / revoke access.

**GET `/coach/athletes/{athlete_id}/parent`**

* **Role:** coach
* **What:** Get parent linked to this athlete (if any).

---

### 1.7 AI (coach triggers & reads latest only)

**POST `/coach/athletes/{athlete_id}/ai/talent-recognition`**

* **Role:** coach
* **What:** Run the talent AI for this athlete.
* **Behavior:**

  * Run model.
  * Store or overwrite latest talent report.
  * Return the report.

**GET `/coach/athletes/{athlete_id}/ai/talent-recognition`**

* **Role:** coach
* **What:** Get the **latest** talent-recognition report.

**POST `/coach/athletes/{athlete_id}/ai/weekly-insights`**

* **Role:** coach
* **What:** Run weekly “how is training going” AI for this athlete.
* **Behavior:** store latest weekly report, return it.

**GET `/coach/athletes/{athlete_id}/ai/weekly-insights`**

* **Role:** coach
* **What:** Get the **latest** weekly AI insights for this athlete.

*(No history endpoints in v1.)*

---

## 2. Athlete API – `/athlete/...`

Athlete id resolved from JWT (`role = athlete`).

**GET `/athlete/me`**

* **Role:** athlete
* **What:** Athlete sees their own profile.

**GET `/athlete/me/workouts`**

* **Role:** athlete
* **What:** All workouts belonging to this athlete (read-only).

**GET `/athlete/me/assigned-workouts`**

* **Role:** athlete
* **What:** All assigned workouts for this athlete (pending/completed/skipped).

  * This is what they see as their schedule.

*(No `/athlete/me/summary`, no `/athlete/me/ai/*`.)*
*(No write access.)*

---

## 3. Parent API – `/parent/...`

Parent’s child (`athlete_id`) is resolved from parent record.

**GET `/parent/me`**

* **Role:** parent
* **What:** Parent profile + linked `athlete_id`.

**GET `/parent/athlete`**

* **Role:** parent
* **What:** Get their child’s athlete profile.

**GET `/parent/athlete/summary`**

* **Role:** parent
* **What:** Non-AI summary for their child (same data source as coach summary, but can be simplified in response).

**GET `/parent/athlete/workouts`**

* **Role:** parent
* **What:** All workouts of their child.

**GET `/parent/athlete/assigned-workouts`**

* **Role:** parent
* **What:** All assigned workouts for their child (so parent sees what was planned vs done).

**GET `/parent/athlete/ai/talent-recognition`**

* **Role:** parent
* **What:** Latest talent recognition AI report for their child.

**GET `/parent/athlete/ai/weekly-insights`**

* **Role:** parent
* **What:** Latest weekly AI training insights for their child.

---

## 4. Workouts API (Coach Only) – `/workouts/...`

These endpoints are for logging actual training data. Only the Coach can create/edit/delete.

**POST `/workouts`**

* **Roles:** coach
* **What:** Create a workout log.
* **Body:** Must include `athlete_id` (and it must be one of their athletes).
* **Behavior:**
  * Logs the workout data.
  * Optional field `assigned_workout_id`:
    * If present, system links the workout to that assignment.
    * System sets `assigned_workout.status = completed`.

---

**GET `/workouts/{workout_id}`**

* **Roles:** coach / athlete / parent
* **What:** Get full detail of one workout.
* **Access rules:**

  * Athlete only if it’s theirs.
  * Coach only if athlete belongs to them.
  * Parent only if it’s their child.

---

**PUT `/workouts/{workout_id}`**

* **Roles:** coach
* **What:** Edit workout data (type, metrics, notes).

---

**DELETE `/workouts/{workout_id}`**

* **Roles:** coach
* **What:** Delete a workout log.
* **Behavior:**

  * If workout has `assigned_workout_id`, also delete that assigned_workout (your “cascade” rule) OR revert status to pending (depending on desired logic - typically delete implies it didn't happen).
