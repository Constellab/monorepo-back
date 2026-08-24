/**
 * A JSON string that depends on a value's content and not on the order its keys happen to be
 * written in.
 *
 * Two things need that property, and both would be wrong without it:
 *
 * - a document's revision hash ({@link TeRichTextRevision}), which must be the same for two
 *   reads of an unchanged document — a round trip through the database, or through a client that
 *   rebuilt a block, reorders keys freely;
 * - the "did the sanitizer change this block?" comparison, since the sanitizer rebuilds a hint
 *   block rather than patching it, and would otherwise look like it changed a valid one.
 *
 * Lives in the shared `lib/` folder because it is plain JSON handling: no Node API, nothing the
 * front repo cannot compile.
 */
export class TeCanonicalJson {
  public static stringify(value: unknown): string {
    return JSON.stringify(TeCanonicalJson.canonicalize(value));
  }

  /**
   * Recursively rewrite objects with their keys sorted. Arrays keep their order — in a rich text
   * the order of the blocks *is* content.
   */
  private static canonicalize(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map((item) => this.canonicalize(item));
    }
    if (value !== null && typeof value === 'object') {
      const source = value as Record<string, unknown>;
      const sorted: Record<string, unknown> = {};
      for (const key of Object.keys(source).sort()) {
        sorted[key] = this.canonicalize(source[key]);
      }
      return sorted;
    }
    return value;
  }
}
