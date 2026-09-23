# Invite Staff Members

> Add team members to your clinic by sending email invitations.

## Prerequisites
- ClinicAdmin or OrganizationAdmin role
- Staff member's email address

## Steps

1. Navigate to Staff Management.
2. Click "Invite Staff."
3. Enter the staff member's email address.
4. Assign one or more roles (Doctor, Receptionist, Nurse, Sales, Marketing, Frontdesk, or custom roles).
5. Click "Send Invitation."
6. The system creates a staff record with status `PENDING_REGISTRATION` and sends an invite email.
7. The invite link is valid for 7 days.

## What the Invitee Does

1. Opens the invitation email and clicks the link.
2. Sets a password (minimum 8 characters, must include a letter, number, and symbol).
3. Is logged in immediately.
4. Completes their profile: first name, last name, phone, specialization, experience.

## Managing Invitations

- **Resend**: If the invite expires, you can resend it (generates a new 7-day link, invalidates the old one).
- **Cancel**: You can cancel a pending invite, which deletes the staff record.
- **Duplicate check**: You cannot invite an email that already has an active, inactive, or pending staff record in the same clinic.

## Notes
- OrganizationAdmins can invite staff to any clinic in their organization.
- ClinicAdmins can only invite staff to their own clinic.
- The invite flow is the same for all staff — including the first user during self-registration.
