## What `SPECIFIC_DAYS` means

**Specific days** means: use the treatment only on selected weekdays, with one or more daily uses on each selected day.

It answers:

> “Which days of the week should this treatment be used, and how should it be used on each selected day?”

It is a recurring weekly pattern, not a list of specific calendar dates.

For example:

```text
Monday, Wednesday, Friday
```

means the treatment is used on every Monday, Wednesday, and Friday while the routine is active.

### Example: once on Monday, Wednesday, and Friday

UI fields:

| Field | Value |
|---|---|
| Routine type | `Specific days` |
| Number of daily uses | `1` |
| Time of day | `Evening` |
| Meal timing | `No Preference` |
| Dosage | `Apply a thin layer` |
| Days | `Monday`, `Wednesday`, `Friday` |
| Repeat every | `1 Week` |
| How to apply / use? | `Scalp` |
| Duration | `3 Month(s)` |

Meaning:

> Apply a thin layer to the scalp every Monday, Wednesday, and Friday evening for 3 months.

The resulting routine is:

```json
{
  "type": "SPECIFIC_DAYS",
  "timesPerDay": 1,
  "days": [
    "MONDAY",
    "WEDNESDAY",
    "FRIDAY"
  ],
  "repeatCycle": {
    "interval": 1,
    "unit": "WEEK"
  },
  "slots": [
    {
      "timeOfDay": "EVENING",
      "mealRelation": "NONE",
      "dosage": "Apply a thin layer"
    }
  ],
  "routeOrArea": "Scalp",
  "duration": {
    "value": 3,
    "unit": "MONTH"
  }
}
```
## How to fill the Specific days UI

### 1. Select the routine type

Choose:

```text
Specific days
```

Use this when the treatment happens only on selected recurring weekdays.

### 2. Enter Number of daily uses

This is required and must be a whole number from 1 to 24.

The number means:

> How many times should the treatment be used on each selected day?

For example:

```text
Number of daily uses: 2
Days: Monday, Wednesday, Friday
```

means two uses on Monday, two uses on Wednesday, and two uses on Friday.

It does **not** mean two uses across the entire week.

The form creates exactly the number of Daily uses entered. If the number changes, the form adds or removes Daily use entries automatically.

### 3. Complete each Daily use

Each Daily use has three fields:

#### Time of day

Choose the general period when the treatment should be used:

- Morning
- Midday
- Afternoon
- Evening
- Night
- Any time

These values describe a general part of the day, not an exact clock time.

#### Meal timing

Choose the relationship between the treatment and a meal:

- No Preference
- Before Meal
- With Meal
- After Meal

`No Preference` means that no particular meal timing is specified.

#### Dosage

Enter the dosage or application instruction for that specific Daily use.

Examples:

```text
1 tablet
2 tablets
Apply a thin layer
1 pump
Use once
```

### 4. Select the days

Choose one or more weekdays:

- Monday
- Tuesday
- Wednesday
- Thursday
- Friday
- Saturday
- Sunday

At least one day must be selected.

### 5. Configure the repeat cycle

The repeat cycle is optional.

If enabled, it controls how often the selected weekday pattern repeats.

Example:

```text
Days: Monday, Wednesday, Friday
Repeat every: 1 Week
```

Meaning:

> Use the treatment every Monday, Wednesday, and Friday.

Another example:

```text
Days: Monday, Wednesday, Friday
Repeat every: 2 Weeks
```

Meaning:

> Use the Monday/Wednesday/Friday pattern every second week.

### 6. Complete How to apply / use?

Use this field for the route, method, or treatment area.

Examples:

```text
Scalp
Oral
Apply to affected area
Face and neck
Use as a topical application
```

### 7. Complete Duration

Duration is optional. If used, enter the amount and select its unit.

Example:

```text
Duration: 3
Duration unit: Month(s)
```

## Common use cases

### 1. Once on selected weekdays

```text
Routine type: Specific days
Number of daily uses: 1
Days: Monday, Wednesday, Friday

Daily use 1:
Time of day: Evening
Meal timing: No Preference
Dosage: Apply a thin layer

Repeat every: 1 Week
How to apply / use?: Scalp
Duration: 3 Month(s)
```

Meaning:

> Apply a thin layer to the scalp every Monday, Wednesday, and Friday evening for 3 months.

### 2. Two uses on each selected day

```text
Routine type: Specific days
Number of daily uses: 2
Days: Tuesday and Saturday
```

Daily use 1:

```text
Time of day: Morning
Meal timing: Before Meal
Dosage: 2 tablets
```

Daily use 2:

```text
Time of day: Night
Meal timing: No Preference
Dosage: 1 tablet
```

Meaning:

> On every Tuesday and Saturday, use 2 tablets before a meal in the morning and 1 tablet at night.

The two Daily use entries apply to **each selected day**.

### 3. Selected weekdays every two weeks

```text
Routine type: Specific days
Number of daily uses: 1
Days: Monday and Thursday
Repeat every: 2 Week(s)
```

Daily use 1:

```text
Time of day: Evening
Meal timing: After Meal
Dosage: Apply as directed
```

Meaning:

> Every second week, use the treatment on Monday and Thursday evening after a meal.

## Validation rules

A valid `SPECIFIC_DAYS` routine requires:

- At least one selected weekday
- Number of daily uses from 1 to 24
- Exactly that many Daily use entries
- A dosage for every Daily use
- A valid time of day for every Daily use
- A valid meal timing for every Daily use
- If repeat cycle is enabled:
  - A positive repeat interval
  - A valid unit

For example, this is invalid:

```text
Number of daily uses: 2

Daily use 1
Daily use 2
Daily use 3
```

The number of entries must exactly match the number entered.

## When not to use Specific days

### Use `DAILY` instead

Use `DAILY` when the treatment happens every day.

```text
Every day
Morning and night
```

### Use `INTERVAL` instead

Use `INTERVAL` when the important rule is the elapsed time between uses.

```text
Every 8 hours
```

### Use `SESSION_PLAN` instead

Use `SESSION_PLAN` for clinical appointments or procedures with a total number of sessions.

```text
Every 4 weeks
Total sessions: 6
```

### Use `AS_NEEDED` instead

Use `AS_NEEDED` when the patient uses the treatment only when a condition occurs.

## The main distinction

| Routine type | Scheduling idea |
|---|---|
| `SPECIFIC_DAYS` | Use on selected recurring weekdays |
| `DAILY` | Use every day |
| `INTERVAL` | Wait a fixed amount of time between uses |
| `SESSION_PLAN` | Attend a repeating number of clinical sessions |
| `AS_NEEDED` | Use when needed, subject to limits |

The key rule for `SPECIFIC_DAYS` is:

```text
Selected weekdays
        +
Number of daily uses per selected day
        +
Daily use details
```

For example:

```text
Days: Monday, Wednesday, Friday
Number of daily uses: 2

Daily use 1
Morning · Before Meal · 2 tablets

Daily use 2
Night · No Preference · 1 tablet
```

This means the two-use pattern is repeated on every selected weekday. Each Daily use has its own time of day, meal timing, and dosage.