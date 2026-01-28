# TeamPost QA Checklist

## Pre-Deployment Automated Checks

Run before every deployment:

```bash
npm run test:run    # Run all unit tests
npm run build       # Verify build succeeds
```

Or run all checks at once:
```bash
npm run predeploy
```

---

## Manual QA Checklist

### Authentication (CRITICAL)

- [ ] **Signup Flow**
  - [ ] Can create new account with email/password
  - [ ] Validation errors show for missing fields
  - [ ] Password is properly hashed (check DB)
  - [ ] Duplicate email is rejected
  - [ ] User is redirected to dashboard after signup

- [ ] **Login Flow**
  - [ ] Can login with existing email/password
  - [ ] Invalid credentials show error message
  - [ ] User is redirected to dashboard after login
  - [ ] "Remember me" functionality works (if applicable)

- [ ] **OAuth Login**
  - [ ] Google OAuth login works
  - [ ] LinkedIn OAuth login works (if configured)
  - [ ] New user created when using OAuth for first time
  - [ ] Existing user can link OAuth account
  - [ ] OAuthAccountNotLinked error is handled gracefully

- [ ] **Session Management**
  - [ ] Session persists across page reloads
  - [ ] Session expires correctly
  - [ ] Logout works and clears session

- [ ] **Protected Routes**
  - [ ] /dashboard redirects to /login when not authenticated
  - [ ] /create redirects to /login when not authenticated
  - [ ] /posts redirects to /login when not authenticated
  - [ ] /settings redirects to /login when not authenticated
  - [ ] /schedule redirects to /login when not authenticated

### Dashboard

- [ ] **Stats Display**
  - [ ] Total posts count is accurate
  - [ ] Scheduled posts count is accurate
  - [ ] Posted count is accurate
  - [ ] LinkedIn connection status is correct

- [ ] **Action Cards**
  - [ ] "Create a LinkedIn Post" CTA works
  - [ ] "Prefer guided questions?" card shows when onboarding not completed
  - [ ] View Posts, Schedule Posts, Record More cards show when onboarding completed
  - [ ] All card links navigate correctly

- [ ] **Personalize Ghostwriter Section**
  - [ ] Guidelines tab: Can add new guideline
  - [ ] Guidelines tab: Can edit existing guideline
  - [ ] Guidelines tab: Can delete guideline
  - [ ] Library tab: Can add URL
  - [ ] Library tab: YouTube URLs detected correctly
  - [ ] Library tab: Can upload PDF
  - [ ] Library tab: Can upload DOCX
  - [ ] Library tab: Processing status shows correctly
  - [ ] Library tab: Can delete items
  - [ ] Photos tab: Can upload photos
  - [ ] Photos tab: Can delete photos
  - [ ] LinkedIn profile upload modal works

### Create Post Page

- [ ] **Conversation Flow**
  - [ ] Initial greeting appears
  - [ ] Can send messages
  - [ ] AI responses appear
  - [ ] Progress indicator updates correctly
  - [ ] Draft is generated after sufficient conversation

- [ ] **Draft Management**
  - [ ] Draft preview shows correctly
  - [ ] Can edit draft
  - [ ] Can regenerate draft
  - [ ] Can add/remove image from draft
  - [ ] Can select from photo library

- [ ] **Scheduling**
  - [ ] Date picker works
  - [ ] Time picker works
  - [ ] "Approve & Schedule" creates scheduled post
  - [ ] Success message shows
  - [ ] Paywall appears when limit reached (free users)

- [ ] **Magic Draft** (if library items exist)
  - [ ] Magic Draft button appears in sidebar
  - [ ] Modal opens with library items
  - [ ] Can select specific items
  - [ ] Generate creates draft from library content

- [ ] **Sidebar**
  - [ ] New Post button works
  - [ ] Saved conversations list shows
  - [ ] Can load previous conversation
  - [ ] Can delete conversation
  - [ ] Sidebar toggle works

### Posts Page

- [ ] Posts list displays correctly
- [ ] Can view post details
- [ ] Can delete posts
- [ ] Pagination works (if applicable)

### Schedule Page

- [ ] Scheduled posts display
- [ ] Can view scheduled post details
- [ ] Can cancel scheduled post
- [ ] Schedule calendar/list view works

### Settings Page

- [ ] Can update user preferences
- [ ] LinkedIn connection/disconnection works
- [ ] Subscription status shows
- [ ] Can manage subscription

### API Endpoints

Test each critical API endpoint:

- [ ] `GET /api/dashboard` - Returns dashboard data
- [ ] `GET /api/posts` - Returns user's posts
- [ ] `POST /api/posts` - Creates new post
- [ ] `POST /api/conversation/respond` - AI conversation
- [ ] `GET /api/personalization/guidelines` - Returns guidelines
- [ ] `POST /api/personalization/guidelines` - Creates guideline
- [ ] `GET /api/personalization/library` - Returns library items
- [ ] `POST /api/personalization/library` - Adds library item
- [ ] `POST /api/posts/magic-draft` - Generates magic draft
- [ ] `POST /api/schedule/next` - Schedules post

### Security

- [ ] All API routes check authentication
- [ ] Users can only access their own data
- [ ] No sensitive data exposed in responses
- [ ] CSRF protection working
- [ ] Rate limiting working (if configured)

---

## Test Accounts

For testing, use these accounts:
- Free user: (create test account without subscription)
- Paid user: (create test account with active subscription)
- Admin user: (if applicable)

---

## Regression Testing

After any significant change, verify these core flows:

1. New user signup → dashboard → create post → schedule
2. Existing user login → view posts → edit post
3. OAuth signup/login flow
4. Subscription upgrade/downgrade (if applicable)

---

## Browser Testing

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome (iOS/Android)
- [ ] Mobile Safari

---

## Deployment Verification

After deploying:

1. [ ] Site loads at production URL
2. [ ] Can complete login flow
3. [ ] Dashboard loads with data
4. [ ] Create post flow works
5. [ ] No console errors
6. [ ] API calls succeed (check Network tab)
