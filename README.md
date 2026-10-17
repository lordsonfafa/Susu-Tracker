# Susu Tracker

A mobile app for running a family susu. The admin records each member's daily mobile money (MoMo) contribution, the app works out whose turn it is to be paid out, and it helps chase late payers over WhatsApp.

**Status:** working Android build in real use. Payments are recorded by hand today. Reading MoMo SMS automatically is the next big feature.

## Why I built this

My family runs a susu where every member contributes a fixed amount per slot each day. My little sister was the collector, and she kept forgetting who had paid and who hadn't. Tracking it in her head (and in scattered chats) led to missed payments and awkward follow-ups.

Every payment already generates a confirmation SMS on the collector's phone, so the long-term goal is an app that reads those messages, records who paid, and does the chasing. My mom also manages a susu with her friends, so the app supports several groups with different amounts per slot.

## What it does today

- **Multiple susus.** Create groups with their own slot amount and payout interval, switch between them from the menu, and rename them.
- **Members.** Add members with a name, a MoMo name (the name that appears on their mobile money payments), a phone number and a number of slots. Members can join late and then owe the days they missed.
- **Daily payments.** Record a member's payment for the next day they owe. Each day is complete only when every member who has joined has paid it.
- **Payout rounds.** A payout happens after every `payout_every_days` days. The day counter stays at the end of a round until the payout is recorded, and a payout can only be recorded once everyone has paid every day of the round, including arrears.
- **Payouts.** Choose who receives the pot. A member can be paid out once per slot.
- **Flagged payments.** Payments that need review (for example a payment without the "susu" reference) are held for the admin to Confirm or Dismiss. A badge in the menu shows how many are waiting.
- **Dashboard.** Home shows the current day, what has been collected today, who is still to pay, and how far behind the calendar the group is.
- **WhatsApp receipts and reminders.** After recording a payment, or from the "Remind" button on Home, the app opens WhatsApp with the message and number filled in. The admin taps Send.
- **Live updates.** Screens refresh when payments, members or payouts change (Supabase realtime).

## How the day logic works

- Day `d` is **complete** when every member with `joined_day <= d` has a matched payment with `day_number = d`.
- `completedDays` is the number of consecutive complete days from Day 1.
- A **round** is `payout_every_days` days long. Round `r` covers days `(r-1) * n + 1` to `r * n`, and the round number is the number of payouts recorded plus one.
- `currentDay = min(completedDays + 1, last day of the current round)`. The day moves into the next round only after that round's payout is recorded.
- A **payout is allowed** when every day of the round is complete and nobody has arrears.
- Payments for days beyond the current round are refused until the payout is recorded.
- The calendar day is computed separately from the group's start date and only drives the "days behind schedule" note.

The logic lives in `src/lib/susuStats.js` (`computeDayStats`) and is used through the `useSusuStats` hook.

## Tech stack

| Area | Tools |
| --- | --- |
| App | React Native with Expo (SDK 57), plain JavaScript |
| Navigation | React Navigation (bottom tabs inside a native stack) |
| Backend | Supabase (Postgres, Auth, Row Level Security, realtime) |
| Messaging | WhatsApp `wa.me` links (opened from the app) |
| Builds | EAS Build (Android APK) |

## Project structure

```
susu-tracker/
  App.js                  session check, GroupProvider, navigation
  src/
    app/                  screens (home, members, payments, payouts, member detail, add member, create group, group settings, login)
    components/           buttons, inputs, list cards, menu button
    context/GroupContext  active susu, remembered between launches
    hooks/                data hooks (stats, payouts, member detail, flagged count, active group)
    lib/                  supabase client, day and stats logic, groups, WhatsApp helpers, SMS parser (in progress)
    styles/               global styles and theme tokens
    db/schema.sql         initial database schema
```

## Running it locally

1. Install dependencies:
   ```bash
   cd susu-tracker
   npm install
   ```
2. Create a `.env` file in the `susu-tracker` folder:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   EXPO_PUBLIC_SUPABASE_KEY=YOUR-PUBLISHABLE-KEY
   ```
   Use the publishable (anon) key only. Never put a service-role key or a real password in an `EXPO_PUBLIC_` variable, because those values are bundled into the app.
3. Create the database tables with `src/db/schema.sql` (see below), then add a user under Supabase Authentication → Users.
4. Start the app:
   ```bash
   npx expo start
   ```
   Open it in Expo Go on a phone, or press `a` for an Android emulator.

## Database

`src/db/schema.sql` is the initial schema. The running app also expects these additions, which are not in that file yet:

- `members.joined_day` (integer, not null, default 1): the susu day a member joined.
- `payments.day_number` (integer): which susu day a payment counts for, with a unique index so each member has at most one matched payment per day.
- `payments.status` values used by the app: `matched`, `flagged`, `ignored`.
- `payouts` uses `date_paid`, and `members.phone_number` holds the phone number.

Row Level Security is enabled, but the current policies let any signed-in user read and write everything. Treat the app as an admin tool for trusted users only, and turn off public sign-ups in Supabase (Authentication → Sign In / Providers) so strangers cannot create accounts.

## Building an Android APK

```bash
npm install -g eas-cli        # or use npx eas-cli
eas login
eas build:configure
eas env:create --name EXPO_PUBLIC_SUPABASE_URL --value "..." --environment preview --visibility plaintext
eas env:create --name EXPO_PUBLIC_SUPABASE_KEY --value "..." --environment preview --visibility plaintext
eas build -p android --profile preview
```

Set `"android": { "buildType": "apk" }` on the `preview` profile in `eas.json` so the build produces an installable `.apk`. EAS environment variables are baked in at build time, so rebuild after changing them. Installing on iPhone outside Expo Go needs a paid Apple Developer account (TestFlight).

## Roadmap

- [x] Multiple groups, members, daily payments, payout rounds
- [x] Flagged payments review
- [x] WhatsApp receipts and reminders
- [x] Android build
- [ ] Read MoMo confirmation SMS automatically on the collector's Android phone (native module plus parser), with the manual flow as a fallback
- [ ] Automatic receipt and reminder SMS through an SMS provider
- [ ] Stricter Row Level Security policies per admin
- [ ] Part payments and paying several days at once
- [ ] iOS distribution

## Design decisions

- **Day completion, not the calendar, drives the susu.** A day only counts once everyone has paid it, and payouts follow the rounds. The calendar is only used to show how late the group is.
- **Payments are records, not flags.** "Paid" is derived from payment history, so a correction leaves a trail.
- **A review step for anything uncertain.** Payments that cannot be matched to a member and day go to a flagged list instead of being counted or dropped.
- **Manual first.** Recording by hand works on any phone, and the SMS reader will be added without removing it.

## License

See [LICENSE](susu-tracker/LICENSE).
