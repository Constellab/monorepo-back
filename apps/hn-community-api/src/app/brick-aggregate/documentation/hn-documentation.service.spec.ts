import {
  TeBlock,
  TeBlockType,
  TeRichText,
  TeRichTextBlockModification,
  TeRichTextModificationType,
  TeRichTextOperationInput,
  TeRichTextOperations,
  TeRichTextRevision,
} from '@monorepo/te-text-editor';
import { HttpStatus } from '@nestjs/common';
import { Repository } from 'typeorm';

import { HnCurrentUserHelper } from '../../core/utils/hn-current-user.helper';
import { HnUser } from '../../users/hn-user.entity';
import { HnDocumentation } from './hn-documentation.entity';
import { HnDocumentationService } from './hn-documentation.service';

/**
 * Unit test of the write path's wiring: that the content actually stored is the sanitized one,
 * and that the warnings reach the response. The validator's own rules are covered in
 * `libs/te-text-editor/src/te-rich-text-validator.class.spec.ts`.
 */
describe('HnDocumentationService.updateContent', () => {
  const USER_ID = 'user-1';

  let doc: HnDocumentation;
  let saved: HnDocumentation[];
  let service: HnDocumentationService;

  /** A repository standing in for TypeORM: it finds the one doc, and records what is saved. */
  function buildRepository(): Repository<HnDocumentation> {
    return {
      findOneBy: () => Promise.resolve(doc),
      save: (entity: HnDocumentation) => {
        saved.push(entity);
        return Promise.resolve(entity);
      },
    } as unknown as Repository<HnDocumentation>;
  }

  function richTextWith(text: string): TeRichText {
    return new TeRichText({
      ...TeRichText.emptyJson(),
      blocks: [{ id: 'b1', type: TeBlockType.PARAGRAPH, data: { text } }],
    });
  }

  /** The text of the first block of whatever was handed to `save`. */
  function storedText(): string {
    return saved[0].content?.blocks[0].data.text;
  }

  beforeEach(() => {
    doc = new HnDocumentation();
    doc.id = 'doc-1';
    doc.content = null;
    doc.modifications = null;
    saved = [];
    service = new HnDocumentationService(buildRepository());

    const user = new HnUser();
    user.id = USER_ID;
    jest.spyOn(HnCurrentUserHelper, 'getAndCheckCurrentUser').mockReturnValue(user);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('stores the sanitized content, not what it was sent', async () => {
    await service.updateContent('doc-1', richTextWith('<script>alert(1)</script>keep'));

    expect(saved).toHaveLength(1);
    expect(storedText()).toBe('keep');
  });

  it('returns the saved documentation together with the warnings', async () => {
    const result = await service.updateContent('doc-1', richTextWith('<div>x</div>'));

    expect(result.documentation).toBe(saved[0]);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain('<div>');
  });

  it('returns no warning when the content was already valid', async () => {
    const result = await service.updateContent('doc-1', richTextWith('a <b>valid</b> paragraph'));

    expect(result.warnings).toEqual([]);
    expect(storedText()).toBe('a <b>valid</b> paragraph');
  });

  it('neutralizes a forbidden link scheme on the way to the database', async () => {
    const result = await service.updateContent(
      'doc-1',
      richTextWith('<a href="javascript:alert(1)">click</a>')
    );

    expect(storedText()).toBe('<a>click</a>');
    expect(result.warnings).toHaveLength(1);
  });

  /**
   * The modification history is derived by comparing the stored content with the incoming one,
   * so it has to describe what was stored. A history built from the unsanitized content would
   * claim the page holds markup it does not.
   */
  it('derives the history from the sanitized content', async () => {
    await service.updateContent('doc-1', richTextWith('<div>hello</div>'));

    expect(saved[0].modifications).not.toContain('<div>');
    expect(saved[0].modifications).toContain('hello');
  });

  describe('the optional revision', () => {
    /** The revision of the content currently in the database. */
    function currentRevision(): string {
      return TeRichTextRevision.of(doc.getRichText());
    }

    beforeEach(() => {
      doc.content = richTextWith('the content that is stored').toJson();
    });

    it('lets the write through when it is the one the caller read', async () => {
      const result = await service.updateContent('doc-1', richTextWith('an edit'), currentRevision());

      expect(storedText()).toBe('an edit');
      expect(result.documentation).toBe(saved[0]);
    });

    it('refuses the write with a 409 when it is stale', async () => {
      const stale = TeRichTextRevision.of(richTextWith('what the caller read'));

      await expect(service.updateContent('doc-1', richTextWith('an edit'), stale)).rejects.toMatchObject({
        status: HttpStatus.CONFLICT,
      });
      expect(saved).toEqual([]);
    });

    it('names both revisions, so the caller can see its own is the old one', async () => {
      const stale = TeRichTextRevision.of(richTextWith('what the caller read'));

      await expect(service.updateContent('doc-1', richTextWith('an edit'), stale)).rejects.toThrow(
        new RegExp(`${stale}.*${currentRevision()}`)
      );
    });

    /**
     * An empty string is not "no revision": a caller sending its uninitialized field would get
     * last-write-wins out of a request that looks locked.
     */
    it('refuses an empty revision rather than reading it as no revision', async () => {
      await expect(service.updateContent('doc-1', richTextWith('an edit'), '')).rejects.toMatchObject({
        status: HttpStatus.CONFLICT,
      });
      expect(saved).toEqual([]);
    });

    it('behaves exactly as before when no revision is sent', async () => {
      const result = await service.updateContent('doc-1', richTextWith('an edit'));

      expect(storedText()).toBe('an edit');
      expect(result.warnings).toEqual([]);
    });

    it('returns the revision of what was stored, so a second edit can lock against it', async () => {
      const result = await service.updateContent('doc-1', richTextWith('an edit'));

      expect(result.revision).toBe(TeRichTextRevision.of(saved[0].getRichText()));
      expect(result.revision).not.toBe(TeRichTextRevision.of(richTextWith('the content that is stored')));
    });

    /**
     * The revision has to describe the content the database holds, not the content that was sent:
     * a caller locking against the latter would be refused on its very next write.
     */
    it('returns the revision of the sanitized content when the content was cleaned', async () => {
      const result = await service.updateContent('doc-1', richTextWith('<div>x</div>'));

      expect(result.warnings).toHaveLength(1);
      expect(result.revision).toBe(TeRichTextRevision.of(richTextWith('x')));
    });
  });

  /**
   * The history is derived from a comparison matched by block id, which is the whole reason the
   * MCP writes by operations rather than by whole document — see
   * `docs/adr/0004-the-mcp-writes-documentation-by-operations.md`. These two tests are the claim
   * the ADR rests on, checked end to end: the library that applies the operations, then the write
   * path that derives the history from what it produced.
   */
  describe('the history a batch of operations leaves behind', () => {
    function paragraph(id: string, text: string): TeBlock {
      return { id, type: TeBlockType.PARAGRAPH, data: { text } };
    }

    function apply(...operations: TeRichTextOperationInput[]): TeRichText {
      const result = TeRichTextOperations.apply(doc.getRichText(), operations);
      if (!result.ok) {
        throw new Error(`Expected the batch to apply, got: ${result.errors.join(' / ')}`);
      }
      return result.richText;
    }

    function modificationsOf(documentation: HnDocumentation): TeRichTextBlockModification[] {
      return documentation.getRichTextAggregate().modifications.getModifications();
    }

    beforeEach(() => {
      doc.content = new TeRichText({
        ...TeRichText.emptyJson(),
        blocks: [paragraph('p1', 'One'), paragraph('p2', 'Two'), paragraph('p3', 'Three')],
      }).toJson();
    });

    it('names exactly the blocks the batch changed', async () => {
      await service.updateContent(
        'doc-1',
        apply({ op: 'update', blockId: 'p2', data: { text: 'Two, edited' } }, { op: 'delete', blockId: 'p3' })
      );

      expect(
        modificationsOf(saved[0]).map((modification) => [modification.blockId, modification.type])
      ).toEqual([
        ['p3', TeRichTextModificationType.DELETED],
        ['p2', TeRichTextModificationType.UPDATED],
      ]);
    });

    it('groups the batch as one action, so the page reads as one edit', async () => {
      await service.updateContent(
        'doc-1',
        apply(
          { op: 'update', blockId: 'p1', data: { text: 'One, edited' } },
          { op: 'insert', type: 'paragraph', data: { text: 'Four' }, at: 'end' }
        )
      );

      const groupIds = modificationsOf(saved[0]).map((modification) => modification.groupId);
      expect(groupIds).toHaveLength(2);
      expect(new Set(groupIds).size).toBe(1);
      expect(groupIds[0]).toBeDefined();
    });
  });
});
