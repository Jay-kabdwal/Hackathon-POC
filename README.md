# Curio Hackathon Portal

Curio is a full-stack hackathon management portal built with Next.js App
Router, TypeScript, PostgreSQL, Prisma ORM, Tailwind CSS, JWT sessions, OTP
authentication, and SMTP email delivery.

The portal provides:

- Public hackathon information and team registration.
- Admin management for teams, judges, settings, and result publication.
- Judge OTP authentication and assignment-protected score submission.
- Public results that respect the configured publication stage.

## Technology stack

- Next.js `16.4.3` with the App Router.
- React `19.3.0`.
- TypeScript with strict checking.
- Tailwind CSS v4 through the existing Turbopack integration.
- Prisma ORM `7.10.1`.
- PostgreSQL, including hosted providers such as Neon.
- `bcryptjs` for password and OTP hashing.
- `jsonwebtoken` for signed authentication tokens.
- Nodemailer with Gmail SMTP for email delivery.
- No external component or icon library. UI icons are inline SVG where used.

## Requirements

Install the following before starting:

- Node.js 20 or newer.
- npm.
- PostgreSQL 14 or newer, or a hosted PostgreSQL database.
- A Gmail account with an SMTP app password if registration and Judge OTP
  emails should be delivered.

Node and npm versions can be checked with:

```bash
node --version
npm --version
```

## Project structure

```text
app/
  api/                    API route handlers
  admin/                  Admin login and protected pages
  judge/                  Judge login, OTP, and protected pages
  details/                Public hackathon details
  register/               Public registration form
  results/                Public results page
  globals.css             Global Tailwind and portal styles
  layout.tsx              Root layout and metadata
  page.tsx                Public home page

src/
  components/             Shared public, Admin, and Judge components
  generated/prisma/       Generated Prisma Client (do not edit)
  lib/
    auth.ts               JWT, cookies, database sessions, cleanup
    email.ts              SMTP email utilities
    email-policy.ts       Optional exact email-domain policy
    prisma.ts             Shared Prisma Client

prisma/
  schema.prisma           Database schema
  migrations/             Database migrations
  seed.ts                 Super Admin seed script

prisma7.config.ts         Prisma 7 configuration
next.config.ts            Next.js configuration and security headers
package.json              Scripts and dependencies
```

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create the environment file

Create a local `.env` file in the project root. Never commit it to source
control.

Use the following structure and replace every placeholder:

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"

# Admin seed account
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="replace-with-a-password-at-least-8-characters"

# JWT session configuration
# Use a long random value in every environment.
JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES_IN="1d"

# Gmail SMTP
# SMTP_PASS should be a Gmail app password, not the normal account password.
SMTP_USER="notifications@example.com"
SMTP_PASS="replace-with-gmail-app-password"
EMAIL_FROM="notifications@example.com"

# Maximum score accepted by the judge score API.
# Defaults to 100 if omitted.
JUDGE_MAX_SCORE="100"

# Optional exact email-domain allowlist.
# It is currently disabled by the application because all valid email domains
# are accepted. Set this only when the domain restriction is re-enabled.
# ALLOWED_EMAIL_DOMAINS="company.com,subsidiary.com"
```

`DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` are required.
SMTP variables are required for email delivery, but registration can still
complete if confirmation email delivery fails; the API reports `emailSent:
false`.

Generate a strong JWT secret instead of using an example:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 3. Generate Prisma Client

```bash
npx prisma generate --config prisma7.config.ts
```

The generated client is written to `src/generated/prisma`.

### 4. Apply database migrations

For an existing database or a deployment environment:

```bash
npx prisma migrate deploy --config prisma7.config.ts
```

For a new local development database where you are creating additional
migrations:

```bash
npx prisma migrate dev --config prisma7.config.ts
```

Do not run `prisma migrate reset` against a shared or production database.

### 5. Seed the Admin account

```bash
npx prisma db seed --config prisma7.config.ts
```

The seed script creates the `SuperAdmin` record from `ADMIN_EMAIL` and
`ADMIN_PASSWORD`. It does not print or store the plaintext password.

### 6. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available commands

```bash
npm run dev                              # Start development server
npm run build                            # Create production build
npm run start                            # Start production server
npm run lint                             # Run ESLint
npx tsc --noEmit                         # Run TypeScript checking
npx prisma validate --config prisma7.config.ts
npx prisma generate --config prisma7.config.ts
npx prisma migrate deploy --config prisma7.config.ts
npx prisma db seed --config prisma7.config.ts
```

The project currently does not include an automated test script. Use lint,
TypeScript checking, build validation, and endpoint smoke tests before
deployment.

## Main URLs

### Public pages

| URL | Purpose |
| --- | --- |
| `/` | Hackathon landing page |
| `/details` | Hackathon information |
| `/register` | Team registration |
| `/results` | Published results |

### Admin pages

| URL | Purpose |
| --- | --- |
| `/admin/login` | Admin authentication |
| `/admin/dashboard` | Portal overview and metrics |
| `/admin/teams` | Team directory |
| `/admin/teams/:id` | Team details |
| `/admin/judges` | Add, activate, and deactivate judges |
| `/admin/settings` | Judging and result-stage settings |

### Judge pages

| URL | Purpose |
| --- | --- |
| `/judge/login` | Request Judge OTP |
| `/judge/verify-otp` | Verify the six-digit OTP |
| `/judge/dashboard` | View assigned teams |
| `/judge/teams/:id` | Submit IDEA or SOLUTION scores |

## API endpoints

### Public endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/register` | Create a team and 1–4 members |
| `GET` | `/api/results` | Read results according to publication stage |

### Admin endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/admin/login` | Authenticate the Super Admin |
| `POST` | `/api/admin/logout` | Delete the Admin session and clear cookie |
| `GET` | `/api/admin/dashboard` | Read dashboard metrics |
| `GET` | `/api/admin/teams` | Search and paginate teams |
| `GET` | `/api/admin/teams/:id` | Read team details |
| `GET`, `POST` | `/api/admin/judges` | List or create judges |
| `PATCH` | `/api/admin/judges/:id` | Activate or deactivate a judge |
| `GET`, `PATCH` | `/api/admin/settings` | Read or update hackathon settings |

### Judge endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/judge/login` | Request an OTP |
| `POST` | `/api/judge/verify-otp` | Verify OTP and create a Judge session |
| `POST` | `/api/judge/logout` | Delete the Judge session and clear cookie |
| `GET` | `/api/judge/teams` | List teams assigned to the Judge |
| `POST` | `/api/judge/scores` | Create or update an assigned team score |

## Functional requirements

### Team registration

- Accepts a team name and between one and four members.
- Requires exactly one team leader.
- Validates names, employee IDs, and email syntax.
- Prevents duplicate team names, member emails, and employee IDs.
- Generates a unique team number through the database.
- Creates the team and members atomically.
- Assigns new teams to active Judges atomically.
- Sends a confirmation email to the leader after the transaction commits.
- Returns `emailSent` so email failure does not undo successful registration.

### Admin management

- Uses the `SuperAdmin` model and bcrypt password verification.
- Creates a signed JWT with a unique session ID (`jti`).
- Stores the session in `AuthSession`.
- Uses an HTTP-only cookie named `admin_token`.
- Provides dashboard metrics, team lookup, Judge management, and settings.
- Protects pages and APIs independently on the server.

### Judge authentication and scoring

- Uses email OTP authentication instead of a password.
- Generates a cryptographically random six-digit OTP.
- Stores only a bcrypt hash of the OTP.
- OTPs expire after five minutes and are deleted after use, failure-limit
  exhaustion, replacement, or expiry cleanup.
- Rate-limits OTP requests and verification attempts.
- Creates a database-backed Judge session after successful verification.
- Only permits scores for teams assigned to the authenticated Judge.
- Supports `IDEA` and `SOLUTION` rounds.
- Validates integer scores from zero through `JUDGE_MAX_SCORE`.
- Uses an upsert to prevent duplicate score rows.

### Results

- `HIDDEN` exposes no rankings or scores.
- `IDEA_REVEALED` exposes IDEA totals.
- `FINAL_REVEALED` exposes IDEA, SOLUTION, and additive total scores.
- Includes registered teams even when scores are missing.
- Assigns equal ranks to equal totals.

## Non-functional requirements

### Security

- Authentication is checked server-side.
- Admin and Judge sessions are stored in the database.
- Logout deletes the corresponding session row and clears the cookie.
- Expired authentication sessions and OTP records are cleaned up.
- Cookies are HTTP-only and use `SameSite=Strict`.
- Cookies use `Secure` automatically in production.
- JWTs require `JWT_SECRET`, expiration, subject, role, and `jti` validation.
- Judge team and score access is assignment-authorized.
- Passwords and OTPs are bcrypt-hashed.
- Login and OTP responses avoid exposing account existence where applicable.
- Production responses include HSTS, clickjacking, MIME-sniffing, referrer,
  and permissions security headers.
- Secrets are server-only and must not use `NEXT_PUBLIC_` variables.

### Reliability and data integrity

- Team creation, member creation, and assignment creation use Prisma
  transactions.
- Unique database constraints remain the final protection against duplicates.
- Email delivery runs after successful database commits.
- API errors use explicit HTTP status codes and JSON messages.
- Loading, empty, success, and error states are shown in the UI.

### Accessibility and responsive behavior

- Forms use labels and browser-compatible autocomplete attributes.
- Interactive elements expose accessible names and keyboard focus styles.
- Admin and public layouts adapt to mobile, tablet, and desktop sizes.
- The Judge workspace uses a compact responsive header rather than a sidebar.
- Motion is reduced when `prefers-reduced-motion` is enabled.
- The animated public hero object is hidden on small screens to prevent text
  overlap.

### Maintainability

- The project uses a shared Prisma client.
- Authentication and email logic are centralized in `src/lib`.
- Shared Admin, Judge, and public UI components reduce duplication.
- No external component library is required.
- Prisma schema changes are tracked through migrations.

## Security and deployment checklist

Before deploying:

1. Replace every local placeholder secret.
2. Rotate any credentials that may have been exposed during development.
3. Use a unique high-entropy `JWT_SECRET`.
4. Use a Gmail app password or another dedicated SMTP credential.
5. Configure `DATABASE_URL` with TLS and least-privilege database access.
6. Set `NODE_ENV=production`.
7. Serve the application through HTTPS.
8. Apply migrations with `prisma migrate deploy`.
9. Seed the Admin account only with secure deployment variables.
10. Confirm that `.env` is ignored and not included in the repository.
11. Run lint, TypeScript checking, and a production build.
12. Test Admin logout, Judge logout, OTP expiry, and unauthorized API calls.

## Email-domain allowlist

Email-domain restriction is currently disabled. All syntactically valid email
domains are accepted.

The reusable policy is available in `src/lib/email-policy.ts`. If an
organization later requires domain restriction, configure:

```env
ALLOWED_EMAIL_DOMAINS=company.com,subsidiary.com
```

When enabled, domains are matched exactly. `person@sub.company.com` is not
accepted by `company.com` alone.

## Troubleshooting

### Prisma cannot connect

- Confirm `DATABASE_URL` is present and valid.
- Confirm the database is reachable from the current network.
- For hosted PostgreSQL, keep the provider's TLS query parameters.
- Run:

  ```bash
  npx prisma validate --config prisma7.config.ts
  npx prisma migrate deploy --config prisma7.config.ts
  ```

### Admin login fails

- Confirm `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `JWT_SECRET`.
- Confirm the Admin was seeded:

  ```bash
  npx prisma db seed --config prisma7.config.ts
  ```

- Ensure `ADMIN_PASSWORD` has at least eight characters.

### Emails are not sent

- Confirm `SMTP_USER`, `SMTP_PASS`, and `EMAIL_FROM`.
- Use a Gmail app password when Gmail two-factor authentication is enabled.
- Registration still succeeds when confirmation email delivery fails; inspect
  the API `emailSent` field and server logs.

### Judge OTP does not arrive

- Confirm the Judge exists and is active in the Admin portal.
- Confirm SMTP configuration.
- Request a new OTP; generating a new OTP deletes the previous one.
- OTPs expire after five minutes.

## License

This project is private internal software. Add a license before distributing
it outside the owning organization.
