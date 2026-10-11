const text =
  "Payment received for GHS 200.05 from ADWOA YEBOA ASUAH  Current Balance: GHS 623.24 . Available Balance: GHS 623.24. Reference: Loan fafa . Transaction ID: 91334543031. TRANSACTION FEE: 0.00";

function grab(text, regex) {
  const m = text.match(regex);
  return m ? m[1].trim() : null;
}

export function parseSms(sms) {
  if (!/^\s*payment received/i.test(sms)) return null; // not a payment: ignore

  const amountRaw = grab(sms, /GHS\s?([0-9]+(?:\.[0-9]{2})?)/i);
  const transactionId = grab(sms, /transaction\sid:\s*([0-9]+)\s?\./i);
  const reference = grab(sms, /reference\s*:\s*([\w\s]+?)\s*\./i);
  const senderName = grab(sms, /from\s*([A-Za-z\s]+?)\s*current/i);

  const amount = amountRaw === null ? null : Number(amountRaw);
  return { amount, transactionId, reference, senderName };
}

console.log(parseSms(text));
