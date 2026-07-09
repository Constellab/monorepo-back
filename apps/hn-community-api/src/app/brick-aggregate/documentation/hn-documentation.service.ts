import { BlBadRequestException } from '@monorepo/back-core-lib';
import { ClStringHelper } from '@monorepo/core-lib';
import { TeRichText, TeRichTextAggregate } from '@monorepo/te-text-editor';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { HnCurrentUserHelper } from '../../core/utils/hn-current-user.helper';
import { HnBrickMajorVersion } from '../brick-major-version/hn-brick-major-version.entity';
import { HnNodeDTO } from '../folder/hn-folder.dto';
import { HnFolder } from '../folder/hn-folder.entity';
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
    const path = ClStringHelper.generateUrlPathFromString(createDocumentation.title ?? '');

    const documentation = new HnDocumentation();

    documentation.title = createDocumentation.title ?? '';
    documentation.setPath(path, folder.completePath);
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

  async update(updatedDocumentation: HnNodeDTO): Promise<HnDocumentation> {
    const doc = await this.documentationsRepository.findOne({
      where: { id: updatedDocumentation.id },
      relations: { folder: true },
    });

    if (doc == null) {
      throw new BlBadRequestException('Doc not found');
    }

    doc.setPath(
      ClStringHelper.generateUrlPathFromString(updatedDocumentation.title ?? ''),
      doc.folder.completePath
    );
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

  async updateContent(id: string, updateContentDoc: TeRichText): Promise<HnDocumentation> {
    const doc = await this.documentationsRepository.findOneBy({
      id: id,
    });
    if (doc == null) {
      throw new BlBadRequestException('Doc not found');
    }
    const richTextAggregate = doc.getRichTextAggregate();
    richTextAggregate.updateContent(updateContentDoc, HnCurrentUserHelper.getAndCheckCurrentUser().id);
    doc.setRichTextAggregate(richTextAggregate);
    return this.documentationsRepository.save(doc);
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
