# Phase 2.7 — Catalyst Calendar + Alerts (Hardened)

## Routes added
- `GET /api/catalysts` and `POST /api/catalysts`
- `GET /api/catalyst-alerts`
- `POST /api/catalysts/status`
- `POST /api/catalysts/outcome`

## Alert rules
The alert generator emits research alerts for:
- possible catalyst window within 7 days
- possible catalyst window within 30 days
- expected date passed and no outcome
- open paper trade near catalyst date
- no thesis attached
- no synthesis attached
- synthesis weak / not_ready
- missing SEC evidence
- missing ClinicalTrials evidence
- high pre-catalyst run-up
- high dilution risk
- post-event review needed

Language remains paper-trading only and does not emit buy/sell alerts.

## Dashboard integration
Dashboard now includes:
- next 5 upcoming catalysts
- top 5 research alerts
- review-needed trade count (`closed_unreviewed`)
- weak/not_ready thesis synthesis count
- catalysts within 30 days count

## Review integration
When outcome is captured for a catalyst with linked paper trade:
- catalyst status is set to `event_passed_review_needed`
- linked paper trade is set to `closed_unreviewed`
- review page prefill can use saved `actual_event_date` and catalyst outcome notes

## Known limitations
- Evidence completeness checks rely on available DB relations and ticker matching.
- Alerts are intentionally conservative and may over-notify when evidence linkage is incomplete.
- External data providers may be delayed/unavailable; workflow remains research and paper-trading only.
