import {Injectable} from '@nestjs/common';
import {HnBrick, HnCreateBrickDTO} from './hn-brick.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {HnBrickVersionService} from '../brick-version/hn-brick-version.service';
import {HnNode} from '../folder/hn-folder.entity';
import {HnBrickIdAndVersion, HnBrickVersion} from '../brick-version/hn-brick-version.entity';
import {HnDocumentation} from '../documentation/hn-documentation.entity';
import {HnDocumentationService} from '../documentation/hn-documentation.service';

@Injectable()
export class HnBrickService {

  constructor(
    @InjectRepository(HnBrick)
    private bricksRepository: Repository<HnBrick>,
    private brickVersionService: HnBrickVersionService,
    private documentationService: HnDocumentationService
  ) {
  }

  async create(createdBrick: HnCreateBrickDTO): Promise<HnBrick> {
    let brick: HnBrick = new HnBrick();
    if(createdBrick != null){
      brick.initialize(createdBrick.name, createdBrick.description, false);
    }

    brick = await this.bricksRepository.save(brick);

    await this.brickVersionService.create(brick, createdBrick.version);

    return brick;
  }

  async find(): Promise<HnBrick[]> {
    return this.bricksRepository.find();
  }

  async findByName(name: string): Promise<HnBrick> {
    return this.bricksRepository.findOne({
      where: {
        name: name
      }
    });
  }

  async findById(id: string): Promise<HnBrick>{
    return this.bricksRepository.findOne(id);
  }

  async findDocsByBrickAndVersion(brick: HnBrick, versionMajor: number): Promise<HnNode> {
    const brickVersion: HnBrickVersion = await this.brickVersionService.findBrickVersionByBrickAndVersion(brick, versionMajor);
    return this.brickVersionService.findBrickDocsTree(brickVersion);
  }

  async findRootFolderId(brick: HnBrick, versionMajor: number): Promise<string>{
    const brickVersion: HnBrickVersion = await this.brickVersionService.findBrickVersionByBrickAndVersion(brick, versionMajor);
    return this.brickVersionService.findRootFolderId(brickVersion);
  }

  async findCurrentDoc(brick: HnBrick, path: string, versionMajor: number): Promise<HnDocumentation> {
    const brickVersion: HnBrickVersion = await this.brickVersionService.findBrickVersionByBrickAndVersion(brick, versionMajor);
    return await this.documentationService.findCurrentDoc(brickVersion, path);
  }

  async deleteBrickById(id: string): Promise<void>{
    const brick: HnBrick = await this.bricksRepository.findOne(id);
    await this.bricksRepository.delete(brick);
  }
}

