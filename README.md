This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Team registration API

Configure these environment variables before starting the application:

```env
DATABASE_URL="postgresql://..."
SMTP_USER="yourgmail@gmail.com"
SMTP_PASS="your-google-app-password"
EMAIL_FROM="yourgmail@gmail.com"
```

Send a `POST` request to `/api/register` with one to four members and exactly
one leader:

```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "teamName": "Team Alpha",
    "members": [
      {
        "name": "Ada Lovelace",
        "email": "ada@example.com",
        "employeeId": "EMP001",
        "isLeader": true
      }
    ]
  }'
```

Successful registrations return HTTP `201` with the generated `teamNumber` and
an `emailSent` boolean. Invalid requests return `400`; duplicate team names,
emails, or employee IDs return `409`. Email delivery failures do not undo a
successful registration and return `emailSent: false`.

Email is sent through Gmail SMTP using Nodemailer. `SMTP_PASS` must be a
Google App Password, not your normal Google account password.

## Admin authentication API

Configure these additional environment variables:

```env
JWT_SECRET="use-a-long-random-secret"
JWT_EXPIRES_IN="1d"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="use-a-password-at-least-8-characters-long"
JUDGE_MAX_SCORE="100"
```

`JWT_EXPIRES_IN` accepts a number followed by `s`, `m`, `h`, `d`, or `w`, such
as `15m` or `7d`. The default is `1d`.

Log in with:

```bash
curl -i -c cookies.txt -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your-password"}'
```

The successful response sets an HTTP-only `admin_token` cookie. Invalid
credentials return `401`; malformed input returns `400`. Clear the cookie with:

```bash
curl -i -b cookies.txt -c cookies.txt -X POST http://localhost:3000/api/admin/logout
```

Admin and judge JWTs are backed by the `AuthSession` table. Logout revokes the
server-side session as well as clearing the HTTP-only cookie, so a copied token
cannot continue to access protected APIs after logout.

Judge access is assignment-backed through `JudgeTeamAssignment`. Existing
judges and teams are assigned during the security migration, and new judges or
teams receive assignments transactionally. Both the judge team list and score
submission endpoint verify the assignment on the server.

To create or update the seeded super admin, set `ADMIN_EMAIL` and
`ADMIN_PASSWORD` and run:

```bash
npx prisma db seed
```

`JUDGE_MAX_SCORE` controls the inclusive maximum accepted score for judge
submissions and defaults to `100`.

### Gmail SMTP setup

1. Enable 2-Step Verification for the Gmail account.
2. Generate a Google App Password if the account supports App Passwords.
3. Put `SMTP_USER`, `SMTP_PASS`, and `EMAIL_FROM` in the local `.env` file.
4. Keep `.env` out of source control; this project ignores `.env*`.
5. Restart the Next.js development server after changing environment variables.

The SMTP utility reports safe error details such as the SMTP error name, code,
response code, and command. It never logs credentials or OTP values. A
successful SMTP submission means Gmail accepted the message for processing; it
does not guarantee inbox delivery.

Test team registration:

```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "teamName": "Team Alpha",
    "members": [{
      "name": "Ada Lovelace",
      "email": "recipient@example.com",
      "employeeId": "EMP001",
      "isLeader": true
    }]
  }'
```

Test judge OTP email:

```bash
curl -X POST http://localhost:3000/api/judge/login \
  -H "Content-Type: application/json" \
  -d '{"email":"judge@example.com"}'
```

If SMTP authentication fails, verify that 2-Step Verification is enabled and
that `SMTP_PASS` is a Google App Password. If the account does not offer App
Passwords, Gmail SMTP password authentication cannot be used with this setup;
do not use the normal account password.

## Results API

`GET /api/results` is public and uses `HackathonSettings.resultStage`.

```bash
curl http://localhost:3000/api/results
```

When the stage is `HIDDEN`, the response contains no scores:

```json
{
  "success": true,
  "message": "Results have not been released yet.",
  "data": {
    "resultStage": "HIDDEN",
    "released": false,
    "results": []
  }
}
```

At `IDEA_REVEALED`, each registered team is returned with its IDEA total.
Missing scores count as zero. At `FINAL_REVEALED`, `totalScore` is the sum of
the IDEA and SOLUTION totals because the project has no other final-scoring
rule. Equal totals receive the same rank; team number is used only as a
deterministic display order for ties.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
