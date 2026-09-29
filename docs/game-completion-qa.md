# Game completion verification

## Current automated coverage

`npm.cmd test` runs the same attempt and skip domain functions used by the room API:

- Wrong answer, correction, all eight preset levels, JSON reload between levels, final total 39/40.
- Pause/end/countdown/seat/session guards, completed-level resubmission rejection.
- Skip requires an attempt; pause/resume and skipping all eight levels reaches results with zero points.
- Receipt replay and request-payload conflict; draft parsing, order, and per-student/per-level keys.

These are domain tests, not browser tests or real Firestore concurrent transaction tests.

## Browser acceptance (pending)

Use a dedicated test room with one teacher and two separate student browser profiles.

1. Join by name/code and QR; pick distinct seats. Start the activity and wait for countdown.
2. Arrange tools, refresh, and confirm the same sequence returns for the same student and level. The other student must not inherit it.
3. Submit a wrong sequence, correct it, and continue through all eight levels. Check score, next-level button, last-level results and teacher total agree.
4. Repeat with a mix of passed/skipped levels, including skipping the final level. Reopening lab should show completion, not replay the final level.
5. Pause while editing, resume, and verify the sequence remains. End before completion and verify both lab and classroom offer results rather than waiting forever.
6. Drop an attempt response after the server commits (network test proxy). Resend the same request ID and payload; score and wrong-attempt count must change only once. Repeat concurrently against a test Firestore instance.
7. Go offline, refresh with previously loaded data, reconnect and verify room synchronization. Clear browser storage only in the disposable test profile and confirm the join recovery screen is usable.
8. Test touch drag, keyboard alternative controls, and every confirmation/success dialog on a narrow and short viewport.

## Storage and release notes

- Draft tool sequences are stored locally by room/student/level. They do not sync between devices and do not preserve arbitrary 3D coordinates. Clearing browser storage removes drafts and student sessions.
- An attempt ID is saved before sending. It remains after a timeout/network failure; retrying the same sequence reuses it. A confirmed result removes the pending local ID.
- Firestore stores private `rooms/{roomId}/attemptReceipts/{studentId}_{requestId}` documents. Receipt and score update commit atomically. This is application data; no existing room migration is needed.
- Deploy `firestore.rules` separately from Vercel. All client writes are denied; room reads remain enabled for the existing realtime listener. Student tokens, answer keys, profiles, rate-limit data and attempt receipts are accessible only through server Admin SDK operations.
- With Firebase CLI installed and an authorized account, deploy only rules: `firebase deploy --only firestore:rules --project chemlab-45006`.
- Git/Vercel deployment alone does not publish Firestore rules. Live rule deployment and browser/Firestore integration QA have not been verified in this session.
- Older open browser tabs must refresh to send the new required attempt request ID.

## Result history and hints

- Server clocks begin when the student opens a playable level. Refreshes do not reset them; teacher pause/end freezes them and resume countdown is excluded. Running-room time while a student is disconnected still counts.
- Completed and skipped levels store awarded score, submissions, mistakes, elapsed time and completion timestamp in resultsByLevel. Old records show a dash for missing saved score/time rather than inventing a history.
- Student results and teacher per-student details use the same summary mapping. CSV รายด่าน includes one row per student/level; CSV summary remains available.
- Preset feedback distinguishes ordering mistakes and uses progressively more specific conceptual hints after two wrong attempts. Legacy numbering is mapped; custom questions retain teacher-authored hints.
