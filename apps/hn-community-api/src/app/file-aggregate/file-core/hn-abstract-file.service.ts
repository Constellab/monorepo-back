import {
  BlBadRequestException,
  BlBucketConfig,
  BlEntityWithId,
  BlFile,
  BlFileResponse,
  BlImageHelper,
  BlObject,
  BlObjectStorageService,
} from '@monorepo/back-core-lib';
import { ClStringHelper } from '@monorepo/core-lib';
import { TeBlockFigureUploadedResponse } from '@monorepo/te-text-editor';
import { Logger } from '@nestjs/common';
import { EntityManager, FindOptionsWhere, Repository } from 'typeorm';

import { HnAbstractFileEntityDTO, HnUploadFileResponseDto } from './hn-abstract-file.dto';
import { HnAbstractFileEntity, HnFileType } from './hn-abstract-file.entity';

export abstract class HnAbstractFileService<T extends BlEntityWithId> {
  private logger = new Logger(HnAbstractFileService.name);

  repository: Repository<HnAbstractFileEntity<T>>;
  objectStorageService: BlObjectStorageService;

  protected constructor(
    _repository: Repository<HnAbstractFileEntity<T>>,
    _objectStorageService: BlObjectStorageService
  ) {
    this.repository = _repository;
    this.objectStorageService = _objectStorageService;
  }

  //-------------------------------------------- GLOBAL FUNCTIONS --------------------------------------------

  async getEntityFilesByEntityId(entityId: string, type?: HnFileType): Promise<HnAbstractFileEntity<T>[]> {
    const whereCondition: FindOptionsWhere<HnAbstractFileEntity<T>> = (
      type == null
        ? {
            entity: {
              id: entityId,
            },
          }
        : {
            entity: {
              id: entityId,
            },
            type: type,
          }
    ) as any;

    return await this.repository.find({
      where: whereCondition,
    });
  }

  async getEntityFile(id: string): Promise<HnAbstractFileEntity<T> | null> {
    return this.repository.findOneBy({ id: id });
  }

  async getEntityFileByEntityIdAndName(
    entityId: string,
    name: string
  ): Promise<HnAbstractFileEntity<T> | null> {
    return this.repository.findOneBy({
      entity: {
        id: entityId,
      } as any,
      name: name,
    });
  }

  async getEntityFileByFileName(fileName: string): Promise<HnAbstractFileEntity<T> | null> {
    return this.repository.findOneBy({ fileName: fileName });
  }

  async getFile(entityId: string, name: string): Promise<BlFileResponse | null> {
    const entityFile: HnAbstractFileEntity<T> | null = await this.getEntityFileByEntityIdAndName(
      entityId,
      name
    );
    if (entityFile == null) {
      return null;
    }
    const file = await this.objectStorageService.downloadObject(this.getBucketConfig(), entityFile.fileName);
    file.name = name;
    return file;
  }

  async renameFile(id: string, newName: string): Promise<HnAbstractFileEntityDTO> {
    const entityFile: HnAbstractFileEntity<T> | null = await this.getEntityFile(id);
    if (entityFile == null) {
      throw new BlBadRequestException('File not found');
    }
    entityFile.name = newName;
    return new HnAbstractFileEntityDTO(await this.repository.save(entityFile));
  }

  async deleteFile(entityId: string, name: string): Promise<void> {
    const file = await this.getEntityFileByEntityIdAndName(entityId, name);
    if (file == null) {
      throw new BlBadRequestException('File to delete not found');
    }
    if (
      await this.objectStorageService.deleteObjectIfExist(
        [this.getBucketConfig(), this.getBackupBucketConfig()],
        file.fileName
      )
    ) {
      await this.deleteEntityFile(file);
    }
  }

  async deleteEntityFile(file: HnAbstractFileEntity<T>): Promise<void> {
    await this.repository.delete(file.id);
  }

  async deleteAllEntityFiles(entityId: string, entityManager: EntityManager): Promise<void> {
    const files = await this.getEntityFilesByEntityId(entityId);
    for (const file of files) {
      try {
        if (
          await this.objectStorageService.deleteObjectIfExist(
            [this.getBucketConfig(), this.getBackupBucketConfig()],
            file.name
          )
        ) {
          await this.deleteFileWithEntityManager(file.id, entityManager);
        }
      } catch {
        throw new BlBadRequestException('Error while deleting file: ' + file.name);
      }
    }
  }

  async deleteFileWithEntityManager(fileId: string, entityManager: EntityManager): Promise<void> {
    await entityManager.delete(HnAbstractFileEntity, fileId);
  }

  abstract constructEntityFile(): HnAbstractFileEntity<T>;

  abstract getBucketConfig(): BlBucketConfig;

  abstract getBackupBucketConfig(): BlBucketConfig;

  async saveFileEntity(
    entityId: string,
    entityFile: HnAbstractFileEntity<T>,
    entityManager: EntityManager
  ): Promise<HnAbstractFileEntity<T>> {
    entityFile.name = await this.checkAndUpdateName(entityId, entityFile);
    this.logger.log('EntityFile is to save : ' + entityFile.fileName + ', ' + entityFile.entity.id);

    const saved = await entityManager.save(entityFile);
    return saved;
  }

  async save(
    entityFile: HnAbstractFileEntity<T>,
    entityManager: EntityManager
  ): Promise<HnAbstractFileEntity<T>> {
    return await entityManager.save(entityFile);
  }

  //-------------------------------------------- FILE FUNCTIONS --------------------------------------------
  async saveFile(entity: T, file: BlFile): Promise<HnUploadFileResponseDto> {
    const originalname = file.originalname;
    const ext = originalname.split('.').pop();
    file.originalname = entity.id + '/files/' + ClStringHelper.generateUUID() + '.' + ext;
    const fileName: string = await this.objectStorageService.uploadObject(
      [this.getBucketConfig(), this.getBackupBucketConfig()],
      file,
      { generateRandomObjectName: false }
    );
    const entityFile = this.constructEntityFile();
    entityFile.init(entity, fileName, HnFileType.FILE, originalname, file.size);
    entityFile.name = await this.checkAndUpdateName(entity.id, entityFile);
    const savedEntityFile = await this.repository.save(entityFile);
    return {
      id: savedEntityFile.id,
      name: savedEntityFile.name,
      size: savedEntityFile.size,
    } as HnUploadFileResponseDto;
  }

  //-------------------------------------------- IMAGE FUNCTIONS --------------------------------------------
  async saveImage(entity: T, file: BlFile): Promise<TeBlockFigureUploadedResponse> {
    const imSize = BlImageHelper.getImageSize(file);
    const fileExt = file.originalname.split('.').pop();
    const originalname = file.originalname;
    file.originalname = entity.id + '/images/' + ClStringHelper.generateUUID() + '.' + fileExt;
    const filename = await this.objectStorageService.uploadObject(
      [this.getBucketConfig(), this.getBackupBucketConfig()],
      file,
      { generateRandomObjectName: false }
    );

    const entityFile: HnAbstractFileEntity<T> = this.constructEntityFile();
    entityFile.init(entity, filename, HnFileType.IMAGE, originalname, file.size);

    entityFile.name = await this.checkAndUpdateName(entity.id, entityFile);

    const savedEntityFile = await this.repository.save(entityFile);

    return {
      filename: savedEntityFile.name,
      width: imSize.width,
      height: imSize.height,
    };
  }

  //--------------------------------------- RESOURCE VIEW FUNCTIONS
  //---------------------------------------
  async saveResourceView(entity: T, file: BlFile): Promise<string> {
    file.originalname = entity.id + '/views/' + ClStringHelper.generateUUID() + '.json';
    const filename = await this.objectStorageService.uploadObject(
      [this.getBucketConfig(), this.getBackupBucketConfig()],
      file,
      { generateRandomObjectName: false }
    );

    const entityFile = this.constructEntityFile();
    entityFile.init(
      entity,
      filename,
      HnFileType.RESOURCE_VIEW,
      ClStringHelper.generateUUID() + '.json',
      file.size
    );
    const savedEntityFile = await this.repository.save(entityFile);

    return savedEntityFile.name;
  }

  private async checkAndUpdateName(entityId: string, entityFile: HnAbstractFileEntity<T>): Promise<string> {
    let i = 1;
    const baseName = entityFile.name;
    while ((await this.getEntityFileByEntityIdAndName(entityId, entityFile.name)) != null) {
      const nameArray = baseName.split('.');
      entityFile.name = nameArray[0] + '_' + i + '.' + nameArray[1];
      i++;
    }
    return entityFile.name;
  }

  async getAllBucketItemsName(): Promise<BlObject[]> {
    return await this.objectStorageService.getAllObjectsByPrefix(this.getBucketConfig());
  }
}
