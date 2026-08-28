import { TeBlock, TeBlockType } from './lib/te-block.class';
import { TeRichText } from './lib/te-rich-text.class';
import { TeRichTextRevision } from './te-rich-text-revision.class';

function richTextOf(...blocks: TeBlock[]): TeRichText {
  return new TeRichText({ ...TeRichText.emptyJson(), blocks });
}

function paragraph(text: string, id = 'p1'): TeBlock {
  return { id, type: TeBlockType.PARAGRAPH, data: { text } };
}

describe('TeRichTextRevision', () => {
  describe('two reads of an unchanged document', () => {
    it('give the same revision', () => {
      const blocks = [paragraph('Hello'), paragraph('World', 'p2')];

      expect(TeRichTextRevision.of(richTextOf(...blocks))).toBe(TeRichTextRevision.of(richTextOf(...blocks)));
    });

    it('give the same revision even when the keys come back in another order', () => {
      const written: TeBlock = { id: 'p1', type: TeBlockType.PARAGRAPH, data: { text: 'Hello' } };
      // What a round trip through a client that rebuilt the block can hand back.
      const reordered = { data: { text: 'Hello' }, type: TeBlockType.PARAGRAPH, id: 'p1' } as TeBlock;

      expect(TeRichTextRevision.of(richTextOf(reordered))).toBe(TeRichTextRevision.of(richTextOf(written)));
    });

    it('ignores the format version, which describes the storage and not the content', () => {
      const blocks = [paragraph('Hello')];
      const other = new TeRichText({ version: 2, editorVersion: '9.9.9', blocks });

      expect(TeRichTextRevision.of(other)).toBe(TeRichTextRevision.of(richTextOf(...blocks)));
    });
  });

  describe('a modification', () => {
    it('changes the revision when the text changes', () => {
      expect(TeRichTextRevision.of(richTextOf(paragraph('Hello')))).not.toBe(
        TeRichTextRevision.of(richTextOf(paragraph('Hello!')))
      );
    });

    it('changes the revision when a block is inserted', () => {
      expect(TeRichTextRevision.of(richTextOf(paragraph('Hello')))).not.toBe(
        TeRichTextRevision.of(richTextOf(paragraph('Hello'), paragraph('World', 'p2')))
      );
    });

    it('changes the revision when two blocks are swapped', () => {
      const first = paragraph('Hello');
      const second = paragraph('World', 'p2');

      expect(TeRichTextRevision.of(richTextOf(first, second))).not.toBe(
        TeRichTextRevision.of(richTextOf(second, first))
      );
    });

    it('changes the revision when a block id changes, since the history is matched by id', () => {
      expect(TeRichTextRevision.of(richTextOf(paragraph('Hello', 'p1')))).not.toBe(
        TeRichTextRevision.of(richTextOf(paragraph('Hello', 'p2')))
      );
    });
  });

  describe('the revision itself', () => {
    it('is a short hex string', () => {
      expect(TeRichTextRevision.of(richTextOf(paragraph('Hello')))).toMatch(/^[0-9a-f]{12}$/);
    });

    it('is defined for an empty document', () => {
      expect(TeRichTextRevision.of(richTextOf())).toMatch(/^[0-9a-f]{12}$/);
    });
  });
});
