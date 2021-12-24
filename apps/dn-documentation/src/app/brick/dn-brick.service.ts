import {Injectable} from '@nestjs/common';
import {DnBrick, DnCreateBrickDTO} from './dn-brick.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {DnBrickVersionService} from '../brick-version/dn-brick-version.service';
import {DnNode} from '../folder/dn-folder.entity';
import {DnBrickNameAndVersion, DnBrickVersion} from '../brick-version/dn-brick-version.entity';

@Injectable()
export class DnBrickService {

  constructor(
    @InjectRepository(DnBrick)
    private bricksRepository: Repository<DnBrick>,
    private brickVersionService: DnBrickVersionService,
  ) {
  }

  async create(createdBrick: DnCreateBrickDTO): Promise<DnBrick> {
    let brick: DnBrick = new DnBrick(createdBrick);

    brick = await this.bricksRepository.save(brick);

    await this.brickVersionService.create(brick, createdBrick.version);

    return brick;
  }

  async find(): Promise<DnBrick[]> {
    return this.bricksRepository.find();
  }

  async findByName(name: string): Promise<DnBrick> {
    return await this.bricksRepository.findOne({where: {name: name}});
  }

  async findDocsByBrickName(brickNameAndVersion: DnBrickNameAndVersion): Promise<DnNode> {
    const brick: DnBrick = await this.findByName(brickNameAndVersion.name);
    if (brickNameAndVersion.version) {
      const brickVersion: DnBrickVersion =
        await this.brickVersionService.findBrickVersionByBrickAndVersion(brick, brickNameAndVersion.version);
      return this.brickVersionService.findBrickDocsTree(brickVersion);
    }
    const brickVersion: DnBrickVersion = await this.brickVersionService.findBrickVersionByBrickAndVersion(brick);
    return this.brickVersionService.findBrickDocsTree(brickVersion);

  }
}

