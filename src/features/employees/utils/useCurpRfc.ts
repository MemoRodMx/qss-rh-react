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

function removeAccents(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
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

// ── RFC: homoclave (positions 11-13) ───────────────────────────────────────

/** SAT character → 2-digit value mapping (Anexo 1 de la RMF). */
const RFC_MAP: Record<string, string> = {
  " ": "00",
  "0": "00",
  "1": "01",
  "2": "02",
  "3": "03",
  "4": "04",
  "5": "05",
  "6": "06",
  "7": "07",
  "8": "08",
  "9": "09",
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

const RFC_HOMOCLAVE_ALPHABET = "123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function rfcHomoclave(fullName: string): string {
  let numeric = "";
  for (const c of fullName) {
    numeric += RFC_MAP[c] ?? "00";
  }

  let sum = 0;
  for (let i = 0; i < numeric.length; i += 2) {
    const a = Number(numeric[i]);
    const b = Number(numeric[i + 1] ?? "0");
    sum += a * 10 + b;
  }

  let q = sum;
  const c1 = RFC_HOMOCLAVE_ALPHABET[q % 34];
  q = Math.floor(q / 34);
  const c2 = RFC_HOMOCLAVE_ALPHABET[q % 34];
  q = Math.floor(q / 34);
  const c3 = RFC_HOMOCLAVE_ALPHABET[q % 34];

  return c1 + c2 + c3;
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

  const n = removeAccents(name.trim()).replace(/\s+.*/g, "");
  const ap = removeAccents(surname.trim());
  const am = lastname ? removeAccents(lastname.trim()) : "";

  const stateCode = CURP_STATE_MAP[birthStateCode.toUpperCase()] ?? "NE";
  const sexCode = genre.toUpperCase() === "M" ? "H" : "M";

  const d = new Date(birthDate);
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");

  const p1 = ap[0] ?? "X";
  const p2 = firstInternalVowel(ap);
  const p3 = am[0] ?? "X";
  const p4 = n[0] ?? "X";
  const p5to10 = `${yy}${mm}${dd}`;
  const p11 = sexCode;
  const p12to13 = stateCode;
  const p14 = firstInternalConsonant(ap);
  const p15 = am ? firstInternalConsonant(am) : "X";
  const p16 = firstInternalConsonant(n);

  const curp16 = `${p1}${p2}${p3}${p4}${p5to10}${p11}${p12to13}${p14}${p15}${p16}`;
  const homoclave = curpHomoclave(curp16, d.getFullYear());

  return `${curp16}${homoclave}`.toUpperCase();
}

/** Generates the full 13-character RFC including homoclave (positions 11-13)
 *  derived from the full name via the SAT algorithm.
 *  Returns null if any required field is missing. */
export function generateRfc(
  name: string | null | undefined,
  surname: string | null | undefined,
  lastname: string | null | undefined,
  birthDate: Date | string | null | undefined,
): string | null {
  if (!name || !surname || !birthDate) return null;

  const n = removeAccents(name.trim()).replace(/\s+.*/g, "");
  const ap = removeAccents(surname.trim());
  const am = lastname ? removeAccents(lastname.trim()) : "";

  const d = new Date(birthDate);
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");

  const p1 = ap[0] ?? "X";
  const p2 = firstInternalVowel(ap);
  const p3 = am ? am[0] : "X";
  const p4 = n[0] ?? "X";
  const p5to10 = `${yy}${mm}${dd}`;

  const rfc10 = `${p1}${p2}${p3}${p4}${p5to10}`;
  const fullName = `${ap} ${am || "X"} ${n}`;
  const homoclave = rfcHomoclave(fullName);

  return `${rfc10}${homoclave}`.toUpperCase();
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
  lastname: string | null | undefined,
  birthDate: Date | string | null | undefined,
): string[] {
  const missing: string[] = [];
  if (!name) missing.push("nombre");
  if (!surname) missing.push("primer apellido");
  if (!lastname) missing.push("segundo apellido");
  if (!birthDate) missing.push("fecha de nacimiento");
  return missing;
}
