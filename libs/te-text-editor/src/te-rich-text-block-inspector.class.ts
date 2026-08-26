import {
  TeBlock,
  TeBlockFigureData,
  TeBlockFileViewData,
  TeBlockHintData,
  TeBlockListItem,
  TeBlockTableData,
  TeBlockType,
  TeBlockViewData,
} from './lib/te-block.class';
import { TeCanonicalJson } from './lib/te-canonical-json.class';
import { TeRichText } from './lib/te-rich-text.class';
import { TeRichTextValidator } from './te-rich-text-validator.class';

/** A block of a document, and whether a model may rewrite it. */
export interface TeInspectedBlock {
  block: TeBlock;
  /** `false` means: this block can be moved or deleted, never rewritten. */
  editable: boolean;
  /** Why it cannot be rewritten, and what it holds. Set only when `editable` is `false`. */
  summary?: string;
}

/**
 * Tells, block by block, what a model is allowed to do with a document it has read.
 *
 * A model that rewrites a block it does not understand destroys it silently: a figure loses the
 * filename its image is stored under, a resource view loses the ids that make it render at all,
 * and nothing in the response says so — the block simply becomes an empty box on a public page.
 * Marking those blocks non-editable, while still returning them whole, is what lets them survive
 * an edit: the model can move them or delete them, which is all it needs to restructure a page.
 *
 * Two reasons make a block non-editable:
 *
 * - a **rich block** (figure, resource view, file view) is filled by the editor from an upload or
 *   from a lab's data, not by typing;
 * - a block carrying **HTML outside the whitelist**, or one the validator would otherwise
 *   **repair**, is content the server would change on the way back in. Handing it to a model as
 *   editable would make it answer for a cleanup it never asked for.
 *
 * Lives outside the shared `lib/` folder because it leans on {@link TeRichTextValidator}, which
 * needs a back-only dependency.
 */
export class TeRichTextBlockInspector {
  /** Filled from an upload or from a lab's data — never by typing. */
  private static readonly RICH_TYPES: TeBlockType[] = [
    TeBlockType.FIGURE,
    TeBlockType.RESOURCE_VIEW,
    TeBlockType.FILE_VIEW,
  ];

  private static readonly RICH_REASON =
    'a rich block: its fields come from an upload or from a lab, so rewriting it would break it. ' +
    'Move it or delete it, never rewrite it.';

  /** How much of a block's text a summary quotes. */
  private static readonly PREVIEW_LENGTH = 120;

  /**
   * Whether a block of this type is filled from an upload or from a lab rather than by typing.
   *
   * Read by the write path as well as by this class: the same property that makes such a block
   * unrewritable makes it uninsertable, since inserting one would mean performing the upload it
   * points at.
   */
  public static isRichType(type: TeBlockType): boolean {
    return this.RICH_TYPES.includes(type);
  }

  /**
   * Inspect every block of `richText`, in document order.
   *
   * The blocks come back as they are stored, untouched: validation applies to writes only, and
   * content already in the database that breaks the rules is neither repaired nor refused at read
   * time. What this adds is the verdict beside each one.
   */
  public static inspect(richText: TeRichText): TeInspectedBlock[] {
    return (richText.getBlocks() ?? []).map((block) => this.inspectBlock(block, richText));
  }

  private static inspectBlock(block: TeBlock, richText: TeRichText): TeInspectedBlock {
    if (block == null) {
      return { block, editable: false, summary: 'An empty block. Delete it.' };
    }

    if (this.isRichType(block.type)) {
      return { block, editable: false, summary: `${this.describe(block)} — ${this.RICH_REASON}` };
    }

    const cleanups = this.whatTheServerWouldChange(block, richText);
    if (cleanups.length > 0) {
      return {
        block,
        editable: false,
        summary:
          `${this.describe(block)} — the server would clean it on write: ${cleanups.join(' ')} ` +
          `Move it or delete it; rewriting it would make you answer for that cleanup.`,
      };
    }

    return { block, editable: true };
  }

  /**
   * Run the write-path validator on this one block and report what it would do to it.
   *
   * The block is wrapped in a rich text carrying the document's own format version, so the
   * wrapping cannot trigger a migration and pass a migration's rewrite off as a cleanup.
   *
   * The warnings are the answer whenever there are any. The canonical comparison catches the rest:
   * a hint whose `content` is not a string is silently replaced by an empty one, and no warning
   * describes that.
   */
  private static whatTheServerWouldChange(block: TeBlock, richText: TeRichText): string[] {
    const single = new TeRichText(
      { version: richText.version, editorVersion: richText.editorVersion, blocks: [block] },
      richText.version
    );
    const { richText: sanitized, warnings } = TeRichTextValidator.sanitize(single);

    if (warnings.length > 0) {
      return warnings;
    }

    const before = TeCanonicalJson.stringify(block);
    const after = TeCanonicalJson.stringify(sanitized.getBlocks()[0]);
    return before === after ? [] : ['it does not have the shape its type expects.'];
  }

  /** A readable line naming what the block holds, so a model can decide where to move it. */
  private static describe(block: TeBlock): string {
    const data = block.data ?? {};

    switch (block.type) {
      case TeBlockType.PARAGRAPH:
        return `Paragraph "${this.preview(data.text)}"`;
      case TeBlockType.HEADER:
        return `Header (level ${String(data.level ?? '?')}) "${this.preview(data.text)}"`;
      case TeBlockType.LIST:
        return `List (${data.style ?? 'unordered'}, ${this.countListItems(data.items)} item(s))`;
      case TeBlockType.TABLE:
        return `Table (${this.describeTable(data)})`;
      case TeBlockType.CODE:
        return `Code block (${data.language ?? 'unknown language'}, ${this.countLines(data.code)} line(s))`;
      case TeBlockType.HINT:
        return this.describeHint(data);
      case TeBlockType.FIGURE:
        return this.describeFigure(data);
      case TeBlockType.RESOURCE_VIEW:
        return this.describeResourceView(data);
      case TeBlockType.FILE_VIEW:
        return this.describeFileView(data);
      default:
        return `Block of type "${String(block.type)}"`;
    }
  }

  private static describeHint(data: TeBlockHintData): string {
    return `Hint (${data.hintType ?? 'unknown type'}) "${this.preview(data.content)}"`;
  }

  private static describeFigure(data: TeBlockFigureData): string {
    const filename = data.filename ?? 'unknown';
    return `Figure "${this.preview(data.title || data.caption)}" (file ${filename})`;
  }

  private static describeResourceView(data: TeBlockViewData): string {
    const method = data.view_method_name ?? 'unknown view';
    return `Resource view "${this.preview(data.title || data.caption)}" (${method})`;
  }

  private static describeFileView(data: TeBlockFileViewData): string {
    return `File view "${this.preview(data.title || data.caption)}"`;
  }

  private static describeTable(data: TeBlockTableData): string {
    if (!Array.isArray(data.content)) return 'no row';
    const columns = Array.isArray(data.content[0]) ? data.content[0].length : 0;
    return `${data.content.length} row(s) × ${columns} column(s)`;
  }

  private static countListItems(items: TeBlockListItem[] | undefined): number {
    if (!Array.isArray(items)) return 0;
    return items.reduce((total, item) => total + 1 + this.countListItems(item?.items), 0);
  }

  private static countLines(code: unknown): number {
    return typeof code === 'string' ? code.split('\n').length : 0;
  }

  /** The block's text, tags dropped, cut to one readable line. */
  private static preview(value: unknown): string {
    if (typeof value !== 'string') return '';
    const plain = value
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return plain.length > this.PREVIEW_LENGTH ? `${plain.slice(0, this.PREVIEW_LENGTH)}…` : plain;
  }
}
