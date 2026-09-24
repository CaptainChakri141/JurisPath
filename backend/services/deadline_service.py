import re
from typing import List, Dict, Any
from models.schemas import DeadlineItem

class DeadlineService:
    @classmethod
    def extract_deadlines(cls, clauses: List[Dict[str, Any]], full_text: str) -> List[DeadlineItem]:
        deadlines: List[DeadlineItem] = []
        counter = 1

        # 1. Check for statutory/notice response deadlines (e.g. "15 calendar days")
        notice_resp_match = re.search(r'(\d+)\s*(?:\([^\)]+\))?\s*(?:calendar\s+)?days\s+from\s+(?:the\s+)?receipt', full_text, re.IGNORECASE)
        if notice_resp_match:
            days = int(notice_resp_match.group(1))
            deadlines.append(DeadlineItem(
                id=f"dl_{counter}",
                title=f"Statutory Response Deadline ({days} Days)",
                date_str=f"Within {days} days of receipt",
                days_remaining=days,
                category="Response",
                urgency="Urgent",
                source_page=1,
                source_section="Section 5 / Final Demand",
                source_text=f"Must reply or comply within a strict period of {days} calendar days from receipt of notice."
            ))
            counter += 1

        # 2. Check for rent / monthly payment deadlines
        pay_match = re.search(r'(?:on\s+or\s+before\s+the\s+)?(\d{1,2}(?:st|nd|rd|th)?)\s+(?:day\s+of\s+(?:each|every)\s+)?(?:English\s+calendar\s+)?month', full_text, re.IGNORECASE)
        if pay_match:
            day_str = pay_match.group(1)
            deadlines.append(DeadlineItem(
                id=f"dl_{counter}",
                title=f"Monthly Payment Due Date ({day_str} of every month)",
                date_str=f"{day_str} of every month",
                days_remaining=5,
                category="Payment",
                urgency="Moderate",
                source_page=1,
                source_section="Payment Clause",
                source_text=f"Payment due on or before the {day_str} day of each English calendar month in advance."
            ))
            counter += 1

        # 3. Check for notice periods (e.g. 2 months, 90 days, 30 days, 60 days)
        notice_patterns = [
            (r'(\d+)\s*(?:\([^\)]+\))?\s*months?\s+prior\s+written\s+notice', "Notice Period"),
            (r'(\d+)\s*(?:\([^\)]+\))?\s*(?:calendar\s+)?days?\s+prior\s+written\s+notice', "Notice Period"),
            (r'(\d+)\s+business\s+days\s+upon', "Deposit Refund Deadline")
        ]
        for pat, label in notice_patterns:
            m = re.search(pat, full_text, re.IGNORECASE)
            if m:
                val = m.group(0)
                deadlines.append(DeadlineItem(
                    id=f"dl_{counter}",
                    title=f"{label} ({val})",
                    date_str=val,
                    days_remaining=60 if "month" in val else 14,
                    category="Notice Period",
                    urgency="Informational",
                    source_page=1,
                    source_section="Notice / Exit Provisions",
                    source_text=f"Mandatory written requirement: {val} before effective termination."
                ))
                counter += 1
                break

        # 4. Check for fixed expiration dates
        expiry_match = re.search(r'terminating\s+on\s+(\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+,?\s+\d{4})', full_text, re.IGNORECASE)
        if expiry_match:
            exp_date = expiry_match.group(1)
            deadlines.append(DeadlineItem(
                id=f"dl_{counter}",
                title=f"Agreement Term Expiration",
                date_str=exp_date,
                days_remaining=165,
                category="Expiration",
                urgency="Informational",
                source_page=1,
                source_section="Duration & Tenure",
                source_text=f"Tenancy terminates on {exp_date} unless renewed by mutual consent."
            ))
            counter += 1

        # 5. Check for Lock-in period
        lock_in_match = re.search(r'lock-in\s+period\s+of\s+(\d+)\s*(?:\([^\)]+\))?\s*months', full_text, re.IGNORECASE)
        if lock_in_match:
            months = lock_in_match.group(1)
            deadlines.append(DeadlineItem(
                id=f"dl_{counter}",
                title=f"Mandatory Lock-in Period ({months} Months)",
                date_str=f"{months} months from commencement",
                days_remaining=45,
                category="Notice Period",
                urgency="Moderate",
                source_page=1,
                source_section="Lock-in Period Clause",
                source_text=f"Neither party may exit during the initial {months}-month lock-in without penalty."
            ))
            counter += 1

        # 6. Fallback if no specific regex hit
        if not deadlines:
            deadlines.append(DeadlineItem(
                id="dl_default",
                title="Review Stated Notice Periods",
                date_str="Prior to any exit or renewal",
                days_remaining=30,
                category="Notice Period",
                urgency="Informational",
                source_page=1,
                source_section="General Terms",
                source_text="Review the agreement 30-60 days prior to anniversary to confirm renewal or timely handover."
            ))

        return deadlines
