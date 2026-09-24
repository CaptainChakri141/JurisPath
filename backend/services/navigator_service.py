from typing import Dict, Any, List
from models.schemas import NavigatorGuidanceResponse, LegalSourceCitation

class NavigatorService:
    @classmethod
    def get_scenarios(cls) -> List[Dict[str, Any]]:
        return [
            {
                "id": "legal_notice",
                "title": "Received a Legal Notice",
                "icon": "AlertTriangle",
                "badge": "Time Sensitive",
                "description": "Understand statutory notices, check response deadlines, organize facts, and prepare for formal advocate consultation.",
                "questions": [
                    {
                        "id": "notice_type",
                        "label": "What type of notice is it?",
                        "type": "select",
                        "options": [
                            "Cheque Bounce (Section 138 NI Act)",
                            "Consumer Deficiency / Demanding Refund",
                            "Tenancy Eviction or Rent Arrears Notice",
                            "Employment Bond / Recovery of Dues",
                            "Property / Partition / Civil Claim",
                            "Other / Not Sure"
                        ]
                    },
                    {
                        "id": "deadline_days",
                        "label": "What response deadline is mentioned in the notice?",
                        "type": "select",
                        "options": ["7 Days", "15 Days", "30 Days", "No specific deadline", "Deadline already passed"]
                    },
                    {
                        "id": "notice_sender",
                        "label": "Who sent the notice?",
                        "type": "select",
                        "options": [
                            "Advocate on behalf of an Individual",
                            "Company / Bank / NBFC",
                            "Landlord / Property Owner",
                            "Government Agency / Court",
                            "Former Employer"
                        ]
                    },
                    {
                        "id": "receipt_mode",
                        "label": "How did you receive the notice?",
                        "type": "select",
                        "options": ["Registered Post AD / Speed Post", "Email / WhatsApp", "Hand Delivery", "Not yet formally served"]
                    }
                ]
            },
            {
                "id": "rental_issue",
                "title": "Rental & Tenancy Issue",
                "icon": "Home",
                "badge": "Andhra Pradesh Tenancy",
                "description": "Navigate deposit withholding, unfair deductions, illegal eviction threats, or maintenance disputes.",
                "questions": [
                    {
                        "id": "issue_type",
                        "label": "What is the core rental issue?",
                        "type": "select",
                        "options": [
                            "Landlord refusing to refund Security Deposit",
                            "Excessive deductions claimed for repainting/damage",
                            "Threat of sudden eviction without agreed notice",
                            "Arbitrary rent increase above agreement terms",
                            "Failure to carry out essential structural repairs"
                        ]
                    },
                    {
                        "id": "agreement_status",
                        "label": "Do you have an active written rental agreement?",
                        "type": "select",
                        "options": [
                            "Yes, registered / signed agreement",
                            "Yes, 11-month agreement on stamp paper",
                            "Expired agreement, continuing informally",
                            "Oral agreement only (no written contract)"
                        ]
                    },
                    {
                        "id": "deposit_held",
                        "label": "How much security deposit is currently held?",
                        "type": "select",
                        "options": ["Under ₹25,000", "₹25,000 to ₹75,000", "₹75,000 to ₹1,50,000", "Above ₹1,50,000"]
                    }
                ]
            },
            {
                "id": "employment_issue",
                "title": "Employment Contract & Exit",
                "icon": "Briefcase",
                "badge": "Labor & Contracts",
                "description": "Understand notice period buyout, non-compete clauses, bond validity, and pending salary settlements.",
                "questions": [
                    {
                        "id": "emp_issue",
                        "label": "What is your primary employment question?",
                        "type": "select",
                        "options": [
                            "Company demanding heavy employment bond penalty",
                            "Company refusing early release / demanding 90 days notice",
                            "Enforceability of non-compete clause after leaving",
                            "Withheld Full & Final (F&F) settlement or bonus",
                            "Sudden termination without notice pay"
                        ]
                    },
                    {
                        "id": "role_level",
                        "label": "What is your employment status?",
                        "type": "select",
                        "options": [
                            "Confirmed Employee",
                            "Probationary Employee",
                            "Contractor / Consultant",
                            "Intern / Trainee"
                        ]
                    }
                ]
            },
            {
                "id": "consumer_complaint",
                "title": "Consumer Complaint & Refund",
                "icon": "ShoppingBag",
                "badge": "Consumer Act 2019",
                "description": "Defective electronics, deficiency in services, refusal of refund, or unfair trade practices.",
                "questions": [
                    {
                        "id": "defect_type",
                        "label": "What is the product or service dispute?",
                        "type": "select",
                        "options": [
                            "Defective electronic appliance / vehicle",
                            "E-commerce seller refusing replacement or refund",
                            "Deficient healthcare / diagnostic service",
                            "Flight / travel cancellation without refund",
                            "Misleading advertisement / unfair warranty denial"
                        ]
                    },
                    {
                        "id": "claim_value",
                        "label": "Approximate dispute value:",
                        "type": "select",
                        "options": ["Under ₹10,000", "₹10,000 to ₹50,000", "₹50,000 to ₹5,00,000", "Above ₹5,00,000"]
                    }
                ]
            },
            {
                "id": "government_rti",
                "title": "Government Document & RTI",
                "icon": "FileText",
                "badge": "RTI Act 2005",
                "description": "File Right to Information applications, request public records, track delayed citizen services, or file first appeals.",
                "questions": [
                    {
                        "id": "rti_department",
                        "label": "Which public authority or department holds the records?",
                        "type": "select",
                        "options": [
                            "Municipal Corporation / Revenue Department (Panchayat / Tehsildar)",
                            "Public Works, Roads & Infrastructure",
                            "Police Department / Local Station House",
                            "Public Education / University Board",
                            "Electricity Board / Public Health & Water Works",
                            "Central Government Ministry / Public Sector Undertaking"
                        ]
                    },
                    {
                        "id": "query_stage",
                        "label": "What stage is your inquiry?",
                        "type": "select",
                        "options": [
                            "Initial Form A RTI Application",
                            "First Appeal (No reply within 30 days)",
                            "Second Appeal (Before State Information Commission)",
                            "Public Services Guarantee Act Grievance"
                        ]
                    }
                ]
            },
            {
                "id": "contract_review",
                "title": "Contract & Agreement Review",
                "icon": "FileText",
                "badge": "Pre-Signing",
                "description": "Identify hidden traps, asymmetric liabilities, one-sided indemnity, or unfair lock-in terms before you sign.",
                "questions": [
                    {
                        "id": "contract_type",
                        "label": "What agreement are you preparing to sign?",
                        "type": "select",
                        "options": [
                            "Commercial / Freelance Client Contract",
                            "Vendor / Supplier Services Agreement",
                            "Partnership or Co-founder Agreement",
                            "Loan / Guarantee / Mortgage Document",
                            "Software / SaaS Licensing Agreement"
                        ]
                    }
                ]
            },
            {
                "id": "legal_term",
                "title": "Legal Term Explanation",
                "icon": "BookOpen",
                "badge": "Plain English",
                "description": "De-mystify complex Latin terms and statutory legalese with clear, real-world examples.",
                "questions": [
                    {
                        "id": "term_query",
                        "label": "Which legal concept do you need explained?",
                        "type": "select",
                        "options": [
                            "Liquidated Damages vs Penalty Clause",
                            "Indemnity and Hold Harmless",
                            "Force Majeure and Frustration of Contract",
                            "Section 138 of Negotiable Instruments Act",
                            "Work for Hire and Copyright Assignment",
                            "Joint and Several Liability"
                        ]
                    }
                ]
            }
        ]

    @classmethod
    def generate_guidance(
        cls,
        scenario_id: str,
        jurisdiction_country: str,
        jurisdiction_state: str,
        answers: Dict[str, Any]
    ) -> NavigatorGuidanceResponse:
        """
        Generates structured, verifiable guidance grounded in Indian and State statutes.
        """
        if scenario_id == "legal_notice":
            notice_type = answers.get("notice_type", "Statutory Notice")
            deadline = answers.get("deadline_days", "15 Days")
            return NavigatorGuidanceResponse(
                scenario_id=scenario_id,
                scenario_title="Received a Legal Notice",
                jurisdiction=f"{jurisdiction_country} ({jurisdiction_state})",
                situation_summary=(
                    f"You have received a formal legal notice concerning '{notice_type}' with a stated timeline of '{deadline}'. "
                    f"A legal notice is a formal written intimation of a grievance; it is not a court summons or warrant, "
                    f"but ignoring it can lead to adversary court proceedings or ex-parte orders."
                ),
                relevant_statutes=[
                    LegalSourceCitation(
                        source_name="Indian Civil Procedure Code (CPC), 1908",
                        title="Notice Procedures & Reply Documentation",
                        section="Section 80 & Order VI",
                        official_url="https://indiacode.nic.in/handle/123456789/2191",
                        relevance="Governs formal legal notices and evidential admissions."
                    ),
                    LegalSourceCitation(
                        source_name="Negotiable Instruments Act, 1881",
                        title="Cheque Dishonour Notice Requirements",
                        section="Section 138(b) & 138(c)",
                        official_url="https://indiacode.nic.in/handle/123456789/1944",
                        relevance="Mandates 15-day cure window from receipt before criminal prosecution can be filed."
                    ),
                    LegalSourceCitation(
                        source_name="Consumer Protection Act, 2019",
                        title="Consumer Dispute Notice of Deficiency",
                        section="Section 35 & 38",
                        official_url="https://consumeraffairs.nic.in/acts-and-rules/consumer-protection",
                        relevance="Notice provides opportunity to resolve dispute before Commission filings."
                    )
                ],
                documents_to_gather=[
                    "The original physical envelope with postal tracking label / speed post barcode",
                    "Complete copy of the legal notice, including all annexures and schedules",
                    "All prior contracts, receipts, bank statements, and relevant WhatsApp / email communications",
                    "Proof of actual delivery date (download postal tracking report from India Post website)"
                ],
                important_dates_checklist=[
                    f"Date notice was physically delivered or received via email",
                    f"Statutory cut-off deadline ({deadline} from receipt)",
                    "Date to deliver your formal advocate reply via Registered Post AD"
                ],
                possible_next_steps=[
                    "Step 1: Check the exact date of receipt and calculate the calendar cut-off date.",
                    "Step 2: Preserve the postal envelope (the postmark is critical evidence of the date of service).",
                    "Step 3: Draft a chronological factual timeline detailing your side of the dispute.",
                    "Step 4: Do not send an informal angry message to the sender; issue a structured written response through an advocate."
                ],
                when_professional_help_needed=[
                    "Immediate consultation is required if the notice involves Section 138 (Cheque Bounce) or criminal allegations.",
                    "If the financial claim is substantial or threatens legal proceedings with punitive damages.",
                    "To draft a formal 'Reply to Legal Notice' to ensure you do not inadvertently admit liability in writing."
                ]
            )

        elif scenario_id in ["rental_issue", "rental_tenancy"]:
            issue = answers.get("issue_type", "Security Deposit Withholding")
            return NavigatorGuidanceResponse(
                scenario_id=scenario_id,
                scenario_title="Rental & Tenancy Issue",
                jurisdiction=f"{jurisdiction_country} ({jurisdiction_state})",
                situation_summary=(
                    f"You are facing a tenancy dispute involving '{issue}' in {jurisdiction_state}. "
                    f"Under Indian tenancy laws and the Model Tenancy framework, security deposits and evictions "
                    f"are regulated to prevent arbitrary exploitation."
                ),
                relevant_statutes=[
                    LegalSourceCitation(
                        source_name="Andhra Pradesh Tenancy & Rent Regulations",
                        title="Rights and Obligations of Landlord & Tenant",
                        section="Deposit Limits & Lawful Recovery",
                        official_url="https://indiacode.nic.in",
                        relevance="Prohibits unilateral withholding without documented repair bills."
                    ),
                    LegalSourceCitation(
                        source_name="Indian Contract Act, 1872",
                        title="Breach of Lease Agreement & Unjust Enrichment",
                        section="Section 73 & 74",
                        official_url="https://indiacode.nic.in/handle/123456789/2187",
                        relevance="Requires proof of actual loss before damages can be deducted."
                    ),
                    LegalSourceCitation(
                        source_name="Transfer of Property Act, 1882",
                        title="Determination of Lease & Notice Requirements",
                        section="Section 106 & 108",
                        official_url="https://indiacode.nic.in/handle/123456789/2338",
                        relevance="Mandates 15-day notice to quit for residential monthly tenancies."
                    )
                ],
                documents_to_gather=[
                    "Signed Rental Agreement (original or scanned copy)",
                    "Bank transfer receipts / UTR numbers proving initial security deposit payment",
                    "Monthly rent payment bank statements or rent receipts",
                    "Photographs or videos of the flat taken at move-in and upon move-out",
                    "WhatsApp / email message thread regarding notice to vacate and handover"
                ],
                important_dates_checklist=[
                    "Date notice to vacate was communicated in writing",
                    "Date of physical handover of keys and joint inspection",
                    "Statutory window for deposit return (typically 7 to 30 days per agreement)"
                ],
                possible_next_steps=[
                    "Step 1: Send a formal written demand email requesting itemized, GST-invoiced bills for any proposed deduction.",
                    "Step 2: Reference the specific clause in your agreement stating deposit return timeline.",
                    "Step 3: If unresolved, issue a formal Advocate Notice demanding refund with interest.",
                    "Step 4: File a petition before the Rent Authority / Rent Court or District Civil Court."
                ],
                when_professional_help_needed=[
                    "If the landlord threatens physical eviction, locking premises, or disconnecting electricity/water (which is illegal).",
                    "If the withheld deposit exceeds ₹50,000 and the landlord refuses written dialogue."
                ]
            )

        elif scenario_id in ["employment_issue", "employment_exit"]:
            emp_issue = answers.get("emp_issue", "Notice Period & Bond")
            return NavigatorGuidanceResponse(
                scenario_id=scenario_id,
                scenario_title="Employment Contract & Exit",
                jurisdiction=f"{jurisdiction_country} ({jurisdiction_state})",
                situation_summary=(
                    f"You are navigating an employment covenant dispute regarding '{emp_issue}'. "
                    f"In India, constitutional rights to practice lawful trade and Section 27 of the Indian Contract Act "
                    f"strictly protect employees against unconscionable restraints."
                ),
                relevant_statutes=[
                    LegalSourceCitation(
                        source_name="Indian Contract Act, 1872",
                        title="Agreement in Restraint of Trade Void",
                        section="Section 27",
                        official_url="https://indiacode.nic.in/handle/123456789/2187",
                        relevance="Renders post-employment non-compete clauses void and unenforceable in India."
                    ),
                    LegalSourceCitation(
                        source_name="Payment of Wages Act, 1936 & Industrial Relations Code",
                        title="Timely Disbursement of Final Settlement",
                        section="Section 15 & F&F Rules",
                        official_url="https://labour.gov.in",
                        relevance="Mandates full settlement of earned wages upon resignation/termination."
                    )
                ],
                documents_to_gather=[
                    "Original Offer Letter and signed Employment Agreement",
                    "Formal resignation letter and email acknowledgment with resignation timestamp",
                    "Last 3 months salary slips and Provident Fund (UAN) statement",
                    "Company Exit Policy / Employee Handbook"
                ],
                important_dates_checklist=[
                    "Date resignation was tendered in writing",
                    "Calculated Last Working Day (LWD) under contractual notice days",
                    "Deadline for Full & Final settlement disbursement (typically within 30 to 45 days)"
                ],
                possible_next_steps=[
                    "Step 1: Check whether your agreement allows 'payment in lieu of notice' (buyout option).",
                    "Step 2: Request an official calculation sheet for Full & Final settlement and accrued leave encashment.",
                    "Step 3: For training bonds, understand that employers can only claim reasonable actual expenses incurred for specialized external training, not punitive penalties.",
                    "Step 4: File a grievance before the State Labour Commissioner or send an advocate notice if earned salary is withheld."
                ],
                when_professional_help_needed=[
                    "If the company threatens criminal charges, withholding Experience Letter, or blacklisting.",
                    "If the company demands exorbitant bond recovery without showing actual training expenditure."
                ]
            )

        elif scenario_id in ["consumer_complaint"]:
            defect = answers.get("defect_type", "Defective Product / Deficiency")
            return NavigatorGuidanceResponse(
                scenario_id=scenario_id,
                scenario_title="Consumer Complaint & Redressal",
                jurisdiction=f"{jurisdiction_country} ({jurisdiction_state})",
                situation_summary=(
                    f"You are pursuing consumer remedies for '{defect}'. The Consumer Protection Act 2019 "
                    f"provides powerful, streamlined legal remedies including online filing via the e-Daakhil portal."
                ),
                relevant_statutes=[
                    LegalSourceCitation(
                        source_name="Consumer Protection Act, 2019",
                        title="Deficiency in Service & Product Liability",
                        section="Section 2(11), 35 & 84",
                        official_url="https://edaakhil.nic.in",
                        relevance="Establishes strict manufacturer and service provider liability for defective goods."
                    ),
                    LegalSourceCitation(
                        source_name="National Consumer Helpline (NCH)",
                        title="Pre-Litigation Grievance Redressal",
                        section="NCH Portal (Toll-Free 1915)",
                        official_url="https://consumerhelpline.gov.in",
                        relevance="Government mediation channel achieving over 85% consumer dispute settlements."
                    )
                ],
                documents_to_gather=[
                    "Original Tax Invoice / Proof of Purchase / Credit card payment slip",
                    "Warranty card and user manual booklet",
                    "Job sheets, technician service visit reports, and error photos/videos",
                    "Email communications and registered complaint ticket numbers"
                ],
                important_dates_checklist=[
                    "Date of purchase and date defect first emerged",
                    "Dates of service requests and failed technician visits",
                    "Limitation Period: Complaint must be filed within 2 years from date of cause of action"
                ],
                possible_next_steps=[
                    "Step 1: Register an official pre-litigation grievance on National Consumer Helpline (NCH) at consumerhelpline.gov.in or call 1915.",
                    "Step 2: Send a formal Legal Notice giving 15 days to refund or replace the defective unit.",
                    "Step 3: File an online consumer complaint via e-Daakhil (edaakhil.nic.in) before the District Commission (claims up to ₹50 Lakhs)."
                ],
                when_professional_help_needed=[
                    "For high-value disputes exceeding ₹10 Lakhs, product liability causing personal bodily injury, or complex medical negligence."
                ]
            )

        elif scenario_id in ["government_rti", "rti"]:
            dept = answers.get("rti_department", "Public Authority")
            stage = answers.get("query_stage", "Initial Application")
            return NavigatorGuidanceResponse(
                scenario_id=scenario_id,
                scenario_title="Government Document & RTI",
                jurisdiction=f"{jurisdiction_country} ({jurisdiction_state})",
                situation_summary=(
                    f"You are pursuing a Right to Information (RTI) query with '{dept}' at stage '{stage}'. "
                    f"Under the Right to Information Act 2005, every citizen has a fundamental legal right "
                    f"to inspect public records, obtain certified copies, and demand timely service delivery."
                ),
                relevant_statutes=[
                    LegalSourceCitation(
                        source_name="Right to Information Act, 2005",
                        title="Obligations of Public Authorities & Request Procedure",
                        section="Section 6 & 7",
                        official_url="https://rtionline.gov.in",
                        relevance="Mandates statutory 30-day response window (48 hours for life/liberty)."
                    ),
                    LegalSourceCitation(
                        source_name="RTI First Appeal & Penalty Provisions",
                        title="Appeals and Penalties on PIO Default",
                        section="Section 19 & 20",
                        official_url="https://cic.gov.in",
                        relevance="Allows first appeal within 30 days of default; imposes ₹250/day penalty on defaulting officers."
                    ),
                    LegalSourceCitation(
                        source_name=f"{jurisdiction_state} Public Services Guarantee Framework",
                        title="Citizen Charter & Time-Bound Service Delivery",
                        section="Statutory Service Standards",
                        official_url="https://indiacode.nic.in",
                        relevance="Fixes accountability for municipal, revenue, and utility public records."
                    )
                ],
                documents_to_gather=[
                    "Drafted Form A RTI Application with specific, numbered questions",
                    "Proof of fee payment (₹10 Court Fee Stamp, IPO, or Online UTR)",
                    "Speed post receipt and delivery tracking acknowledgment printout",
                    "Copies of prior representations or rejected applications"
                ],
                important_dates_checklist=[
                    "Date of submission / postal delivery to Public Information Officer (PIO)",
                    "30-Day Mandatory Response Deadline under Section 7(1)",
                    "Limitation Period for First Appeal: Within 30 days from expiry of the response period"
                ],
                possible_next_steps=[
                    "Step 1: Frame clear, factual questions asking for existing recorded documents (do not ask for opinions or hypothetical interpretations).",
                    "Step 2: Submit to the designated Central/State Public Information Officer (CPIO/SPIO) with ₹10 statutory fee.",
                    "Step 3: If no reply or incomplete information is received within 30 days, file a First Appeal under Section 19(1) to the First Appellate Authority.",
                    "Step 4: If first appeal is unsatisfactory, file Second Appeal before the Central/State Information Commission."
                ],
                when_professional_help_needed=[
                    "When filing Second Appeals or Writ Petitions before the High Court under Article 226 if public authorities refuse compliance.",
                    "For large-scale public land records or tender integrity disputes involving complex administrative law."
                ]
            )

        # Default fallback guidance
        return NavigatorGuidanceResponse(
            scenario_id=scenario_id,
            scenario_title="Legal Information Navigation",
            jurisdiction=f"{jurisdiction_country} ({jurisdiction_state})",
            situation_summary="General legal information guidance under Indian law and local regulations.",
            relevant_statutes=[
                LegalSourceCitation(
                    source_name="Constitution of India & Indian Statutes",
                    title="Fundamental Rights & Contractual Principles",
                    section="Article 19 & Indian Contract Act",
                    official_url="https://indiacode.nic.in",
                    relevance="Provides underlying statutory basis for legal covenants."
                )
            ],
            documents_to_gather=["All related agreements, emails, and transaction statements."],
            important_dates_checklist=["Review all contractual dates and notice requirements."],
            possible_next_steps=["Organize documentation and consult a licensed legal advocate."],
            when_professional_help_needed=["Consult an advocate before signing binding contracts or responding to statutory notices."]
        )
