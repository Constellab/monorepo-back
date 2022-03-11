import {BadRequestException, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {HnBrickMajorVersion, HnVersionState} from './hn-brick-major-version.entity';
import {Repository} from 'typeorm';
import {HnFolderService} from '../folder/hn-folder.service';
import {HnBrick} from '../brick/hn-brick.entity';
import {HnNode} from '../folder/hn-folder.entity';
import {HnBrickVersionService} from '../brick-version/hn-brick-version.service';
import {HnBrickVersion, HnNewVersionDTO} from '../brick-version/hn-brick-version.entity';

@Injectable()
export class HnBrickMajorVersionService {

  constructor(
    @InjectRepository(HnBrickMajorVersion)
    private brickMajorVersionsRepository: Repository<HnBrickMajorVersion>,
    private folderService: HnFolderService,
    private brickVersionService: HnBrickVersionService
  ) {
  }

  async create(brick: HnBrick, version: number[]): Promise<void> {
    let brickMajorVersion: HnBrickMajorVersion = new HnBrickMajorVersion();
    brickMajorVersion.initialize(brick, version[0]);
    brickMajorVersion = await this.brickMajorVersionsRepository.save(brickMajorVersion);

    const brickVersion: HnBrickVersion = new HnBrickVersion();
    brickVersion.initialize(brickMajorVersion, version);
    await this.brickVersionService.create(brickVersion);

    await this.folderService.createMainFolders(brickMajorVersion);
  }

  async findBrickMajorVersionByBrickAndVersion(brick: HnBrick, version: string): Promise<HnBrickMajorVersion> {
    let major: string;

    if (version != 'latest') {
      version = version.slice();
      major = version.split('.')[0]
      return await this.brickMajorVersionsRepository.findOne({where: {brick: brick, major: major}})
    }

    return await this.brickMajorVersionsRepository.findOne({
      where: {
        brick: brick,
        versionState: HnVersionState.LATEST
      }
    });
  }

  async findBrickDocsTree(brickMajorVersion: HnBrickMajorVersion): Promise<HnNode> {
    const mainFolder = await this.folderService.findFolderByBrickMajorVersion(brickMajorVersion);
    return await this.folderService.findBrickDocsTree(mainFolder);
  }


  async findRootFolderId(brickMajorVersion: HnBrickMajorVersion): Promise<string> {
    const mainFolder = await this.folderService.findFolderByBrickMajorVersion(brickMajorVersion);
    return mainFolder.id;
  }

  // async createNewBrickMajorVersion(newMajor: number, brick: HnBrick): Promise<HnBrickMajorVersion>{
  //   const newBrickMajorVersion: HnBrickMajorVersion = new HnBrickMajorVersion();
  //   newBrickMajorVersion.initialize(brick, newMajor);
  // }

  async createNewVersion(brick: HnBrick, newVersion: HnNewVersionDTO): Promise<HnNewVersionDTO> {
    const newMajor = newVersion.version.split('.')[0];
    const brickMajorVersion: HnBrickMajorVersion = await this.brickMajorVersionsRepository.findOne({
      where: {
        brick: brick,
        major: newMajor
      }
    });
    if (brickMajorVersion == null) {
      throw new BadRequestException('Impossible to create a new major version')
      //let brickMajorVersion: HnBrickMajorVersion = await this.createNewBrickMajorVersion(+newMajor, brick);
    }
    await this.brickVersionService.createNewBrickVersion(brickMajorVersion, newVersion);
    return newVersion;
  }

  async getLatestBrickVersion(brickId: string): Promise<HnBrickVersion>{
    const brickMajorVersion: HnBrickMajorVersion = await this.brickMajorVersionsRepository.findOne({
      where: {
        brick: {
          id : brickId
        },
        versionState : HnVersionState.LATEST
      }
    });
    return this.brickVersionService.getLatestBrickVersion(brickMajorVersion.id);
  }
}
