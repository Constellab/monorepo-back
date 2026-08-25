import { BlConflictException, BlRequestContext, BlUnauthorizedException } from '@monorepo/back-core-lib';
import {
  TeBlock,
  TeBlockType,
  TeRichText,
  TeRichTextOperationInput,
  TeRichTextOperations,
  TeRichTextRevision,
} from '@monorepo/te-text-editor';
import { Request, Response } from 'express';
import { Repository } from 'typeorm';

import { HnBrickEntity } from '../brick-aggregate/brick/hn-brick.entity';
import { HnBrickMajorVersion } from '../brick-aggregate/brick-major-version/hn-brick-major-version.entity';
import { HnDocumentationContentUpdateDto } from '../brick-aggregate/documentation/hn-documentation.dto';
import { HnDocumentation } from '../brick-aggregate/documentation/hn-documentation.entity';
import { HnDocumentationService } from '../brick-aggregate/documentation/hn-documentation.service';
import { HnFolder } from '../brick-aggregate/folder/hn-folder.entity';
import { HnBrickSecurity } from '../brick-aggregate/security/hn-brick.security';
import { HnCurrentUserHelper } from '../core/utils/hn-current-user.helper';
import { HnUser } from '../users/hn-user.entity';
import { HnMcpDocAuthorization } from './hn-mcp-doc-authorization.service';
import { HnMcpDocEditResult, HnMcpDocEditService } from './hn-mcp-doc-edit.service';

/**
 * Unit test of what the edit tool adds on top of the library that applies the operations: who may
 * write, the revision lock and what the response costs. The operations themselves — the four verbs,
 * the position rules, the batch bound — are covered in
 * `libs/te-text-editor/src/te-rich-text-operations.class.spec.ts`.
 */
describe('HnMcpDocEditService', () => {
  const USER_ID = 'user-1';
  const DOC_ID = 'doc-1';

  let doc: HnDocumentation | null;
  /** The rich text `updateContent` was handed, i.e. what would have been stored. */
  let written: TeRichText | null;
  /** The revision `updateContent` was handed, i.e. whether the lock travelled with the write. */
  let writtenRevision: string | undefined;
  let warnings: string[];
  let authorized: boolean;
  /** Something other than a verdict going wrong inside the authorization check. */
  let securityFailure: Error | null;
  /** Someone else's write landing between this call's revision check and its own write. */
  let writeCollides: boolean;
  let service: HnMcpDocEditService;

  function paragraph(id: string, text: string): TeBlock {
    return { id, type: TeBlockType.PARAGRAPH, data: { text } };
  }

  function buildDoc(...blocks: TeBlock[]): HnDocumentation {
    const brick = new HnBrickEntity();
    brick.name = 'gws_core';
    const brickMajorVersion = new HnBrickMajorVersion();
    brickMajorVersion.brick = brick;

    const documentation = new HnDocumentation();
    documentation.id = DOC_ID;
    documentation.title = 'Getting started';
    documentation.content = new TeRichText({ ...TeRichText.emptyJson(), blocks }).toJson();
    documentation.modifications = null;
    documentation.folder = { brickMajorVersion } as HnDocumentation['folder'];
    return documentation;
  }

  function revisionOf(documentation: HnDocumentation): string {
    return TeRichTextRevision.of(documentation.getRichText());
  }

  /** Someone else's edit of `p2`, recorded the way every write records one. */
  function overwriteByAnotherUser(): void {
    const aggregate = (doc as HnDocumentation).getRichTextAggregate();
    aggregate.updateContent(
      new TeRichText({
        ...TeRichText.emptyJson(),
        blocks: [paragraph('p1', 'One'), paragraph('p2', 'Two, by someone else')],
      }),
      'user-2'
    );
    (doc as HnDocumentation).setRichTextAggregate(aggregate);
  }

  function buildRepository(): Repository<HnDocumentation> {
    const builder: Record<string, unknown> = {
      leftJoinAndSelect: () => builder,
      where: () => builder,
      getOne: () => Promise.resolve(doc),
    };
    return { createQueryBuilder: () => builder } as unknown as Repository<HnDocumentation>;
  }

  /**
   * The real authorization provider on fake repositories: it is what the service asks who may
   * write, and faking it instead would test the service against a rule nothing enforces.
   */
  function buildAuthorization(): HnMcpDocAuthorization {
    return new HnMcpDocAuthorization(
      buildRepository(),
      undefined as unknown as Repository<HnFolder>,
      buildBrickSecurity()
    );
  }

  /**
   * Stands in for the one write path of a document's content. It stores what it was given on the
   * document itself, because the response reads the touched blocks back from what was stored.
   */
  function buildDocumentationService(): HnDocumentationService {
    return {
      updateContent: (
        id: string,
        richText: TeRichText,
        revision?: string
      ): Promise<HnDocumentationContentUpdateDto> => {
        writtenRevision = revision;
        if (writeCollides) {
          // What the real one does when the revision it was handed is no longer current: the page
          // was rewritten in the window between this call's own check and this statement.
          overwriteByAnotherUser();
          return Promise.reject(new BlConflictException('the document changed'));
        }
        written = richText;
        (doc as HnDocumentation).content = richText.toJson();
        return Promise.resolve(
          new HnDocumentationContentUpdateDto(
            doc as HnDocumentation,
            warnings,
            revisionOf(doc as HnDocumentation)
          )
        );
      },
    } as unknown as HnDocumentationService;
  }

  function buildBrickSecurity(): HnBrickSecurity {
    return {
      assertIsCreatorOrCoAuthor: (): Promise<void> => {
        if (securityFailure != null) {
          return Promise.reject(securityFailure);
        }
        return authorized ? Promise.resolve() : Promise.reject(new BlUnauthorizedException('nope'));
      },
    } as unknown as HnBrickSecurity;
  }

  /** Every real call runs in a request scope with the MCP user resolved by the guard. */
  function asUser<T>(run: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      BlRequestContext.runWithContext(new BlRequestContext({} as Request, {} as Response, null, {}), () => {
        HnCurrentUserHelper.setAuthContext({ type: 'mcp', user: { id: USER_ID } as HnUser });
        run().then(resolve, reject);
      });
    });
  }

  function edit(operations: TeRichTextOperationInput[], revision?: string): Promise<HnMcpDocEditResult> {
    const locked = revision ?? revisionOf(doc as HnDocumentation);
    return asUser(() => service.edit(DOC_ID, locked, operations));
  }

  beforeEach(() => {
    doc = buildDoc(paragraph('p1', 'One'), paragraph('p2', 'Two'));
    written = null;
    writtenRevision = undefined;
    warnings = [];
    authorized = true;
    securityFailure = null;
    writeCollides = false;
    service = new HnMcpDocEditService(buildDocumentationService(), buildAuthorization());
  });

  describe('a batch that applies', () => {
    it('returns the new revision, the summary, and the touched blocks only', async () => {
      const result = await edit([
        { op: 'update', blockId: 'p2', data: { text: 'Two, edited' } },
        { op: 'insert', type: 'paragraph', data: { text: 'Three' }, at: 'end' },
      ]);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.revision).toBe(revisionOf(doc as HnDocumentation));
      expect(result.applied.map((operation) => operation.op)).toEqual(['update', 'insert']);
      // p1 was not touched, so it is not in the response: on a long page the untouched blocks are
      // the bulk of it, and they are what the caller already has.
      expect(result.blocks.map((block) => block.id)).toEqual(['p2', result.applied[1].blockId]);
      expect(result.blocks[0].data).toEqual({ text: 'Two, edited' });
    });

    it('keeps the untouched blocks with their ids, which is what the history hangs on', async () => {
      await edit([{ op: 'update', blockId: 'p2', data: { text: 'Two, edited' } }]);

      expect(written?.getBlocks()).toEqual([paragraph('p1', 'One'), paragraph('p2', 'Two, edited')]);
    });

    it('mints the id of an inserted block and returns it', async () => {
      const result = await edit([{ op: 'insert', type: 'paragraph', data: { text: 'Three' }, at: 'end' }]);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const minted = result.applied[0].blockId;
      expect(minted).toEqual(expect.any(String));
      expect(minted).not.toBe('');
      expect(written?.getBlock(minted)).toEqual({
        id: minted,
        type: TeBlockType.PARAGRAPH,
        data: { text: 'Three' },
      });
    });

    it('sends the revision down with the write as well, so the lock covers the gap', async () => {
      const revision = revisionOf(doc as HnDocumentation);

      await edit([{ op: 'delete', blockId: 'p1' }], revision);

      expect(writtenRevision).toBe(revision);
    });

    it('carries the sanitization warning when the server cleaned the content', async () => {
      warnings = ['The tag <span> was removed from a paragraph.'];

      const result = await edit([{ op: 'update', blockId: 'p1', data: { text: 'A <span>b</span>' } }]);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.warnings).toEqual(warnings);
    });

    it('reports a block the sanitizer turned into one that can no longer be rewritten', async () => {
      // The blocks come back with the read tool's verdict on them, read from what was stored: a
      // caller shown its own input would not see that the server changed its mind about the block.
      const result = await edit([
        { op: 'insert', type: 'hint', data: { title: 'Not a hint field' }, at: 'end' },
      ]);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.blocks[0].editable).toBe(false);
      expect(result.blocks[0].summary).toBeDefined();
    });
  });

  describe('a stale revision', () => {
    it('is refused with the new revision and the blocks changed since', async () => {
      const stale = revisionOf(doc as HnDocumentation);
      overwriteByAnotherUser();

      const result = await edit([{ op: 'update', blockId: 'p1', data: { text: 'One, edited' } }], stale);

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.revision).toBe(revisionOf(doc as HnDocumentation));
      expect(result.changedSince).toEqual([
        { blockId: 'p2', blockType: TeBlockType.PARAGRAPH, change: 'UPDATED' },
      ]);
      expect(result.reason).toContain('changedSince');
      expect(written).toBeNull();
    });

    /**
     * The race the lock exists for, landing in the window between the check and the write. It has to
     * come back as the same refusal a caller a moment slower would have received — a conflict
     * escaping as an exception reaches a model as a transport error with neither the new revision
     * nor the blocks that changed.
     */
    it('is refused the same way when the page changes between the check and the write', async () => {
      writeCollides = true;

      const result = await edit([{ op: 'update', blockId: 'p1', data: { text: 'One, edited' } }]);

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.revision).toBe(revisionOf(doc as HnDocumentation));
      expect(result.changedSince).toEqual([
        { blockId: 'p2', blockType: TeBlockType.PARAGRAPH, change: 'UPDATED' },
      ]);
      expect(written).toBeNull();
    });

    it('says so plainly when the history cannot reach the revision', async () => {
      const result = await edit([{ op: 'delete', blockId: 'p1' }], 'deadbeef1234');

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.revision).toBe(revisionOf(doc as HnDocumentation));
      expect(result.changedSince).toBeUndefined();
      expect(result.reason).toContain('does not reach back');
      expect(written).toBeNull();
    });
  });

  describe('a batch that is refused', () => {
    it('writes nothing when one operation is invalid', async () => {
      const result = await edit([
        { op: 'update', blockId: 'p1', data: { text: 'One, edited' } },
        { op: 'delete', blockId: 'ghost' },
      ]);

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.reason).toContain('no block "ghost"');
      expect(result.reason).toContain('all-or-nothing');
      expect(written).toBeNull();
    });

    it('writes nothing when the batch is over the bound', async () => {
      const result = await edit(
        Array.from({ length: TeRichTextOperations.MAX_OPERATIONS + 1 }, () => ({
          op: 'insert',
          type: 'paragraph',
          data: { text: 'New' },
          at: 'end',
        }))
      );

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.reason).toContain(`at most ${TeRichTextOperations.MAX_OPERATIONS} operations`);
      expect(written).toBeNull();
    });
  });

  describe('who may write', () => {
    it('refuses a user who is neither the author nor a co-author of the brick', async () => {
      authorized = false;

      const result = await edit([{ op: 'delete', blockId: 'p1' }]);

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.reason).toContain('neither the author nor a co-author');
      expect(result.reason).toContain('gws_core');
      expect(written).toBeNull();
    });

    it('checks the author before the revision, so a stranger learns nothing about the page', async () => {
      authorized = false;

      const result = await edit([{ op: 'delete', blockId: 'p1' }], 'deadbeef1234');

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.reason).toContain('neither the author nor a co-author');
      expect(result.revision).toBeUndefined();
    });

    /**
     * The check reads the brick's co-authors from the database. Reporting a timeout as "you are not
     * the author" would send the caller off to ask for rights it already has instead of trying
     * again, so only the verdict becomes a refusal.
     */
    it('does not pass a failure inside the check off as a permission denial', async () => {
      securityFailure = new Error('the connection dropped');

      await expect(edit([{ op: 'delete', blockId: 'p1' }])).rejects.toThrow('the connection dropped');
      expect(written).toBeNull();
    });

    it('refuses an unknown page', async () => {
      doc = null;

      const result = await asUser(() => service.edit('nope', 'whatever', [{ op: 'delete', blockId: 'p1' }]));

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.reason).toContain('No documentation found');
    });
  });
});
