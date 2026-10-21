/**
 * The greeting the app shows: "Bonjour, <name> !", or "Bonjour, le monde !" without a name.
 *
 * The name is trimmed and cut to 40 characters, so that a long or blank name never breaks the
 * page.
 */

export const MAX_NAME_LENGTH = 40;

/** Returns the greeting for `name`, a text that may be missing, blank or too long. */
export function greeting(name) {
  const cleaned = (name ?? '').trim().slice(0, MAX_NAME_LENGTH);
  return `Bonjour, ${cleaned === '' ? 'le monde' : cleaned} !`;
}
