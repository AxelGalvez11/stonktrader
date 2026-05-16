export function buildOutcomePatch(body) {
  return {
    outcome: body.outcome,
    expected_date: body.actual_event_date || body.expected_date,
    status: 'event_passed_review_needed',
    updated_at: new Date().toISOString(),
    description: [body.outcome_summary, body.notes].filter(Boolean).join(' | '),
    source_url: body.source_url || null,
  };
}

export function buildLinkedTradePatch(body) {
  return {
    status: 'closed_unreviewed',
    actual_exit_date: body.actual_event_date || null,
    notes: body.outcome_summary || null,
  };
}
