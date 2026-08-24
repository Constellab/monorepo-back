import { BlBadRequestException, BlConflictException } from '@monorepo/back-core-lib';
import {
  TeRichText,
  TeRichTextAggregate,
  TeRichTextRevision,
  TeRichTextValidator,
} from '@monorepo/te-text-editor';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { HnCurrentUserHelper } from '../../core/utils/hn-current-user.helper';
import { HnBrickMajorVersion } from '../brick-major-version/hn-brick-major-version.entity';
import { HnNodeDTO } from '../folder/hn-folder.dto';
import { HnFolder } from '../folder/hn-folder.entity';
import { HnFolderService } from '../folder/hn-folder.service';
import { HnDocumentationContentUpdateDto } from './hn-documentation.dto';
import { HnDocumentation, HnDocumentationSearchDTO } from './hn-documentation.entity';

@Injectable()
export class HnDocumentationService {
  constructor(
    @InjectRepository(HnDocumentation)
    private documentationsRepository: Repository<HnDocumentation>
  ) {}

  async createMainDoc(mainFolder: HnFolder, entityManager: EntityManager): Promise<void> {
    const gettingStartedDoc: HnNodeDTO = new HnNodeDTO();
    gettingStartedDoc.folder = mainFolder;
    gettingStartedDoc.path = 'getting-started';
    gettingStartedDoc.title = 'Getting Started';
    gettingStartedDoc.isFolder = false;
    await this.create(gettingStartedDoc, mainFolder, entityManager);
  }

  async create(
    createDocumentation: HnNodeDTO,
    folder: HnFolder,
    entityManager?: EntityManager
  ): Promise<HnDocumentation> {
    const { path, completePath } = HnFolderService.resolveNodePath(folder, createDocumentation.title);

    const documentation = new HnDocumentation();

    documentation.title = createDocumentation.title ?? '';
    documentation.path = path;
    documentation.completePath = completePath;
    documentation.folder = folder;
    documentation.order = folder.nextOrder();

    return entityManager
      ? await entityManager.save(documentation)
      : await this.documentationsRepository.save(documentation);
  }

  async findAll(): Promise<Array<HnDocumentation>> {
    return await this.documentationsRepository.find({
      order: {
        order: 'ASC',
      },
    });
  }

  async findById(id: string, strict?: true): Promise<HnDocumentation>;
  async findById(id: string, strict: boolean): Promise<HnDocumentation | null>;
  async findById(id: string, strict: boolean = true): Promise<HnDocumentation | null> {
    const doc = await this.documentationsRepository.findOne({
      where: { id },
      relations: {
        folder: true,
      },
    });
    if (doc == null && strict) {
      throw new BlBadRequestException('Doc not found');
    }
    return doc;
  }

  /**
   * Rename a doc. The parent folder must be loaded with its documentations and folders relations
   * so the new path can be made unique among the siblings.
   */
  async update(updatedDocumentation: HnNodeDTO, parentFolder: HnFolder): Promise<HnDocumentation> {
    const doc = await this.documentationsRepository.findOne({
      where: { id: updatedDocumentation.id },
      relations: { folder: true },
    });

    if (doc == null) {
      throw new BlBadRequestException('Doc not found');
    }

    const { path, completePath } = HnFolderService.resolveNodePath(
      parentFolder,
      updatedDocumentation.title,
      doc.id
    );
    doc.path = path;
    doc.completePath = completePath;
    doc.title = updatedDocumentation.title ?? '';
    return this.documentationsRepository.save(doc);
  }

  async updatePosition(updatedDocumentation: HnDocumentation): Promise<HnDocumentation> {
    return await this.documentationsRepository.save(updatedDocumentation);
  }

  async remove(id: string): Promise<void> {
    await this.documentationsRepository.delete(id);
  }

  async findCurrentDoc(
    brickMajorVersion: HnBrickMajorVersion,
    path: string
  ): Promise<HnDocumentation | null> {
    return await this.documentationsRepository.findOneBy({
      completePath: path,
      folder: { brickMajorVersion: { id: brickMajorVersion.id } },
    });
  }

  /**
   * The single write path for a documentation's content — the UI and the `gws community` CLI
   * both land here, so the server-side definition of a valid document is applied once, here,
   * rather than in each writer. See
   * `docs/adr/0004-the-mcp-writes-documentation-by-operations.md`.
   *
   * `revision` is the revision the caller read the content at, and is optional: passing it turns
   * the write into an optimistic lock, passing nothing keeps the historical last-write-wins, which
   * is what every caller predating it does. Without the lock, a CLI push silently overwrites a
   * concurrent MCP edit exactly where the two paths meet — and the model that wrote it is told the
   * save succeeded.
   */
  async updateContent(
    id: string,
    updateContentDoc: TeRichText,
    revision?: string
  ): Promise<HnDocumentationContentUpdateDto> {
    const doc = await this.documentationsRepository.findOneBy({
      id: id,
    });
    if (doc == null) {
      throw new BlBadRequestException('Doc not found');
    }

    this.assertRevisionIsCurrent(doc, revision);

    // Sanitize before the aggregate compares with the stored content: the modification history
    // is derived from that comparison, so it must describe what was actually stored.
    const { richText, warnings } = TeRichTextValidator.sanitize(updateContentDoc);

    const richTextAggregate = doc.getRichTextAggregate();
    richTextAggregate.updateContent(richText, HnCurrentUserHelper.getAndCheckCurrentUser().id);
    doc.setRichTextAggregate(richTextAggregate);

    const saved = await this.documentationsRepository.save(doc);

    // Computed from what was stored rather than from what was sent: the sanitizer may have cleaned
    // the content, and the caller's next edit has to lock against the version that now exists.
    return new HnDocumentationContentUpdateDto(saved, warnings, TeRichTextRevision.of(saved.getRichText()));
  }

  /**
   * A conflict rather than a bad request: the request is well formed, and what makes it fail is the
   * state of the document, which the caller fixes by reading it again — not by fixing the request.
   *
   * Only an absent revision opts out of the lock. Anything present is compared, an empty string
   * included: a caller sending its uninitialized field would otherwise get last-write-wins from a
   * request that looks locked.
   */
  private assertRevisionIsCurrent(doc: HnDocumentation, revision?: string): void {
    if (revision == null) {
      return;
    }

    const current = TeRichTextRevision.of(doc.getRichText());
    if (current !== revision) {
      throw new BlConflictException(
        `The document changed since it was read at revision "${revision}" (it is now at "${current}"). ` +
          `Read it again and replay the edit on the content that exists now.`
      );
    }
  }

  async updateCompletePath(doc: HnDocumentation, folder: HnFolder): Promise<void> {
    doc.completePath = folder.completePath ? folder.completePath + doc.path + '/' : doc.path + '/';
    await this.documentationsRepository.save(doc);
  }

  async save(documentation: HnDocumentation): Promise<HnDocumentation> {
    return await this.documentationsRepository.save(documentation);
  }

  async getDocByLink(
    brickMajorVersion: HnBrickMajorVersion,
    completePath: string,
    anchor?: string
  ): Promise<HnDocumentationSearchDTO | null> {
    const documentation = await this.documentationsRepository.findOne({
      where: {
        completePath: completePath,
        folder: {
          brickMajorVersion: {
            id: brickMajorVersion.id,
          },
        },
      },
      relations: { folder: true },
    });

    if (documentation) {
      return {
        id: documentation.id,
        name: documentation.title,
        completePath: documentation.completePath,
        anchor: anchor ? anchor : undefined,
        major: brickMajorVersion.major.toString(),
        brickName: brickMajorVersion.brick.name,
      };
    } else {
      return null;
    }
  }

  public getDocsByBrickVersion(brickMajorVersionId: string): Promise<HnDocumentation[]> {
    return this.documentationsRepository.find({
      where: {
        folder: {
          brickMajorVersion: {
            id: brickMajorVersionId,
          },
        },
      },
    });
  }

  ///////////////////////////////////////// HISTORY /////////////////////////////////////////

  getUndoContent(doc: HnDocumentation, modificationId: string): TeRichTextAggregate {
    const richText = doc.getRichTextAggregate();
    richText.undoModifications(modificationId);
    return richText;
  }

  async rollbackContent(doc: HnDocumentation, modificationId: string): Promise<HnDocumentation> {
    const newContent = this.getUndoContent(doc, modificationId);

    doc.setRichTextAggregate(newContent);

    return this.documentationsRepository.save(doc);
  }
}
