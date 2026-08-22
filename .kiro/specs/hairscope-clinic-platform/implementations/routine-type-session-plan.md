## What `SESSION_PLAN` means

**Session Plan** means: schedule a defined number of clinical treatment sessions at a repeating interval.

It answers:

> “How often should the patient return, and how many sessions are included in the plan?”

It is intended for countable clinical procedures or visits, not for a medication dose taken at a time of day. The interval describes the gap between sessions; the total number of sessions describes how many sessions belong to the plan.

### Example: six sessions every four weeks

UI fields:

| Field | Value |
|---|---|
| Routine type | `Session plan` |
| Session interval | `4` |
| Interval unit | `Week(s)` |
| Total number of sessions | `6` |
| How to apply / use? | `Scalp` |
| Duration | `6` |
| Duration unit | `Month(s)` |

Meaning:

> Perform a scalp treatment once every four weeks, for a total of six sessions, over approximately six months.

The resulting routine is:

```json
{
  "type": "SESSION_PLAN",
  "frequency": {
    "interval": 4,
    "unit": "WEEK"
  },
  "totalSessions": 6,
  "routeOrArea": "Scalp",
  "duration": {
    "value": 6,
    "unit": "MONTH"
  }
}
```
## How to fill the Session Plan UI

### 1. Select the routine type

Choose:

```text
Session plan
```

Use this when the treatment consists of a planned number of clinical sessions or procedures.

### 2. Enter the Session interval

Enter a positive whole number describing the gap between sessions.

Examples:

```text
Session interval: 4
Interval unit: Week(s)
```

This means that sessions are planned approximately four weeks apart. It does not specify an exact appointment date or clock time; appointment scheduling can determine those details separately.

### 3. Select the Interval unit

Choose the unit for the session interval:

- Hour(s)
- Day(s)
- Week(s)
- Month(s)
- Year(s)

For most clinical treatment plans, weeks or months are the most natural units.

### 4. Enter Total number of sessions

Enter a positive whole number for the number of sessions included in the plan.

Example:

```text
Total number of sessions: 6
```

This is different from the interval. The interval describes the spacing between sessions; the total number describes how many sessions are planned.

### 5. Complete How to apply / use?

Use this field to describe the treatment area, route, or application context.

Examples:

```text
Scalp
Scalp and hairline
Face and neck
Clinic procedure for the scalp
```

This field is optional in the structured routine. The clinical service name and appointment workflow can provide additional context.

### 6. Complete Duration

Duration is optional. If used, enter the expected overall treatment period and select its unit.

Example:

```text
Duration: 6
Duration unit: Month(s)
```

The duration provides a broad treatment-period description. It does not replace the session interval or total session count.

## Common use cases

### 1. PRP treatment course

```text
Routine type: Session plan
Session interval: 4
Interval unit: Week(s)
Total number of sessions: 6
How to apply / use?: Scalp
Duration: 6 Month(s)
```

Meaning:

> Schedule six PRP treatment sessions approximately four weeks apart for the scalp.

### 2. Microneedling course

```text
Routine type: Session plan
Session interval: 6
Interval unit: Week(s)
Total number of sessions: 4
How to apply / use?: Scalp
Duration: 6 Month(s)
```

Meaning:

> Schedule four scalp microneedling sessions approximately six weeks apart.

### 3. Short clinical therapy series

```text
Routine type: Session plan
Session interval: 7
Interval unit: Day(s)
Total number of sessions: 8
How to apply / use?: Scalp
```

Meaning:

> Schedule eight scalp therapy sessions approximately one week apart.

### 4. Maintenance sessions

```text
Routine type: Session plan
Session interval: 3
Interval unit: Month(s)
Total number of sessions: 4
How to apply / use?: Scalp
Duration: 1 Year(s)
```

Meaning:

> Schedule four maintenance sessions approximately three months apart over one year.

## Validation rules

A valid `SESSION_PLAN` routine requires:

- A positive session interval
- A valid interval unit
- A positive total number of sessions
- An optional positive duration value and valid duration unit
- An optional route or application area

A Session Plan does not require a dosage, daily uses, meal timing, selected weekdays, or a reason for as-needed use.

For catalog restrictions, Session Plan is intended for clinical service-style items. The current backend rejects `SESSION_PLAN` for medication items.

## When not to use Session Plan

### Use `INTERVAL` instead

Use `INTERVAL` when the treatment is used repeatedly by the patient and the important rule is the elapsed time between uses.

Example:

```text
Repeat every: 8 Hour(s)
Dosage: 1 tablet
```

### Use `DAILY` instead

Use `DAILY` when the treatment is used every day with one or more daily uses, each having its own time of day, meal timing, and dosage.

### Use `SPECIFIC_DAYS` instead

Use `SPECIFIC_DAYS` when the treatment occurs on selected recurring weekdays rather than as a numbered series of clinical sessions.

### Use `AS_NEEDED` instead

Use `AS_NEEDED` when the treatment is used only when a specified condition or situation occurs.

## The main distinction

| Routine type | Scheduling idea |
|---|---|
| `SESSION_PLAN` | Attend a defined number of sessions at a repeating interval |
| `INTERVAL` | Wait a fixed amount of time between patient uses |
| `DAILY` | Use every day at one or more general time-of-day entries |
| `SPECIFIC_DAYS` | Use on selected recurring weekdays |
| `AS_NEEDED` | Use when needed, subject to limits |

The key rule for `SESSION_PLAN` is:

```text
Session interval
        +
Interval unit
        +
Total number of sessions
```

For example:

```text
Session interval: 4
Interval unit: Week(s)
Total number of sessions: 6
```

This means six planned sessions, with approximately four weeks between sessions. It does not mean six daily uses or six uses of a medication.