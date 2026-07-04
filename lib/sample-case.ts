import type { CodeSuggestion, ImagingFinding, NoteSummary } from "./types";

/**
 * A single de-identified, entirely synthetic case used across the showcase.
 * No real PHI. The mock inference returns this deterministically so the demo
 * runs identically every time.
 */
export const SAMPLE_CASE = {
  caseId: "A-2291",
  subjectId: "SUBJ-4471",
  noteText: `54-year-old presents with three days of productive cough, subjective fever, and pleuritic right-sided chest pain. History of type 2 diabetes. On exam, right basal crackles and mild tachypnoea; SpO2 94% on room air. No haemoptysis. Started on oral antibiotics.`,
  summary: {
    narrative:
      "54-year-old with three days of productive cough, subjective fever, and pleuritic right-sided chest pain. History of type 2 diabetes. On exam, right basal crackles and mild tachypnoea; SpO₂ 94% on room air.",
    problems: [
      "Community-acquired pneumonia",
      "Type 2 diabetes",
      "Pleuritic chest pain",
    ],
    medications: ["Amoxicillin–clavulanate", "Metformin"],
  } satisfies NoteSummary,
  codes: [
    {
      system: "ICD-10",
      code: "J18.9",
      label: "Pneumonia, unspecified organism",
      confidence: 0.92,
    },
    {
      system: "ICD-10",
      code: "E11.9",
      label: "Type 2 diabetes mellitus without complications",
      confidence: 0.88,
    },
    {
      system: "ICD-10",
      code: "R07.1",
      label: "Chest pain on breathing",
      confidence: 0.74,
    },
    {
      system: "CPT",
      code: "99204",
      label: "Office visit, new patient",
      confidence: 0.69,
    },
  ] satisfies CodeSuggestion[],
  imaging: {
    modality: "PA chest X-ray",
    findings: [
      {
        id: "f1",
        label: "Right lower lobe opacity",
        confidence: 0.91,
        kind: "finding",
        box: { x: 60, y: 50, w: 24, h: 22 },
      },
      {
        id: "f2",
        label: "Blunted right costophrenic angle",
        confidence: 0.63,
        kind: "finding",
        box: { x: 58, y: 68, w: 20, h: 14 },
      },
      {
        id: "f3",
        label: "No pneumothorax",
        confidence: 0.04,
        kind: "negative",
      },
    ] satisfies ImagingFinding[],
  },
} as const;

/** In-country operators for the audit trail (synthetic identities). */
export const OPERATORS = [
  "N. Dlamini",
  "T. Botha",
  "A. Naidoo",
  "M. Khumalo",
  "S. Pillay",
  "L. van Wyk",
] as const;
