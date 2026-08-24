import { TeBlockType, TeRichText } from '@monorepo/te-text-editor';
import { Repository } from 'typeorm';

import { HnCurrentUserHelper } from '../../core/utils/hn-current-user.helper';
import { HnUser } from '../../users/hn-user.entity';
import { HnDocumentation } from './hn-documentation.entity';
import { HnDocumentationService } from './hn-documentation.service';

/**
 * Unit test of the write path's wiring: that the content actually stored is the sanitized one,
 * and that the warnings reach the response. The validator's own rules are covered in
 * `libs/te-text-editor/src/te-rich-text-validator.class.spec.ts`.
 */
describe('HnDocumentationService.updateContent', () => {
  const USER_ID = 'user-1';

  let doc: HnDocumentation;
  let saved: HnDocumentation[];
  let service: HnDocumentationService;

  /** A repository standing in for TypeORM: it finds the one doc, and records what is saved. */
  function buildRepository(): Repository<HnDocumentation> {
    return {
      findOneBy: () => Promise.resolve(doc),
      save: (entity: HnDocumentation) => {
        saved.push(entity);
        return Promise.resolve(entity);
      },
    } as unknown as Repository<HnDocumentation>;
  }

  function richTextWith(text: string): TeRichText {
    return new TeRichText({
      ...TeRichText.emptyJson(),
      blocks: [{ id: 'b1', type: TeBlockType.PARAGRAPH, data: { text } }],
    });
  }

  /** The text of the first block of whatever was handed to `save`. */
  function storedText(): string {
    return saved[0].content?.blocks[0].data.text;
  }

  beforeEach(() => {
    doc = new HnDocumentation();
    doc.id = 'doc-1';
    doc.content = null;
    doc.modifications = null;
    saved = [];
    service = new HnDocumentationService(buildRepository());

    const user = new HnUser();
    user.id = USER_ID;
    jest.spyOn(HnCurrentUserHelper, 'getAndCheckCurrentUser').mockReturnValue(user);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('stores the sanitized content, not what it was sent', async () => {
    await service.updateContent('doc-1', richTextWith('<script>alert(1)</script>keep'));

    expect(saved).toHaveLength(1);
    expect(storedText()).toBe('keep');
  });

  it('returns the saved documentation together with the warnings', async () => {
    const result = await service.updateContent('doc-1', richTextWith('<div>x</div>'));

    expect(result.documentation).toBe(saved[0]);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]).toContain('<div>');
  });

  it('returns no warning when the content was already valid', async () => {
    const result = await service.updateContent('doc-1', richTextWith('a <b>valid</b> paragraph'));

    expect(result.warnings).toEqual([]);
    expect(storedText()).toBe('a <b>valid</b> paragraph');
  });

  it('neutralizes a forbidden link scheme on the way to the database', async () => {
    const result = await service.updateContent(
      'doc-1',
      richTextWith('<a href="javascript:alert(1)">click</a>')
    );

    expect(storedText()).toBe('<a>click</a>');
    expect(result.warnings).toHaveLength(1);
  });

  /**
   * The modification history is derived by comparing the stored content with the incoming one,
   * so it has to describe what was stored. A history built from the unsanitized content would
   * claim the page holds markup it does not.
   */
  it('derives the history from the sanitized content', async () => {
    await service.updateContent('doc-1', richTextWith('<div>hello</div>'));

    expect(saved[0].modifications).not.toContain('<div>');
    expect(saved[0].modifications).toContain('hello');
  });
});
