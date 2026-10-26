# OSTHAR TOP UP

A React/TypeScript gaming storefront backed by Supabase Auth, PostgreSQL and private receipt storage. All currency amounts are LKR. Products and legal/payment content currently include editable samples.

## What's implemented

- Responsive home, searchable/filterable store, product details and persisted cart.
- Email/password login, registration, email confirmation/OTP entry, password recovery and OAuth entry points.
- Protected wallet, top-up requests, paginated ledger, individual printable receipts, orders, order details and profile.
- Server-side Singapore Free Fire player verification, re-verification at checkout, atomic wallet debits and product snapshots, grouped cart orders and pending-order refunds.
- Checkout request deduplication: repeating a mounted checkout's request ID does not charge twice. The client does not set balances or prices on the server.
- Independent admin password/session flow and responsive workspace: exact dashboard aggregates, paginated records, catalog/slide CRUD, order status and notes, top-up approval/rejection, manual adjustments, settings, activity and notification retry management.
- Persistent notification outbox, Discord notifications and role-restricted signed processing/completion buttons, plus completion emails.
- RLS on application tables, own-record read policies, service-only monetary RPCs, append-only wallet ledger and private receipt uploads. There is no shared customer-accessible admin password or service key in frontend code.

## Required launch configuration

Do not accept live payments until this checklist is complete. External service credentials are not configured by sample content.

### Server secrets

In **Supabase → Project → Edge Functions → Manage Secrets**, configure:

| Secret | Purpose |
| --- | --- |
| `ADMIN_PASSWORD` | Strong, unique admin password, at least 12 characters. Never use a customer password. |
| `PLAYER_API_URL` | Your trusted HTTPS player API endpoint. The backend appends `uid` and `region=sg`. |
| `DISCORD_WEBHOOK_URL` | Discord incoming webhook for plain order notifications (if not using bot mode). |
| `DISCORD_BOT_TOKEN` | Bot authentication for interactive order notifications. |
| `DISCORD_CHANNEL_ID` | Private administrator channel receiving bot messages. |
| `DISCORD_PUBLIC_KEY` | Discord application's public Ed25519 verification key. |
| `DISCORD_GUILD_ID` | Allowed Discord server for interactions. |
| `DISCORD_ADMIN_ROLE_ID` | Required role for processing/completion actions. |
| `RESEND_API_KEY` | Completion email provider credential. |
| `EMAIL_FROM` | Sender address on your verified email domain. |

Supabase provides the backend's `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`; keep these server-side. Do not enter service secrets in Site Settings (which are public).

### Player API contract

A valid response must supply a nonempty nickname (supported keys: `nickname`, `player_name`, `name`, `data.nickname`, or `AccountInfo.AccountName`) and a confirmed region (`region`, `server`, or `data.region`) equal to `sg` or `Singapore`, case-insensitively. Example:

```json
{"nickname":"ExamplePlayer","region":"sg"}
```

Unknown players or wrong regions must not return a valid Singapore response. The application intentionally refuses checkout when the service is absent, fails, or cannot establish the server. Only Free Fire Singapore products can currently be fulfilled through this verification integration; other games require a matching backend adapter before becoming purchasable.

### Authentication

- In Supabase Auth URL Configuration, allow the preview and production origins with `/auth/callback` and `/reset-password` paths. The app always supplies absolute origin-specific redirect URLs.
- Configure Google, Facebook, Microsoft/Azure and Apple in Supabase Auth before enabling those services for real sign-ins. Provider buttons report service errors rather than faking authentication.
- Configure production SMTP and review Supabase email rate limits. For registration OTP entry, include `{{ .Token }}` in the confirmation email template; confirmation links are also supported. Respect the requested redirect URL in custom templates.
- Verify registration, confirmation, OAuth return, recovery and logout with real test accounts on the production domain.

### Admin and site content

Visit `/admin` after setting `ADMIN_PASSWORD`. The separate admin session is hashed server-side, stored in browser session storage and expires after eight hours; customer sign-in never grants admin access.

1. Replace sample catalog names, prices and artwork as needed. Singapore is the supported server.
2. Enter actual eZ Cash/bank account details, minimum amounts and instructions in Payment Settings. Only enable a method after independently verifying its details. Both are disabled by default.
3. Set support WhatsApp/email, logo/favicon, hero copy, announcements and final terms/privacy/refund policies in Site Settings. Keep currency as LKR.
4. Review stock, processing estimates and support availability. Game delivery remains a human administrative fulfillment step, not an automated publisher integration.
5. Test a real low-value payment reference, private receipt, approval, order, delivery, completion email and cancellation/refund before public launch.

### Discord setup

For interactive messages, use bot mode (`DISCORD_BOT_TOKEN` and `DISCORD_CHANNEL_ID`) with the necessary channel permissions. Register this interactions endpoint in the Discord application:

`https://rmbzupzjajcwkwmhykfk.supabase.co/functions/v1/discordInteractions`

The endpoint verifies Discord request signatures, freshness, configured server and admin role. Buttons update only their associated order. Cancellations require a reason and remain in the admin panel. Plain webhook mode sends notifications without action buttons. Use a private channel because notifications contain player details.

### Notification recovery

Notification failures do not roll back successful orders or completion status. They remain in `notification_outbox` and are visible under Admin → Notifications. Configure the missing service and use **Retry pending** to retry a batch of up to 100 pending events. There is no automatic scheduled retry worker in this version; an administrator must monitor failures. Emails use provider idempotency keys; Discord messages may be repeated after an uncertain delivery failure.

## Verification performed

- Project-wide TypeScript checking.
- Production build (see the current implementation report for its result).
- A rollback-only database verification tested account initialization, atomic checkout debit, repeated-request deduplication, insufficient balance rejection, cancellation refund, rejection of repeated cancellation/approval, editable approved amount, immutable ledger and transaction arithmetic. Temporary test accounts, orders, credits and notifications were rolled back.

External OAuth, player API, payment, Discord and email end-to-end tests require the real configuration above. A successful build is not a substitute for those live acceptance tests.
