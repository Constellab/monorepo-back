import type { IOptions } from 'sanitize-html';

import {
  TeBlock,
  TeBlockCodeData,
  TeBlockCodeLanguage,
  TeBlockHintData,
  TeBlockHintType,
  TeBlockListItem,
  TeBlockTableData,
  TeBlockType,
} from './lib/te-block.class';
import { TeRichText } from './lib/te-rich-text.class';

/**
 * `sanitize-html` is a CommonJS `export =` module, and the two applications compile this
 * library with different `esModuleInterop` settings — a default import would break at runtime
 * under one, a namespace import would fail to type-check under the other. A typed require is
 * the one form valid in both.
 *
 * Its version is pinned exactly, against the house `^` style: later releases depend on an
 * ESM-only `htmlparser2`, which `require()` cannot load on Node 20 — the floor this repo
 * declares in `package.json` — so a caret range would break the runtime on the next bump.
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const sanitizeHtml: (dirty: string, options?: IOptions) => string = require('sanitize-html');

/**
 * The single definition of a valid documentation rich text, applied on every write path —
 * the UI, the `gws community` CLI, and the MCP write tools. See
 * `docs/adr/0004-the-mcp-writes-documentation-by-operations.md`.
 *
 * Lives here (outside the shared `lib/` folder) because it depends on `sanitize-html`,
 * a back-only dependency we don't want to ship to the front repo — same reason as
 * `TeMarkdown`.
 *
 * Two boundaries are deliberate:
 *
 * - It never refuses a document. It cleans, and lists what it removed. A refusal breaks the
 *   editor for a user who did nothing wrong; silence would let a model believe it wrote what
 *   it wrote.
 * - The inline whitelist has no room for `te-mention-inline`, so this is for documentation
 *   content only. Applying it to comments or Space notes would erase their mentions.
 */
export class TeRichTextValidator {
  /** The inline tags a text block may carry. */
  private static readonly ALLOWED_TAGS = ['b', 'i', 'u', 'a', 'code', 'br'];

  /** A model writes these spontaneously; they mean the allowed tag and are rewritten to it. */
  private static readonly NORMALIZED_TAGS: Record<string, string> = { strong: 'b', em: 'i' };

  /** A tag whitelist alone does not catch a `href="javascript:…"`. */
  private static readonly ALLOWED_SCHEMES = ['http', 'https', 'mailto'];

  private static readonly INLINE_OPTIONS: IOptions = {
    allowedTags: TeRichTextValidator.ALLOWED_TAGS,
    allowedAttributes: { a: ['href'] },
    allowedSchemes: TeRichTextValidator.ALLOWED_SCHEMES,
    transformTags: TeRichTextValidator.NORMALIZED_TAGS,
    disallowedTagsMode: 'discard',
  };

  private static readonly PLAIN_TEXT_OPTIONS: IOptions = {
    allowedTags: [],
    allowedAttributes: {},
  };

  /**
   * Removes nothing, while applying the same tag normalization and entity handling as the two
   * configurations above.
   *
   * Its output is the yardstick that answers "did the strict pass actually remove something?",
   * which a regex over the raw string cannot answer: an event handler on an allowed tag, a
   * `target` on a link, a `class` on a `<code>` are all dropped invisibly otherwise. Comparing
   * the two outputs also stops the reverse mistake — reporting a removal that never happened.
   *
   * **Its output is never stored or returned.** `allowVulnerableTags` is set only because
   * allowing every tag makes `sanitize-html` warn on `<script>` and `<style>`, and this pass
   * exists solely to be compared against.
   */
  private static readonly NOTHING_REMOVED_OPTIONS: IOptions = {
    allowedTags: false,
    allowedAttributes: false,
    transformTags: TeRichTextValidator.NORMALIZED_TAGS,
    allowVulnerableTags: true,
  };

  /**
   * Opening or closing tag, up to the tag name. Used to report, never to secure.
   *
   * No whitespace is tolerated after `<` or `/`, matching how a parser reads a tag: prose like
   * `if x < script` is text, not a tag, and must not be reported as a removal that never
   * happened.
   */
  private static readonly TAG_REGEX = /<\/?([a-zA-Z][a-zA-Z0-9:-]*)/g;

  /** The `href` of an anchor, quoted or bare. Used to report, never to secure. */
  private static readonly HREF_REGEX = /<a\b[^>]*?\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;

  private static readonly NAMED_ENTITIES: Record<string, string> = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' ',
    colon: ':',
    tab: '\t',
    newline: '\n',
  };

  /**
   * Return a cleaned copy of `richText` and the list of what was removed from it.
   *
   * The input is left untouched — validation applies to writes only, and content already in
   * the database that breaks these rules is neither refused at read time nor repaired.
   */
  public static sanitize(richText: TeRichText): TeRichTextValidationResult {
    const warnings: string[] = [];
    const blocks: TeBlock[] = JSON.parse(JSON.stringify(richText.getBlocks() ?? []));

    blocks.forEach((block, index) => {
      this.sanitizeBlock(block, this.blockLabel(block, index), warnings);
    });

    return {
      richText: new TeRichText({
        version: richText.version,
        editorVersion: richText.editorVersion,
        blocks,
      }),
      warnings,
    };
  }

  private static blockLabel(block: TeBlock, index: number): string {
    const type = block?.type ?? 'unknown';
    return block?.id ? `Block ${block.id} (${type})` : `Block #${index + 1} (${type})`;
  }

  private static sanitizeBlock(block: TeBlock, label: string, warnings: string[]): void {
    if (block?.data == null) return;

    switch (block.type) {
      case TeBlockType.PARAGRAPH:
      case TeBlockType.HEADER:
        block.data.text = this.sanitizeInline(block.data.text, label, 'text', warnings);
        break;
      case TeBlockType.LIST:
        this.sanitizeListItems(block.data.items, label, warnings);
        break;
      case TeBlockType.TABLE:
        this.sanitizeTable(block.data, label, warnings);
        break;
      case TeBlockType.CODE:
        this.sanitizeCode(block, label, warnings);
        break;
      case TeBlockType.HINT:
        this.sanitizeHint(block, label, warnings);
        break;
      default:
        // A figure, a resource view or a file view carries no inline HTML: its fields are
        // filled from plain inputs, and sanitizing them would strip a caption's stray `<`.
        break;
    }
  }

  private static sanitizeListItems(
    items: TeBlockListItem[] | undefined,
    label: string,
    warnings: string[]
  ): void {
    if (!Array.isArray(items)) return;
    for (const item of items) {
      if (item == null) continue;
      item.content = this.sanitizeInline(item.content, label, 'a list item', warnings);
      this.sanitizeListItems(item.items, label, warnings);
    }
  }

  private static sanitizeTable(data: TeBlockTableData, label: string, warnings: string[]): void {
    if (!Array.isArray(data.content)) return;
    data.content = data.content.map((row) =>
      Array.isArray(row) ? row.map((cell) => this.sanitizeInline(cell, label, 'a cell', warnings)) : row
    );
  }

  private static sanitizeCode(block: TeBlock, label: string, warnings: string[]): void {
    const language = block.data.language;
    const supported = Object.values(TeBlockCodeLanguage) as string[];

    if (language != null && !supported.includes(language)) {
      warnings.push(
        `${label}: the language "${String(language)}" is not supported and was replaced by ` +
          `"${TeBlockCodeLanguage.PLAINTEXT}". Supported languages: ${supported.join(', ')}.`
      );
    }

    if (!supported.includes(language)) {
      (block.data as TeBlockCodeData).language = TeBlockCodeLanguage.PLAINTEXT;
    }
    // `data.code` is never sanitized: the renderer escapes it, and a sample legitimately
    // contains angle brackets.
  }

  private static sanitizeHint(block: TeBlock, label: string, warnings: string[]): void {
    const hintTypes = Object.values(TeBlockHintType) as string[];
    const { hintType, content } = block.data;

    const extraFields = Object.keys(block.data).filter(
      (field) => field !== 'hintType' && field !== 'content'
    );
    if (extraFields.length > 0) {
      warnings.push(
        `${label}: removed the unsupported field(s) ${extraFields.join(', ')}. A hint carries ` +
          `exactly "hintType" (${hintTypes.join(', ')}) and "content" (plain text); anything ` +
          `else is rendered by nothing, so the hint would show up empty.`
      );
    }

    if (hintType != null && !hintTypes.includes(hintType)) {
      warnings.push(
        `${label}: the hint type "${String(hintType)}" is not supported and was replaced by ` +
          `"${TeBlockHintType.INFO}". Supported types: ${hintTypes.join(', ')}.`
      );
    }

    // Rebuilt rather than patched, so the block ends up with exactly the two fields a hint has.
    const sanitized: TeBlockHintData = {
      hintType: hintTypes.includes(hintType) ? hintType : TeBlockHintType.INFO,
      content: this.sanitizePlainText(content, label, warnings),
    };
    block.data = sanitized;
  }

  /**
   * Keep the allowed inline tags, drop the rest, and neutralize a forbidden link scheme.
   *
   * A non-string is passed through: a block whose text is absent is not this method's business
   * to invent.
   */
  private static sanitizeInline<T>(value: T, label: string, field: string, warnings: string[]): T | string {
    if (typeof value !== 'string') return value;

    const clean = sanitizeHtml(value, this.INLINE_OPTIONS);

    // A forbidden scheme is dropped by the permissive pass too, so the comparison below cannot
    // see it. It is reported on its own.
    this.reportDisallowedHrefs(value, label, field, warnings);

    if (clean !== sanitizeHtml(value, this.NOTHING_REMOVED_OPTIONS)) {
      this.reportRemovedMarkup(value, label, field, warnings);
    }

    return this.keepNonBreakingSpaces(clean);
  }

  /**
   * A hint's content is plain text: every tag goes, and the entities `sanitize-html` leaves
   * behind are decoded, so what is stored is the text itself. Escaping it would show a reader
   * `a &amp; b` where the author wrote `a & b`.
   */
  private static sanitizePlainText(value: unknown, label: string, warnings: string[]): string {
    if (typeof value !== 'string') return '';

    const stripped = sanitizeHtml(value, this.PLAIN_TEXT_OPTIONS);

    // Both passes escape entities the same way, so a difference is markup and nothing else.
    if (stripped !== sanitizeHtml(value, this.NOTHING_REMOVED_OPTIONS)) {
      warnings.push(
        `${label}: removed the HTML from "content", which is plain text — the hint's renderer ` +
          `does not interpret it.`
      );
    }

    return this.decodeEntities(stripped);
  }

  /**
   * `sanitize-html` decodes entities and re-emits a non-breaking space as its character.
   * Writing `&nbsp;` back keeps a saved document byte-identical to what the editor sent,
   * so the derived modification history stays quiet on a save that changed nothing.
   */
  private static keepNonBreakingSpaces(html: string): string {
    return html.replace(/\u00A0/g, '&nbsp;');
  }

  /**
   * Called only once something is known to have been removed. It names the disallowed tags when
   * it can see them, and falls back to naming the rule when what went was an attribute — which
   * a scan of the raw string cannot single out.
   */
  private static reportRemovedMarkup(html: string, label: string, field: string, warnings: string[]): void {
    const disallowedTags = [
      ...new Set(
        this.tagNamesOf(html).filter(
          (tag) => !this.ALLOWED_TAGS.includes(tag) && this.NORMALIZED_TAGS[tag] == null
        )
      ),
    ];

    const removed =
      disallowedTags.length > 0
        ? `the tag(s) ${disallowedTags.map((tag) => `<${tag}>`).join(', ')}`
        : 'an attribute';

    warnings.push(
      `${label}: removed ${removed} from ${field}. Allowed inline tags: ` +
        `${this.ALLOWED_TAGS.map((tag) => `<${tag}>`).join(', ')}, and the only attribute kept ` +
        `is the \`href\` of an \`<a>\`.`
    );
  }

  private static reportDisallowedHrefs(html: string, label: string, field: string, warnings: string[]): void {
    for (const match of html.matchAll(this.HREF_REGEX)) {
      const href = match[1] ?? match[2] ?? match[3] ?? '';
      const scheme = this.schemeOf(href);
      if (scheme == null || this.ALLOWED_SCHEMES.includes(scheme)) continue;

      warnings.push(
        `${label}: dropped the link "${href}" from ${field} — only ` +
          `${this.ALLOWED_SCHEMES.join(', ')} links are allowed. The link text was kept.`
      );
    }
  }

  private static tagNamesOf(html: string): string[] {
    return [...html.matchAll(this.TAG_REGEX)].map((match) => match[1].toLowerCase());
  }

  /**
   * The scheme of a URL, or null when it is relative. Entities and layout whitespace are
   * removed first: `href="&#106;avascript:…"` and `href=" JavaScript:…"` are the same URL.
   */
  private static schemeOf(href: string): string | null {
    const normalized = this.decodeEntities(href)
      // eslint-disable-next-line no-control-regex
      .replace(/[\s\u0000-\u001f\u007f]/g, '')
      .toLowerCase();
    return /^([a-z][a-z0-9+.-]*):/.exec(normalized)?.[1] ?? null;
  }

  private static decodeEntities(value: string): string {
    return value
      .replace(/&#x([0-9a-f]+);?/gi, (whole, hex) => this.fromCodePoint(parseInt(hex, 16), whole))
      .replace(/&#(\d+);?/g, (whole, decimal) => this.fromCodePoint(parseInt(decimal, 10), whole))
      .replace(/&([a-z]+);/gi, (whole, name: string) => this.NAMED_ENTITIES[name.toLowerCase()] ?? whole);
  }

  private static fromCodePoint(codePoint: number, fallback: string): string {
    try {
      return String.fromCodePoint(codePoint);
    } catch {
      return fallback;
    }
  }
}

export interface TeRichTextValidationResult {
  /** A cleaned copy. The rich text handed to `sanitize` is not modified. */
  richText: TeRichText;
  /** What was removed, one line per removal. Empty when the document was already valid. */
  warnings: string[];
}
