import { BlRequestContext, BlUnauthorizedException } from '@monorepo/back-core-lib';
import {
  TeBlock,
  TeBlockType,
  TeRichText,
  TeRichTextModificationType,
  TeRichTextRevision,
} from '@monorepo/te-text-editor';
import { Request, Response } from 'express';
import { Repository } from 'typeorm';

import { HnBrickEntity } from '../brick-aggregate/brick/hn-brick.entity';
import { HnBrickMajorVersion } from '../brick-aggregate/brick-major-version/hn-brick-major-version.entity';
import { HnDocumentation } from '../brick-aggregate/documentation/hn-documentation.entity';
import { HnDocumentationService } from '../brick-aggregate/documentation/hn-documentation.service';
import { HnBrickSecurity } from '../brick-aggregate/security/hn-brick.security';
import { HnCurrentUserHelper } from '../core/utils/hn-current-user.helper';
import { HnUser } from '../users/hn-user.entity';
import { HnUserService } from '../users/hn-user.service';
import { HnMcpDocAuthorization } from './hn-mcp-doc-authorization.service';
import { HnMcpDocHistoryService } from './hn-mcp-doc-history.service';

/**
 * Unit test of the safety net: what a page's history reads as, and what a rollback does to the page
 * and to the history itself. The undo arithmetic belongs to `TeRichTextAggregate` and is tested
 * there; the real {@link HnDocumentationService} is used here rather than a fake, because the point
 * of the rollback going through it is precisely that the history keeps growing.
 */
describe('HnMcpDocHistoryService', () => {
  const USER_ID = 'user-1';
  const OTHER_USER_ID = 'user-2';
  const DOC_ID = 'doc-1';

  let doc: HnDocumentation;
  let authorized: boolean;
  let knownUsers: Map<string, HnUser>;
  let service: HnMcpDocHistoryService;

  function paragraph(id: string, text: string): TeBlock {
    return { id, type: TeBlockType.PARAGRAPH, data: { text } };
  }

  function richText(...blocks: TeBlock[]): TeRichText {
    return new TeRichText({ ...TeRichText.emptyJson(), blocks });
  }

  function buildDoc(): HnDocumentation {
    const brick = new HnBrickEntity();
    brick.name = 'gws_core';
    const brickMajorVersion = new HnBrickMajorVersion();
    brickMajorVersion.brick = brick;

    const documentation = new HnDocumentation();
    documentation.id = DOC_ID;
    documentation.title = 'Getting started';
    documentation.content = richText(paragraph('p1', 'One')).toJson();
    documentation.modifications = null;
    documentation.folder = { brickMajorVersion } as HnDocumentation['folder'];
    return documentation;
  }

  /** One recorded action on the page, by `userId`, exactly as any write records one. */
  function record(userId: string, ...blocks: TeBlock[]): void {
    const aggregate = doc.getRichTextAggregate();
    aggregate.updateContent(richText(...blocks), userId);
    doc.setRichTextAggregate(aggregate);
  }

  function revisionOf(): string {
    return TeRichTextRevision.of(doc.getRichText());
  }

  function buildAuthorizationRepository(): Repository<HnDocumentation> {
    const builder: Record<string, unknown> = {
      select: () => builder,
      leftJoinAndSelect: () => builder,
      where: () => builder,
      getOne: () => Promise.resolve(doc),
    };
    return { createQueryBuilder: () => builder } as unknown as Repository<HnDocumentation>;
  }

  /**
   * The repository the real documentation service writes through: it stores onto the same document
   * the test reads, so the history it appends to is the one under assertion.
   */
  function buildWriteRepository(): Repository<HnDocumentation> {
    return {
      findOneBy: (): Promise<HnDocumentation | null> => Promise.resolve(doc),
      save: (saved: HnDocumentation): Promise<HnDocumentation> => Promise.resolve(saved),
    } as unknown as Repository<HnDocumentation>;
  }

  function buildBrickSecurity(): HnBrickSecurity {
    return {
      assertIsCreatorOrCoAuthor: (): Promise<void> =>
        authorized ? Promise.resolve() : Promise.reject(new BlUnauthorizedException('nope')),
    } as unknown as HnBrickSecurity;
  }

  function buildUserService(): HnUserService {
    return {
      findOne: (id: string): Promise<HnUser | null> => Promise.resolve(knownUsers.get(id) ?? null),
    } as unknown as HnUserService;
  }

  /** Every real call runs in a request scope with the MCP user resolved by the guard. */
  function asUser<T>(run: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      BlRequestContext.runWithContext(new BlRequestContext({} as Request, {} as Response, null, {}), () => {
        HnCurrentUserHelper.setAuthContext({ type: 'mcp', user: { id: USER_ID } as HnUser });
        run().then(resolve, reject);
      });
    });
  }

  beforeEach(() => {
    doc = buildDoc();
    authorized = true;
    knownUsers = new Map([
      [USER_ID, { id: USER_ID, firstname: 'Ada', lastname: 'Lovelace' } as HnUser],
      [OTHER_USER_ID, { id: OTHER_USER_ID, firstname: 'Alan', lastname: 'Turing' } as HnUser],
    ]);

    service = new HnMcpDocHistoryService(
      new HnDocumentationService(buildWriteRepository()),
      buildUserService(),
      new HnMcpDocAuthorization(buildAuthorizationRepository(), undefined as never, buildBrickSecurity())
    );
  });

  describe('reading the history', () => {
    it('returns one entry per recorded action, newest first, with its author', async () => {
      record(USER_ID, paragraph('p1', 'One'), paragraph('p2', 'Two'));
      record(OTHER_USER_ID, paragraph('p1', 'One'), paragraph('p2', 'Two, edited'));

      const result = await asUser(() => service.history(DOC_ID));

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.entries).toHaveLength(2);
      expect(result.entries[0].author).toEqual({ id: OTHER_USER_ID, name: 'Alan Turing' });
      expect(result.entries[0].changes).toEqual([
        { blockId: 'p2', blockType: TeBlockType.PARAGRAPH, change: TeRichTextModificationType.UPDATED },
      ]);
      expect(result.entries[1].author).toEqual({ id: USER_ID, name: 'Ada Lovelace' });
      expect(result.revision).toBe(revisionOf());
    });

    /**
     * One user action can touch several blocks, and they share a `groupId`. They have to read as one
     * entry: a rollback target is a point to come back to, and half a group undone is a page in a
     * state nobody ever saved.
     */
    it('reads a batch that touched several blocks as one entry', async () => {
      record(USER_ID, paragraph('p1', 'One, edited'), paragraph('p2', 'Two'), paragraph('p3', 'Three'));

      const result = await asUser(() => service.history(DOC_ID));

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.entries).toHaveLength(1);
      expect(result.entries[0].changes.map((change) => change.blockId).sort()).toEqual(['p1', 'p2', 'p3']);
    });

    it('caps the entries it returns and says how many there are', async () => {
      record(USER_ID, paragraph('p1', 'Two'));
      record(USER_ID, paragraph('p1', 'Three'));
      record(USER_ID, paragraph('p1', 'Four'));

      const result = await asUser(() => service.history(DOC_ID, 2));

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.entries).toHaveLength(2);
      expect(result.moreEntries).toBe(3);
    });

    it('reads a page nobody has edited yet as an empty history', async () => {
      const result = await asUser(() => service.history(DOC_ID));

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.entries).toEqual([]);
      expect(result.moreEntries).toBeUndefined();
    });

    /**
     * The people who wrote a page outlive their account here, and a history that threw on one of them
     * would be unreadable for good.
     */
    it('reads an entry whose author is gone', async () => {
      record('user-gone', paragraph('p1', 'One, edited'));

      const result = await asUser(() => service.history(DOC_ID));

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.entries[0].author).toBeNull();
    });
  });

  describe('rolling back', () => {
    it('restores the content the page had before the entry named', async () => {
      record(USER_ID, paragraph('p1', 'One'), paragraph('p2', 'Two'));
      const before = doc.getRichText().getBlocks().length;
      record(USER_ID, paragraph('p1', 'One'), paragraph('p2', 'Two'), paragraph('p3', 'Three'));

      const history = await asUser(() => service.history(DOC_ID));
      expect(history.ok).toBe(true);
      if (!history.ok) return;

      const result = await asUser(() => service.rollback(DOC_ID, history.entries[0].modificationId));

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(doc.getRichText().getBlocks()).toHaveLength(before);
      expect(result.revision).toBe(revisionOf());
      expect(result.undoneEntries).toBe(1);
    });

    /**
     * The rollback is an ordinary write, so it is itself in the history and can be rolled back in
     * turn. The site's own rollback truncates the record at the point it returns to; a tool whose
     * whole purpose is that nothing is unrecoverable cannot.
     */
    it('records the rollback rather than erasing what it undid', async () => {
      record(USER_ID, paragraph('p1', 'One'), paragraph('p2', 'Two'));

      const history = await asUser(() => service.history(DOC_ID));
      expect(history.ok).toBe(true);
      if (!history.ok) return;

      await asUser(() => service.rollback(DOC_ID, history.entries[0].modificationId));
      const after = await asUser(() => service.history(DOC_ID));

      expect(after.ok).toBe(true);
      if (!after.ok) return;
      expect(after.entries.length).toBeGreaterThan(history.entries.length);
      expect(after.entries.map((entry) => entry.modificationId)).toContain(history.entries[0].modificationId);
    });

    /**
     * The history tool only ever hands out the id of an entry's first change, but the ids of every
     * change in it are there to be read — and undoing an action from its middle would leave the page
     * in a state nobody ever saved.
     */
    it('refuses a block change from inside an action, naming the entry to use instead', async () => {
      record(USER_ID, paragraph('p1', 'One, edited'), paragraph('p2', 'Two'), paragraph('p3', 'Three'));

      const history = await asUser(() => service.history(DOC_ID));
      expect(history.ok).toBe(true);
      if (!history.ok) return;
      const entry = history.entries[0];
      const insideTheAction = entry.changes[1].blockId;
      const modifications = doc.getRichTextAggregate().modifications.getModifications();
      const midGroupId = modifications.find((modification) => modification.blockId === insideTheAction)?.id;

      const result = await asUser(() => service.rollback(DOC_ID, midGroupId ?? ''));

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.reason).toContain('one block change inside a larger action');
      expect(result.reason).toContain(entry.modificationId);
    });

    it('refuses an entry the history does not hold', async () => {
      record(USER_ID, paragraph('p1', 'One, edited'));

      const result = await asUser(() => service.rollback(DOC_ID, 'no-such-entry'));

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.reason).toContain('holds no entry');
      expect(doc.getRichText().getBlock('p1')?.data).toEqual({ text: 'One, edited' });
    });

    /**
     * The write locks on the revision the undo was computed from, so a rollback prepared against a
     * page someone else has since edited is refused rather than silently reverting their change too.
     */
    it('refuses when the page is written to while the rollback is being prepared', async () => {
      record(USER_ID, paragraph('p1', 'One, edited'));
      const history = await asUser(() => service.history(DOC_ID));
      expect(history.ok).toBe(true);
      if (!history.ok) return;

      const service2 = new HnMcpDocHistoryService(
        new HnDocumentationService({
          findOneBy: (): Promise<HnDocumentation> => {
            // Someone else's write, landing between the read this rollback was prepared from and the
            // write it is about to attempt.
            record(OTHER_USER_ID, paragraph('p1', 'One, by someone else'));
            return Promise.resolve(doc);
          },
          save: (saved: HnDocumentation): Promise<HnDocumentation> => Promise.resolve(saved),
        } as unknown as Repository<HnDocumentation>),
        buildUserService(),
        new HnMcpDocAuthorization(buildAuthorizationRepository(), undefined as never, buildBrickSecurity())
      );

      const result = await asUser(() => service2.rollback(DOC_ID, history.entries[0].modificationId));

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.reason).toContain('was written to while this rollback was being prepared');
      expect(doc.getRichText().getBlock('p1')?.data).toEqual({ text: 'One, by someone else' });
    });
  });

  describe('who may read and roll back', () => {
    it.each([
      ['history', (): Promise<{ ok: boolean }> => service.history(DOC_ID)],
      ['rollback', (): Promise<{ ok: boolean }> => service.rollback(DOC_ID, 'whatever')],
    ])('refuses %s for a user who is neither the author nor a co-author', async (_name, run) => {
      authorized = false;

      const result = (await asUser(run)) as { ok: boolean; reason?: string };

      expect(result.ok).toBe(false);
      expect(result.reason).toContain('neither the author nor a co-author');
      expect(result.reason).toContain('gws_core');
    });
  });
});
