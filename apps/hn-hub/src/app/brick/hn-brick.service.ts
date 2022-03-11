import {Injectable} from '@nestjs/common';
import {HnBrick, HnCreateBrickDTO} from './hn-brick.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {HnNode} from '../folder/hn-folder.entity';
import {HnDocumentation} from '../documentation/hn-documentation.entity';
import {HnDocumentationService} from '../documentation/hn-documentation.service';

import {HnBrickVersion, HnNewVersionDTO} from '../brick-version/hn-brick-version.entity';
import {HnBrickMajorVersionService} from '../brick-major-version/hn-brick-major-version.service';
import {HnBrickMajorVersion} from '../brick-major-version/hn-brick-major-version.entity';

@Injectable()
export class HnBrickService {

  constructor(
    @InjectRepository(HnBrick)
    private bricksRepository: Repository<HnBrick>,
    private brickMajorVersionService: HnBrickMajorVersionService,
    private documentationService: HnDocumentationService
  ) {
  }

  async create(createdBrick: HnCreateBrickDTO): Promise<HnBrick> {
    let brick: HnBrick = new HnBrick();
    if (createdBrick != null) {
      brick.initialize(createdBrick.name, createdBrick.description, false);
    }

    brick = await this.bricksRepository.save(brick);

    await this.brickMajorVersionService.create(brick, [1, 0, 0]);

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

  async findById(id: string): Promise<HnBrick> {
    return this.bricksRepository.findOne(id);
  }

  async findDocsByBrickAndVersion(brick: HnBrick, version: string): Promise<HnNode> {
    const brickMajorVersion: HnBrickMajorVersion =
      await this.brickMajorVersionService.findBrickMajorVersionByBrickAndVersion(brick, version);
    return this.brickMajorVersionService.findBrickDocsTree(brickMajorVersion);
  }

  async findRootFolderId(brick: HnBrick, version: string): Promise<string> {
    const brickMajorVersion: HnBrickMajorVersion =
      await this.brickMajorVersionService.findBrickMajorVersionByBrickAndVersion(brick, version);
    return this.brickMajorVersionService.findRootFolderId(brickMajorVersion);
  }

  async findCurrentDoc(brick: HnBrick, path: string, version: string): Promise<HnDocumentation> {
    const brickMajorVersion: HnBrickMajorVersion =
      await this.brickMajorVersionService.findBrickMajorVersionByBrickAndVersion(brick, version);
    return await this.documentationService.findCurrentDoc(brickMajorVersion, path);
  }

  async deleteBrickById(id: string): Promise<void> {
    const brick: HnBrick = await this.bricksRepository.findOne(id);
    await this.bricksRepository.delete(brick);
  }

  async createNewVersion(newVersion: HnNewVersionDTO): Promise<HnNewVersionDTO>{
    const brick: HnBrick = await this.bricksRepository.findOne(newVersion.brickId);
    return this.brickMajorVersionService.createNewVersion(brick, newVersion);
  }

  async getLatestBrickVersion(brickId: string): Promise<HnBrickVersion>{
    return this.brickMajorVersionService.getLatestBrickVersion(brickId);
  }
}

