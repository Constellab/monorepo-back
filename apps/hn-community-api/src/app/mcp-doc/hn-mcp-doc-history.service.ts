import { BlConflictException } from '@monorepo/back-core-lib';
import {
  TeRichTextAggregate,
  TeRichTextBlockModification,
  TeRichTextModifications,
  TeRichTextModificationType,
  TeRichTextRevision,
} from '@monorepo/te-text-editor';
import { Injectable } from '@nestjs/common';

import { HnDocumentation } from '../brick-aggregate/documentation/hn-documentation.entity';
import { HnDocumentationService } from '../brick-aggregate/documentation/hn-documentation.service';
import { HnUserService } from '../users/hn-user.service';
import { HnMcpDocAuthorization, HnMcpDocRefusal } from './hn-mcp-doc-authorization.service';

/** One block change inside an entry of the history. */
export interface HnMcpDocHistoryChange {
  blockId: string;
  blockType: string;
  change: TeRichTextModificationType;
}

/** Who made a change, when the user record still exists. */
export interface HnMcpDocHistoryAuthor {
  id: string;
  name: string;
}

/** One user action on a page: everything one edit, one CLI push or one rollback recorded. */
export interface HnMcpDocHistoryEntry {
  /**
   * The id community_doc_rollback takes. It is the id of the entry's first block change, because a
   * rollback undoes an entry **and everything recorded after it** — an entry is a point to come
   * back to, not a change to lift out on its own.
   */
  modificationId: string;
  /** ISO 8601, from the recorded modification. */
  time: string;
  author: HnMcpDocHistoryAuthor | null;
  changes: HnMcpDocHistoryChange[];
}

export interface HnMcpDocHistorySuccess {
  ok: true;
  docId: string;
  title: string;
  /** The revision the page is at now — the same value community_doc_read_blocks returns. */
  revision: string;
  /** Newest first, so the first entry is the most recent thing to undo. */
  entries: HnMcpDocHistoryEntry[];
  /** How many entries the page has in total, present only when more exist than were returned. */
  moreEntries?: number;
}

export interface HnMcpDocRollbackSuccess {
  ok: true;
  docId: string;
  /** The revision of the restored content. A later edit locks against this one. */
  revision: string;
  /** How many recorded actions the rollback undid, the one named included. */
  undoneEntries: number;
  /** What the server cleaned out of the restored content, empty when it cleaned nothing. */
  warnings: string[];
}

export type HnMcpDocHistoryResult = HnMcpDocHistorySuccess | HnMcpDocRefusal;
export type HnMcpDocRollbackResult = HnMcpDocRollbackSuccess | HnMcpDocRefusal;

/** An entry before its author has been looked up: the user id is on the modifications, not on it. */
type HnMcpDocHistoryEntryDraft = Omit<HnMcpDocHistoryEntry, 'author'> & { authorId: string };

/**
 * The safety net of the Community documentation MCP: what a page's history holds, and putting a page
 * back to a point in it.
 *
 * This is what makes the write tools acceptable, rather than the other way round. Without it, the
 * only repair of a model's mistake goes through the site's own UI — which the person working with
 * the model may not even have open.
 *
 * A rollback here is **an ordinary write**, not a rewind of the record: the restored content goes
 * back in through {@link HnDocumentationService.updateContent}, the one write path, which appends
 * what it changed to the history like any other edit. So the rollback is itself in the history and
 * can be rolled back in turn, and it is sanitized and locked on a revision exactly as an edit is.
 * The site's own rollback truncates the history at the point it returns to; that is right for a
 * human undoing their own work in front of the page, and wrong for a tool whose whole purpose is
 * that nothing a model did is unrecoverable.
 *
 * Reading the history requires being the brick's author or a co-author, like writing to it. It is
 * not the public page: it carries the previous content of blocks and the names of the people who
 * wrote them.
 *
 * All of it is recorded in `docs/adr/0005-the-mcp-manages-the-documentation-tree.md`.
 */
@Injectable()
export class HnMcpDocHistoryService {
  /** Entries per call, newest first. A page edited for years has thousands. */
  static readonly DEFAULT_ENTRIES = 20;
  static readonly MAX_ENTRIES = 100;

  constructor(
    private readonly documentationService: HnDocumentationService,
    private readonly userService: HnUserService,
    private readonly authorization: HnMcpDocAuthorization
  ) {}

  async history(
    docId: string,
    limit: number = HnMcpDocHistoryService.DEFAULT_ENTRIES
  ): Promise<HnMcpDocHistoryResult> {
    const doc = await this.authorization.findDocWithBrick(docId);
    if (doc == null) {
      return this.unknownDoc(docId);
    }

    const refusal = await this.authorization.refuseUnlessAuthorOfDoc(doc);
    if (refusal != null) {
      return refusal;
    }

    const entries = this.entriesOf(doc.getRichTextAggregate().modifications).reverse();
    const returned = entries.slice(0, Math.min(limit, HnMcpDocHistoryService.MAX_ENTRIES));

    return {
      ok: true,
      docId,
      title: doc.title,
      revision: TeRichTextRevision.of(doc.getRichText()),
      entries: await this.withAuthors(returned),
      ...(returned.length < entries.length ? { moreEntries: entries.length } : {}),
    };
  }

  /**
   * Put the page back to just before the entry named, undoing everything recorded after it too.
   *
   * The write locks on the revision of the content the undo was computed from, so a page someone
   * else edited in between is refused rather than silently reverted past their change. The caller
   * passes no revision: a rollback is prepared entirely inside this call, so there is nothing the
   * caller could have read one at.
   */
  async rollback(docId: string, modificationId: string): Promise<HnMcpDocRollbackResult> {
    const doc = await this.authorization.findDocWithBrick(docId);
    if (doc == null) {
      return this.unknownDoc(docId);
    }

    const refusal = await this.authorization.refuseUnlessAuthorOfDoc(doc);
    if (refusal != null) {
      return refusal;
    }

    const modifications = doc.getRichTextAggregate().modifications;
    const known = modifications.getModifications().some((modification) => modification.id === modificationId);
    if (!known) {
      return {
        ok: false,
        reason:
          `The history of "${doc.title}" holds no entry "${modificationId}", so nothing was changed. ` +
          `Read community_doc_history again and use a "modificationId" it returned.`,
      };
    }

    // An id from the middle of a save is refused rather than accepted. The library would widen it to
    // the whole save — a save is atomic, so that is the only correct undo of it — but then the tool
    // would undo strictly more than the id it was handed names, and report a count the caller cannot
    // check. Naming the entry to use instead costs the caller one call and keeps the two aligned.
    const entryStart = modifications.getFirstModificationOfGroup(modificationId);
    if (entryStart.id !== modificationId) {
      return {
        ok: false,
        reason:
          `"${modificationId}" is one block change inside a larger action, not an entry of the ` +
          `history, and nothing was changed — that action can only be undone whole. Roll back to ` +
          `"${entryStart.id}" instead: that is the "modificationId" community_doc_history returns ` +
          `for it.`,
      };
    }

    const revision = TeRichTextRevision.of(doc.getRichText());

    let restored: TeRichTextAggregate;
    try {
      restored = this.undoneContent(doc, modificationId);
    } catch {
      // The replay is arithmetic over recorded block indexes, and a history that predates part of
      // itself cannot always be walked back. Better an honest refusal than a page half restored.
      return {
        ok: false,
        reason:
          `The history of "${doc.title}" cannot be replayed back to that entry, so nothing was ` +
          `changed. Pick a more recent entry from community_doc_history, or edit the page forward ` +
          `with community_doc_edit.`,
      };
    }

    let stored;
    try {
      stored = await this.documentationService.updateContent(docId, restored.richText, revision);
    } catch (error) {
      if (!(error instanceof BlConflictException)) {
        throw error;
      }
      return {
        ok: false,
        reason:
          `"${doc.title}" was written to while this rollback was being prepared, and nothing was ` +
          `changed — rolling back now would have undone that change too. Read ` +
          `community_doc_history again and decide against what the page holds now.`,
      };
    }

    return {
      ok: true,
      docId,
      revision: stored.revision,
      undoneEntries: modifications.getGroupsFromModificationId(modificationId).length,
      warnings: stored.warnings,
    };
  }

  /**
   * The content the page would have with the entry and everything after it undone.
   *
   * Computed on a detached copy of the page, not on the page itself: the undo walks the recorded
   * modifications backwards by splicing the block array it was handed, and the array a document
   * hands out is the one it holds — so run against `doc`, it would leave the object this service
   * still has to read a title and a revision from holding the restored content instead of the
   * stored one. Pure either way: nothing here reaches the database.
   */
  private undoneContent(doc: HnDocumentation, modificationId: string): TeRichTextAggregate {
    const detached = new HnDocumentation();
    detached.content = doc.content == null ? null : structuredClone(doc.content);
    detached.modifications = doc.modifications;
    return this.documentationService.getUndoContent(detached, modificationId);
  }

  /**
   * One entry per user action, oldest first.
   *
   * The grouping is the library's — a save is a run of modifications sharing a `groupId`, and it is
   * the same walk the undo uses to decide what a rollback restores. Regrouping them here would be a
   * second definition of "one action", and the two would part company on the first change to either.
   */
  private entriesOf(modifications: TeRichTextModifications): HnMcpDocHistoryEntryDraft[] {
    const first = modifications.getModifications()[0];
    if (first == null) {
      return [];
    }
    return modifications.getGroupsFromModificationId(first.id).map((group) => this.toEntry(group));
  }

  private toEntry(group: TeRichTextBlockModification[]): HnMcpDocHistoryEntryDraft {
    // Every modification of a group belongs to one user action, so the first carries the entry's
    // time and its author as well as the id a rollback names.
    const [first] = group;
    return {
      modificationId: first.id,
      time: first.time.toISO() ?? '',
      authorId: first.userId,
      changes: group.map((modification) => ({
        blockId: modification.blockId,
        blockType: modification.blockType,
        change: modification.type,
      })),
    };
  }

  /**
   * The authors of the entries, one lookup per distinct user rather than per entry: a page's history
   * is a handful of people over hundreds of changes.
   *
   * An unknown id leaves `author` null. The people who wrote a page outlive their account here, and
   * a history that threw on one of them would be unreadable for good.
   */
  private async withAuthors(entries: HnMcpDocHistoryEntryDraft[]): Promise<HnMcpDocHistoryEntry[]> {
    const authors = new Map<string, HnMcpDocHistoryAuthor | null>();

    for (const { authorId } of entries) {
      if (authors.has(authorId)) {
        continue;
      }
      const user = await this.userService.findOne(authorId);
      authors.set(
        authorId,
        user == null
          ? null
          : { id: user.id, name: [user.firstname, user.lastname].filter((part) => part).join(' ') }
      );
    }

    return entries.map(({ authorId, ...entry }) => ({
      ...entry,
      author: authors.get(authorId) ?? null,
    }));
  }

  private unknownDoc(docId: string): HnMcpDocRefusal {
    return {
      ok: false,
      reason:
        `No page found for id "${docId}". Page ids come from community_doc_tree, community_doc_list ` +
        `or community_doc_search.`,
    };
  }
}
