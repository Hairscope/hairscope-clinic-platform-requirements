## What `AS_NEEDED` means

**As Needed** means: use the treatment when a specified condition or situation occurs, rather than according to a fixed calendar schedule.

It answers:

> “When may the patient use this treatment, and what limits should apply?”

An As Needed routine records the reason for use, the dosage, and optional safety limits. It does not schedule a particular time of day, weekday, or number of planned sessions.

### Example: use for scalp irritation

UI fields:

| Field | Value |
|---|---|
| Routine type | `As needed` |
| Reason | `When scalp irritation occurs` |
| Dosage | `Apply a thin layer` |
| Maximum uses per day (optional) | `2` |
| Minimum wait in hours (optional) | `6` |
| How to apply / use? | `Scalp` |
| Duration | `14` |
| Duration unit | `Day(s)` |

Meaning:

> When scalp irritation occurs, apply a thin layer to the scalp, no more than twice per day and with at least six hours between uses, for up to 14 days.

The resulting routine is:

```json
{
  "type": "AS_NEEDED",
  "reason": "When scalp irritation occurs",
  "dosage": "Apply a thin layer",
  "maxPerDay": 2,
  "minimumWaitHours": 6,
  "routeOrArea": "Scalp",
  "duration": {
    "value": 14,
    "unit": "DAY"
  }
}
```
## How to fill the As Needed UI

### 1. Select the routine type

Choose:

```text
As needed
```

Use this when the treatment should be used only when a defined condition or situation occurs.

### 2. Complete Reason

Describe the situation that permits or prompts use.

Examples:

```text
When scalp irritation occurs
When discomfort is present
For occasional dryness
When directed for a flare-up
```

The reason should be specific enough for the patient and care team to understand when the routine applies.

### 3. Complete Dosage

Enter the amount or application instruction for each use.

Examples:

```text
Apply a thin layer
1 tablet
2 sprays
Use one application
```

Dosage is required even though the timing of use is flexible.

### 4. Set Maximum uses per day (optional)

Enter the maximum number of uses permitted in one day.

Example:

```text
Maximum uses per day (optional): 2
```

Leave this field empty when no daily maximum is defined in the protocol. If provided, it must be a positive whole number.

### 5. Set Minimum wait in hours (optional)

Enter the minimum time that should pass before the treatment is used again.

Example:

```text
Minimum wait in hours (optional): 6
```

Leave this field empty when no minimum waiting period is defined. Use a positive number of hours when a waiting period is needed.

### 6. Complete How to apply / use?

Use this field to describe the route, application method, or treatment area.

Examples:

```text
Scalp
Oral
Apply to the affected area
Face and neck
```

### 7. Complete Duration

Duration is optional. If used, enter the period during which the As Needed routine may be followed.

Example:

```text
Duration: 14
Duration unit: Day(s)
```

Duration limits the overall treatment period; it does not create a fixed daily schedule.

## Common use cases

### 1. Occasional scalp irritation

```text
Routine type: As needed
Reason: When scalp irritation occurs
Dosage: Apply a thin layer
Maximum uses per day (optional): 2
Minimum wait in hours (optional): 6
How to apply / use?: Scalp
Duration: 14 Day(s)
```

Meaning:

> Use a thin layer on the scalp when irritation occurs, no more than twice per day and at least six hours apart, for up to 14 days.

### 2. Occasional topical dryness

```text
Routine type: As needed
Reason: For occasional dryness
Dosage: Apply a small amount
Maximum uses per day (optional): 3
How to apply / use?: Scalp
```

Meaning:

> Apply a small amount to the scalp when occasional dryness occurs, up to three times per day.

### 3. A conditional oral treatment

```text
Routine type: As needed
Reason: When directed for occasional symptoms
Dosage: 1 tablet
Maximum uses per day (optional): 1
Minimum wait in hours (optional): 24
How to apply / use?: Oral
```

Meaning:

> Take one tablet only when the defined condition occurs, with no more than one use in a day.

The reason and limits should be clear enough that the patient does not interpret the routine as a regular daily prescription.

## Safety-limit behavior

The optional limits work together:

- `Maximum uses per day` caps the number of uses in a calendar day.
- `Minimum wait in hours` defines the shortest gap between uses.
- `Duration` defines the overall period for which the routine applies.

For example:

```text
Maximum uses per day: 2
Minimum wait in hours: 6
Duration: 14 Day(s)
```

means that the patient may use the treatment when needed, but not more than twice per day, with at least six hours between uses, during the 14-day period.

## Validation rules

A valid `AS_NEEDED` routine requires:

- A non-empty reason
- A non-empty dosage
- An optional positive whole-number maximum uses per day
- An optional positive minimum wait in hours
- An optional positive duration and valid duration unit
- An optional route or application area

An As Needed routine does not require a session interval, total number of sessions, daily uses, selected weekdays, or meal timing.

## When not to use As Needed

### Use `DAILY` instead

Use `DAILY` when the treatment should be used every day at planned general times of day.

Example:

```text
Morning: 1 tablet
Night: 1 application
```

### Use `INTERVAL` instead

Use `INTERVAL` when the treatment should repeat after a fixed elapsed-time gap regardless of whether a symptom or condition occurs.

Example:

```text
Repeat every: 8 Hour(s)
```

### Use `SPECIFIC_DAYS` instead

Use `SPECIFIC_DAYS` when the treatment should happen on selected recurring weekdays.

### Use `SESSION_PLAN` instead

Use `SESSION_PLAN` when the treatment consists of a planned number of clinical sessions at a repeating interval.

## The main distinction

| Routine type | Scheduling idea |
|---|---|
| `AS_NEEDED` | Use when a specified condition occurs, subject to limits |
| `DAILY` | Use every day at one or more general time-of-day entries |
| `INTERVAL` | Wait a fixed amount of time between uses |
| `SPECIFIC_DAYS` | Use on selected recurring weekdays |
| `SESSION_PLAN` | Attend a defined number of sessions at a repeating interval |

The key rule for `AS_NEEDED` is:

```text
Reason for use
        +
Dosage
        +
Optional safety limits
```

For example:

```text
Reason: When scalp irritation occurs
Dosage: Apply a thin layer
Maximum uses per day: 2
Minimum wait in hours: 6
```

This describes a conditional treatment, not a routine that should be followed automatically every day.