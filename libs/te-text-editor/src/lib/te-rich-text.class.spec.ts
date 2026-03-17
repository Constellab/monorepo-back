import { TeBlock, TeBlockHeaderLevel, TeBlockType } from './te-block.class';
import { TeHTMLEditorJSON, TeRichText, TeRichTextDTO } from './te-rich-text.class';

describe('TeRichText', () => {
  describe('static methods', () => {
    describe('emptyJson', () => {
      it('should return empty JSON with current version and editor version', () => {
        const result = TeRichText.emptyJson();

        expect(result).toEqual({
          blocks: [],
          version: 2,
          editorVersion: '2.30.2',
        });
      });
    });

    describe('fromHTMLEditorJson', () => {
      it('should convert HTML editor JSON to TeRichText', () => {
        const htmlEditorJson: TeHTMLEditorJSON = {
          version: '2.30.2',
          time: Date.now(),
          blocks: [
            {
              id: 'test-1',
              type: TeBlockType.PARAGRAPH,
              data: { text: 'Test paragraph' },
            },
          ],
        };

        const result = TeRichText.fromHTMLEditorJson(htmlEditorJson);

        expect(result.version).toBe(2);
        expect(result.editorVersion).toBe('2.30.2');
        expect(result.getBlocks()).toEqual(htmlEditorJson.blocks);
      });
    });
  });

  describe('constructor', () => {
    it('should create empty TeRichText when no input provided', () => {
      const richText = new TeRichText();

      expect(richText.version).toBe(2);
      expect(richText.editorVersion).toBe('2.30.2');
      expect(richText.getBlocks()).toEqual([]);
    });

    it('should create TeRichText from null input', () => {
      const richText = new TeRichText(null);

      expect(richText.version).toBe(2);
      expect(richText.editorVersion).toBe('2.30.2');
      expect(richText.getBlocks()).toEqual([]);
    });

    it('should create TeRichText from HTML editor JSON (with time property)', () => {
      const htmlEditorJson: TeHTMLEditorJSON = {
        version: '2.30.2',
        time: Date.now(),
        blocks: [
          {
            id: 'test-1',
            type: TeBlockType.PARAGRAPH,
            data: { text: 'Test paragraph' },
          },
        ],
      };

      const richText = new TeRichText(htmlEditorJson);

      expect(richText.version).toBe(2);
      expect(richText.editorVersion).toBe('2.30.2');
      expect(richText.getBlocks()).toEqual(htmlEditorJson.blocks);
    });

    it('should create TeRichText from DTO', () => {
      const dto: TeRichTextDTO = {
        version: 2,
        editorVersion: '2.30.2',
        blocks: [
          {
            id: 'test-1',
            type: TeBlockType.PARAGRAPH,
            data: { text: 'Test paragraph' },
          },
        ],
      };

      const richText = new TeRichText(dto);

      expect(richText.version).toBe(2);
      expect(richText.editorVersion).toBe('2.30.2');
      expect(richText.getBlocks()).toEqual(dto.blocks);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty blocks array', () => {
      const richText = new TeRichText();

      expect(richText.isEmpty()).toBe(true);
    });

    it('should return true for null blocks', () => {
      const dto: TeRichTextDTO = {
        version: 2,
        editorVersion: '2.30.2',
        blocks: null as any,
      };

      const richText = new TeRichText(dto);

      expect(richText.isEmpty()).toBe(true);
    });

    it('should return true for paragraphs with empty text', () => {
      const dto: TeRichTextDTO = {
        version: 2,
        editorVersion: '2.30.2',
        blocks: [
          {
            id: 'test-1',
            type: TeBlockType.PARAGRAPH,
            data: { text: '' },
          },
          {
            id: 'test-2',
            type: TeBlockType.PARAGRAPH,
            data: { text: '   ' },
          },
        ],
      };

      const richText = new TeRichText(dto);

      expect(richText.isEmpty()).toBe(true);
    });

    it('should return true for paragraphs with null data', () => {
      const dto: TeRichTextDTO = {
        version: 2,
        editorVersion: '2.30.2',
        blocks: [
          {
            id: 'test-1',
            type: TeBlockType.PARAGRAPH,
            data: null as any,
          },
        ],
      };

      const richText = new TeRichText(dto);

      expect(richText.isEmpty()).toBe(true);
    });

    it('should return false for paragraphs with content', () => {
      const dto: TeRichTextDTO = {
        version: 2,
        editorVersion: '2.30.2',
        blocks: [
          {
            id: 'test-1',
            type: TeBlockType.PARAGRAPH,
            data: { text: 'Some content' },
          },
        ],
      };

      const richText = new TeRichText(dto);

      expect(richText.isEmpty()).toBe(false);
    });

    it('should return false for non-paragraph blocks', () => {
      const dto: TeRichTextDTO = {
        version: 2,
        editorVersion: '2.30.2',
        blocks: [
          {
            id: 'test-1',
            type: TeBlockType.HEADER,
            data: { text: 'Header', level: 2 },
          },
        ],
      };

      const richText = new TeRichText(dto);

      expect(richText.isEmpty()).toBe(false);
    });
  });

  describe('contentAreEquals', () => {
    const createRichText = (blocks: TeBlock[] = []): TeRichText => {
      const dto: TeRichTextDTO = {
        version: 2,
        editorVersion: '2.30.2',
        blocks,
      };
      return new TeRichText(dto);
    };

    it('should return false for null comparison', () => {
      const richText = createRichText();

      expect(richText.contentAreEquals(null)).toBe(false);
    });

    it('should return true for same instance', () => {
      const richText = createRichText();

      expect(richText.contentAreEquals(richText)).toBe(true);
    });

    it('should return false for different versions', () => {
      const richText1 = createRichText();
      const dto2: TeRichTextDTO = {
        version: 1,
        editorVersion: '2.30.2',
        blocks: [],
      };
      const richText2 = new TeRichText(dto2, 1); // Prevent migration by setting target version

      expect(richText1.contentAreEquals(richText2)).toBe(false);
    });

    it('should return true for both empty contents', () => {
      const richText1 = createRichText();
      const richText2 = createRichText();

      expect(richText1.contentAreEquals(richText2)).toBe(true);
    });

    it('should return false for different block lengths', () => {
      const richText1 = createRichText([
        { id: 'test-1', type: TeBlockType.PARAGRAPH, data: { text: 'Test' } },
      ]);
      const richText2 = createRichText();

      expect(richText1.contentAreEquals(richText2)).toBe(false);
    });

    it('should return true for identical blocks', () => {
      const blocks = [{ id: 'test-1', type: TeBlockType.PARAGRAPH, data: { text: 'Test' } }];
      const richText1 = createRichText(blocks);
      const richText2 = createRichText([...blocks]);

      expect(richText1.contentAreEquals(richText2)).toBe(true);
    });

    it('should return false for different blocks', () => {
      const richText1 = createRichText([
        { id: 'test-1', type: TeBlockType.PARAGRAPH, data: { text: 'Test 1' } },
      ]);
      const richText2 = createRichText([
        { id: 'test-1', type: TeBlockType.PARAGRAPH, data: { text: 'Test 2' } },
      ]);

      expect(richText1.contentAreEquals(richText2)).toBe(false);
    });
  });

  describe('block manipulation methods', () => {
    let richText: TeRichText;

    beforeEach(() => {
      const dto: TeRichTextDTO = {
        version: 2,
        editorVersion: '2.30.2',
        blocks: [
          { id: 'paragraph-1', type: TeBlockType.PARAGRAPH, data: { text: 'Paragraph 1' } },
          { id: 'header-1', type: TeBlockType.HEADER, data: { text: 'Header 1', level: 2 } },
          {
            id: 'figure-1',
            type: TeBlockType.FIGURE,
            data: { filename: 'image.jpg', caption: 'Image caption' },
          },
          { id: 'paragraph-2', type: TeBlockType.PARAGRAPH, data: { text: 'Paragraph 2' } },
        ],
      };
      richText = new TeRichText(dto);
    });

    describe('getBlocks', () => {
      it('should return all blocks', () => {
        const blocks = richText.getBlocks();

        expect(blocks).toHaveLength(4);
        expect(blocks[0].id).toBe('paragraph-1');
        expect(blocks[1].id).toBe('header-1');
        expect(blocks[2].id).toBe('figure-1');
        expect(blocks[3].id).toBe('paragraph-2');
      });
    });

    describe('getBlocksByType', () => {
      it('should return blocks of specific type', () => {
        const paragraphs = richText.getBlocksByType(TeBlockType.PARAGRAPH);

        expect(paragraphs).toHaveLength(2);
        expect(paragraphs[0].id).toBe('paragraph-1');
        expect(paragraphs[1].id).toBe('paragraph-2');
      });

      it('should return empty array for non-existent type', () => {
        const lists = richText.getBlocksByType(TeBlockType.LIST);

        expect(lists).toEqual([]);
      });
    });

    describe('hasBlock', () => {
      it('should return true for existing block', () => {
        expect(richText.hasBlock('paragraph-1')).toBe(true);
      });

      it('should return false for non-existent block', () => {
        expect(richText.hasBlock('non-existent')).toBe(false);
      });
    });

    describe('getBlock', () => {
      it('should return block by ID', () => {
        const block = richText.getBlock('header-1');

        expect(block).toBeDefined();
        expect(block.type).toBe(TeBlockType.HEADER);
        expect(block.data.text).toBe('Header 1');
      });

      it('should return undefined for non-existent block', () => {
        const block = richText.getBlock('non-existent');

        expect(block).toBeUndefined();
      });
    });

    describe('getBlockIndex', () => {
      it('should return correct index for existing block', () => {
        expect(richText.getBlockIndex('paragraph-1')).toBe(0);
        expect(richText.getBlockIndex('header-1')).toBe(1);
        expect(richText.getBlockIndex('figure-1')).toBe(2);
      });

      it('should return -1 for non-existent block', () => {
        expect(richText.getBlockIndex('non-existent')).toBe(-1);
      });
    });
  });

  describe('paragraph methods', () => {
    let richText: TeRichText;

    beforeEach(() => {
      const dto: TeRichTextDTO = {
        version: 2,
        editorVersion: '2.30.2',
        blocks: [
          { id: 'p1', type: TeBlockType.PARAGRAPH, data: { text: 'First paragraph with content' } },
          { id: 'h1', type: TeBlockType.HEADER, data: { text: 'Header', level: 2 } },
          { id: 'p2', type: TeBlockType.PARAGRAPH, data: { text: 'Second paragraph' } },
          { id: 'p3', type: TeBlockType.PARAGRAPH, data: { text: '' } },
        ],
      };
      richText = new TeRichText(dto);
    });

    describe('getParagraphsBlocks', () => {
      it('should return only paragraph blocks', () => {
        const paragraphs = richText.getParagraphsBlocks();

        expect(paragraphs).toHaveLength(3);
        expect(paragraphs.every((block) => block.type === TeBlockType.PARAGRAPH)).toBe(true);
      });
    });

    describe('getFirstParagraphsText', () => {
      it('should return text from first paragraphs', () => {
        const text = richText.getFirstParagraphsText();

        expect(text).toBe('First paragraph with content Second paragraph');
      });

      it('should return null for empty rich text', () => {
        const emptyRichText = new TeRichText();

        expect(emptyRichText.getFirstParagraphsText()).toBeNull();
      });

      it('should return null when no paragraphs exist', () => {
        const dto: TeRichTextDTO = {
          version: 2,
          editorVersion: '2.30.2',
          blocks: [{ id: 'h1', type: TeBlockType.HEADER, data: { text: 'Header', level: 2 } }],
        };
        const richTextWithoutParagraphs = new TeRichText(dto);

        expect(richTextWithoutParagraphs.getFirstParagraphsText()).toBeNull();
      });

      it('should truncate text longer than 200 characters', () => {
        const longText = 'A'.repeat(250);
        const dto: TeRichTextDTO = {
          version: 2,
          editorVersion: '2.30.2',
          blocks: [{ id: 'p1', type: TeBlockType.PARAGRAPH, data: { text: longText } }],
        };
        const richTextWithLongText = new TeRichText(dto);

        const result = richTextWithLongText.getFirstParagraphsText();
        expect(result).toHaveLength(203); // 200 + '...'
        expect(result.endsWith('...')).toBe(true);
      });

      it('should strip HTML tags', () => {
        const dto: TeRichTextDTO = {
          version: 2,
          editorVersion: '2.30.2',
          blocks: [
            { id: 'p1', type: TeBlockType.PARAGRAPH, data: { text: '<b>Bold</b> and <i>italic</i> text' } },
          ],
        };
        const richTextWithHtml = new TeRichText(dto);

        const result = richTextWithHtml.getFirstParagraphsText();
        expect(result).toBe('Bold and italic text');
      });
    });
  });

  describe('header methods', () => {
    let richText: TeRichText;

    beforeEach(() => {
      const dto: TeRichTextDTO = {
        version: 2,
        editorVersion: '2.30.2',
        blocks: [
          {
            id: 'h1',
            type: TeBlockType.HEADER,
            data: { text: 'Header &nbsp;Level&amp; 2&lt;test&gt;', level: 2 },
          },
          { id: 'h2', type: TeBlockType.HEADER, data: { text: 'Header Level 3', level: 3 } },
          { id: 'p1', type: TeBlockType.PARAGRAPH, data: { text: 'Paragraph' } },
          { id: 'h3', type: TeBlockType.HEADER, data: { text: 'Another Header Level 2', level: 2 } },
        ],
      };
      richText = new TeRichText(dto);
    });

    describe('getHeadersData', () => {
      it('should return headers of specified levels', () => {
        const headers = richText.getHeadersData([TeBlockHeaderLevel.HEADER_1]);

        expect(headers).toHaveLength(2);
        expect(headers[0].text).toBe('Header Level& 2<test>');
        expect(headers[0].level).toBe(2);
        expect(headers[1].text).toBe('Another Header Level 2');
        expect(headers[1].level).toBe(2);
      });

      it('should return headers of multiple levels', () => {
        const headers = richText.getHeadersData([TeBlockHeaderLevel.HEADER_1, TeBlockHeaderLevel.HEADER_2]);

        expect(headers).toHaveLength(3);
      });

      it('should return empty array for non-matching levels', () => {
        const headers = richText.getHeadersData([TeBlockHeaderLevel.HEADER_3]);

        expect(headers).toEqual([]);
      });

      it('should clean HTML entities in header text', () => {
        const headers = richText.getHeadersData([TeBlockHeaderLevel.HEADER_1]);

        expect(headers[0].text).toBe('Header Level& 2<test>');
      });
    });
  });

  describe('figure methods', () => {
    let richText: TeRichText;

    beforeEach(() => {
      const dto: TeRichTextDTO = {
        version: 2,
        editorVersion: '2.30.2',
        blocks: [
          { id: 'f1', type: TeBlockType.FIGURE, data: { filename: 'image1.jpg', caption: 'Image 1' } },
          { id: 'p1', type: TeBlockType.PARAGRAPH, data: { text: 'Paragraph' } },
          { id: 'f2', type: TeBlockType.FIGURE, data: { filename: 'image2.png', caption: 'Image 2' } },
        ],
      };
      richText = new TeRichText(dto);
    });

    describe('getFiguresBlocks', () => {
      it('should return only figure blocks', () => {
        const figures = richText.getFiguresBlocks();

        expect(figures).toHaveLength(2);
        expect(figures.every((block) => block.type === TeBlockType.FIGURE)).toBe(true);
      });
    });

    describe('isUsedFigure', () => {
      it('should return true for existing figure filename', () => {
        expect(richText.isUsedFigure('image1.jpg')).toBe(true);
        expect(richText.isUsedFigure('image2.png')).toBe(true);
      });

      it('should return false for non-existing figure filename', () => {
        expect(richText.isUsedFigure('nonexistent.jpg')).toBe(false);
      });
    });

    describe('getFirstFigureLink', () => {
      it('should return filename of first figure', () => {
        expect(richText.getFirstFigureLink()).toBe('image1.jpg');
      });

      it('should return null when no figures exist', () => {
        const dto: TeRichTextDTO = {
          version: 2,
          editorVersion: '2.30.2',
          blocks: [{ id: 'p1', type: TeBlockType.PARAGRAPH, data: { text: 'Paragraph' } }],
        };
        const richTextWithoutFigures = new TeRichText(dto);

        expect(richTextWithoutFigures.getFirstFigureLink()).toBeNull();
      });
    });

    describe('getFiguresBlock', () => {
      it('should return figure block by filename', () => {
        const figure = richText.getFiguresBlock('image1.jpg');

        expect(figure).toBeDefined();
        expect(figure.type).toBe(TeBlockType.FIGURE);
        expect(figure.data.filename).toBe('image1.jpg');
      });

      it('should return null for non-existing filename', () => {
        const figure = richText.getFiguresBlock('nonexistent.jpg');

        expect(figure).toBeNull();
      });
    });
  });

  describe('other block type methods', () => {
    let richText: TeRichText;

    beforeEach(() => {
      const dto: TeRichTextDTO = {
        version: 2,
        editorVersion: '2.30.2',
        blocks: [
          { id: 'rv1', type: TeBlockType.RESOURCE_VIEW, data: { resourceId: 'resource1' } },
          { id: 'fv1', type: TeBlockType.FILE_VIEW, data: { fileId: 'file1' } },
        ],
      };
      richText = new TeRichText(dto);
    });

    describe('getResourceViewsBlocks', () => {
      it('should return resource view blocks', () => {
        const resourceViews = richText.getResourceViewsBlocks();

        expect(resourceViews).toHaveLength(1);
        expect(resourceViews[0].type).toBe(TeBlockType.RESOURCE_VIEW);
      });
    });

    describe('getFileViewsBlocks', () => {
      it('should return file view blocks', () => {
        const fileViews = richText.getFileViewsBlocks();

        expect(fileViews).toHaveLength(1);
        expect(fileViews[0].type).toBe(TeBlockType.FILE_VIEW);
      });
    });
  });

  describe('JSON conversion methods', () => {
    let richText: TeRichText;
    let originalBlocks: TeBlock[];

    beforeEach(() => {
      originalBlocks = [
        { id: 'p1', type: TeBlockType.PARAGRAPH, data: { text: 'Test paragraph' } },
        { id: 'h1', type: TeBlockType.HEADER, data: { text: 'Test header', level: 2 } },
      ];
      const dto: TeRichTextDTO = {
        version: 2,
        editorVersion: '2.30.2',
        blocks: originalBlocks,
      };
      richText = new TeRichText(dto);
    });

    describe('toJson', () => {
      it('should return DTO representation', () => {
        const json = richText.toJson();

        expect(json).toEqual({
          version: 2,
          editorVersion: '2.30.2',
          blocks: originalBlocks,
        });
      });
    });

    describe('toHTMLEditorJson', () => {
      it('should return HTML editor JSON format', () => {
        const json = richText.toHTMLEditorJson();

        expect(json.version).toBe('2.30.2');
        expect(json.blocks).toEqual(originalBlocks);
        expect(typeof json.time).toBe('number');
        expect(json.time).toBeGreaterThan(0);
      });
    });
  });
});
