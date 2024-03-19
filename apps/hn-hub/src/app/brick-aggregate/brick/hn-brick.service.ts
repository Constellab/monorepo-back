import {Injectable} from '@nestjs/common';
import {HnBrick, HnBrickVisibility} from './hn-brick.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {EntityManager, In, Repository} from 'typeorm';
import {HnDocumentation, HnDocumentationSearchDTO} from '../documentation/hn-documentation.entity';
import {HnDocumentationService} from '../documentation/hn-documentation.service';
import {HnBrickVersion, HnNewVersionDTO} from '../brick-version/hn-brick-version.entity';
import {HnBrickMajorVersionService} from '../brick-major-version/hn-brick-major-version.service';
import {HnBrickMajorVersion} from '../brick-major-version/hn-brick-major-version.entity';
import {HnBrickVersionService} from '../brick-version/hn-brick-version.service';
import {HnFolderService} from '../folder/hn-folder.service';
import {HnNode} from '../folder/hn-folder.dto';
import {HnErrorText} from '../../core/model/config/hn-error-text.class';
import {
  HnBrickListDTO,
  HnBrickVersionDownloadDTO,
  HnCreateBrickDTO,
  HnCreateTechnicalDocContent,
  HnEditBrickDTO,
  HnIsActualBrickAndNewVersionDTO,
  HnTechnicalDocInputDTO
} from './hn-brick.dto';
import {HnGeneratedDocEntity} from '../../core/model/entities/hn-generated-doc.entity';
import {HnCoreConfigService} from '../../core/modules/core-config/hn-core-config.service';
import {HnTechnicalFolderService} from '../../technical-folder/hn-technical-folder.service';
import {HnCurrentUserHelper} from '../../core/utils/hn-current-user.helper';
import {BlBadRequestException, BlUnauthorizedException} from '@monorepo/back-core-lib';
import {HnUser} from '../../users/hn-user.entity';
import {HnSpaceUserService} from '../../space-aggregate/space-user/hn-space-user.service';

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
    private configService: HnCoreConfigService,
    private spaceUserService: HnSpaceUserService) {
  }

  async create(createdBrick: HnCreateBrickDTO, entityManager: EntityManager): Promise<HnBrick> {
    if (createdBrick.name.includes(' ')) {
      throw new BlBadRequestException(HnErrorText.BRICK_NAME_INVALID);
    }

    const brickExist: HnBrick = await this.bricksRepository.findOne({where: {name: createdBrick.name}});

    if (brickExist != null) {
      throw new BlBadRequestException(HnErrorText.BRICK_ALREADY_EXIST);
    }
    const brick: HnBrick = new HnBrick();
    brick.initialize(createdBrick);

    return entityManager.save(brick);
  }

  find(): Promise<HnBrick[]> {
    return this.bricksRepository.find();
  }

  async findBrickList(): Promise<HnBrickListDTO[]> {
    let bricks: HnBrick[];
    const currentUser: HnUser = HnCurrentUserHelper.getCurrentUser();
    if (currentUser != null) {
      const userSpacesIds: string[] = (await this.spaceUserService.findActiveSpaceUsersByUserId(currentUser?.id)).map(su => su.spaceId);

      bricks = this.isCurrentAdmin() ? await this.bricksRepository.find({order: {name: 'ASC'}}) :
        await this.bricksRepository.find({
          where: [{
            brickUsers: {
              user: {
                id: HnCurrentUserHelper.getCurrentUser().id
              }
            }
          }, {
            visibility: HnBrickVisibility.PUBLIC
          },
          {
            space: In(userSpacesIds)
          }
          ],
          order: {name: 'ASC'}
        });
    } else {
      bricks = await this.bricksRepository.find({
        where: {
          visibility: HnBrickVisibility.PUBLIC
        }
      });
    }
    const res: HnBrickListDTO[] = [];
    for (const brick of bricks) {
      const resBrick = new HnBrickListDTO();
      resBrick.id = brick.id;
      resBrick.name = brick.name;
      resBrick.description = brick.description;
      resBrick.imageLink = brick.imageLink;
      resBrick.isCertified = brick.isCertified;
      resBrick.visibility = brick.visibility;
      resBrick.lastVersion = (await this.brickMajorVersionService.getLatestBrickVersion(brick.name)).version;
      resBrick.space = brick.space;
      res.push(resBrick);
    }
    return res;
  }

  async findByName(name: string): Promise<HnBrick | null> {
    const isAdmin: boolean = this.isCurrentAdmin();
    const currentUser: HnUser = HnCurrentUserHelper.getCurrentUser();
    let brick: HnBrick;
    if (currentUser != null) {
      const userSpacesIds: string[] = (await this.spaceUserService.findActiveSpaceUsersByUserId(currentUser?.id)).map(su => su.spaceId);
      brick = isAdmin ? await this.bricksRepository.findOne({
        where: {
          name: name
        }
      }) : await this.bricksRepository.findOne({
        where: [{
          name: name,
          visibility: HnBrickVisibility.PUBLIC
        }, {
          name: name,
          createdBy: {
            id: HnCurrentUserHelper.getCurrentUser().id
          }
        }, {
          name: name,
          brickUsers: {
            user: {
              id: HnCurrentUserHelper.getCurrentUser().id
            }
          }
        }, {
          name: name,
          space: In(userSpacesIds)
        }]
      });
    } else {
      brick = await this.bricksRepository.findOne({
        where: {
          name: name,
          visibility: HnBrickVisibility.PUBLIC
        }
      });
    }


    if (brick != null && (!isAdmin && brick?.createdBy?.id === HnCurrentUserHelper?.getCurrentUser()?.id)) {
      brick.gitRepo = null;
      brick.pipRepo = null;
    }

    return brick;
  }

  async findByNameCentral(name: string, version: string, centralApiKey?: string): Promise<HnBrickVersionDownloadDTO> {

    const brick: HnBrick = await this.bricksRepository.findOne({
      where: {name: name}
    });

    if (brick == null) {
      throw new BlBadRequestException(HnErrorText.BRICK_NOT_FOUND, {detailArgs: {name: name}});
    }

    // if the brick is private, it needs a valid centralApiKey
    if (brick.visibility === HnBrickVisibility.PRIVATE) {
      if (centralApiKey == null || this.configService.getCentralApiKey() !== centralApiKey) {
        throw new BlUnauthorizedException();
      }
    }

    // get the version
    const brickVersion: HnBrickVersion = await this.brickVersionService.getAndCheckBrickVersion(name, version);

    return {
      brickName: brick.name,
      brickVersion: brickVersion.version.toString(),
      repoType: brickVersion.repoType,
      repositoryUrl: brick.repositoryUrl,
      repositoryAccessUrl: brick.repositoryAccessUrl,
    };
  }

  async findById(i: string): Promise<HnBrick> {
    if (HnCurrentUserHelper.getCurrentUser() == null) {
      return this.bricksRepository.findOneBy({id: i, visibility: HnBrickVisibility.PUBLIC});
    }
    const userSpacesIds: string[] =
      (await this.spaceUserService.findActiveSpaceUsersByUserId(HnCurrentUserHelper.getCurrentUser()?.id)).map(su => su.spaceId);
    return this.isCurrentAdmin() ? this.bricksRepository.findOneBy({id: i}) :
      this.bricksRepository.findOneBy([{
        id: i,
        visibility: HnBrickVisibility.PUBLIC
      }, {
        id: i,
        createdBy: {
          id: HnCurrentUserHelper.getCurrentUser().id
        }
      }, {
        id: i,
        brickUsers: {
          user: {
            id: HnCurrentUserHelper.getCurrentUser().id
          }
        },
      },
      {
        id: i,
        space: In(userSpacesIds)
      }]);
  }

  async findBrickForInviteById(id: string): Promise<HnBrick> {
    return this.bricksRepository.findOneBy({id: id});
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
    this.checkIfUserHasRightOnTheBrick(brick);
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

    const brick: HnBrick = await this.findByName(content.brickName);

    this.checkIfUserHasRightOnTheBrick(brick);

    if (brick == null) {
      return false;
    }

    return this.brickMajorVersionService.createTechnicalDoc(brick, content.importFile);
  }

  async findTechnicalDoc(brick: HnBrick, version: string): Promise<HnNode> {
    const brickMajorVersion: HnBrickMajorVersion =
      await this.brickMajorVersionService.findBrickMajorVersionByBrickAndVersion(brick, version);
    return this.brickMajorVersionService.findTechnicalDoc(brickMajorVersion.id);
  }

  async editBrick(editedBrick: HnEditBrickDTO): Promise<HnBrick> {
    const brick: HnBrick = await this.bricksRepository.findOneBy({id: editedBrick.id});
    this.checkIfUserHasRightOnTheBrick(brick);
    if (brick) {
      brick.description = editedBrick.description;
      brick.gitRepo = editedBrick.gitRepo;
      brick.pipRepo = editedBrick.pipRepo;
      brick.visibility = editedBrick.visibility;
      brick.credentialUsername = editedBrick.credentialUsername;
      brick.credentialPassword = editedBrick.credentialPassword;
    }
    const lastBrickMajorVersion: HnBrickVersion = await this.brickMajorVersionService.getLatestBrickVersion(brick.name);
    await this.bricksRepository.save(brick);
    await this.brickVersionService.sendBrickVersionIdToTransport(lastBrickMajorVersion.id);
    return brick;
  }

  async isActualBrickAndNewVersion(content: HnIsActualBrickAndNewVersionDTO): Promise<[boolean, boolean]> {
    const brick: HnBrick = await this.findById(content.brickId);

    this.checkIfUserHasRightOnTheBrick(brick);

    if (!content.inputBrickName || (brick && brick.name.toUpperCase() != content.inputBrickName.toUpperCase())) {
      return [false, false];
    }

    const brickMajorVersion: HnBrickMajorVersion =
      await this.brickMajorVersionService.findBrickMajorVersionByBrickAndVersion(brick, content.inputBrickVersion);

    if (brickMajorVersion == null) {
      throw new BlUnauthorizedException('Impossible to create a new major version');
    }

    return this.brickVersionService.checkIfVersionExist(brickMajorVersion, content.inputBrickVersion);
  }

  async findTechDoc(input: HnTechnicalDocInputDTO): Promise<HnGeneratedDocEntity> {
    const brick: HnBrick = await this.findByName(input.brickName);
    const brickMajorVersion: HnBrickMajorVersion =
      await this.brickMajorVersionService.findBrickMajorVersionByBrickAndVersion(brick, input.brickVersion);
    return this.brickMajorVersionService.findCurrentTecDoc(brickMajorVersion, input);
  }

  async getDocsByBrickNameMajor(brickName: string, major: number): Promise<HnDocumentationSearchDTO[]> {
    return await this.brickMajorVersionService.getDocsByBrickNameMajor(await this.findByName(brickName), major);
  }

  async getDocByLink(link: string): Promise<HnDocumentationSearchDTO> {
    const linkArray: string[] = link.substring(this.configService.getFrontBaseUrl().length).split('/');
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
    return HnCurrentUserHelper.getCurrentUser()?.isAdmin();
  }

  checkIfUserHasRightOnTheBrick(brick: HnBrick): void {
    const currentUser = HnCurrentUserHelper.getCurrentUser();
    if (currentUser.id != brick.createdBy.id &&
      !brick?.brickUsers.some(bu => bu.user.id === HnCurrentUserHelper.getCurrentUser()?.id)) {
      throw new BlUnauthorizedException('You are not authorized to edit this brick');
    }
  }

  userHasRightOnBrick(brick: HnBrick): boolean {
    const currentUser = HnCurrentUserHelper.getCurrentUser();
    return currentUser.id === brick.createdBy.id ||
      brick?.brickUsers.some(bu => bu.user.id === HnCurrentUserHelper.getCurrentUser()?.id);
  }
}

