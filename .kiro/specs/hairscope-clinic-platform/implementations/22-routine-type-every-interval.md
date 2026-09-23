## What “Every Interval” means

**Every Interval** means: repeat the treatment after a fixed amount of elapsed time.

It answers:

> “How long should the patient wait between one use and the next?”

It does **not** mean a specific time on the clock, such as 8:00 AM. It means the next use occurs after the selected interval has passed.

### Example: every 8 hours

UI fields:

| Field | Value |
|---|---|
| Repeat every | `8` |
| Interval unit | `Hour(s)` |
| Dosage | `1 tablet` |
| Route or application area | `Oral` |
| Duration | `3` |
| Duration unit | `Day(s)` |

Meaning:

> Take 1 tablet orally, then wait approximately 8 hours before the next dose, for 3 days.

The resulting routine is:

```json
{
  "type": "INTERVAL",
  "interval": 8,
  "unit": "HOURS",
  "dosage": "1 tablet",
  "routeOrArea": "Oral",
  "duration": {
    "value": 3,
    "unit": "DAY"
  }
}
```
## Common use cases

### 1. Repeated medication with an elapsed-time gap

Example: a treatment used every 12 hours.

```text
Repeat every: 12
Interval unit: Hour(s)
Dosage: 1 capsule
Route or area: Oral
Duration: 7 Day(s)
```

This is useful when the important rule is the gap between doses rather than a named time of day.

### 2. Topical treatment used several times during the day

```text
Repeat every: 8
Interval unit: Hour(s)
Dosage: Apply a thin layer
Route or area: Scalp
Duration: 5 Day(s)
```

This does not require the UI to define morning, afternoon, or night.

### 3. Treatment repeated every few days

```text
Repeat every: 3
Interval unit: Day(s)
Dosage: Use once
Route or area: Scalp
Duration: 1 Month(s)
```

Meaning: perform the treatment, wait three days, then perform it again.

### 4. Product used every few weeks

```text
Repeat every: 2
Interval unit: Week(s)
Dosage: Apply as directed
Route or area: Scalp
Duration: 3 Month(s)
```

This can represent a repeating product or care routine where the gap is more important than a particular weekday.

### 5. Long-term periodic use

```text
Repeat every: 1
Interval unit: Month(s)
Dosage: 1 application
Route or area: Scalp
Duration: 6 Month(s)
```

This means one use every month. If the treatment is a clinic procedure with a known number of appointments, however, `SESSION_PLAN` is probably clearer because it also captures total sessions.

## When not to use Every Interval

### Use `DAILY` instead

Use `DAILY` when the treatment follows daily time-of-day slots.

Example:

```text
Morning: 2 tablets
Night: 1 tablet
```

This is better represented as a daily schedule because each slot can have its own time-of-day, food relationship, and dosage.

### Use `SPECIFIC_DAYS` instead

Use `SPECIFIC_DAYS` when the treatment happens on named weekdays.

Example:

```text
Monday, Wednesday, Friday
Evening
Apply thinly
```

### Use `SESSION_PLAN` instead

Use `SESSION_PLAN` for clinical appointments or procedures with a defined total number of sessions.

Example:

```text
Every: 4 weeks
Total sessions: 6
```

### Use `AS_NEEDED` instead

Use `AS_NEEDED` when the patient uses the treatment only when a condition occurs, such as irritation or discomfort.

## The main distinction

| Routine type | Scheduling idea |
|---|---|
| `INTERVAL` | Wait a fixed amount of time between uses |
| `DAILY` | Use one or more daily time-of-day slots |
| `SPECIFIC_DAYS` | Use on selected weekdays |
| `SESSION_PLAN` | Attend a repeating number of clinical sessions |
| `AS_NEEDED` | Use when needed, subject to limits |

The current label **“Every interval”** is technically accurate but not especially natural. I would consider changing it to one of these:

- **Repeat at interval**
- **Repeat after a fixed interval**
- **Fixed interval**
- **Every N hours/days/weeks**

For the UI, I think **“Repeat at interval”** is the clearest routine-type label, while the fields can remain:

```text
Repeat every [8] [Hour(s)]
Dosage [ ... ]
Route or application area [ ... ]
Duration [ ... ]
```