/**
 * Dosage form constants and abbreviation mappings
 *
 * This file contains standardized dosage forms, units, and abbreviation mappings
 * used throughout the calculation engine for consistent parsing and display.
 *
 * @module lib/constants/dosage
 */

/**
 * Standard dosage forms
 * Based on FDA and RxNorm standards
 */
export const DOSAGE_FORMS = {
  // Oral solids
  TABLET: 'tablet',
  CAPSULE: 'capsule',
  PILL: 'pill',

  // Oral liquids
  SOLUTION: 'solution',
  SUSPENSION: 'suspension',
  SYRUP: 'syrup',
  ELIXIR: 'elixir',
  TINCTURE: 'tincture',

  // Topical
  CREAM: 'cream',
  OINTMENT: 'ointment',
  GEL: 'gel',
  LOTION: 'lotion',
  PATCH: 'patch',

  // Inhalational
  AEROSOL: 'aerosol',
  INHALER: 'inhaler',
  NEBULIZER: 'nebulizer',

  // Injectable
  INJECTION: 'injection',
  VIAL: 'vial',
  SYRINGE: 'syringe',

  // Ophthalmic/Otic
  DROPS: 'drops',
  SOLUTION_OPHTHALMIC: 'solution_ophthalmic',

  // Other
  SUPPOSITORY: 'suppository',
  ENEMA: 'enema',
  LOZENGE: 'lozenge',
  POWDER: 'powder'
};

/**
 * Dosage form abbreviations and common variations
 * Used for parsing SIG text and normalizing input
 */
export const DOSAGE_ABBREVIATIONS = {
  // Tablets
  tab: DOSAGE_FORMS.TABLET,
  tabs: DOSAGE_FORMS.TABLET,
  tablet: DOSAGE_FORMS.TABLET,
  tablets: DOSAGE_FORMS.TABLET,
  pill: DOSAGE_FORMS.PILL,
  pills: DOSAGE_FORMS.PILL,

  // Capsules
  cap: DOSAGE_FORMS.CAPSULE,
  caps: DOSAGE_FORMS.CAPSULE,
  capsule: DOSAGE_FORMS.CAPSULE,
  capsules: DOSAGE_FORMS.CAPSULE,

  // Oral liquids
  sol: DOSAGE_FORMS.SOLUTION,
  soln: DOSAGE_FORMS.SOLUTION,
  solution: DOSAGE_FORMS.SOLUTION,
  susp: DOSAGE_FORMS.SUSPENSION,
  suspension: DOSAGE_FORMS.SUSPENSION,
  syrup: DOSAGE_FORMS.SYRUP,
  elixir: DOSAGE_FORMS.ELIXIR,

  // Topical
  cream: DOSAGE_FORMS.CREAM,
  oint: DOSAGE_FORMS.OINTMENT,
  ointment: DOSAGE_FORMS.OINTMENT,
  gel: DOSAGE_FORMS.GEL,
  lotion: DOSAGE_FORMS.LOTION,
  patch: DOSAGE_FORMS.PATCH,
  patches: DOSAGE_FORMS.PATCH,

  // Inhalational
  aero: DOSAGE_FORMS.AEROSOL,
  aerosol: DOSAGE_FORMS.AEROSOL,
  inhaler: DOSAGE_FORMS.INHALER,
  neb: DOSAGE_FORMS.NEBULIZER,
  nebulizer: DOSAGE_FORMS.NEBULIZER,

  // Injectable
  inj: DOSAGE_FORMS.INJECTION,
  injection: DOSAGE_FORMS.INJECTION,
  vial: DOSAGE_FORMS.VIAL,
  vials: DOSAGE_FORMS.VIAL,
  syringe: DOSAGE_FORMS.SYRINGE,
  syringes: DOSAGE_FORMS.SYRINGE,

  // Ophthalmic/Otic
  gtt: DOSAGE_FORMS.DROPS,
  gtts: DOSAGE_FORMS.DROPS,
  drop: DOSAGE_FORMS.DROPS,
  drops: DOSAGE_FORMS.DROPS,

  // Other
  supp: DOSAGE_FORMS.SUPPOSITORY,
  suppository: DOSAGE_FORMS.SUPPOSITORY,
  suppositories: DOSAGE_FORMS.SUPPOSITORY,
  enema: DOSAGE_FORMS.ENEMA,
  loz: DOSAGE_FORMS.LOZENGE,
  lozenge: DOSAGE_FORMS.LOZENGE,
  lozenges: DOSAGE_FORMS.LOZENGE,
  powder: DOSAGE_FORMS.POWDER,
  pwd: DOSAGE_FORMS.POWDER
};

/**
 * Standard units of measurement
 * Used for quantity calculations and validation
 */
export const UNITS = {
  // Count-based
  EACH: 'each',
  TABLET: 'tablet',
  CAPSULE: 'capsule',
  PILL: 'pill',
  PATCH: 'patch',
  SUPPOSITORY: 'suppository',
  LOZENGE: 'lozenge',

  // Volume-based
  ML: 'ml',
  MG: 'mg',
  G: 'g',
  L: 'l',

  // Special units
  UNITS: 'units', // For insulin
  IU: 'IU',      // International Units
  MCG: 'mcg',    // Micrograms
  MEQ: 'mEq',    // Milliequivalents

  // Application-based
  DROP: 'drop',
  DROPS: 'drops',
  PUFF: 'puff',
  PUFFS: 'puffs',
  SPRAY: 'spray',
  SPRAYS: 'sprays',
  INHALATION: 'inhalation',
  INHALATIONS: 'inhalations'
};

/**
 * Unit abbreviations and common variations
 */
export const UNIT_ABBREVIATIONS = {
  // Count
  each: UNITS.EACH,
  tablet: UNITS.TABLET,
  tablets: UNITS.TABLET,
  tab: UNITS.TABLET,
  tabs: UNITS.TABLET,
  capsule: UNITS.CAPSULE,
  capsules: UNITS.CAPSULE,
  cap: UNITS.CAPSULE,
  caps: UNITS.CAPSULE,
  pill: UNITS.PILL,
  pills: UNITS.PILL,
  patch: UNITS.PATCH,
  patches: UNITS.PATCH,
  supp: UNITS.SUPPOSITORY,
  suppository: UNITS.SUPPOSITORY,
  suppositories: UNITS.SUPPOSITORY,
  loz: UNITS.LOZENGE,
  lozenge: UNITS.LOZENGE,
  lozenges: UNITS.LOZENGE,

  // Volume/Weight
  ml: UNITS.ML,
  mg: UNITS.MG,
  g: UNITS.G,
  l: UNITS.L,
  mcg: UNITS.MCG,
  'mcg': UNITS.MCG,
  microgram: UNITS.MCG,
  micrograms: UNITS.MCG,
  meq: UNITS.MEQ,
  'meq': UNITS.MEQ,
  milliequivalent: UNITS.MEQ,
  milliequivalents: UNITS.MEQ,

  // Special
  unit: UNITS.UNITS,
  units: UNITS.UNITS,
  iu: UNITS.IU,
  'iu': UNITS.IU,

  // Application
  drop: UNITS.DROP,
  drops: UNITS.DROPS,
  puff: UNITS.PUFF,
  puffs: UNITS.PUFFS,
  spray: UNITS.SPRAY,
  sprays: UNITS.SPRAYS,
  inhalation: UNITS.INHALATION,
  inhalations: UNITS.INHALATIONS
};

/**
 * Frequency patterns and their standard interpretations
 * Used for parsing dosage frequencies from SIG text
 */
export const FREQUENCY_PATTERNS = {
  // Daily frequencies
  'once daily': 1,
  'daily': 1,
  'every day': 1,
  'qd': 1,          // quaque die

  'twice daily': 2,
  'bid': 2,         // bis in die
  'two times daily': 2,

  'three times daily': 3,
  'tid': 3,         // ter in die
  'three times a day': 3,

  'four times daily': 4,
  'qid': 4,         // quater in die
  'four times a day': 4,

  'five times daily': 5,
  'five times a day': 5,

  'six times daily': 6,
  'six times a day': 6,

  // Hourly frequencies
  'every hour': 24,
  'hourly': 24,
  'qh': 24,         // quaque hora

  'every 2 hours': 12,
  'q2h': 12,

  'every 3 hours': 8,
  'q3h': 8,

  'every 4 hours': 6,
  'q4h': 6,

  'every 6 hours': 4,
  'q6h': 4,

  'every 8 hours': 3,
  'q8h': 3,

  'every 12 hours': 2,
  'q12h': 2,

  // Weekly frequencies (less common for oral meds)
  'once weekly': 0.14,    // 1/7
  'weekly': 0.14,

  'twice weekly': 0.29,   // 2/7
  'three times weekly': 0.43, // 3/7

  // As needed
  'as needed': null,       // Special case
  'prn': null,            // pro re nata
  'as required': null
};

/**
 * Route abbreviations (for future use)
 * How medications are administered
 */
export const ROUTE_ABBREVIATIONS = {
  po: 'by mouth',
  'po': 'by mouth',
  oral: 'by mouth',
  orally: 'by mouth',

  im: 'intramuscular',
  'im': 'intramuscular',
  intramuscular: 'intramuscular',

  iv: 'intravenous',
  'iv': 'intravenous',
  intravenous: 'intravenous',

  sc: 'subcutaneous',
  'sc': 'subcutaneous',
  subcutaneous: 'subcutaneous',

  top: 'topical',
  topical: 'topical',

  inh: 'inhalation',
  inhalation: 'inhalation',

  ophth: 'ophthalmic',
  ophthalmic: 'ophthalmic',

  otic: 'otic',

  rect: 'rectal',
  rectal: 'rectal',

  vag: 'vaginal',
  vaginal: 'vaginal'
};

/**
 * Unit conversion factors (for future use)
 * Convert between different units of measurement
 */
export const UNIT_CONVERSIONS = {
  // Weight
  'g_to_mg': 1000,
  'mg_to_mcg': 1000,
  'g_to_mcg': 1000000,

  // Volume
  'l_to_ml': 1000,

  // Special conversions may be needed for different dosage forms
  // e.g., insulin units to mg, etc.
};

/**
 * Helper functions
 */

/**
 * Normalize a dosage form string to standard form
 * @param {string} dosageForm - Input dosage form
 * @returns {string|null} Normalized dosage form or null if not recognized
 */
export function normalizeDosageForm(dosageForm) {
  if (!dosageForm || typeof dosageForm !== 'string') {
    return null;
  }

  const normalized = dosageForm.toLowerCase().trim();
  return DOSAGE_ABBREVIATIONS[normalized] || null;
}

/**
 * Normalize a unit string to standard form
 * @param {string} unit - Input unit
 * @returns {string|null} Normalized unit or null if not recognized
 */
export function normalizeUnit(unit) {
  if (!unit || typeof unit !== 'string') {
    return null;
  }

  const normalized = unit.toLowerCase().trim();
  return UNIT_ABBREVIATIONS[normalized] || null;
}

/**
 * Get frequency from description
 * @param {string} frequencyText - Frequency description (e.g., "twice daily")
 * @returns {number|null} Frequency number or null if not recognized
 */
export function parseFrequency(frequencyText) {
  if (!frequencyText || typeof frequencyText !== 'string') {
    return null;
  }

  const normalized = frequencyText.toLowerCase().trim();
  return FREQUENCY_PATTERNS[normalized] || null;
}

/**
 * Check if a unit is count-based (tablets, capsules, etc.)
 * @param {string} unit - Unit to check
 * @returns {boolean} True if count-based
 */
export function isCountBasedUnit(unit) {
  if (!unit) return false;

  const countUnits = [
    UNITS.EACH,
    UNITS.TABLET,
    UNITS.CAPSULE,
    UNITS.PILL,
    UNITS.PATCH,
    UNITS.SUPPOSITORY,
    UNITS.LOZENGE
  ];

  return countUnits.includes(unit.toLowerCase());
}

/**
 * Check if a unit is volume-based (ml, mg, etc.)
 * @param {string} unit - Unit to check
 * @returns {boolean} True if volume/weight-based
 */
export function isVolumeBasedUnit(unit) {
  if (!unit) return false;

  const volumeUnits = [
    UNITS.ML,
    UNITS.MG,
    UNITS.G,
    UNITS.L,
    UNITS.MCG,
    UNITS.MEQ
  ];

  return volumeUnits.includes(unit.toLowerCase());
}
