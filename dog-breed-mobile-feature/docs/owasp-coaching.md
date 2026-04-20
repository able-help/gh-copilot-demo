# OWASP Coaching Notes

This feature is designed to reduce risk against the OWASP Top 10 and OWASP Mobile guidance.

## Architecture stance

- The mobile app is an untrusted client.
- Breed classification runs on a backend endpoint, not in the public mobile client.
- Dog CEO is used as a trusted-but-validated catalog source, not as a classifier.
- The client validates image metadata before upload and only talks to allowlisted endpoints.

## OWASP Top 10 mapping

### A01 Broken Access Control

- Do not call privileged model or storage endpoints directly from the app unless protected with user auth and backend authorization.
- Keep any cloud storage write permissions off-device when possible.

### A02 Cryptographic Failures

- Require HTTPS for production endpoints.
- Do not embed secrets, signing keys, or long-lived tokens in the app.
- Use platform secure storage for short-lived tokens if authentication is added.

### A03 Injection

- Sanitize file names and reject unexpected endpoint hosts.
- Treat all classifier responses as untrusted input and verify the breed against the Dog CEO catalog.
- Avoid building shell commands or SQL queries from breed strings.

### A04 Insecure Design

- Separate catalog lookup from image inference.
- Enforce max image size, dimension limits, MIME allowlists, and confidence thresholds.
- Plan rate limiting and abuse protection on the backend.

### A05 Security Misconfiguration

- Allow HTTP only for localhost development.
- Use explicit endpoint allowlists.
- Return generic client-facing errors and keep detailed diagnostics server-side.

### A06 Vulnerable and Outdated Components

- Pin dependencies and run regular dependency scanning.
- Review image-processing libraries closely because they often carry parsing risk.

### A07 Identification and Authentication Failures

- If uploads are user-specific, require authenticated API calls.
- Use backend-issued short-lived tokens for upload or detection workflows.

### A08 Software and Data Integrity Failures

- Sign mobile builds in CI.
- Protect your model endpoint from unauthorized model swaps or malicious deployment changes.
- Verify the server response schema before using it.

### A09 Security Logging and Monitoring Failures

- Log request IDs and error categories, not raw images or base64 payloads.
- Monitor detection failure rates, repeated upload abuse, and endpoint denials.

### A10 Server-Side Request Forgery

- Reject remote image URLs in the mobile feature and only allow local-device image URIs.
- Keep backend fetches constrained if the backend later supports remote URL ingestion.

## Practical code-review checklist

- Image MIME type is allowlisted.
- Image size and dimensions are bounded.
- Endpoint URL is HTTPS and host-allowlisted.
- No secrets are shipped in the app bundle.
- Classifier output is normalized and verified against Dog CEO data.
- Low-confidence results are rejected or clearly marked for user review.
- Logs avoid sensitive payloads.
- Tests cover malformed API responses and blocked inputs.
