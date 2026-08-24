import { BlConflictException, BlUnauthorizedException } from '@monorepo/back-core-lib';
import {
  TeAppliedRichTextOperation,
  TeRichTextBlockInspector,
  TeRichTextOperationInput,
  TeRichTextOperations,
  TeRichTextOperationType,
  TeRichTextRevision,
  TeRichTextRevisionHistory,
} from '@monorepo/te-text-editor';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HnDocumentationContentUpdateDto } from '../brick-aggregate/documentation/hn-documentation.dto';
import { HnDocumentation } from '../brick-aggregate/documentation/hn-documentation.entity';
import { HnDocumentationService } from '../brick-aggregate/documentation/hn-documentation.service';
import { HnBrickSecurity } from '../brick-aggregate/security/hn-brick.security';
import { HnCurrentUserHelper } from '../core/utils/hn-current-user.helper';
import { HnMcpDocBlock } from './hn-mcp-doc.service';

/** One line of the summary of what a batch did. */
export interface HnMcpDocAppliedOperation {
  op: TeRichTextOperationType;
  /** For an insert, the id the server minted — the caller has no other way to learn it. */
  blockId: string;
  blockType: string;
}

export interface HnMcpDocEditSuccess {
  ok: true;
  docId: string;
  /** The revision of what was stored. A second batch chained onto this one locks against it. */
  revision: string;
  applied: HnMcpDocAppliedOperation[];
  /**
   * The blocks the batch touched, as they are now stored — not the whole page. On a long page the
   * rest of the document is the bulk of the response, and it is the part the caller just wrote.
   */
  blocks: HnMcpDocBlock[];
  /** What the server cleaned out of the content, empty when it cleaned nothing. */
  warnings: string[];
}

export interface HnMcpDocEditRefusal {
  ok: false;
  reason: string;
  /** Present when the refusal is a stale revision: the revision the page is at now. */
  revision?: string;
  /**
   * The blocks that changed since the revision the caller read, when the history can name them.
   * A caller whose batch touches none of them can replay it as it is against the new revision.
   */
  changedSince?: HnMcpDocChangedBlock[];
}

export interface HnMcpDocChangedBlock {
  blockId: string;
  blockType: string;
  change: string;
}

export type HnMcpDocEditResult = HnMcpDocEditSuccess | HnMcpDocEditRefusal;

/**
 * The write path of the Community documentation MCP: a batch of block operations against one page.
 *
 * Why operations rather than a whole document, and why the batch locks on a revision, is recorded
 * in `docs/adr/0004-the-mcp-writes-documentation-by-operations.md`. What this service adds on top of
 * {@link TeRichTextOperations} is the three things the library cannot know: who is allowed to write
 * to this page, what the page's current revision is, and what the response should cost.
 *
 * Every refusal is a **result**, not an exception. Permission, a stale revision and a malformed
 * batch are all things the caller can act on — by asking the brick's author, by reading the page
 * again, by fixing the operation — and none of them is a server fault. The read side already models
 * refusals this way (`HnMcpDocService.tree`), and an exception thrown out of a tool handler reaches
 * a model as a transport error with none of that detail.
 *
 * Nothing is written outside {@link HnDocumentationService.updateContent}: that is the one write
 * path for a document's content, so the sanitizer, the derived modification history and the
 * optimistic lock apply to a batch exactly as they apply to the editor and to the CLI.
 */
@Injectable()
export class HnMcpDocEditService {
  constructor(
    @InjectRepository(HnDocumentation)
    private readonly documentationsRepository: Repository<HnDocumentation>,
    private readonly documentationService: HnDocumentationService,
    private readonly brickSecurity: HnBrickSecurity
  ) {}

  async edit(
    docId: string,
    revision: string,
    operations: TeRichTextOperationInput[]
  ): Promise<HnMcpDocEditResult> {
    const doc = await this.findDocWithBrick(docId);
    if (doc == null) {
      return { ok: false, reason: `No documentation found for id "${docId}".` };
    }

    const refusal = await this.refuseUnlessAuthor(doc);
    if (refusal != null) {
      return refusal;
    }

    const stale = this.refuseUnlessCurrent(doc, revision);
    if (stale != null) {
      return stale;
    }

    const applied = TeRichTextOperations.apply(doc.getRichText(), operations);
    if (!applied.ok) {
      return {
        ok: false,
        reason:
          `The batch was refused and nothing was written:\n- ${applied.errors.join('\n- ')}\n` +
          `A batch is all-or-nothing, so fix every line above and send it again.`,
      };
    }

    // The revision goes down with the write as well, even though it was just compared: the compare
    // and the write are two statements, and the lock is what covers the gap between them. When it
    // fires, the race the lock exists for actually happened, and the caller gets the same refusal it
    // would have got a moment earlier rather than a transport error stripped of it.
    let stored: HnDocumentationContentUpdateDto;
    try {
      stored = await this.documentationService.updateContent(docId, applied.richText, revision);
    } catch (error) {
      if (!(error instanceof BlConflictException)) {
        throw error;
      }
      return await this.refuseAfterLosingTheRace(docId, revision);
    }

    return {
      ok: true,
      docId,
      revision: stored.revision,
      applied: applied.applied.map((operation) => this.toAppliedOperation(operation)),
      blocks: this.touchedBlocks(stored.documentation, applied.applied),
      warnings: stored.warnings,
    };
  }

  /**
   * Someone else wrote to the page between the compare and the write, so the page is read once more
   * and described as it is now — the same refusal a caller a moment slower would have received.
   *
   * A page that has vanished in that same window falls back to the plain refusal: it can no longer
   * be described, and there is nothing left for the caller to replay against.
   */
  private async refuseAfterLosingTheRace(docId: string, revision: string): Promise<HnMcpDocEditRefusal> {
    const doc = await this.findDocWithBrick(docId);
    return (
      (doc == null ? null : this.refuseUnlessCurrent(doc, revision)) ?? {
        ok: false,
        reason:
          `The page changed while this batch was being written, and nothing was written. Read it ` +
          `again with community_doc_read_blocks.`,
      }
    );
  }

  /**
   * The brick's creator or one of its co-authors, and nobody else.
   *
   * Read access is the whole endpoint's (the documentation is public on the web); writing to a
   * brick's pages is not. The check is the brick's own — the same one the Community site applies to
   * a human editing the same page — rather than a rule invented for the MCP, so an author does not
   * gain or lose rights by editing through a model.
   */
  private async refuseUnlessAuthor(doc: HnDocumentation): Promise<HnMcpDocEditRefusal | null> {
    const brick = doc.folder?.brickMajorVersion?.brick;
    if (brick == null) {
      return {
        ok: false,
        reason: `The page "${doc.title}" is not attached to a brick, so no author can be established.`,
      };
    }

    // Outside the catch: this one throws when there is no user in the context, which is a broken
    // request rather than a verdict on this brick, and must not be reported as one.
    const user = HnCurrentUserHelper.getAndCheckCurrentUser();

    try {
      await this.brickSecurity.assertIsCreatorOrCoAuthor(brick, user);
      return null;
    } catch (error) {
      // Only the verdict is turned into a refusal. The check reads the brick's co-authors from the
      // database, and a timeout reported as "you are not the author" would send the caller off to
      // ask for rights it already has, instead of trying again.
      if (!(error instanceof BlUnauthorizedException)) {
        throw error;
      }
      return {
        ok: false,
        reason:
          `You are neither the author nor a co-author of the brick "${brick.name}", so its ` +
          `documentation cannot be edited with your account. Ask one of them to add you as a ` +
          `co-author, or send them the change.`,
      };
    }
  }

  /**
   * A batch describes the page the caller read. If the page moved on, applying it would land the
   * operations on blocks that are no longer the ones they name.
   *
   * The refusal carries the blocks that changed rather than just the new revision: a caller whose
   * batch touches none of them knows its edit still holds and can replay it, instead of reading the
   * whole page again to find out.
   */
  private refuseUnlessCurrent(doc: HnDocumentation, revision: string): HnMcpDocEditRefusal | null {
    const current = TeRichTextRevision.of(doc.getRichText());
    if (current === revision) {
      return null;
    }

    const changes = TeRichTextRevisionHistory.changesSince(doc.getRichTextAggregate(), revision);
    if (!changes.found) {
      return {
        ok: false,
        revision: current,
        reason:
          `The page changed since it was read at revision "${revision}", and it is now at ` +
          `"${current}". Nothing was written. Its history does not reach back to that revision, so ` +
          `which blocks changed cannot be listed — read the page again with ` +
          `community_doc_read_blocks.`,
      };
    }

    return {
      ok: false,
      revision: current,
      changedSince: changes.changes.map((change) => ({
        blockId: change.blockId,
        blockType: change.blockType,
        change: change.change,
      })),
      reason:
        `The page changed since it was read at revision "${revision}", and it is now at ` +
        `"${current}". Nothing was written. The blocks that changed are listed in ` +
        `"changedSince": if your batch names none of them, send it again with the new revision; ` +
        `otherwise read those blocks again with community_doc_read_blocks first.`,
    };
  }

  /**
   * The blocks the batch left in the page, with the same verdict the read tool attaches to them.
   *
   * Read back from what was stored rather than from what was sent: the sanitizer may have cleaned
   * the content on the way in, and a caller shown its own input would not see that. A deleted block
   * is in `applied` and in no page, so it is absent here by construction.
   */
  private touchedBlocks(doc: HnDocumentation, applied: TeAppliedRichTextOperation[]): HnMcpDocBlock[] {
    const touched = new Set(applied.map((operation) => operation.blockId));

    return TeRichTextBlockInspector.inspect(doc.getRichText())
      .filter((inspected) => inspected.block?.id != null && touched.has(inspected.block.id))
      .map(({ block, editable, summary }) => ({
        id: block.id ?? null,
        type: block.type,
        data: block.data,
        editable,
        ...(summary == null ? {} : { summary }),
      }));
  }

  private toAppliedOperation(operation: TeAppliedRichTextOperation): HnMcpDocAppliedOperation {
    return { op: operation.op, blockId: operation.blockId, blockType: operation.blockType };
  }

  /**
   * The page with the chain up to its brick, which is where the authorization lives. One query
   * rather than the documentation service's `findById` plus a walk, because the folder relation it
   * loads stops one join short of the brick.
   */
  private findDocWithBrick(id: string): Promise<HnDocumentation | null> {
    return (
      this.documentationsRepository
        .createQueryBuilder('doc')
        .leftJoinAndSelect('doc.folder', 'folder')
        .leftJoinAndSelect('folder.brickMajorVersion', 'brickMajorVersion')
        .leftJoinAndSelect('brickMajorVersion.brick', 'brick')
        // `createdBy` is eager on the entity, which a query builder does not honour, and it is the one
        // column the authorization actually reads on the brick.
        .leftJoinAndSelect('brick.createdBy', 'createdBy')
        .where('doc.id = :id', { id })
        .getOne()
    );
  }
}
