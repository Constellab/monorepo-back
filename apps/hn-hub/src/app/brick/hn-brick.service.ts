import {BadRequestException, Injectable} from '@nestjs/common';
import {HnBrick, HnCreateBrickDTO} from './hn-brick.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {getManager, Repository} from 'typeorm';
import {HnDocumentation} from '../documentation/hn-documentation.entity';
import {HnDocumentationService} from '../documentation/hn-documentation.service';
import {HnBrickVersion, HnNewVersionDTO} from '../brick-version/hn-brick-version.entity';
import {HnBrickMajorVersionService} from '../brick-major-version/hn-brick-major-version.service';
import {HnBrickMajorVersion} from '../brick-major-version/hn-brick-major-version.entity';
import {HnBrickVersionService} from '../brick-version/hn-brick-version.service';
import {HnFolderService} from '../folder/hn-folder.service';
import {HnNode} from '../folder/hn-folder.dto';
import {HnErrorText} from '../core/model/config/hn-error-text.class';
import {CmVersion} from '@monorepo/common-model';
import {HnBrickListDTO, HnCreateTechnicalDocContent, HnEditBrickDTO} from './hn-brick.dto';
import {HnGeneratedDocEntity} from '../core/model/entities/hn-generated-doc.entity';

@Injectable()
export class HnBrickService {

  constructor(
    @InjectRepository(HnBrick)
    private bricksRepository: Repository<HnBrick>,
    private brickMajorVersionService: HnBrickMajorVersionService,
    private documentationService: HnDocumentationService,
    private folderService: HnFolderService,
    private brickVersionService: HnBrickVersionService
  ) {
  }

  async create(createdBrick: HnCreateBrickDTO): Promise<HnBrick> {
    let brick: HnBrick = new HnBrick();
    let brickVersion: HnBrickVersion;

    const brickExist: HnBrick = await this.bricksRepository.findOne({where: {name: createdBrick.name}});
    if(brickExist != null){
      throw new BadRequestException(HnErrorText.BRICK_ALREADY_EXIST);
    }

    if (createdBrick) {
      brick.initialize(createdBrick.name, createdBrick.description, false,createdBrick.repoPip, createdBrick.repoGit);
    }

    brick = await getManager().transaction(async entityManager => {
      brick = await entityManager.save(brick);
      if(createdBrick.isBeta) createdBrick.version.subPatch = createdBrick.subPatch;
      brickVersion = await this.brickMajorVersionService.create(brick, createdBrick.version, createdBrick.repoType, entityManager);

      return brick;
    })

    await this.brickVersionService.sendBrickVersionIdToTransport(brickVersion.id);

    return brick;
  }

  async find(): Promise<HnBrickListDTO[]> {
    const bricks: HnBrick[] = await this.bricksRepository.find();
    const res: HnBrickListDTO[] = [];
    for(const brick of bricks) {
      const resBrick = new HnBrickListDTO()
      resBrick.id = brick.id;
      resBrick.name = brick.name;
      resBrick.description = brick.description;
      resBrick.gitRepo = brick.gitRepo;
      resBrick.pipRepo = brick.pipRepo;
      resBrick.imageLink = brick.imageLink;
      resBrick.isCertified = brick.isCertified;
      resBrick.lastVersion = (await this.brickMajorVersionService.getLatestBrickVersion(brick.name)).version;
      res.push(resBrick);
    }
    return res;
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

  async findCurrentDoc(brick: HnBrick, path: string, version: string): Promise<HnDocumentation | HnGeneratedDocEntity> {
    const brickMajorVersion: HnBrickMajorVersion =
      await this.brickMajorVersionService.findBrickMajorVersionByBrickAndVersion(brick, version);
    if(path.startsWith('technical-folder')){
      return await this.brickMajorVersionService.findCurrentTecDoc(brickMajorVersion, path);
    }
    return await this.documentationService.findCurrentDoc(brickMajorVersion, path);
  }

  async findFirstDoc(brick: HnBrick, version:string): Promise<HnDocumentation>{
    const brickMajorVersion: HnBrickMajorVersion =
      await this.brickMajorVersionService.findBrickMajorVersionByBrickAndVersion(brick, version);
    return await this.folderService.findFirstDoc(brickMajorVersion);
  }

  async deleteBrickById(id: string): Promise<void> {
    const brick: HnBrick = await this.bricksRepository.findOne(id);
    await this.bricksRepository.delete(brick);
  }

  async createNewVersion(newVersion: HnNewVersionDTO): Promise<HnNewVersionDTO>{
    const brick: HnBrick = await this.bricksRepository.findOne(newVersion.brickId);
    return this.brickMajorVersionService.createNewVersion(brick, newVersion);
  }

  async getLatestBrickVersion(brickName: string): Promise<HnBrickVersion>{
    return this.brickMajorVersionService.getLatestBrickVersion(brickName);
  }

  async createTechnicalDoc(content: HnCreateTechnicalDocContent): Promise<boolean>{
    if(content.brickName.toUpperCase() !== content.importFile.brick_name.toUpperCase()){
      return false;
    }

    const brick: HnBrick = await this.bricksRepository.findOne({where: {name: content.brickName}});

    if(brick == null){
      return false;
    }

    return this.brickMajorVersionService.createTechnicalDoc(brick, content.importFile);
  }

  async findTechnicalDoc(brick: HnBrick, version: string): Promise<HnNode> {
    const brickMajorVersion: HnBrickMajorVersion =
      await this.brickMajorVersionService.findBrickMajorVersionByBrickAndVersion(brick, version);
    return this.brickMajorVersionService.findTechnicalDoc(brickMajorVersion);
  }

  async editBrick(editedBrick: HnEditBrickDTO): Promise<HnBrick>{
    const brick: HnBrick = await this.bricksRepository.findOne(editedBrick.id);
    if(brick){
      brick.description = editedBrick.description;
      brick.gitRepo = editedBrick.gitRepo;
      brick.pipRepo = editedBrick.pipRepo;
    }
    this.bricksRepository.save(brick);
    return brick;
  }
}

