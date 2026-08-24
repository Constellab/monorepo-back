import { TeBlockType } from './te-block.class';
import { TeHTMLEditorJSON, TeRichText } from './te-rich-text.class';
import {
  TeNewFullRichTextDTO,
  TeOldRichTextContentWithModificationsI,
  TeRichTextAggregate,
} from './te-rich-text-aggregate.class';
import {
  TeRichTextBlockModification,
  TeRichTextModificationType,
} from './te-rich-text-block-modification.class';
import {
  TeRichTextBlockModificationWithUser,
  TeRichTextGetUserFunction,
} from './te-rich-text-block-modification.dto';
import { TeRichTextModifications } from './te-rich-text-modifications.class';
import { TeUser } from './te-user.class';

describe('TeRichTextAggregate', () => {
  const mockUserId = 'user-123';
  const mockUser: TeUser = {
    id: mockUserId,
    alias: 'testuser',
    photo: 'photo.jpg',
    firstname: 'Test',
    lastname: 'User',
  };

  let mockGetUser: TeRichTextGetUserFunction;

  beforeEach(() => {
    mockGetUser = jest.fn().mockResolvedValue(mockUser);
  });

  describe('constructor', () => {
    it('should create instance with default parameters', () => {
      const aggregate = new TeRichTextAggregate();

      expect(aggregate.richText).toBeInstanceOf(TeRichText);
      expect(aggregate.modifications).toBeInstanceOf(TeRichTextModifications);
      expect(aggregate.version).toBe(1);
      expect(aggregate.richText.isEmpty()).toBe(true);
      expect(aggregate.modifications.isEmpty()).toBe(true);
    });

    it('should create instance with provided rich text', () => {
      const richText = new TeRichText({
        version: 2,
        editorVersion: '2.30.2',
        blocks: [{ id: 'block-1', type: TeBlockType.PARAGRAPH, data: { text: 'Test' } }],
      });

      const aggregate = new TeRichTextAggregate(richText);

      expect(aggregate.richText).toBe(richText);
      expect(aggregate.richText.isEmpty()).toBe(false);
    });

    it('should create instance with provided modifications', () => {
      const modification = new TeRichTextBlockModification(
        'block-1',
        TeBlockType.PARAGRAPH,
        TeRichTextModificationType.CREATED,
        0,
        mockUserId
      );
      const modifications = new TeRichTextModifications([modification]);

      const aggregate = new TeRichTextAggregate(undefined, modifications);

      expect(aggregate.modifications).toBe(modifications);
      expect(aggregate.modifications.isEmpty()).toBe(false);
    });

    it('should create instance with custom version', () => {
      const aggregate = new TeRichTextAggregate(undefined, undefined, 2);

      expect(aggregate.version).toBe(2);
    });
  });

  describe('fromJson', () => {
    it('should create from TeHTMLEditorJSON (old format)', () => {
      const htmlEditorJson: TeHTMLEditorJSON = {
        version: '2.30.2',
        time: Date.now(),
        blocks: [{ id: 'block-1', type: TeBlockType.PARAGRAPH, data: { text: 'Test' } }],
      };

      const aggregate = TeRichTextAggregate.fromJson(htmlEditorJson);

      expect(aggregate).toBeInstanceOf(TeRichTextAggregate);
      expect(aggregate.richText.getBlocks()).toHaveLength(1);
      expect(aggregate.modifications.isEmpty()).toBe(true);
    });

    it('should create from TeOldRichTextContentWithModificationsI', () => {
      const oldContent: TeOldRichTextContentWithModificationsI = {
        content: {
          version: '2.30.2',
          time: Date.now(),
          blocks: [{ id: 'block-1', type: TeBlockType.PARAGRAPH, data: { text: 'Test' } }],
        },
        modifications: {
          version: 2,
          modifications: [
            {
              id: 'mod-1',
              time: '2023-01-01T10:00:00.000Z',
              blockId: 'block-1',
              blockType: TeBlockType.PARAGRAPH,
              type: TeRichTextModificationType.CREATED,
              index: 0,
              userId: mockUserId,
              blockValue: { text: 'Test' },
            },
          ],
        },
      };

      const aggregate = TeRichTextAggregate.fromJson(oldContent);

      expect(aggregate).toBeInstanceOf(TeRichTextAggregate);
      expect(aggregate.richText.getBlocks()).toHaveLength(1);
      expect(aggregate.modifications.isEmpty()).toBe(false);
    });

    it('should create from TeNewFullRichTextDTO (new format)', () => {
      const newContent: TeNewFullRichTextDTO = {
        version: 1,
        richText: {
          version: 2,
          editorVersion: '2.30.2',
          blocks: [{ id: 'block-1', type: TeBlockType.PARAGRAPH, data: { text: 'Test' } }],
        },
        modifications: {
          version: 2,
          modifications: [
            {
              id: 'mod-1',
              time: '2023-01-01T10:00:00.000Z',
              blockId: 'block-1',
              blockType: TeBlockType.PARAGRAPH,
              type: TeRichTextModificationType.CREATED,
              index: 0,
              userId: mockUserId,
              blockValue: { text: 'Test' },
            },
          ],
        },
      };

      const aggregate = TeRichTextAggregate.fromJson(newContent);

      expect(aggregate).toBeInstanceOf(TeRichTextAggregate);
      expect(aggregate.version).toBe(1);
      expect(aggregate.richText.getBlocks()).toHaveLength(1);
      expect(aggregate.modifications.isEmpty()).toBe(false);
    });

    it('should handle new format without modifications', () => {
      const newContent: TeNewFullRichTextDTO = {
        version: 1,
        richText: {
          version: 2,
          editorVersion: '2.30.2',
          blocks: [],
        },
      };

      const aggregate = TeRichTextAggregate.fromJson(newContent);

      expect(aggregate).toBeInstanceOf(TeRichTextAggregate);
      expect(aggregate.modifications.isEmpty()).toBe(true);
    });
  });

  describe('updateContent', () => {
    let aggregate: TeRichTextAggregate;

    beforeEach(() => {
      const initialRichText = new TeRichText({
        version: 2,
        editorVersion: '2.30.2',
        blocks: [{ id: 'block-1', type: TeBlockType.PARAGRAPH, data: { text: 'Original' } }],
      });
      aggregate = new TeRichTextAggregate(initialRichText);
    });

    it('should update content and generate modifications', () => {
      const newRichText = new TeRichText({
        version: 2,
        editorVersion: '2.30.2',
        blocks: [
          { id: 'block-1', type: TeBlockType.PARAGRAPH, data: { text: 'Updated' } },
          { id: 'block-2', type: TeBlockType.PARAGRAPH, data: { text: 'New block' } },
        ],
      });

      aggregate.updateContent(newRichText, mockUserId);

      expect(aggregate.richText).toBe(newRichText);
      expect(aggregate.modifications.isEmpty()).toBe(false);
      expect(aggregate.modifications.getModifications().length).toBeGreaterThan(0);
    });

    it('should handle content without changes', () => {
      const sameRichText = new TeRichText({
        version: 2,
        editorVersion: '2.30.2',
        blocks: [{ id: 'block-1', type: TeBlockType.PARAGRAPH, data: { text: 'Original' } }],
      });

      aggregate.updateContent(sameRichText, mockUserId);

      expect(aggregate.richText).toBe(sameRichText);
    });
  });

  describe('getRichTextAsJson', () => {
    it('should return rich text as JSON', () => {
      const richText = new TeRichText({
        version: 2,
        editorVersion: '2.30.2',
        blocks: [{ id: 'block-1', type: TeBlockType.PARAGRAPH, data: { text: 'Test' } }],
      });
      const aggregate = new TeRichTextAggregate(richText);

      const result = aggregate.getRichTextAsJson();

      expect(result).toEqual({
        version: 2,
        editorVersion: '2.30.2',
        blocks: [{ id: 'block-1', type: TeBlockType.PARAGRAPH, data: { text: 'Test' } }],
      });
    });
  });

  describe('compareWithCurrent', () => {
    let aggregate: TeRichTextAggregate;

    beforeEach(() => {
      const initialRichText = new TeRichText({
        version: 2,
        editorVersion: '2.30.2',
        blocks: [
          { id: 'block-1', type: TeBlockType.PARAGRAPH, data: { text: 'Block 1' } },
          { id: 'block-2', type: TeBlockType.PARAGRAPH, data: { text: 'Block 2' } },
        ],
      });
      aggregate = new TeRichTextAggregate(initialRichText);
    });

    it('should detect created blocks', () => {
      const newRichText = new TeRichText({
        version: 2,
        editorVersion: '2.30.2',
        blocks: [
          { id: 'block-1', type: TeBlockType.PARAGRAPH, data: { text: 'Block 1' } },
          { id: 'block-2', type: TeBlockType.PARAGRAPH, data: { text: 'Block 2' } },
          { id: 'block-3', type: TeBlockType.PARAGRAPH, data: { text: 'New Block' } },
        ],
      });

      const result = aggregate.compareWithCurrent(newRichText, mockUserId);

      expect(result.getModifications().length).toBeGreaterThan(0);
      const createdModification = result
        .getModifications()
        .find((mod) => mod.type === TeRichTextModificationType.CREATED && mod.blockId === 'block-3');
      expect(createdModification).toBeDefined();
      expect(createdModification!.type).toBe(TeRichTextModificationType.CREATED);
    });

    it('should detect deleted blocks', () => {
      const newRichText = new TeRichText({
        version: 2,
        editorVersion: '2.30.2',
        blocks: [{ id: 'block-1', type: TeBlockType.PARAGRAPH, data: { text: 'Block 1' } }],
      });

      const result = aggregate.compareWithCurrent(newRichText, mockUserId);

      expect(result.getModifications().length).toBeGreaterThan(0);
      const deletedModification = result
        .getModifications()
        .find((mod) => mod.type === TeRichTextModificationType.DELETED && mod.blockId === 'block-2');
      expect(deletedModification).toBeDefined();
      expect(deletedModification!.type).toBe(TeRichTextModificationType.DELETED);
    });

    it('should detect updated blocks', () => {
      const newRichText = new TeRichText({
        version: 2,
        editorVersion: '2.30.2',
        blocks: [
          { id: 'block-1', type: TeBlockType.PARAGRAPH, data: { text: 'Updated Block 1' } },
          { id: 'block-2', type: TeBlockType.PARAGRAPH, data: { text: 'Block 2' } },
        ],
      });

      const result = aggregate.compareWithCurrent(newRichText, mockUserId);

      expect(result.getModifications().length).toBeGreaterThan(0);
      const updatedModification = result
        .getModifications()
        .find((mod) => mod.type === TeRichTextModificationType.UPDATED && mod.blockId === 'block-1');
      expect(updatedModification).toBeDefined();
      expect(updatedModification!.type).toBe(TeRichTextModificationType.UPDATED);
      expect(updatedModification!.differences).toBeDefined();
    });

    it('should detect moved blocks', () => {
      // Create a test with 3 blocks and move one to a different position
      const initialRichText = new TeRichText({
        version: 2,
        editorVersion: '2.30.2',
        blocks: [
          { id: 'block-1', type: TeBlockType.PARAGRAPH, data: { text: 'Block 1' } },
          { id: 'block-2', type: TeBlockType.PARAGRAPH, data: { text: 'Block 2' } },
          { id: 'block-3', type: TeBlockType.PARAGRAPH, data: { text: 'Block 3' } },
        ],
      });
      const threeBlockAggregate = new TeRichTextAggregate(initialRichText);

      const newRichText = new TeRichText({
        version: 2,
        editorVersion: '2.30.2',
        blocks: [
          { id: 'block-2', type: TeBlockType.PARAGRAPH, data: { text: 'Block 2' } },
          { id: 'block-3', type: TeBlockType.PARAGRAPH, data: { text: 'Block 3' } },
          { id: 'block-1', type: TeBlockType.PARAGRAPH, data: { text: 'Block 1' } },
        ],
      });

      const result = threeBlockAggregate.compareWithCurrent(newRichText, mockUserId);

      // When a block is moved to the end, it should be detected as a move
      expect(result.getModifications().length).toBeGreaterThan(0);
      const moveModifications = result
        .getModifications()
        .filter((mod) => mod.type === TeRichTextModificationType.MOVED);
      expect(moveModifications.length).toBeGreaterThan(0);

      // Verify that at least one move has different old and new positions
      const hasMoveWithDifferentPosition = moveModifications.some((mod) => mod.index !== mod.oldIndex);
      expect(hasMoveWithDifferentPosition).toBe(true);
    });

    /**
     * The index a moved block came from, exactly. The scan for deleted blocks walks the old
     * document backwards, and doing that in place used to leave the old document reversed for the
     * scan that follows — so every `oldIndex` came out mirrored: a two-block reorder was reported as
     * no change at all, and a longer one named the wrong block. An `oldIndex` that lies is not a
     * cosmetic fault: undo splices on it.
     */
    it('reports the position a moved block actually came from, and leaves the old document alone', () => {
      const before = new TeRichText({
        version: 2,
        editorVersion: '2.30.2',
        blocks: [
          { id: 'block-1', type: TeBlockType.PARAGRAPH, data: { text: 'Block 1' } },
          { id: 'block-2', type: TeBlockType.PARAGRAPH, data: { text: 'Block 2' } },
          { id: 'block-3', type: TeBlockType.PARAGRAPH, data: { text: 'Block 3' } },
        ],
      });
      const threeBlockAggregate = new TeRichTextAggregate(before);

      const result = threeBlockAggregate.compareWithCurrent(
        new TeRichText({
          version: 2,
          editorVersion: '2.30.2',
          blocks: [
            { id: 'block-2', type: TeBlockType.PARAGRAPH, data: { text: 'Block 2' } },
            { id: 'block-3', type: TeBlockType.PARAGRAPH, data: { text: 'Block 3' } },
            { id: 'block-1', type: TeBlockType.PARAGRAPH, data: { text: 'Block 1' } },
          ],
        }),
        mockUserId
      );

      expect(
        result
          .getModifications()
          .filter((mod) => mod.type === TeRichTextModificationType.MOVED)
          .map((mod) => [mod.blockId, mod.oldIndex, mod.index])
      ).toEqual([
        ['block-2', 1, 0],
        ['block-3', 2, 1],
        ['block-1', 0, 2],
      ]);
      expect(before.getBlocks().map((block) => block.id)).toEqual(['block-1', 'block-2', 'block-3']);
    });

    it('detects a two-block reorder rather than reporting no change', () => {
      const result = aggregate.compareWithCurrent(
        new TeRichText({
          version: 2,
          editorVersion: '2.30.2',
          blocks: [
            { id: 'block-2', type: TeBlockType.PARAGRAPH, data: { text: 'Block 2' } },
            { id: 'block-1', type: TeBlockType.PARAGRAPH, data: { text: 'Block 1' } },
          ],
        }),
        mockUserId
      );

      expect(
        result.getModifications().map((mod) => [mod.blockId, mod.type, mod.oldIndex, mod.index])
      ).toEqual([
        ['block-2', TeRichTextModificationType.MOVED, 1, 0],
        ['block-1', TeRichTextModificationType.MOVED, 0, 1],
      ]);
    });

    it('should handle LIST blocks with meta removal', () => {
      const initialRichText = new TeRichText({
        version: 2,
        editorVersion: '2.30.2',
        blocks: [
          {
            id: 'list-1',
            type: TeBlockType.LIST,
            data: {
              items: [{ content: 'Item 1', items: [] }],
              meta: { someMetaData: true },
            },
          },
        ],
      });
      aggregate = new TeRichTextAggregate(initialRichText);

      const newRichText = new TeRichText({
        version: 2,
        editorVersion: '2.30.2',
        blocks: [
          {
            id: 'list-1',
            type: TeBlockType.LIST,
            data: {
              items: [{ content: 'Updated Item 1', items: [] }],
              meta: { differentMeta: true },
            },
          },
        ],
      });

      const result = aggregate.compareWithCurrent(newRichText, mockUserId);

      expect(result.getModifications()).toHaveLength(1);
      expect(result.getModifications()[0].type).toBe(TeRichTextModificationType.UPDATED);
    });

    it('should handle empty comparison', () => {
      const emptyAggregate = new TeRichTextAggregate();
      const emptyRichText = new TeRichText();

      const result = emptyAggregate.compareWithCurrent(emptyRichText, mockUserId);

      expect(result.getModifications()).toHaveLength(0);
    });
  });

  describe('undo functionality', () => {
    let aggregate: TeRichTextAggregate;

    beforeEach(() => {
      const initialRichText = new TeRichText({
        version: 2,
        editorVersion: '2.30.2',
        blocks: [{ id: 'block-1', type: TeBlockType.PARAGRAPH, data: { text: 'Original' } }],
      });
      aggregate = new TeRichTextAggregate(initialRichText);

      const updatedRichText = new TeRichText({
        version: 2,
        editorVersion: '2.30.2',
        blocks: [{ id: 'block-1', type: TeBlockType.PARAGRAPH, data: { text: 'Updated' } }],
      });
      aggregate.updateContent(updatedRichText, mockUserId);
    });

    describe('undoLastModification', () => {
      it('should undo last modification and return it', () => {
        const lastModifications = aggregate.undoLastModification();

        expect(lastModifications).toBeDefined();
        expect(lastModifications.length).toBe(1);
        expect(lastModifications[0].type).toBe(TeRichTextModificationType.UPDATED);
        expect(aggregate.richText.getBlock('block-1')!.data.text).toBe('Original');
      });

      it('should return empty array when no modifications exist', () => {
        const emptyAggregate = new TeRichTextAggregate();
        const result = emptyAggregate.undoLastModification();

        expect(result).toEqual([]);
      });
    });

    describe('undoModifications', () => {
      it('should undo modifications from specified ID', () => {
        const modifications = aggregate.modifications.getModifications();
        const modificationId = modifications[0].id;

        aggregate.undoModifications(modificationId);

        expect(aggregate.richText.getBlock('block-1')!.data.text).toBe('Original');
      });

      it('should handle CREATED modification undo', () => {
        const richTextWithNewBlock = new TeRichText({
          version: 2,
          editorVersion: '2.30.2',
          blocks: [
            { id: 'block-1', type: TeBlockType.PARAGRAPH, data: { text: 'Updated' } },
            { id: 'block-2', type: TeBlockType.PARAGRAPH, data: { text: 'New Block' } },
          ],
        });
        aggregate.updateContent(richTextWithNewBlock, mockUserId);

        const modifications = aggregate.modifications.getModifications();
        const createModification = modifications.find((m) => m.type === TeRichTextModificationType.CREATED);

        if (createModification) {
          aggregate.undoModifications(createModification.id);
          expect(aggregate.richText.getBlocks()).toHaveLength(1);
        }
      });

      it('should handle DELETED modification undo', () => {
        const richTextWithDeletedBlock = new TeRichText({
          version: 2,
          editorVersion: '2.30.2',
          blocks: [],
        });
        aggregate.updateContent(richTextWithDeletedBlock, mockUserId);

        const modifications = aggregate.modifications.getModifications();
        const deleteModification = modifications.find((m) => m.type === TeRichTextModificationType.DELETED);

        if (deleteModification) {
          aggregate.undoModifications(deleteModification.id);
          expect(aggregate.richText.getBlocks()).toHaveLength(1);
        }
      });

      it('should handle MOVED modification undo', () => {
        const richTextWithMovedBlocks = new TeRichText({
          version: 2,
          editorVersion: '2.30.2',
          blocks: [
            { id: 'block-2', type: TeBlockType.PARAGRAPH, data: { text: 'Block 2' } },
            { id: 'block-1', type: TeBlockType.PARAGRAPH, data: { text: 'Updated' } },
          ],
        });

        aggregate.richText = new TeRichText({
          version: 2,
          editorVersion: '2.30.2',
          blocks: [
            { id: 'block-1', type: TeBlockType.PARAGRAPH, data: { text: 'Updated' } },
            { id: 'block-2', type: TeBlockType.PARAGRAPH, data: { text: 'Block 2' } },
          ],
        });

        aggregate.updateContent(richTextWithMovedBlocks, mockUserId);

        const modifications = aggregate.modifications.getModifications();
        const moveModification = modifications.find((m) => m.type === TeRichTextModificationType.MOVED);

        if (moveModification) {
          aggregate.undoModifications(moveModification.id);
        }
      });
    });
  });

  describe('redo functionality', () => {
    let aggregate: TeRichTextAggregate;

    beforeEach(() => {
      const initialRichText = new TeRichText({
        version: 2,
        editorVersion: '2.30.2',
        blocks: [{ id: 'block-1', type: TeBlockType.PARAGRAPH, data: { text: 'Original' } }],
      });
      aggregate = new TeRichTextAggregate(initialRichText);

      const updatedRichText = new TeRichText({
        version: 2,
        editorVersion: '2.30.2',
        blocks: [{ id: 'block-1', type: TeBlockType.PARAGRAPH, data: { text: 'Updated' } }],
      });
      aggregate.updateContent(updatedRichText, mockUserId);
      aggregate.undoLastModification();
    });

    describe('redoLastModification', () => {
      it('should redo last modification and return it', () => {
        const redoneModifications = aggregate.redoLastModification();

        expect(redoneModifications).toBeDefined();
        expect(redoneModifications.length).toBe(1);
        expect(redoneModifications[0].type).toBe(TeRichTextModificationType.UPDATED);
        expect(aggregate.richText.getBlock('block-1')!.data.text).toBe('Updated');
      });

      it('should return empty array when no redo modifications exist', () => {
        const emptyAggregate = new TeRichTextAggregate();
        const result = emptyAggregate.redoLastModification();

        expect(result).toEqual([]);
      });

      it('should handle CREATED modification redo', () => {
        const richTextWithNewBlock = new TeRichText({
          version: 2,
          editorVersion: '2.30.2',
          blocks: [
            { id: 'block-1', type: TeBlockType.PARAGRAPH, data: { text: 'Original' } },
            { id: 'block-2', type: TeBlockType.PARAGRAPH, data: { text: 'New Block' } },
          ],
        });

        const newAggregate = new TeRichTextAggregate(
          new TeRichText({
            version: 2,
            editorVersion: '2.30.2',
            blocks: [{ id: 'block-1', type: TeBlockType.PARAGRAPH, data: { text: 'Original' } }],
          })
        );

        newAggregate.updateContent(richTextWithNewBlock, mockUserId);
        newAggregate.undoLastModification();

        const redoneModifications = newAggregate.redoLastModification();

        expect(redoneModifications[0].type).toBe(TeRichTextModificationType.CREATED);
        expect(newAggregate.richText.getBlocks()).toHaveLength(2);
      });

      it('should handle DELETED modification redo', () => {
        const newAggregate = new TeRichTextAggregate(
          new TeRichText({
            version: 2,
            editorVersion: '2.30.2',
            blocks: [{ id: 'block-1', type: TeBlockType.PARAGRAPH, data: { text: 'Original' } }],
          })
        );

        const emptyRichText = new TeRichText({
          version: 2,
          editorVersion: '2.30.2',
          blocks: [],
        });

        newAggregate.updateContent(emptyRichText, mockUserId);
        newAggregate.undoLastModification();

        const redoneModifications = newAggregate.redoLastModification();

        expect(redoneModifications[0].type).toBe(TeRichTextModificationType.DELETED);
        expect(newAggregate.richText.getBlocks()).toHaveLength(0);
      });

      it('should handle MOVED modification redo', () => {
        const newAggregate = new TeRichTextAggregate(
          new TeRichText({
            version: 2,
            editorVersion: '2.30.2',
            blocks: [
              { id: 'block-1', type: TeBlockType.PARAGRAPH, data: { text: 'Block 1' } },
              { id: 'block-2', type: TeBlockType.PARAGRAPH, data: { text: 'Block 2' } },
            ],
          })
        );

        const movedRichText = new TeRichText({
          version: 2,
          editorVersion: '2.30.2',
          blocks: [
            { id: 'block-2', type: TeBlockType.PARAGRAPH, data: { text: 'Block 2' } },
            { id: 'block-1', type: TeBlockType.PARAGRAPH, data: { text: 'Block 1' } },
          ],
        });

        newAggregate.updateContent(movedRichText, mockUserId);
        const modifications = newAggregate.modifications.getModifications();
        const moveModification = modifications.find((m) => m.type === TeRichTextModificationType.MOVED);

        if (moveModification) {
          newAggregate.undoModifications(moveModification.id);
          const redoneModifications = newAggregate.redoLastModification();
          expect(redoneModifications[0].type).toBe(TeRichTextModificationType.MOVED);
        }
      });
    });
  });

  describe('groupId undo/redo', () => {
    it('should assign groupId when updateContent produces multiple modifications', () => {
      const initialRichText = new TeRichText({
        version: 2,
        editorVersion: '2.30.2',
        blocks: [
          { id: 'block-1', type: TeBlockType.PARAGRAPH, data: { text: 'Block 1' } },
          { id: 'block-2', type: TeBlockType.PARAGRAPH, data: { text: 'Block 2' } },
        ],
      });
      const aggregate = new TeRichTextAggregate(initialRichText);

      // Update with a new block added and an existing block updated → 2 modifications
      const newRichText = new TeRichText({
        version: 2,
        editorVersion: '2.30.2',
        blocks: [
          { id: 'block-1', type: TeBlockType.PARAGRAPH, data: { text: 'Updated Block 1' } },
          { id: 'block-2', type: TeBlockType.PARAGRAPH, data: { text: 'Block 2' } },
          { id: 'block-3', type: TeBlockType.PARAGRAPH, data: { text: 'New Block' } },
        ],
      });

      aggregate.updateContent(newRichText, mockUserId);

      const modifications = aggregate.modifications.getModifications();
      expect(modifications.length).toBe(2);
      expect(modifications[0].groupId).toBeDefined();
      expect(modifications[0].groupId).toBe(modifications[1].groupId);
    });

    it('should not assign groupId when updateContent produces single modification', () => {
      const initialRichText = new TeRichText({
        version: 2,
        editorVersion: '2.30.2',
        blocks: [{ id: 'block-1', type: TeBlockType.PARAGRAPH, data: { text: 'Original' } }],
      });
      const aggregate = new TeRichTextAggregate(initialRichText);

      const updatedRichText = new TeRichText({
        version: 2,
        editorVersion: '2.30.2',
        blocks: [{ id: 'block-1', type: TeBlockType.PARAGRAPH, data: { text: 'Updated' } }],
      });

      aggregate.updateContent(updatedRichText, mockUserId);

      const modifications = aggregate.modifications.getModifications();
      expect(modifications.length).toBe(1);
      expect(modifications[0].groupId).toBeUndefined();
    });

    it('should undo entire group in one undoLastModification call', () => {
      const initialRichText = new TeRichText({
        version: 2,
        editorVersion: '2.30.2',
        blocks: [
          { id: 'block-1', type: TeBlockType.PARAGRAPH, data: { text: 'Block 1' } },
          { id: 'block-2', type: TeBlockType.PARAGRAPH, data: { text: 'Block 2' } },
        ],
      });
      const aggregate = new TeRichTextAggregate(initialRichText);

      // Delete block-2 and update block-1 → produces a group
      const newRichText = new TeRichText({
        version: 2,
        editorVersion: '2.30.2',
        blocks: [{ id: 'block-1', type: TeBlockType.PARAGRAPH, data: { text: 'Updated Block 1' } }],
      });
      aggregate.updateContent(newRichText, mockUserId);

      const modsBefore = aggregate.modifications.getModifications().length;
      expect(modsBefore).toBeGreaterThan(1);

      // One undo should revert the entire group
      const undone = aggregate.undoLastModification();

      expect(undone.length).toBe(modsBefore);
      expect(aggregate.modifications.getModifications().length).toBe(0);
      expect(aggregate.richText.getBlocks().length).toBe(2);
      expect(aggregate.richText.getBlock('block-1')!.data.text).toBe('Block 1');
      expect(aggregate.richText.getBlock('block-2')!.data.text).toBe('Block 2');
    });

    it('should redo entire group in one redoLastModification call', () => {
      const initialRichText = new TeRichText({
        version: 2,
        editorVersion: '2.30.2',
        blocks: [
          { id: 'block-1', type: TeBlockType.PARAGRAPH, data: { text: 'Block 1' } },
          { id: 'block-2', type: TeBlockType.PARAGRAPH, data: { text: 'Block 2' } },
        ],
      });
      const aggregate = new TeRichTextAggregate(initialRichText);

      const newRichText = new TeRichText({
        version: 2,
        editorVersion: '2.30.2',
        blocks: [{ id: 'block-1', type: TeBlockType.PARAGRAPH, data: { text: 'Updated Block 1' } }],
      });
      aggregate.updateContent(newRichText, mockUserId);

      // Undo the group
      aggregate.undoLastModification();
      expect(aggregate.richText.getBlocks().length).toBe(2);

      // Redo the group
      const redone = aggregate.redoLastModification();

      expect(redone.length).toBeGreaterThan(1);
      expect(aggregate.richText.getBlocks().length).toBe(1);
      expect(aggregate.richText.getBlock('block-1')!.data.text).toBe('Updated Block 1');
    });

    it('should handle undo/redo with mixed grouped and ungrouped modifications', () => {
      const initialRichText = new TeRichText({
        version: 2,
        editorVersion: '2.30.2',
        blocks: [
          { id: 'block-1', type: TeBlockType.PARAGRAPH, data: { text: 'Block 1' } },
          { id: 'block-2', type: TeBlockType.PARAGRAPH, data: { text: 'Block 2' } },
        ],
      });
      const aggregate = new TeRichTextAggregate(initialRichText);

      // First change: single modification (no group)
      const update1 = new TeRichText({
        version: 2,
        editorVersion: '2.30.2',
        blocks: [
          { id: 'block-1', type: TeBlockType.PARAGRAPH, data: { text: 'Updated 1' } },
          { id: 'block-2', type: TeBlockType.PARAGRAPH, data: { text: 'Block 2' } },
        ],
      });
      aggregate.updateContent(update1, mockUserId);
      expect(aggregate.modifications.getModifications().length).toBe(1);

      // Second change: multiple modifications (group)
      const update2 = new TeRichText({
        version: 2,
        editorVersion: '2.30.2',
        blocks: [{ id: 'block-1', type: TeBlockType.PARAGRAPH, data: { text: 'Updated 2' } }],
      });
      aggregate.updateContent(update2, mockUserId);
      const totalMods = aggregate.modifications.getModifications().length;
      expect(totalMods).toBeGreaterThan(2);

      // Undo should revert the group (second change)
      aggregate.undoLastModification();
      expect(aggregate.richText.getBlocks().length).toBe(2);
      expect(aggregate.richText.getBlock('block-1')!.data.text).toBe('Updated 1');

      // Undo should revert the single modification (first change)
      aggregate.undoLastModification();
      expect(aggregate.richText.getBlock('block-1')!.data.text).toBe('Block 1');
    });
  });

  describe('undo/redo with different block types', () => {
    const V = 2;
    const EV = '2.30.2';

    it('should undo/redo header block creation and deletion', () => {
      const aggregate = new TeRichTextAggregate(
        new TeRichText({
          version: V,
          editorVersion: EV,
          blocks: [{ id: 'h1', type: TeBlockType.HEADER, data: { text: 'Title', level: 2 } }],
        })
      );

      // Delete the header
      aggregate.updateContent(new TeRichText({ version: V, editorVersion: EV, blocks: [] }), mockUserId);

      expect(aggregate.richText.getBlocks()).toHaveLength(0);

      // Undo → header should come back
      aggregate.undoLastModification();
      expect(aggregate.richText.getBlocks()).toHaveLength(1);
      expect(aggregate.richText.getBlock('h1')!.data).toEqual({ text: 'Title', level: 2 });

      // Redo → header deleted again
      aggregate.redoLastModification();
      expect(aggregate.richText.getBlocks()).toHaveLength(0);
    });

    it('should undo/redo header text update preserving level', () => {
      const aggregate = new TeRichTextAggregate(
        new TeRichText({
          version: V,
          editorVersion: EV,
          blocks: [{ id: 'h1', type: TeBlockType.HEADER, data: { text: 'Original Title', level: 3 } }],
        })
      );

      aggregate.updateContent(
        new TeRichText({
          version: V,
          editorVersion: EV,
          blocks: [{ id: 'h1', type: TeBlockType.HEADER, data: { text: 'Updated Title', level: 3 } }],
        }),
        mockUserId
      );

      aggregate.undoLastModification();
      expect(aggregate.richText.getBlock('h1')!.data.text).toBe('Original Title');
      expect(aggregate.richText.getBlock('h1')!.data.level).toBe(3);
    });

    it('should undo/redo nested list block changes', () => {
      const initialListData = {
        style: 'unordered',
        meta: {},
        items: [
          { content: 'Item 1', meta: {}, items: [] as any[] },
          { content: 'Item 2', meta: {}, items: [{ content: 'Sub-item 2.1', meta: {}, items: [] as any[] }] },
        ],
      };
      const aggregate = new TeRichTextAggregate(
        new TeRichText({
          version: V,
          editorVersion: EV,
          blocks: [{ id: 'list-1', type: TeBlockType.LIST, data: initialListData }],
        })
      );

      const updatedListData = {
        style: 'unordered',
        items: [
          { content: 'Item 1 modified', meta: {}, items: [] as any[] },
          {
            content: 'Item 2',
            meta: {},
            items: [
              { content: 'Sub-item 2.1', meta: {}, items: [] as any[] },
              { content: 'Sub-item 2.2', meta: {}, items: [] as any[] },
            ],
          },
        ],
      };
      aggregate.updateContent(
        new TeRichText({
          version: V,
          editorVersion: EV,
          blocks: [{ id: 'list-1', type: TeBlockType.LIST, data: updatedListData }],
        }),
        mockUserId
      );

      aggregate.undoLastModification();
      const restoredItems = aggregate.richText.getBlock('list-1')!.data.items;
      expect(restoredItems[0].content).toBe('Item 1');
      expect(restoredItems[1].items).toHaveLength(1);
    });

    it('should undo/redo figure block with complex data', () => {
      const figureData = {
        caption: 'My figure',
        filename: 'img_001.png',
        title: 'Figure 1',
        height: 200,
        width: 400,
        naturalHeight: 1000,
        naturalWidth: 2000,
      };
      const aggregate = new TeRichTextAggregate(
        new TeRichText({
          version: V,
          editorVersion: EV,
          blocks: [
            { id: 'p1', type: TeBlockType.PARAGRAPH, data: { text: 'Before' } },
            { id: 'fig1', type: TeBlockType.FIGURE, data: figureData },
          ],
        })
      );

      // Delete figure
      aggregate.updateContent(
        new TeRichText({
          version: V,
          editorVersion: EV,
          blocks: [{ id: 'p1', type: TeBlockType.PARAGRAPH, data: { text: 'Before' } }],
        }),
        mockUserId
      );

      aggregate.undoLastModification();
      const restored = aggregate.richText.getBlock('fig1')!;
      expect(restored).toBeDefined();
      expect(restored.data.filename).toBe('img_001.png');
      expect(restored.data.naturalWidth).toBe(2000);
    });

    it('should undo/redo mixed block types in a single action', () => {
      const aggregate = new TeRichTextAggregate(
        new TeRichText({
          version: V,
          editorVersion: EV,
          blocks: [
            { id: 'h1', type: TeBlockType.HEADER, data: { text: 'Title', level: 2 } },
            { id: 'p1', type: TeBlockType.PARAGRAPH, data: { text: 'Paragraph' } },
            {
              id: 'list1',
              type: TeBlockType.LIST,
              data: { style: 'ordered', items: [{ content: 'A', meta: {}, items: [] }] },
            },
          ],
        })
      );

      // Replace all with a single paragraph
      aggregate.updateContent(
        new TeRichText({
          version: V,
          editorVersion: EV,
          blocks: [{ id: 'p-new', type: TeBlockType.PARAGRAPH, data: { text: 'Only this' } }],
        }),
        mockUserId
      );

      expect(aggregate.richText.getBlocks()).toHaveLength(1);

      // Undo should restore all 3 blocks
      aggregate.undoLastModification();
      expect(aggregate.richText.getBlocks()).toHaveLength(3);
      expect(aggregate.richText.getBlock('h1')!.type).toBe(TeBlockType.HEADER);
      expect(aggregate.richText.getBlock('list1')!.type).toBe(TeBlockType.LIST);
    });
  });

  describe('undo/redo edge cases', () => {
    const V = 2;
    const EV = '2.30.2';

    // known: &nbsp; normalized to space after undo
    it('should handle text with HTML entities and &nbsp;', () => {
      const aggregate = new TeRichTextAggregate(
        new TeRichText({
          version: V,
          editorVersion: EV,
          blocks: [{ id: 'p1', type: TeBlockType.PARAGRAPH, data: { text: 'Hello&nbsp;World' } }],
        })
      );

      aggregate.updateContent(
        new TeRichText({
          version: V,
          editorVersion: EV,
          blocks: [{ id: 'p1', type: TeBlockType.PARAGRAPH, data: { text: 'Hello&nbsp;Earth' } }],
        }),
        mockUserId
      );

      aggregate.undoLastModification();
      // Note: stringifyBlockData normalizes &nbsp; to space, so after undo via diff the &nbsp; is lost
      expect(aggregate.richText.getBlock('p1')!.data.text).toBe('Hello World');
    });

    it('should handle text with inline HTML formatting', () => {
      const aggregate = new TeRichTextAggregate(
        new TeRichText({
          version: V,
          editorVersion: EV,
          blocks: [{ id: 'p1', type: TeBlockType.PARAGRAPH, data: { text: 'Hello <b>bold</b> text' } }],
        })
      );

      aggregate.updateContent(
        new TeRichText({
          version: V,
          editorVersion: EV,
          blocks: [
            {
              id: 'p1',
              type: TeBlockType.PARAGRAPH,
              data: { text: 'Hello <b>bold</b> and <i>italic</i> text' },
            },
          ],
        }),
        mockUserId
      );

      aggregate.undoLastModification();
      expect(aggregate.richText.getBlock('p1')!.data.text).toBe('Hello <b>bold</b> text');
    });

    it('should handle text with special characters and unicode', () => {
      const aggregate = new TeRichTextAggregate(
        new TeRichText({
          version: V,
          editorVersion: EV,
          blocks: [{ id: 'p1', type: TeBlockType.PARAGRAPH, data: { text: 'Prix: 10€ — résumé «test»' } }],
        })
      );

      aggregate.updateContent(
        new TeRichText({
          version: V,
          editorVersion: EV,
          blocks: [{ id: 'p1', type: TeBlockType.PARAGRAPH, data: { text: 'Prix: 20€ — résumé «modifié»' } }],
        }),
        mockUserId
      );

      aggregate.undoLastModification();
      expect(aggregate.richText.getBlock('p1')!.data.text).toBe('Prix: 10€ — résumé «test»');
    });

    it('should handle undo to empty state then redo', () => {
      const aggregate = new TeRichTextAggregate(
        new TeRichText({ version: V, editorVersion: EV, blocks: [] })
      );

      aggregate.updateContent(
        new TeRichText({
          version: V,
          editorVersion: EV,
          blocks: [{ id: 'p1', type: TeBlockType.PARAGRAPH, data: { text: 'New' } }],
        }),
        mockUserId
      );

      aggregate.undoLastModification();
      expect(aggregate.richText.getBlocks()).toHaveLength(0);

      aggregate.redoLastModification();
      expect(aggregate.richText.getBlocks()).toHaveLength(1);
      expect(aggregate.richText.getBlock('p1')!.data.text).toBe('New');
    });

    it('should clear redo stack when new modification is made after undo', () => {
      const aggregate = new TeRichTextAggregate(
        new TeRichText({
          version: V,
          editorVersion: EV,
          blocks: [{ id: 'p1', type: TeBlockType.PARAGRAPH, data: { text: 'V1' } }],
        })
      );

      aggregate.updateContent(
        new TeRichText({
          version: V,
          editorVersion: EV,
          blocks: [{ id: 'p1', type: TeBlockType.PARAGRAPH, data: { text: 'V2' } }],
        }),
        mockUserId
      );

      aggregate.undoLastModification();
      expect(aggregate.richText.getBlock('p1')!.data.text).toBe('V1');

      // Make a new change instead of redo
      aggregate.updateContent(
        new TeRichText({
          version: V,
          editorVersion: EV,
          blocks: [{ id: 'p1', type: TeBlockType.PARAGRAPH, data: { text: 'V3' } }],
        }),
        mockUserId
      );

      // Redo should do nothing (stack was cleared)
      const redoResult = aggregate.redoLastModification();
      expect(redoResult).toEqual([]);
      expect(aggregate.richText.getBlock('p1')!.data.text).toBe('V3');
    });

    it('should handle multiple sequential undo then redo', () => {
      const aggregate = new TeRichTextAggregate(
        new TeRichText({
          version: V,
          editorVersion: EV,
          blocks: [{ id: 'p1', type: TeBlockType.PARAGRAPH, data: { text: 'V1' } }],
        })
      );

      // 3 sequential changes
      aggregate.updateContent(
        new TeRichText({
          version: V,
          editorVersion: EV,
          blocks: [{ id: 'p1', type: TeBlockType.PARAGRAPH, data: { text: 'V2' } }],
        }),
        mockUserId
      );
      aggregate.updateContent(
        new TeRichText({
          version: V,
          editorVersion: EV,
          blocks: [{ id: 'p1', type: TeBlockType.PARAGRAPH, data: { text: 'V3' } }],
        }),
        mockUserId
      );
      aggregate.updateContent(
        new TeRichText({
          version: V,
          editorVersion: EV,
          blocks: [{ id: 'p1', type: TeBlockType.PARAGRAPH, data: { text: 'V4' } }],
        }),
        mockUserId
      );

      // Undo 3 times
      aggregate.undoLastModification();
      expect(aggregate.richText.getBlock('p1')!.data.text).toBe('V3');
      aggregate.undoLastModification();
      expect(aggregate.richText.getBlock('p1')!.data.text).toBe('V2');
      aggregate.undoLastModification();
      expect(aggregate.richText.getBlock('p1')!.data.text).toBe('V1');

      // Undo beyond start → no effect
      const emptyUndo = aggregate.undoLastModification();
      expect(emptyUndo).toEqual([]);
      expect(aggregate.richText.getBlock('p1')!.data.text).toBe('V1');

      // Redo 3 times
      aggregate.redoLastModification();
      expect(aggregate.richText.getBlock('p1')!.data.text).toBe('V2');
      aggregate.redoLastModification();
      expect(aggregate.richText.getBlock('p1')!.data.text).toBe('V3');
      aggregate.redoLastModification();
      expect(aggregate.richText.getBlock('p1')!.data.text).toBe('V4');

      // Redo beyond end → no effect
      const emptyRedo = aggregate.redoLastModification();
      expect(emptyRedo).toEqual([]);
      expect(aggregate.richText.getBlock('p1')!.data.text).toBe('V4');
    });

    it('should handle undo/redo with block containing empty data', () => {
      const aggregate = new TeRichTextAggregate(
        new TeRichText({
          version: V,
          editorVersion: EV,
          blocks: [{ id: 'p1', type: TeBlockType.PARAGRAPH, data: { text: '' } }],
        })
      );

      aggregate.updateContent(
        new TeRichText({
          version: V,
          editorVersion: EV,
          blocks: [{ id: 'p1', type: TeBlockType.PARAGRAPH, data: { text: 'Not empty anymore' } }],
        }),
        mockUserId
      );

      aggregate.undoLastModification();
      expect(aggregate.richText.getBlock('p1')!.data.text).toBe('');
    });

    it('should handle rapid successive updates on the same block', () => {
      const aggregate = new TeRichTextAggregate(
        new TeRichText({
          version: V,
          editorVersion: EV,
          blocks: [{ id: 'p1', type: TeBlockType.PARAGRAPH, data: { text: '' } }],
        })
      );

      // Simulating typing character by character
      const steps = ['H', 'He', 'Hel', 'Hell', 'Hello'];
      for (const text of steps) {
        aggregate.updateContent(
          new TeRichText({
            version: V,
            editorVersion: EV,
            blocks: [{ id: 'p1', type: TeBlockType.PARAGRAPH, data: { text } }],
          }),
          mockUserId
        );
      }

      // Undo all 5 steps
      for (let i = steps.length - 2; i >= 0; i--) {
        aggregate.undoLastModification();
        expect(aggregate.richText.getBlock('p1')!.data.text).toBe(i >= 0 ? steps[i] : '');
      }
      aggregate.undoLastModification();
      expect(aggregate.richText.getBlock('p1')!.data.text).toBe('');
    });

    it('should handle undo/redo with blocks containing JSON-special characters', () => {
      const aggregate = new TeRichTextAggregate(
        new TeRichText({
          version: V,
          editorVersion: EV,
          blocks: [
            { id: 'p1', type: TeBlockType.PARAGRAPH, data: { text: 'Line with "quotes" and \\backslashes' } },
          ],
        })
      );

      aggregate.updateContent(
        new TeRichText({
          version: V,
          editorVersion: EV,
          blocks: [
            { id: 'p1', type: TeBlockType.PARAGRAPH, data: { text: 'Modified "quotes" and \\\\double' } },
          ],
        }),
        mockUserId
      );

      aggregate.undoLastModification();
      expect(aggregate.richText.getBlock('p1')!.data.text).toBe('Line with "quotes" and \\backslashes');
    });

    it('should handle undo when block order changes with content changes simultaneously', () => {
      const aggregate = new TeRichTextAggregate(
        new TeRichText({
          version: V,
          editorVersion: EV,
          blocks: [
            { id: 'p1', type: TeBlockType.PARAGRAPH, data: { text: 'First' } },
            { id: 'p2', type: TeBlockType.PARAGRAPH, data: { text: 'Second' } },
            { id: 'p3', type: TeBlockType.PARAGRAPH, data: { text: 'Third' } },
          ],
        })
      );

      // Reorder + update content + delete one block
      aggregate.updateContent(
        new TeRichText({
          version: V,
          editorVersion: EV,
          blocks: [
            { id: 'p3', type: TeBlockType.PARAGRAPH, data: { text: 'Third modified' } },
            { id: 'p1', type: TeBlockType.PARAGRAPH, data: { text: 'First' } },
          ],
        }),
        mockUserId
      );

      expect(aggregate.richText.getBlocks()).toHaveLength(2);

      aggregate.undoLastModification();
      expect(aggregate.richText.getBlocks()).toHaveLength(3);
      expect(aggregate.richText.getBlock('p2')).toBeDefined();
      expect(aggregate.richText.getBlock('p3')!.data.text).toBe('Third');
    });

    it('should handle resource view blocks with complex nested data', () => {
      const viewData = {
        id: 'view-1',
        view_config_id: 'config-1',
        resource_id: 'res-1',
        scenario_id: 'sc-1',
        view_method_name: 'plotly_chart',
        view_config: { type: 'scatter', x: [1, 2, 3], y: [4, 5, 6], options: { color: '#ff0000' } },
        title: 'My Chart',
        caption: 'A description',
      };
      const aggregate = new TeRichTextAggregate(
        new TeRichText({
          version: V,
          editorVersion: EV,
          blocks: [
            { id: 'rv1', type: TeBlockType.RESOURCE_VIEW, data: viewData },
            { id: 'p1', type: TeBlockType.PARAGRAPH, data: { text: 'After chart' } },
          ],
        })
      );

      // Delete the view block
      aggregate.updateContent(
        new TeRichText({
          version: V,
          editorVersion: EV,
          blocks: [{ id: 'p1', type: TeBlockType.PARAGRAPH, data: { text: 'After chart' } }],
        }),
        mockUserId
      );

      aggregate.undoLastModification();
      const restored = aggregate.richText.getBlock('rv1')!;
      expect(restored).toBeDefined();
      expect(restored.data.view_config.type).toBe('scatter');
      expect(restored.data.view_config.x).toEqual([1, 2, 3]);
    });

    it('should handle multiple groups undo/redo in correct order', () => {
      const aggregate = new TeRichTextAggregate(
        new TeRichText({
          version: V,
          editorVersion: EV,
          blocks: [
            { id: 'p1', type: TeBlockType.PARAGRAPH, data: { text: 'A' } },
            { id: 'p2', type: TeBlockType.PARAGRAPH, data: { text: 'B' } },
          ],
        })
      );

      // Action 1: group (update p1 + add p3)
      aggregate.updateContent(
        new TeRichText({
          version: V,
          editorVersion: EV,
          blocks: [
            { id: 'p1', type: TeBlockType.PARAGRAPH, data: { text: 'A modified' } },
            { id: 'p2', type: TeBlockType.PARAGRAPH, data: { text: 'B' } },
            { id: 'p3', type: TeBlockType.PARAGRAPH, data: { text: 'C' } },
          ],
        }),
        mockUserId
      );

      // Action 2: single (update p2)
      aggregate.updateContent(
        new TeRichText({
          version: V,
          editorVersion: EV,
          blocks: [
            { id: 'p1', type: TeBlockType.PARAGRAPH, data: { text: 'A modified' } },
            { id: 'p2', type: TeBlockType.PARAGRAPH, data: { text: 'B modified' } },
            { id: 'p3', type: TeBlockType.PARAGRAPH, data: { text: 'C' } },
          ],
        }),
        mockUserId
      );

      // Undo action 2 (single)
      aggregate.undoLastModification();
      expect(aggregate.richText.getBlock('p2')!.data.text).toBe('B');
      expect(aggregate.richText.getBlock('p1')!.data.text).toBe('A modified');

      // Undo action 1 (group)
      aggregate.undoLastModification();
      expect(aggregate.richText.getBlock('p1')!.data.text).toBe('A');
      expect(aggregate.richText.getBlocks()).toHaveLength(2);

      // Redo action 1 (group)
      aggregate.redoLastModification();
      expect(aggregate.richText.getBlock('p1')!.data.text).toBe('A modified');
      expect(aggregate.richText.getBlocks()).toHaveLength(3);

      // Redo action 2 (single)
      aggregate.redoLastModification();
      expect(aggregate.richText.getBlock('p2')!.data.text).toBe('B modified');
    });
  });

  describe('getModificationsDTO', () => {
    it('should return modifications with user information', async () => {
      const modification = new TeRichTextBlockModification(
        'block-1',
        TeBlockType.PARAGRAPH,
        TeRichTextModificationType.CREATED,
        0,
        mockUserId
      );
      const modifications = new TeRichTextModifications([modification]);
      const aggregate = new TeRichTextAggregate(undefined, modifications);

      const result = await aggregate.getModificationsDTO(mockGetUser);

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(TeRichTextBlockModificationWithUser);
      expect(mockGetUser).toHaveBeenCalledWith(mockUserId);
    });
  });

  describe('getModificationsAsString', () => {
    it('should return modifications as JSON string', () => {
      const modification = new TeRichTextBlockModification(
        'block-1',
        TeBlockType.PARAGRAPH,
        TeRichTextModificationType.CREATED,
        0,
        mockUserId
      );
      const modifications = new TeRichTextModifications([modification]);
      const aggregate = new TeRichTextAggregate(undefined, modifications);

      const result = aggregate.getModificationsAsString();

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);

      const parsed = JSON.parse(result);
      expect(parsed).toHaveProperty('version');
      expect(parsed).toHaveProperty('modifications');
    });

    it('should return empty string for null modifications', () => {
      const aggregate = new TeRichTextAggregate();
      (aggregate as any).modifications = null;

      const result = aggregate.getModificationsAsString();

      expect(result).toBe('');
    });
  });

  describe('toJson', () => {
    it('should convert to JSON format', () => {
      const richText = new TeRichText({
        version: 2,
        editorVersion: '2.30.2',
        blocks: [{ id: 'block-1', type: TeBlockType.PARAGRAPH, data: { text: 'Test' } }],
      });
      const modification = new TeRichTextBlockModification(
        'block-1',
        TeBlockType.PARAGRAPH,
        TeRichTextModificationType.CREATED,
        0,
        mockUserId
      );
      const modifications = new TeRichTextModifications([modification]);
      const aggregate = new TeRichTextAggregate(richText, modifications, 1);

      const result = aggregate.toJson();

      expect(result).toEqual({
        version: 1,
        richText: {
          version: 2,
          editorVersion: '2.30.2',
          blocks: [{ id: 'block-1', type: TeBlockType.PARAGRAPH, data: { text: 'Test' } }],
        },
        modifications: {
          version: 2,
          modifications: [
            expect.objectContaining({
              blockId: 'block-1',
              type: TeRichTextModificationType.CREATED,
            }),
          ],
        },
      });
    });

    it('should handle null modifications', () => {
      const aggregate = new TeRichTextAggregate();
      (aggregate as any).modifications = null;

      const result = aggregate.toJson();

      expect(result.modifications).toBeUndefined();
    });
  });
});
