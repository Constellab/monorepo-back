import { TeBlock, TeBlockType } from './lib/te-block.class';
import { TeRichText } from './lib/te-rich-text.class';
import { TeRichTextAggregate } from './lib/te-rich-text-aggregate.class';
import { TeRichTextModificationType } from './lib/te-rich-text-block-modification.class';
import { TeRichTextRevision } from './te-rich-text-revision.class';
import { TeRichTextRevisionHistory } from './te-rich-text-revision-history.class';

const AUTHOR = 'user-1';

function paragraph(id: string, text: string): TeBlock {
  return { id, type: TeBlockType.PARAGRAPH, data: { text } };
}

function richTextOf(...blocks: TeBlock[]): TeRichText {
  return new TeRichText({ ...TeRichText.emptyJson(), blocks });
}

/** A document at its first state, and the revision a caller would have read there. */
function documentOfTwoParagraphs(): { aggregate: TeRichTextAggregate; revision: string } {
  const aggregate = new TeRichTextAggregate(richTextOf(paragraph('p1', 'One'), paragraph('p2', 'Two')));
  return { aggregate, revision: TeRichTextRevision.of(aggregate.richText) };
}

describe('TeRichTextRevisionHistory', () => {
  it('reports nothing changed when the revision is the current one', () => {
    const { aggregate, revision } = documentOfTwoParagraphs();

    expect(TeRichTextRevisionHistory.changesSince(aggregate, revision)).toEqual({
      found: true,
      changes: [],
    });
  });

  it('names the block one later action changed', () => {
    const { aggregate, revision } = documentOfTwoParagraphs();
    aggregate.updateContent(richTextOf(paragraph('p1', 'One'), paragraph('p2', 'Two, edited')), AUTHOR);

    expect(TeRichTextRevisionHistory.changesSince(aggregate, revision)).toEqual({
      found: true,
      changes: [
        { blockId: 'p2', blockType: TeBlockType.PARAGRAPH, change: TeRichTextModificationType.UPDATED },
      ],
    });
  });

  it('names every block changed by several actions, and none from before the revision', () => {
    const aggregate = new TeRichTextAggregate(richTextOf(paragraph('p1', 'One'), paragraph('p2', 'Two')));
    // An action before the revision the caller holds: it must not be reported.
    aggregate.updateContent(richTextOf(paragraph('p1', 'One, edited'), paragraph('p2', 'Two')), AUTHOR);
    const revision = TeRichTextRevision.of(aggregate.richText);

    aggregate.updateContent(
      richTextOf(paragraph('p1', 'One, edited'), paragraph('p2', 'Two, edited')),
      AUTHOR
    );
    aggregate.updateContent(
      richTextOf(paragraph('p1', 'One, edited'), paragraph('p2', 'Two, edited'), paragraph('p3', 'Three')),
      AUTHOR
    );

    const result = TeRichTextRevisionHistory.changesSince(aggregate, revision);

    expect(result.found).toBe(true);
    if (!result.found) return;
    expect(result.changes).toEqual([
      { blockId: 'p2', blockType: TeBlockType.PARAGRAPH, change: TeRichTextModificationType.UPDATED },
      { blockId: 'p3', blockType: TeBlockType.PARAGRAPH, change: TeRichTextModificationType.CREATED },
    ]);
  });

  it('groups the several changes of one batch as the one action they were', () => {
    const { aggregate, revision } = documentOfTwoParagraphs();
    // Two blocks in one write: the walk steps by action, so it must place the revision before the
    // whole batch rather than in the middle of it — a revision mid-batch never existed.
    aggregate.updateContent(
      richTextOf(paragraph('p1', 'One, edited'), paragraph('p2', 'Two, edited')),
      AUTHOR
    );

    const result = TeRichTextRevisionHistory.changesSince(aggregate, revision);

    expect(result.found).toBe(true);
    if (!result.found) return;
    expect(result.changes.map((change) => change.blockId)).toEqual(['p1', 'p2']);
  });

  it('reports one entry per block, carrying the most recent thing that happened to it', () => {
    const { aggregate, revision } = documentOfTwoParagraphs();
    aggregate.updateContent(richTextOf(paragraph('p1', 'One'), paragraph('p2', 'Two, edited')), AUTHOR);
    aggregate.updateContent(richTextOf(paragraph('p1', 'One')), AUTHOR);

    const result = TeRichTextRevisionHistory.changesSince(aggregate, revision);

    expect(result.found).toBe(true);
    if (!result.found) return;
    expect(result.changes).toEqual([
      { blockId: 'p2', blockType: TeBlockType.PARAGRAPH, change: TeRichTextModificationType.DELETED },
    ]);
  });

  /**
   * A reorder has to be placeable too. It is the one change whose history entry carries an
   * `oldIndex`, and the walk can only re-hash a document if that index is the one the block really
   * came from — a mirrored one unwinds the reorder onto the wrong block and never matches.
   */
  it('places a revision from before a reorder, and names a block that moved', () => {
    const { aggregate, revision } = documentOfTwoParagraphs();
    aggregate.updateContent(richTextOf(paragraph('p2', 'Two'), paragraph('p1', 'One')), AUTHOR);

    const result = TeRichTextRevisionHistory.changesSince(aggregate, revision);

    expect(result.found).toBe(true);
    if (!result.found) return;
    expect(result.changes).toHaveLength(1);
    expect(result.changes[0].change).toBe(TeRichTextModificationType.MOVED);
    expect(['p1', 'p2']).toContain(result.changes[0].blockId);
  });

  it('admits it cannot place a revision the history does not reach', () => {
    const { aggregate } = documentOfTwoParagraphs();
    aggregate.updateContent(richTextOf(paragraph('p1', 'One, edited'), paragraph('p2', 'Two')), AUTHOR);

    // A revision this document never had — a caller holding one from another page, or from further
    // back than the recorded history. Saying "nothing changed" here would be a lie acted upon.
    expect(TeRichTextRevisionHistory.changesSince(aggregate, 'deadbeef1234')).toEqual({ found: false });
  });

  it('admits it cannot place a revision when there is no history at all', () => {
    const { aggregate } = documentOfTwoParagraphs();

    expect(TeRichTextRevisionHistory.changesSince(aggregate, 'deadbeef1234')).toEqual({ found: false });
  });

  it('leaves the document it describes untouched', () => {
    const { aggregate, revision } = documentOfTwoParagraphs();
    aggregate.updateContent(richTextOf(paragraph('p1', 'One'), paragraph('p2', 'Two, edited')), AUTHOR);
    const before = TeRichTextRevision.of(aggregate.richText);

    TeRichTextRevisionHistory.changesSince(aggregate, revision);

    // The walk unwinds copies: the undo works in place, and unwinding the live document would
    // silently roll the page back on the way to explaining a refusal.
    expect(TeRichTextRevision.of(aggregate.richText)).toBe(before);
    expect(aggregate.richText.getBlock('p2')?.data).toEqual({ text: 'Two, edited' });
  });
});
