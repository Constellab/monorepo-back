import { TeBlockType } from './lib/te-block.class';
import { TeRichTextAggregate } from './lib/te-rich-text-aggregate.class';
import {
  TeRichTextBlockModification,
  TeRichTextModificationType,
} from './lib/te-rich-text-block-modification.class';
import { TeRichTextRevision } from './te-rich-text-revision.class';

/** One block that changed, and what happened to it. */
export interface TeRichTextBlockChange {
  blockId: string;
  blockType: TeBlockType;
  change: TeRichTextModificationType;
}

/**
 * What changed since a revision — or the admission that the history does not reach back that far.
 *
 * `found: false` is a real answer, not an error: a revision from before the recorded history, or
 * one this document never had, cannot be placed, and saying "nothing changed" there would be a lie
 * a caller would act on.
 */
export type TeRichTextChangesSince = { found: true; changes: TeRichTextBlockChange[] } | { found: false };

/**
 * Names the blocks that changed since a given revision, by walking the recorded modification
 * history backwards until the document hashes to that revision again.
 *
 * This is what turns a stale-revision refusal into something a caller can act on. Told only that
 * the document moved on, a model's only move is to read the whole page again and redo its work.
 * Told *which blocks* moved, it can see that its edit touched none of them and replay it, or that
 * it touched one and think again. On a long page that difference is the whole cost of the refusal.
 *
 * The walk is the only way to answer exactly. A revision is a hash of content, deliberately not a
 * counter (see `docs/adr/0004-the-mcp-writes-documentation-by-operations.md`), so nothing stored
 * ties a revision to a point in the history: the point has to be found by replaying the history
 * until the hash matches. Every attempt runs on a deep copy — the undo works in place, and the
 * document being described must not be the one being unwound.
 *
 * Lives outside the shared `lib/` folder because it hashes, same reason as
 * {@link TeRichTextRevision}.
 */
export class TeRichTextRevisionHistory {
  /**
   * How many user actions back the walk looks.
   *
   * A caller whose revision is older than this has been holding it long enough that reading the
   * page again is the honest advice anyway, and the bound keeps a refusal — the cheap path — from
   * unwinding a page's entire history to produce a list too long to read.
   */
  private static readonly MAX_GROUPS = 20;

  public static changesSince(aggregate: TeRichTextAggregate, revision: string): TeRichTextChangesSince {
    if (TeRichTextRevision.of(aggregate.richText) === revision) {
      return { found: true, changes: [] };
    }

    const modifications = aggregate.modifications.getModifications();
    const starts = TeRichTextRevisionHistory.groupStarts(modifications);
    // Serialized once, parsed once per attempt. Every attempt needs its own copy — the undo works
    // in place — but the expensive half is writing out the aggregate, whose history carries the
    // stored value or diff of every block ever touched, and that does not change between attempts.
    const serialized = JSON.stringify(aggregate.toJson());

    for (const start of starts.slice(0, TeRichTextRevisionHistory.MAX_GROUPS)) {
      const rewound = TeRichTextRevisionHistory.rewoundTo(serialized, modifications[start].id);
      if (rewound === revision) {
        return { found: true, changes: TeRichTextRevisionHistory.changesOf(modifications.slice(start)) };
      }
    }

    return { found: false };
  }

  /**
   * The index of the first modification of each recorded user action, newest action first.
   *
   * A batch of modifications sharing a `groupId` is one action — the grouping the aggregate applies
   * when it writes them — so the walk steps by action rather than by block, and the revision it
   * compares against is one that actually existed. A revision taken mid-group never did.
   */
  private static groupStarts(modifications: TeRichTextBlockModification[]): number[] {
    const starts: number[] = [];
    let index = modifications.length - 1;

    while (index >= 0) {
      let start = index;
      const groupId = modifications[index].groupId;
      if (groupId != null) {
        while (start - 1 >= 0 && modifications[start - 1].groupId === groupId) {
          start--;
        }
      }
      starts.push(start);
      index = start - 1;
    }

    return starts;
  }

  /**
   * The revision the document had before `modificationId`, or `null` if it cannot be reconstructed.
   *
   * An undo that throws is not a failure worth propagating: the caller is already being refused,
   * and the fallback — "read the page again" — is exactly what a `found: false` produces.
   */
  private static rewoundTo(serializedAggregate: string, modificationId: string): string | null {
    try {
      const copy = TeRichTextAggregate.fromJson(JSON.parse(serializedAggregate));
      copy.undoModifications(modificationId);
      return TeRichTextRevision.of(copy.richText);
    } catch {
      return null;
    }
  }

  /** One entry per block, carrying the most recent thing that happened to it. */
  private static changesOf(modifications: TeRichTextBlockModification[]): TeRichTextBlockChange[] {
    const changes = new Map<string, TeRichTextBlockChange>();
    for (const modification of modifications) {
      changes.set(modification.blockId, {
        blockId: modification.blockId,
        blockType: modification.blockType,
        change: modification.type,
      });
    }
    return [...changes.values()];
  }
}
