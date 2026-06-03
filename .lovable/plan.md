## What I found

The hosted backend is healthy, but the registration flow can still wait forever because the app relies on client-side profile reads immediately after signup. The database trigger for auto-creating profiles exists, but the app has no timeout-safe profile creation fallback if the trigger/session timing is delayed.

## Plan

1. **Make registration deterministic**
   - After signup, wait briefly for a valid user session.
   - If the profile is not found, create/update the current user's profile from the app instead of waiting forever.
   - Always stop the loading state and show a real error if auth/profile creation fails.

2. **Split the flow cleanly**
   - Signup/login succeeds → move to character creation.
   - Character creation saves name/colors/clothes → immediately enters the game.
   - Existing users who log in should go straight into the game if their profile already has a character.

3. **Fix the root game handoff**
   - Ensure `onCreated(profile)` updates the main page profile state, coins, XP, and advances the game screen instead of leaving the auth overlay stuck.

4. **Add safe profile helper behavior**
   - Add a helper that gets the authenticated user with `getUser()`.
   - Add an `ensureCurrentProfile()` path that uses the authenticated user id and respects existing RLS policies.

5. **Verify with runtime signals**
   - Check the auth/profile queries and console after changes.
   - Confirm the loading button cannot remain stuck indefinitely.