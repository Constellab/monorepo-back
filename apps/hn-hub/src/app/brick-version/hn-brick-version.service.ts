import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {HnBrickVersion} from './hn-brick-version.entity';
import {Repository} from 'typeorm';
import {HnFolderService} from '../folder/hn-folder.service';
import {HnBrick} from '../brick/hn-brick.entity';
import {HnNode} from '../folder/hn-folder.entity';
import {HnDocumentationService} from '../documentation/hn-documentation.service';

@Injectable()
export class HnBrickVersionService {

  constructor(
    @InjectRepository(HnBrickVersion)
    private brickVersionsRepository: Repository<HnBrickVersion>,
    private folderService: HnFolderService,
    private documentationService: HnDocumentationService
  ) {
  }

  async create(brick: HnBrick, version?: number[]): Promise<void> {
    let brickVersion: HnBrickVersion = new HnBrickVersion(brick, version);
    brickVersion = await this.brickVersionsRepository.save(brickVersion);

    await this.folderService.createMainFolders(brickVersion);
  }

  async findBrickVersionByBrickAndVersion(brick: HnBrick, versionmajor: number): Promise<HnBrickVersion> {
    return await this.brickVersionsRepository.findOne({where: {brick: brick, major: versionmajor}});
  }

  async findBrickDocsTree(brickVersion: HnBrickVersion): Promise<HnNode> {
    const mainFolder = await this.folderService.findFolderByBrickVersion(brickVersion);
    return await this.folderService.findBrickDocsTree(mainFolder);
  }

}
