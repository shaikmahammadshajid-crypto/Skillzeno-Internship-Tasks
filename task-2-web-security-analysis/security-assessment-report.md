# SkillZeno Cybersecurity Internship — Task 2
## Web Security Analysis Report

**Practice environment:** OWASP Juice Shop, running locally in Docker on `127.0.0.1:3000`  
**Assessment type:** Basic, non-destructive web security review  
**Date of testing:** 14 October 2026  
**Scope:** The local Juice Shop training instance only  
**Status:** Initial assessment; findings are limited to evidence captured during the checks below.

> This is an intentionally vulnerable training application. These observations describe the local lab and must not be treated as findings about any production website.

## 1. Objective

Review selected HTTP response headers and publicly reachable paths in OWASP Juice Shop, document observed risks, and recommend mitigations.

## 2. Methodology

The following read-only requests were made against the local training instance:

```bash
curl -sS -D - -o /dev/null http://127.0.0.1:3000/
curl -sS -D - -o /dev/null 'http://127.0.0.1:3000/rest/products/search?q=apple'
curl -sS -i http://127.0.0.1:3000/robots.txt
curl -sS -i http://127.0.0.1:3000/ftp/
```

The API request returned HTTP 200. The homepage and product-search API responses included `Access-Control-Allow-Origin: *`. The homepage response did not include a visible `Content-Security-Policy` or `Strict-Transport-Security` header. The `robots.txt` and FTP directory responses were examined.

## 3. Findings

### Finding 1 — Public directory listing under `/ftp/`

**Status:** Confirmed observation  
**Preliminary severity:** Medium; final severity depends on the sensitivity of exposed files and whether the same configuration exists outside the local training lab.

**Evidence**

A request to `http://127.0.0.1:3000/ftp/` returned `HTTP/1.1 200 OK` and an HTML directory index titled `listing directory /ftp/`. The captured listing exposed file names, file sizes, and timestamps. Examples included:

- `acquisitions.md`
- `announcement_encrypted.md`
- `coupons_2013.md.bak`
- `package.json.bak`
- `package-lock.json.bak`
- `incident-support.kdbx`
- `quarantine/`

**Risk / impact**

Directory indexing makes the listed files and their names discoverable without an authenticated workflow being shown in the captured request. Backup files may contain outdated code or configuration, and database/key-container files may attract further scrutiny. The listing alone does not prove that every file contains sensitive information or that all files are downloadable.

**Recommended remediation**

- Disable directory indexing on directories that are not intended to be public.
- Move private, backup, quarantine, and operational files outside the web-served directory.
- Apply authentication and authorization to any files that must be retained.
- Review deployment artifacts and remove unnecessary backups from public web roots.
- Verify that file access is denied when unauthenticated, then retest the directory route.

### Finding 2 — Wildcard CORS header observed on homepage and product search

**Status:** Configuration observation; security impact not yet confirmed  
**Severity:** Informational pending endpoint-specific validation.

**Evidence**

Both the homepage response and `/rest/products/search?q=apple` response included:

```http
Access-Control-Allow-Origin: *
```

The product-search endpoint returned `HTTP/1.1 200 OK`.

**Risk / impact**

A wildcard origin allows browser scripts from arbitrary origins to read responses where the browser's CORS rules otherwise permit it. This header alone does not prove sensitive data exposure. The product-search request observed here is a public search endpoint, and no authenticated sensitive endpoint or credentialed cross-origin access was demonstrated.

**Recommended remediation**

- Configure CORS per endpoint and allow only trusted origins where cross-origin access is required.
- Avoid wildcard origins for responses containing private or user-specific data.
- Validate CORS behavior on authenticated endpoints and ensure credentials are not combined with an overly broad origin policy.
- Retest using browser-based requests and document actual impact before assigning a vulnerability severity.

### Finding 3 — Content Security Policy header not observed in homepage response

**Status:** Header observation; exploitability not tested  
**Severity:** Informational pending application behavior and impact review.

**Evidence**

The captured homepage response included `X-Content-Type-Options: nosniff` and `X-Frame-Options: SAMEORIGIN`, but no `Content-Security-Policy` header was shown in that response.

**Risk / impact**

Without a Content Security Policy, the browser may have fewer defense-in-depth restrictions against some classes of injected content. Absence of this header does not independently establish an XSS vulnerability.

**Recommended remediation**

- Design and deploy a Content Security Policy appropriate to the application's scripts, styles, APIs, and other resources.
- Prefer restrictive directives and nonces or hashes where feasible.
- Test the policy in report-only mode before enforcing it to identify compatibility issues.
- Perform separate input/output handling tests before claiming an XSS finding.

### Finding 4 — Strict-Transport-Security not observed in the local HTTP response

**Status:** Not assessed as a production vulnerability  
**Severity:** Not rated.

**Evidence**

The test was performed over local plain HTTP at `http://127.0.0.1:3000/`. The response did not include a `Strict-Transport-Security` header.

**Risk / impact**

HSTS is a browser policy for HTTPS. A plain HTTP local test cannot establish whether a production HTTPS deployment correctly enables HSTS. Therefore, this observation is not treated as a confirmed vulnerability.

**Recommended remediation**

For a real HTTPS deployment, enforce HTTPS and configure HSTS after validating all relevant subdomains and deployment requirements. Verify the header on the HTTPS origin.

## 4. Other observed headers

| Header | Observed value | Interpretation |
|---|---|---|
| `X-Content-Type-Options` | `nosniff` | Present; helps prevent MIME-type sniffing. |
| `X-Frame-Options` | `SAMEORIGIN` | Present; limits framing by other origins. |
| `Feature-Policy` | `payment 'self'` | Legacy policy header; evaluate modern `Permissions-Policy` support. |
| `X-Recruiting` | `/#/jobs` | Reveals a route hint; not a vulnerability by itself. |
| `Access-Control-Allow-Origin` | `*` | Requires endpoint-specific CORS review. |

## 5. Summary and limitations

The strongest confirmed observation in this initial assessment is the publicly accessible directory index under `/ftp/`. The other items are configuration observations whose security impact has not been established. Testing was limited to a local, intentionally vulnerable training application and read-only HTTP requests. No destructive actions were performed, and no sensitive file contents were included in this report.

## 6. General security recommendations

1. Disable directory listings and remove private files from web roots.
2. Apply least-privilege access controls to files and API endpoints.
3. Configure CORS narrowly, based on the actual business requirement.
4. Implement and test a suitable Content Security Policy.
5. Enforce HTTPS and validate HSTS on the HTTPS deployment.
6. Retest after remediation and retain request/response evidence.

## 7. Learning outcomes

- Captured HTTP response headers with `curl`.
- Identified the difference between an observed configuration and a confirmed vulnerability.
- Observed a public directory listing in a deliberately vulnerable application.
- Practiced documenting evidence, impact, severity uncertainty, and remediation without overstating results.
