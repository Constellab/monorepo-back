import { Injectable } from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {DnBrickVersion} from './dn-brick-version.entity';
import {Repository} from 'typeorm';
import {DnFolderService} from '../folder/dn-folder.service';
import {DnBrick} from '../brick/dn-brick.entity';
import {DnNode} from '../folder/dn-folder.entity';

@Injectable()
export class DnBrickVersionService {

  constructor(
    @InjectRepository(DnBrickVersion)
    private brickVersionsRepository: Repository<DnBrickVersion>,
    private folderService: DnFolderService
  ) {
  }

  async create(brick: DnBrick, version?: number[]): Promise<void> {
    let brickVersion: DnBrickVersion = new DnBrickVersion(brick, version);
    brickVersion = await this.brickVersionsRepository.save(brickVersion);

    await this.folderService.createMainFolders(brickVersion);
  }

  async findBrickVersionByBrickAndVersion(brick: DnBrick, version?:number[]): Promise<DnBrickVersion>{
    if(version) {
      return await this.brickVersionsRepository.findOne({
        where: {
          brick: brick,
          major: version[0],
          minor: version[1],
          patch: version[2]
        }
      });
    }
    return await this.brickVersionsRepository.findOne({where: { brick: brick, isLatest: true}});
  }

  async findBrickDocsTree(brickVersion: DnBrickVersion): Promise<DnNode>{
    const mainFolder = await this.folderService.findFolderByBrickVersion(brickVersion);
    return await this.folderService.findBrickDocsTree(mainFolder);
  }

}
