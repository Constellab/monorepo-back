import {BadRequestException, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {HnBrickMajorVersion, HnVersionState} from './hn-brick-major-version.entity';
import {EntityManager, Repository} from 'typeorm';
import {HnFolderService} from '../folder/hn-folder.service';
import {HnBrick} from '../brick/hn-brick.entity';
import {HnBrickVersionService} from '../brick-version/hn-brick-version.service';
import {HnBrickVersion, HnNewVersionDTO, HnRepoType} from '../brick-version/hn-brick-version.entity';
import {CmVersion} from '@monorepo/common-model';
import {HnNode} from '../folder/hn-folder.dto';
import {HnImportTechnicalDocDTO} from '../brick/hn-brick.dto';
import {HnTechnicalFolderService} from '../technical-folder/hn-technical-folder.service';
import {HnDocumentation} from '../documentation/hn-documentation.entity';

@Injectable()
export class HnBrickMajorVersionService {

  constructor(
    @InjectRepository(HnBrickMajorVersion)
    private brickMajorVersionsRepository: Repository<HnBrickMajorVersion>,
    private folderService: HnFolderService,
    private brickVersionService: HnBrickVersionService,
    private technicalFolderService: HnTechnicalFolderService
  ) {
  }

  async create(brick: HnBrick, version: CmVersion, repoType: HnRepoType, entityManager: EntityManager): Promise<HnBrickVersion> {
    let brickMajorVersion: HnBrickMajorVersion = new HnBrickMajorVersion();
    brickMajorVersion.initialize(brick, version.major);
    brickMajorVersion = await entityManager.save(brickMajorVersion);
    const cmVersion: CmVersion = version.subPatch != null ?
      new CmVersion(+version.major, +version.minor, +version.patch, +version.subPatch) :
      new CmVersion(+version.major, +version.minor, +version.patch);
    let brickVersion: HnBrickVersion = new HnBrickVersion();
    brickVersion.initialize(brickMajorVersion, cmVersion, repoType);
    brickVersion = await this.brickVersionService.createFirstBrickVersion(brickVersion, entityManager);

    await this.folderService.createMainFolders(brickMajorVersion, entityManager);

    return brickVersion;
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

  async getLatestBrickVersion(brickName: string): Promise<HnBrickVersion> {
    const brickMajorVersion: HnBrickMajorVersion = await this.brickMajorVersionsRepository.findOne({
      where: {
        brick: {
          name: brickName
        },
        versionState: HnVersionState.LATEST
      }, relations: ['brick']
    })
    return this.brickVersionService.getLatestBrickVersion(brickMajorVersion.id);
  }

  async createTechnicalDoc(brick: HnBrick, importFile: HnImportTechnicalDocDTO): Promise<boolean> {
    const importVersion: CmVersion = CmVersion.fromString(importFile.brick_version);
    const brickMajorVersion: HnBrickMajorVersion = await this.brickMajorVersionsRepository.findOne({
      where: {
        brick: {
          id: brick.id
        },
        major: importVersion.major
      }
    });

    if(brickMajorVersion == null){
      return false;
    }

    return this.technicalFolderService.createTechnicalDoc(brickMajorVersion, importFile);
  }

  async findTechnicalDoc(brickMajorVersion: HnBrickMajorVersion): Promise<HnNode>{
    return this.technicalFolderService.findTechnicalDoc(brickMajorVersion);
  }

  async findCurrentTecDoc(brickMajorVersion: HnBrickMajorVersion, path: string): Promise<HnDocumentation>{
    return await this.technicalFolderService.findCurrentTecDoc(brickMajorVersion, path);
  }
}
