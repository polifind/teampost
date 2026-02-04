# TeamPost QA Checklist

Manual testing checklist before deploying to production. Run through these tests after significant changes.

## Quick Smoke Test (5 min)
- [ ] App loads at localhost:3000
- [ ] Can log in with Google OAuth
- [ ] Dashboard displays without errors
- [ ] Navigation links all work
- [ ] Can create a new post

---

## Authentication (10 min)

### Google OAuth
- [ ] Click "Sign in with Google" → redirects to Google
- [ ] Complete Google auth → redirects back to app
- [ ] User session is created
- [ ] User appears in database

### LinkedIn OAuth (for posting)
- [ ] Go to Settings → Connect LinkedIn
- [ ] Complete LinkedIn auth → redirects back
- [ ] LinkedIn token stored in user record
- [ ] Token expiry is in the future

### Session Management
- [ ] Refresh page → stays logged in
- [ ] Click logout → session cleared
- [ ] Access dashboard when logged out → redirects to login

---

## Posts Management (15 min)

### Viewing Posts
- [ ] Posts page loads with all user's posts
- [ ] Tabs work: All, Drafts, Scheduled, Posted
- [ ] Post cards display content correctly
- [ ] Long posts show "Read more" to expand
- [ ] Post count badge accurate

### Creating Posts
- [ ] "New Draft" button works
- [ ] Can type content in editor
- [ ] Can add photo to post
- [ ] Save as draft works
- [ ] Draft appears in Drafts tab

### Editing Posts
- [ ] Click edit on post → edit mode activates
- [ ] Can modify text content
- [ ] Can change/remove photo
- [ ] Save changes works
- [ ] Cancel discards changes

### Scheduling Posts
- [ ] Schedule button opens date/time picker
- [ ] Can select future date and time
- [ ] Timezone displayed correctly
- [ ] After scheduling, post moves to Scheduled tab
- [ ] Scheduled time shows correctly

### Bulk Scheduling
- [ ] "Schedule All Drafts" button visible when drafts exist
- [ ] Opens modal with day/time selection
- [ ] Selecting days and times works
- [ ] Confirm schedules all drafts
- [ ] All drafts move to Scheduled tab

### Deleting Posts
- [ ] Delete button shows confirmation
- [ ] Confirm deletes the post
- [ ] Post removed from list

### Publishing Posts
- [ ] "Post Now" button works (requires LinkedIn connected)
- [ ] Post publishes to LinkedIn
- [ ] Post moves to Posted tab
- [ ] Posted timestamp recorded

---

## Magic Drafts (10 min)

### Library Management
- [ ] Magic Drafts page loads
- [ ] Can add URL to library
- [ ] Can upload PDF file
- [ ] Can upload image (LinkedIn screenshot)
- [ ] Processing status shows for new items
- [ ] Completed items show summary

### Generating Drafts
- [ ] "Generate Draft" button works
- [ ] Can select library items for context
- [ ] Generation produces a post
- [ ] Generated post can be saved as draft

### Library Item Actions
- [ ] Can delete library items
- [ ] Items persist after page refresh

---

## Settings (10 min)

### Profile Settings
- [ ] Name displays correctly
- [ ] Email displays correctly
- [ ] Can update name
- [ ] Changes persist after refresh

### LinkedIn Connection
- [ ] Shows connection status
- [ ] Can connect/reconnect LinkedIn
- [ ] Shows token expiry info
- [ ] Can disconnect LinkedIn

### Slack Connection
- [ ] Shows connection status
- [ ] "Add to Slack" button works
- [ ] Completes OAuth flow
- [ ] Can disconnect Slack

### Timezone Settings
- [ ] Current timezone displays
- [ ] Can change timezone
- [ ] Change persists after refresh
- [ ] Affects scheduled post times

### Writing Guidelines
- [ ] Can add/edit guidelines
- [ ] Guidelines save correctly
- [ ] Guidelines affect AI generation

---

## Slack Bot (15 min)

### Setup
- [ ] User has Slack connected in Settings

### Basic Messaging
- [ ] DM the bot with bullet points
- [ ] Bot responds with generating message
- [ ] Bot returns generated post with Approve/Regenerate buttons

### Photo Upload
- [ ] Send photo in DM
- [ ] Bot acknowledges photo received
- [ ] Photo saved to user's library
- [ ] Can use photo in generated posts

### Scheduling via Slack
- [ ] DM: "monday at 9am: [bullet points]"
- [ ] Bot generates post
- [ ] Approve button includes scheduled time
- [ ] Post appears in Scheduled tab at correct time

### Approve/Regenerate Actions
- [ ] Click Approve → post saved/scheduled
- [ ] Click Regenerate → new version generated
- [ ] Approve with scheduling → correct time set

### Error Handling
- [ ] Bot responds to empty messages appropriately
- [ ] Bot handles invalid scheduling times
- [ ] Long messages truncated correctly

---

## Navigation & UI (5 min)

### Navigation
- [ ] Dashboard link works, highlights when active
- [ ] Posts link works, highlights when active
- [ ] Magic Drafts link works, highlights when active
- [ ] Settings link works, highlights when active
- [ ] Logo links to dashboard

### Responsive Design
- [ ] Desktop layout looks correct
- [ ] Mobile layout usable
- [ ] Navigation accessible on mobile

### Loading States
- [ ] Loading indicators show during API calls
- [ ] No flickering/layout shifts
- [ ] Error states display appropriately

---

## Security Checks (5 min)

### Authorization
- [ ] Cannot access other users' posts
- [ ] Cannot access other users' library items
- [ ] API routes return 401 when not authenticated

### Data Isolation
- [ ] Posts filtered by logged-in user
- [ ] Library items filtered by user
- [ ] Slack integration scoped to user

---

## Performance (5 min)

- [ ] Dashboard loads in < 2 seconds
- [ ] Posts page loads in < 2 seconds
- [ ] No console errors in browser
- [ ] No memory leaks during navigation

---

## Pre-Production Checklist

Before merging to main:
- [ ] All automated tests pass (`npm run test:run`)
- [ ] Build succeeds (`npm run build`)
- [ ] QA script passes (`npm run qa`)
- [ ] Manual smoke test completed
- [ ] No console errors in production build

---

## Issue Template

If you find a bug during QA:

```
### Bug Description
[What happened]

### Expected Behavior
[What should happen]

### Steps to Reproduce
1.
2.
3.

### Browser/Device
[e.g., Chrome 120, macOS]

### Screenshots
[If applicable]

### Severity
- [ ] Critical (blocks usage)
- [ ] High (major feature broken)
- [ ] Medium (workaround exists)
- [ ] Low (cosmetic/minor)
```
