/**
 * Input sanitization helpers to prevent XSS, HTML injection, and XML attacks.
 */

// Strip all HTML/XML tags
const TAG_RE = /<\/?[^>]+(>|$)/g;

// Strip common dangerous patterns (event handlers, javascript:, data:, etc.)
const DANGEROUS_RE = /on\w+\s*=|javascript\s*:|data\s*:|vbscript\s*:|expression\s*\(|&#|\\x[0-9a-fA-F]{2}/gi;

// Strip XML entities and CDATA
const XML_RE = /<!\[CDATA\[.*?\]\]>|<!DOCTYPE[^>]*>|<\?xml[^>]*\?>/gi;

/** Sanitize a free-text string — strips tags, scripts, XML entities. */
export function sanitizeText(input: string): string {
  return input
    .replace(XML_RE, '')
    .replace(TAG_RE, '')
    .replace(DANGEROUS_RE, '')
    .trim();
}

/** Sanitize and enforce a max length. */
export function sanitizeInput(input: string, maxLength = 200): string {
  return sanitizeText(input).slice(0, maxLength);
}

/** Validate that a string contains only safe characters (letters, digits, spaces, common punctuation). */
export function isSafeText(input: string): boolean {
  // Allow Unicode letters, digits, spaces, and basic punctuation
  return !/[<>&"'`\\]/.test(input);
}
