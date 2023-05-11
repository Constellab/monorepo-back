import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {HnBrickMajorVersion, HnVersionState} from './hn-brick-major-version.entity';
import {EntityManager, Repository} from 'typeorm';
import {HnFolderService} from '../folder/hn-folder.service';
import {HnBrick} from '../brick/hn-brick.entity';
import {HnBrickVersionService} from '../brick-version/hn-brick-version.service';
import {HnBrickVersion, HnNewVersionDTO} from '../brick-version/hn-brick-version.entity';
import {CmVersion} from '@monorepo/common-model';
import {HnNode} from '../folder/hn-folder.dto';
import {HnCreateBrickDTO, HnImportTechnicalDocDTO, HnTechnicalDocInputDTO} from '../brick/hn-brick.dto';
import {HnTechnicalFolderService} from '../../technical-folder/hn-technical-folder.service';
import {HnDocumentationSearchDTO} from '../documentation/hn-documentation.entity';
import {HnGeneratedDocEntity} from '../../core/model/entities/hn-generated-doc.entity';
import {BlBadRequestException} from '@monorepo/back-core-lib';

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

  async create(brick: HnBrick, createdBrick: HnCreateBrickDTO, entityManager: EntityManager): Promise<HnBrickMajorVersion> {
    const brickMajorVersion: HnBrickMajorVersion = new HnBrickMajorVersion();
    brickMajorVersion.initialize(brick, createdBrick.version.major);
    return entityManager.save(brickMajorVersion);
  }

  async findBrickMajorVersionByBrickAndVersion(brick: HnBrick, version: string): Promise<HnBrickMajorVersion> {
    let major: number;

    if (version != 'latest') {
      version = version.slice(1);
      major = +(version.split('.')[0]);
      return await this.brickMajorVersionsRepository.findOne({where: {brick: {id: brick.id}, major: major}});
    }

    return this.brickMajorVersionsRepository.findOne({
      where: {
        brick: {
          id: brick.id
        },
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
    const newMajor = parseInt(newVersion.version.split('.')[0]);
    const brickMajorVersion: HnBrickMajorVersion = await this.brickMajorVersionsRepository.findOne({
      where: {
        brick: {id: brick.id},
        major: newMajor
      }
    });
    if (brickMajorVersion == null) {
      throw new BlBadRequestException('Impossible to create a new major version');
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
    });
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

    if (brickMajorVersion == null) {
      return false;
    }

    return this.technicalFolderService.createTechnicalDoc(brickMajorVersion, importFile);
  }

  async findTechnicalDoc(brickMajorVersion: HnBrickMajorVersion): Promise<HnNode> {
    return this.technicalFolderService.findTechnicalDoc(brickMajorVersion);
  }

  async findCurrentTecDoc(brickMajorVersion: HnBrickMajorVersion, input: HnTechnicalDocInputDTO): Promise<HnGeneratedDocEntity> {
    return await this.technicalFolderService.findCurrentTecDoc(brickMajorVersion, input);
  }

  async getDocsByBrickNameMajor(brick: HnBrick, major: number): Promise<HnDocumentationSearchDTO[]> {
    let res: HnDocumentationSearchDTO[] = [];
    const brickMajorVersion: HnBrickMajorVersion = await this.brickMajorVersionsRepository.findOneBy({
      brick: {
        id: brick.id
      },
      major: major
    });
    res = res.concat(await this.folderService.getDocsByBrickNameMajor(brickMajorVersion, major.toString(), brick.name));

    res = res.concat(await this.technicalFolderService.getTechDocsByBrickNameMajor(brickMajorVersion, major.toString(), brick.name));

    return res.sort((a, b) => {
      if (a.name < b.name) return -1;
      if (b.name < a.name) return 1;
      return 0;
    });

  }

  async findBrickMajorVersionByBrickAndMajor(brick: HnBrick, major: number): Promise<HnBrickMajorVersion> {
    return this.brickMajorVersionsRepository.findOne({
      where: {
        brick: {
          id: brick.id
        },
        major: major
      },
      relations: ['brick']
    });
  }

  async findBrickMap(brick: HnBrick): Promise<string[]> {
    let brickMap: string[] = [];
    const brickMajorVersions: HnBrickMajorVersion[] = await this.brickMajorVersionsRepository.find({
      where: {
        brick: {
          id: brick.id
        }
      },
      relations: ['brick']
    });
    brickMap.push(`${brick.name}/latest`);
    brickMap.push(`${brick.name}/latest/version`);
    for (const brickMajorVersion of brickMajorVersions) {
      brickMap.push(`${brick.name}/v${brickMajorVersion.major}`);
      brickMap.push(`${brick.name}/v${brickMajorVersion.major}/version`);
      brickMap = brickMap.concat(await
      this.folderService.findBrickMajorVersionMap(brickMajorVersion, `${brick.name}/v${brickMajorVersion.major}`));
      brickMap = brickMap.concat(await
      this.technicalFolderService.findBrickMajorVersionMap(brickMajorVersion, `${brick.name}/v${brickMajorVersion.major}`));
    }
    return brickMap;
  }
}
