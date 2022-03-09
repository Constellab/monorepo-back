import {Injectable, UnauthorizedException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {HnBrickVersion, HnNewVersionDTO} from './hn-brick-version.entity';
import {Repository} from 'typeorm';
import {HnBrick} from '../brick/hn-brick.entity';
import {HnNode} from '../folder/hn-folder.entity';
import {HnBrickMajorVersion} from '../brick-major-version/hn-brick-major-version.entity';
import {BlAbstractService, BlTransportService} from '@monorepo/back-core-lib';
import {HnBrickTransportDto} from '../brick/hn-brick.dto';
import {HnCurrentUserHelper} from '../core/utils/hn-current-user.helper';
import {ClPageI} from '@monorepo/core-lib';
import {HnBrickService} from '../brick/hn-brick.service';

@Injectable()
export class HnBrickVersionService extends BlAbstractService<HnBrickVersion>{

  constructor(
    @InjectRepository(HnBrickVersion)
    private brickVersionsRepository: Repository<HnBrickVersion>,
    private transportService: BlTransportService

  ) {
    super(brickVersionsRepository, HnBrickVersion);
  }

  async create(brickVersion: HnBrickVersion): Promise<HnBrickVersion> {
    brickVersion = await this.brickVersionsRepository.save(brickVersion);

    await this.sendBrickVersionIdToTransport(brickVersion.id);
    return brickVersion;
  }


  async findBrickVersionByBrickAndVersion(brick: HnBrick, versionmajor: number): Promise<HnBrickVersion> {
    return null;
  }

  async findBrickDocsTree(brickVersion: HnBrickVersion): Promise<HnNode> {
    return null;
  }


  async findRootFolderId(brickVersion: HnBrickVersion): Promise<string> {
    return null;
  }


  async createNewBrickVersion(brickMajorVersion: HnBrickMajorVersion, newVersion: HnNewVersionDTO): Promise<void> {
    const newBrickVersion: HnBrickVersion = new HnBrickVersion();
    let version: number[] = newVersion.version.split('.').map(x => +x);
    newBrickVersion.initialize(brickMajorVersion, version, newVersion.repoType);
    await this.create(newBrickVersion);
  }

  /**
   * Send all bricks to queue
   */
  public async sendAllBrickVersionToQueue(): Promise<void> {
    const user = HnCurrentUserHelper.getAndCheckCurrentUser();

    if (!user.isAdmin()) {
      throw new UnauthorizedException('You must be an admin to synchronize the versions');
    }

    // retrieve all the versions
    const brickVersions = await this.brickVersionsRepository.find({
      relations: ['brickMajorVersion', 'brickMajorVersion.brick']
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
  private async sendBrickVersionIdToTransport(brickVersionId: string): Promise<void> {
    const brickVersion = await this.brickVersionsRepository.findOne({
      where: {
        id: brickVersionId,
      },
      relations: ['brickMajorVersion', 'brickMajorVersion.brick']
    });

    this.sendBrickVersionToTransport(brickVersion);
  }

  private sendBrickVersionToTransport(brickVersion: HnBrickVersion): void {
    const brick: HnBrickTransportDto = {
      id: brickVersion.brickMajorVersion.brick.id,
      name: brickVersion.brickMajorVersion.brick.name,
      pipRepo: brickVersion.brickMajorVersion.brick.pipRepo,
      gitRepo: brickVersion.brickMajorVersion.brick.gitRepo,
      versions: [{
        id: brickVersion.id,
        major: brickVersion.brickMajorVersion.major,
        minor: brickVersion.minor,
        patch: brickVersion.patch,
        versionState: brickVersion.brickMajorVersion.versionState,
        repoType: brickVersion.repoType
      }]
    };
    this.transportService.emit('brick', brick);
  }

  async getCurrentBrickVersion(page: number, size: number, brickId: string): Promise<ClPageI<HnBrickVersion>>{
    return this.findPaginated(page, size, {
      where: {
        brickMajorVersion: {
          brick : {
            id: brickId
          },
        }
      },
      order: {
        lastModifiedAt: 'DESC'
      },
      relations: ['brickMajorVersion']
    }
  );
  }

}
