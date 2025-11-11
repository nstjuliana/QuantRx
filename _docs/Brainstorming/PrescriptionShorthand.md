# Pharmacy Prescription Fulfillment System — Chat Notes

## 📘 Prescription Shorthand Reference

| Abbreviation | Meaning | Latin Origin |
|---------------|----------|---------------|
| **qd** | once daily | *quaque die* |
| **bid** | twice daily | *bis in die* |
| **tid** | three times daily | *ter in die* |
| **qid** | four times daily | *quater in die* |
| **qod** | every other day | *quaque altera die* |
| **q_h** | every _x_ hours (e.g., q4h = every 4 hours) | *quaque hora* |
| **qam** | every morning | *quaque ante meridiem* |
| **qpm** | every evening | *quaque post meridiem* |
| **hs** | at bedtime | *hora somni* |
| **stat** | immediately | *statim* |
| **prn** | as needed | *pro re nata* |
| **ac** | before meals | *ante cibum* |
| **pc** | after meals | *post cibum* |
| **cc** | with food / with meals | *cum cibum* |
| **NPO** | nothing by mouth | *nil per os* |

### Route of Administration

| Abbreviation | Meaning | Latin Origin |
|---------------|----------|---------------|
| **po** | by mouth / orally | *per os* |
| **sl** | under the tongue | *sub lingua* |
| **im** | intramuscular | *in musculum* |
| **iv** | intravenous | *in venam* |
| **sc / subq** | subcutaneous | *sub cutem* |
| **top** | topical | — |
| **inh** | inhale | — |
| **pr** | per rectum | *per rectum* |
| **pv** | per vagina | *per vaginam* |
| **ophth** | in the eye | — |
| **otic** | in the ear | — |

---

## 💊 Prescription Entry — Required Fields

### 1. Prescription Information
| Field | Type | Description |
|--------|------|-------------|
| Prescription Number (Rx #) | String | Unique pharmacy ID |
| Date Written | Date | Prescriber issue date |
| Date Entered | Date | Entry timestamp |
| Refills Authorized | Integer | Allowed refills |
| Refills Remaining | Integer | Remaining |
| Days Supply | Integer | Used for claims/DUR |

### 2. Patient Information
| Field | Type | Description |
|--------|------|-------------|
| Patient ID | String | Pharmacy system ID |
| Full Name | String | — |
| DOB | Date | — |
| Gender | Enum | — |
| Allergies | Array | — |
| Insurance | Object | BIN, PCN, etc. |

### 3. Prescriber Information
| Field | Type | Description |
|--------|------|-------------|
| Prescriber Name | String | — |
| DEA/NPI | String | Controlled substance validation |
| Contact | String | Phone/fax |

### 4. Drug / Product Details
| Field | Type | Description |
|--------|------|-------------|
| Drug Name | String | e.g. “Amoxicillin 500 mg capsule” |
| Strength | String | e.g. “500 mg” |
| Dosage Form | Enum | tablet, capsule, etc. |
| Route | Enum | oral, topical, etc. |
| NDC | String (11-digit) | Validated |
| Package Size | Numeric | e.g. 100 tabs/bottle |
| Manufacturer | String | — |

### 5. Directions (SIG)
| Field | Type | Example |
|--------|------|----------|
| Sig Text | String | “Take 1 tablet by mouth twice daily after meals” |
| Structured Sig | JSON | `{dose:1, unit:"tablet", freq:"BID"}` |
| PRN | Boolean | true/false |

### 6. Dispensing Details
| Field | Type | Description |
|--------|------|-------------|
| Quantity to Dispense | Numeric | e.g. 20 tablets |
| Unit of Measure | Enum | tab, cap, mL, etc. |
| DAW Code | Enum | 0–9 |

### 7. System Metadata
| Field | Type | Description |
|--------|------|-------------|
| Entered By | String | Technician ID |
| Verified By | String | Pharmacist ID |
| Validation Status | Enum | Valid, Warning, Error |

---

## 🔍 Checking NDC Validity

### 1. FDA NDC Directory
- URL: [https://www.accessdata.fda.gov/scripts/cder/ndc](https://www.accessdata.fda.gov/scripts/cder/ndc)
- If “Marketing End Date” is present → Inactive.

### 2. openFDA API
