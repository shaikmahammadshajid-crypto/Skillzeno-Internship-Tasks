# Task 4: Security Audit Report

## 1. Project Overview

**Project:** SecureGate — Secure Login System  
**Audit Type:** Application Security Audit  
**Date:** 16 October 2026  
**Environment:** Local development environment  
**Authorization:** Testing was performed on my own project.

## 2. Audit Objectives

The objective was to review the authentication system, inspect security configurations, check production dependencies, and perform basic security tests on the local API.

## 3. Scope and Methodology

The audit included:

- Reviewing authentication and session-management code.
- Checking HTTP security headers.
- Testing access to a protected endpoint without authentication.
- Checking Cross-Origin Resource Sharing (CORS) behavior with an untrusted origin.
- Auditing production dependencies using npm audit.
- Inspecting SQLite database file permissions.

Testing was limited to the local development environment.

## 4. Security Checks and Results

### Finding 1: Production Dependency Audit

**Result:** Passed  
**Evidence:** `npm audit --omit=dev` reported zero vulnerabilities in production dependencies at the time of testing.  
**Assessment:** No known dependency advisories were reported by this check. This does not guarantee that all dependencies are free from security issues.

### Finding 2: Authentication Enforcement

**Result:** Passed  
**Test:** Requested the `/api/auth/me` endpoint without an authenticated session.  
**Observed response:** HTTP 401 Unauthorized, with the message `Authentication required.`  
**Assessment:** The tested endpoint correctly rejected an unauthenticated request.

### Finding 3: CORS Configuration

**Result:** Passed for the tested case  
**Test:** Sent a request with an untrusted origin, `http://evil.example`.  
**Observed response:** The API returned the configured local frontend origin, `http://localhost:5173`, in its CORS response header rather than granting the untrusted origin access.  
**Assessment:** The tested response did not grant CORS permission to the untrusted origin. CORS is a browser-enforced control and is not a substitute for authentication or authorization.

### Finding 4: HTTP Security Headers

**Result:** Passed for the tested endpoint  
**Evidence:** The health endpoint response included security headers configured through Helmet.  
**Assessment:** Security headers provide useful defense-in-depth protections. This test did not verify every header or every route.

### Finding 5: SQLite File Permissions

**Result:** Passed for the inspected files  
**Evidence:** The SQLite database and its shared-memory and write-ahead-log files had file permissions of `600`, allowing access only to the file owner. The database directory had permissions of `755`.  
**Assessment:** The inspected database files were restricted to the owner. The directory permissions should be reviewed against the deployment's operating-system user and access requirements.

## 5. Security Controls Identified in Code Review

The source code includes the following security controls:

- Argon2id password hashing.
- Password validation during registration.
- Zod request-schema validation.
- Login and registration rate limiting.
- Session ID regeneration after login or registration.
- HTTP-only session cookies.
- SQLite-backed session storage.
- Parameterized database queries.
- Helmet security headers.
- A restricted CORS origin configuration.
- A required session secret with a minimum length.

These controls were identified through source-code review; this report does not claim that every control has been exhaustively tested.

## 6. Recommendations

1. Deploy behind HTTPS and verify that production cookies use the `Secure` attribute.
2. Keep secrets and environment files out of version control. Rotate any secret that may have been exposed.
3. Repeat dependency audits regularly and update vulnerable packages when advisories arise.
4. Add automated tests for registration, login, logout, session expiration, authorization, and rate limiting.
5. Test CSRF protections and session behavior before deploying to a public environment.
6. Review database access, backups, and retention requirements for the intended deployment.
7. Use production-specific configuration and review all security settings before deployment.

## 7. Limitations

- Testing was performed against the local application.
- The audit was limited to the listed checks and source-code review.
- No comprehensive penetration test was performed.
- The dependency audit checks known advisories available to npm at the time of testing.
- Results may differ in a production deployment.

## 8. Conclusion

The checks performed confirmed several useful security controls in SecureGate, including authentication enforcement on the tested endpoint, restrictive CORS behavior for the tested untrusted origin, security headers, restricted database-file permissions, and no reported production dependency vulnerabilities.

The project should undergo further testing before public deployment. These results describe the checks actually performed and should not be interpreted as proof that the entire application is free from vulnerabilities.

---
**Prepared for:** SkillZeno Cybersecurity Internship — Task 4  
**Project:** SecureGate Secure Login System
