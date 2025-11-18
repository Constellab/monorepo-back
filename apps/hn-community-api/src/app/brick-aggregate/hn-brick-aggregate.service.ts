import {
  BlBadRequestException,
  BlFile,
  BlFileResponse,
  BlNotFoundException,
  BlSearchParams,
  BlSearchSortCriteria,
  BlUnauthorizedException,
  BlVersion,
} from '@monorepo/back-core-lib';
import { ClPage, ClStringHelper } from '@monorepo/core-lib';
import {
  TeBlockFigureUploadedResponse,
  TeRichText,
  TeRichTextAggregate,
  TeRichTextBlockModificationWithUser,
} from '@monorepo/te-text-editor';
import { Injectable } from '@nestjs/common';
import { DataSource, FindOptionsWhere, In, IsNull, Like } from 'typeorm';

import { HnErrorText } from '../core/model/config/hn-error-text.class';
import { HnSiteMapEnumChangefreq, HnSitemapItemBase } from '../core/model/config/hn-site-map.class';
import { HnGeneratedDocDto } from '../core/model/entities/hn-generated-doc.dto';
import { HnCoreConfigService } from '../core/modules/core-config/hn-core-config.service';
import { HnFrontService } from '../core/service/hn-front.service';
import { HnCurrentUserHelper } from '../core/utils/hn-current-user.helper';
import { HnMarkdownHelper } from '../core/utils/hn-markdown.helper';
import { HnMarkdownFile, HnZipHelper } from '../core/utils/hn-zip.helper';
import {
  HnAbstractFileEntityDTO,
  HnUploadFileResponseDto,
} from '../file-aggregate/file-core/hn-abstract-file.dto';
import { HnFileDocumentationService } from '../file-aggregate/file-documentation/hn-file-documentation.service';
import { HnSpaceAggregateService } from '../space-aggregate/hn-space-aggregate.service';
import { HnSpaceUserService } from '../space-aggregate/space-user/hn-space-user.service';
import { HnTechnicalFolderService } from '../technical-folder/hn-technical-folder.service';
import { HnUser } from '../users/hn-user.entity';
import { HnUserService } from '../users/hn-user.service';
import {
  HnBrickDto,
  HnBrickVersionDownloadDTO,
  HnCreateBrickDTO,
  HnCreateTechnicalDocContent,
  HnEditBrickDTO,
  HnIsActualBrickAndNewVersionDTO,
  HnTechnicalDocInputDTO,
} from './brick/hn-brick.dto';
import { HnBrick, HnBrickVisibility } from './brick/hn-brick.entity';
import { HnBrickService } from './brick/hn-brick.service';
import { HnBrickMajorVersion } from './brick-major-version/hn-brick-major-version.entity';
import { HnBrickMajorVersionService } from './brick-major-version/hn-brick-major-version.service';
import { HnBrickUser } from './brick-user/hn-brick-user.entity';
import { HnBrickUserService } from './brick-user/hn-brick-user.service';
import { HnBrickUserInviteDto } from './brick-user-invite/hn-brick-user-invite.dto';
import { HnBrickUserInvite } from './brick-user-invite/hn-brick-user-invite.entity';
import { HnBrickUserInviteService } from './brick-user-invite/hn-brick-user-invite.service';
import { HnBrickVersionDto } from './brick-version/hn-brick-version.dto';
import { HnBrickVersion, HnNewVersionDTO, HnReferenceDTO } from './brick-version/hn-brick-version.entity';
import { HnBrickVersionService } from './brick-version/hn-brick-version.service';
import { HnDocumentationDto } from './documentation/hn-documentation.dto';
import {
  HnDocumentation,
  HnDocumentationDTO,
  HnDocumentationSearchDTO,
} from './documentation/hn-documentation.entity';
import { HnDocumentationService } from './documentation/hn-documentation.service';
import { HnFolderDto, HnNode, HnNodeDTO, HnNodeType } from './folder/hn-folder.dto';
import { HnFolder } from './folder/hn-folder.entity';
import { HnFolderService } from './folder/hn-folder.service';

export interface HnBrickUserBasedWhereOptionalParams {
  spacesFilter?: string[];
  user?: HnUser;
}

@Injectable()
export class HnBrickAggregateService {
  constructor(
    private brickService: HnBrickService,
    private brickMajorVersionService: HnBrickMajorVersionService,
    private brickVersionService: HnBrickVersionService,
    private folderService: HnFolderService,
    private documentationService: HnDocumentationService,
    private brickUserService: HnBrickUserService,
    private brickUserInviteService: HnBrickUserInviteService,
    private technicalFolderService: HnTechnicalFolderService,
    private spaceUserService: HnSpaceUserService,
    private userService: HnUserService,
    private dataSource: DataSource,
    private configService: HnCoreConfigService,
    private frontService: HnFrontService,
    private fileDocumentationService: HnFileDocumentationService,
    private readonly spaceAggregateService: HnSpaceAggregateService
  ) {}

  //------------------------------------- BRICKS -------------------------------------

  public async search(searchParams: BlSearchParams, page: number, size: number): Promise<ClPage<HnBrick>> {
    if (!HnCurrentUserHelper.isAdmin()) {
      throw new BlUnauthorizedException();
    }
    return this.brickService.search(searchParams, page, size);
  }

  async findBricksWithFilter(
    spacesFilter: string[],
    titleFilter: string,
    sortsCriteria: BlSearchSortCriteria[],
    page: number,
    size: number,
    userId: string = null
  ): Promise<ClPage<HnBrickDto>> {
    let publicSelected = false;
    let myBricks = false;
    let user: HnUser;

    if (userId) {
      user = await this.userService.findOne(userId);
      if (user == null) throw new BlBadRequestException('User not found');
    } else {
      user = HnCurrentUserHelper.getCurrentUser();
    }

    for (const spaceId of spacesFilter) {
      if (spaceId === 'public') publicSelected = true;
      // Verify user right on spaces
      else if (spaceId === 'my-bricks') myBricks = true;
      else {
        if (user != null) {
          await this.spaceAggregateService.assertCheckSpaceUser(spaceId, user.id);
        }
      }
    }

    if (publicSelected) spacesFilter = spacesFilter.filter((s) => s !== 'public');
    if (myBricks) spacesFilter = spacesFilter.filter((s) => s !== 'my-bricks');

    const whereConditions: FindOptionsWhere<HnBrick>[] | FindOptionsWhere<HnBrick> = myBricks
      ? await this.getMyBricksWhereBrickConditions(publicSelected, spacesFilter, user)
      : await this.getUserBasedWhereBrickConditions(publicSelected, {
          spacesFilter: spacesFilter,
          user: user,
        });

    // Add where conditions based on filters
    if (titleFilter) {
      if (whereConditions instanceof Array) {
        whereConditions.map((wc) => (wc.name = Like(`%${titleFilter}%`)));
      } else {
        whereConditions.name = Like(`%${titleFilter}%`);
      }
    }

    return this.brickService.findBrickList(whereConditions, sortsCriteria, page, size);
  }

  async findUserBricksWithCommonSpaces(
    user: HnUser,
    commonSpacesIds: string[],
    page: number,
    size: number
  ): Promise<ClPage<HnBrickDto>> {
    const whereConditions: FindOptionsWhere<HnBrick>[] | FindOptionsWhere<HnBrick> = [];

    const coAuthorBrickIds: string[] = (await this.brickUserService.getBrickUsersByUser(user)).map(
      (b) => b.brick.id
    );
    if (commonSpacesIds?.length > 0) {
      whereConditions.push({
        createdBy: {
          id: user.id,
        },
        space: {
          id: In(commonSpacesIds),
        },
      });

      if (coAuthorBrickIds.length > 0) {
        whereConditions.push({
          id: In(coAuthorBrickIds),
          space: {
            id: In(commonSpacesIds),
          },
        });
      }
    }

    whereConditions.push({
      createdBy: {
        id: user.id,
      },
      space: IsNull(),
    });

    whereConditions.push({
      id: In(coAuthorBrickIds),
      space: IsNull(),
    });

    return this.brickService.findBrickList(whereConditions, [], page, size);
  }

  async findUserBricks(userId: string, page: number, size: number): Promise<ClPage<HnBrickDto>> {
    const user = await this.userService.findOne(userId);
    if (!user) throw new BlNotFoundException('User not found');
    const currentUser = HnCurrentUserHelper.getCurrentUser();
    let commonSpacesIds: string[] = [];
    if (currentUser) {
      commonSpacesIds = (await this.spaceAggregateService.getUserCommonSpace(userId)).map(
        (space) => space.id
      );
    }
    return this.findUserBricksWithCommonSpaces(user, commonSpacesIds, page, size);
  }

  async findBrickById(id: string, user: HnUser = null): Promise<HnBrick> {
    const whereConditions: FindOptionsWhere<HnBrick>[] | FindOptionsWhere<HnBrick> =
      await this.getUserBasedWhereBrickConditions(null, { spacesFilter: null, user: user });
    if (whereConditions instanceof Array) {
      whereConditions.map((wc) => (wc.id = id));
    } else {
      whereConditions.id = id;
    }
    return this.brickService.findOne(whereConditions);
  }

  async findBrickByIdAndCheck(id: string, user: HnUser = null): Promise<HnBrick> {
    const brick = await this.findBrickById(id, user);
    if (brick == null) {
      throw new BlBadRequestException(HnErrorText.BRICK_NOT_FOUND, {
        detailArgs: { id: id },
      });
    }
    return brick;
  }

  async findBrickByName(name: string, userId: string = null, strict: boolean = true): Promise<HnBrick> {
    let whereConditions: FindOptionsWhere<HnBrick>[] | FindOptionsWhere<HnBrick> = {};

    if (strict) {
      whereConditions = await this.getUserBasedWhereBrickConditions(null, {
        user: userId ? await this.userService.findOne(userId) : HnCurrentUserHelper.getCurrentUser(),
      });
    }

    if (whereConditions instanceof Array) {
      whereConditions.map((wc) => (wc.name = name));
    } else {
      whereConditions.name = name;
    }

    const brick = await this.brickService.findOne(whereConditions);

    if (brick == null) {
      throw new BlBadRequestException(HnErrorText.BRICK_NOT_FOUND, {
        detailArgs: { name: name },
      });
    }

    return brick;
  }

  async checkIfBrickExistence(name: string): Promise<boolean> {
    return (await this.brickService.findOne({ name: name })) != null;
  }

  async assertCheckBrickSpaceUserById(id: string): Promise<void> {
    const brick: HnBrick = await this.findBrickById(id, HnCurrentUserHelper.getCurrentUser());
    if (brick.space != null) {
      await this.spaceAggregateService.assertCheckSpaceUser(
        brick.space.id,
        HnCurrentUserHelper.getCurrentUser()?.id
      );
    }
  }

  async assertCheckBrickSpaceUserByName(brickName: string): Promise<void> {
    const brick: HnBrick = await this.findBrickByName(brickName);
    if (brick.space != null) {
      await this.spaceAggregateService.assertCheckSpaceUser(
        brick.space.id,
        HnCurrentUserHelper.getCurrentUser()?.id
      );
    }
  }

  async findAllMap(): Promise<HnSitemapItemBase[]> {
    const bricks: HnBrick[] = await this.brickService.find();
    const map: HnSitemapItemBase[] = [];
    for (const brick of bricks) {
      if (brick?.visibility === HnBrickVisibility.PUBLIC) {
        const brickMap: HnSitemapItemBase[] = [];

        brickMap.push({
          url: this.frontService.getBrickVersionUrl(brick.name, 'latest'),
          lastmod: brick.lastModifiedAt.toFormat('yyyy-MM-dd'),
          changefreq: HnSiteMapEnumChangefreq.MONTHLY,
          priority: 0.8,
        });

        brickMap.push({
          url: this.frontService.getBrickVersionListUrl(brick.name, 'latest'),
          lastmod: brick.lastModifiedAt.toFormat('yyyy-MM-dd'),
          changefreq: HnSiteMapEnumChangefreq.MONTHLY,
          priority: 0.5,
        });

        const brickMajorVersions: HnBrickMajorVersion[] =
          await this.brickMajorVersionService.findBrickMajorVersionsByBrick(brick);

        for (const brickMajorVersion of brickMajorVersions) {
          // add docs
          const docs: HnDocumentation[] = await this.documentationService.getDocsByBrickVersion(
            brickMajorVersion.id
          );
          for (const doc of docs) {
            brickMap.push({
              url: this.frontService.getBrickDocUrl(
                brickMajorVersion.brick.name,
                brickMajorVersion.getStrVersion(),
                doc.id,
                doc.completePath
              ),
              // last mode with format YYYY-MM-DD
              lastmod: doc.lastModifiedAt.toFormat('yyyy-MM-dd'),
              changefreq: HnSiteMapEnumChangefreq.MONTHLY,
              priority: brickMajorVersion.isLatest ? 0.8 : 0.2,
            });
          }

          // add technical docs
          const technicalFolder = await this.technicalFolderService.findTechnicalFolder(brickMajorVersion.id);
          const technicalDocs = await this.technicalFolderService.findTechDocsByBrickMajor(
            brickMajorVersion.id
          );

          for (const doc of technicalDocs) {
            brickMap.push({
              url: this.frontService.getBrickTechnicalDocUrl(
                brickMajorVersion.brick.name,
                brickMajorVersion.getStrVersion(),
                doc.getCompletePath()
              ),
              // last mode with format YYYY-MM-DD
              lastmod: technicalFolder.lastModifiedAt.toFormat('yyyy-MM-dd'),
              changefreq: HnSiteMapEnumChangefreq.MONTHLY,
              priority: brickMajorVersion.isLatest ? 0.7 : 0.1,
            });
          }
        }
        map.push(...brickMap);
      }
    }
    return map;
  }

  async createBrick(body: HnCreateBrickDTO): Promise<HnBrick> {
    let brick: HnBrick;
    const brickVersion: HnBrickVersion = await this.dataSource.transaction(async (entityManager) => {
      if (body.name.includes(' ')) {
        throw new BlBadRequestException(HnErrorText.BRICK_NAME_INVALID);
      }

      const brickExist = await this.brickService.findOne({ name: body.name });
      if (brickExist != null) {
        throw new BlBadRequestException(HnErrorText.BRICK_ALREADY_EXIST);
      }

      const newBrick = new HnBrick();
      newBrick.initialize(body);

      // Create brick
      brick = await this.brickService.create(newBrick, entityManager);

      // init subpatch version if beta
      if (body.isBeta) body.version.subPatch = body.subPatch;

      // Create brick major version
      const brickMajorVersion: HnBrickMajorVersion = await this.brickMajorVersionService.create(
        brick,
        body,
        entityManager
      );

      // Init the BlVersion to create the brick version
      const version: BlVersion =
        body.version.subPatch != null
          ? new BlVersion(
            +body.version.major,
            +body.version.minor,
            +body.version.patch,
            +body.version.subPatch
          )
          : new BlVersion(+body.version.major, +body.version.minor, +body.version.patch);

      // TODO: Improve brick version creation (simplify in the aggregate)
      const bv: HnBrickVersion = await this.brickVersionService.createNewBrickVersion(
        brickMajorVersion,
        {
          version: version.toString(),
          brickId: brickMajorVersion.brick.id,
          references: body.references,
          repoType: body.repoType,
          technicalInfo: body.technicalInfo,
        },
        entityManager
      );

      // Create main folders
      const mainFolder: HnFolder = await this.folderService.createMainFolders(
        brickMajorVersion,
        entityManager
      );

      // Create main doc
      await this.documentationService.createMainDoc(mainFolder, entityManager);

      return bv;
    });

    // Send brick version to transport
    await this.brickVersionService.sendBrickVersionIdToTransport(brickVersion.id);

    return brick;
  }

  async editBrickImage(id: string, file: BlFile): Promise<TeBlockFigureUploadedResponse> {
    await this.assertUserCanEditBrick(id, true);
    return this.brickService.editBrickImage(id, file);
  }

  async getBrickImage(filename: string): Promise<BlFileResponse> {
    return this.brickService.getBrickImage(filename);
  }

  async deleteBrickImage(filename: string): Promise<void> {
    const brickId = filename.split('/')[0];
    await this.assertUserCanEditBrick(brickId, true);
    return this.brickService.deleteBrickImage(filename, brickId);
  }

  async acceptBrickUserInvite(token: string): Promise<HnBrick> {
    const brickUserInvite: HnBrickUserInvite = await this.brickUserInviteService.getAndCheckInvite(token);
    const brick: HnBrick = await this.brickService.findBrickForInviteById(brickUserInvite.brick.id);
    await this.brickUserInviteService.acceptUserInvite(brickUserInvite);
    await this.brickUserService.createBrickUser(brick, HnCurrentUserHelper.getCurrentUser());
    return brick;
  }

  async isBrickUserInviteValid(token: string): Promise<HnBrickUserInviteDto> {
    const brickUserInvite = await this.brickUserInviteService.getAndCheckInvite(token);
    if (!brickUserInvite) throw new BlUnauthorizedException('This invite is not valid');
    return new HnBrickUserInviteDto(brickUserInvite);
  }

  async editBrick(editedBrick: HnEditBrickDTO): Promise<HnBrick> {
    await this.assertUserCanEditBrick(editedBrick.id, false);
    let brick: HnBrick = await this.findBrickById(editedBrick.id);
    brick = await this.brickService.editBrick(brick, editedBrick);

    try {
      const lastBrickMajorVersion: HnBrickMajorVersion =
        await this.brickMajorVersionService.getLatestBrickMajorVersion(brick.id);
      const brickVersion = await this.brickVersionService.getLatestBrickVersion(lastBrickMajorVersion.id);
      await this.brickVersionService.sendBrickVersionIdToTransport(brickVersion.id);
    } catch (e: any) {
      console.log(e);
    }

    return brick;
  }

  async findBrickByNameSpace(
    name: string,
    version: string,
    spaceApiKey?: string
  ): Promise<HnBrickVersionDownloadDTO> {
    const brick = await this.brickService.findByNameSpace(name);
    if (brick == null) {
      throw new BlBadRequestException(HnErrorText.BRICK_NOT_FOUND, {
        detailArgs: { name: name },
      });
    }

    // if the brick is private, it needs a valid spaceApiKey
    if (brick.visibility === HnBrickVisibility.PRIVATE) {
      if (spaceApiKey == null || this.configService.getSpaceApiKey() !== spaceApiKey) {
        throw new BlUnauthorizedException();
      }
    }

    // get the version
    const brickVersion: HnBrickVersion = await this.brickVersionService.getAndCheckBrickVersion(
      name,
      version
    );

    return {
      brickName: brick.name,
      brickVersion: brickVersion.version.toString(),
      repoType: brickVersion.repoType,
      repositoryUrl: brick.repositoryUrl,
      repositoryAccessUrl: brick.repositoryAccessUrl,
      technicalInfo: brickVersion.technicalInfo,
    };
  }

  async isActualBrickAndNewVersion(body: HnIsActualBrickAndNewVersionDTO): Promise<[boolean, boolean]> {
    const brick: HnBrick = await this.findBrickById(body.brickId);
    this.brickService.checkIfUserHasRightOnTheBrick(brick);

    if (!body.inputBrickName || (brick && brick.name.toUpperCase() != body.inputBrickName.toUpperCase())) {
      return [false, false];
    }

    const brickMajorVersion: HnBrickMajorVersion =
      await this.brickMajorVersionService.findBrickMajorVersionByBrickAndVersion(
        brick,
        body.inputBrickVersion
      );

    if (brickMajorVersion == null) {
      throw new BlUnauthorizedException('Impossible to create a new major version');
    }

    return this.brickVersionService.checkIfVersionExist(brickMajorVersion, body.inputBrickVersion);
  }

  async updateFolder(updatedFolder: HnNodeDTO): Promise<HnFolder> {
    await this.checkIfUserHasRightsOnFolder(updatedFolder.id);
    return this.updateFolderRecusive(updatedFolder);
  }

  async getAndCheckBrickVersion(name: string, version: string): Promise<HnBrickVersion> {
    return this.brickVersionService.getAndCheckBrickVersion(name, version);
  }

  //------------------------------------- FOLDERS -------------------------------------

  async checkIfUserHasRightsOnFolder(id: string): Promise<void> {
    const folder: HnFolder = await this.folderService.findById(id);
    const brickMajorVersion: HnBrickMajorVersion = folder.brickMajorVersion;
    const brick: HnBrick = brickMajorVersion.brick;
    this.brickService.checkIfUserHasRightOnTheBrick(brick);
  }

  async createFolder(createFolder: HnNodeDTO): Promise<HnFolder> {
    await this.checkIfUserHasRightsOnFolder(createFolder.folderId);
    return this.folderService.create(createFolder);
  }

  async updateFolderRecusive(updatedFolder: HnNodeDTO): Promise<HnFolder> {
    let folder: HnFolder = await this.folderService.findWithRelationById(updatedFolder.id);
    folder.path = ClStringHelper.generateUrlPathFromString(updatedFolder.title);
    folder.title = updatedFolder.title;
    folder.completePath = folder.folder.completePath
      ? folder.folder.completePath + folder.path + '/'
      : folder.path + '/';

    folder = await this.folderService.save(folder);

    await this.updateChildCompletePath(folder);

    return folder;
  }

  async updateChildCompletePath(folder: HnFolder): Promise<void> {
    if (folder.documentations.length > 0) {
      for (const d of folder.documentations) {
        await this.documentationService.updateCompletePath(d, folder);
      }
    }

    if (folder.folders.length > 0) {
      for (const f of folder.folders) {
        const fDTO = new HnNodeDTO();
        fDTO.isFolder = true;
        fDTO.title = f.title;
        fDTO.id = f.id;
        await this.updateFolderRecusive(fDTO);
      }
    }
  }

  async updateNodeLocation(
    nodeId: string,
    nodeType: HnNodeType,
    oldOrder: number,
    newOrder: number,
    olderParentId: string,
    newParentId: string,
    mainFolderId: string
  ): Promise<HnNode> {
    await this.checkIfUserHasRightsOnFolder(mainFolderId);
    const olderParent: HnFolder = await this.folderService.findById(olderParentId);
    const newParent: HnFolder = await this.folderService.findById(newParentId);

    if (olderParentId != newParentId) {
      for (const childFolder of olderParent.folders) {
        if (childFolder.order > oldOrder) {
          childFolder.order--;
          await this.folderService.save(childFolder);
        }
      }

      for (const childDoc of olderParent.documentations) {
        if (childDoc.order > oldOrder) {
          childDoc.order--;
          await this.documentationService.updatePosition(childDoc);
        }
      }

      for (const childFolder of newParent.folders) {
        if (childFolder.order >= newOrder) {
          childFolder.order++;
          await this.folderService.save(childFolder);
        }
      }

      for (const childDoc of newParent.documentations) {
        if (childDoc.order >= newOrder) {
          childDoc.order++;
          await this.documentationService.updatePosition(childDoc);
        }
      }
    } else {
      if (oldOrder < newOrder) {
        for (const childFolder of newParent.folders) {
          if (childFolder.order > oldOrder && childFolder.order <= newOrder) {
            childFolder.order--;
            await this.folderService.save(childFolder);
          }
        }

        for (const childDoc of newParent.documentations) {
          if (childDoc.order > oldOrder && childDoc.order <= newOrder) {
            childDoc.order--;
            await this.documentationService.updatePosition(childDoc);
          }
        }
      } else {
        for (const childFolder of newParent.folders) {
          if (childFolder.order >= newOrder && childFolder.order < oldOrder) {
            childFolder.order++;
            await this.folderService.save(childFolder);
          }
        }

        for (const childDoc of newParent.documentations) {
          if (childDoc.order >= newOrder && childDoc.order < oldOrder) {
            childDoc.order++;
            await this.documentationService.updatePosition(childDoc);
          }
        }
      }
    }

    if (nodeType == HnNodeType.DOCUMENTATION) {
      const doc = await this.documentationService.findById(nodeId);
      doc.folder = newParent;
      doc.order = newOrder;
      doc.completePath = (newParent.completePath ?? '') + doc.path + '/';
      await this.documentationService.save(doc);
    } else {
      const folder = await this.folderService.findById(nodeId);
      folder.folder = newParent;
      folder.order = newOrder;
      folder.completePath = (newParent.completePath ?? '') + folder.path + '/';
      await this.folderService.save(folder);
    }

    return await this.folderService.findBrickDocsTree(await this.folderService.findById(mainFolderId));
  }

  async updateTreeFolder(updatedTree: HnNode[]): Promise<HnNode[]> {
    for (const node of updatedTree) {
      let isUpdated = false;
      if (node.children) {
        const f: HnFolder = await this.folderService.findWithRelationById(node.id);
        if (f.order != node.order || f.folder.id != node.parentId) {
          isUpdated = true;
          f.order = node.order;
          f.folder.id = node.parentId;
        }
        if (isUpdated) {
          await this.folderService.save(f);
        }
        await this.updateTreeFolder(node.children);
      } else {
        const d: HnDocumentation = await this.documentationService.findById(node.id);
        if (d.order != node.order || d.folder.id != node.parentId) {
          isUpdated = true;
          d.order = node.order;
          d.folder.id = node.parentId;
        }
        if (isUpdated) {
          await this.documentationService.updatePosition(d);
        }
      }
    }
    return updatedTree;
  }

  async findDocsByBrick(brickId: string, version: string): Promise<HnNode> {
    const brick: HnBrick = await this.findBrickById(brickId);
    if (brick == null) {
      return null;
    }

    const brickMajorVersion: HnBrickMajorVersion =
      await this.brickMajorVersionService.findBrickMajorVersionByBrickAndVersion(brick, version);
    const mainFolder: HnFolder = await this.folderService.findFolderByBrickMajorVersion(brickMajorVersion);
    return await this.folderService.findBrickDocsTree(mainFolder);
  }

  async findAllFolders(): Promise<HnFolderDto[]> {
    return (await this.folderService.findAll())?.map((f) => new HnFolderDto(f));
  }

  async findFolderById(id: string): Promise<HnFolderDto> {
    return new HnFolderDto(await this.folderService.findById(id));
  }

  async findFoldersByParentId(id: string): Promise<HnFolderDto[]> {
    return (await this.folderService.findFoldersByParentId(id))?.map((f) => new HnFolderDto(f));
  }

  async removeFolder(id: string): Promise<void> {
    await this.checkIfUserHasRightsOnFolder(id);
    return this.folderService.remove(id);
  }

  //------------------------------------- DOCS -------------------------------------

  async createDoc(createDocumentation: HnNodeDTO): Promise<HnDocumentation> {
    await this.checkIfUserHasRightsOnFolder(createDocumentation.folderId);

    const folder = await this.folderService.findById(createDocumentation.folderId);
    return this.documentationService.create(createDocumentation, folder);
  }

  async findAllDocs(): Promise<HnDocumentationDTO[]> {
    const docs: HnDocumentation[] = await this.documentationService.findAll();
    const docsDto: HnDocumentationDTO[] = [];
    docs.map((doc) => {
      if (!doc.path.includes('/')) {
        docsDto.push(new HnDocumentationDTO(doc));
      }
    });
    return docsDto;
  }

  async findDocById(id: string): Promise<HnDocumentationDto> {
    const doc = await this.documentationService.findById(id);
    if (doc == null) {
      throw new BlBadRequestException(HnErrorText.DOCUMENTATION_NOT_FOUND, {
        detailArgs: { id: id },
      });
    }
    return new HnDocumentationDto(doc);
  }

  async removeDoc(id: string): Promise<void> {
    await this.checkIfUserHasRightsOnDoc(id);
    return this.documentationService.remove(id);
  }

  async updateDoc(updatedDoc: HnNodeDTO): Promise<HnDocumentation> {
    await this.checkIfUserHasRightsOnDoc(updatedDoc.id);
    return this.documentationService.update(updatedDoc);
  }

  async saveDocImage(file: BlFile, docId: string): Promise<TeBlockFigureUploadedResponse> {
    await this.checkIfUserHasRightsOnDoc(docId);
    const documentation: HnDocumentation = await this.documentationService.findById(docId);
    return this.fileDocumentationService.saveImage(documentation, file);
  }

  async updateDocContent(id: string, updateContentDoc: TeRichText): Promise<HnDocumentation> {
    await this.checkIfUserHasRightsOnDoc(id);
    return this.documentationService.updateContent(id, updateContentDoc);
  }

  async checkIfUserHasRightsOnDoc(id: string): Promise<void> {
    const doc: HnDocumentation = await this.documentationService.findById(id);
    const folder: HnFolder = doc.folder;
    const brickMajorVersion: HnBrickMajorVersion = folder.brickMajorVersion;
    const brick: HnBrick = brickMajorVersion.brick;
    this.brickService.checkIfUserHasRightOnTheBrick(brick);
  }

  async findDocsByParentId(id: string): Promise<HnDocumentationDto[]> {
    return (await this.folderService.findDocsByParentId(id))?.map((d) => new HnDocumentationDto(d));
  }

  async findRootFolderId(brickId: string, version: string): Promise<{ id: string }> {
    const brick: HnBrick = await this.findBrickById(brickId);
    if (brick == null) {
      return { id: null };
    }

    const brickMajorVersion: HnBrickMajorVersion =
      await this.brickMajorVersionService.findBrickMajorVersionByBrickAndVersion(brick, version);
    const mainFolder = await this.folderService.findFolderByBrickMajorVersion(brickMajorVersion);
    return { id: mainFolder.id };
  }

  async findCurrentDoc(
    brickName: string,
    version: string,
    completePath: string
  ): Promise<HnDocumentationDto> {
    const brick: HnBrick = await this.findBrickByName(brickName);

    const brickMajorVersion: HnBrickMajorVersion =
      await this.brickMajorVersionService.findBrickMajorVersionByBrickAndVersion(brick, version);

    if (!completePath.endsWith('/')) {
      completePath += '/';
    }

    const doc = await this.documentationService.findCurrentDoc(brickMajorVersion, completePath);
    if (doc == null) {
      throw new BlBadRequestException(HnErrorText.DOCUMENTATION_NOT_FOUND, {
        detailArgs: { completePath: completePath },
      });
    }

    return new HnDocumentationDto(doc);
  }

  async findFirstDoc(brickName: string, version: string): Promise<HnDocumentationDto> {
    const brick: HnBrick = await this.findBrickByName(brickName);
    const brickMajorVersion: HnBrickMajorVersion =
      await this.brickMajorVersionService.findBrickMajorVersionByBrickAndVersion(brick, version);
    const findFirstDocNode: HnNode = await this.folderService.findFirstDocNode(brickMajorVersion);
    return new HnDocumentationDto(await this.documentationService.findById(findFirstDocNode.id));
  }

  async getDocsByBrickNameMajor(brickName: string, major: string): Promise<HnDocumentationSearchDTO[]> {
    const majorNumber: number =
      major === 'latest' ? (await this.getLatestBrickVersion(brickName)).version.major : +major.slice(1);

    const brick: HnBrick = await this.findBrickByName(brickName);
    if (brick == null) {
      return null;
    }

    const brickMajorVersion: HnBrickMajorVersion =
      await this.brickMajorVersionService.findOneByBrickIdAndMajor(brick.id, majorNumber);

    let res: HnDocumentationSearchDTO[] = [];
    // Add all docs from the main folder to result
    res = res.concat(
      await this.folderService.getDocsByBrickNameMajor(brickMajorVersion, major.toString(), brick.name)
    );

    // Add technical docs from the technical folder to result
    res = res.concat(
      await this.technicalFolderService.getTechDocsByBrickNameMajor(
        brickMajorVersion.id,
        major.toString(),
        brick.name
      )
    );

    // Sort result
    return res.sort((a, b) => {
      if (a.name < b.name) return -1;
      if (b.name < a.name) return 1;
      return 0;
    });
  }

  async getDocByLink(link: string): Promise<HnDocumentationSearchDTO> {
    // Split link parts
    const linkArray: string[] = link.substring(this.configService.getFrontBaseUrl().length).split('/');

    // Get the brick
    const brick: HnBrick = await this.findBrickByName(linkArray[1]);

    // Get the brick major version
    const brickVersionNumber: number =
      linkArray[2] === 'latest'
        ? (await this.getLatestBrickVersion(brick.name)).version.major
        : +linkArray[2];
    const brickMajorVersion: HnBrickMajorVersion =
      await this.brickMajorVersionService.findBrickMajorVersionByBrickAndMajor(brick, brickVersionNumber);

    const isATechnicalDoc: boolean = linkArray[4] === 'technical';

    // Prepare complete path and anchor of the doc
    let completePath: string = linkArray.slice(4).join('/');
    let anchor: string = null;
    if (completePath.includes('#')) {
      [completePath, anchor] = completePath.split('#');
    }
    completePath = completePath + '/';

    // Get doc or technical doc
    return isATechnicalDoc
      ? this.technicalFolderService.getTechDocByLink(brickMajorVersion, completePath, anchor)
      : this.documentationService.getDocByLink(brickMajorVersion, completePath, anchor);
  }

  async createTechnicalDoc(content: HnCreateTechnicalDocContent): Promise<boolean> {
    if (content.brickName.toUpperCase() !== content.importFile.brick_name.toUpperCase()) {
      return false;
    }

    //Get brick
    const brick: HnBrick = await this.findBrickByName(content.brickName);
    if (brick == null) {
      return false;
    }

    await this.assertUserCanEditBrick(brick.id, false);

    // Get brick major version
    const importVersion: BlVersion = BlVersion.fromString(content.importFile.brick_version);
    const brickMajorVersion: HnBrickMajorVersion =
      await this.brickMajorVersionService.findOneByBrickIdAndMajor(brick.id, importVersion.major);
    if (brickMajorVersion == null) {
      return false;
    }

    // TODO: improve here to avoid resource task and protocols services in technicalForlderService
    return this.technicalFolderService.createTechnicalDoc(brickMajorVersion, content.importFile);
  }

  async getDocFiles(docId: string): Promise<HnAbstractFileEntityDTO[]> {
    const documentation: HnDocumentation = await this.documentationService.findById(docId);
    return this.fileDocumentationService.getDocFiles(documentation);
  }

  //------------------------------------- DOC HISTORY -------------------------------------
  async getDocModifications(docId: string): Promise<TeRichTextBlockModificationWithUser[]> {
    const doc: HnDocumentation = await this.documentationService.findById(docId);

    const richText = doc.getRichTextAggregate();

    return richText.getModificationsDTO((userId) => this.userService.findUserBasicDTO(userId));
  }

  async getUndoContent(docId: string, modificationId: string): Promise<TeRichTextAggregate> {
    const doc: HnDocumentation = await this.documentationService.findById(docId);
    return this.documentationService.getUndoContent(doc, modificationId);
  }

  async rollbackContent(docId: string, modificationId: string): Promise<HnDocumentation> {
    const doc: HnDocumentation = await this.documentationService.findById(docId);
    return this.documentationService.rollbackContent(doc, modificationId);
  }

  //------------------------------------- TECHNICAL DOCS -------------------------------------

  async findTechnicalDoc(brickId: string, version: string): Promise<HnNode> {
    const brick: HnBrick = await this.findBrickById(brickId);
    const brickMajorVersion: HnBrickMajorVersion =
      await this.brickMajorVersionService.findBrickMajorVersionByBrickAndVersion(brick, version);
    return this.technicalFolderService.findTechnicalDoc(brickMajorVersion.id);
  }

  async findTechDocByPath(input: HnTechnicalDocInputDTO): Promise<HnGeneratedDocDto> {
    const brick: HnBrick = await this.findBrickByName(input.brickName);
    if (brick == null) {
      return null;
    }
    const brickMajorVersion: HnBrickMajorVersion =
      await this.brickMajorVersionService.findBrickMajorVersionByBrickAndVersion(brick, input.brickVersion);
    const techDoc = await this.technicalFolderService.findCurrentTecDoc(brickMajorVersion, input);
    return techDoc?.toDto();
  }

  async createNewVersion(newVersion: HnNewVersionDTO): Promise<HnNewVersionDTO> {
    const brick: HnBrick = await this.findBrickById(newVersion.brickId);
    if (brick == null) {
      throw new BlBadRequestException('Brick not found');
    }

    await this.assertUserCanEditBrick(brick.id, false);

    const brickMajorVersion: HnBrickMajorVersion =
      await this.brickMajorVersionService.getLatestBrickMajorVersion(brick.id);

    const brickVersion: HnBrickVersion = await this.brickVersionService.getLatestBrickVersion(
      brickMajorVersion.id
    );

    newVersion.repoType = brickVersion.repoType;
    const newMajor = parseInt(newVersion.version.split('.')[0]);

    // Verify if the new version match an existent major version
    if ((await this.brickMajorVersionService.findOneByBrickIdAndMajor(brick.id, newMajor)) == null) {
      throw new BlBadRequestException('Impossible to create a new major version');
    }

    await this.brickVersionService.createNewBrickVersion(brickMajorVersion, newVersion);

    return newVersion;
  }

  //------------------------------------- VERSION -------------------------------------

  async getLatestBrickVersion(brickName: string): Promise<HnBrickVersion> {
    const brick: HnBrick = await this.findBrickByName(brickName);
    const brickMajorVersion = await this.brickMajorVersionService.getLatestBrickMajorVersion(brick.id);
    return this.brickVersionService.getLatestBrickVersion(brickMajorVersion.id);
  }

  async getCurrentBrickVersion(
    page: number,
    size: number,
    brickId: string
  ): Promise<ClPage<HnBrickVersionDto>> {
    const brick: HnBrick = await this.findBrickById(brickId);
    return this.brickVersionService.getCurrentBrickVersion(
      page,
      size,
      brickId,
      this.brickService.userHasRightOnBrick(brick)
    );
  }

  async getVersionsList(brickId: string, userId: string = null): Promise<string[]> {
    const brick = await this.findBrickById(
      brickId,
      userId ? await this.userService.findOne(userId) : HnCurrentUserHelper.getCurrentUser()
    );
    if (brick == null) {
      throw new BlNotFoundException(HnErrorText.BRICK_NOT_FOUND, {
        detailArgs: { id: brickId },
      });
    }
    return this.brickVersionService.getVersionsList(brickId);
  }

  async sendAllBrickVersionToQueue(): Promise<void> {
    return this.brickVersionService.sendAllBrickVersionToQueue();
  }

  //------------------------------------- RESOURCE VIEW -------------------------------------
  async saveDocResourceViewFile(docId: string, file: BlFile): Promise<string> {
    await this.checkIfUserHasRightsOnDoc(docId);
    const doc = await this.documentationService.findById(docId);
    return this.fileDocumentationService.saveResourceView(doc, file);
  }

  async getAllBrickVersionReferences(brickVersionId: string): Promise<HnReferenceDTO[]> {
    return this.brickVersionService.getAllReferences(brickVersionId);
  }

  async getBrickVersionDirectReferences(brickVersionId: string): Promise<HnReferenceDTO[]> {
    return this.brickVersionService.getDirectReferences(brickVersionId);
  }

  //------------------------------------- BRICK CO AUTHOR -------------------------------------
  async getBrickCoAuthorsPendingInvites(brickId: string): Promise<HnBrickUserInviteDto[]> {
    await this.assertUserCanEditBrick(brickId);
    const brickUserInvites: HnBrickUserInvite[] =
      await this.brickUserInviteService.getPendingUserInvitesWithUser(brickId);
    return brickUserInvites.map((brickUserInvite) => new HnBrickUserInviteDto(brickUserInvite));
  }

  //------------------------------------- DOCUMENTATION FILE -------------------------------------
  async saveFile(file: BlFile, docId: string): Promise<HnUploadFileResponseDto> {
    await this.checkIfUserHasRightsOnDoc(docId);
    const doc = await this.documentationService.findById(docId);
    return await this.fileDocumentationService.saveFile(doc, file);
  }

  async inviteBrickCoAuthor(brickId: string, emailOrId: string): Promise<HnBrick> {
    await this.assertUserCanEditBrick(brickId);
    const brick: HnBrick = await this.findBrickById(brickId);
    await this.brickUserInviteService.createUserInviteMail(brick, emailOrId);
    return brick;
  }

  async removeBrickCoAuthor(brickId: string, brickAuthorUserId: string): Promise<void> {
    await this.assertUserCanEditBrick(brickId);
    await this.brickUserService.checkAndRemoveBrickUser(brickId, brickAuthorUserId);
  }

  async deleteCoAuthorInvite(inviteId: string): Promise<boolean> {
    return await this.brickUserInviteService.deleteUserInvite(inviteId);
  }

  async getBrickCoAuthors(brickId: string): Promise<HnBrickUser[]> {
    return this.brickUserService.getBrickUsers(await this.findBrickById(brickId));
  }

  async checkIfUserCanEditBrick(brickId: string, fullRight = true): Promise<boolean> {
    if (HnCurrentUserHelper.getCurrentUser() == null) {
      return false;
    }

    if (HnCurrentUserHelper.getCurrentUser().isAdmin()) {
      return true;
    }

    const brick = await this.findBrickById(brickId);

    if (!brick.space)
      // if not fullRight, check if the user is a brickAuthor as well
      return (
        brick.createdBy.id === HnCurrentUserHelper.getCurrentUser()?.id ||
        (!fullRight && brick.brickUsers.some((bu) => bu.user.id === HnCurrentUserHelper.getCurrentUser().id))
      );

    if (await this.spaceUserService.checkCurrentUserIsSpaceAdmin(brick.space.id)) {
      return true;
    }

    if (await this.spaceUserService.checkCurrentUserIsSpaceUser(brick.space.id)) {
      return (
        brick.createdBy.id === HnCurrentUserHelper.getCurrentUser()?.id ||
        brick.brickUsers.some((bu) => bu.user.id === HnCurrentUserHelper.getCurrentUser().id)
      );
    }

    // if not fullRight, check if the user is a brickAuthor
    return (
      !fullRight && brick.brickUsers.some((bu) => bu.user.id === HnCurrentUserHelper.getCurrentUser().id)
    );
  }

  async assertUserCanEditBrick(brickId: string, fullRight = true): Promise<void> {
    if (!(await this.checkIfUserCanEditBrick(brickId, fullRight))) {
      throw new BlUnauthorizedException('You are not authorized to perform this action');
    }
  }

  public async getMyBricksWhereBrickConditions(
    publicSelected: boolean,
    spacesFilter: string[],
    user: HnUser = null
  ): Promise<FindOptionsWhere<HnBrick>[] | FindOptionsWhere<HnBrick>> {
    const currentUser: HnUser = user ?? HnCurrentUserHelper.getCurrentUser();

    if (currentUser == null) {
      throw new BlUnauthorizedException('You are not authorized to perform this action');
    }

    let whereConditions: FindOptionsWhere<HnBrick>[] | FindOptionsWhere<HnBrick>;

    const brickCoAuthor: HnBrickUser[] = await this.brickUserService.getBrickUsersByUser(currentUser);
    const brickCoAuthorBricksId: string[] = brickCoAuthor.map((bu) => bu.brick.id);

    if (publicSelected) {
      whereConditions = [
        {
          space: {
            id: In(spacesFilter),
          },
          createdBy: {
            id: currentUser.id,
          },
        },
        {
          space: {
            id: IsNull(),
          },
          createdBy: {
            id: currentUser.id,
          },
        },
        {
          space: {
            id: In(spacesFilter),
          },
          id: In(brickCoAuthorBricksId),
        },
        {
          space: {
            id: IsNull(),
          },
          id: In(brickCoAuthorBricksId),
        },
      ];
    } else if (spacesFilter && spacesFilter.length > 0) {
      whereConditions = [
        {
          space: {
            id: In(spacesFilter),
          },
          createdBy: {
            id: currentUser.id,
          },
        },
        {
          space: {
            id: In(spacesFilter),
          },
          id: In(brickCoAuthorBricksId),
        },
      ];
    } else {
      whereConditions = [
        {
          createdBy: {
            id: currentUser.id,
          },
        },
        {
          id: In(brickCoAuthorBricksId),
        },
      ];
    }

    return whereConditions;
  }

  public async downloadDocsZip(brickId: string): Promise<BlFileResponse> {
    const brickMajorVersion = await this.brickMajorVersionService.getLatestBrickMajorVersion(brickId);
    const docs = await this.documentationService.getDocsByBrickVersion(brickMajorVersion.id);

    const docsMarkDowns: HnMarkdownFile[] = [];
    for (const doc of docs) {
      const docUrl = this.frontService.getBrickDocUrl(
        brickMajorVersion.brick.name,
        brickMajorVersion.getStrVersion(),
        doc.id,
        doc.completePath
      );

      let docContentMarkdown = `# ${doc.title}\n\n`;
      docContentMarkdown += doc
        .getRichText()
        .toMarkdown(`${this.configService.getApiUrl()}documentation/${doc.id}/image`, docUrl);
      docsMarkDowns.push({
        name: ClStringHelper.getCleanUrlPath(doc.title),
        content: docContentMarkdown,
      } as HnMarkdownFile);
    }

    return HnZipHelper.markdownsToZipFile(
      docsMarkDowns,
      ClStringHelper.getCleanUrlPath(brickMajorVersion.brick.name)
    );
  }

  public async downloadDocMarkdown(docId: string): Promise<BlFileResponse> {
    const doc: HnDocumentation = await this.documentationService.findById(docId);
    if (doc == null) {
      throw new BlBadRequestException(HnErrorText.DOCUMENTATION_NOT_FOUND, {
        detailArgs: { id: docId },
      });
    }

    const docUrl = this.frontService.getBrickDocUrl(
      doc.folder.brickMajorVersion.brick.name,
      doc.folder.brickMajorVersion.getStrVersion(),
      doc.id,
      doc.completePath
    );

    let docContentMarkdown = `# ${doc.title}\n\n`;
    docContentMarkdown += doc
      .getRichText()
      .toMarkdown(`${this.configService.getApiUrl()}documentation/${doc.id}/image`, docUrl);

    return HnMarkdownHelper.createMarkdownResponse(
      ClStringHelper.getCleanUrlPath(doc.title) + '.md',
      docContentMarkdown
    );
  }

  private async getUserBasedWhereBrickConditions(
    publicSelected: boolean = null,
    optionalParams?: HnBrickUserBasedWhereOptionalParams
  ): Promise<FindOptionsWhere<HnBrick>[] | FindOptionsWhere<HnBrick>> {
    const currentUser: HnUser = optionalParams?.user ?? HnCurrentUserHelper.getCurrentUser();
    let whereConditions: FindOptionsWhere<HnBrick>[] | FindOptionsWhere<HnBrick>;

    if (currentUser == null) {
      whereConditions = [
        {
          space: {
            id: IsNull(),
          },
          visibility: HnBrickVisibility.PUBLIC,
        },
      ];
    } else if (publicSelected) {
      whereConditions = [
        {
          space: {
            id: In(optionalParams?.spacesFilter ?? []),
          },
        },
        {
          space: {
            id: IsNull(),
          },
        },
      ];
    } else if (optionalParams?.spacesFilter && optionalParams.spacesFilter.length > 0) {
      whereConditions = [
        {
          space: {
            id: In(optionalParams.spacesFilter),
          },
        },
      ];
    } else {
      const userSpacesIds: string[] = (
        await this.spaceUserService.findActiveSpaceUsersByUserId(currentUser?.id)
      ).map((su) => su.spaceId);

      whereConditions = [
        {
          visibility: HnBrickVisibility.PUBLIC,
        },
        {
          space: In(userSpacesIds),
        },
      ];
    }

    return whereConditions;
  }
}
