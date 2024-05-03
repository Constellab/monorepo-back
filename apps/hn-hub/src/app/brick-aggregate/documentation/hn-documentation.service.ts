import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {EntityManager, Repository} from 'typeorm';
import {HnDocumentation, HnDocumentationSearchDTO} from './hn-documentation.entity';
import {HnBrickMajorVersion} from '../brick-major-version/hn-brick-major-version.entity';
import {
  BlBadRequestException,
  BlBucketConfig,
  BlBucketType,
  BlFile,
  BlImageHelper,
  BlObjectStorageService,
  BlQuillMigrator,
  BlRichTextContent,
  BlRichTextUploadedImage
} from '@monorepo/back-core-lib';
import {HnCoreConfigService} from '../../core/modules/core-config/hn-core-config.service';
import {IncomingMessage} from 'http';
import {HnNodeDTO} from '../folder/hn-folder.dto';
import {HnFolder} from '../folder/hn-folder.entity';
import {ClStringHelper} from '@monorepo/core-lib';
import {HnDocumentationFileService} from '../documentation-file/hn-documentation-file.service';
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

  findById(id: string): Promise<HnDocumentation> {
    return this.documentationsRepository.findOne({
      where: {id},
      relations: {
        folder: true
      }
    });
  }

  async findDocByCompletePath(folder: HnFolder, completePath: string): Promise<HnDocumentation>{
    return this.documentationsRepository.findOne({
      where: {
        completePath: completePath,
        folder: {
          id: folder.id
        }
      }
    });
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


  async saveImage(docId: string, file: BlFile, generateRandomObjectName: boolean = true): Promise<BlRichTextUploadedImage> {
    const imSize = BlImageHelper.getImageSize(file);
    const fileExt = file.originalname.split('.').pop();
    file.originalname = docId + '/images/' + ClStringHelper.generateUUID() + '.' + fileExt;

    const filename = await this.objectStorageService.uploadObject(
      [this.getBucketConfig(), this.getBackupBucketConfig()], file, {generateRandomObjectName: generateRandomObjectName});

    return {
      filename: filename,
      width: imSize.width,
      height: imSize.height
    };
  }

  async getImage(filename: string): Promise<IncomingMessage> {
    return await this.objectStorageService.getObject(this.getBucketConfig(), filename);
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

  private getBucketConfig(): BlBucketConfig {
    return {
      endpoint: this.configService.getDefaultObjectStorageEndPoint(),
      region: this.configService.getDefaultObjectStorageRegion(),
      bucket: this.configService.getDocImageObjectStorageBucket(),
      credentials: this.configService.getDefaultObjectStorageCredentials(),
      bucketType: BlBucketType.NORMAL,
    };
  }

  private getBackupBucketConfig(): BlBucketConfig {
    return {
      endpoint: this.configService.getBackupObjectStorageEndPoint(),
      region: this.configService.getBackupObjectStorageRegion(),
      bucket: this.configService.getDocImageObjectStorageBackupBucket(),
      credentials: this.configService.getDefaultObjectStorageCredentials(),
      bucketType: BlBucketType.NORMAL
    };
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


  async migrateDocumentations(): Promise<void> {
    const docs = await this.documentationsRepository.find();
    for (const doc of docs) {
      console.log('Migrating doc ' + doc.id)
      const content: any = doc.content;
      if (content && content.ops) {
        console.log('Migrating doc ' + doc.id)
        doc.contentBackup = content;
        doc.content = new BlQuillMigrator(content).migrate();
        await this.documentationsRepository.save(doc);
      }
    }
  }

  //------------------------------------- RESOURCE VIEW -------------------------------------
  async uploadDocResourceViewFile(docId: string, file: BlFile): Promise<string>{
    file.originalname = docId + '/views/' + ClStringHelper.generateUUID() + '.json';
    return await this.objectStorageService.uploadObject([this.getBucketConfig(), this.getBackupBucketConfig()], file,
      {generateRandomObjectName: false});
  }

  async getView(filename: string): Promise<any>{
    return await this.objectStorageService.getObject(this.getBucketConfig(), filename);
  }

  //------------------------------------- DOCUMENTATION FILE -------------------------------------

  async saveFile(file: BlFile, docId: string): Promise<HnDocumentationFile> {
    const originalname = file.originalname;
    const ext = originalname.split('.').pop();
    file.originalname = docId + '/files/' + ClStringHelper.generateUUID() + '.' + ext;
    const fileName: string = await this.objectStorageService.uploadObject([this.getBucketConfig(), this.getBackupBucketConfig()], file,
      {generateRandomObjectName: false});

    const documentation: HnDocumentation = await this.findById(docId);

    const documentationFile: HnDocumentationFile = new HnDocumentationFile();
    documentationFile.initFile(documentation, originalname, fileName);

    return await this.docFileService.saveDocumentationFile(documentationFile);
  }

  async getDocFile(docFileId: string): Promise<IncomingMessage> {
    const docFile: HnDocumentationFile = await this.docFileService.getDocumentationFile(docFileId);
    if (docFile == null) {
      throw new BlBadRequestException('Document not found');
    }
    return await this.objectStorageService.getObject(this.getBucketConfig(), docFile.fileName);
  }

  async getDocFileName(docFileId: string): Promise<string> {
    const docFile: HnDocumentationFile = await this.docFileService.getDocumentationFile(docFileId);
    if (docFile == null) {
      throw new BlBadRequestException('Document not found');
    }
    return docFile.humanName;
  }

  async renameDocFile(docFileId: string, newFileName: string): Promise<HnDocumentationFile> {
    const docFile: HnDocumentationFile = await this.docFileService.getDocumentationFile(docFileId);
    if (docFile == null) {
      throw new BlBadRequestException('Document not found');
    }
    docFile.humanName = newFileName;
    return await this.docFileService.saveDocumentationFile(docFile);
  }

  async deleteDocFile(docFileId: string): Promise<void> {
    const docFile: HnDocumentationFile = await this.docFileService.getDocumentationFile(docFileId);
    if(await this.objectStorageService.deleteObjectIfExist([this.getBucketConfig(), this.getBackupBucketConfig()], docFile.fileName)){
      await this.docFileService.deleteDocumentationFile(docFile);
    }
  }
}
