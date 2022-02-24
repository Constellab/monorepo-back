import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {HnBrickVersion, HnNewVersionDTO} from './hn-brick-version.entity';
import {Repository} from 'typeorm';
import {HnBrick} from '../brick/hn-brick.entity';
import {HnNode} from '../folder/hn-folder.entity';
import {HnBrickMajorVersion} from '../brick-major-version/hn-brick-major-version.entity';

@Injectable()
export class HnBrickVersionService {

  constructor(
    @InjectRepository(HnBrickVersion)
    private brickVersionsRepository: Repository<HnBrickVersion>
  ) {
  }

  async create(brickVersion: HnBrickVersion): Promise<HnBrickVersion> {
    return await this.brickVersionsRepository.save(brickVersion);
  }

  async findBrickVersionByBrickAndVersion(brick: HnBrick, versionmajor: number): Promise<HnBrickVersion> {
    return null
  }

  async findBrickDocsTree(brickVersion: HnBrickVersion): Promise<HnNode> {
    return null;
  }


  async findRootFolderId(brickVersion: HnBrickVersion): Promise<string> {
    return null;
  }


  async createNewBrickVersion(brickMajorVersion: HnBrickMajorVersion, newVersion: HnNewVersionDTO): Promise<void>{
    const newBrickVersion: HnBrickVersion = new HnBrickVersion();
    let version: number[] = newVersion.version.split('.').map(x=>+x)
    newBrickVersion.initialize(brickMajorVersion, version, newVersion.repoType, newVersion.commit);
    await this.brickVersionsRepository.save(newBrickVersion);
  }
}
