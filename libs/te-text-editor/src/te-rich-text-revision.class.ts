import { createHash } from 'node:crypto';

import { TeCanonicalJson } from './lib/te-canonical-json.class';
import { TeRichText } from './lib/te-rich-text.class';

/**
 * The revision of a documentation's content: a short hash of the blocks, computed at read time
 * and handed back at write time as an optimistic lock.
 *
 * Two write paths reach one document — the `gws community` CLI pushing a whole file and the MCP
 * tools driven by a model (see
 * `docs/adr/0004-the-mcp-writes-documentation-by-operations.md`). Without this, the later of two
 * concurrent writes silently wins, right where those paths meet: the model reads, the CLI pushes,
 * the model writes the edit it prepared against content that no longer exists.
 *
 * It is derived, never stored: a revision is always recomputed from the content it describes, so
 * there is no column to keep in step with the blocks.
 *
 * Lives outside the shared `lib/` folder because it needs Node's `crypto` — same reason as
 * {@link TeMarkdown} and {@link TeRichTextValidator}.
 */
export class TeRichTextRevision {
  /**
   * Hex characters kept out of the sha256. 12 is short enough to travel in a tool response and
   * be read back by a model, and far more than the collision resistance this needs: the hash
   * answers "is this the content I read?" for one document, not "is this content unique among
   * all documents".
   */
  private static readonly LENGTH = 12;

  /**
   * The revision of `richText`.
   *
   * Only the blocks are hashed. `version` and `editorVersion` describe the format the content is
   * stored in, not the content: a migration that rewrites nothing must not invalidate an edit a
   * model has already prepared.
   */
  public static of(richText: TeRichText): string {
    const canonical = TeCanonicalJson.stringify(richText.getBlocks() ?? []);
    return createHash('sha256').update(canonical).digest('hex').slice(0, TeRichTextRevision.LENGTH);
  }
}
