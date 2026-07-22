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
  TeMarkdown,
  TeRichText,
  TeRichTextAggregate,
  TeRichTextBlockModificationWithUser,
} from '@monorepo/te-text-editor';
import { Injectable, Logger } from '@nestjs/common';
import { DataSource, FindOptionsWhere, In, IsNull, Like } from 'typeorm';

import { HnLabAuthGuard } from '../core/guards/hn-lab-auth.guard';
import { HnErrorText } from '../core/model/config/hn-error-text.class';
import { HnSiteMapEnumChangefreq, HnSitemapItemBase } from '../core/model/config/hn-site-map.class';
import { HnGeneratedDocEntity } from '../core/model/entities/hn-generated-doc-typing.entity';
import { HnCoreConfigService } from '../core/modules/core-config/hn-core-config.service';
import { HnCommunitySecurity } from '../core/security/hn-community-security.service';
import { HnExternalSpaceApiService } from '../core/service/hn-external-space-api.service';
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
import { HnTechnicalFolder } from '../technical-folder/hn-technical-folder.entity';
import { HnTechnicalFolderService } from '../technical-folder/hn-technical-folder.service';
import { HnUser } from '../users/hn-user.entity';
import { HnUserService } from '../users/hn-user.service';
import {
  HnBrickDto,
  HnBrickInfoDTO,
  HnBrickInfoRequestDTO,
  HnBrickVersionCloneInfoDTO,
  HnBrickVersionInfoDTO,
  HnCreateBrickDTO,
  HnCreateTechnicalDocContent,
  HnEditBrickDTO,
  HnIsActualBrickAndNewVersionDTO,
  HnIsActualBrickAndNewVersionResponseDTO,
  HnTechnicalDocInputDTO,
} from './brick/hn-brick.dto';
import { HnBrick, HnBrickEntity, HnBrickVisibility } from './brick/hn-brick.entity';
import { HnBrickService } from './brick/hn-brick.service';
import { HnBrickMajorVersion } from './brick-major-version/hn-brick-major-version.entity';
import { HnBrickMajorVersionService } from './brick-major-version/hn-brick-major-version.service';
import { HnBrickUser } from './brick-user/hn-brick-user.entity';
import { HnBrickUserService } from './brick-user/hn-brick-user.service';
import { HnBrickUserInviteDto } from './brick-user-invite/hn-brick-user-invite.dto';
import { HnBrickUserInvite } from './brick-user-invite/hn-brick-user-invite.entity';
import { HnBrickUserInviteService } from './brick-user-invite/hn-brick-user-invite.service';
import { HnBrickVersionDto } from './brick-version/hn-brick-version.dto';
import {
  HnBrickSettingsDTO,
  HnBrickVersion,
  HnNewVersionDTO,
  HnReferenceDTO,
  HnRepoType,
} from './brick-version/hn-brick-version.entity';
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
import { HnBrickSecurity } from './security/hn-brick.security';

export interface HnBrickUserBasedWhereOptionalParams {
  spacesFilter?: string[] | null;
  user?: HnUser | null;
}

@Injectable()
export class HnBrickAggregateService {
  private readonly logger = new Logger(HnBrickAggregateService.name);

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
    private readonly spaceAggregateService: HnSpaceAggregateService,
    private readonly spaceApiService: HnExternalSpaceApiService,
    private readonly brickSecurity: HnBrickSecurity,
    private readonly communitySecurity: HnCommunitySecurity
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
    user: HnUser | null = null
  ): Promise<ClPage<HnBrickDto>> {
    let publicSelected = false;
    let myBricks = false;
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

    const whereConditions: FindOptionsWhere<HnBrickEntity>[] | FindOptionsWhere<HnBrickEntity> = myBricks
      ? await this.getMyBricksWhereBrickConditions(publicSelected, spacesFilter, user)
      : await this.getUserBasedWhereBrickConditions(publicSelected, {
          spacesFilter: spacesFilter,
          user: user,
        });

    // Add where conditions based on filters
    if (titleFilter) {
      if (whereConditions instanceof Array) {
        whereConditions.map((wc) => (wc.name = Like(`%${ClStringHelper.escapeSqlLike(titleFilter)}%`)));
      } else {
        whereConditions.name = Like(`%${ClStringHelper.escapeSqlLike(titleFilter)}%`);
      }
    }

    return this.brickService.findBrickList(whereConditions, sortsCriteria, page, size);
  }

  /**
   * Find public bricks with filters (no space association).
   * Used by lab-facing routes to list bricks installable without
   * any space-level authorization.
   */
  async findPublicBricksWithFilter(
    titleFilter: string,
    page: number,
    size: number
  ): Promise<ClPage<HnBrickDto>> {
    const whereConditions: FindOptionsWhere<HnBrickEntity> = {
      visibility: HnBrickVisibility.PUBLIC,
      space: IsNull(),
    };

    if (titleFilter) {
      whereConditions.name = Like(`%${ClStringHelper.escapeSqlLike(titleFilter)}%`);
    }

    return this.brickService.findBrickList(whereConditions, [], page, size);
  }

  async findUserBricksWithCommonSpaces(
    user: HnUser,
    commonSpacesIds: string[],
    page: number,
    size: number
  ): Promise<ClPage<HnBrickDto>> {
    const whereConditions: FindOptionsWhere<HnBrickEntity>[] | FindOptionsWhere<HnBrickEntity> = [];

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

  async findBrickById(id: string, user: HnUser | null = null): Promise<HnBrick | null> {
    const whereConditions: FindOptionsWhere<HnBrickEntity>[] | FindOptionsWhere<HnBrickEntity> =
      await this.getUserBasedWhereBrickConditions(null, { spacesFilter: null, user: user });
    if (whereConditions instanceof Array) {
      whereConditions.map((wc) => (wc.id = id));
    } else {
      whereConditions.id = id;
    }
    return this.brickService.findOne(whereConditions);
  }

  /**
   * Lightweight findBrickById that skips eager relations.
   * Use when only brick columns (id, name, etc.) are needed.
   */
  async findBrickByIdLight(id: string, user: HnUser | null = null): Promise<HnBrick | null> {
    const whereConditions: FindOptionsWhere<HnBrickEntity>[] | FindOptionsWhere<HnBrickEntity> =
      await this.getUserBasedWhereBrickConditions(null, { spacesFilter: null, user: user });
    if (whereConditions instanceof Array) {
      whereConditions.map((wc) => (wc.id = id));
    } else {
      whereConditions.id = id;
    }
    return this.brickService.findOneLight(whereConditions);
  }

  async findBrickByIdAndCheck(id: string, user: HnUser | null = null): Promise<HnBrick> {
    const brick = await this.findBrickById(id, user);
    if (brick == null) {
      throw new BlBadRequestException(HnErrorText.BRICK_NOT_FOUND, {
        detailArgs: { id: id },
      });
    }
    return brick;
  }

  async findBrickByName(
    name: string,
    userId: string | null = null,
    strict: boolean = true
  ): Promise<HnBrick> {
    let whereConditions: FindOptionsWhere<HnBrickEntity>[] | FindOptionsWhere<HnBrickEntity> = {};

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

  /**
   * Lightweight findBrickByName that skips eager relations.
   * Use when only brick columns (id, name, etc.) are needed.
   */
  async findBrickByNameLight(
    name: string,
    userId: string | null = null,
    strict: boolean = true
  ): Promise<HnBrick> {
    let whereConditions: FindOptionsWhere<HnBrickEntity>[] | FindOptionsWhere<HnBrickEntity> = {};

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

    const brick = await this.brickService.findOneLight(whereConditions);

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
    const brick = await this.findBrickById(id, HnCurrentUserHelper.getCurrentUser());
    if (brick?.space != null) {
      await this.spaceAggregateService.assertCheckSpaceUser(
        brick.space.id,
        HnCurrentUserHelper.getAndCheckCurrentUser().id
      );
    }
  }

  async assertCheckBrickSpaceUserByName(brickName: string): Promise<void> {
    const brick: HnBrick = await this.findBrickByName(brickName);
    if (brick.space != null) {
      await this.spaceAggregateService.assertCheckSpaceUser(
        brick.space.id,
        HnCurrentUserHelper.getAndCheckCurrentUser().id
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

          if (technicalFolder != null) {
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
        }
        map.push(...brickMap);
      }
    }
    return map;
  }

  async createBrick(body: HnCreateBrickDTO): Promise<HnBrick> {
    const { brick, brickVersion } = await this.dataSource.transaction(async (entityManager) => {
      if (body.name.includes(' ')) {
        throw new BlBadRequestException(HnErrorText.BRICK_NAME_INVALID);
      }

      const brickExist = await this.brickService.findOne({ name: body.name });
      if (brickExist != null) {
        throw new BlBadRequestException(HnErrorText.BRICK_ALREADY_EXIST);
      }

      const newBrick = new HnBrickEntity();
      newBrick.initialize(body);

      if (newBrick.visibility === HnBrickVisibility.PRIVATE && !newBrick.space) {
        throw new BlBadRequestException('Private bricks must belong to a space');
      }

      // Create brick - catch duplicate in case of concurrent creation
      let brick: HnBrick;
      try {
        brick = await this.brickService.create(newBrick, entityManager);
      } catch (e: any) {
        if (e?.code === 'ER_DUP_ENTRY') {
          throw new BlBadRequestException(HnErrorText.BRICK_ALREADY_EXIST);
        }
        throw e;
      }

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
          brickName: brickMajorVersion.brick.name,
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

      return { brick, brickVersion: bv };
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
    const brick = await this.brickService.findBrickForInviteById(brickUserInvite.brick.id);
    if (brick == null) {
      throw new BlBadRequestException(HnErrorText.BRICK_NOT_FOUND, {
        detailArgs: { id: brickUserInvite.brick.id },
      });
    }
    await this.brickUserInviteService.acceptUserInvite(brickUserInvite);
    await this.brickUserService.createBrickUser(brick, HnCurrentUserHelper.getAndCheckCurrentUser());
    return brick;
  }

  async isBrickUserInviteValid(token: string): Promise<HnBrickUserInviteDto> {
    const brickUserInvite = await this.brickUserInviteService.getAndCheckInvite(token);
    if (!brickUserInvite) throw new BlUnauthorizedException('This invite is not valid');
    return new HnBrickUserInviteDto(brickUserInvite);
  }

  async editBrick(editedBrick: HnEditBrickDTO): Promise<HnBrick> {
    await this.assertUserCanEditBrick(editedBrick.id, false);
    let brick: HnBrick = await this.findBrickByIdAndCheck(editedBrick.id);
    brick = await this.brickService.editBrick(brick, editedBrick);

    try {
      const lastBrickMajorVersion = await this.brickMajorVersionService.getLatestBrickMajorVersion(brick.id);
      const brickVersion = lastBrickMajorVersion
        ? await this.brickVersionService.getLatestBrickVersion(lastBrickMajorVersion.id)
        : null;
      if (brickVersion != null) {
        await this.brickVersionService.sendBrickVersionIdToTransport(brickVersion.id);
      }
    } catch (e: any) {
      this.logger.error('Failed to send brick version to transport after edit', e);
    }

    return brick;
  }

  /**
   * @deprecated Use getBrickVersionCloneInfo instead
   */
  async findBrickByNameSpace(
    name: string,
    version: string,
    spaceApiKey?: string
  ): Promise<HnBrickVersionCloneInfoDTO> {
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

  async getBrickVersionInfo(name: string, version: string): Promise<HnBrickVersionInfoDTO> {
    const brickVersion: HnBrickVersion = await this.brickVersionService.getAndCheckBrickVersion(
      name,
      version
    );
    const brick = brickVersion.brickMajorVersion.brick;

    return {
      brickName: brick.name,
      brickVersion: brickVersion.version.toString(),
      repoType: brickVersion.repoType,
      repositoryUrl: brick.repositoryUrl,
      technicalInfo: brickVersion.technicalInfo,
    };
  }

  async getBrickVersionCloneInfo(name: string, version: string): Promise<HnBrickVersionCloneInfoDTO> {
    const brickVersion: HnBrickVersion = await this.brickVersionService.getAndCheckBrickVersion(
      name,
      version
    );
    const brick = brickVersion.brickMajorVersion.brick;

    if (brick.visibility === HnBrickVisibility.PRIVATE) {
      await this.checkLabBrickAccessByName(brick.name);
    }

    return {
      brickName: brick.name,
      brickVersion: brickVersion.version.toString(),
      repoType: brickVersion.repoType,
      repositoryUrl: brick.repositoryUrl,
      repositoryAccessUrl: brick.repositoryAccessUrl,
      technicalInfo: brickVersion.technicalInfo,
    };
  }

  /**
   * Check that the lab has access to the brick based on its name by calling the space API.
   * @param brickName The name of the brick to check access for.
   */
  private async checkLabBrickAccessByName(brickName: string): Promise<void> {
    const labApiKey = HnLabAuthGuard.getAndCheckLabApiKey();
    const result = await this.spaceApiService.checkLabBrickAccess(labApiKey, brickName);
    if (!result?.hasAccess) {
      throw new BlUnauthorizedException(HnErrorText.PRIVATE_BRICK_ACCESS_DENIED, {
        detailArgs: { brickName },
      });
    }
  }

  async isActualBrickAndNewVersion(
    body: HnIsActualBrickAndNewVersionDTO
  ): Promise<HnIsActualBrickAndNewVersionResponseDTO> {
    try {
      const brick: HnBrick = await this.findBrickByName(body.brickName);
      if (brick == null) {
        return {
          sameBrick: false,
          sameVersion: false,
        };
      }

      await this.brickSecurity.assertIsCreatorOrCoAuthor(brick, HnCurrentUserHelper.getAndCheckCurrentUser());

      const brickMajorVersion = await this.brickMajorVersionService.findBrickMajorVersionByBrickAndVersion(
        brick,
        body.inputBrickVersion
      );

      if (brickMajorVersion == null) {
        throw new BlUnauthorizedException('Impossible to create a new major version');
      }

      return this.brickVersionService.checkIfVersionExist(brickMajorVersion, body.inputBrickVersion);
    } catch {
      return {
        sameBrick: false,
        sameVersion: false,
      };
    }
  }

  async updateFolder(updatedFolder: HnNodeDTO): Promise<HnFolder> {
    await this.checkIfUserHasRightsOnFolder(updatedFolder.id);
    const folder = await this.updateFolderRecusive(updatedFolder);
    if (folder == null) {
      throw new BlBadRequestException('Failed to update folder');
    }
    return folder;
  }

  async getAndCheckBrickVersion(name: string, version: string): Promise<HnBrickVersion> {
    return this.brickVersionService.getAndCheckBrickVersion(name, version);
  }

  //------------------------------------- FOLDERS -------------------------------------

  async checkIfUserHasRightsOnFolder(id: string): Promise<void> {
    const folder = await this.folderService.findById(id);
    if (folder == null) {
      throw new BlBadRequestException('Folder not found', { detailArgs: { id: id } });
    }
    const brickMajorVersion: HnBrickMajorVersion = folder.brickMajorVersion;
    const brick: HnBrick = brickMajorVersion.brick;
    await this.brickSecurity.assertIsCreatorOrCoAuthor(brick, HnCurrentUserHelper.getAndCheckCurrentUser());
  }

  async createFolder(createFolder: HnNodeDTO): Promise<HnFolder> {
    if (createFolder.folderId == null) {
      throw new BlBadRequestException('Folder id is required');
    }
    await this.checkIfUserHasRightsOnFolder(createFolder.folderId);
    return this.folderService.create(createFolder);
  }

  private static readonly MAX_RECURSION_DEPTH = 50;

  async updateFolderRecusive(updatedFolder: HnNodeDTO, depth: number = 0): Promise<HnFolder | null> {
    if (depth > HnBrickAggregateService.MAX_RECURSION_DEPTH) return null;
    let folder = await this.folderService.findWithRelationById(updatedFolder.id);
    if (folder == null) {
      throw new BlBadRequestException('Folder not found', { detailArgs: { id: updatedFolder.id } });
    }
    if (depth === 0) {
      // real rename: recompute a unique path among the siblings of the parent folder
      if (folder.folder) {
        const { path, completePath } = await this.folderService.resolveNodePathInFolderId(
          folder.folder.id,
          updatedFolder.title,
          folder.id
        );
        folder.path = path;
        folder.completePath = completePath;
      } else {
        folder.path = ClStringHelper.generateUrlPathFromString(updatedFolder.title ?? '');
        folder.completePath = (folder.path ?? '') + '/';
      }
      folder.title = updatedFolder.title;
    } else {
      // propagation after an ancestor rename: keep the folder own path, only rebuild the prefix
      folder.completePath = folder.folder?.completePath
        ? folder.folder.completePath + (folder.path ?? '') + '/'
        : (folder.path ?? '') + '/';
    }

    folder = await this.folderService.save(folder);

    await this.updateChildCompletePath(folder, depth + 1);

    return folder;
  }

  async updateChildCompletePath(folder: HnFolder, depth: number = 0): Promise<void> {
    if (depth > HnBrickAggregateService.MAX_RECURSION_DEPTH) return;
    if (folder.documentations.length > 0) {
      for (const d of folder.documentations) {
        await this.documentationService.updateCompletePath(d, folder);
      }
    }

    if (folder.folders.length > 0) {
      for (const f of folder.folders) {
        const fDTO = new HnNodeDTO();
        fDTO.isFolder = true;
        fDTO.title = f.title ?? '';
        fDTO.id = f.id;
        await this.updateFolderRecusive(fDTO, depth + 1);
      }
    }
  }

  /**
   * Assign to a node (doc or folder) a path and complete path that are unique among the
   * siblings of its new parent. Used whenever a node is moved into another folder.
   */
  private assignResolvedPath(node: HnDocumentation | HnFolder, newParent: HnFolder): void {
    const { path, completePath } = HnFolderService.resolveNodePath(newParent, node.title, node.id);
    node.path = path;
    node.completePath = completePath;
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
    const olderParent = await this.folderService.findById(olderParentId);
    const newParent = await this.folderService.findById(newParentId);
    if (olderParent == null || newParent == null) {
      throw new BlBadRequestException('Folder not found');
    }

    const parentChanged = olderParentId != newParentId;

    if (parentChanged) {
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
      if (doc == null) {
        throw new BlBadRequestException(HnErrorText.DOCUMENTATION_NOT_FOUND, { detailArgs: { id: nodeId } });
      }
      doc.folder = newParent;
      doc.order = newOrder;
      // only recompute the path on an actual move, so a simple reorder never changes the url
      if (parentChanged) {
        this.assignResolvedPath(doc, newParent);
      }
      await this.documentationService.save(doc);
    } else {
      const folder = await this.folderService.findById(nodeId);
      if (folder == null) {
        throw new BlBadRequestException('Folder not found', { detailArgs: { id: nodeId } });
      }
      folder.folder = newParent;
      folder.folderId = newParent.id;
      folder.order = newOrder;
      if (parentChanged) {
        this.assignResolvedPath(folder, newParent);
        await this.folderService.save(folder);
        // the folder moved: cascade the new complete path down to its descendants
        await this.updateChildCompletePath(folder);
      } else {
        await this.folderService.save(folder);
      }
    }

    const mainFolder = await this.folderService.findById(mainFolderId);
    if (mainFolder == null) {
      throw new BlBadRequestException('Folder not found', { detailArgs: { id: mainFolderId } });
    }
    return await this.folderService.findBrickDocsNodesTree(mainFolder);
  }

  async updateTreeFolder(updatedTree: HnNode[]): Promise<HnNode[]> {
    for (const node of updatedTree) {
      let isUpdated = false;
      if (node.children) {
        const f = await this.folderService.findWithRelationById(node.id);
        if (f == null || f.folder == null || node.parentId == null) {
          throw new BlBadRequestException('Folder not found', { detailArgs: { id: node.id } });
        }
        const folderParentChanged = f.folderId != node.parentId;
        if (f.order != node.order || folderParentChanged) {
          isUpdated = true;
          f.order = node.order;
          const newParent = await this.folderService.findById(node.parentId);
          if (newParent == null) {
            throw new BlBadRequestException('Folder not found', { detailArgs: { id: node.parentId } });
          }
          if (folderParentChanged) {
            this.assignResolvedPath(f, newParent);
          }
          f.folder = newParent;
          f.folderId = newParent.id;
        }
        if (isUpdated) {
          await this.folderService.save(f);
        }
        // the folder moved: cascade the new complete path down to its descendants before recursing
        if (folderParentChanged) {
          await this.updateChildCompletePath(f);
        }
        await this.updateTreeFolder(node.children);
      } else {
        const d = await this.documentationService.findById(node.id);
        if (d == null || d.folder == null || node.parentId == null) {
          throw new BlBadRequestException(HnErrorText.DOCUMENTATION_NOT_FOUND, {
            detailArgs: { id: node.id },
          });
        }
        const docParentChanged = d.folder.id != node.parentId;
        if (d.order != node.order || docParentChanged) {
          isUpdated = true;
          d.order = node.order;
          const newParent = await this.folderService.findById(node.parentId);
          if (newParent == null) {
            throw new BlBadRequestException('Folder not found', { detailArgs: { id: node.parentId } });
          }
          if (docParentChanged) {
            this.assignResolvedPath(d, newParent);
          }
          d.folder = newParent;
        }
        if (isUpdated) {
          await this.documentationService.updatePosition(d);
        }
      }
    }
    return updatedTree;
  }

  async findDocsNodeByBrick(brickId: string, version: string): Promise<HnNode> {
    const brick = await this.findBrickByIdLight(brickId);
    if (brick == null) {
      throw new BlBadRequestException(HnErrorText.BRICK_NOT_FOUND, { detailArgs: { id: brickId } });
    }

    const brickMajorVersion = await this.brickMajorVersionService.findBrickMajorVersionByBrickAndVersion(
      brick,
      version
    );
    if (brickMajorVersion == null) {
      throw new BlBadRequestException(HnErrorText.BRICK_VERSION_NOT_FOUND, { detailArgs: { version } });
    }
    const mainFolder = await this.folderService.findFolderByBrickMajorVersion(brickMajorVersion);
    if (mainFolder == null) {
      throw new BlBadRequestException('Folder not found');
    }
    return await this.folderService.findBrickDocsNodesTree(mainFolder);
  }

  async findAllDocsByBrick(brickName: string, version: string): Promise<HnDocumentation[]> {
    const brick: HnBrick = await this.findBrickByName(brickName);
    const brickMajorVersion = await this.brickMajorVersionService.findBrickMajorVersionByBrickAndVersion(
      brick,
      version
    );
    if (brickMajorVersion == null) {
      throw new BlBadRequestException(HnErrorText.BRICK_VERSION_NOT_FOUND, { detailArgs: { version } });
    }
    const mainFolder = await this.folderService.findFolderByBrickMajorVersion(brickMajorVersion);
    if (mainFolder == null) {
      throw new BlBadRequestException('Folder not found');
    }
    return await this.folderService.findAllDocsByBrick(mainFolder);
  }

  async findAllTechnicalDocsByBrick(
    brickName: string,
    version: string
  ): Promise<Record<string, HnGeneratedDocEntity[]>> {
    const brick: HnBrick = await this.findBrickByName(brickName);
    const brickMajorVersion = await this.brickMajorVersionService.findBrickMajorVersionByBrickAndVersion(
      brick,
      version
    );
    if (brickMajorVersion == null) {
      return {};
    }
    const technicalFolder: HnTechnicalFolder | null = await this.technicalFolderService.findTechnicalFolder(
      brickMajorVersion.id
    );
    if (!technicalFolder) {
      return {};
    }
    return await this.technicalFolderService.findAllTechnicalDocsByBrick(technicalFolder);
  }

  async findAllFolders(): Promise<HnFolderDto[]> {
    return (await this.folderService.findAll())?.map((f) => new HnFolderDto(f));
  }

  async findFolderById(id: string): Promise<HnFolderDto> {
    const folder = await this.folderService.findById(id);
    if (folder == null) {
      throw new BlBadRequestException('Folder not found', { detailArgs: { id: id } });
    }
    return new HnFolderDto(folder);
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
    if (createDocumentation.folderId == null) {
      throw new BlBadRequestException('Folder id is required');
    }
    await this.checkIfUserHasRightsOnFolder(createDocumentation.folderId);

    const folder = await this.folderService.findById(createDocumentation.folderId);
    if (folder == null) {
      throw new BlBadRequestException('Folder not found', {
        detailArgs: { id: createDocumentation.folderId },
      });
    }
    return this.documentationService.create(createDocumentation, folder);
  }

  async findAllDocs(): Promise<HnDocumentationDTO[]> {
    const docs: HnDocumentation[] = await this.documentationService.findAll();
    const docsDto: HnDocumentationDTO[] = [];
    docs.map((doc) => {
      if (!(doc.path ?? '').includes('/')) {
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

    const doc = await this.documentationService.findById(updatedDoc.id);
    const parentFolder = await this.folderService.findById(doc.folder.id);
    if (parentFolder == null) {
      throw new BlBadRequestException('Folder not found', { detailArgs: { id: doc.folder.id } });
    }

    return this.documentationService.update(updatedDoc, parentFolder);
  }

  async saveDocImage(file: BlFile, docId: string): Promise<TeBlockFigureUploadedResponse> {
    await this.checkIfUserHasRightsOnDoc(docId);
    const documentation = await this.documentationService.findById(docId);
    if (documentation == null) {
      throw new BlBadRequestException(HnErrorText.DOCUMENTATION_NOT_FOUND, { detailArgs: { id: docId } });
    }
    return this.fileDocumentationService.saveImage(documentation, file);
  }

  async updateDocContent(id: string, updateContentDoc: TeRichText): Promise<HnDocumentation> {
    await this.checkIfUserHasRightsOnDoc(id);
    return this.documentationService.updateContent(id, updateContentDoc);
  }

  async checkIfUserHasRightsOnDoc(id: string): Promise<void> {
    const doc = await this.documentationService.findById(id);
    if (doc == null || doc.folder == null) {
      throw new BlBadRequestException(HnErrorText.DOCUMENTATION_NOT_FOUND, { detailArgs: { id: id } });
    }
    const folder: HnFolder = doc.folder;
    const brickMajorVersion: HnBrickMajorVersion = folder.brickMajorVersion;
    const brick: HnBrick = brickMajorVersion.brick;
    await this.brickSecurity.assertIsCreatorOrCoAuthor(brick, HnCurrentUserHelper.getAndCheckCurrentUser());
  }

  async findDocsByParentId(id: string): Promise<HnDocumentationDto[]> {
    return (await this.folderService.findDocsByParentId(id))?.map((d) => new HnDocumentationDto(d));
  }

  async findRootFolderId(brickId: string, version: string): Promise<{ id: string }> {
    const brick: HnBrick = await this.findBrickByIdAndCheck(brickId);

    const brickMajorVersion = await this.brickMajorVersionService.findBrickMajorVersionByBrickAndVersion(
      brick,
      version
    );
    if (brickMajorVersion == null) {
      throw new BlBadRequestException(HnErrorText.BRICK_VERSION_NOT_FOUND, { detailArgs: { version } });
    }
    const mainFolder = await this.folderService.findFolderByBrickMajorVersion(brickMajorVersion);
    if (mainFolder == null) {
      throw new BlBadRequestException('Folder not found');
    }
    return { id: mainFolder.id };
  }

  async findCurrentDoc(
    brickName: string,
    version: string,
    completePath: string
  ): Promise<HnDocumentationDto> {
    const brick: HnBrick = await this.findBrickByName(brickName);

    const brickMajorVersion = await this.brickMajorVersionService.findBrickMajorVersionByBrickAndVersion(
      brick,
      version
    );
    if (brickMajorVersion == null) {
      throw new BlBadRequestException(HnErrorText.BRICK_VERSION_NOT_FOUND, { detailArgs: { version } });
    }

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
    const brickMajorVersion = await this.brickMajorVersionService.findBrickMajorVersionByBrickAndVersion(
      brick,
      version
    );
    if (brickMajorVersion == null) {
      throw new BlBadRequestException(HnErrorText.BRICK_VERSION_NOT_FOUND, { detailArgs: { version } });
    }
    const findFirstDocNode = await this.folderService.findFirstDocNode(brickMajorVersion);
    if (findFirstDocNode == null) {
      throw new BlBadRequestException(HnErrorText.DOCUMENTATION_NOT_FOUND);
    }
    const doc = await this.documentationService.findById(findFirstDocNode.id);
    if (doc == null) {
      throw new BlBadRequestException(HnErrorText.DOCUMENTATION_NOT_FOUND, {
        detailArgs: { id: findFirstDocNode.id },
      });
    }
    return new HnDocumentationDto(doc);
  }

  async getDocsByBrickNameMajor(brickName: string, major: string): Promise<HnDocumentationSearchDTO[]> {
    const majorNumber: number =
      major === 'latest' ? (await this.getLatestBrickVersion(brickName)).version.major : +major.slice(1);

    const brick: HnBrick = await this.findBrickByName(brickName);

    const brickMajorVersion = await this.brickMajorVersionService.findOneByBrickIdAndMajor(
      brick.id,
      majorNumber
    );
    if (brickMajorVersion == null) {
      throw new BlBadRequestException(HnErrorText.BRICK_VERSION_NOT_FOUND, { detailArgs: { major } });
    }

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
    const brickMajorVersion = await this.brickMajorVersionService.findBrickMajorVersionByBrickAndMajor(
      brick,
      brickVersionNumber
    );
    if (brickMajorVersion == null) {
      throw new BlBadRequestException(HnErrorText.BRICK_VERSION_NOT_FOUND, {
        detailArgs: { major: brickVersionNumber },
      });
    }

    const isATechnicalDoc: boolean = linkArray[4] === 'technical';

    // Prepare complete path and anchor of the doc
    let completePath: string = linkArray.slice(4).join('/');
    let anchor = '';
    if (completePath.includes('#')) {
      [completePath, anchor] = completePath.split('#');
    }
    completePath = completePath + '/';

    // Get doc or technical doc
    if (isATechnicalDoc) {
      return this.technicalFolderService.getTechDocByLink(brickMajorVersion, completePath, anchor);
    }
    const doc = await this.documentationService.getDocByLink(brickMajorVersion, completePath, anchor);
    if (doc == null) {
      throw new BlBadRequestException(HnErrorText.DOCUMENTATION_NOT_FOUND, {
        detailArgs: { completePath: completePath },
      });
    }
    return doc;
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
    const brickMajorVersion = await this.brickMajorVersionService.findOneByBrickIdAndMajor(
      brick.id,
      importVersion.major
    );
    if (brickMajorVersion == null) {
      return false;
    }

    // TODO: improve here to avoid resource task and protocols services in technicalForlderService
    return this.technicalFolderService.createTechnicalDoc(brickMajorVersion, content.importFile);
  }

  async getDocFiles(docId: string): Promise<HnAbstractFileEntityDTO[]> {
    const documentation = await this.documentationService.findById(docId);
    if (documentation == null) {
      throw new BlBadRequestException(HnErrorText.DOCUMENTATION_NOT_FOUND, { detailArgs: { id: docId } });
    }
    return this.fileDocumentationService.getDocFiles(documentation);
  }

  //------------------------------------- DOC HISTORY -------------------------------------
  async getDocModifications(docId: string): Promise<TeRichTextBlockModificationWithUser[]> {
    const doc = await this.documentationService.findById(docId);
    if (doc == null) {
      throw new BlBadRequestException(HnErrorText.DOCUMENTATION_NOT_FOUND, { detailArgs: { id: docId } });
    }

    const richText = doc.getRichTextAggregate();

    return richText.getModificationsDTO((userId) => this.userService.findUserBasicDTO(userId));
  }

  async getUndoContent(docId: string, modificationId: string): Promise<TeRichTextAggregate> {
    const doc = await this.documentationService.findById(docId);
    if (doc == null) {
      throw new BlBadRequestException(HnErrorText.DOCUMENTATION_NOT_FOUND, { detailArgs: { id: docId } });
    }
    return this.documentationService.getUndoContent(doc, modificationId);
  }

  async rollbackContent(docId: string, modificationId: string): Promise<HnDocumentation> {
    const doc = await this.documentationService.findById(docId);
    if (doc == null) {
      throw new BlBadRequestException(HnErrorText.DOCUMENTATION_NOT_FOUND, { detailArgs: { id: docId } });
    }
    return this.documentationService.rollbackContent(doc, modificationId);
  }

  //------------------------------------- TECHNICAL DOCS -------------------------------------

  async findTechnicalDoc(brickId: string, version: string): Promise<HnNode> {
    const brick: HnBrick = await this.findBrickByIdAndCheck(brickId);
    const brickMajorVersion = await this.brickMajorVersionService.findBrickMajorVersionByBrickAndVersion(
      brick,
      version
    );
    if (brickMajorVersion == null) {
      throw new BlBadRequestException(HnErrorText.BRICK_VERSION_NOT_FOUND, { detailArgs: { version } });
    }
    const node = await this.technicalFolderService.findTechnicalDoc(brickMajorVersion.id);
    if (node == null) {
      throw new BlBadRequestException(HnErrorText.TECHNICAL_DOCUMENTATION_NOT_FOUND);
    }
    return node;
  }

  async findTechDocByPath(input: HnTechnicalDocInputDTO): Promise<HnGeneratedDocEntity> {
    const brick: HnBrick = await this.findBrickByName(input.brickName);
    const brickMajorVersion = await this.brickMajorVersionService.findBrickMajorVersionByBrickAndVersion(
      brick,
      input.brickVersion
    );
    if (brickMajorVersion == null) {
      throw new BlBadRequestException(HnErrorText.BRICK_VERSION_NOT_FOUND, {
        detailArgs: { version: input.brickVersion },
      });
    }
    const techDoc = await this.technicalFolderService.findCurrentTecDoc(brickMajorVersion, input);
    if (techDoc == null) {
      throw new BlBadRequestException(HnErrorText.TECHNICAL_DOCUMENTATION_NOT_FOUND);
    }
    return techDoc;
  }

  async createNewVersion(newVersion: HnNewVersionDTO): Promise<HnNewVersionDTO> {
    const brick: HnBrick = await this.findBrickByName(newVersion.brickName);

    await this.assertUserCanEditBrick(brick.id, false);

    const brickMajorVersion = await this.brickMajorVersionService.getLatestBrickMajorVersion(brick.id);
    if (brickMajorVersion == null) {
      throw new BlBadRequestException(HnErrorText.BRICK_VERSION_NOT_FOUND);
    }

    const brickVersion = await this.brickVersionService.getLatestBrickVersion(brickMajorVersion.id);
    if (brickVersion == null) {
      throw new BlBadRequestException(HnErrorText.BRICK_VERSION_NOT_FOUND);
    }

    newVersion.repoType = brickVersion.repoType;
    const newMajor = parseInt(newVersion.version.split('.')[0]);

    // Verify if the new version match an existent major version
    if ((await this.brickMajorVersionService.findOneByBrickIdAndMajor(brick.id, newMajor)) == null) {
      throw new BlBadRequestException('Impossible to create a new major version');
    }

    const newBrickVersion = await this.dataSource.transaction(async (entityManager) => {
      return this.brickVersionService.createNewBrickVersion(brickMajorVersion, newVersion, entityManager);
    });
    await this.brickVersionService.sendBrickVersionIdToTransport(newBrickVersion.id);

    return newVersion;
  }

  async createVersionFromSettings(settings: HnBrickSettingsDTO): Promise<HnNewVersionDTO> {
    const repoType = (settings.environment?.pip?.length ?? 0) > 0 ? HnRepoType.PIP : HnRepoType.GIT;

    const newVersionDTO = new HnNewVersionDTO();
    newVersionDTO.brickName = settings.name;
    newVersionDTO.version = settings.version;
    newVersionDTO.repoType = repoType;
    newVersionDTO.technicalInfo = settings.technical_info;

    return this.createNewVersion(newVersionDTO);
  }

  //------------------------------------- VERSION -------------------------------------

  async getLatestBrickVersion(brickName: string): Promise<HnBrickVersion> {
    const brick: HnBrick = await this.findBrickByNameLight(brickName);
    const brickMajorVersion = await this.brickMajorVersionService.getLatestBrickMajorVersion(brick.id);
    if (brickMajorVersion == null) {
      throw new BlBadRequestException(HnErrorText.BRICK_VERSION_NOT_FOUND);
    }
    const brickVersion = await this.brickVersionService.getLatestBrickVersion(brickMajorVersion.id);
    if (brickVersion == null) {
      throw new BlBadRequestException(HnErrorText.BRICK_VERSION_NOT_FOUND);
    }
    return brickVersion;
  }

  /**
   * Returns summary info (id, name, description, image, latest version and
   * whether a newer version exists) for a list of bricks identified by name
   * and the version the caller currently has.
   *
   * Beta versions are ignored: the returned last version and the
   * hasNewVersion flag are computed against the latest NORMAL (non-beta)
   * version only.
   *
   * Does not perform any space-level access check — intended for
   * lab-authenticated routes where access is controlled via lab API key.
   * Bricks that cannot be resolved (unknown name or no published non-beta
   * version) are silently skipped, so the result may be shorter than the input.
   */
  async getMultipleBrickInfo(requests: HnBrickInfoRequestDTO[]): Promise<HnBrickInfoDTO[]> {
    const result: HnBrickInfoDTO[] = [];

    for (const request of requests) {
      try {
        const brick: HnBrick = await this.findBrickByNameLight(request.name, null, false);

        const brickMajorVersion = await this.brickMajorVersionService.getLatestBrickMajorVersion(brick.id);
        if (brickMajorVersion == null) {
          continue;
        }
        const latestBrickVersion = await this.brickVersionService.getLatestNormalBrickVersion(
          brickMajorVersion.id
        );
        if (latestBrickVersion == null) {
          continue;
        }
        const latestVersion: BlVersion = latestBrickVersion.version;

        let hasNewVersion = false;
        try {
          const requestedVersion: BlVersion = BlVersion.fromString(request.version);
          hasNewVersion = requestedVersion.isLowerThan(latestVersion);
        } catch {
          // Invalid requested version string: cannot compare, leave hasNewVersion false.
        }

        result.push({
          id: brick.id,
          name: brick.name,
          description: brick.description,
          imageLink: brick.imageLink,
          lastVersion: latestVersion.toString(),
          hasNewVersion,
        });
      } catch {
        // Skip bricks that cannot be resolved (unknown name or no published version).
      }
    }

    return result;
  }

  async getCurrentBrickVersion(
    page: number,
    size: number,
    brickId: string
  ): Promise<ClPage<HnBrickVersionDto>> {
    const brick: HnBrick = await this.findBrickByIdAndCheck(brickId);
    const brickUsers = await this.brickUserService.getBrickUsers(brick);
    return this.brickVersionService.getCurrentBrickVersion(
      page,
      size,
      brickId,
      this.communitySecurity.isCreatorOrCoAuthor(
        brick,
        brickUsers,
        HnCurrentUserHelper.getCurrentUser()?.id ?? ''
      )
    );
  }

  async getVersionsList(
    brickId: string,
    userId: string | null = null,
    strict: boolean = true
  ): Promise<string[]> {
    if (strict) {
      const brick = await this.findBrickById(
        brickId,
        userId ? await this.userService.findOne(userId) : HnCurrentUserHelper.getCurrentUser()
      );
      if (brick == null) {
        throw new BlNotFoundException(HnErrorText.BRICK_NOT_FOUND, {
          detailArgs: { id: brickId },
        });
      }
    }
    return this.brickVersionService.getVersionsList(brickId);
  }

  /**
   * Returns the versions list for a brick identified by name.
   * Does not perform any space-level access check — intended for
   * lab-authenticated routes where access is controlled via lab API key.
   */
  async getVersionsListByName(brickName: string): Promise<string[]> {
    const brick: HnBrick = await this.findBrickByNameLight(brickName, null, false);
    return this.brickVersionService.getVersionsList(brick.id);
  }

  async sendAllBrickVersionToQueue(): Promise<void> {
    return this.brickVersionService.sendAllBrickVersionToQueue();
  }

  //------------------------------------- RESOURCE VIEW -------------------------------------
  async saveDocResourceViewFile(docId: string, file: BlFile): Promise<string> {
    await this.checkIfUserHasRightsOnDoc(docId);
    const doc = await this.documentationService.findById(docId);
    if (doc == null) {
      throw new BlBadRequestException(HnErrorText.DOCUMENTATION_NOT_FOUND, { detailArgs: { id: docId } });
    }
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
    if (doc == null) {
      throw new BlBadRequestException(HnErrorText.DOCUMENTATION_NOT_FOUND, { detailArgs: { id: docId } });
    }
    return await this.fileDocumentationService.saveFile(doc, file);
  }

  async inviteBrickCoAuthor(brickId: string, emailOrId: string): Promise<HnBrick> {
    await this.assertUserCanEditBrick(brickId);
    const brick: HnBrick = await this.findBrickByIdAndCheck(brickId);
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
    return this.brickUserService.getBrickUsers(await this.findBrickByIdAndCheck(brickId));
  }

  async checkIfUserCanEditBrick(brickId: string, fullRight = true): Promise<boolean> {
    const brick = await this.findBrickByIdAndCheck(brickId);
    const user = HnCurrentUserHelper.getCurrentUser();
    if (user == null) {
      return false;
    }
    return this.brickSecurity.canEdit(brick, user, fullRight);
  }

  async assertUserCanEditBrick(brickId: string, fullRight = true): Promise<void> {
    const brick = await this.findBrickByIdAndCheck(brickId);
    const user = HnCurrentUserHelper.getAndCheckCurrentUser();
    await this.brickSecurity.assertCanEdit(brick, user, fullRight);
  }

  public async getMyBricksWhereBrickConditions(
    publicSelected: boolean,
    spacesFilter: string[],
    user: HnUser | null = null
  ): Promise<FindOptionsWhere<HnBrickEntity>[] | FindOptionsWhere<HnBrickEntity>> {
    const currentUser: HnUser | null = user ?? HnCurrentUserHelper.getCurrentUser();

    if (currentUser == null) {
      throw new BlUnauthorizedException('You are not authorized to perform this action');
    }

    let whereConditions: FindOptionsWhere<HnBrickEntity>[] | FindOptionsWhere<HnBrickEntity>;

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
    if (brickMajorVersion == null) {
      throw new BlBadRequestException(HnErrorText.BRICK_VERSION_NOT_FOUND);
    }
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
      docContentMarkdown += TeMarkdown.fromRichText(
        doc.getRichText(),
        `${this.configService.getApiUrl()}/documentation/${doc.id}/image`,
        docUrl
      );
      docsMarkDowns.push({
        name: ClStringHelper.getCleanUrlPath(doc.title),
        content: docContentMarkdown,
      });
    }

    return HnZipHelper.markdownsToZipFile(
      docsMarkDowns,
      ClStringHelper.getCleanUrlPath(brickMajorVersion.brick.name)
    );
  }

  public async downloadDocMarkdown(docId: string): Promise<BlFileResponse> {
    const doc = await this.documentationService.findById(docId);
    if (doc == null || doc.folder == null) {
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
    docContentMarkdown += TeMarkdown.fromRichText(
      doc.getRichText(),
      `${this.configService.getApiUrl()}/documentation/${doc.id}/image`,
      docUrl
    );

    return HnMarkdownHelper.createMarkdownResponse(
      ClStringHelper.getCleanUrlPath(doc.title) + '.md',
      docContentMarkdown
    );
  }

  public async downloadTechnicalDocMarkdown(techDocType: string, techDocId: string): Promise<BlFileResponse> {
    const techDoc = await this.technicalFolderService.findTechDocByIdAndType(techDocId, techDocType);
    if (techDoc == null) {
      throw new BlBadRequestException(HnErrorText.TECHNICAL_DOCUMENTATION_NOT_FOUND, {
        detailArgs: { id: techDocId },
      });
    }
    let techDocContentMarkdown = `# ${techDoc.uniqueName}\n\n`;
    techDocContentMarkdown += techDoc.doc;
    return HnMarkdownHelper.createMarkdownResponse(
      ClStringHelper.getCleanUrlPath(techDoc.uniqueName) + '.md',
      techDocContentMarkdown
    );
  }

  private async getUserBasedWhereBrickConditions(
    publicSelected: boolean | null = null,
    optionalParams?: HnBrickUserBasedWhereOptionalParams
  ): Promise<FindOptionsWhere<HnBrickEntity>[] | FindOptionsWhere<HnBrickEntity>> {
    const currentUser: HnUser | null = optionalParams?.user ?? HnCurrentUserHelper.getCurrentUser();
    let whereConditions: FindOptionsWhere<HnBrickEntity>[] | FindOptionsWhere<HnBrickEntity>;

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
