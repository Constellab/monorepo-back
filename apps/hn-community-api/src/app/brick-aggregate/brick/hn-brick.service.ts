import {
  BlAbstractPaginatedService,
  BlAbstractService,
  BlBadRequestException,
  BlBucketConfig,
  BlBucketType,
  BlFile,
  BlFileResponse,
  BlImageHelper,
  BlObjectStorageService,
  BlSearchBuilder,
  BlSearchParams,
  BlSearchSortCriteria,
} from '@monorepo/back-core-lib';
import { ClPage, ClStringHelper } from '@monorepo/core-lib';
import { TeBlockFigureUploadedResponse } from '@monorepo/te-text-editor';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';

import { HnCoreConfigService } from '../../core/modules/core-config/hn-core-config.service';
import { HnBrickDto, HnEditBrickDTO } from './hn-brick.dto';
import { HnBrick, HnBrickEntity, HnBrickVisibility } from './hn-brick.entity';

@Injectable()
export class HnBrickService extends BlAbstractService<HnBrickEntity> {
  constructor(
    @InjectRepository(HnBrickEntity)
    private bricksRepository: Repository<HnBrickEntity>,
    private configService: HnCoreConfigService,
    private objectStorageService: BlObjectStorageService
  ) {
    super(bricksRepository, HnBrickEntity);
  }

  public async search(searchParams: BlSearchParams, page: number, size: number): Promise<ClPage<HnBrick>> {
    const searchBuilder = new BlSearchBuilder<HnBrickEntity>();
    searchBuilder.addSearchParams(searchParams);

    return this.findPaginated(page, size, searchBuilder.build());
  }

  find(): Promise<HnBrick[]> {
    return this.bricksRepository.find();
  }

  async findBrickList(
    whereConditions: FindOptionsWhere<HnBrickEntity>[] | FindOptionsWhere<HnBrickEntity>,
    sortsCriteria: BlSearchSortCriteria[],
    page: number,
    size: number
  ): Promise<ClPage<HnBrickDto>> {
    const order: any = sortsCriteria?.length > 0 ? {} : { createdAt: 'DESC' };
    for (const sortCriteria of sortsCriteria) {
      if (sortCriteria.key === 'title') {
        order['name'] = sortCriteria.direction;
      } else {
        order[sortCriteria.key] = sortCriteria.direction;
      }
    }

    return (
      await BlAbstractPaginatedService.findPaginatedStatic(
        page,
        size,
        {
          where: whereConditions,
          order: order,
        },
        this.bricksRepository.manager,
        HnBrickEntity
      )
    ).map((b) => new HnBrickDto(b));
  }

  async findOne(
    whereConditions: FindOptionsWhere<HnBrickEntity>[] | FindOptionsWhere<HnBrickEntity>
  ): Promise<HnBrick | null> {
    return this.bricksRepository.findOne({ where: whereConditions });
  }

  /**
   * Lightweight findOne that skips eager relations (brickUsers, createdBy, space, etc.)
   * Use this when only the brick's own columns (id, name, etc.) are needed.
   */
  async findOneLight(
    whereConditions: FindOptionsWhere<HnBrickEntity>[] | FindOptionsWhere<HnBrickEntity>
  ): Promise<HnBrick | null> {
    return this.bricksRepository.findOne({ where: whereConditions, loadEagerRelations: false });
  }

  async findByNameSpace(name: string): Promise<HnBrick | null> {
    return await this.bricksRepository.findOne({
      where: { name: name },
    });
  }

  async findBrickForInviteById(id: string): Promise<HnBrick | null> {
    return this.bricksRepository.findOneBy({ id: id });
  }

  async editBrickImage(id: string, image: BlFile): Promise<TeBlockFigureUploadedResponse> {
    const imSize = BlImageHelper.getImageSize(image);
    const fileExt = image.originalname.split('.').pop();
    image.originalname = id + '/brick-image/' + ClStringHelper.generateUUID() + '.' + fileExt;

    const filename = await this.objectStorageService.uploadObject(
      [this.getBucketConfig(), this.getBackupBucketConfig()],
      image
    );

    const brick = await this.bricksRepository.findOneBy({ id: id });
    if (!brick) {
      throw new BlBadRequestException('Brick not found');
    }
    if (brick.imageLink) {
      await this.deleteBrickImage(brick.imageLink);
    }
    brick.imageLink = filename;
    await this.bricksRepository.save(brick);

    return {
      filename: filename,
      width: imSize.width,
      height: imSize.height,
    };
  }

  async getBrickImage(filename: string): Promise<BlFileResponse> {
    return await this.objectStorageService.downloadObject(this.getBucketConfig(), filename);
  }

  async deleteBrickImage(filename: string, brickId: string | null = null): Promise<void> {
    await this.objectStorageService.deleteObjectIfExist(
      [this.getBucketConfig(), this.getBackupBucketConfig()],
      filename
    );
    if (brickId) {
      const brick = await this.bricksRepository.findOneBy({ id: brickId });
      if (!brick) {
        throw new BlBadRequestException('Brick not found');
      }
      brick.imageLink = null;
      await this.bricksRepository.save(brick);
    }
  }

  async updateLikes(brickId: string, numberOfLikes: number): Promise<void> {
    const brick = await this.bricksRepository.findOneBy({ id: brickId });
    if (!brick) {
      throw new BlBadRequestException('Brick not found');
    }
    brick.likes = numberOfLikes;
    await this.bricksRepository.save(brick, { listeners: false });
  }

  async editBrick(brick: HnBrick, editedBrick: HnEditBrickDTO): Promise<HnBrick> {
    brick.description = editedBrick.description;
    brick.gitRepo = editedBrick.gitRepo;
    brick.pipRepo = editedBrick.pipRepo;
    brick.visibility = editedBrick.visibility;
    if (brick.visibility == HnBrickVisibility.PUBLIC) {
      brick.space = null;
    } else {
      if (!editedBrick.space) {
        throw new BlBadRequestException('Private bricks must belong to a space');
      }
      brick.space = editedBrick.space;
    }
    brick.credentialUsername = editedBrick.credentialUsername;
    brick.credentialPassword = editedBrick.credentialPassword;

    return this.bricksRepository.save(brick);
  }

  private getBucketConfig(): BlBucketConfig {
    return {
      type: BlBucketType.NORMAL,
      config: {
        endpoint: this.configService.getDefaultObjectStorageEndPoint(),
        region: this.configService.getDefaultObjectStorageRegion(),
        bucket: this.configService.getDocImageObjectStorageBucket(),
        credentials: this.configService.getDefaultObjectStorageCredentials(),
        bucketType: BlBucketType.NORMAL,
      },
    };
  }

  private getBackupBucketConfig(): BlBucketConfig {
    return {
      type: BlBucketType.NORMAL,
      config: {
        endpoint: this.configService.getBackupObjectStorageEndPoint(),
        region: this.configService.getBackupObjectStorageRegion(),
        bucket: this.configService.getDocImageObjectStorageBackupBucket(),
        credentials: this.configService.getDefaultObjectStorageCredentials(),
        bucketType: BlBucketType.NORMAL,
      },
    };
  }
}
