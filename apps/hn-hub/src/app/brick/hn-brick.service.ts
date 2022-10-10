import {BadRequestException, Injectable, UnauthorizedException} from '@nestjs/common';
import {HnBrick, HnBrickVisibility, HnCreateBrickDTO} from './hn-brick.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {getManager, Repository} from 'typeorm';
import {HnDocumentation, HnDocumentationSearchDTO} from '../documentation/hn-documentation.entity';
import {HnDocumentationService} from '../documentation/hn-documentation.service';
import {HnBrickVersion, HnNewVersionDTO} from '../brick-version/hn-brick-version.entity';
import {HnBrickMajorVersionService} from '../brick-major-version/hn-brick-major-version.service';
import {HnBrickMajorVersion} from '../brick-major-version/hn-brick-major-version.entity';
import {HnBrickVersionService} from '../brick-version/hn-brick-version.service';
import {HnFolderService} from '../folder/hn-folder.service';
import {HnNode} from '../folder/hn-folder.dto';
import {HnErrorText} from '../core/model/config/hn-error-text.class';
import {
  HnBrickListDTO,
  HnCreateTechnicalDocContent,
  HnEditBrickDTO,
  HnIsActualBrickAndNewVersionDTO,
  HnTechnicalDocInputDTO
} from './hn-brick.dto';
import {HnGeneratedDocEntity} from '../core/model/entities/hn-generated-doc.entity';
import {HnCoreConfigService} from '../core/modules/core-config/hn-core-config.service';
import {HnTechnicalFolderService} from '../technical-folder/hn-technical-folder.service';
import {HnUserService} from '../users/hn-user.service';
import {HnCurrentUserHelper} from '../core/utils/hn-current-user.helper';

@Injectable()
export class HnBrickService {

  constructor(
    @InjectRepository(HnBrick)
    private bricksRepository: Repository<HnBrick>,
    private brickMajorVersionService: HnBrickMajorVersionService,
    private documentationService: HnDocumentationService,
    private folderService: HnFolderService,
    private brickVersionService: HnBrickVersionService,
    private technicalFolderService: HnTechnicalFolderService,
    private userService: HnUserService,
    private configService: HnCoreConfigService
  ) {
  }

  async create(createdBrick: HnCreateBrickDTO): Promise<HnBrick> {
    let brick: HnBrick = new HnBrick();
    let brickVersion: HnBrickVersion;

    const brickExist: HnBrick = await this.bricksRepository.findOne({where: {name: createdBrick.name}});
    if (brickExist != null) {
      throw new BadRequestException(HnErrorText.BRICK_ALREADY_EXIST);
    }

    if (createdBrick) {
      brick.initialize(createdBrick.name, createdBrick.description, false,
        createdBrick.visibility, createdBrick.repoPip, createdBrick.repoGit);
    }

    brick = await getManager().transaction(async entityManager => {
      brick = await entityManager.save(brick);
      if (createdBrick.isBeta) createdBrick.version.subPatch = createdBrick.subPatch;
      brickVersion = await this.brickMajorVersionService.create(brick, createdBrick, entityManager);


      return brick;
    });

    await this.brickVersionService.sendBrickVersionIdToTransport(brickVersion.id);

    return brick;
  }

  async find(): Promise<HnBrickListDTO[]> {
    const bricks: HnBrick[] = this.isCurrentAdmin() ? await this.bricksRepository.find() :
      await this.bricksRepository.find({where: {visibility: HnBrickVisibility.PUBLIC}});
    const res: HnBrickListDTO[] = [];
    for (const brick of bricks) {
      const resBrick = new HnBrickListDTO();
      resBrick.id = brick.id;
      resBrick.name = brick.name;
      resBrick.description = brick.description;
      resBrick.gitRepo = brick.gitRepo;
      resBrick.pipRepo = brick.pipRepo;
      resBrick.imageLink = brick.imageLink;
      resBrick.isCertified = brick.isCertified;
      resBrick.visibility = brick.visibility;
      resBrick.lastVersion = (await this.brickMajorVersionService.getLatestBrickVersion(brick.name)).version;
      res.push(resBrick);
    }
    return res;
  }

  async findByName(name: string): Promise<HnBrick> {
    const isAdmin: boolean = this.isCurrentAdmin();
    const brick: HnBrick = isAdmin ? await this.bricksRepository.findOne({
      where: {
        name: name
      }
    }) : await this.bricksRepository.findOne({
      where: {
        name: name,
        visibility: HnBrickVisibility.PUBLIC
      }
    });

    if (!isAdmin) {
      brick.gitRepo = null;
      brick.pipRepo = null;
    }

    return brick;

  }

  async findById(id: string): Promise<HnBrick> {
    return this.isCurrentAdmin() ? this.bricksRepository.findOneBy({id: id}) :
      this.bricksRepository.findOneBy({id: id, visibility: HnBrickVisibility.PUBLIC});
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
    return await this.documentationService.findCurrentDoc(brickMajorVersion, path);
  }

  async findFirstDoc(brick: HnBrick, version: string): Promise<HnDocumentation> {
    const brickMajorVersion: HnBrickMajorVersion =
      await this.brickMajorVersionService.findBrickMajorVersionByBrickAndVersion(brick, version);
    return await this.folderService.findFirstDoc(brickMajorVersion);
  }

  async createNewVersion(newVersion: HnNewVersionDTO): Promise<HnNewVersionDTO> {
    const brick: HnBrick = await this.bricksRepository.findOneBy({id: newVersion.brickId});
    newVersion.repoType = (await this.getLatestBrickVersion(brick.name)).repoType;
    return this.brickMajorVersionService.createNewVersion(brick, newVersion);
  }

  async getLatestBrickVersion(brickName: string): Promise<HnBrickVersion> {
    return this.brickMajorVersionService.getLatestBrickVersion(brickName);
  }

  async createTechnicalDoc(content: HnCreateTechnicalDocContent): Promise<boolean> {
    if (content.brickName.toUpperCase() !== content.importFile.brick_name.toUpperCase()) {
      return false;
    }

    const brick: HnBrick = this.isCurrentAdmin() ?
      await this.bricksRepository.findOne({where: {name: content.brickName}}) :
      await this.bricksRepository.findOne({where: {name: content.brickName, visibility: HnBrickVisibility.PUBLIC}});

    if (brick == null) {
      return false;
    }

    return this.brickMajorVersionService.createTechnicalDoc(brick, content.importFile);
  }

  async findTechnicalDoc(brick: HnBrick, version: string): Promise<HnNode> {
    const brickMajorVersion: HnBrickMajorVersion =
      await this.brickMajorVersionService.findBrickMajorVersionByBrickAndVersion(brick, version);
    return this.brickMajorVersionService.findTechnicalDoc(brickMajorVersion);
  }

  async editBrick(editedBrick: HnEditBrickDTO): Promise<HnBrick> {
    const brick: HnBrick = await this.bricksRepository.findOneBy({id: editedBrick.id});
    if (brick) {
      brick.description = editedBrick.description;
      brick.gitRepo = editedBrick.gitRepo;
      brick.pipRepo = editedBrick.pipRepo;
      brick.visibility = editedBrick.visibility;
    }
    const lastBrickMajorVersion: HnBrickVersion = await this.brickMajorVersionService.getLatestBrickVersion(brick.name);
    await this.bricksRepository.save(brick);
    await this.brickVersionService.sendBrickVersionIdToTransport(lastBrickMajorVersion.id);
    return brick;
  }

  async isActualBrickAndNewVersion(content: HnIsActualBrickAndNewVersionDTO): Promise<[boolean, boolean]> {
    const brick: HnBrick = this.isCurrentAdmin() ? await this.bricksRepository.findOneBy({id: content.brickId}) :
      await this.bricksRepository.findOneBy({id: content.brickId, visibility: HnBrickVisibility.PUBLIC});

    if (!content.inputBrickName || (brick && brick.name.toUpperCase() != content.inputBrickName.toUpperCase())) {
      return [false, false];
    }

    const brickMajorVersion: HnBrickMajorVersion =
      await this.brickMajorVersionService.findBrickMajorVersionByBrickAndVersion(brick, content.inputBrickVersion);

    if (brickMajorVersion == null) {
      throw new UnauthorizedException('Impossible to create a new major version');
    }

    return this.brickVersionService.checkIfVersionExist(brickMajorVersion, content.inputBrickVersion);
  }

  async findTechDoc(input: HnTechnicalDocInputDTO): Promise<HnGeneratedDocEntity> {
    const brick: HnBrick = this.isCurrentAdmin() ? await this.bricksRepository.findOne({where: {name: input.brickName}}) :
      await this.bricksRepository.findOne({where: {name: input.brickName, visibility: HnBrickVisibility.PUBLIC}});
    const brickMajorVersion: HnBrickMajorVersion =
      await this.brickMajorVersionService.findBrickMajorVersionByBrickAndVersion(brick, input.brickVersion);
    return this.brickMajorVersionService.findCurrentTecDoc(brickMajorVersion, input);
  }

  async getDocsByBrickNameMajor(brickName: string, major: number): Promise<HnDocumentationSearchDTO[]> {
    return await this.brickMajorVersionService.getDocsByBrickNameMajor(await this.findByName(brickName), major);
  }

  async getDocByLink(link: string): Promise<HnDocumentationSearchDTO> {
    const linkArray: string[] = link.substring(this.configService.getFrontRootUrl().length).split('/');
    try {
      const brick: HnBrick = await this.findByName(linkArray[1]);
      const majorString: string = linkArray[2] != 'latest' ? linkArray[2].substring(1) : linkArray[2];
      let major: number;
      if (majorString === 'latest') {
        major = (await this.brickMajorVersionService.getLatestBrickVersion(linkArray[1])).version.major;
      } else {
        major = +majorString;
      }
      const isTechnical: boolean = linkArray[4] == 'technical-folder';
      let completePath: string = linkArray.slice(4).join('/');
      let anchor: string = null;
      if (completePath.includes('#')) {
        [completePath, anchor] = completePath.split('#');
      }

      completePath = completePath + '/';

      const brickMajorVersion: HnBrickMajorVersion = await this.brickMajorVersionService.findBrickMajorVersionByBrickAndMajor(brick, major);

      return isTechnical ? this.technicalFolderService.getTechDocByLink(brickMajorVersion, completePath, anchor)
        : this.documentationService.getDocByLink(brickMajorVersion, completePath, anchor);
    } catch (e) {
      return null;
    }
  }

  private isCurrentAdmin(): boolean {
    return HnCurrentUserHelper.getCurrentUser() && HnCurrentUserHelper.getCurrentUser().isAdmin();
  }

}

