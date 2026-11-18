export function readScriptData<T>(name: string): T | null {
  const el = document.querySelector(`script[data-script-data="${name}"]`);
  return el?.textContent ? (JSON.parse(el.textContent) as T) : null;
}
