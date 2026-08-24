import { TeBlock, TeBlockCodeLanguage, TeBlockHintType, TeBlockType } from './lib/te-block.class';
import { TeRichText } from './lib/te-rich-text.class';
import { TeInspectedBlock, TeRichTextBlockInspector } from './te-rich-text-block-inspector.class';

function inspect(...blocks: TeBlock[]): TeInspectedBlock[] {
  return TeRichTextBlockInspector.inspect(new TeRichText({ ...TeRichText.emptyJson(), blocks }));
}

function inspectOne(block: TeBlock): TeInspectedBlock {
  return inspect(block)[0];
}

describe('TeRichTextBlockInspector', () => {
  describe('a block a model may rewrite', () => {
    it('is editable, with no summary', () => {
      const result = inspectOne({
        id: 'p1',
        type: TeBlockType.PARAGRAPH,
        data: { text: 'Hello <b>world</b>, see <a href="https://constellab.io">the docs</a>.' },
      });

      expect(result.editable).toBe(true);
      expect(result.summary).toBeUndefined();
    });

    it('covers headers, lists, tables, code and hints', () => {
      const results = inspect(
        { id: 'h1', type: TeBlockType.HEADER, data: { text: 'A <i>title</i>', level: 2 } },
        {
          id: 'l1',
          type: TeBlockType.LIST,
          data: { style: 'unordered', items: [{ content: 'One', meta: {}, items: [] }] },
        },
        {
          id: 't1',
          type: TeBlockType.TABLE,
          data: { withHeadings: true, stretched: false, content: [['a', 'b']] },
        },
        {
          id: 'c1',
          type: TeBlockType.CODE,
          data: { code: 'if (a < b) { return "<div>"; }', language: TeBlockCodeLanguage.PYTHON },
        },
        {
          id: 'hint1',
          type: TeBlockType.HINT,
          data: { hintType: TeBlockHintType.INFO, content: 'Mind the gap' },
        }
      );

      expect(results.map((result) => result.editable)).toEqual([true, true, true, true, true]);
    });

    it('stays editable when a valid hint carries its two fields in the other order', () => {
      const result = inspectOne({
        id: 'hint1',
        type: TeBlockType.HINT,
        data: { content: 'Mind the gap', hintType: TeBlockHintType.WARNING },
      });

      expect(result.editable).toBe(true);
    });

    it('returns the block exactly as it is stored', () => {
      const block: TeBlock = { id: 'p1', type: TeBlockType.PARAGRAPH, data: { text: 'Hello' } };

      expect(inspectOne(block).block).toBe(block);
    });
  });

  describe('a rich block', () => {
    it('is not editable, and its summary names the file the image is stored under', () => {
      const result = inspectOne({
        id: 'f1',
        type: TeBlockType.FIGURE,
        data: { title: 'Cell counts', caption: '', filename: 'fig-3.png' },
      });

      expect(result.editable).toBe(false);
      expect(result.summary).toContain('Cell counts');
      expect(result.summary).toContain('fig-3.png');
      expect(result.summary).toContain('never rewrite it');
    });

    it('covers the resource view and the file view too', () => {
      const results = inspect(
        {
          id: 'v1',
          type: TeBlockType.RESOURCE_VIEW,
          data: { id: 'v1', title: 'Table view', view_method_name: 'view_as_table' },
        },
        { id: 'fv1', type: TeBlockType.FILE_VIEW, data: { id: 'fv1', title: 'Raw data' } }
      );

      expect(results.map((result) => result.editable)).toEqual([false, false]);
      expect(results[0].summary).toContain('view_as_table');
      expect(results[1].summary).toContain('Raw data');
    });

    it('is returned whole, so it can be moved or deleted', () => {
      const data = { title: 'Cell counts', caption: '', filename: 'fig-3.png' };

      expect(inspectOne({ id: 'f1', type: TeBlockType.FIGURE, data }).block.data).toBe(data);
    });
  });

  describe('a block the server would clean on write', () => {
    it('is not editable when it carries HTML outside the whitelist', () => {
      const result = inspectOne({
        id: 'p1',
        type: TeBlockType.PARAGRAPH,
        data: { text: 'Hello <span class="x">world</span>' },
      });

      expect(result.editable).toBe(false);
      expect(result.summary).toContain('<span>');
    });

    it('is not editable when a link scheme is forbidden', () => {
      const result = inspectOne({
        id: 'p1',
        type: TeBlockType.PARAGRAPH,
        data: { text: '<a href="javascript:alert(1)">click</a>' },
      });

      expect(result.editable).toBe(false);
      expect(result.summary).toContain('javascript:alert(1)');
    });

    it('is not editable when a code block declares an unsupported language', () => {
      const result = inspectOne({
        id: 'c1',
        type: TeBlockType.CODE,
        data: { code: 'SELECT 1', language: 'sql' },
      });

      expect(result.editable).toBe(false);
      expect(result.summary).toContain('sql');
    });

    it('is not editable when a hint carries a field nothing renders', () => {
      const result = inspectOne({
        id: 'hint1',
        type: TeBlockType.HINT,
        data: { hintType: TeBlockHintType.INFO, content: 'Mind the gap', title: 'Careful' },
      });

      expect(result.editable).toBe(false);
      expect(result.summary).toContain('title');
    });

    it('is not editable when a block is malformed in a way no warning describes', () => {
      const result = inspectOne({
        id: 'hint1',
        type: TeBlockType.HINT,
        data: { hintType: TeBlockHintType.INFO, content: null },
      });

      expect(result.editable).toBe(false);
      expect(result.summary).toContain('does not have the shape its type expects');
    });

    it('describes what the block holds, not only what is wrong with it', () => {
      const result = inspectOne({
        id: 'p1',
        type: TeBlockType.PARAGRAPH,
        data: { text: 'The <span>installation</span> steps' },
      });

      expect(result.summary).toContain('The installation steps');
    });
  });

  describe('the document as a whole', () => {
    it('keeps the blocks in document order', () => {
      const results = inspect(
        { id: 'p1', type: TeBlockType.PARAGRAPH, data: { text: 'First' } },
        { id: 'f1', type: TeBlockType.FIGURE, data: { title: 'A figure', filename: 'a.png' } },
        { id: 'p2', type: TeBlockType.PARAGRAPH, data: { text: 'Last' } }
      );

      expect(results.map((result) => result.block.id)).toEqual(['p1', 'f1', 'p2']);
      expect(results.map((result) => result.editable)).toEqual([true, false, true]);
    });

    it('gives an empty list for an empty document', () => {
      expect(inspect()).toEqual([]);
    });
  });
});
