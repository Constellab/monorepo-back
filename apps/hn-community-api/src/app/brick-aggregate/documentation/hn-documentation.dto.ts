import { TeRichTextDTO } from '@monorepo/te-text-editor';

import { HnBaseDto } from '../../core/model/entities/hn-base.dto';
import { HnDocumentation } from './hn-documentation.entity';

export class HnDocumentationDto extends HnBaseDto {
  title: string;
  content: TeRichTextDTO;
  path: string;
  completePath: string;
  order: number;

  constructor(documentation: HnDocumentation) {
    super(documentation);
    this.title = documentation.title;
    this.content = documentation.getRichText().toJson();
    this.path = documentation.path;
    this.completePath = documentation.completePath;
    this.order = documentation.order;
  }
}

export class HnDocumentationShortDto extends HnBaseDto {
  title: string;
  path: string;
  completePath: string;
  order: number;

  constructor(documentation: HnDocumentation) {
    super(documentation);
    this.title = documentation.title;
    this.path = documentation.path;
    this.completePath = documentation.completePath;
    this.order = documentation.order;
  }
}

/**
 * The response of a content update.
 *
 * The documentation is wrapped rather than returned bare so the sanitization warnings ride
 * alongside it: a caller that does not care (the UI) ignores them, and the MCP hands them back
 * to the model that wrote the content. See
 * `docs/adr/0004-the-mcp-writes-documentation-by-operations.md`.
 */
export class HnDocumentationContentUpdateDto {
  documentation: HnDocumentation;

  /**
   * What the server removed from the content it was sent, one line per removal. Empty when the
   * content was already valid, which is the normal case for the editor.
   */
  warnings: string[];

  /**
   * The revision of the content that was just stored — not of the content that was sent, which the
   * sanitizer may have cleaned. A caller chaining a second edit locks against this one.
   */
  revision: string;

  constructor(documentation: HnDocumentation, warnings: string[], revision: string) {
    this.documentation = documentation;
    this.warnings = warnings;
    this.revision = revision;
  }
}
