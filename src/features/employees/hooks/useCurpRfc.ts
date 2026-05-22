/**
 * Utilities to auto-generate the derivable portion of CURP and RFC
 * from the employee identity fields available in the form.
 *
 * NOTE: Only the first 16 characters of CURP and first 10 of RFC can be
 * computed algorithmically. The homoclave (last 2 chars of CURP / last 3
 * chars of RFC) is assigned by RENAPO / SAT respectively and must be
 * entered manually.
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

/**
 * Generates the first 16 characters of the CURP.
 * Returns null if any required field is missing.
 */
export function generateCurpBase(
  name: string | null | undefined,
  surname: string | null | undefined,
  lastname: string | null | undefined,
  birthDate: string | null | undefined,
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

  return `${p1}${p2}${p3}${p4}${p5to10}${p11}${p12to13}${p14}${p15}${p16}`.toUpperCase();
}

/**
 * Generates the first 10 characters of the RFC (without homoclave).
 * Returns null if any required field is missing.
 */
export function generateRfcBase(
  name: string | null | undefined,
  surname: string | null | undefined,
  lastname: string | null | undefined,
  birthDate: string | null | undefined,
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

  return `${p1}${p2}${p3}${p4}${p5to10}`.toUpperCase();
}

/** Returns a list of field labels needed but missing to generate the CURP. */
export function curpMissingFields(
  name: string | null | undefined,
  surname: string | null | undefined,
  birthDate: string | null | undefined,
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
  birthDate: string | null | undefined,
): string[] {
  const missing: string[] = [];
  if (!name) missing.push("nombre");
  if (!surname) missing.push("primer apellido");
  if (!lastname) missing.push("segundo apellido");
  if (!birthDate) missing.push("fecha de nacimiento");
  return missing;
}
