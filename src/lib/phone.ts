/** Strips punctuation and any repeated `998` country prefix, keeping 9 local digits. */
function localDigits(input: string): string {
  let digits = input.replace(/\D/g, '');
  // The field pre-fills `+998 `, so pasting a full number can leave a doubled
  // prefix ("998998901234567"). Drop leading country codes until only the
  // 9-digit local part can remain.
  while (digits.length > 9 && digits.startsWith('998')) digits = digits.slice(3);
  return digits.slice(0, 9);
}

/** Display mask for Uzbek numbers: `+998 (90) 123-45-67`. */
export function formatUzPhone(input: string): string {
  const local = localDigits(input);
  if (local.length === 0) return '+998 ';

  const parts = [local.slice(0, 2), local.slice(2, 5), local.slice(5, 7), local.slice(7, 9)].filter(
    Boolean,
  );

  let out = `+998 (${parts[0]}`;
  if (local.length >= 2) out += ')';
  if (parts[1]) out += ` ${parts[1]}`;
  if (parts[2]) out += `-${parts[2]}`;
  if (parts[3]) out += `-${parts[3]}`;
  return out;
}

/** True once the number holds a full 9-digit local part. */
export function isCompleteUzPhone(input: string): boolean {
  return localDigits(input).length === 9;
}

/** E.164 form used by the API and the database. */
export function toE164(input: string): string {
  return `+998${localDigits(input)}`;
}
