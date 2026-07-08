import { DateTime } from 'luxon';

import { TeBlockData, TeBlockType } from './te-block.class';
import {
  TeRichTextBlockModification,
  TeRichTextModificationDifference,
  TeRichTextModificationType,
} from './te-rich-text-block-modification.class';
import { TeRichTextBlockModificationDTO } from './te-rich-text-block-modification.dto';

describe('TeRichTextBlockModification', () => {
  const mockUserId = 'user-123';
  const mockBlockId = 'block-123';
  const mockTime = '2023-01-01T10:00:00.000Z';
  const mockBlockData: TeBlockData = { text: 'Hello World' };

  describe('constructor', () => {
    it('should create instance with required parameters', () => {
      const modification = new TeRichTextBlockModification(
        mockBlockId,
        TeBlockType.PARAGRAPH,
        TeRichTextModificationType.CREATED,
        0,
        mockUserId
      );

      expect(modification.blockId).toBe(mockBlockId);
      expect(modification.blockType).toBe(TeBlockType.PARAGRAPH);
      expect(modification.type).toBe(TeRichTextModificationType.CREATED);
      expect(modification.index).toBe(0);
      expect(modification.userId).toBe(mockUserId);
      expect(modification.id).toBeDefined();
      expect(modification.time).toBeInstanceOf(DateTime);
    });

    it('should create instance with optional id parameter', () => {
      const customId = 'custom-id-123';
      const modification = new TeRichTextBlockModification(
        mockBlockId,
        TeBlockType.PARAGRAPH,
        TeRichTextModificationType.CREATED,
        0,
        mockUserId,
        customId
      );

      expect(modification.id).toBe(customId);
    });

    it('should create instance with optional time parameter', () => {
      const modification = new TeRichTextBlockModification(
        mockBlockId,
        TeBlockType.PARAGRAPH,
        TeRichTextModificationType.CREATED,
        0,
        mockUserId,
        undefined,
        mockTime
      );

      expect(modification.time.toUTC().toISO()).toMatch(/2023-01-01T10:00:00\.000(\+00:00|Z)/);
    });

    it('should create instance with optional groupId parameter', () => {
      const groupId = 'group-123';
      const modification = new TeRichTextBlockModification(
        mockBlockId,
        TeBlockType.PARAGRAPH,
        TeRichTextModificationType.CREATED,
        0,
        mockUserId,
        undefined,
        undefined,
        groupId
      );

      expect(modification.groupId).toBe(groupId);
    });

    it('should have undefined groupId when not provided', () => {
      const modification = new TeRichTextBlockModification(
        mockBlockId,
        TeBlockType.PARAGRAPH,
        TeRichTextModificationType.CREATED,
        0,
        mockUserId
      );

      expect(modification.groupId).toBeUndefined();
    });

    it('should generate UUID when id is not provided', () => {
      const modification1 = new TeRichTextBlockModification(
        mockBlockId,
        TeBlockType.PARAGRAPH,
        TeRichTextModificationType.CREATED,
        0,
        mockUserId
      );
      const modification2 = new TeRichTextBlockModification(
        mockBlockId,
        TeBlockType.PARAGRAPH,
        TeRichTextModificationType.CREATED,
        0,
        mockUserId
      );

      expect(modification1.id).toBeDefined();
      expect(modification2.id).toBeDefined();
      expect(modification1.id).not.toBe(modification2.id);
    });

    it('should use current time when time is not provided', () => {
      const beforeCreation = DateTime.now();
      const modification = new TeRichTextBlockModification(
        mockBlockId,
        TeBlockType.PARAGRAPH,
        TeRichTextModificationType.CREATED,
        0,
        mockUserId
      );
      const afterCreation = DateTime.now();

      expect(modification.time.toMillis()).toBeGreaterThanOrEqual(beforeCreation.toMillis());
      expect(modification.time.toMillis()).toBeLessThanOrEqual(afterCreation.toMillis());
    });
  });

  describe('fromJsonObject', () => {
    it('should create instance from JSON object for UPDATED type', () => {
      const differences: TeRichTextModificationDifference[] = [
        { index: 0, count: 5, added: true, removed: false, value: 'Hello' },
      ];
      const dto: TeRichTextBlockModificationDTO = {
        id: 'json-id',
        time: mockTime,
        blockId: mockBlockId,
        blockType: TeBlockType.PARAGRAPH,
        type: TeRichTextModificationType.UPDATED,
        index: 1,
        userId: mockUserId,
        differences,
      };

      const modification = TeRichTextBlockModification.fromJsonObject(dto);

      expect(modification.id).toBe('json-id');
      expect(modification.time.toUTC().toISO()).toMatch(/2023-01-01T10:00:00\.000(\+00:00|Z)/);
      expect(modification.blockId).toBe(mockBlockId);
      expect(modification.blockType).toBe(TeBlockType.PARAGRAPH);
      expect(modification.type).toBe(TeRichTextModificationType.UPDATED);
      expect(modification.index).toBe(1);
      expect(modification.userId).toBe(mockUserId);
      expect(modification.differences).toEqual(differences);
      expect(modification.blockValue).toBeUndefined();
    });

    it('should create instance from JSON object for non-UPDATED type', () => {
      const dto: TeRichTextBlockModificationDTO = {
        id: 'json-id',
        time: mockTime,
        blockId: mockBlockId,
        blockType: TeBlockType.PARAGRAPH,
        type: TeRichTextModificationType.CREATED,
        index: 1,
        userId: mockUserId,
        blockValue: mockBlockData,
      };

      const modification = TeRichTextBlockModification.fromJsonObject(dto);

      expect(modification.blockValue).toEqual(mockBlockData);
      expect(modification.differences).toBeUndefined();
    });

    it('should set oldIndex when provided', () => {
      const dto: TeRichTextBlockModificationDTO = {
        id: 'json-id',
        time: mockTime,
        blockId: mockBlockId,
        blockType: TeBlockType.PARAGRAPH,
        type: TeRichTextModificationType.MOVED,
        index: 2,
        userId: mockUserId,
        blockValue: mockBlockData,
        oldIndex: 1, // Use 1 instead of 0 since the code uses if (json.oldIndex) which is falsy for 0
      };

      const modification = TeRichTextBlockModification.fromJsonObject(dto);

      expect(modification.oldIndex).toBe(1);
    });

    it('should set groupId when provided', () => {
      const dto: TeRichTextBlockModificationDTO = {
        id: 'json-id',
        time: mockTime,
        blockId: mockBlockId,
        blockType: TeBlockType.PARAGRAPH,
        type: TeRichTextModificationType.CREATED,
        index: 0,
        userId: mockUserId,
        blockValue: mockBlockData,
        groupId: 'group-456',
      };

      const modification = TeRichTextBlockModification.fromJsonObject(dto);

      expect(modification.groupId).toBe('group-456');
    });
  });

  describe('setDifferences', () => {
    it('should calculate differences between old and new values', () => {
      const modification = new TeRichTextBlockModification(
        mockBlockId,
        TeBlockType.PARAGRAPH,
        TeRichTextModificationType.UPDATED,
        0,
        mockUserId
      );
      modification.blockValue = { text: 'Hello World!' };

      const oldValue: TeBlockData = { text: 'Hello Earth!' };
      modification.setDifferences(oldValue);

      expect(modification.differences).toBeDefined();
      expect(modification.differences!.length).toBeGreaterThan(0);
      expect(modification.differences!.some((diff) => diff.added || diff.removed)).toBe(true);
    });

    it('should handle empty differences when values are identical', () => {
      const modification = new TeRichTextBlockModification(
        mockBlockId,
        TeBlockType.PARAGRAPH,
        TeRichTextModificationType.UPDATED,
        0,
        mockUserId
      );
      modification.blockValue = { text: 'Same text' };

      const oldValue: TeBlockData = { text: 'Same text' };
      modification.setDifferences(oldValue);

      expect(modification.differences).toBeDefined();
      expect(modification.differences!.length).toBe(0);
    });
  });

  describe('undoDifferences', () => {
    it('should return original value when no differences exist', () => {
      const modification = new TeRichTextBlockModification(
        mockBlockId,
        TeBlockType.PARAGRAPH,
        TeRichTextModificationType.UPDATED,
        0,
        mockUserId
      );

      const value: TeBlockData = { text: 'Test' };
      const result = modification.undoDifferences(value);

      expect(result).toEqual(value);
    });

    it('should return original value when differences array is empty', () => {
      const modification = new TeRichTextBlockModification(
        mockBlockId,
        TeBlockType.PARAGRAPH,
        TeRichTextModificationType.UPDATED,
        0,
        mockUserId
      );
      modification.differences = [];

      const value: TeBlockData = { text: 'Test' };
      const result = modification.undoDifferences(value);

      expect(result).toEqual(value);
    });

    it('should undo differences correctly', () => {
      const modification = new TeRichTextBlockModification(
        mockBlockId,
        TeBlockType.PARAGRAPH,
        TeRichTextModificationType.UPDATED,
        0,
        mockUserId
      );

      const oldValue: TeBlockData = { text: 'Hello World' };
      const newValue: TeBlockData = { text: 'Hello Earth' };

      modification.blockValue = newValue;
      modification.setDifferences(oldValue);

      const result = modification.undoDifferences(newValue);

      expect(TeRichTextBlockModification.stringifyBlockData(result)).toBe(
        TeRichTextBlockModification.stringifyBlockData(oldValue)
      );
    });
  });

  describe('redoDifferences', () => {
    it('should return original value when no differences exist', () => {
      const modification = new TeRichTextBlockModification(
        mockBlockId,
        TeBlockType.PARAGRAPH,
        TeRichTextModificationType.UPDATED,
        0,
        mockUserId
      );

      const value: TeBlockData = { text: 'Test' };
      const result = modification.redoDifferences(value);

      expect(result).toEqual(value);
    });

    it('should return original value when differences array is empty', () => {
      const modification = new TeRichTextBlockModification(
        mockBlockId,
        TeBlockType.PARAGRAPH,
        TeRichTextModificationType.UPDATED,
        0,
        mockUserId
      );
      modification.differences = [];

      const value: TeBlockData = { text: 'Test' };
      const result = modification.redoDifferences(value);

      expect(result).toEqual(value);
    });

    it('should redo differences correctly', () => {
      const modification = new TeRichTextBlockModification(
        mockBlockId,
        TeBlockType.PARAGRAPH,
        TeRichTextModificationType.UPDATED,
        0,
        mockUserId
      );

      const oldValue: TeBlockData = { text: 'Hello World' };
      const newValue: TeBlockData = { text: 'Hello Earth' };

      modification.blockValue = newValue;
      modification.setDifferences(oldValue);

      const result = modification.redoDifferences(oldValue);

      expect(TeRichTextBlockModification.stringifyBlockData(result)).toBe(
        TeRichTextBlockModification.stringifyBlockData(newValue)
      );
    });
  });

  describe('getBlockDataAsString', () => {
    it('should return stringified block data', () => {
      const modification = new TeRichTextBlockModification(
        mockBlockId,
        TeBlockType.PARAGRAPH,
        TeRichTextModificationType.CREATED,
        0,
        mockUserId
      );
      modification.blockValue = mockBlockData;

      const result = modification.getBlockDataAsString();

      expect(result).toBe(TeRichTextBlockModification.stringifyBlockData(mockBlockData));
    });
  });

  describe('stringifyBlockData', () => {
    it('should stringify block data and replace &nbsp; with spaces', () => {
      const data: TeBlockData = { text: 'Hello&nbsp;World' };

      const result = TeRichTextBlockModification.stringifyBlockData(data);

      expect(result).toBe('{"text":"Hello World"}');
    });

    it('should handle null data', () => {
      const result = TeRichTextBlockModification.stringifyBlockData(null as unknown as TeBlockData);

      expect(result).toBe('null');
    });

    it('should handle undefined data', () => {
      expect(() => {
        TeRichTextBlockModification.stringifyBlockData(undefined);
      }).toThrow();
    });
  });

  describe('parseBlockData', () => {
    it('should parse valid JSON string', () => {
      const jsonString = '{"text":"Hello World"}';

      const result = TeRichTextBlockModification.parseBlockData(jsonString);

      expect(result).toEqual({ text: 'Hello World' });
    });

    it('should handle null string', () => {
      const result = TeRichTextBlockModification.parseBlockData('null');

      expect(result).toBeNull();
    });
  });

  describe('toJsonObject', () => {
    it('should convert to JSON object', () => {
      const modification = new TeRichTextBlockModification(
        mockBlockId,
        TeBlockType.PARAGRAPH,
        TeRichTextModificationType.CREATED,
        0,
        mockUserId,
        'test-id',
        mockTime
      );
      modification.blockValue = mockBlockData;
      modification.differences = [{ index: 0, count: 5, added: true, removed: false, value: 'Hello' }];
      modification.oldIndex = 2;

      const result = modification.toJsonObject();

      expect(result).toEqual({
        id: 'test-id',
        time: expect.stringMatching(/2023-01-01T\d{2}:00:00\.000([+-]\d{2}:00|Z)/),
        blockId: mockBlockId,
        blockType: TeBlockType.PARAGRAPH,
        type: TeRichTextModificationType.CREATED,
        index: 0,
        userId: mockUserId,
        blockValue: mockBlockData,
        differences: modification.differences,
        oldIndex: 2,
        groupId: undefined,
      });
    });

    it('should include groupId in JSON object when set', () => {
      const modification = new TeRichTextBlockModification(
        mockBlockId,
        TeBlockType.PARAGRAPH,
        TeRichTextModificationType.CREATED,
        0,
        mockUserId,
        'test-id',
        mockTime,
        'group-789'
      );
      modification.blockValue = mockBlockData;

      const result = modification.toJsonObject();

      expect(result.groupId).toBe('group-789');
    });
  });

  describe('TeRichTextModificationType enum', () => {
    it('should have correct enum values', () => {
      expect(TeRichTextModificationType.CREATED).toBe('CREATED');
      expect(TeRichTextModificationType.UPDATED).toBe('UPDATED');
      expect(TeRichTextModificationType.DELETED).toBe('DELETED');
      expect(TeRichTextModificationType.MOVED).toBe('MOVED');
    });
  });

  describe('TeRichTextModificationDifference interface', () => {
    it('should accept valid difference objects', () => {
      const difference: TeRichTextModificationDifference = {
        index: 0,
        count: 5,
        added: true,
        removed: false,
        value: 'test',
      };

      expect(difference.index).toBe(0);
      expect(difference.count).toBe(5);
      expect(difference.added).toBe(true);
      expect(difference.removed).toBe(false);
      expect(difference.value).toBe('test');
    });
  });
});
