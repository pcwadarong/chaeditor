/**
 * Converts free-form text into a lowercase hyphenated slug.
 */
export const slugifyText = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

/**
 * Normalizes a user-entered slug value.
 */
export const normalizeSlugInput = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

/**
 * Checks whether a slug is valid for persistence.
 */
export const isValidSlugFormat = (value: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
