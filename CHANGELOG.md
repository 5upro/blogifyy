# Changelog

All notable changes to Blogify are recorded here. New entries go at the top, grouped under a version heading.

## 1.1.0 - 2026-09-26

The premium tier, post privacy, view analytics, and a rebuilt public reading experience.

### Added

**Premium subscriptions with Razorpay**
- Free and Pro plans (monthly and yearly) defined once in a shared plan catalog on the server
- Checkout flow that creates an order, opens Razorpay's hosted checkout, and verifies the payment signature before anything is granted
- Prices are always read from the server-side catalog, so the amount a client asks for is never trusted
- Replayed payment callbacks are recognised and ignored instead of granting a second subscription
- Subscription management: view current plan, upgrade, and cancel while keeping Pro active until the period already paid for ends
- Order records kept for every payment attempt, including failures, so payments can be reconciled later

**What Pro unlocks**
- Unlimited posts, where the Free plan is capped at 10
- Featured image on any post
- Private posts that stay unlisted
- A custom accent theme applied to the author's profile and posts
- A Pro badge shown next to the author's name

**Post privacy**
- Every post has a public or private visibility, and the author can change it after publishing without editing the post
- Private posts return a not found response for everyone except the author and administrators, so the link never confirms the post exists
- Private posts are removed from the public archive but stay readable by their author

**View analytics**
- A per-post view counter that increments when a public post is opened
- The author's own reads and admin reads are excluded, so a count reflects actual readers
- View analytics are a Pro feature and are visible only to the post's author
- Analytics are refused for posts you do not own, and the Pro check runs first so a non-subscriber cannot probe for post existence

**Public reading experience**
- Posts are reachable by a readable slug at a public URL, with no account required
- Older links that use a post id still resolve and are redirected to the slug
- The landing page now shows the latest published posts as sample cards
- Loading, empty, and error states for that section, so a slow or failing API never leaves a blank block on the page

**Account badges**
- A dedicated flag marks accounts affiliated with Blogify, shown as a verified badge on cards, post pages, and profile popups
- Affiliation is independent of the administrator role, so granting admin no longer implies the badge and vice versa

**Account recovery**
- Signing in with correct credentials on an unverified account sends a fresh verification code instead of only returning an error
- A short cooldown prevents that resend from being used to flood an inbox
- The sign-in page detects an unverified account and offers the code entry form, so a missed code no longer dead-ends the flow

**Razorpay without live keys**
- A demo mode flag simulates the payment step so the whole upgrade flow can be exercised before a key secret exists. The server ignores the flag when running in production, so it cannot be enabled on a live deployment
- The checkout modal reports whether Razorpay's script actually loaded, which distinguishes a code fault from a blocked network or extension
- A development-only button opens Razorpay's real checkout sheet for previewing the payment UI. It grants nothing and cannot appear in a production build

**Subscription status is now separate from entitlements**
- Cancelling a subscription no longer makes the account advertise itself as an active Pro subscriber
- A cancelled subscriber keeps every paid feature until the period they paid for ends, but the Pro badge and the active-plan banner are withdrawn immediately
- Previously one flag drove both, so a cancelled user was still badged as Pro

**Cancellation feedback**
- The pricing page now reflects a cancelled subscription instead of continuing to show an active plan
- Cancelling an already cancelled subscription says so plainly rather than repeating the same message

**Developer tooling**
- Script to backfill metadata onto posts created before slugs and visibility existed
- Script to grant or revoke role, plan, accent, verification, and affiliation for a test account
- Environment-driven captcha configuration, with the challenge skipped outside production builds

### Changed
- The API base URL is read from the environment instead of being hardcoded, so local and deployed builds no longer need a code edit
- The API client separates authenticated and public requests, so public reads never send a token
- The affiliate badge no longer keys off the administrator role
- Password reset, verification, and welcome emails share one code path
- Profile responses now include plan, accent, and entitlement details, so the interface can gate features without guessing

### Fixed
- Posts created before the visibility field existed were missing from the public archive, because a query filtered on a value the stored documents did not have
- The captcha widget was configured with a misspelled prop, so the deployed site silently ran on a fallback key
- Cancelling a subscription appeared to do nothing, because the page only checked whether the account was Pro and ignored the cancelled status
- The Razorpay preview sheet closed immediately with an error, caused by passing an order id that does not exist on Razorpay's servers
- The privacy policy predated subscriptions, payments, view counts, and the affiliated badge, and has been brought up to date
- A stray unstyled line on the registration page was removed

### Notes for reviewers
- View counting is deliberately naive. It counts requests, so it will overcount if a reader refreshes. A more honest counter needs deduplication, which was not worth the complexity at this stage.
- Both accounts in the development database are administrators, which is why an admin can open any post including private ones. This is intentional and matches the existing moderation tools.
- A private post is not listed anywhere for its author. If that becomes a problem, the next step is a page listing your own posts, including private and draft ones.
- Real payments still need a Razorpay key secret. The key id alone cannot create an order, so demo mode covers local testing and a secret covers production.
- Restarting Pro from a cancelled subscription is not wired up. The pricing page shows the button, but a cancelled subscriber with unexpired Pro is correctly refused a new purchase.
