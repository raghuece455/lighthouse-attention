from __future__ import annotations


def _join(paragraphs: list[str]) -> str:
    return "\n\n".join(paragraphs)


def _incident_appendix() -> list[str]:
    return [
        "Appendix A. The incident bridge used a simple owner rotation. One engineer watched customer messages, one watched application telemetry, and one kept the written timeline. This reduced duplicate investigation threads and helped the commander keep updates short.",
        "Appendix B. The support team grouped contacts by order status, cart size, and region. Most contacts came from customers trying to complete a purchase during a promotion window. Agents were instructed to avoid speculative explanations and focus on recovery steps.",
        "Appendix C. The finance team confirmed that failed attempts did not create settled charges. A small number of authorization holds were released by the normal banking process. The customer care team prepared a plain-language note for anyone who saw a temporary hold.",
        "Appendix D. Monitoring improvements were discussed after recovery. The group wanted one view that combined business conversion, service errors, worker restarts, and support contact rate. The goal was faster triage when technical metrics and customer behavior diverged.",
        "Appendix E. The release process will include a shorter decision checkpoint for high-risk payment changes. Reviewers asked for clearer ownership of validation scenarios, better dry-run notes, and a prewritten rollback message for incident commanders.",
        "Appendix F. The training follow-up emphasized calm communication. Engineers should write observations before theories, mark assumptions clearly, and record when a mitigation starts. This makes later review more accurate and prevents the timeline from becoming a memory exercise.",
        "Appendix G. The communications review praised frequent short updates over long summaries. Stakeholders preferred a steady rhythm with current impact, next action, and next update time. This pattern will be reused for future reliability events.",
        "Appendix H. The quality team requested a small library of incident drills. Each drill will include a scenario, expected signals, likely false leads, and a debrief template. The goal is to practice coordination before a real customer-facing problem appears.",
        "Appendix I. The final action review will happen in thirty days. Owners will bring evidence that their assigned improvements are complete, observable, and documented. Any delayed item will need a new owner and a revised completion date.",
    ]


def _manual_appendix() -> list[str]:
    return [
        "Appendix A. Packaging should be saved until the first month of use has passed. The foam inserts protect the housing during a return shipment. If packaging is discarded, use a sturdy box and wrap the display area so it cannot rub against the outer carton.",
        "Appendix B. Water taste can vary during the first week as household plumbing settles after installation. The guide recommends comparing taste after the second priming cycle rather than after the first cup. This avoids unnecessary support calls during normal startup.",
        "Appendix C. Families with seasonal homes should label the shutoff valve and keep the quick-start card near the cabinet. A visible label helps guests avoid disconnecting the wrong hose. The module should remain upright during transport between rooms.",
        "Appendix D. The display brightness can be lowered for night use. Hold the menu button for three seconds and choose the moon icon. Brightness settings do not affect flow rate, service reminders, or stored operating-hour history.",
        "Appendix E. Replacement parts should be ordered before the service reminder turns red. Shipping delays can leave the household without filtered water. The manual suggests keeping one approved spare part on hand in areas with hard water.",
        "Appendix F. Owners should record installation date, service visits, and purchase receipts in the back of the guide. A complete record makes support calls faster and helps technicians understand how the appliance has been used over time.",
        "Appendix G. If the household moves, photograph the connection layout before disconnecting the appliance. The picture helps with reinstallation and reduces the chance of reversing the inlet and outlet lines. Keep small fittings in a labeled bag.",
        "Appendix H. The product label contains manufacturing date, model family, and electrical rating. Do not cover the label with tape or cabinet liner. Technicians use this information to confirm compatibility with approved service parts.",
        "Appendix I. The appliance may make a soft clicking sound when valves open or close. This is expected during normal operation. A grinding sound, burning smell, or repeated power reset should be treated as a service issue.",
        "Appendix J. Households with very hard water may need more frequent inspection of hoses and screens. Mineral buildup should be removed gently with approved cleaning tools. Sharp metal picks can scratch the housing and create leaks.",
    ]


def _meeting_appendix() -> list[str]:
    return [
        "Appendix A. The design team will continue interviewing new users who skip setup during onboarding. Interviewers will ask what wording felt unclear, which permission prompts seemed risky, and whether users understood the difference between a reminder and an automated action.",
        "Appendix B. The analytics team will compare weekday and weekend behavior. Early beta usage suggested that teams create most schedules early in the week, while personal reminders appear more often near Friday afternoon planning sessions.",
        "Appendix C. Support requested a shared glossary so customer-facing teams use the same language. The glossary will define schedule, reminder, automation, owner, pause, resume, and notification. This should reduce confusion during the first public week.",
        "Appendix D. Infrastructure will run a tabletop exercise for delayed jobs. The exercise will test alert wording, owner assignment, customer communication, and the handoff between the launch commander and the queue specialist.",
        "Appendix E. Product marketing will keep the announcement focused on practical outcomes rather than technical architecture. The draft will mention saving time on routine follow-ups, but it will avoid promising that every workflow can be automated immediately.",
        "Appendix F. The next readiness review will use the same agenda, but each owner will bring a one-page status note. The team agreed that short written notes make meetings faster and create a better record for the final launch review.",
        "Appendix G. The research team will observe five onboarding sessions and collect notes about hesitation points. They will not interrupt the sessions unless a participant becomes stuck. Findings will be grouped by wording, permissions, and confidence.",
        "Appendix H. The enablement team will prepare a short internal walkthrough for account managers. The walkthrough will show setup, pause, resume, ownership transfer, and notification review. It will also include phrases to avoid during customer calls.",
        "Appendix I. The data team will verify that event names match the analytics dictionary. Any mismatch will be corrected before reports are shared broadly. Clean naming matters because leadership will compare adoption across several product areas.",
        "Appendix J. The operations team will keep a small daily note during the first week. The note will capture unusual patterns, customer questions, and any manual intervention. This creates a useful record without requiring a long meeting every day.",
        "Appendix K. The group closed by thanking beta participants and internal testers. Their feedback helped simplify permission language, reduce setup friction, and prioritize monitoring work. The next review will focus on evidence rather than speculation.",
    ]


def _build_examples() -> list[dict[str, str]]:
    return [
        {
            "id": "incident-cache-root-cause",
            "title": "Incident report: hidden root cause",
            "description": "A service incident where the key root cause is documented early, then buried under a long operational timeline.",
            "hidden_fact_position_hint": "The root cause appears in the opening investigation notes.",
            "query": "Which stale feature flag cache TTL caused the issue, and what should it change to?",
            "document": _join(
                [
                    "Opening investigation note. The checkout incident was traced to a stale feature flag cache with a forty eight hour TTL. The rollout controller believed the new payment rule was disabled, while checkout workers kept reading the old cached value. The corrective action is to reduce that stale feature flag cache TTL to five minutes and force invalidation during payment rule launches.",
                    "Customer impact summary. Between 09:05 and 10:12, a portion of customers saw intermittent checkout failures after selecting express shipping. The failures were concentrated in two regions and mainly affected carts that contained subscription items. Support agents documented a spike in chat volume and created a shared response template for refunds and abandoned cart recovery.",
                    "Timeline 09:00. The release train completed a normal deployment. Build verification checks passed, dashboard latency remained inside the weekly range, and the canary pool showed no immediate alarm. The first warning came from a business metric rather than a host metric, because successful requests were still returning quickly for unaffected cart types.",
                    "Timeline 09:18. The on-call engineer compared payment gateway responses, checkout worker logs, and cart validation traces. The payment gateway accepted requests, but checkout rejected a subset of carts before payment authorization. This moved the investigation away from the gateway and toward a local decision made inside checkout.",
                    "Timeline 09:31. A rollback was discussed but paused because the release included unrelated tax table updates that were already serving correctly. The team chose a targeted mitigation: disable the new payment rule, drain the smallest worker pool, and watch the error budget minute by minute.",
                    "Timeline 09:47. The disable operation appeared successful in the control plane. However, several checkout workers continued to reject the same cart shape. Engineers compared configuration snapshots and found that some workers had not refreshed their local rule state after the control plane update.",
                    "Timeline 10:02. The team restarted the oldest worker group and the error rate immediately dropped. This confirmed that the workers were making decisions with local state. A safer manual invalidation command was prepared and reviewed by two engineers before being applied across the remaining pools.",
                    "Recovery. By 10:12, checkout success rate returned to the normal range. Support continued monitoring refund requests for another hour. The incident commander kept the bridge open until the business metric, support queue, and synthetic checkout tests all agreed that the problem had cleared.",
                    "Follow-up actions. The team added an integration test for express shipping with subscriptions, a runbook entry for targeted worker invalidation, and a dashboard panel that compares control plane state against sampled worker state. The release checklist now requires an owner for feature flag expiry behavior.",
                    "Customer communication. The status page described a checkout reliability issue without exposing internal implementation details. Account managers received a plain-language explanation, a list of affected order IDs, and a recovery note. No payment credentials were exposed, and no confirmed orders were lost.",
                    "Long-term prevention. Engineers proposed a safer configuration path with push-based invalidation, shorter local freshness windows, and a deploy gate when worker state diverges from control plane state. The incident review emphasized that fast rollback is useful, but stale local decisions can survive a rollback if caches are not explicitly refreshed.",
                    "End note for reviewers. The final question from leadership asks which underlying mechanism made the incident persist after the rule was disabled and which operational setting should change before the next launch.",
                ]
                + _incident_appendix()
            ),
        },
        {
            "id": "manual-warranty-rule",
            "title": "Product manual: warranty rule in the middle",
            "description": "A long appliance manual where a warranty rule is easy to miss unless the model can route back to the relevant section.",
            "hidden_fact_position_hint": "The warranty condition appears in the maintenance section near the middle of the manual.",
            "query": "What exact maintenance rule keeps the warranty valid for the filtration module?",
            "document": _join(
                [
                    "Welcome. This guide explains installation, everyday operation, cleaning, maintenance, storage, and service for the Aurora home filtration module. Read the safety section before connecting the unit to water or power. Keep this guide near the appliance so future owners can review service requirements.",
                    "Safety overview. Do not operate the module if the inlet hose is cracked, if the housing has been dropped, or if the control panel shows a persistent fault light. Disconnect power before opening the lower service cover. Use only approved accessories and avoid bending the water line behind the cabinet.",
                    "Installation. Place the module on a level surface with at least ten centimeters of clearance on both sides. The inlet should connect to cold water only. Flush the line for two minutes before attaching the inlet hose. Confirm that the drain path is lower than the outlet valve.",
                    "First run. After installation, run the priming cycle before drinking filtered water. The first cycle may produce cloudy water due to trapped air. This is normal and should clear after the second pitcher. If the water remains cloudy after three cycles, inspect the inlet screen and repeat priming.",
                    "Daily operation. The display shows remaining filter life, flow status, and service reminders. A blue light means the module is filtering normally. A yellow light means the filter is approaching the service interval. A red light means the cartridge or seal requires immediate attention.",
                    "Maintenance rule. The filtration module warranty remains valid only when the replacement cartridge is installed before 500 operating hours and the serial seal stays intact. If the cartridge is replaced after 500 hours, or if the seal is removed during unapproved service, the filtration warranty is void even when the unit still powers on.",
                    "Cleaning. Wipe the exterior with a soft damp cloth. Do not use bleach, abrasive powder, or solvents near the display. The drip tray may be washed with mild soap. Let all removable parts dry completely before reinstalling them. Never place the electronic housing in a dishwasher.",
                    "Storage. If the module will not be used for more than thirty days, drain the tank, remove the cartridge, and store the device upright in a dry cabinet. Before returning to service, install a fresh cartridge and run the priming cycle twice. Storage does not reset the operating-hour counter.",
                    "Troubleshooting. Low flow usually indicates a blocked inlet screen, kinked hose, or exhausted cartridge. A repeated red light after cartridge replacement may indicate that the cartridge was not seated fully. Remove it, inspect the gasket, and reinstall it with firm pressure until the latch clicks.",
                    "Service options. Approved service centers can replace the housing, control panel, inlet valve, and pressure sensor. They can also inspect the serial seal after a move. Keep receipts for cartridges and service visits because the support team may request them when reviewing warranty claims.",
                    "Warranty claims. To open a claim, provide the model number, purchase date, cartridge receipts, operating-hour reading, and a photo of the serial seal. The review team may ask for water quality logs when diagnosing unusual filter exhaustion. Shipping damage is handled by the retailer during the first thirty days.",
                    "End note. The customer support checklist asks representatives to identify the maintenance condition that protects warranty status before recommending replacement parts or approving a service claim.",
                ]
                + _manual_appendix()
            ),
        },
        {
            "id": "meeting-notes-key-decision",
            "title": "Meeting notes: buried launch decision",
            "description": "Long planning notes where the important decision is one section among many routine updates.",
            "hidden_fact_position_hint": "The key decision is buried in the regional rollout section.",
            "query": "What launch decision did the team make, and what condition must be met before expanding?",
            "document": _join(
                [
                    "Meeting opening. The product, support, infrastructure, and analytics teams met to review launch readiness for the new scheduling assistant. The agenda covered adoption metrics, incident response, onboarding, regional rollout, dashboards, and open documentation tasks.",
                    "Adoption update. The beta group created more recurring schedules than expected, but one-time reminders remained flat. Product managers believe the recurring flow is easier to discover because it appears in the setup checklist. Design will test a lighter one-time reminder prompt next week.",
                    "Support update. Support received questions about calendar permissions, timezone wording, and the difference between a reminder and an automated task. Most tickets were resolved with short explanations. The help center team will add screenshots for permission prompts and organization-level settings.",
                    "Infrastructure update. Queue depth stayed below the warning threshold during the beta. The team observed short spikes during the top of each hour, especially when several organizations scheduled reports at the same minute. A smoothing job will spread new schedules across a small randomized offset.",
                    "Analytics update. Activation is strongest when the first schedule is created during onboarding. Users who postpone setup often do not return to the feature. Analytics will add a cohort view for users who see the education card but do not create a schedule within two days.",
                    "Regional rollout decision. The team decided to launch only in the Canary Bay region for the first public week. Expansion to all regions will wait until the latency sentinel dashboard stays green for seven consecutive days. This decision replaces the earlier plan to launch globally on Monday morning.",
                    "Documentation. The docs owner will update the launch checklist, define the terms reminder and automation, and add a rollback section. The support macro should avoid promising global availability until the staged launch completes. Product marketing will adjust the announcement to say gradual rollout.",
                    "Risk review. The largest risk is not task execution but user confusion around permissions. A secondary risk is that hourly spikes may create noisy alerts. The mitigation plan includes better onboarding copy, offset scheduling, and a smaller launch population for the first week.",
                    "Follow-up owners. Infrastructure owns latency dashboards and queue smoothing. Product owns onboarding copy. Support owns macros and known-issue tracking. Analytics owns cohort reporting. Documentation owns the launch checklist and rollback note. The launch commander will collect readiness signals each afternoon.",
                    "Open questions. The team still needs a final answer on enterprise audit log wording, in-product notification timing, and whether admins should receive a weekly summary of created automations. None of these questions block the Canary Bay launch, but they may affect broader expansion.",
                    "Close. The next meeting will review the first two days of public usage, compare support ticket volume against beta expectations, and decide whether any additional guardrails are needed before expanding beyond the initial region.",
                ]
                + _meeting_appendix()
            ),
        },
    ]


# Build once at import time so repeated calls to get_examples() pay no cost.
_EXAMPLES: list[dict[str, str]] = _build_examples()


def get_examples() -> list[dict[str, str]]:
    return _EXAMPLES
