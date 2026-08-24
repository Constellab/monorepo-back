import { TeBlock, TeBlockType } from './lib/te-block.class';
import { TeRichText } from './lib/te-rich-text.class';
import {
  TeRichTextOperationInput,
  TeRichTextOperations,
  TeRichTextOperationsResult,
  TeRichTextOperationType,
} from './te-rich-text-operations.class';

/** A page of four paragraphs, `p1` to `p4`, which is enough to tell a position from a sequence. */
function page(): TeRichText {
  return richTextOf(
    paragraph('p1', 'One'),
    paragraph('p2', 'Two'),
    paragraph('p3', 'Three'),
    paragraph('p4', 'Four')
  );
}

function richTextOf(...blocks: TeBlock[]): TeRichText {
  return new TeRichText({ ...TeRichText.emptyJson(), blocks });
}

function paragraph(id: string, text: string): TeBlock {
  return { id, type: TeBlockType.PARAGRAPH, data: { text } };
}

function apply(
  operations: TeRichTextOperationInput[],
  richText: TeRichText = page()
): TeRichTextOperationsResult {
  return TeRichTextOperations.apply(richText, operations);
}

/** The ids of the resulting page, in order. Fails loudly rather than silently on a refusal. */
function idsAfter(operations: TeRichTextOperationInput[], richText: TeRichText = page()): string[] {
  const result = apply(operations, richText);
  if (!result.ok) {
    throw new Error(`Expected the batch to apply, got: ${result.errors.join(' / ')}`);
  }
  return result.richText.getBlocks().map((block) => block.id as string);
}

function errorsOf(operations: TeRichTextOperationInput[], richText: TeRichText = page()): string[] {
  const result = apply(operations, richText);
  if (result.ok) {
    throw new Error('Expected the batch to be refused, it applied.');
  }
  return result.errors;
}

describe('TeRichTextOperations', () => {
  describe('the four operations', () => {
    it('updates a block in place, keeping its id and its type', () => {
      const result = apply([{ op: 'update', blockId: 'p2', data: { text: 'Two, edited' } }]);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.richText.getBlocks().map((block) => block.id)).toEqual(['p1', 'p2', 'p3', 'p4']);
      expect(result.richText.getBlock('p2')).toEqual({
        id: 'p2',
        type: TeBlockType.PARAGRAPH,
        data: { text: 'Two, edited' },
      });
    });

    it('deletes a block and leaves every other one untouched', () => {
      const result = apply([{ op: 'delete', blockId: 'p2' }]);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.richText.getBlocks()).toEqual([
        paragraph('p1', 'One'),
        paragraph('p3', 'Three'),
        paragraph('p4', 'Four'),
      ]);
    });

    it('inserts at each of the four positions', () => {
      const insert = (position: Partial<TeRichTextOperationInput>): string[] =>
        idsAfter([{ ...position, op: 'insert', type: 'paragraph', data: { text: 'New' } }]);

      expect(insert({ at: 'start' })[0]).not.toBe('p1');
      expect(insert({ at: 'end' })).toHaveLength(5);
      expect(insert({ at: 'end' })[4]).not.toBe('p4');
      expect(insert({ before: 'p3' }).indexOf('p3')).toBe(3);
      expect(insert({ after: 'p1' }).indexOf('p2')).toBe(2);
    });

    it('moves a block, carrying its id and data over rather than recreating it', () => {
      const result = apply([{ op: 'move', blockId: 'p1', at: 'end' }]);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.richText.getBlocks()).toEqual([
        paragraph('p2', 'Two'),
        paragraph('p3', 'Three'),
        paragraph('p4', 'Four'),
        paragraph('p1', 'One'),
      ]);
    });

    it('keeps the untouched blocks byte for byte, so the history names only what changed', () => {
      const before = page();
      const result = apply([{ op: 'update', blockId: 'p2', data: { text: 'Two, edited' } }], before);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      for (const id of ['p1', 'p3', 'p4']) {
        expect(result.richText.getBlock(id)).toEqual(before.getBlock(id));
      }
    });

    it('applies an update and a move of the same block together', () => {
      const result = apply([
        { op: 'update', blockId: 'p1', data: { text: 'One, edited' } },
        { op: 'move', blockId: 'p1', at: 'end' },
      ]);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.richText.getBlocks()[3]).toEqual(paragraph('p1', 'One, edited'));
    });
  });

  describe('the ids of inserted blocks', () => {
    it('are minted by the server and returned in the summary', () => {
      const result = apply([{ op: 'insert', type: 'paragraph', data: { text: 'New' }, at: 'end' }]);

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const inserted = result.richText.getBlocks()[4];
      expect(inserted.id).toEqual(expect.any(String));
      expect(result.applied).toEqual([
        { op: TeRichTextOperationType.INSERT, blockId: inserted.id, blockType: TeBlockType.PARAGRAPH },
      ]);
    });

    it('ignore an id the caller tries to choose', () => {
      expect(
        errorsOf([{ op: 'insert', blockId: 'p1', type: 'paragraph', data: { text: 'New' }, at: 'end' }])[0]
      ).toContain('minted by the server');
    });

    it('never collide with an existing one', () => {
      // Every draw but the last returns an id the page already holds, so the minter has to keep
      // drawing: an id collision would make two blocks one as far as the history is concerned.
      const draws = ['p1', 'p2', 'p3', 'fresh'];
      const spy = jest
        .spyOn(TeRichText, 'generateRandomBlockId')
        .mockImplementation(() => draws.shift() as string);

      try {
        expect(idsAfter([{ op: 'insert', type: 'paragraph', data: { text: 'New' }, at: 'end' }])).toEqual([
          'p1',
          'p2',
          'p3',
          'p4',
          'fresh',
        ]);
      } finally {
        spy.mockRestore();
      }
    });

    it('differ between two inserts of one batch', () => {
      const ids = idsAfter([
        { op: 'insert', type: 'paragraph', data: { text: 'A' }, at: 'end' },
        { op: 'insert', type: 'paragraph', data: { text: 'B' }, at: 'end' },
      ]);

      expect(new Set(ids).size).toBe(6);
    });
  });

  describe('positions read against the page as it was read', () => {
    it('does not stack two inserts anchored on the same block', () => {
      const ids = idsAfter([
        { op: 'insert', type: 'paragraph', data: { text: 'A' }, after: 'p1' },
        { op: 'insert', type: 'paragraph', data: { text: 'B' }, after: 'p1' },
      ]);

      // Both land in the gap after p1, in the order the batch listed them — not one after the
      // other, which is what resolving the second against the first would give.
      expect(ids.slice(0, 4)).toEqual(['p1', ids[1], ids[2], 'p2']);
      expect(ids[1]).not.toBe(ids[2]);
    });

    it('reads a delete of an earlier block without shifting a later position', () => {
      expect(
        idsAfter([
          { op: 'delete', blockId: 'p1' },
          { op: 'insert', type: 'paragraph', data: { text: 'New' }, after: 'p3' },
        ]).slice(0, 4)
      ).toEqual(['p2', 'p3', expect.any(String), 'p4']);
    });

    it('refuses a position anchored on a block the same batch moves', () => {
      expect(
        errorsOf([
          { op: 'move', blockId: 'p2', at: 'end' },
          { op: 'move', blockId: 'p3', before: 'p2' },
        ])[0]
      ).toContain('ambiguous');

      expect(
        errorsOf([
          { op: 'move', blockId: 'p2', at: 'start' },
          { op: 'insert', type: 'paragraph', data: { text: 'New' }, after: 'p2' },
        ])[0]
      ).toContain('ambiguous');
    });

    /**
     * The repair the refusal of a type change tells the caller to perform. A deleted block has no
     * new place, so its gap is unambiguous — refusing this would make the instruction unfollowable.
     */
    it('replaces a block in place through a delete and an insert in one batch', () => {
      const ids = idsAfter([
        { op: 'delete', blockId: 'p2' },
        { op: 'insert', type: 'header', data: { text: 'Two', level: 2 }, before: 'p2' },
      ]);

      expect(ids).toHaveLength(4);
      expect(ids[0]).toBe('p1');
      expect(ids[2]).toBe('p3');
      expect(ids[1]).not.toBe('p2');
    });

    it('reads "after" a deleted block as the gap it left, just like "before"', () => {
      const ids = idsAfter([
        { op: 'delete', blockId: 'p2' },
        { op: 'insert', type: 'paragraph', data: { text: 'New' }, after: 'p2' },
      ]);

      expect(ids[1]).not.toBe('p2');
      expect(ids[2]).toBe('p3');
    });

    it('allows a position anchored on a block the batch merely updates', () => {
      expect(
        idsAfter([
          { op: 'update', blockId: 'p2', data: { text: 'Two, edited' } },
          { op: 'insert', type: 'paragraph', data: { text: 'New' }, after: 'p2' },
        ]).slice(0, 3)
      ).toEqual(['p1', 'p2', expect.any(String)]);
    });

    it('refuses a position that names two gaps, or none', () => {
      expect(
        errorsOf([{ op: 'insert', type: 'paragraph', data: { text: 'New' }, after: 'p1', at: 'end' }])[0]
      ).toContain('after and at');
      expect(errorsOf([{ op: 'insert', type: 'paragraph', data: { text: 'New' } }])[0]).toContain(
        'None was given'
      );
    });

    it('refuses a move relative to the block being moved', () => {
      expect(errorsOf([{ op: 'move', blockId: 'p2', after: 'p2' }])[0]).toContain('relative to itself');
    });

    it('refuses a position on a block the page does not hold', () => {
      expect(
        errorsOf([{ op: 'insert', type: 'paragraph', data: { text: 'New' }, after: 'nope' }])[0]
      ).toContain('no block "nope"');
    });
  });

  describe('a refused batch writes nothing', () => {
    it('refuses the whole batch for one unknown blockId', () => {
      const result = apply([
        { op: 'update', blockId: 'p1', data: { text: 'One, edited' } },
        { op: 'delete', blockId: 'ghost' },
      ]);

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('no block "ghost"');
    });

    it('reports every bad operation at once, so one round trip fixes them all', () => {
      expect(
        errorsOf([{ op: 'delete', blockId: 'ghost' }, { op: 'sing' }, { op: 'update', blockId: 'p1' }])
      ).toHaveLength(3);
    });

    it('refuses a type change through an update, naming the way to do it', () => {
      const errors = errorsOf([
        { op: 'update', blockId: 'p1', type: 'header', data: { text: 'A', level: 2 } },
      ]);

      expect(errors[0]).toContain('cannot change the type');
      // The message has to name a repair the batch rules actually accept — see the delete-and-insert
      // test above, which is the batch it describes.
      expect(errors[0]).toContain('delete "p1" and insert a "header" block positioned "before" it');
    });

    it('refuses an update of a block that is not editable', () => {
      const withFigure = richTextOf(paragraph('p1', 'One'), {
        id: 'f1',
        type: TeBlockType.FIGURE,
        data: { title: 'A figure', filename: 'fig-1.png' },
      });

      expect(
        errorsOf([{ op: 'update', blockId: 'f1', data: { title: 'Renamed' } }], withFigure)[0]
      ).toContain('not editable');
    });

    it('moves and deletes a block that is not editable, since that is what keeps it whole', () => {
      const withFigure = richTextOf(paragraph('p1', 'One'), {
        id: 'f1',
        type: TeBlockType.FIGURE,
        data: { title: 'A figure', filename: 'fig-1.png' },
      });

      expect(idsAfter([{ op: 'move', blockId: 'f1', at: 'start' }], withFigure)).toEqual(['f1', 'p1']);
      expect(idsAfter([{ op: 'delete', blockId: 'f1' }], withFigure)).toEqual(['p1']);
    });

    it('refuses inserting a block whose content comes from an upload or a lab', () => {
      for (const type of ['figure', 'resourceView', 'fileView']) {
        expect(errorsOf([{ op: 'insert', type, data: { title: 'A' }, at: 'end' }])[0]).toContain(
          'cannot be inserted'
        );
      }
    });

    it('refuses an unknown block type on an insert', () => {
      expect(errorsOf([{ op: 'insert', type: 'video', data: {}, at: 'end' }])[0]).toContain(
        '"type" is required'
      );
    });

    it('refuses two operations of the same kind on one block', () => {
      expect(
        errorsOf([
          { op: 'update', blockId: 'p1', data: { text: 'A' } },
          { op: 'update', blockId: 'p1', data: { text: 'B' } },
        ])[0]
      ).toContain('two "update" operations');
    });

    it('refuses deleting a block the same batch also edits', () => {
      expect(
        errorsOf([
          { op: 'delete', blockId: 'p1' },
          { op: 'update', blockId: 'p1', data: { text: 'A' } },
        ]).some((error) => error.includes('deleted and also'))
      ).toBe(true);
    });

    it('refuses a position on an update and a delete, rather than dropping it silently', () => {
      expect(errorsOf([{ op: 'update', blockId: 'p1', data: { text: 'A' }, at: 'end' }])[0]).toContain(
        'takes no position'
      );
      expect(errorsOf([{ op: 'delete', blockId: 'p1', at: 'end' }])[0]).toContain('takes no position');
    });

    it('refuses an update with no data, since data is the whole new block', () => {
      expect(errorsOf([{ op: 'update', blockId: 'p1' }])[0]).toContain('"data" is required');
    });
  });

  describe('the size of a batch', () => {
    function inserts(count: number): TeRichTextOperationInput[] {
      return Array.from({ length: count }, () => ({
        op: 'insert',
        type: 'paragraph',
        data: { text: 'New' },
        at: 'end',
      }));
    }

    it('accepts the bound', () => {
      expect(idsAfter(inserts(TeRichTextOperations.MAX_OPERATIONS))).toHaveLength(
        4 + TeRichTextOperations.MAX_OPERATIONS
      );
    });

    it('refuses one operation past it, and says nothing was written', () => {
      const errors = errorsOf(inserts(TeRichTextOperations.MAX_OPERATIONS + 1));

      expect(errors[0]).toContain(`at most ${TeRichTextOperations.MAX_OPERATIONS} operations`);
      expect(errors[0]).toContain('Nothing was written');
    });

    it('refuses an empty batch', () => {
      expect(errorsOf([])[0]).toContain('at least one operation');
    });
  });

  describe('a page holding a block with no id', () => {
    /** Blocks predating ids. Nothing can name them, and a batch must not lose them either. */
    const legacy = (): TeRichText =>
      richTextOf(paragraph('p1', 'One'), { type: TeBlockType.PARAGRAPH, data: { text: 'Old' } });

    it('carries it over untouched', () => {
      const result = apply([{ op: 'update', blockId: 'p1', data: { text: 'One, edited' } }], legacy());

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.richText.getBlocks()[1]).toEqual({
        type: TeBlockType.PARAGRAPH,
        data: { text: 'Old' },
      });
    });
  });

  it('keeps the document format version, so a batch cannot smuggle a migration in', () => {
    const before = page();
    const result = apply([{ op: 'delete', blockId: 'p1' }], before);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.richText.version).toBe(before.version);
    expect(result.richText.editorVersion).toBe(before.editorVersion);
  });
});
