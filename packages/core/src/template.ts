/**
 * Substitute `{{slot-name}}` placeholders with values. Missing slots throw,
 * not silently leave the placeholder, because a missing slot indicates a
 * content/template inconsistency — see ADR-010.
 */
export function fillTemplate(pattern: string, values: Readonly<Record<string, string>>): string {
  return pattern.replace(/\{\{(\w[\w-]*)\}\}/g, (_match, key: string) => {
    if (!(key in values)) {
      throw new Error(`fillTemplate: missing slot "${key}"`);
    }
    return values[key]!;
  });
}
