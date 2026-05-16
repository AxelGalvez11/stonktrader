# Phase 2.2.5 ClinicalTrials storage hardening + thesis integration

## What changed
- Hardened `clinical_trials` storage for richer normalized trial fields and upsert-safe re-ingestion.
- Ingestion now updates existing `nct_id` records while preserving `raw_json`, ticker, and source snapshots.
- Guided thesis builder now supports multi-source selection across manual notes, SEC filings, and ClinicalTrials sources.
- Clinical trial selections can prefill thesis fields (drug/condition/phase/endpoints/catalyst window).

## Safety
- Uses public registry data.
- Labels as possible catalyst window and includes non-guarantee language.
- Missing values remain `"missing"`.
