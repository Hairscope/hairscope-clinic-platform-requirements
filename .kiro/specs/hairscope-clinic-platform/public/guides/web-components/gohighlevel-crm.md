# GoHighLevel CRM Integration Guide

This guide explains how to send Hairscope lead data into GoHighLevel (GHL) using their API v2, and how to trigger automations when new leads arrive.

> **Prerequisite:** You should already have the Hairscope webhook configured and working. See the [Webhook Setup Guide](./webhook-setup.md) first.

---

## Architecture

```text
Hairscope Widget → Your Middleware → GoHighLevel API v2
```

Your middleware receives the Hairscope webhook payload and forwards it to GoHighLevel as a contact. GHL workflows then handle the automation (SMS, email, pipeline assignment, etc.).

---

## 1. Get Your GoHighLevel API Credentials

1. In GoHighLevel, go to **Settings → Business Profile → API Keys** (or use a Private Integration Token from the Marketplace).
2. Generate a new API key or create a Private Integration with `contacts.write` scope.
3. Copy the token — you'll use it as a Bearer token in API requests.
4. Note your **Location ID** — every contact in GHL belongs to a location (sub-account). Find it in Settings → Business Profile or in the URL when viewing your sub-account.

> Store the API key server-side only. Never expose it in frontend code.

---

## 2. API Endpoint — Create or Upsert Contact

**Base URL:** `https://services.leadconnectorhq.com`

### Create Contact

```
POST /contacts/
```

### Upsert Contact (recommended)

```
POST /contacts/upsert
```

Upsert will create a new contact if no match is found, or update the existing one if a contact with the same email/phone already exists. This prevents duplicates.

### Required Headers

```http
Authorization: Bearer YOUR_API_KEY
Version: 2021-07-28
Content-Type: application/json
```

> The `Version` header is required. Use `2021-07-28` for the stable v2 API.

---

## 3. Map Hairscope Payload to GHL Contact

Hairscope sends this payload to your webhook:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+44 1234567890",
  "gender": "male",
  "age": "30",
  "clinic": "London North"
}
```

Map it to the GHL contact schema:

```javascript
const ghlPayload = {
  locationId: process.env.GHL_LOCATION_ID,  // Required
  firstName: lead.firstName,
  lastName: lead.lastName,
  email: lead.email,
  phone: lead.phone,
  source: 'Hairscope Widget',
  tags: ['Hairscope Lead'],
  customFields: [
    { key: 'gender', field_value: lead.gender },
    { key: 'age', field_value: lead.age },
    { key: 'preferred_clinic', field_value: lead.clinic },
  ],
};
```

**Key points:**
- `locationId` is **required** — every contact must belong to a GHL location.
- `tags` is an array of strings. Use tags to trigger workflows.
- `customFields` uses `key` (the field key you set up in GHL) and `field_value`.

---

## 4. Full Middleware Example (Node.js)

```javascript
const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;
const GHL_BASE_URL = 'https://services.leadconnectorhq.com';

app.post('/webhook/hairscope-lead', async (req, res) => {
  const lead = req.body;

  try {
    const response = await axios.post(
      `${GHL_BASE_URL}/contacts/upsert`,
      {
        locationId: GHL_LOCATION_ID,
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        phone: lead.phone,
        source: 'Hairscope Widget',
        tags: ['Hairscope Lead'],
        customFields: [
          { key: 'gender', field_value: lead.gender },
          { key: 'age', field_value: lead.age },
          { key: 'preferred_clinic', field_value: lead.clinic },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${GHL_API_KEY}`,
          Version: '2021-07-28',
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('GHL contact created/updated:', response.data.contact?.id);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('GHL API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to sync to GHL' });
  }
});

app.listen(3000);
```

---

## 5. Trigger Workflows Automatically

Once a contact is created in GHL with the tag `Hairscope Lead`, you can trigger workflows automatically.

### Option A — Use the "Contact Created" Trigger

1. In GHL, go to **Automation → Workflows → Create Workflow**.
2. Add trigger: **Contact Created**.
3. Add a filter: Tag is `Hairscope Lead`.
4. Add your actions (send SMS, send email, notify staff, add to pipeline, etc.).

### Option B — Use the "Contact Tag Added" Trigger

1. Create a workflow with trigger: **Contact Tag Added**.
2. Set the tag filter to `Hairscope Lead`.
3. Add your automation steps.

### Typical Workflow Example

```text
Trigger: Contact Tag Added → "Hairscope Lead"
    ↓
Action: Send SMS — "Hi {firstName}, thanks for your hair analysis!"
    ↓
Action: Send Email — Welcome + consultation booking link
    ↓
Action: Add to Pipeline — "New Leads" → Stage: "Contacted"
    ↓
Action: Notify Staff — Internal notification to clinic team
    ↓
Wait: 24 hours
    ↓
Action: Send SMS — Follow-up if no booking
```

---

## 6. Custom Fields Setup in GHL

Before the `customFields` mapping works, create the fields in GoHighLevel:

1. Go to **Settings → Custom Fields**.
2. Create fields:
   - `gender` (Single Line Text or Dropdown)
   - `age` (Number or Single Line Text)
   - `preferred_clinic` (Single Line Text or Dropdown)
3. Note the **field key** for each — use that in the `key` property of `customFields`.

---

## 7. Phone Number Formatting

GHL is strict about phone numbers. Always send in E.164 international format:

```
✅  +447123456789
✅  +919876543210
❌  07123456789
❌  9876-543-210
```

If Hairscope sends numbers without a country code, normalize them in your middleware before sending to GHL. Invalid formats may cause duplicate contacts or silent failures.

---

## 8. Multi-Clinic Routing

If you have multiple GHL locations (one per clinic), route leads based on the `clinic` field:

```javascript
const CLINIC_TO_LOCATION = {
  'London North': 'loc_abc123',
  'London South': 'loc_def456',
  'Manchester': 'loc_ghi789',
};

const locationId = CLINIC_TO_LOCATION[lead.clinic] || process.env.GHL_DEFAULT_LOCATION_ID;
```

This ensures each lead lands in the correct GHL sub-account.

---

## 9. Error Handling and Retries

The Hairscope webhook is fire-and-forget — it won't retry. Your middleware should handle failures:

```javascript
async function syncToGHL(lead, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await axios.post(/* ... */);
      return; // Success
    } catch (error) {
      if (attempt === retries) {
        // Log to dead-letter queue or alert
        console.error('GHL sync failed after retries:', error.message);
      }
      await new Promise(r => setTimeout(r, attempt * 2000)); // Backoff
    }
  }
}
```

---

## Common Issues

| Issue | Fix |
|:------|:----|
| 401 Unauthorized | Check your API key is valid and has `contacts.write` scope |
| 422 Unprocessable | Usually missing `locationId` or invalid phone format |
| Duplicate contacts | Use `/contacts/upsert` instead of `/contacts/` |
| Custom fields not saving | Verify the `key` matches exactly what's configured in GHL |
| Workflow not triggering | Confirm the tag filter matches the tag you're sending |

---

## API Reference

| Endpoint | Method | Purpose |
|:---------|:-------|:--------|
| `/contacts/` | POST | Create a new contact |
| `/contacts/upsert` | POST | Create or update (recommended) |
| `/contacts/:id` | PUT | Update an existing contact |
| `/contacts/:id` | GET | Retrieve a contact |
| `/contacts/:id/tags` | POST | Add tags to a contact |

Full API docs: [https://marketplace.gohighlevel.com/docs/ghl/contacts/contacts](https://marketplace.gohighlevel.com/docs/ghl/contacts/contacts)

---

## Support

If you need help with the Hairscope side of this integration:

- **Website:** https://hairscope.ai
- **Support Portal:** https://hairscope.ai/support
- **Email:** support@hairscope.ai

For GoHighLevel API issues, refer to their [developer documentation](https://marketplace.gohighlevel.com/docs/) or contact GHL support directly.
