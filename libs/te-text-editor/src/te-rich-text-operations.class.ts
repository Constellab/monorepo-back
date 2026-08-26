import { TeBlock, TeBlockData, TeBlockType } from './lib/te-block.class';
import { TeRichText } from './lib/te-rich-text.class';
import { TeRichTextBlockInspector } from './te-rich-text-block-inspector.class';

/** The four things a batch may do to a document. */
export enum TeRichTextOperationType {
  UPDATE = 'update',
  INSERT = 'insert',
  DELETE = 'delete',
  MOVE = 'move',
}

/**
 * One operation as it arrives from a caller: flat, and every field optional but `op`.
 *
 * Flat rather than a union per operation because the caller is a language model reading a JSON
 * schema, and a discriminated union renders differently in every client that generates one. The
 * combinations are checked here instead, where a refusal can say which field is wrong and what the
 * operation should have carried.
 */
export interface TeRichTextOperationInput {
  op: string;
  /** The block an `update`, `delete` or `move` targets. */
  blockId?: string;
  /** The block type an `insert` creates. */
  type?: string;
  /** The whole data of the block, for `insert` and `update`. Never a partial patch. */
  data?: TeBlockData;
  /** Position, for `insert` and `move`: one of these three, never two. */
  before?: string;
  after?: string;
  at?: string;
}

/** What a batch did, one entry per operation, in the order the batch listed them. */
export interface TeAppliedRichTextOperation {
  op: TeRichTextOperationType;
  /** For an `insert`, the id the server minted. */
  blockId: string;
  blockType: TeBlockType;
}

export type TeRichTextOperationsResult =
  | { ok: true; richText: TeRichText; applied: TeAppliedRichTextOperation[] }
  /** Every reason the batch was refused, so one round trip fixes all of them. */
  | { ok: false; errors: string[] };

/** A gap in the document a block is placed into. */
type TeOperationAnchor = { kind: 'before' | 'after'; blockId: string } | { kind: 'start' } | { kind: 'end' };

/** Everything a batch does to the document, gathered before a single block is built. */
interface TeOperationPlan {
  /** The new data of every block an `update` rewrites, by block id. */
  updates: Map<string, TeBlockData>;
  /** The ids leaving their original place: deleted, or moved elsewhere. */
  removed: Set<string>;
  /** Blocks and inserts waiting on the gap they were anchored to, in batch order. */
  placements: Map<string, TeParsedOperation[]>;
  /** The id an insert was given, by batch position, so the summary and the built block agree. */
  insertedIds: Map<number, string>;
}

/** An input operation whose fields have been checked and named. */
interface TeParsedOperation {
  /** Position in the batch, so a refusal can point at the operation that caused it. */
  index: number;
  op: TeRichTextOperationType;
  blockId?: string;
  blockType?: TeBlockType;
  data?: TeBlockData;
  anchor?: TeOperationAnchor;
}

/**
 * Applies a batch of block operations to a document.
 *
 * This is the write vocabulary of the MCP, and the reason it exists rather than a
 * whole-document endpoint is recorded in `docs/adr/0004-the-mcp-writes-documentation-by-operations.md`:
 * the modification history of a document is derived from a block-by-block comparison matched **by
 * id**, so a caller that returns the whole document with regenerated ids produces a history saying
 * "everything deleted, everything recreated" — and nothing reports it. Operations make that
 * impossible: an untouched block is carried over as it is, id included.
 *
 * Three rules hold the rest together.
 *
 * **The batch is atomic.** Every check runs before a single block is built, and one bad operation
 * refuses the batch whole. A partial success leaves the caller in a state it did not predict, and
 * a model re-edits on top of it.
 *
 * **Positions are read against the document as it was read**, not against the state left by the
 * previous operation of the same batch. So a caller describes its changes against what it saw,
 * with no intermediate state to simulate. What makes that unambiguous is the anchor rule below.
 *
 * **The server mints the ids of inserted blocks.** A caller inventing ids eventually reuses an
 * existing one, and an id collision corrupts the history with nothing to signal it.
 *
 * Lives outside the shared `lib/` folder because it leans on {@link TeRichTextBlockInspector},
 * which needs a back-only dependency.
 */
export class TeRichTextOperations {
  /**
   * How many operations one batch may carry.
   *
   * The bound is a refusal, never a truncation: a batch silently cut in half is the partial
   * success this class exists to prevent, wearing a success response.
   */
  public static readonly MAX_OPERATIONS = 50;

  public static apply(
    richText: TeRichText,
    operations: TeRichTextOperationInput[]
  ): TeRichTextOperationsResult {
    if (!Array.isArray(operations) || operations.length === 0) {
      return { ok: false, errors: ['A batch carries at least one operation; this one carries none.'] };
    }
    if (operations.length > TeRichTextOperations.MAX_OPERATIONS) {
      return {
        ok: false,
        errors: [
          `A batch carries at most ${TeRichTextOperations.MAX_OPERATIONS} operations, and this one ` +
            `carries ${operations.length}. Nothing was written. Split it into several batches — each ` +
            `one is a single entry in the page's history.`,
        ],
      };
    }

    const blocks = richText.getBlocks() ?? [];
    // Only an update consults it, and establishing it runs the write-path validator over every block
    // of the page. A batch that only moves, deletes and inserts must not pay for a sweep of a page
    // it is not rewriting a word of.
    const editableById = operations.some(
      (operation) => TeRichTextOperations.parseOperationType(operation?.op) === TeRichTextOperationType.UPDATE
    )
      ? TeRichTextOperations.editableIds(richText)
      : new Map<string, boolean>();
    const knownIds = new Set(
      blocks.map((block) => block?.id).filter((id): id is string => id != null && id !== '')
    );

    const errors: string[] = [];
    const parsed: TeParsedOperation[] = [];
    operations.forEach((operation, index) => {
      const result = TeRichTextOperations.parse(operation, index, knownIds, editableById);
      if (typeof result === 'string') {
        errors.push(result);
      } else {
        parsed.push(result);
      }
    });

    errors.push(...TeRichTextOperations.crossCheck(parsed));

    if (errors.length > 0) {
      return { ok: false, errors };
    }

    return TeRichTextOperations.build(richText, blocks, parsed);
  }

  /////////////////////////////////// ONE OPERATION ///////////////////////////////////

  /** The parsed operation, or the one sentence saying why it was refused. */
  private static parse(
    operation: TeRichTextOperationInput,
    index: number,
    knownIds: Set<string>,
    editableById: Map<string, boolean>
  ): TeParsedOperation | string {
    const label = `Operation ${index + 1} ("${String(operation?.op)}")`;
    const op = TeRichTextOperations.parseOperationType(operation?.op);
    if (op == null) {
      return (
        `${label}: unknown operation. Use one of ` + `${Object.values(TeRichTextOperationType).join(', ')}.`
      );
    }

    switch (op) {
      case TeRichTextOperationType.UPDATE:
        return TeRichTextOperations.parseUpdate(operation, index, label, knownIds, editableById);
      case TeRichTextOperationType.INSERT:
        return TeRichTextOperations.parseInsert(operation, index, label, knownIds);
      case TeRichTextOperationType.DELETE:
        return TeRichTextOperations.parseDelete(operation, index, label, knownIds);
      case TeRichTextOperationType.MOVE:
        return TeRichTextOperations.parseMove(operation, index, label, knownIds);
    }
  }

  private static parseUpdate(
    operation: TeRichTextOperationInput,
    index: number,
    label: string,
    knownIds: Set<string>,
    editableById: Map<string, boolean>
  ): TeParsedOperation | string {
    const blockId = TeRichTextOperations.requireKnownBlockId(operation.blockId, label, knownIds);
    if (typeof blockId !== 'string') {
      return blockId.error;
    }

    if (TeRichTextOperations.hasPosition(operation)) {
      return (
        `${label}: an update takes no position — a block keeps its place unless a move says ` +
        `otherwise. Use a separate move operation.`
      );
    }
    // A type change is a different block wearing the same id: the history would call it an edit,
    // and the editor would be handed data of a shape its tool cannot read. The CLI already refuses
    // it, and for the same reason.
    if (operation.type != null && operation.type !== '') {
      return (
        `${label}: an update cannot change the type of a block. In the same batch, delete ` +
        `"${blockId}" and insert a "${String(operation.type)}" block positioned "before" it — a ` +
        `deleted block's place is exactly the gap it leaves.`
      );
    }
    if (!TeRichTextOperations.isData(operation.data)) {
      return `${label}: "data" is required and holds the whole new data of the block, not a patch.`;
    }
    if (editableById.get(blockId) !== true) {
      return (
        `${label}: block "${blockId}" is not editable — community_doc_read_blocks says why. ` +
        `Move it or delete it; rewriting it would destroy what it holds.`
      );
    }

    return { index, op: TeRichTextOperationType.UPDATE, blockId, data: operation.data };
  }

  private static parseInsert(
    operation: TeRichTextOperationInput,
    index: number,
    label: string,
    knownIds: Set<string>
  ): TeParsedOperation | string {
    if (operation.blockId != null && operation.blockId !== '') {
      return (
        `${label}: an insert takes no "blockId" — the id of a new block is minted by the server and ` +
        `returned in the response.`
      );
    }

    const blockType = TeRichTextOperations.parseBlockType(operation.type);
    if (blockType == null) {
      return (
        `${label}: "type" is required and is one of ${Object.values(TeBlockType).join(', ')}, ` +
        `got "${String(operation.type)}".`
      );
    }
    if (TeRichTextBlockInspector.isRichType(blockType)) {
      return (
        `${label}: a "${blockType}" block cannot be inserted here — its fields come from an upload ` +
        `or from a lab, which no documentation tool can perform. An existing one can be moved or ` +
        `deleted.`
      );
    }
    if (!TeRichTextOperations.isData(operation.data)) {
      return `${label}: "data" is required and holds the data of the new block.`;
    }

    const anchor = TeRichTextOperations.parseAnchor(operation, label, knownIds);
    if (!('kind' in anchor)) {
      return anchor.error;
    }

    return { index, op: TeRichTextOperationType.INSERT, blockType, data: operation.data, anchor };
  }

  private static parseDelete(
    operation: TeRichTextOperationInput,
    index: number,
    label: string,
    knownIds: Set<string>
  ): TeParsedOperation | string {
    const blockId = TeRichTextOperations.requireKnownBlockId(operation.blockId, label, knownIds);
    if (typeof blockId !== 'string') {
      return blockId.error;
    }
    if (TeRichTextOperations.hasPosition(operation)) {
      return `${label}: a delete takes no position.`;
    }
    return { index, op: TeRichTextOperationType.DELETE, blockId };
  }

  private static parseMove(
    operation: TeRichTextOperationInput,
    index: number,
    label: string,
    knownIds: Set<string>
  ): TeParsedOperation | string {
    const blockId = TeRichTextOperations.requireKnownBlockId(operation.blockId, label, knownIds);
    if (typeof blockId !== 'string') {
      return blockId.error;
    }

    const anchor = TeRichTextOperations.parseAnchor(operation, label, knownIds);
    if (!('kind' in anchor)) {
      return anchor.error;
    }
    if ((anchor.kind === 'before' || anchor.kind === 'after') && anchor.blockId === blockId) {
      return `${label}: a block cannot be moved relative to itself.`;
    }

    return { index, op: TeRichTextOperationType.MOVE, blockId, anchor };
  }

  /**
   * Exactly one of `before`, `after` and `at`. Two of them would describe two positions, and
   * picking one of the two silently is how a block ends up somewhere the caller did not ask for.
   */
  private static parseAnchor(
    operation: TeRichTextOperationInput,
    label: string,
    knownIds: Set<string>
  ): TeOperationAnchor | { error: string } {
    const given = (['before', 'after', 'at'] as const).filter(
      (field) => operation[field] != null && operation[field] !== ''
    );
    if (given.length !== 1) {
      return {
        error:
          `${label}: exactly one position is required — "before" or "after" a block id, or "at" ` +
          `"start"/"end". ${given.length === 0 ? 'None was given' : `Got ${given.join(' and ')}`}.`,
      };
    }

    if (given[0] === 'at') {
      const at = String(operation.at);
      if (at !== 'start' && at !== 'end') {
        return { error: `${label}: "at" is "start" or "end", got "${at}".` };
      }
      return { kind: at };
    }

    const blockId = String(operation[given[0]]);
    if (!knownIds.has(blockId)) {
      return {
        error:
          `${label}: no block "${blockId}" in this page, so "${given[0]}" names nothing. Read the ` +
          `page again with community_doc_read_blocks.`,
      };
    }
    return { kind: given[0], blockId };
  }

  private static requireKnownBlockId(
    blockId: string | undefined,
    label: string,
    knownIds: Set<string>
  ): string | { error: string } {
    if (blockId == null || blockId === '') {
      return { error: `${label}: "blockId" is required.` };
    }
    if (!knownIds.has(blockId)) {
      return {
        error:
          `${label}: no block "${blockId}" in this page. Nothing was written. Read the page again ` +
          `with community_doc_read_blocks — it may have been deleted since.`,
      };
    }
    return blockId;
  }

  /////////////////////////////////// THE WHOLE BATCH ///////////////////////////////////

  /**
   * The checks no single operation can make on its own.
   *
   * Two of a kind on one block would need an order to be resolved, and this class deliberately has
   * none.
   *
   * An anchor on a block the batch **moves** is that same problem in disguise: "after X" would mean
   * X's old gap or X's new place depending on which state you read it against, so it is refused
   * rather than resolved one way. A block the batch **deletes** has no new place, so its gap is the
   * one it leaves behind and there is nothing to disambiguate — which is what makes the repair for a
   * type change ("delete it and insert one in its place") expressible as a single batch. An anchor
   * on a merely updated block is fine too: an update does not move anything.
   */
  private static crossCheck(parsed: TeParsedOperation[]): string[] {
    const errors: string[] = [];
    const targets = new Map<string, TeRichTextOperationType[]>();

    for (const operation of parsed) {
      if (operation.blockId == null) {
        continue;
      }
      const kinds = targets.get(operation.blockId) ?? [];
      if (kinds.includes(operation.op)) {
        errors.push(
          `Block "${operation.blockId}" is the target of two "${operation.op}" operations in the ` +
            `same batch. Keep one — a batch is resolved against the page as it was read, so a ` +
            `second one has no state to apply to.`
        );
      }
      kinds.push(operation.op);
      targets.set(operation.blockId, kinds);
    }

    errors.push(...TeRichTextOperations.deletedAndAlsoErrors(targets));
    errors.push(...TeRichTextOperations.anchoredOnMovedErrors(parsed, targets));

    return errors;
  }

  /** A block cannot both leave the document and be changed within it. */
  private static deletedAndAlsoErrors(targets: Map<string, TeRichTextOperationType[]>): string[] {
    const errors: string[] = [];

    for (const [blockId, kinds] of targets) {
      if (kinds.includes(TeRichTextOperationType.DELETE) && kinds.length > 1) {
        errors.push(
          `Block "${blockId}" is deleted and also ${kinds
            .filter((kind) => kind !== TeRichTextOperationType.DELETE)
            .join('/')}d in the same batch. Keep one.`
        );
      }
    }

    return errors;
  }

  /** An anchor on a block the same batch moves names two possible gaps, so it names neither. */
  private static anchoredOnMovedErrors(
    parsed: TeParsedOperation[],
    targets: Map<string, TeRichTextOperationType[]>
  ): string[] {
    const errors: string[] = [];
    const moved = new Set(
      [...targets]
        .filter(([, kinds]) => kinds.includes(TeRichTextOperationType.MOVE))
        .map(([blockId]) => blockId)
    );

    for (const operation of parsed) {
      const anchor = operation.anchor;
      if (anchor == null || !('blockId' in anchor) || !moved.has(anchor.blockId)) {
        continue;
      }
      errors.push(
        `Operation ${operation.index + 1} is positioned "${anchor.kind}" block ` +
          `"${anchor.blockId}", which the same batch also moves. Positions are read against the ` +
          `page as it was read, so that one is ambiguous — it could mean where that block was or ` +
          `where it is going. Anchor on a block this batch does not move, or split the batch.`
      );
    }

    return errors;
  }

  /**
   * Build the new document. Called only once every check has passed, so nothing here refuses.
   *
   * The walk is what makes positions mean the document that was read: it goes through the original
   * blocks in their original order and, at each one, empties the gaps around it. A block that moved
   * away leaves its gap behind — which is exactly why anchoring on a moved block is refused above.
   */
  private static build(
    richText: TeRichText,
    blocks: TeBlock[],
    parsed: TeParsedOperation[]
  ): TeRichTextOperationsResult {
    const plan = TeRichTextOperations.plan(blocks, parsed);
    const byId = new Map(
      blocks
        .filter((block) => block?.id != null && block.id !== '')
        .map((block) => [block.id as string, block])
    );

    return {
      ok: true,
      // The document's own format version is passed as the target so building it cannot trigger a
      // migration: a batch of operations must change what the operations name and nothing else.
      richText: new TeRichText(
        {
          version: richText.version,
          editorVersion: richText.editorVersion,
          blocks: TeRichTextOperations.walk(blocks, plan, byId),
        },
        richText.version
      ),
      applied: TeRichTextOperations.summarize(parsed, plan, byId),
    };
  }

  /**
   * What the batch does to the document, gathered in batch order before a single block is built.
   */
  private static plan(blocks: TeBlock[], parsed: TeParsedOperation[]): TeOperationPlan {
    const plan: TeOperationPlan = {
      updates: new Map<string, TeBlockData>(),
      removed: new Set<string>(),
      placements: new Map<string, TeParsedOperation[]>(),
      insertedIds: new Map<number, string>(),
    };
    const mintId = TeRichTextOperations.idMinter(blocks);

    for (const operation of parsed) {
      switch (operation.op) {
        case TeRichTextOperationType.UPDATE:
          plan.updates.set(operation.blockId as string, operation.data as TeBlockData);
          break;
        case TeRichTextOperationType.DELETE:
          plan.removed.add(operation.blockId as string);
          break;
        case TeRichTextOperationType.MOVE:
          plan.removed.add(operation.blockId as string);
          TeRichTextOperations.addPlacement(plan.placements, operation);
          break;
        case TeRichTextOperationType.INSERT:
          plan.insertedIds.set(operation.index, mintId());
          TeRichTextOperations.addPlacement(plan.placements, operation);
          break;
      }
    }

    return plan;
  }

  /**
   * The blocks of the new document, in order.
   *
   * Goes through the original blocks in their original order and, at each one, empties the gaps
   * around it. A block that moved away leaves its gap behind — which is exactly why anchoring on a
   * moved block is refused by {@link crossCheck}.
   */
  private static walk(blocks: TeBlock[], plan: TeOperationPlan, byId: Map<string, TeBlock>): TeBlock[] {
    const result: TeBlock[] = [];
    const drain = (key: string): void => {
      for (const operation of plan.placements.get(key) ?? []) {
        result.push(TeRichTextOperations.blockOf(operation, plan, byId));
      }
      plan.placements.delete(key);
    };

    drain('at:start');
    for (const block of blocks) {
      const id = TeRichTextOperations.anchorableId(block);
      if (id != null) {
        drain(`before:${id}`);
      }
      if (id == null || !plan.removed.has(id)) {
        result.push(TeRichTextOperations.withUpdate(block, plan.updates));
      }
      if (id != null) {
        drain(`after:${id}`);
      }
    }
    drain('at:end');

    return result;
  }

  /** Resolve one waiting operation into the block it puts in the document. */
  private static blockOf(
    operation: TeParsedOperation,
    plan: TeOperationPlan,
    byId: Map<string, TeBlock>
  ): TeBlock {
    if (operation.op === TeRichTextOperationType.INSERT) {
      return {
        id: plan.insertedIds.get(operation.index),
        type: operation.blockType as TeBlockType,
        data: operation.data as TeBlockData,
      };
    }
    // A move carries the block over with its id — that is what keeps the history reading "moved"
    // rather than "deleted and recreated". Its data still goes through the updates, so a batch
    // that both rewrites and moves one block does both.
    return TeRichTextOperations.withUpdate(byId.get(operation.blockId as string) as TeBlock, plan.updates);
  }

  /** What the batch did, one entry per operation, in the order the batch listed them. */
  private static summarize(
    parsed: TeParsedOperation[],
    plan: TeOperationPlan,
    byId: Map<string, TeBlock>
  ): TeAppliedRichTextOperation[] {
    return parsed.map((operation) => {
      if (operation.op === TeRichTextOperationType.INSERT) {
        return {
          op: operation.op,
          blockId: plan.insertedIds.get(operation.index) as string,
          blockType: operation.blockType as TeBlockType,
        };
      }
      return {
        op: operation.op,
        blockId: operation.blockId as string,
        blockType: (byId.get(operation.blockId as string)?.type ?? operation.blockType) as TeBlockType,
      };
    });
  }

  /** The id a gap can be anchored to, or null for a block that carries none. */
  private static anchorableId(block: TeBlock): string | null {
    const id = block?.id;
    return id != null && id !== '' ? id : null;
  }

  private static addPlacement(
    placements: Map<string, TeParsedOperation[]>,
    operation: TeParsedOperation
  ): void {
    const anchor = operation.anchor as TeOperationAnchor;
    const key = 'blockId' in anchor ? `${anchor.kind}:${anchor.blockId}` : `at:${anchor.kind}`;
    placements.set(key, [...(placements.get(key) ?? []), operation]);
  }

  /** The block as it goes back into the document, with its new data if one was given. */
  private static withUpdate(block: TeBlock, updates: Map<string, TeBlockData>): TeBlock {
    const id = block?.id;
    if (id == null || !updates.has(id)) {
      return block;
    }
    return { ...block, data: updates.get(id) as TeBlockData };
  }

  /**
   * Mints ids no block of this document holds, this batch's own new blocks included.
   *
   * The collision check is the point of minting them here: {@link TeRichText.generateRandomBlockId}
   * draws from a small alphabet, and a duplicated id makes two blocks one as far as the history is
   * concerned — silently.
   */
  private static idMinter(blocks: TeBlock[]): () => string {
    const used = new Set(
      blocks.map((block) => block?.id).filter((id): id is string => id != null && id !== '')
    );
    return () => {
      let id = TeRichText.generateRandomBlockId();
      while (used.has(id)) {
        id = TeRichText.generateRandomBlockId();
      }
      used.add(id);
      return id;
    };
  }

  /** Which blocks a caller may rewrite, by id. Blocks with no id are in no map. */
  private static editableIds(richText: TeRichText): Map<string, boolean> {
    const editable = new Map<string, boolean>();
    for (const inspected of TeRichTextBlockInspector.inspect(richText)) {
      const id = inspected.block?.id;
      if (id != null && id !== '') {
        editable.set(id, inspected.editable);
      }
    }
    return editable;
  }

  private static parseOperationType(op: unknown): TeRichTextOperationType | null {
    const found = Object.values(TeRichTextOperationType).find((candidate) => candidate === op);
    return found ?? null;
  }

  private static parseBlockType(type: unknown): TeBlockType | null {
    const found = Object.values(TeBlockType).find((candidate) => candidate === type);
    return found ?? null;
  }

  private static hasPosition(operation: TeRichTextOperationInput): boolean {
    return (['before', 'after', 'at'] as const).some(
      (field) => operation[field] != null && operation[field] !== ''
    );
  }

  private static isData(data: unknown): data is TeBlockData {
    return data != null && typeof data === 'object' && !Array.isArray(data);
  }
}
