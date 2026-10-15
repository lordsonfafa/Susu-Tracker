"""Generate fake test data for the Susu Tracker database.

Usage:  python3 make_test_data.py [YYYY-MM-DD]     (date defaults to today)

Writes groups.csv, members.csv, payments.csv and payments_review.csv.
Every name, phone number, and ID in here is made up.
"""
import csv
import datetime as dt
import random
import sys

today = dt.date.fromisoformat(sys.argv[1]) if len(sys.argv) > 1 else dt.date.today()
rng = random.Random(7)

GROUP_ID = "11111111-1111-4111-8111-111111111111"
SLOT_AMOUNT = 10

# key, name, momo_name (as it appears in the SMS), phone, slots
MEMBERS = [
    (1, "Kofi Mensah", "KOFI MENSAH", "0241000001", 2),
    (2, "Ama Serwaa", "AMA SERWAA", "0241000002", 1),
    (3, "Efua Owusu", "EFUA OWUSU", "0241000003", 1),
    (4, "Kwame Asante", "KWAME ASANTE", "0201000004", 1),  # pays from Telecel
    (5, "Akosua Boateng", "AKOSUA BOATENG", "0241000005", 1),
    (6, "Yaw Darko", "YAW DARKO", "0241000006", 1),
    (7, "Abena Pokua", "ABENA POKUA", "0241000007", 1),
    (8, "Kojo Frimpong", "KOJO FRIMPONG", "0241000008", 1),
    (9, "Esi Quaye", "ESI QUAYE", "0241000009", 1),
]


def member_id(key):
    return f"22222222-2222-4222-8222-{key:012d}"


members = [
    {"key": k, "id": member_id(k), "name": n, "momo": mn, "phone": ph, "slots": s}
    for k, n, mn, ph, s in MEMBERS
]
by_key = {m["key"]: m for m in members}

_tid = 0
_balance = 150.00
_cash = 0


def next_tid():
    global _tid
    _tid += 1
    return f"91999{_tid:06d}"


def timestamp(day):
    t = dt.datetime.combine(day, dt.time(rng.randint(7, 20), rng.randint(0, 59)))
    return f"{t:%Y-%m-%d %H:%M:00}+00"


def sms_text(amount, name, ref, tid):
    global _balance
    _balance += amount
    return (
        f"Payment received for GHS {amount:.2f} from {name}  "
        f"Current Balance: GHS {_balance:.2f} . Available Balance: GHS {_balance:.2f}. "
        f"Reference: {ref} . Transaction ID: {tid}. TRANSACTION FEE: 0.00"
    )


def row(day, m, amount, ref, source="automatic", status="matched", sender=None):
    """One payments row. m is a member dict, or None for an unmatched payment."""
    global _cash
    if source == "manual":
        _cash += 1
        tid, raw = f"CASH-{_cash:03d}", ""
    else:
        tid = next_tid()
        raw = sms_text(amount, sender or m["momo"], ref, tid)
    return {
        "group_id": GROUP_ID,
        "member_id": m["id"] if m else "",
        "amount": f"{amount:.2f}",
        "transaction_id": tid,
        "reference": ref,
        "source": source,
        "status": status,
        "raw_sms": raw,
        "date_received": day.isoformat(),
        "time_received": timestamp(day),
    }


def telecel_ref(m):
    return f"{m['momo']} ,233{m['phone'][1:]},B from VODAFONE"


payments = []

# Six fully paid days before today
for back in range(6, 0, -1):
    day = today - dt.timedelta(days=back)
    for m in members:
        due = m["slots"] * SLOT_AMOUNT
        ref = rng.choice(["susu", "susu", "Susu", "SUSU"])

        if (m["key"], back) in {(7, 3), (6, 5)}:  # paid cash, no SMS
            payments.append(row(day, m, due, "cash", source="manual"))
        elif m["key"] == 1 and back == 2:  # two separate payments in one day
            payments.append(row(day, m, 10, ref))
            payments.append(row(day, m, 10, ref))
        elif m["key"] == 4 and back != 1:  # cross-network, reference auto-filled
            payments.append(row(day, m, due, telecel_ref(m)))
        else:
            payments.append(row(day, m, due, ref))

# Today: partly paid
payments.append(row(today, by_key[1], 10, "susu"))            # Kofi owes 20, paid 10
payments.append(row(today, by_key[2], 10, "susu"))
payments.append(row(today, by_key[3], 10, "Susu"))
payments.append(row(today, by_key[4], 10, telecel_ref(by_key[4])))
payments.append(row(today, by_key[5], 10, "susu"))
payments.append(row(today, by_key[8], 10, "cash", source="manual"))

# Review queue and ignored rows (kept in a separate file)
review = [
    row(today, None, 15, "school fees", status="needs_review", sender="PAA KWESI TAGOE"),
    row(today, by_key[6], 13, "susu", status="needs_review"),  # not a multiple of 10
    row(today, None, 50, "birthday gift", status="ignored", sender="SERWAA AMOAH"),
]


def write(name, fields, data):
    with open(name, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(data)


write("groups.csv", ["id", "name", "slot_amount", "payout_every_days"],
      [{"id": GROUP_ID, "name": "Family Susu (Test)", "slot_amount": SLOT_AMOUNT,
        "payout_every_days": 2}])

write("members.csv", ["id", "group_id", "name", "momo_name", "phone_number", "slots"],
      [{"id": m["id"], "group_id": GROUP_ID, "name": m["name"], "momo_name": m["momo"],
        "phone_number": m["phone"], "slots": m["slots"]} for m in members])

PAY_FIELDS = ["group_id", "member_id", "amount", "transaction_id", "reference",
              "source", "status", "raw_sms", "date_received", "time_received"]
write("payments.csv", PAY_FIELDS, payments)
write("payments_review.csv", PAY_FIELDS, review)

print(f"Generated for {today}: {len(members)} members, "
      f"{len(payments)} payments, {len(review)} review rows")
