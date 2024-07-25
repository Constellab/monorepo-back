import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { HnDocumentation, HnDocumentationSearchDTO } from './hn-documentation.entity';
import { HnBrickMajorVersion } from '../brick-major-version/hn-brick-major-version.entity';
import {
  BlBadRequestException,
  BlNewRichText, BlRichTextBlockModification,
  BlRichTextContent,
  BlRichTextModifications, BlRichTextModificationType
} from '@monorepo/back-core-lib';
import { HnNodeDTO } from '../folder/hn-folder.dto';
import { HnFolder } from '../folder/hn-folder.entity';
import { ClStringHelper } from '@monorepo/core-lib';
import { HnDocumentationFileService } from '../documentation-file/hn-documentation-file.service';
import { HnFileDocumentation } from '../../file-aggregate/file-documentation/hn-file-documentation.entity';
import { HnFileType } from '../../file-aggregate/file-core/hn-abstract-file.entity';
import { HnDocumentationFile } from '../documentation-file/hn-documentation-file.entity';
import {HnCurrentUserHelper} from '../../core/utils/hn-current-user.helper';
import {HnStory} from '../../story/hn-story.entity';
import {HnUserDto} from '../../users/hn-user.dto';

@Injectable()
export class HnDocumentationService {
  constructor(@InjectRepository(HnDocumentation)
              private documentationsRepository: Repository<HnDocumentation>,
              private docFileService: HnDocumentationFileService) {
  }

  async createMainDoc(mainFolder: HnFolder, entityManager: EntityManager): Promise<void> {
    const gettingStartedDoc: HnNodeDTO = new HnNodeDTO();
    gettingStartedDoc.folder = mainFolder;
    gettingStartedDoc.path = 'getting-started';
    gettingStartedDoc.title = 'Getting Started';
    gettingStartedDoc.isFolder = false;
    await this.create(gettingStartedDoc, mainFolder, entityManager);
  }

  async create(createDocumentation: HnNodeDTO, folder: HnFolder,
               entityManager?: EntityManager): Promise<HnDocumentation> {
    const path = ClStringHelper.generateUrlPathFromString(createDocumentation.title);

    const documentation = new HnDocumentation();

    documentation.title = createDocumentation.title;
    documentation.setPath(path, folder.completePath);
    documentation.folder = folder;
    documentation.order = folder.nextOrder();

    return entityManager ? await entityManager.save(documentation) : await this.documentationsRepository.save(documentation);
  }


  async findAll(): Promise<Array<HnDocumentation>> {
    return await this.documentationsRepository.find({
      order: {
        order: 'ASC'
      }
    });
  }

  async findById(id: string, strict: boolean = true): Promise<HnDocumentation> {
    const doc = await this.documentationsRepository.findOne({
      where: { id },
      relations: {
        folder: true
      }
    });
    if (doc == null && strict) {
      throw new BlBadRequestException('Doc not found');
    }
    return doc;
  }

  async update(updatedDocumentation: HnNodeDTO): Promise<HnDocumentation> {
    const doc: HnDocumentation = await this.documentationsRepository.findOne(
      { where: { id: updatedDocumentation.id }, relations: { folder: true } });

    doc.setPath(ClStringHelper.generateUrlPathFromString(updatedDocumentation.title), doc.folder.completePath);
    doc.title = updatedDocumentation.title;
    return this.documentationsRepository.save(doc);
  }

  async updatePosition(updatedDocumentation: HnDocumentation): Promise<HnDocumentation> {
    return await this.documentationsRepository.save(updatedDocumentation);
  }

  async remove(id: string): Promise<void> {
    await this.documentationsRepository.delete(id);
  }

  async findCurrentDoc(brickMajorVersion: HnBrickMajorVersion, path: string): Promise<HnDocumentation> {
    return await this.documentationsRepository.findOneBy({
      completePath: path,
      folder: { brickMajorVersion: { id: brickMajorVersion.id } }
    });
  }

  async updateContent(id: string, updateContentDoc: BlRichTextContent): Promise<HnDocumentation> {
    const doc: HnDocumentation = await this.documentationsRepository.findOneBy({ id: id });
    if (doc) {
      doc.modifications =
        new BlNewRichText(doc.content as BlRichTextContent)
          .getRichTextModification(updateContentDoc, HnCurrentUserHelper.getAndCheckCurrentUser().id,
            BlRichTextModifications.fromJsonObjectString(doc.modifications));
      doc.content = updateContentDoc;
    }
    return this.documentationsRepository.save(doc);
  }

  async updateCompletePath(doc: HnDocumentation, folder: HnFolder): Promise<void> {
    doc.completePath = folder.completePath ? folder.completePath + doc.path + '/' : doc.path + '/';
    await this.documentationsRepository.save(doc);
  }

  async getDocByLink(brickMajorVersion: HnBrickMajorVersion, completePath: string, anchor?: string): Promise<HnDocumentationSearchDTO> {

    const documentation: HnDocumentation = await this.documentationsRepository.findOne({
      where: {
        completePath: completePath,
        folder: {
          brickMajorVersion: {
            id: brickMajorVersion.id
          }
        }
      },
      relations: ['folder']
    });

    return documentation ? {
      id: documentation.id,
      name: documentation.title,
      completePath: documentation.completePath,
      anchor: anchor ? anchor : null,
      major: brickMajorVersion.major.toString(),
      brickName: brickMajorVersion.brick.name
    } : null;
  }

  public getDocsByBrickVersion(brickMajorVersionId: string): Promise<HnDocumentation[]> {
    return this.documentationsRepository.find({
      where: {
        folder: {
          brickMajorVersion: {
            id: brickMajorVersionId
          }
        }
      }
    });
  }


  async getDocFile(fileName: string): Promise<HnDocumentationFile> {
    return this.docFileService.getDocumentationFileByFileName(fileName);
  }

  ///////////////////////////////////////// HISTORY /////////////////////////////////////////

  async getUndoContent(doc: HnDocumentation, modificationId: string): Promise<Record<string, any>> {
    const richText = new BlNewRichText(doc.content as BlRichTextContent);
    const modifications = BlRichTextModifications.fromJsonObjectString((doc.modifications));
    let modificationsBlocks = modifications.getModificationsFromModificationId(modificationId);
    if (modificationsBlocks?.length == 0){
      throw new BlBadRequestException('No undo possible');
    }
    if (modificationsBlocks.length == 1 && modificationsBlocks[0].type != BlRichTextModificationType.DELETED
      && modificationsBlocks[0].type != BlRichTextModificationType.MOVED){
      return doc.content;
    }
    if (modificationsBlocks[0].type == BlRichTextModificationType.CREATED ||
      modificationsBlocks[0].type == BlRichTextModificationType.UPDATED){
      modificationsBlocks = modificationsBlocks.slice(1);
    }
    return richText.undoModifications(modificationsBlocks);
  }

  async rollbackContent(doc: HnDocumentation, modificationId: string): Promise<HnDocumentation>{
    const newContent = await this.getUndoContent(doc, modificationId);

    const modifications = BlRichTextModifications.fromJsonObjectString((doc.modifications));
    const removeNumber = modifications.removeModificationsFromModificationId(modificationId);

    if (removeNumber == 0){
      return doc;
    }

    doc.content = newContent;
    doc.modifications = JSON.stringify(modifications.toJsonObject());

    return this.documentationsRepository.save(doc);

  }

  async getDocModifications(doc: HnDocumentation): Promise<BlRichTextBlockModification[]>{
    if (!doc.modifications) return [];
    return BlRichTextModifications.fromJsonObjectString(doc.modifications).getModifications();
  }
}
