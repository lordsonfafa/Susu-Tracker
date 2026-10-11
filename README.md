# Suso-Tracker

A mobile app that automatically logs family susu contributions from mobile money (MoMo) SMS, sends receipts to contributors, and reminds members who haven't paid.

# Why I built this

My family runs a susu where every member contributes a fixed amount per slot each day. My little sister was the collector, and she kept forgetting who had paid and who hadn't. Tracking it in her head (and in scattered chats) led to missed payments and awkward follow-ups.

Every payment already generates a confirmation SMS on the collector's phone, so I built an app that reads those messages, records who paid, and does the chasing automatically. My mom also manages a susu with her friends, and the same app now tracks that group too, which pushed me to support multiple groups with different amounts per slot.

#What it does
-Detects payments automatically by reading incoming MoMo confirmation SMS on the collector's phone
-Logs who has paid and matches each payment to a member and their number of slots
-Sends a receipt SMS to the contributor as soon as their payment is recorded
-Reminds late payers with a scheduled SMS to anyone who hasn't paid by the cutoff time
-Dashboard showing who has paid today, who is pending, and the total collected
-Manual override for cash payments or messages that couldn't be read
-Multiple groups, each with its own members, slot amount, and schedule

#How it works
MoMo SMS arrives on collector's phone
        |
        v
Android SMS receiver (Kotlin native module)
        |
        v
Parser (TypeScript) -> amount, sender, phone, transaction ID
        |
        v
Match phone number to member -> save payment (Supabase / Postgres)
        |
        +--> send receipt SMS to the contributor
        |
        v
Scheduled job: members with no payment today -> reminder SMS

#Design decisions
-Idempotent logging: the transaction ID is unique, so the same SMS delivered twice never double-counts a payment.
Raw SMS stored with every payment, so parsing bugs can be fixed and past messages re-processed.

-Review queue: messages the parser can't read go to a "needs review" list instead of being silently dropped.
-Payments are records, not flags: "paid or pending" is derived from the payment history, so corrections leave an audit trail.
-Offline-first: payments are saved on the device first and synced when there is a connection.

#Tech stack
Area	Tools
-App	React Native (Expo), TypeScript
-SMS access	Small native Kotlin module (Android)
-Backend	Supabase (Postgres, scheduled jobs)
=SMS sending	Phone SIM or an SMS provider
=Testing	Jest
