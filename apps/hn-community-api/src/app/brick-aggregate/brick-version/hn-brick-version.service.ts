import {
  BL_TRANSPORT_COMMUNITY_BRICK_QUEUE,
  BlAbstractPaginatedService,
  BlAbstractService,
  BlUnauthorizedException,
  BlVersion,
} from '@monorepo/back-core-lib';
import { ClPage, ClStringHelper } from '@monorepo/core-lib';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { EntityManager, IsNull, Repository } from 'typeorm';

import {
  HnBrickVersionReference,
  HnBrickVersionRefState,
} from '../../brick-version-reference/hn-brick-version-reference.entity';
import { HnBrickVersionReferenceService } from '../../brick-version-reference/hn-brick-version-reference.service';
import { HnErrorText } from '../../core/model/config/hn-error-text.class';
import { HnCurrentUserHelper } from '../../core/utils/hn-current-user.helper';
import { HnBrickTransportDto, HnIsActualBrickAndNewVersionResponseDTO } from '../brick/hn-brick.dto';
import { HnBrickMajorVersion, HnVersionState } from '../brick-major-version/hn-brick-major-version.entity';
import { HnBrickVersionDto } from './hn-brick-version.dto';
import { HnBrickVersion, HnNewVersionDTO, HnReferenceDTO, HnVersionType } from './hn-brick-version.entity';

@Injectable()
export class HnBrickVersionService extends BlAbstractService<HnBrickVersion> {
  private readonly logger = new Logger(HnBrickVersionService.name);
  constructor(
    @InjectRepository(HnBrickVersion)
    private brickVersionsRepository: Repository<HnBrickVersion>,
    @InjectQueue(BL_TRANSPORT_COMMUNITY_BRICK_QUEUE) private queue: Queue,
    private brickVersionReferenceService: HnBrickVersionReferenceService
  ) {
    super(brickVersionsRepository, HnBrickVersion);
  }

  async create(brickVersion: HnBrickVersion): Promise<HnBrickVersion> {
    brickVersion = await this.brickVersionsRepository.save(brickVersion);
    await this.sendBrickVersionIdToTransport(brickVersion.id);
    return brickVersion;
  }

  async createNewBrickVersion(
    brickMajorVersion: HnBrickMajorVersion,
    newVersion: HnNewVersionDTO,
    entityManager: EntityManager
  ): Promise<HnBrickVersion> {
    const res = await this.upsertBrickVersion(brickMajorVersion, newVersion, entityManager);
    await this.createReferences(res, newVersion.references, entityManager);
    return res;
  }

  private async upsertBrickVersion(
    brickMajorVersion: HnBrickMajorVersion,
    newVersion: HnNewVersionDTO,
    em: EntityManager
  ): Promise<HnBrickVersion> {
    const version: BlVersion = BlVersion.fromString(newVersion.version);

    const existing: HnBrickVersion = await this.brickVersionsRepository.findOne({
      where: {
        brickMajorVersion: { id: brickMajorVersion.id },
        minor: version.minor,
        patch: version.patch,
        versionType: version.isBeta() ? HnVersionType.BETA : HnVersionType.NORMAL,
        subPatch: version.isBeta() ? version.subPatch : IsNull(),
      },
    });

    if (existing) {
      existing.initialize(brickMajorVersion, version, newVersion.repoType, newVersion.technicalInfo);
      const saved = await em.save(existing);
      await this.brickVersionReferenceService.deleteByBrickVersionId(saved.id, em);
      return saved;
    }

    const newBrickVersion = new HnBrickVersion();
    newBrickVersion.initialize(brickMajorVersion, version, newVersion.repoType, newVersion.technicalInfo);
    return em.save(newBrickVersion);
  }

  async findByNameAndVersion(brickName: string, versionStr: string): Promise<HnBrickVersion | null> {
    const version: BlVersion = BlVersion.fromString(versionStr);
    return this.brickVersionsRepository.findOne({
      where: {
        brickMajorVersion: {
          brick: { name: brickName },
          major: version.major,
        },
        minor: version.minor,
        patch: version.patch,
        versionType: version.isBeta() ? HnVersionType.BETA : HnVersionType.NORMAL,
        subPatch: version.isBeta() ? version.subPatch : IsNull(),
      },
    });
  }

  private async createReferences(
    brickVersion: HnBrickVersion,
    references: HnReferenceDTO[] | undefined,
    em: EntityManager
  ): Promise<void> {
    if (!references || references.length === 0) {
      return;
    }

    const seenNames = new Set<string>();

    for (const ref of references) {
      if (seenNames.has(ref.name)) {
        throw new BlUnauthorizedException(`There is more than one reference of the brick ${ref.name}`);
      }
      seenNames.add(ref.name);

      const referencedBrickVersion = await this.findByNameAndVersion(ref.name, ref.version);

      if (!referencedBrickVersion) {
        throw new BlUnauthorizedException(
          `The referenced brick ${ref.name} with the version ${ref.version} is not in community`
        );
      }

      const brickVersionRef = new HnBrickVersionReference();
      brickVersionRef.brickVersion = brickVersion;
      brickVersionRef.reference = referencedBrickVersion;
      brickVersionRef.versionState = HnBrickVersionRefState.DIRECT;
      await em.save(brickVersionRef);
    }
  }

  /**
   * Send all bricks to queue
   */
  public async sendAllBrickVersionToQueue(): Promise<void> {
    const user = HnCurrentUserHelper.getAndCheckCurrentUser();

    if (!user.isAdmin()) {
      throw new BlUnauthorizedException('You must be an admin to synchronize the versions');
    }

    // retrieve all the versions
    const brickVersions = await this.brickVersionsRepository.find({
      relations: { brickMajorVersion: { brick: true } },
    });

    for (const brickVersion of brickVersions) {
      this.sendBrickVersionToTransport(brickVersion);
    }
  }

  /**
   * Method to send the brick version into the transport when creating or updating a version
   * @param brickVersionId
   * @private
   */
  async sendBrickVersionIdToTransport(brickVersionId: string): Promise<void> {
    const brickVersion = await this.brickVersionsRepository.findOne({
      where: {
        id: brickVersionId,
      },
      relations: { brickMajorVersion: { brick: true } },
    });

    this.sendBrickVersionToTransport(brickVersion);
  }

  async getCurrentBrickVersion(
    page: number,
    size: number,
    brickId: string,
    hasRight: boolean = false
  ): Promise<ClPage<HnBrickVersionDto>> {
    return (
      await BlAbstractPaginatedService.findPaginatedStatic(
        page,
        size,
        {
          where: {
            brickMajorVersion: {
              brick: {
                id: brickId,
              },
            },
          },
          order: {
            minor: 'DESC',
            patch: 'DESC',
            versionType: 'ASC',
            subPatch: 'DESC',
          },
          relations: { brickMajorVersion: true },
        },
        this.brickVersionsRepository.manager,
        HnBrickVersion
      )
    ).map((b) => {
      if (!hasRight && HnCurrentUserHelper.getCurrentUser()?.isAdmin()) {
        if (b.technicalInfo) {
          for (const tInfoKey of Object.keys(b.technicalInfo)) {
            if (ClStringHelper.isHttpLink(b.technicalInfo[tInfoKey])) {
              b.technicalInfo[tInfoKey] = null;
            }
          }
        }
      }
      return new HnBrickVersionDto(b);
    });
  }

  async getLatestBrickVersion(brickMajorVersionId: string): Promise<HnBrickVersion> {
    return this.brickVersionsRepository.findOne({
      where: {
        brickMajorVersion: {
          id: brickMajorVersionId,
        },
      },
      order: {
        versionType: 'ASC',
        minor: 'DESC',
        patch: 'DESC',
      },
    });
  }

  async checkIfVersionExist(
    brickMajorVersion: HnBrickMajorVersion,
    version: string
  ): Promise<HnIsActualBrickAndNewVersionResponseDTO> {
    const v: BlVersion = BlVersion.fromString(version);
    const bv: HnBrickVersion = await this.brickVersionsRepository.findOne({
      where: {
        brickMajorVersion: {
          id: brickMajorVersion.id,
        },
        minor: v.minor,
        patch: v.patch,
        versionType: v.isBeta() ? HnVersionType.BETA : HnVersionType.NORMAL,
        subPatch: v.isBeta() ? v.subPatch : IsNull(),
      },
    });
    if (bv && bv.version.major != v.major) {
      throw new BlUnauthorizedException('Impossible to create a new major version');
    }
    return {
      sameBrick: true,
      sameVersion: bv != null,
    };
  }

  async findDirectReferences(id: string): Promise<HnBrickVersionReference[]> {
    return await this.brickVersionReferenceService.findByBrickVersionId(id);
  }

  async findAllReferences(id: string, isUndirect?: boolean): Promise<HnBrickVersionReference[]> {
    const res: HnBrickVersionReference[] = await this.findDirectReferences(id);
    if (res.length == 0) {
      return res;
    } else {
      for (const bVR of res) {
        if (isUndirect) {
          bVR.versionState = HnBrickVersionRefState.INDIRECT;
        }
        res.push(...(await this.findAllReferences(bVR.referenceId, true)));
      }
      return res;
    }
  }

  async getDirectReferences(id: string): Promise<HnReferenceDTO[]> {
    const res: HnReferenceDTO[] = [];
    for (const bVR of await this.findDirectReferences(id)) {
      res.push(await this.bVRToRef(bVR));
    }
    return res;
  }

  async getAllReferences(id: string): Promise<HnReferenceDTO[]> {
    const res: HnReferenceDTO[] = [];
    for (const bVR of await this.findAllReferences(id)) {
      res.push(await this.bVRToRef(bVR));
    }
    return res.filter(function (value, index, array) {
      let t = true;
      for (const e of array) {
        if (e.name == value.name && array.indexOf(e) != index) {
          t = BlVersion.fromString(e.version) < BlVersion.fromString(value.version);
        }
      }
      return t;
    });
  }

  async bVRToRef(bVR: HnBrickVersionReference): Promise<HnReferenceDTO> {
    return {
      name: await this.getBrickName(bVR.referenceId),
      version: (await this.brickVersionsRepository.findOneBy({ id: bVR.referenceId })).version.toString(),
      referenceState: bVR.versionState,
    };
  }

  async getBrickName(id: string): Promise<string> {
    return (await this.brickVersionsRepository.findOneBy({ id: id })).brickMajorVersion.brick.name;
  }

  private sendBrickVersionToTransport(brickVersion: HnBrickVersion): void {
    const brick: HnBrickTransportDto = {
      id: brickVersion.brickMajorVersion.brick.id,
      name: brickVersion.brickMajorVersion.brick.name,
      pipRepo: brickVersion.brickMajorVersion.brick.pipRepo,
      gitRepo: brickVersion.brickMajorVersion.brick.gitRepo,
      visibility: brickVersion.brickMajorVersion.brick.visibility,
      versions: [
        {
          id: brickVersion.id,
          major: brickVersion.brickMajorVersion.major,
          minor: brickVersion.minor,
          patch: brickVersion.patch,
          versionType: brickVersion.versionType,
          subPatch: brickVersion.subPatch,
          versionState: brickVersion.brickMajorVersion.versionState,
          repoType: brickVersion.repoType,
          technicalInfo: brickVersion.technicalInfo,
        },
      ],
    };
    this.queue.add('brick', brick).catch((err) => {
      this.logger.error('Error sending brick version to transport queue', err);
    });
  }

  public async getAndCheckBrickVersion(brickName: string, versionStr: string): Promise<HnBrickVersion> {
    if (versionStr == 'latest') {
      return await this.brickVersionsRepository.findOne({
        where: {
          brickMajorVersion: {
            brick: {
              name: brickName,
            },
            versionState: HnVersionState.LATEST,
          },
        },
        order: {
          minor: 'DESC',
          patch: 'DESC',
        },
      });
    }
    const brickVersion = await this.findByNameAndVersion(brickName, versionStr);

    if (!brickVersion) {
      throw new BlUnauthorizedException(HnErrorText.BRICK_VERSION_NOT_FOUND, {
        detailArgs: { name: brickName, version: versionStr },
      });
    }
    return brickVersion;
  }

  public async getVersionsList(brickId: string): Promise<string[]> {
    const brickVersions = await this.brickVersionsRepository.find({
      where: {
        brickMajorVersion: {
          brick: {
            id: brickId,
          },
        },
      },
      order: {
        brickMajorVersion: {
          major: 'DESC',
        },
        minor: 'DESC',
        patch: 'DESC',
        versionType: 'ASC',
        subPatch: 'DESC',
      },
    });
    return brickVersions.map((bv) => bv.version.toString());
  }
}
