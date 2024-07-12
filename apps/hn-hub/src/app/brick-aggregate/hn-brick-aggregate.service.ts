import {Injectable} from '@nestjs/common';
import {HnBrickService} from './brick/hn-brick.service';
import {
  HnBrickDto,
  HnBrickVersionDownloadDTO,
  HnCreateBrickDTO,
  HnCreateTechnicalDocContent,
  HnEditBrickDTO,
  HnIsActualBrickAndNewVersionDTO,
  HnTechnicalDocInputDTO
} from './brick/hn-brick.dto';
import {HnBrick, HnBrickVisibility} from './brick/hn-brick.entity';
import {HnFolderDto, HnNode, HnNodeDTO} from './folder/hn-folder.dto';
import {HnDocumentation, HnDocumentationDTO, HnDocumentationSearchDTO} from './documentation/hn-documentation.entity';
import {HnBrickVersion, HnNewVersionDTO, HnReferenceDTO} from './brick-version/hn-brick-version.entity';
import {HnBrickMajorVersionService} from './brick-major-version/hn-brick-major-version.service';
import {HnBrickVersionService} from './brick-version/hn-brick-version.service';
import {ClPage, ClStringHelper} from '@monorepo/core-lib';
import {DataSource, EntityManager, FindOptionsWhere, In, IsNull, Like} from 'typeorm';
import {HnBrickMajorVersion} from './brick-major-version/hn-brick-major-version.entity';
import {HnFolderService} from './folder/hn-folder.service';
import {HnFolder} from './folder/hn-folder.entity';
import {HnDocumentationService} from './documentation/hn-documentation.service';
import {
  BlBadRequestException,
  BlFile,
  BlFileResponse,
  BlRichTextContent,
  BlRichTextUploadedImageResponse,
  BlUnauthorizedException,
  BlVersion,
  BlNotFoundException
} from '@monorepo/back-core-lib';
import { HnBrickUserService } from './brick-user/hn-brick-user.service';
import { HnCurrentUserHelper } from '../core/utils/hn-current-user.helper';
import { HnBrickUserInviteService } from './brick-user-invite/hn-brick-user-invite.service';
import { HnBrickUserInvite } from './brick-user-invite/hn-brick-user-invite.entity';
import { HnBrickUser } from './brick-user/hn-brick-user.entity';
import { HnSiteMapEnumChangefreq, HnSitemapItemBase } from '../core/model/config/hn-site-map.class';
import { HnUser } from '../users/hn-user.entity';
import { HnCoreConfigService } from '../core/modules/core-config/hn-core-config.service';
import { HnTechnicalFolderService } from '../technical-folder/hn-technical-folder.service';
import { HnSpaceUserService } from '../space-aggregate/space-user/hn-space-user.service';
import { HnErrorText } from '../core/model/config/hn-error-text.class';
import { HnFrontService } from '../core/service/hn-front.service';
import { HnSpaceAggregateService } from '../space-aggregate/hn-space-aggregate.service';
import { HnUserService } from '../users/hn-user.service';
import { HnDocumentationDto } from './documentation/hn-documentation.dto';
import { HnGeneratedDocDto } from '../core/model/entities/hn-generated-doc.dto';
import { HnBrickUserInviteDto } from './brick-user-invite/hn-brick-user-invite.dto';
import { HnBrickVersionDto } from './brick-version/hn-brick-version.dto';
import { HnFileDocumentationService } from '../file-aggregate/file-documentation/hn-file-documentation.service';
import {HnAbstractFileEntityDTO, HnUploadFileResponseDto} from '../file-aggregate/file-core/hn-abstract-file.dto';
import { HnFileDocumentation } from '../file-aggregate/file-documentation/hn-file-documentation.entity';
import { HnFileType } from '../file-aggregate/file-core/hn-abstract-file.entity';

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
    private readonly spaceAggregateService: HnSpaceAggregateService,
    private datasource: DataSource
  ) {
  }

  //------------------------------------- BRICKS -------------------------------------

  async findBricksWithFilter(spacesFilter: string[], titleFilter: string,
                             page: number, size: number, userId: string = null): Promise<ClPage<HnBrickDto>> {

    let publicSelected = false;
    let myBricks = false;
    let user: HnUser;

    if (userId){
      user = await this.userService.findOne(userId);
      if (user == null)
        throw new BlBadRequestException('User not found');
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

    if (publicSelected) spacesFilter = spacesFilter.filter(s => s !== 'public');
    if (myBricks) spacesFilter = spacesFilter.filter(s => s !== 'my-bricks');

    const whereConditions: FindOptionsWhere<HnBrick>[] | FindOptionsWhere<HnBrick> =
      myBricks ? await this.getMyBricksWhereBrickConditions(publicSelected, spacesFilter, user) :
        await this.getUserBasedWhereBrickConditions(publicSelected, spacesFilter, user);

    // Add where conditions based on filters
    if (titleFilter) {
      if (whereConditions instanceof Array) {
        whereConditions.map(wc => wc.name = Like(`%${titleFilter}%`));
      } else {
        whereConditions.name = Like(`%${titleFilter}%`);
      }
    }

    return this.brickService.findBrickList(whereConditions, page, size);
  }

  async findUserBricksWithCommonSpaces(user: HnUser, commonSpacesIds: string[], page: number, size: number): Promise<ClPage<HnBrickDto>> {
    const whereConditions: FindOptionsWhere<HnBrick>[] | FindOptionsWhere<HnBrick> = [];

    const coAuthorBrickIds: string[] = (await this.brickUserService.getBrickUsersByUser(user)).map(b => b.brick.id);
    if (commonSpacesIds?.length > 0) {
      whereConditions.push({
        createdBy: {
          id: user.id
        },
        space: {
          id: In(commonSpacesIds)
        }
      });

      if (coAuthorBrickIds.length > 0) {
        whereConditions.push({
          id: In(coAuthorBrickIds),
          space: {
            id: In(commonSpacesIds)
          }
        });
      }
    }

    whereConditions.push({
      createdBy: {
        id: user.id
      },
      space: IsNull()
    });

    whereConditions.push({
      id: In(coAuthorBrickIds),
      space: IsNull()
    });

    return this.brickService.findBrickList(whereConditions, page, size);
  }

  async findUserBricks(userId: string, page: number, size: number): Promise<ClPage<HnBrickDto>> {
    const user = await this.userService.findOne(userId);
    if (!user) throw new BlNotFoundException('User not found');
    const currentUser = HnCurrentUserHelper.getCurrentUser();
    let commonSpacesIds: string[] = [];
    if (currentUser) {
      commonSpacesIds = (await this.spaceAggregateService.getUserCommonSpace(userId)).map(space => space.id);
    }
    return this.findUserBricksWithCommonSpaces(user, commonSpacesIds, page, size);
  }

  async findBrickById(id: string, user: HnUser = null): Promise<HnBrick> {
    const whereConditions: FindOptionsWhere<HnBrick>[] | FindOptionsWhere<HnBrick> =
      await this.getUserBasedWhereBrickConditions(null, null, user);
    if (whereConditions instanceof Array) {
      whereConditions.map(wc => wc.id = id);
    } else {
      whereConditions.id = id;
    }
    return this.brickService.findOne(whereConditions);
  }

  async findBrickByName(name: string, userId: string = null): Promise<HnBrick> {
    const whereConditions: FindOptionsWhere<HnBrick>[] | FindOptionsWhere<HnBrick> =
      await this.getUserBasedWhereBrickConditions(null, null,
        userId ? await this.userService.findOne(userId) : HnCurrentUserHelper.getCurrentUser());
    if (whereConditions instanceof Array) {
      whereConditions.map(wc => wc.name = name);
    } else {
      whereConditions.name = name;
    }

    const brick = await this.brickService.findOne(whereConditions);

    if(brick == null){
      throw new BlBadRequestException(HnErrorText.BRICK_NOT_FOUND, {detailArgs: {name: name}});
    }

    // TODO : voir si c'est a modif
    if ((!HnCurrentUserHelper.getCurrentUser()?.isAdmin()
      && brick?.createdBy?.id === HnCurrentUserHelper?.getCurrentUser()?.id)) {
      brick.gitRepo = null;
      brick.pipRepo = null;
    }

    return brick;
  }

  async findAllMap(): Promise<HnSitemapItemBase[]> {
    const bricks: HnBrick[] = await this.brickService.find();
    const map: HnSitemapItemBase[] = [];
    for (const brick of bricks) {

      if (brick?.visibility === HnBrickVisibility.PUBLIC) {

        const brickMap: HnSitemapItemBase[] = [];

        const brickMajorVersions: HnBrickMajorVersion[] =
          await this.brickMajorVersionService.findBrickMajorVersionsByBrick(brick);

        for (const brickMajorVersion of brickMajorVersions) {

          // add docs
          const docs: HnDocumentation[] = await this.documentationService.getDocsByBrickVersion(brickMajorVersion.id);
          for (const doc of docs) {
            brickMap.push(
              {
                url: this.frontService.getBrickDocUrl(brickMajorVersion.brick.name, brickMajorVersion.getStrVersion(),
                  doc.id, doc.completePath),
                // last mode with format YYYY-MM-DD
                lastmod: doc.lastModifiedAt.toFormat('yyyy-MM-dd'),
                changefreq: HnSiteMapEnumChangefreq.MONTHLY,
                priority: brickMajorVersion.isLatest ? 0.8 : 0.3
              }
            );
          }

          // add technical docs
          const technicalFolder = await this.technicalFolderService.findTechnicalFolder(brickMajorVersion.id);
          const technicalDocs = await this.technicalFolderService.findTechDocsByBrickMajor(brickMajorVersion.id);

          for (const doc of technicalDocs) {
            brickMap.push(
              {
                url: this.frontService.getBrickTechnicalDocUrl(brickMajorVersion.brick.name,
                  brickMajorVersion.getStrVersion(), doc.getCompletePath()),
                // last mode with format YYYY-MM-DD
                lastmod: technicalFolder.lastModifiedAt.toFormat('yyyy-MM-dd'),
                changefreq: HnSiteMapEnumChangefreq.MONTHLY,
                priority: brickMajorVersion.isLatest ? 0.5 : 0.1
              }
            );
          }
        }
        map.push(...brickMap);
      }
    }
    return map;
  }

  async createBrick(body: HnCreateBrickDTO): Promise<HnBrick> {
    let brick: HnBrick;
    const brickVersion: HnBrickVersion = await this.dataSource.transaction(async entityManager => {
      // Create brick
      brick = await this.brickService.create(body, entityManager);

      // init subpatch version if beta
      if (body.isBeta) body.version.subPatch = body.subPatch;

      // Create brick major version
      const brickMajorVersion: HnBrickMajorVersion = await this.brickMajorVersionService.create(brick, body, entityManager);

      // Init the BlVersion to create the brick version
      const version: BlVersion = body.version.subPatch != null ?
        new BlVersion(+body.version.major, +body.version.minor,
          +body.version.patch, +body.version.subPatch) :
        new BlVersion(+body.version.major, +body.version.minor, +body.version.patch);

      // TODO: Improve brick version creation (simplify in the aggregate)
      const bv: HnBrickVersion = await this.brickVersionService.createNewBrickVersion(brickMajorVersion,
        {
          version: version.toString(),
          brickId: brickMajorVersion.brick.id,
          references: body.references,
          repoType: body.repoType,
          technicalInfo: body.technicalInfo
        }, entityManager);

      // Create main folders
      const mainFolder: HnFolder = await this.folderService.createMainFolders(brickMajorVersion, entityManager);

      // Create main doc
      await this.documentationService.createMainDoc(mainFolder, entityManager);

      return bv;
    });

    // Send brick version to transport
    await this.brickVersionService.sendBrickVersionIdToTransport(brickVersion.id);

    return brick;
  }

  async editBrickImage(id: string, file: BlFile): Promise<BlRichTextUploadedImageResponse> {
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
    if (!brickUserInvite)
      throw new BlUnauthorizedException('This invite is not valid');
    const brick: HnBrick = await this.brickService.findBrickForInviteById(brickUserInvite.brick.id);
    await this.brickUserInviteService.acceptBrickUserInvite(brickUserInvite);
    await this.brickUserService.createBrickUser(brick, HnCurrentUserHelper.getCurrentUser());
    return brick;
  }

  async isBrickUserInviteValid(token: string): Promise<HnBrickUserInviteDto> {
    const brickUserInvite =  await this.brickUserInviteService.getAndCheckInvite(token);
    if (!brickUserInvite)
      throw new BlUnauthorizedException('This invite is not valid');
    return new HnBrickUserInviteDto(brickUserInvite);
  }

  async editBrick(editedBrick: HnEditBrickDTO): Promise<HnBrick> {
    await this.assertUserCanEditBrick(editedBrick.id, false);
    let brick: HnBrick = await this.findBrickById(editedBrick.id);
    brick = await this.brickService.editBrick(brick, editedBrick);


    try {
      const lastBrickMajorVersion: HnBrickMajorVersion = await this.brickMajorVersionService.getLatestBrickMajorVersion(brick.id);
      const brickVersion = await this.brickVersionService.getLatestBrickVersion(lastBrickMajorVersion.id);
      await this.brickVersionService.sendBrickVersionIdToTransport(brickVersion.id);
    } catch (e: any){
      console.log(e)
    }

    return brick;
  }

  async findBrickByNameCentral(name: string, version: string, centralApiKey?: string): Promise<HnBrickVersionDownloadDTO> {
    const brick = await this.brickService.findByNameCentral(name);
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

  async isActualBrickAndNewVersion(body: HnIsActualBrickAndNewVersionDTO): Promise<[boolean, boolean]> {
    const brick: HnBrick = await this.findBrickById(body.brickId);
    this.brickService.checkIfUserHasRightOnTheBrick(brick);

    if (!body.inputBrickName || (brick && brick.name.toUpperCase() != body.inputBrickName.toUpperCase())) {
      return [false, false];
    }

    const brickMajorVersion: HnBrickMajorVersion =
      await this.brickMajorVersionService.findBrickMajorVersionByBrickAndVersion(brick, body.inputBrickVersion);

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
    folder.completePath = folder.folder.completePath ? folder.folder.completePath + folder.path + '/' : folder.path + '/';

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

  async updateTree(updatedTree: HnNode[]): Promise<HnNode[]> {
    await this.checkIfUserHasRightsOnFolder(updatedTree[0].parentId);
    return this.updateTreeFolder(updatedTree);
  }

  async updateTreeFolder(updatedTree: HnNode[]): Promise<HnNode[]> {
    for (const node of updatedTree) {
      let isUpdated = false;
      if (node.children) {
        const f: HnFolder = await this.folderService.findWithRelationById(node.id)
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
    return (await this.folderService.findAll())?.map(f => new HnFolderDto(f));
  }

  async findFolderById(id: string): Promise<HnFolderDto> {
    return new HnFolderDto(await this.folderService.findById(id));
  }

  async findFoldersByParentId(id: string): Promise<HnFolderDto[]> {
    return (await this.folderService.findFoldersByParentId(id))?.map(f => new HnFolderDto(f));
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
    if (doc == null){
      throw new BlBadRequestException(HnErrorText.DOCUMENTATION_NOT_FOUND, {detailArgs: {id: id}});
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

  async saveDocImage(file: BlFile, docId: string): Promise<BlRichTextUploadedImageResponse> {
    await this.checkIfUserHasRightsOnDoc(docId);
    const documentation: HnDocumentation = await this.documentationService.findById(docId);
    return this.fileDocumentationService.saveImage(documentation, file);
  }

  async updateDocContent(id: string, updateContentDoc: BlRichTextContent): Promise<HnDocumentation> {
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
    return (await this.folderService.findDocsByParentId(id))?.map(d => new HnDocumentationDto(d));
  }

  async findRootFolderId(brickId: string, version: string): Promise<{ id: string }> {
    const brick: HnBrick = await this.findBrickById(brickId);
    if (brick == null) {
      return {id: null};
    }

    const brickMajorVersion: HnBrickMajorVersion =
      await this.brickMajorVersionService.findBrickMajorVersionByBrickAndVersion(brick, version);
    const mainFolder = await this.folderService.findFolderByBrickMajorVersion(brickMajorVersion);
    return {id: mainFolder.id};
  }

  async findCurrentDoc(brickName: string, version: string, completePath: string): Promise<HnDocumentationDto> {
    const brick: HnBrick = await this.findBrickByName(brickName);

    const brickMajorVersion: HnBrickMajorVersion =
      await this.brickMajorVersionService.findBrickMajorVersionByBrickAndVersion(brick, version);

    if (!completePath.endsWith('/')) {
      completePath += '/';
    }

    const doc = await this.documentationService.findCurrentDoc(brickMajorVersion, completePath);
    if (doc == null) {
      throw new BlBadRequestException(HnErrorText.DOCUMENTATION_NOT_FOUND, {detailArgs: {completePath: completePath}});
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
    const majorNumber: number = major === 'latest' ? (await this.getLatestBrickVersion(brickName)).version.major : +(major.slice(1));

    const brick: HnBrick = await this.findBrickByName(brickName);
    if (brick == null) {
      return null;
    }

    const brickMajorVersion: HnBrickMajorVersion = await this.brickMajorVersionService.findOneByBrickIdAndMajor(brick.id, majorNumber);

    let res: HnDocumentationSearchDTO[] = [];
    // Add all docs from the main folder to result
    res = res.concat(await this.folderService.getDocsByBrickNameMajor(brickMajorVersion, major.toString(), brick.name));

    // Add technical docs from the technical folder to result
    res = res.concat(await this.technicalFolderService.getTechDocsByBrickNameMajor(brickMajorVersion.id, major.toString(), brick.name));

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
    const brickVersionNumber: number = linkArray[2] === 'latest' ?
      (await this.getLatestBrickVersion(brick.name)).version.major :
      +linkArray[2];
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
    return isATechnicalDoc ?
      this.technicalFolderService.getTechDocByLink(brickMajorVersion, completePath, anchor)
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
    return (await this.technicalFolderService.findCurrentTecDoc(brickMajorVersion, input)).toDto();
  }

  async createNewVersion(newVersion: HnNewVersionDTO): Promise<HnNewVersionDTO> {
    const brick: HnBrick = await this.findBrickById(newVersion.brickId);
    if (brick == null) {
      throw new BlBadRequestException('Brick not found');
    }

    await this.assertUserCanEditBrick(brick.id, false);

    const brickMajorVersion: HnBrickMajorVersion = await this.brickMajorVersionService.getLatestBrickMajorVersion(brick.id);

    const brickVersion: HnBrickVersion = await this.brickVersionService.getLatestBrickVersion(brickMajorVersion.id);

    newVersion.repoType = brickVersion.repoType;
    const newMajor = parseInt(newVersion.version.split('.')[0]);

    // Verify if the new version match an existent major version
    if (await this.brickMajorVersionService.findOneByBrickIdAndMajor(brick.id, newMajor) == null) {
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

  async getCurrentBrickVersion(page: number, size: number, brickId: string): Promise<ClPage<HnBrickVersionDto>> {
    const brick: HnBrick = await this.findBrickById(brickId);
    return this.brickVersionService.getCurrentBrickVersion(page, size, brickId, this.brickService.userHasRightOnBrick(brick));
  }

  async getVersionsList(brickId: string, userId: string = null): Promise<string[]>{
    const brick = await this.findBrickById(brickId, userId ? await this.userService.findOne(userId) : HnCurrentUserHelper.getCurrentUser());
    if (brick == null) {
      throw new BlNotFoundException(HnErrorText.BRICK_NOT_FOUND, {detailArgs: {id: brickId}})
    }
    return this.brickVersionService.getVersionsList(brickId);
  }

  async sendAllBrickVersionToQueue(): Promise<void> {
    return this.brickVersionService.sendAllBrickVersionToQueue();
  }

  //------------------------------------- RESOURCE VIEW -------------------------------------
  async saveDocResourceViewFile(docId: string, file: BlFile): Promise<string>{
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
    return (await this.brickUserInviteService.getBrickCoAuthorsPendingInvites(brickId))?.map(bu => new HnBrickUserInviteDto(bu));
  }


  //------------------------------------- DOCUMENTATION FILE -------------------------------------
  async saveFile(file: BlFile, docId: string): Promise<HnUploadFileResponseDto> {
    await this.checkIfUserHasRightsOnDoc(docId);
    const doc = await this.documentationService.findById(docId);
    return await this.fileDocumentationService.saveFile(doc, file);
  }

  async inviteBrickCoAuthor(brickId: string, email: string): Promise<HnBrick> {
    await this.assertUserCanEditBrick(brickId);
    const brick: HnBrick = await this.findBrickById(brickId);
    if (ClStringHelper.isEmail(email)) {
      await this.brickUserInviteService.createBrickUserMail(brick, email);
    }
    return brick;
  }

  async removeBrickCoAuthor(brickId: string, brickAuthorUserId: string): Promise<void> {
    await this.assertUserCanEditBrick(brickId);
    await this.brickUserService.checkAndRemoveBrickUser(brickId, brickAuthorUserId);
  }

  async deleteCoAuthorInvite(inviteId: string): Promise<boolean> {
    return await this.brickUserInviteService.deleteCoAuthorInvite(inviteId);
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
      return (brick.createdBy.id === HnCurrentUserHelper.getCurrentUser()?.id) ||
        !fullRight && brick.brickUsers.some(bu => bu.user.id === HnCurrentUserHelper.getCurrentUser().id);

    if (await this.spaceUserService.checkCurrentUserIsSpaceAdmin(brick.space.id)) {
      return true;
    }

    if (await this.spaceUserService.checkCurrentUserIsSpaceUser(brick.space.id)) {
      return (brick.createdBy.id === HnCurrentUserHelper.getCurrentUser()?.id) ||
        (brick.brickUsers.some(bu => bu.user.id === HnCurrentUserHelper.getCurrentUser().id));
    }

    // if not fullRight, check if the user is a brickAuthor
    return !fullRight && brick.brickUsers.some(bu => bu.user.id === HnCurrentUserHelper.getCurrentUser().id);
  }

  async assertUserCanEditBrick(brickId: string, fullRight = true): Promise<void> {
    if (!await this.checkIfUserCanEditBrick(brickId, fullRight)) {
      throw new BlUnauthorizedException('You are not authorized to perform this action');
    }
  }

  private async getUserBasedWhereBrickConditions(
    publicSelected: boolean = null,
    spacesFilter: string[] = null,
    user: HnUser = null
  ): Promise<FindOptionsWhere<HnBrick>[] | FindOptionsWhere<HnBrick>> {

    const currentUser: HnUser = user ?? HnCurrentUserHelper.getCurrentUser();
    let whereConditions: FindOptionsWhere<HnBrick>[] | FindOptionsWhere<HnBrick>;

    if (currentUser == null) {
      whereConditions = [
        {
          space: {
            id: IsNull()
          },
          visibility: HnBrickVisibility.PUBLIC
        }
      ]
    } else if (publicSelected) {
      whereConditions = [
        {
          space: {
            id: In(spacesFilter)
          },
        },
        {
          space: {
            id: IsNull()
          },
        }
      ];
    } else if (spacesFilter && spacesFilter.length > 0) {
      whereConditions = [
        {
          space: {
            id: In(spacesFilter)
          },
        }
      ];
    } else {
      const userSpacesIds: string[] = (await this.spaceUserService.findActiveSpaceUsersByUserId(currentUser?.id)).map(su => su.spaceId);

      whereConditions = [{
        visibility: HnBrickVisibility.PUBLIC
      }, {
        space: In(userSpacesIds)
      }];
    }

    return whereConditions;
  }

  public async getMyBricksWhereBrickConditions(publicSelected: boolean,
                                               spacesFilter: string[],
                                               user: HnUser = null): Promise<FindOptionsWhere<HnBrick>[] | FindOptionsWhere<HnBrick>> {
    const currentUser: HnUser = user ?? HnCurrentUserHelper.getCurrentUser();

    if(currentUser == null) {
      throw new BlUnauthorizedException('You are not authorized to perform this action');
    }

    let whereConditions: FindOptionsWhere<HnBrick>[] | FindOptionsWhere<HnBrick>;

    const brickCoAuthor: HnBrickUser[] = await this.brickUserService.getBrickUsersByUser(currentUser);
    const brickCoAuthorBricksId: string[] = brickCoAuthor.map(bu => bu.brick.id);

    if (publicSelected) {
      whereConditions = [
        {
          space: {
            id: In(spacesFilter)
          },
          createdBy: {
            id: currentUser.id
          }
        },
        {
          space: {
            id: IsNull()
          },
          createdBy: {
            id: currentUser.id
          }
        },
        {
          space: {
            id: In(spacesFilter)
          },
          id: In(brickCoAuthorBricksId)
        },
        {
          space: {
            id: IsNull()
          },
          id: In(brickCoAuthorBricksId)
        }
      ];
    } else if (spacesFilter && spacesFilter.length > 0) {
      whereConditions = [
        {
          space: {
            id: In(spacesFilter)
          },
          createdBy: {
            id: currentUser.id
          }
        },
        {
          space: {
            id: In(spacesFilter)
          },
          id: In(brickCoAuthorBricksId)
        }
      ];
    } else {
      whereConditions = [{
        createdBy: {
          id: currentUser.id
        }
      }, {
        id: In(brickCoAuthorBricksId)
      }];
    }

    return whereConditions;

  }


  ////////////////////////////////////////// LIKES /////////////////////////////////
  public async addLike(brick: HnBrick, entityManager: EntityManager): Promise<HnBrick> {
    brick.likes++;
    return entityManager.save(brick, {listeners: false});
  }

  public async removeLike(brick: HnBrick, entityManager: EntityManager): Promise<HnBrick> {
    brick.likes--;
    return entityManager.save(brick, {listeners: false});
  }


  ////////////////////////////////////////// ADMIN /////////////////////////////////
  public async migrateDocBucketItemsName(): Promise<any>{
    const items: any[] = (await this.fileDocumentationService.getAllBucketItemsName()).map(i => [i.name, i.size]);
    let modif = 0;
    for(const [fileName, size] of items){
      if(fileName.includes('brick'))
        continue

      const docId = fileName.split('/')[0];

      const doc = await this.documentationService.findById(docId, false)
      if (doc && fileName.split('/').length == 3){
        const entityFile = await this.fileDocumentationService.getEntityFileByFileName(fileName);
        if (!entityFile){
          const docFile = await this.documentationService.getDocFile(fileName);
          const newDocFileEntity: HnFileDocumentation = new HnFileDocumentation();
          let type: HnFileType;
          switch (fileName.split('/')[1]){
            case 'files':
              type = HnFileType.FILE;
              break;
            case 'images':
              type = HnFileType.IMAGE;
              break;
            case 'views':
              type = HnFileType.RESOURCE_VIEW;
              break;
          }
          const name = (docFile != null && docFile.humanName != null) ? docFile.humanName : type.toString() + '.' + fileName.split('.')[1];
          newDocFileEntity.init(doc, fileName, type, name, size);

          await this.datasource.transaction(async entityManager => {
            const savedDocFileEntity = await this.fileDocumentationService.saveFileEntity(docId, newDocFileEntity, entityManager);
            await this.documentationService.updateDocImageFileName(doc, savedDocFileEntity, entityManager);
            modif++;
          });
        }
      }
    }
    return modif;
  }
}
