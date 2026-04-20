# Most Secure Photo Upload Pattern

The most secure upload pattern for a mobile app is:

1. capture or select a local image on device
2. validate the file locally before upload
3. send the image over HTTPS to your backend or to a short-lived backend-authorized upload target
4. perform scanning, normalization, and model inference on the backend
5. store as little as possible and keep retention short

## Best-practice architecture

### Option A: Upload directly to your backend

This is the safest default when the payload is small and the backend does inference or scanning immediately.

- The app sends multipart form-data to your API over HTTPS.
- The backend authenticates the user.
- The backend checks content type, file signature, size, image dimensions, and abuse limits.
- The backend runs malware scanning and model inference.
- The backend returns a minimal JSON result.

### Option B: Upload to object storage with a short-lived signed URL

Use this when images are large or when you need asynchronous processing.

- The app first requests a short-lived upload URL from your backend.
- The backend authenticates the user and limits allowed content type, size, and expiry.
- The app uploads directly to storage with that one-time or short-lived URL.
- The backend processes the object after upload and returns status separately.

This is secure only if the signed URL is tightly scoped and short-lived.

## What not to do

- Do not ship cloud storage write credentials in the app.
- Do not trust MIME type alone from the client.
- Do not accept remote image URLs from the client unless the backend has strict SSRF protections.
- Do not keep raw images longer than necessary.
- Do not log raw images, base64 payloads, or signed URLs.

## Client-side protections

- Allow only local-device URIs.
- Allowlist MIME types.
- Enforce max size and image dimension limits.
- Require HTTPS except for localhost development.
- Keep the endpoint host on an allowlist.
- Do not embed secrets in the app bundle.

## Backend protections

- Authenticate the caller.
- Authorize the upload scope.
- Rate limit per user and per device.
- Validate magic bytes, not just file extension and MIME type.
- Re-encode images if needed before downstream processing.
- Scan uploads before broader internal use.
- Store encrypted at rest.
- Set short retention and secure deletion policies.

## Recommended answer for this feature

For your dog-breed feature, the safest practical design is direct upload from the app to your backend over HTTPS, followed by backend validation, scanning, and inference. If volume grows later, move the transport step to short-lived signed uploads while keeping all authorization and inference control on the backend.

## References

- OWASP File Upload Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html
- OWASP Transport Layer Security Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html
- OWASP Mobile Application Security: https://owasp.org/www-project-mobile-top-10/
