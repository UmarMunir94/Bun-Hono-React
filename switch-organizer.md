# Organizer Transfer Feature

This plan outlines the steps to implement the "Organizer Transfer" feature, allowing an event creator to transfer their organizer status to another approved participant. The process requires the selected participant to accept the transfer before it takes effect.

## User Review Required

> [!WARNING]
> This feature requires database schema changes. I will add a new column to the `events` table to track the pending transfer. We will need to run database migrations after these changes. Please review this approach.

## Proposed Changes

### Database Schema Updates
Add a new column `pendingTransferUserId` to the `events` table.
- **backend/server/db/schema/events.ts**:
  #### [MODIFY] `events.ts`
  Add `pendingTransferUserId: text("pending_transfer_user_id")` to the `events` table.
  Update Zod schemas if necessary.

### API Routes
We need to create endpoints to handle the transfer lifecycle.
- **backend/server/routes/events.ts**:
  #### [MODIFY] `events.ts`
  - `POST /events/:id/transfer/propose`: Proposes a transfer to a specific participant (sets `pendingTransferUserId`). Only the current organizer can do this. Validates that the target user is an approved participant.
  - `POST /events/:id/transfer/accept`: Accepts the pending transfer. Only the `pendingTransferUserId` can do this. Changes `events.userId` to the new user, clears `pendingTransferUserId`.
  - `POST /events/:id/transfer/decline`: Declines the transfer. Only the `pendingTransferUserId` can do this. Clears the `pendingTransferUserId`.
  - `POST /events/:id/transfer/cancel`: Cancels the transfer proposal. Only the current organizer can do this. Clears the `pendingTransferUserId`.

### Frontend State & API
Update the React Query hooks and API calls to support the new endpoints.
- **frontend/src/lib/api.ts**:
  #### [MODIFY] `api.ts`
  Add functions: `proposeTransfer`, `acceptTransfer`, `declineTransfer`, `cancelTransfer`.

### Frontend UI (Event Details View)
Update the UI to allow proposing transfers, viewing pending transfers, and accepting/declining.
- **frontend/src/sections/events/view/event-details-view.tsx**:
  #### [MODIFY] `event-details-view.tsx`
  - **For the current organizer**:
    - In the attendee list, add a "Make Organizer" button next to approved active participants.
    - If a transfer is already pending, show "Cancel Transfer Request" next to that user's name.
    - Disable the "Leave Event" button for the current organizer.
  - **For the invited participant**:
    - Show an alert banner or buttons in the attendee list to "Accept" or "Decline" the organizer role transfer.
  - **Attendee List Updates**:
    - Continue showing the current organizer at the top.
    - If a transfer is completed, the roles will naturally switch based on `event.userId`.

## Verification Plan

### Automated Tests
- Type checking with `tsc` on both backend and frontend to ensure no type errors.

### Manual Verification
- Log in as the organizer, create an event, and approve a participant.
- Propose an organizer transfer to that participant.
- Log in as the participant and accept the transfer.
- Verify the participant is now the organizer, and the original organizer is a regular participant who can now leave the event.
