# Requirements Document

## Introduction

This feature defines independent authentication sessions for browser, mobile, and Windows clients. Each successful login creates a separately revocable `AuthSession` for the relevant login and client installation, allowing clients to remain active independently. Refresh credentials remain opaque, randomly generated, server-validated, and rotated on every successful refresh. The feature applies to the Hairscope Backend authentication boundary and its browser and native clients while preserving existing password-reset, account-deactivation, invitation, authorization, tenant, and permission behavior.

The current implementation's `findOrCreate` behavior, which reuses one active session for a Staff member, does not satisfy this feature. A successful login SHALL create a new independent session rather than update an existing active session. The current public logout behavior is retained only as a safe transport-cleanup fallback: a request with no verifiable current session may clear its own transport credentials and return the existing success response, but a request with a verifiable current session must revoke that session and must not revoke another session selected from client input.

## Glossary

- **AuthSession**: A server-side authentication lifecycle record created for one successful login and bound to one Staff member and Client_Instance.
- **Authentication_Service**: The backend service that authenticates credentials, creates and validates AuthSession records, issues tokens, rotates refresh credentials, processes logout, and applies global revocation.
- **Staff**: An authenticated Hairscope personnel account.
- **Client_Instance**: One independently authenticated browser profile, mobile application installation, or Windows application installation.
- **Client_Type**: The transport category of a Client_Instance: `BROWSER`, `MOBILE`, or `WINDOWS`.
- **Opaque_Refresh_Token**: A cryptographically random bearer value with no JWT structure or readable identity claims; the backend persists only a one-way representation of the value.
- **Access_Token**: A short-lived identity-only JWT used to authenticate API requests and identify the bound AuthSession after signature and claim validation.
- **Token_Rotation**: Replacement of an accepted Opaque_Refresh_Token with a newly generated Opaque_Refresh_Token and replacement of the session's current server-side token state.
- **Compare_And_Swap**: An atomic update that succeeds only when the stored AuthSession token state still matches the state read for the presented Opaque_Refresh_Token.
- **Confirmed_Token_Reuse**: Presentation of a token that the server can establish was previously issued for an AuthSession but is no longer that session's current token, rather than an unrecognized random value.
- **Rolling_Expiry**: Expiration calculated from the most recent successful Token_Rotation or session creation, rather than from an immutable original-login deadline.
- **Distributed_Rate_Limiter**: A shared rate-limit service whose counters and expiration state are consistent across backend instances.
- **Public_Registration**: An unauthenticated endpoint that creates or begins creation of a Staff account.
- **Current_Auth_Context**: A server-derived identity and AuthSession reference obtained from a verified Access_Token or a server-validated refresh credential; a client-supplied session identifier alone is not a Current_Auth_Context.
- **Request_Metadata**: Request IP address, user-agent, Client_Type, and correlation identifier available at authentication time.
- **Duplicate_Login_Request**: A repeated login request with the same Staff credential identity, Client_Instance, and correlation or idempotency identifier as an in-progress or completed login request.
- **Audit_Event**: An immutable security record describing an authentication action, outcome, AuthSession or Staff when known, Request_Metadata, and event time.
- **JWT_Issuer**: The configured issuer identifier placed in and validated against Access_Token `iss` claims.
- **JWT_Audience**: The configured audience identifier placed in and validated against Access_Token `aud` claims.
- **Production**: A runtime environment with `NODE_ENV=production`.

## Requirements

### Requirement 1: Independent AuthSessions per login and client

**User Story:** As a Staff member, I want each login and client installation to have an independent session, so that browser, mobile, and Windows clients can remain active independently.

#### Acceptance Criteria

1. WHEN a Staff member completes a successful login that is not a Duplicate_Login_Request, THE Authentication_Service SHALL create a new ACTIVE AuthSession for that login and Client_Instance and SHALL not update or reuse an existing ACTIVE AuthSession as the login's session.
2. WHEN the Authentication_Service detects a Duplicate_Login_Request, THE Authentication_Service SHALL preserve one resulting AuthSession for the duplicate request group and SHALL return the existing login outcome without creating a redundant AuthSession.
3. WHEN the same Staff member completes successful logins from two distinct Client_Instances, THE Authentication_Service SHALL maintain two independently identifiable ACTIVE AuthSession records with separate current Opaque_Refresh_Token states.
4. WHEN a successful login creates an AuthSession, THE Authentication_Service SHALL bind the issued Access_Token to that AuthSession and SHALL assign the session identity server-side.
5. WHILE an AuthSession has status ACTIVE, THE Authentication_Service SHALL permit that AuthSession to authenticate or refresh independently of the status or concurrent security activity of every other AuthSession for the same Staff member.
6. THE Authentication_Service SHALL permit a Staff member to create additional independent AuthSessions without applying an absolute per-Staff active-session-count limit or an absolute session-lifetime limit.
7. IF a client supplies an AuthSession identifier that is not derived from a verified Access_Token or a server-validated refresh credential, THEN THE Authentication_Service SHALL ignore that identifier as an authority for session selection.

### Requirement 2: Session-authoritative authentication and transport identity

**User Story:** As a security operator, I want every authenticated request to be tied to a server-authoritative session, so that arbitrary client input cannot select another Staff session.

#### Acceptance Criteria

1. WHEN an Access_Token is presented, THE Authentication_Service SHALL validate the token signature, expiry, required claims, and bound AuthSession status before accepting the Current_Auth_Context.
2. WHEN a refresh request is presented, THE Authentication_Service SHALL identify the candidate AuthSession from the server-validated refresh credential and stored session state rather than trusting an arbitrary client-supplied AuthSession identifier.
3. WHEN a request contains both a client-supplied AuthSession identifier and a verifiable credential that identifies a different AuthSession, THE Authentication_Service SHALL use only the verifiable credential's server-derived AuthSession, SHALL not use the client-supplied identifier, and SHALL allow validation to fail if the server-derived AuthSession is invalid.
4. WHILE an AuthSession has status REVOKED or its current refresh credential has expired, THE Authentication_Service SHALL reject Access_Token validation and refresh attempts bound to that AuthSession.
5. WHEN an Access_Token expires while its AuthSession remains ACTIVE, THE Authentication_Service SHALL reject authenticated API requests using that Access_Token and SHALL permit refresh through the valid current Opaque_Refresh_Token.
6. THE Authentication_Service SHALL resolve Staff account status, tenant scope, roles, permissions, and entitlements from server-side records rather than from client input or mutable authorization claims.

### Requirement 3: Current-session logout and explicit global logout

**User Story:** As a Staff member, I want ordinary logout to affect only the current client, while retaining a deliberate way to sign out everywhere.

#### Acceptance Criteria

1. WHEN a logout request presents a valid Current_Auth_Context, THE Authentication_Service SHALL revoke only the AuthSession in that context with reason `LOGOUT` and SHALL clear the current client transport credentials.
2. WHEN logout completes for one AuthSession, THE Authentication_Service SHALL preserve the ACTIVE status and refresh capability of every other AuthSession for the same Staff member.
3. WHEN an explicit global logout action is requested by an authorized Current_Auth_Context, THE Authentication_Service SHALL revoke every ACTIVE AuthSession for the Staff member and SHALL clear the requesting client's transport credentials.
4. IF a logout request lacks a valid Current_Auth_Context, THEN THE Authentication_Service SHALL clear only the requesting client's transport credentials and SHALL return the existing successful logout response without revoking any AuthSession.
5. IF a logout request contains an arbitrary AuthSession identifier without a valid Current_Auth_Context, THEN THE Authentication_Service SHALL not revoke the identified AuthSession.
6. WHEN a Staff account is deactivated, THE Authentication_Service SHALL immediately invalidate every Access_Token and Opaque_Refresh_Token bound to every AuthSession for that Staff member and SHALL reject subsequent validation for those credentials.
7. WHEN a password reset completes, THE Authentication_Service SHALL revoke every existing AuthSession for the Staff member before issuing any post-reset authentication credentials.

### Requirement 4: Opaque tokens and configured expiry

**User Story:** As a security operator, I want opaque refresh credentials and centrally configured token lifetimes, so that token contents disclose no identity and expiry policy is consistent.

#### Acceptance Criteria

1. THE Authentication_Service SHALL generate every Opaque_Refresh_Token using a cryptographically secure random source and SHALL persist only a one-way representation in the associated AuthSession.
2. THE Authentication_Service SHALL treat every Opaque_Refresh_Token as an uninterpreted bearer value and SHALL exclude JWT headers, payloads, issuer, audience, and identity claims from the refresh-token value.
3. WHEN an Access_Token is issued, THE Authentication_Service SHALL set its JWT expiry from `JWT_ACCESS_EXPIRY`.
4. WHEN an AuthSession is created or successfully refreshed, THE Authentication_Service SHALL set the current refresh-token expiry from `JWT_REFRESH_EXPIRY`.
5. WHEN an Opaque_Refresh_Token reaches its current Rolling_Expiry, THE Authentication_Service SHALL reject the token and SHALL require a new login or another existing authentication recovery flow.
6. THE Authentication_Service SHALL allow an ACTIVE AuthSession to continue through successful rolling refreshes indefinitely, regardless of actual usage patterns, without imposing an additional absolute session lifetime.
7. IF authentication configuration validation fails at startup, THEN THE Authentication_Service SHALL prevent all Access_Token and Opaque_Refresh_Token issuance and SHALL prevent the application from accepting requests.
8. IF `JWT_ACCESS_EXPIRY` or `JWT_REFRESH_EXPIRY` is absent, zero, negative, or otherwise invalid at startup, THEN THE Authentication_Service SHALL fail configuration validation and SHALL prevent the application from accepting requests.

### Requirement 5: Atomic refresh rotation and confirmed reuse response

**User Story:** As a security operator, I want refresh rotation to be atomic and confirmed token reuse to trigger global protection, so that concurrent requests cannot create multiple valid successors and stolen credentials cannot remain useful.

#### Acceptance Criteria

1. WHEN an ACTIVE AuthSession receives its current unexpired Opaque_Refresh_Token, THE Authentication_Service SHALL use Compare_And_Swap to verify the current token state, replace the state, update Rolling_Expiry and last activity, and issue one successor Opaque_Refresh_Token only when Compare_And_Swap succeeds.
2. WHEN two or more refresh requests concurrently present the same current Opaque_Refresh_Token, THE Authentication_Service SHALL allow no more than one request to complete Token_Rotation successfully.
3. IF a refresh request presents an unrecognized Opaque_Refresh_Token, THEN THE Authentication_Service SHALL reject the request without selecting an AuthSession from arbitrary client input.
4. THE Authentication_Service SHALL never select an AuthSession from a client-supplied identifier during refresh, regardless of whether the presented Opaque_Refresh_Token is recognized.
5. WHEN a refresh request presents a Confirmed_Token_Reuse for an ACTIVE AuthSession, THE Authentication_Service SHALL immediately reject the refresh request, SHALL append the required security audit event, and SHALL initiate revocation of every ACTIVE AuthSession for the associated Staff member.
6. WHEN Confirmed_Token_Reuse causes global revocation, THE Authentication_Service SHALL invalidate every Access_Token and Opaque_Refresh_Token bound to every revoked AuthSession on subsequent validation.
7. WHEN a potential or confirmed token reuse is detected, THE Authentication_Service SHALL record one `SECURITY_TOKEN_REUSE` Audit_Event immediately with the affected Staff and session context and Request_Metadata without storing the presented raw token or any token hash.
8. IF global revocation fails after Confirmed_Token_Reuse detection, THEN THE Authentication_Service SHALL preserve rejection of the refresh request, SHALL not issue a successor token, and SHALL expose an operational failure signal without delaying or suppressing the detection and audit response.
9. IF a refresh request presents a valid Opaque_Refresh_Token for an AuthSession whose status is non-ACTIVE or whose expiration has passed, including an AuthSession marked ACTIVE in the database but expired by timestamp, THEN THE Authentication_Service SHALL treat the invalid state as controlling and SHALL reject the request without issuing a successor token.

### Requirement 6: Browser and native credential contracts

**User Story:** As a client developer, I want explicit browser and native credential contracts, so that each client uses an appropriate protected transport.

#### Acceptance Criteria

1. WHERE the Client_Type is `BROWSER`, THE Authentication_Service SHALL deliver Access_Token and Opaque_Refresh_Token values through HTTP-only cookies and SHALL omit raw token values from the authentication response body.
2. WHERE the Client_Type is `MOBILE` or `WINDOWS`, THE Authentication_Service SHALL return the Access_Token and Opaque_Refresh_Token through the native authentication response contract and SHALL not require browser cookies.
3. WHERE the Client_Type is `MOBILE` or `WINDOWS`, THE native client contract SHALL require the client to store credentials in OS-provided secure storage for every native authentication flow, regardless of whether bearer authentication is currently used.
4. THE Authentication_Service SHALL accept bearer-token authentication for native clients and SHALL accept the defined cookie authentication contract for browser clients.
5. IF a client provides a token through browser local storage, THEN THE Authentication_Service SHALL ignore the local-storage value during authentication, SHALL use valid authentication cookies when valid authentication cookies are also present, and SHALL leave the local-storage value unchanged.
6. WHEN a native client successfully refreshes, THE Authentication_Service SHALL return replacement credentials through the native authentication response contract and SHALL invalidate the prior Opaque_Refresh_Token.
7. WHEN a browser client successfully refreshes, THE Authentication_Service SHALL replace the authentication cookies using the same cookie contract used at login.

### Requirement 7: Consistent browser cookie attributes

**User Story:** As a browser user, I want authentication cookies to be consistently secured and cleared, so that login, refresh, and logout do not create mismatched or lingering credentials.

#### Acceptance Criteria

1. WHERE the Client_Type is `BROWSER`, THE Authentication_Service SHALL set each authentication cookie with `HttpOnly=true`, `SameSite=Strict`, the configured path and domain selection, and `Secure=true` in Production while preserving the configured non-Production Secure behavior.
2. WHERE the Client_Type is `BROWSER`, THE Authentication_Service SHALL use the same cookie name, path, domain selection, `HttpOnly`, `SameSite`, and `Secure` values for setting and clearing each authentication cookie and SHALL retain the original setting attributes for clearing after an environment change.
3. WHEN an authentication cookie is set, THE Authentication_Service SHALL derive its lifetime from the corresponding configured token expiry, using `JWT_ACCESS_EXPIRY` for the Access_Token cookie and `JWT_REFRESH_EXPIRY` for the Opaque_Refresh_Token cookie.
4. WHEN browser logout completes, THE Authentication_Service SHALL attempt to clear the browser authentication cookies with deletion attributes matching the attributes used to set those cookies, including when no authentication cookies were previously set for the session.
5. IF the runtime is outside Production, THEN THE Authentication_Service SHALL preserve `HttpOnly=true` and `SameSite=Strict` and SHALL apply the configured non-Production Secure behavior.
6. IF Production cookie configuration is missing `HttpOnly=true`, `SameSite=Strict`, or `Secure=true`, or if authentication configuration is otherwise invalid, THEN THE Authentication_Service SHALL fail configuration validation and SHALL block all authentication-cookie set, refresh, and clear operations.

### Requirement 8: Production JWT signing and claim validation

**User Story:** As a security operator, I want production Access_Token signing and validation to be explicit, asymmetric, and claim-checked, so that forged or misdirected tokens cannot authenticate requests.

#### Acceptance Criteria

1. WHILE the runtime is Production, THE Authentication_Service SHALL sign Access_Token values with RS256 using a private key supplied by environment-backed configuration.
2. WHILE the runtime is Production, THE Authentication_Service SHALL independently verify the Access_Token signature with the configured public key and validate that the declared algorithm is RS256, and SHALL reject the token if either check fails.
3. WHILE the runtime is Production, THE Authentication_Service SHALL require configured `JWT_ISSUER` and `JWT_AUDIENCE` values and SHALL validate Access_Token `iss` and `aud` claims against those values.
4. WHEN an Access_Token is validated, THE Authentication_Service SHALL require correctly typed non-empty `staffId`, `organizationId`, `clinicId`, and `authSessionId` claims together with valid `iat` and `exp` claims.
5. IF an Access_Token has an invalid signature, algorithm, issuer, audience, required identity claim, `iat`, or `exp`, THEN THE Authentication_Service SHALL reject the token with a generic validation error and SHALL never expose signing secrets regardless of validation outcome.
6. IF validation processing detects possible exposure of a signing secret or other credential secret, THEN THE Authentication_Service SHALL terminate the affected validation path and SHALL return only a generic error without exposing the secret in a response, log, telemetry record, or audit event.
7. WHEN an Access_Token is validated, THE Authentication_Service SHALL resolve roles, permissions, entitlements, and account status from server-side records rather than from JWT claims.
8. WHEN optional server-side role, permission, or entitlement lookup is unavailable after signature, claim, AuthSession, and account-status checks pass, THE Authentication_Service SHALL complete token validation using the available records and SHALL defer authorization decisions to the existing authorization guards.
9. IF a required Production JWT key, `JWT_ISSUER`, `JWT_AUDIENCE`, `JWT_ACCESS_EXPIRY`, or `JWT_REFRESH_EXPIRY` value is absent or invalid at startup, THEN THE Authentication_Service SHALL fail configuration validation and SHALL prevent the application from starting.

### Requirement 9: Distributed endpoint-specific abuse controls

**User Story:** As a security operator, I want login and public-registration abuse controls to work across all backend instances without revealing account existence, so that attackers cannot bypass limits or enumerate Staff accounts.

#### Acceptance Criteria

1. THE Distributed_Rate_Limiter SHALL maintain authentication counters and expiration state in shared infrastructure so that requests routed to different backend instances consume the same logical limit.
2. WHEN a login request is received, THE Authentication_Service SHALL apply the configured login limit using a key containing the normalized login identity and request source context and SHALL reject the request when the counter is greater than or equal to the configured limit.
3. WHEN a Public_Registration request is received, THE Authentication_Service SHALL apply a separate configured registration limit using a key containing the normalized registration identity and request source context and SHALL reject the request when the counter is greater than or equal to the configured limit.
4. IF a login or Public_Registration request exceeds its endpoint-specific limit, THEN THE Authentication_Service SHALL return the existing rate-limit error contract without revealing credential validity or account existence.
5. IF a login request has an unknown email, inactive Staff account, pending Staff account, or incorrect password, THEN THE Authentication_Service SHALL return the same generic externally visible failure response shape for all four conditions.
6. IF a Public_Registration request targets an available or already-used registration identity, THEN THE Authentication_Service SHALL return the same generic externally visible response shape for both conditions.
7. THE Authentication_Service SHALL exclude passwords, raw Opaque_Refresh_Token values, token hashes, and other credential secrets from rate-limit keys and public responses.

### Requirement 10: Authentication security audit events

**User Story:** As a security operator, I want authentication actions to be auditable without exposing secrets, so that session history and security incidents can be investigated.

#### Acceptance Criteria

1. WHEN a login succeeds or fails, THE Authentication_Service SHALL append a corresponding `LOGIN_SUCCESS` or `LOGIN_FAILED` Audit_Event with event time, outcome, and Request_Metadata, even when Staff or normalized login identity is unavailable.
2. WHEN an AuthSession is created, successfully refreshed, locally logged out, globally revoked, or rejected for Confirmed_Token_Reuse, THE Authentication_Service SHALL append the matching `SESSION_CREATED`, `SESSION_REFRESHED`, `LOGOUT`, `GLOBAL_LOGOUT`, or `SECURITY_TOKEN_REUSE` Audit_Event with AuthSession context, Staff when known, and Request_Metadata.
3. WHEN password reset or account deactivation revokes AuthSessions, THE Authentication_Service SHALL preserve the existing password-reset and deactivation audit events and SHALL associate the global session-revocation outcome with the affected Staff member.
4. WHEN an Audit_Event is composed, THE Authentication_Service SHALL exclude passwords, raw Access_Tokens, raw Opaque_Refresh_Tokens, token hashes, token types, token expiry values, token issuers, and other token-related data before persistence, logging, telemetry, or any other audit-data processing path.
5. IF audit persistence fails during a security-sensitive authentication state mutation, THEN THE Authentication_Service SHALL preserve the atomic state-mutation contract, SHALL terminate audit handling without forwarding sensitive request values, and SHALL expose an operational failure signal for remediation.

### Requirement 11: Startup configuration and existing behavior preservation

**User Story:** As a platform operator, I want invalid authentication configuration rejected before startup and existing identity behavior preserved, so that deployments fail safely and authorization semantics do not regress.

#### Acceptance Criteria

1. THE Authentication_Service SHALL complete authentication environment validation unconditionally during startup before accepting application traffic.
2. IF any required authentication environment value is missing, malformed, or inconsistent with its runtime environment, THEN THE Authentication_Service SHALL fail fast with a clear configuration error and SHALL not start the authentication service.
3. THE Authentication_Service SHALL preserve credential login, Access_Token authentication, refresh, invitation acceptance, password reset, account deactivation, bearer-token extraction for native clients, and HTTP-only cookie extraction for browser clients while applying the independent AuthSession rules.
4. THE Authentication_Service SHALL preserve server-authoritative tenant, role, permission, entitlement, and account-status evaluation for every authenticated request.
5. WHEN password reset completes, THE Authentication_Service SHALL preserve the existing password update, reset-token consumption, global session revocation, post-reset login, and audit behavior.
6. WHEN account deactivation completes, THE Authentication_Service SHALL preserve the existing account-status update, global session revocation, Access_Token rejection, and audit behavior.
7. WHEN an existing client omits Client_Type, THE Authentication_Service SHALL infer the documented transport contract from the credential transport used, without treating the inferred transport as authority for session identity.
8. IF the Authentication_Service cannot preserve all listed existing authentication, password-reset, deactivation, invitation, transport, tenant, and authorization behaviors, THEN THE Authentication_Service SHALL fail startup rather than serve a partial compatibility implementation.

## Correctness Properties for Property-Based Testing

The following properties are suitable for generated Staff identities, Client_Instances, login and refresh sequences, token histories, request interleavings, configuration values, cookie attributes, and authentication outcomes. Each property is independently testable against the Authentication_Service contract.

- **P1 — Independent session creation:** For any Staff member and any sequence of successful non-duplicate logins, each login creates a distinct AuthSession identifier and a distinct current refresh-token state; a generated Duplicate_Login_Request reuses the original login outcome without creating a redundant AuthSession.
- **P2 — Session isolation:** For any Staff member with two or more ACTIVE AuthSessions, revoking one selected session leaves every other session ACTIVE and refreshable.
- **P3 — Logout locality:** For any set of ACTIVE AuthSessions, ordinary logout changes only the session in the verified Current_Auth_Context to REVOKED with reason `LOGOUT`.
- **P4 — Global revocation:** For any Staff member with zero or more AuthSessions, explicit global logout, password reset, account deactivation, or Confirmed_Token_Reuse leaves zero ACTIVE AuthSessions and causes every bound Access_Token and refresh credential to fail validation.
- **P5 — Session identity authority:** For any request containing a forged or conflicting client-supplied AuthSession identifier, the selected session equals the session derived from the verified credential, never the supplied identifier.
- **P6 — Opaque token invariant:** Every generated refresh token is cryptographically random and non-JWT-shaped, contains no readable identity claims, and has no raw value persisted in the AuthSession or audit events.
- **P7 — Configured expiry:** For every valid configuration, Access_Token expiry equals issuance time plus `JWT_ACCESS_EXPIRY`, and each session refresh expiry equals successful rotation time plus `JWT_REFRESH_EXPIRY`; a token presented after its current expiry is rejected.
- **P8 — Single-winner atomic rotation:** For any ACTIVE AuthSession and duplicate concurrent requests containing the same current refresh token, at most one request succeeds, and no two successor refresh tokens become current.
- **P9 — Confirmed reuse protection:** For any session token proven to be previously issued but no longer current, presenting that token rejects the request, globally revokes the Staff member's ACTIVE sessions, and invalidates the previously current successor.
- **P10 — Transport separation:** For any browser authentication response, raw tokens occur only in HTTP-only cookies and not in the response body; for any native response, credentials follow the native response contract and browser cookies are not required.
- **P11 — Cookie symmetry:** For any configured browser cookie attributes, set and clear operations use equal names, paths, domain selection, `HttpOnly`, `SameSite`, and `Secure` values, with lifetimes derived from the corresponding expiry configuration.
- **P12 — JWT validation:** For any generated Access_Token, changing its algorithm, issuer, audience, required identity claim type, `iat`, or `exp` to an invalid value causes validation failure; a valid production RS256 token with an ACTIVE AuthSession validates successfully.
- **P13 — Distributed rate-limit consistency:** For any endpoint key and request sequence distributed across backend instances, accepted and rejected results equal the result from the same sequence processed by one logical Distributed_Rate_Limiter, while login and registration counters remain independent.
- **P14 — Generic public failures:** For generated login inputs differing only by unknown email, inactive account, pending account, or wrong password, the externally visible failure shape is identical; generated registration inputs differing only by identity availability also produce identical response shapes.
- **P15 — Audit secrecy and coverage:** For every specified login outcome, session creation, refresh, logout, global revocation, password reset, deactivation, and confirmed reuse transition, the required audit action is emitted with no password or token-related data, including raw tokens, token hashes, token types, expiry values, or issuers.
- **P16 — Compatibility behavior:** For every previously supported authentication request using a bearer header or browser cookie, the request remains accepted or rejected according to the same server-side authentication and authorization state, except where the request intentionally exercises independent sessions, atomic rotation, global logout, or confirmed-reuse rules.
