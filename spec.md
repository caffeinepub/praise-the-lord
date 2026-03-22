# Praise The Lord

## Current State
Admin panel is secured by code `JD@PTL2026` and Internet Identity login. The backend `access-control.mo` only grants admin to the FIRST caller who provides the correct token -- after that, `adminAssigned` is `true` and no one else can claim admin. This prevents the real admin from reclaiming access after a redeployment or device change.

## Requested Changes (Diff)

### Add
- Nothing new added

### Modify
- `access-control.mo`: Remove the `adminAssigned` guard so that any caller who provides the correct admin token can always claim admin (overwriting the previous admin). This fixes the "not authorized" issue permanently.
- `AdminPage.tsx`: Change the security code constant from `JD@PTL2026` to `PTL@ADMIN2026`.

### Remove
- The `adminAssigned` state flag behavior that blocks re-registration

## Implementation Plan
1. Modify `access-control.mo`: In the `initialize` function, allow any caller with the correct token to become admin (remove the `not state.adminAssigned` condition). If a caller provides the correct token, always set them as admin.
2. Update `AdminPage.tsx`: Change `ADMIN_CODE` constant to `PTL@ADMIN2026`.
3. Validate and deploy.
