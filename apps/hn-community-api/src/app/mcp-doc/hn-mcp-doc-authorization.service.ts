import { BlUnauthorizedException } from '@monorepo/back-core-lib';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { HnBrick } from '../brick-aggregate/brick/hn-brick.entity';
import { HnDocumentation } from '../brick-aggregate/documentation/hn-documentation.entity';
import { HnFolder } from '../brick-aggregate/folder/hn-folder.entity';
import { HnBrickSecurity } from '../brick-aggregate/security/hn-brick.security';
import { HnCurrentUserHelper } from '../core/utils/hn-current-user.helper';

/**
 * Why a write was refused, in a sentence meant for the model rather than for a log.
 *
 * Every write tool of this MCP models its refusals as results, not exceptions — not authorized, an
 * unknown page, a title already taken. All of them are things the caller acts on, and none is a
 * server fault; an exception thrown out of a tool handler reaches a model as a transport error
 * stripped of exactly the detail that makes it actionable. See
 * `docs/adr/0004-the-mcp-writes-documentation-by-operations.md`.
 */
export interface HnMcpDocRefusal {
  ok: false;
  reason: string;
}

/**
 * Who may write to a brick's documentation, and the queries that establish it.
 *
 * One provider rather than a check per tool: nine write tools now reach these pages, and a rule
 * copied nine times is a rule that will differ in one of them. It is the brick's own rule —
 * creator or co-author, `HnBrickSecurity` — the same object the Community site asks about the same
 * page, so an author gains and loses nothing by working through a model instead of the site.
 *
 * Read access is the whole endpoint's (the documentation is public on the web); writing to a
 * brick's pages is not.
 */
@Injectable()
export class HnMcpDocAuthorization {
  constructor(
    @InjectRepository(HnDocumentation)
    private readonly documentationsRepository: Repository<HnDocumentation>,
    @InjectRepository(HnFolder)
    private readonly foldersRepository: Repository<HnFolder>,
    private readonly brickSecurity: HnBrickSecurity
  ) {}

  /**
   * The page with the chain up to its brick, which is where the authorization lives. One query
   * rather than the documentation service's `findById` plus a walk, because the folder relation it
   * loads stops one join short of the brick.
   */
  findDocWithBrick(id: string): Promise<HnDocumentation | null> {
    return this.withBrickChain(
      this.documentationsRepository.createQueryBuilder('doc').leftJoinAndSelect('doc.folder', 'folder'),
      'doc',
      id
    );
  }

  /** The folder with the same chain. A folder carries its brick version directly. */
  findFolderWithBrick(id: string): Promise<HnFolder | null> {
    return this.withBrickChain(this.foldersRepository.createQueryBuilder('folder'), 'folder', id);
  }

  /**
   * `brickMajorVersion` is eager on both entities, which a query builder does not honour, and
   * `createdBy` is the one column the authorization actually reads on the brick.
   */
  private withBrickChain<T extends HnDocumentation | HnFolder>(
    query: SelectQueryBuilder<T>,
    alias: 'doc' | 'folder',
    id: string
  ): Promise<T | null> {
    return query
      .leftJoinAndSelect('folder.brickMajorVersion', 'brickMajorVersion')
      .leftJoinAndSelect('brickMajorVersion.brick', 'brick')
      .leftJoinAndSelect('brick.createdBy', 'createdBy')
      .where(`${alias}.id = :id`, { id })
      .getOne();
  }

  /** The brick a page belongs to, or `null` when the chain up to it is broken. */
  static brickOfDoc(doc: HnDocumentation): HnBrick | null {
    return doc.folder?.brickMajorVersion?.brick ?? null;
  }

  /** The brick a folder belongs to, or `null` when the chain up to it is broken. */
  static brickOfFolder(folder: HnFolder): HnBrick | null {
    return folder.brickMajorVersion?.brick ?? null;
  }

  /** Refuses unless the caller is the author or a co-author of the brick the page belongs to. */
  refuseUnlessAuthorOfDoc(doc: HnDocumentation): Promise<HnMcpDocRefusal | null> {
    return this.refuseUnlessAuthorOfBrick(HnMcpDocAuthorization.brickOfDoc(doc), `The page "${doc.title}"`);
  }

  /** Refuses unless the caller is the author or a co-author of the brick the folder belongs to. */
  refuseUnlessAuthorOfFolder(folder: HnFolder): Promise<HnMcpDocRefusal | null> {
    return this.refuseUnlessAuthorOfBrick(
      HnMcpDocAuthorization.brickOfFolder(folder),
      `The folder "${folder.title ?? ''}"`
    );
  }

  /**
   * `what` names the node in the refusal of an orphan, which is the only case where the caller has
   * to be told what could not be attached to a brick rather than which brick refused it.
   */
  private async refuseUnlessAuthorOfBrick(
    brick: HnBrick | null,
    what: string
  ): Promise<HnMcpDocRefusal | null> {
    if (brick == null) {
      return {
        ok: false,
        reason: `${what} is not attached to a brick, so no author can be established.`,
      };
    }

    // Outside the catch: this one throws when there is no user in the context, which is a broken
    // request rather than a verdict on this brick, and must not be reported as one.
    const user = HnCurrentUserHelper.getAndCheckCurrentUser();

    try {
      await this.brickSecurity.assertIsCreatorOrCoAuthor(brick, user);
      return null;
    } catch (error) {
      // Only the verdict is turned into a refusal. The check reads the brick's co-authors from the
      // database, and a timeout reported as "you are not the author" would send the caller off to
      // ask for rights it already has, instead of trying again.
      if (!(error instanceof BlUnauthorizedException)) {
        throw error;
      }
      return {
        ok: false,
        reason:
          `You are neither the author nor a co-author of the brick "${brick.name}", so its ` +
          `documentation cannot be changed with your account. Ask one of them to add you as a ` +
          `co-author, or send them the change.`,
      };
    }
  }
}
