import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {EntityManager, Repository} from 'typeorm';
import {HnDocumentation, HnDocumentationSearchDTO} from './hn-documentation.entity';
import {HnBrickMajorVersion} from '../brick-major-version/hn-brick-major-version.entity';
import {
  BlBadRequestException,
  BlBlockType,
  BlNewRichText,
  BlObjectStorageService,
  BlRichTextContent
} from '@monorepo/back-core-lib';
import {HnCoreConfigService} from '../../core/modules/core-config/hn-core-config.service';
import {HnNodeDTO} from '../folder/hn-folder.dto';
import {HnFolder} from '../folder/hn-folder.entity';
import {ClStringHelper} from '@monorepo/core-lib';
import {HnDocumentationFileService} from '../documentation-file/hn-documentation-file.service';
import {HnFileDocumentation} from '../../file-aggregate/file-documentation/hn-file-documentation.entity';
import {HnFileType} from '../../file-aggregate/file-core/hn-abstract-file.entity';
import {HnDocumentationFile} from '../documentation-file/hn-documentation-file.entity';

@Injectable()
export class HnDocumentationService {
  constructor(@InjectRepository(HnDocumentation)
              private documentationsRepository: Repository<HnDocumentation>,
              private objectStorageService: BlObjectStorageService,
              private configService: HnCoreConfigService,
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
      where: {id},
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
      {where: {id: updatedDocumentation.id}, relations: {folder: true}});

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
      folder: {brickMajorVersion: {id: brickMajorVersion.id}}
    });
  }

  async updateContent(id: string, updateContentDoc: BlRichTextContent): Promise<HnDocumentation> {
    const doc: HnDocumentation = await this.documentationsRepository.findOneBy({id: id});
    if (doc) {
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

  public getDocsByBrickVersion(brickMajorVersionId: string): Promise<HnDocumentation[]>{
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

  public async updateDocImageFileName(doc: HnDocumentation, newDocFileEntity: HnFileDocumentation,
                                      entityManager: EntityManager): Promise<void> {
    let modified = false;
    doc.content.blocks.forEach((block: any) => {
      if (block.type == 'figure' && newDocFileEntity.type == HnFileType.IMAGE && block.data.filename == newDocFileEntity.fileName) {
        block.data.filename = newDocFileEntity.name;
        modified = true;
      }
      if (block.type == 'file' && newDocFileEntity.type == HnFileType.FILE && block.data.name == newDocFileEntity.fileName) {
        block.data.name = newDocFileEntity.name;
        modified = true;
      }
      if (block.type == 'resourceView' && newDocFileEntity.type == HnFileType.RESOURCE_VIEW
        && block.data.filename == newDocFileEntity.fileName) {
        block.data.filename = newDocFileEntity.name;
        modified = true;
      }
    });
    if (modified) {
      await entityManager.save(doc, {listeners: false});
    }

    // File added to the doc but not in the content
    if (newDocFileEntity.type == HnFileType.FILE) {
      (doc.content as BlRichTextContent).blocks.push({
        id: BlNewRichText.generateRandomBlockId(),
        type: 'file' as any,
        data: {
          id: newDocFileEntity.id,
          name: newDocFileEntity.name,
          size: newDocFileEntity.size,
        }
      });
    }


    await entityManager.save(doc, {listeners: false});

  }

  async getDocFile(fileName: string): Promise<HnDocumentationFile>{
    return this.docFileService.getDocumentationFileByFileName(fileName);
  }
}
