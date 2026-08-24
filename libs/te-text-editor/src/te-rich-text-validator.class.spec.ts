import { TeBlock, TeBlockCodeLanguage, TeBlockHintType, TeBlockType } from './lib/te-block.class';
import { TeRichText } from './lib/te-rich-text.class';
import { TeRichTextValidator } from './te-rich-text-validator.class';

function richTextOf(...blocks: TeBlock[]): TeRichText {
  return new TeRichText({ ...TeRichText.emptyJson(), blocks });
}

function sanitizeBlocks(...blocks: TeBlock[]): { blocks: TeBlock[]; warnings: string[] } {
  const result = TeRichTextValidator.sanitize(richTextOf(...blocks));
  return { blocks: result.richText.getBlocks(), warnings: result.warnings };
}

function paragraph(text: string, id = 'p1'): TeBlock {
  return { id, type: TeBlockType.PARAGRAPH, data: { text } };
}

/** The text of the first paragraph after sanitization. */
function sanitizedText(text: string): string {
  return sanitizeBlocks(paragraph(text)).blocks[0].data.text;
}

describe('TeRichTextValidator', () => {
  describe('a document that already follows the rules', () => {
    it('comes back unchanged, with no warning', () => {
      const blocks: TeBlock[] = [
        paragraph('Hello <b>world</b>, see <a href="https://constellab.io">the docs</a>.'),
        { id: 'h1', type: TeBlockType.HEADER, data: { text: 'A <i>title</i>', level: 2 } },
        {
          id: 'c1',
          type: TeBlockType.CODE,
          data: { code: 'if (a < b) { return "<div>"; }', language: TeBlockCodeLanguage.TYPESCRIPT },
        },
        {
          id: 'hint1',
          type: TeBlockType.HINT,
          data: { hintType: TeBlockHintType.WARNING, content: 'Mind the gap' },
        },
      ];

      const result = sanitizeBlocks(...blocks);

      expect(result.warnings).toEqual([]);
      expect(result.blocks).toEqual(blocks);
    });

    it('keeps a &nbsp; as an entity rather than a raw character', () => {
      expect(sanitizedText('a&nbsp;b')).toBe('a&nbsp;b');
    });

    it('keeps an escaped angle bracket escaped', () => {
      expect(sanitizedText('a &amp; b &lt;not a tag&gt;')).toBe('a &amp; b &lt;not a tag&gt;');
    });

    it('keeps a relative link, which has no scheme to forbid', () => {
      const result = sanitizeBlocks(paragraph('<a href="/en/doc/brick">here</a>'));

      expect(result.warnings).toEqual([]);
      expect(result.blocks[0].data.text).toBe('<a href="/en/doc/brick">here</a>');
    });
  });

  describe('never mutates its input', () => {
    it('leaves the rich text it was handed untouched', () => {
      const richText = richTextOf(paragraph('<script>alert(1)</script>keep'));

      TeRichTextValidator.sanitize(richText);

      expect(richText.getBlocks()[0].data.text).toBe('<script>alert(1)</script>keep');
    });
  });

  describe('inline tags', () => {
    it('removes a tag outside the whitelist and keeps its text', () => {
      const result = sanitizeBlocks(paragraph('<div>keep</div><script>alert(1)</script>'));

      expect(result.blocks[0].data.text).toBe('keep');
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('<div>');
      expect(result.warnings[0]).toContain('<script>');
      expect(result.warnings[0]).toContain('Block p1 (paragraph)');
    });

    it('drops an event handler with the tag that carried it', () => {
      const result = sanitizeBlocks(paragraph('<img src=x onerror=alert(1)>'));

      expect(result.blocks[0].data.text).toBe('');
      expect(result.warnings[0]).toContain('<img>');
    });

    it('normalizes strong to b and em to i without warning', () => {
      const result = sanitizeBlocks(paragraph('<strong>bold</strong> and <em>italic</em>'));

      expect(result.blocks[0].data.text).toBe('<b>bold</b> and <i>italic</i>');
      expect(result.warnings).toEqual([]);
    });

    it('keeps every allowed tag', () => {
      expect(sanitizedText('<b>b</b><i>i</i><u>u</u><code>c</code>')).toBe(
        '<b>b</b><i>i</i><u>u</u><code>c</code>'
      );
    });

    it('names a block by its position when it has no id', () => {
      const result = sanitizeBlocks({
        type: TeBlockType.PARAGRAPH,
        data: { text: '<div>x</div>' },
      });

      expect(result.warnings[0]).toContain('Block #1 (paragraph)');
    });
  });

  describe('link schemes', () => {
    it('neutralizes a javascript: href and keeps the link text', () => {
      const result = sanitizeBlocks(paragraph('<a href="javascript:alert(1)">click me</a>'));

      expect(result.blocks[0].data.text).toBe('<a>click me</a>');
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('javascript:alert(1)');
    });

    it('is not fooled by casing or leading whitespace', () => {
      const result = sanitizeBlocks(paragraph('<a href="  JavaScript:alert(1)">x</a>'));

      expect(result.blocks[0].data.text).toBe('<a>x</a>');
      expect(result.warnings).toHaveLength(1);
    });

    it('is not fooled by an entity-encoded scheme', () => {
      const result = sanitizeBlocks(paragraph('<a href="&#106;avascript:alert(1)">x</a>'));

      expect(result.blocks[0].data.text).toBe('<a>x</a>');
      expect(result.warnings).toHaveLength(1);
    });

    it('forbids data: as much as javascript:', () => {
      const result = sanitizeBlocks(paragraph('<a href="data:text/html;base64,PHNjcmlwdD4=">x</a>'));

      expect(result.blocks[0].data.text).toBe('<a>x</a>');
      expect(result.warnings).toHaveLength(1);
    });

    it('allows http, https and mailto', () => {
      const result = sanitizeBlocks(
        paragraph('<a href="http://a.io">a</a><a href="https://b.io">b</a><a href="mailto:c@d.io">c</a>')
      );

      expect(result.warnings).toEqual([]);
      expect(result.blocks[0].data.text).toContain('mailto:c@d.io');
    });
  });

  describe('nested text', () => {
    it('sanitizes a list item and its sublist', () => {
      const result = sanitizeBlocks({
        id: 'l1',
        type: TeBlockType.LIST,
        data: {
          style: 'unordered',
          meta: {},
          items: [
            {
              content: '<span>top</span>',
              meta: {},
              items: [{ content: '<script>x</script>nested', meta: {}, items: [] }],
            },
          ],
        },
      });

      expect(result.blocks[0].data.items[0].content).toBe('top');
      expect(result.blocks[0].data.items[0].items[0].content).toBe('nested');
      expect(result.warnings).toHaveLength(2);
    });

    it('sanitizes every table cell', () => {
      const result = sanitizeBlocks({
        id: 't1',
        type: TeBlockType.TABLE,
        data: {
          withHeadings: true,
          stretched: false,
          content: [
            ['<b>head</b>', '<script>x</script>'],
            ['<a href="javascript:1">cell</a>', 'plain'],
          ],
        },
      });

      expect(result.blocks[0].data.content).toEqual([
        ['<b>head</b>', ''],
        ['<a>cell</a>', 'plain'],
      ]);
      expect(result.warnings).toHaveLength(2);
    });
  });

  describe('code blocks', () => {
    it('leaves the code alone, angle brackets included', () => {
      const code = '<script>alert("still here")</script>';
      const result = sanitizeBlocks({
        id: 'c1',
        type: TeBlockType.CODE,
        data: { code, language: TeBlockCodeLanguage.JAVASCRIPT },
      });

      expect(result.blocks[0].data.code).toBe(code);
      expect(result.warnings).toEqual([]);
    });

    it('replaces an unsupported language by plaintext and says so', () => {
      const result = sanitizeBlocks({
        id: 'c1',
        type: TeBlockType.CODE,
        data: { code: 'fn main() {}', language: 'rust' },
      });

      expect(result.blocks[0].data.language).toBe(TeBlockCodeLanguage.PLAINTEXT);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('"rust"');
      expect(result.warnings[0]).toContain('python');
    });

    it('defaults a missing language to plaintext without warning, since nothing was lost', () => {
      const result = sanitizeBlocks({
        id: 'c1',
        type: TeBlockType.CODE,
        data: { code: 'x' },
      });

      expect(result.blocks[0].data.language).toBe(TeBlockCodeLanguage.PLAINTEXT);
      expect(result.warnings).toEqual([]);
    });

    it('accepts each of the seven supported languages', () => {
      for (const language of Object.values(TeBlockCodeLanguage)) {
        const result = sanitizeBlocks({
          id: 'c1',
          type: TeBlockType.CODE,
          data: { code: 'x', language },
        });

        expect(result.blocks[0].data.language).toBe(language);
        expect(result.warnings).toEqual([]);
      }
    });
  });

  describe('hint blocks', () => {
    it('keeps a well-formed hint as it is', () => {
      const data = { hintType: TeBlockHintType.SCIENCE, content: 'A fact' };
      const result = sanitizeBlocks({ id: 'h1', type: TeBlockType.HINT, data });

      expect(result.blocks[0].data).toEqual(data);
      expect(result.warnings).toEqual([]);
    });

    it('removes the fields a hint does not render, naming them and the supported ones', () => {
      const result = sanitizeBlocks({
        id: 'h1',
        type: TeBlockType.HINT,
        data: { hintType: TeBlockHintType.INFO, title: 'A title', text: 'Some text' },
      });

      expect(result.blocks[0].data).toEqual({
        hintType: TeBlockHintType.INFO,
        content: '',
      });
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('title');
      expect(result.warnings[0]).toContain('text');
      expect(result.warnings[0]).toContain('content');
    });

    it('replaces an unsupported hint type by info and says so', () => {
      const result = sanitizeBlocks({
        id: 'h1',
        type: TeBlockType.HINT,
        data: { hintType: 'danger', content: 'Careful' },
      });

      expect(result.blocks[0].data.hintType).toBe(TeBlockHintType.INFO);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('"danger"');
      expect(result.warnings[0]).toContain('science');
    });

    it('defaults a missing hint type to info without warning', () => {
      const result = sanitizeBlocks({
        id: 'h1',
        type: TeBlockType.HINT,
        data: { content: 'Plain' },
      });

      expect(result.blocks[0].data).toEqual({ hintType: TeBlockHintType.INFO, content: 'Plain' });
      expect(result.warnings).toEqual([]);
    });

    it('strips the HTML from the content, which is plain text', () => {
      const result = sanitizeBlocks({
        id: 'h1',
        type: TeBlockType.HINT,
        data: { hintType: TeBlockHintType.INFO, content: 'a <b>bold</b> hint' },
      });

      expect(result.blocks[0].data.content).toBe('a bold hint');
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('plain text');
    });
  });

  describe('blocks it does not touch', () => {
    it('leaves a figure alone', () => {
      const data = {
        caption: 'A caption with a < sign',
        filename: 'a.png',
        title: 'A title',
        height: 1,
        width: 2,
        naturalHeight: 3,
        naturalWidth: 4,
      };
      const result = sanitizeBlocks({ id: 'f1', type: TeBlockType.FIGURE, data });

      expect(result.blocks[0].data).toEqual(data);
      expect(result.warnings).toEqual([]);
    });

    it('survives a block with no data', () => {
      const result = sanitizeBlocks({ id: 'x', type: TeBlockType.PARAGRAPH, data: null });

      expect(result.warnings).toEqual([]);
      expect(result.blocks[0].data).toBeNull();
    });
  });

  describe('the whole document', () => {
    it('lists one warning per removal, across blocks', () => {
      const result = sanitizeBlocks(
        paragraph('<div>one</div>', 'a'),
        paragraph('<a href="javascript:1">two</a>', 'b'),
        { id: 'c', type: TeBlockType.CODE, data: { code: 'x', language: 'cobol' } }
      );

      expect(result.warnings).toHaveLength(3);
      expect(result.warnings[0]).toContain('Block a');
      expect(result.warnings[1]).toContain('Block b');
      expect(result.warnings[2]).toContain('Block c');
    });

    it('keeps the version and editor version of the document it cleaned', () => {
      const richText = richTextOf(paragraph('<div>x</div>'));

      const result = TeRichTextValidator.sanitize(richText);

      expect(result.richText.version).toBe(richText.version);
      expect(result.richText.editorVersion).toBe(richText.editorVersion);
    });

    it('handles an empty document', () => {
      const result = TeRichTextValidator.sanitize(new TeRichText(TeRichText.emptyJson()));

      expect(result.warnings).toEqual([]);
      expect(result.richText.getBlocks()).toEqual([]);
    });
  });
});
