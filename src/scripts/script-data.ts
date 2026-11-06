/**
 * Reads what a ScriptData component put in the page for the scripts (texts in the page's language, content the
 * form needs). Null when the page has none.
 */
export function readScriptData<T>(name: string): T | null {
  const el = document.querySelector(`script[data-script-data="${name}"]`);
  return el?.textContent ? (JSON.parse(el.textContent) as T) : null;
}
