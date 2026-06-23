/**
 * Utilities to auto-generate CURP and RFC
 * from the employee identity fields available in the form.
 *
 * CURP: full 18 characters generated, including homoclave (position 17)
 * and verification digit (position 18).
 * RFC: full 13 characters generated, including homoclave (positions 11-13).
 */

/** Maps the 3-letter state codes stored in the catalog to the 2-letter
 *  CURP state codes used by RENAPO.
 *
 *  Each state has two entries: the INEGI code used in the `states` catalog
 *  (e.g. AGU) and the legacy key that was previously in the map (e.g. AGS),
 *  kept for backward compatibility with existing employee records. */
const CURP_STATE_MAP: Record<string, string> = {
  AGU: "AS", // Aguascalientes (INEGI)
  AGS: "AS", // Aguascalientes (legacy)
  BCN: "BC", // Baja California
  BCS: "BS", // Baja California Sur
  CAM: "CC", // Campeche
  CHP: "CS", // Chiapas
  CHH: "CH", // Chihuahua
  CMX: "DF", // Ciudad de México
  COA: "CL", // Coahuila
  COL: "CM", // Colima
  DUR: "DG", // Durango (INEGI)
  DGO: "DG", // Durango (legacy)
  MEX: "MC", // Estado de México
  GUA: "GT", // Guanajuato (INEGI)
  GTO: "GT", // Guanajuato (legacy)
  GRO: "GR", // Guerrero
  HID: "HG", // Hidalgo (INEGI)
  HGO: "HG", // Hidalgo (legacy)
  JAL: "JC", // Jalisco
  MIC: "MN", // Michoacán
  MOR: "MS", // Morelos
  NAY: "NT", // Nayarit
  NLE: "NL", // Nuevo León
  OAX: "OC", // Oaxaca
  PUE: "PL", // Puebla
  QUE: "QT", // Querétaro (INEGI)
  QRO: "QT", // Querétaro (legacy)
  ROO: "QR", // Quintana Roo
  SLP: "SP", // San Luis Potosí
  SIN: "SL", // Sinaloa
  SON: "SR", // Sonora
  TAB: "TC", // Tabasco
  TAM: "TS", // Tamaulipas (INEGI)
  TMP: "TS", // Tamaulipas (legacy)
  TLA: "TL", // Tlaxcala
  VER: "VZ", // Veracruz
  YUC: "YN", // Yucatán
  ZAC: "ZS", // Zacatecas
  NEX: "NE", // Nacido en el extranjero
};

/** Strips accents from vowels but preserves Ñ (critical for RFC homoclave).
 *  Ü/ü is mapped to U since umlaut is not used in Mexican tax IDs. */
function removeAccents(str: string): string {
  return str
    .replace(/[áàäâ]/gi, "A")
    .replace(/[éèëê]/gi, "E")
    .replace(/[íìïî]/gi, "I")
    .replace(/[óòöô]/gi, "O")
    .replace(/[úùüû]/gi, "U")
    .toUpperCase();
}

/** Particles that prefix compound surnames but are ignored for RFC/CURP
 *  key extraction. Ordered longest-first so "DE LA" matches before "DE". */
const SURNAME_PARTICLES = [
  "DE LOS",
  "DE LAS",
  "DE LA",
  "DEL",
  "DE",
  "LAS",
  "LOS",
  "LA",
  "EL",
  "DA",
  "DAS",
  "DER",
  "DI",
  "DIE",
  "VAN",
  "VON",
  "MAC",
  "MC",
  "Y",
  "E",
];

/** Removes particles from a compound surname, returning only the significant
 *  part used for RFC/CURP key extraction. If the surname consists entirely
 *  of particles, returns the original. */
function stripParticles(surname: string): string {
  const upper = surname.toUpperCase().trim();
  for (const particle of SURNAME_PARTICLES) {
    const prefix = particle + " ";
    if (upper.startsWith(prefix)) {
      const rest = upper.slice(prefix.length).trim();
      if (rest.length > 0) return rest;
    }
  }
  return upper;
}

function getVowels(str: string): string {
  return str.replace(/[^AEIOU]/g, "");
}

function getConsonants(str: string): string {
  return str.slice(1).replace(/[^BCDFGHJKLMNÑPQRSTVWXYZ]/g, "");
}

function firstInternalVowel(str: string): string {
  return getVowels(str.slice(1))[0] ?? "X";
}

function firstInternalConsonant(str: string): string {
  return getConsonants(str)[0] ?? "X";
}

/** If the first given name is JOSÉ (male) or MARÍA (female), RENAPO rules
 *  dictate that CURP position 4 uses the second given name instead. */
function getCurpNameKey(name: string, genre: string): string {
  const words = name.trim().toUpperCase().split(/\s+/);
  if (words.length >= 2) {
    const first = words[0];
    const second = words[1];
    const g = genre.toUpperCase();
    if ((first === "JOSE" || first === "JOSÉ") && g === "M") return second;
    if ((first === "MARIA" || first === "MARÍA") && g === "F") return second;
  }
  return words[0] ?? "";
}

/** Forbidden words (altisonantes) per RENAPO.
 *  If the first 4 characters of a CURP form one of these words,
 *  position 2 is replaced with "X". */
const CURP_FORBIDDEN: ReadonlySet<string> = new Set([
  "BACA", "BAKA", "BUEI", "BUEY", "CACA", "CACO", "CAGA", "CAGO",
  "CAKA", "CAKO", "COGE", "COJA", "COJE", "COJI", "COJO", "CULO",
  "FALO", "FETO", "GETA", "GUEI", "GUEY", "JETA", "JOTO", "KACA",
  "KACO", "KAGA", "KAGO", "KOGE", "KOJO", "KAKA", "KULO", "LILO",
  "LOCA", "LOCO", "LOKA", "LOKO", "MAME", "MAMO", "MEAR", "MEON",
  "MION", "MOCO", "MOKO", "MULA", "MULO", "NACA", "NACO", "PEDA",
  "PEDO", "PENE", "PUTA", "PUTO", "QULO", "RATA", "RUIN",
]);

/** Replaces position 2 (index 1) of the given string with "X" if the
 *  first 4 characters form a forbidden word. */
function sanitizeForbiddenCURP(key: string): string {
  if (key.length >= 4 && CURP_FORBIDDEN.has(key.slice(0, 4))) {
    return key[0] + "X" + key.slice(2);
  }
  return key;
}

// ── CURP: homoclave (positions 17-18) ──────────────────────────────────────

/** RENAPO alphabet for the CURP verification digit checksum.
 *  0=0, 1=1, …, 9=9, A=10, B=11, …, N=23, Ñ=24, …, Z=36 */
const CURP_CHECKSUM_ALPHABET = "0123456789ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";

function getCurpCharValue(c: string): number {
  return CURP_CHECKSUM_ALPHABET.indexOf(c);
}

function curpVerificationDigit(curp17: string): string {
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const val = getCurpCharValue(curp17[i]);
    if (val === -1) return "0";
    sum += val * (18 - i);
  }
  return String((10 - (sum % 10)) % 10);
}

/** Position 17 defaults to "0" for pre-2000 births, "A" for 2000+. */
function curpHomoclave(curp16: string, birthYear: number): string {
  const p17 = birthYear < 2000 ? "0" : "A";
  const p18 = curpVerificationDigit(curp16 + p17);
  return p17 + p18;
}

// ── RFC: homoclave key (positions 11–12) + verification digit (13) ──────────

/** SAT character → value mapping (Anexo 1 de la RMF).
 *  Letters produce 2-digit strings, digits produce single-digit strings. */
const RFC_MAP: Record<string, string> = {
  " ": "00",
  "0": "0",
  "1": "1",
  "2": "2",
  "3": "3",
  "4": "4",
  "5": "5",
  "6": "6",
  "7": "7",
  "8": "8",
  "9": "9",
  "&": "10",
  Ñ: "10",
  A: "11",
  B: "12",
  C: "13",
  D: "14",
  E: "15",
  F: "16",
  G: "17",
  H: "18",
  I: "19",
  J: "21",
  K: "22",
  L: "23",
  M: "24",
  N: "25",
  O: "26",
  P: "27",
  Q: "28",
  R: "29",
  S: "32",
  T: "33",
  U: "34",
  V: "35",
  W: "36",
  X: "37",
  Y: "38",
  Z: "39",
};

/** SAT homoclave key alphabet: 33 characters (0–32), excludes O.
 *  Remainder → character: 0→1, 1→2, …, 8→9, 9→A, …, 22→N, 23→P, …, 32→Y.
 *  Remainder 33 falls back to Z. */
const RFC_HOMOCLAVE_KEY = "123456789ABCDEFGHIJKLMNPQRSTUVWXY";

/** SAT verification digit value table for the 12-char RFC.
 *  A=10, …, N=23, O=25 (24 reserved for empty string), …, Z=36,
 *  digits 0-9 = 0-9. */
const RFC_CHECKSUM_MAP: Record<string, number> = {
  A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, G: 16, H: 17, I: 18,
  J: 19, K: 20, L: 21, M: 22, N: 23, O: 25, P: 26, Q: 27, R: 28,
  S: 29, T: 30, U: 31, V: 32, W: 33, X: 34, Y: 35, Z: 36,
  "0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7,
  "8": 8, "9": 9,
};

/** Computes the 2-character homoclave key from the full name
 *  using the SAT sliding‑window algorithm (Anexo 1 de la RMF). */
function rfcHomoclaveKey(fullName: string): string {
  let numeric = "0";
  for (const c of fullName) {
    numeric += RFC_MAP[c] ?? "00";
  }

  let sum = 0;
  for (let i = 0; i < numeric.length - 1; i++) {
    const a = Number(numeric[i]);
    const b = Number(numeric[i + 1]);
    sum += (a * 10 + b) * b;
  }

  let div = sum % 1000;
  const mod = div % 34;
  div = (div - mod) / 34;

  return (
    (RFC_HOMOCLAVE_KEY[div] ?? "Z") + (RFC_HOMOCLAVE_KEY[mod] ?? "Z")
  );
}

/** Computes the RFC verification digit (position 13) from the first
 *  12 characters using a weighted sum modulo 11. */
function rfcVerificationDigit(rfc12: string): string {
  let partialSum = 0;
  for (let i = 0; i < rfc12.length; i++) {
    const char = rfc12[i];
    if (char in RFC_CHECKSUM_MAP) {
      partialSum += RFC_CHECKSUM_MAP[char] * (14 - (i + 1));
    }
  }
  const remainder = partialSum % 11;
  if (remainder === 0) return "0";
  const digit = 11 - remainder;
  return digit === 10 ? "A" : String(digit);
}

// ── Public API ──────────────────────────────────────────────────────────────

/** Generates the full 18-character CURP including homoclave and verification
 *  digit. Returns null if any required field is missing. */
export function generateCurp(
  name: string | null | undefined,
  surname: string | null | undefined,
  lastname: string | null | undefined,
  birthDate: Date | string | null | undefined,
  genre: string | null | undefined,
  birthStateCode: string | null | undefined,
): string | null {
  if (!name || !surname || !birthDate || !genre || !birthStateCode) return null;

  const nameFull = removeAccents(name.trim());
  const nameKey = getCurpNameKey(nameFull, genre);
  const apFull = removeAccents(surname.trim());
  const apKey = stripParticles(apFull);
  const amFull = lastname ? removeAccents(lastname.trim()) : "";
  const amKey = amFull ? stripParticles(amFull) : "";

  const stateCode = CURP_STATE_MAP[birthStateCode.toUpperCase()] ?? "NE";
  const sexCode = genre.toUpperCase() === "M" ? "H" : "M";

  const d = new Date(birthDate);
  const yy = String(d.getUTCFullYear()).slice(2);
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");

  const p1 = apKey[0] ?? "X";
  const p2 = firstInternalVowel(apKey);
  const p3 = amKey[0] ?? "X";
  const p4 = nameKey[0] ?? "X";
  const p5to10 = `${yy}${mm}${dd}`;
  const p11 = sexCode;
  const p12to13 = stateCode;
  const p14 = firstInternalConsonant(apKey);
  const p15 = amKey ? firstInternalConsonant(amKey) : "X";
  const p16 = firstInternalConsonant(nameKey);

  let curp16 = `${p1}${p2}${p3}${p4}${p5to10}${p11}${p12to13}${p14}${p15}${p16}`;
  curp16 = sanitizeForbiddenCURP(curp16);
  const homoclave = curpHomoclave(curp16, d.getUTCFullYear());

  return `${curp16}${homoclave}`.toUpperCase();
}

/** Generates the full 13-character RFC: 10-char key + 2-char homoclave
 *  key (positions 11–12) + verification digit (position 13).
 *  Returns null if any required field is missing. */
export function generateRfc(
  name: string | null | undefined,
  surname: string | null | undefined,
  lastname: string | null | undefined,
  birthDate: Date | string | null | undefined,
): string | null {
  if (!name || !surname || !birthDate) return null;

  const nameFull = removeAccents(name.trim());
  const nameKey = nameFull.replace(/\s+.*/g, "");
  const apFull = removeAccents(surname.trim());
  const apKey = stripParticles(apFull);
  const amFull = lastname ? removeAccents(lastname.trim()) : "";
  const amKey = amFull ? stripParticles(amFull) : "";

  const d = new Date(birthDate);
  const yy = String(d.getUTCFullYear()).slice(2);
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");

  const p1 = apKey[0] ?? "X";
  const p2 = firstInternalVowel(apKey);
  const p3 = amKey ? amKey[0] : "X";
  const p4 = nameKey[0] ?? "X";
  const p5to10 = `${yy}${mm}${dd}`;

  const rfc10 = `${p1}${p2}${p3}${p4}${p5to10}`;
  const fullName = `${apFull} ${amFull || "X"} ${nameFull}`;
  const key = rfcHomoclaveKey(fullName);
  const rfc12 = `${rfc10}${key}`;
  const digit = rfcVerificationDigit(rfc12);

  return `${rfc12}${digit}`.toUpperCase();
}

/** Returns a list of field labels needed but missing to generate the CURP. */
export function curpMissingFields(
  name: string | null | undefined,
  surname: string | null | undefined,
  birthDate: Date | string | null | undefined,
  genre: string | null | undefined,
  birthStateCode: string | null | undefined,
): string[] {
  const missing: string[] = [];
  if (!name) missing.push("nombre");
  if (!surname) missing.push("primer apellido");
  if (!birthDate) missing.push("fecha de nacimiento");
  if (!genre) missing.push("género");
  if (!birthStateCode) missing.push("lugar de nacimiento");
  return missing;
}

/** Returns a list of field labels needed but missing to generate the RFC. */
export function rfcMissingFields(
  name: string | null | undefined,
  surname: string | null | undefined,
  birthDate: Date | string | null | undefined,
): string[] {
  const missing: string[] = [];
  if (!name) missing.push("nombre");
  if (!surname) missing.push("primer apellido");
  if (!birthDate) missing.push("fecha de nacimiento");
  return missing;
}
