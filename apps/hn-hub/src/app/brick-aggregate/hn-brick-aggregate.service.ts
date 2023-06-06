import {Injectable} from '@nestjs/common';
import {HnBrickService} from './brick/hn-brick.service';
import {
  HnBrickListDTO,
  HnBrickVersionDownloadDTO,
  HnCreateBrickDTO,
  HnCreateTechnicalDocContent,
  HnEditBrickDTO,
  HnIsActualBrickAndNewVersionDTO,
  HnTechnicalDocInputDTO
} from './brick/hn-brick.dto';
import {HnBrick, HnBrickVisibility} from './brick/hn-brick.entity';
import {HnNode, HnNodeDTO} from './folder/hn-folder.dto';
import {HnDocumentation, HnDocumentationDTO, HnDocumentationSearchDTO} from './documentation/hn-documentation.entity';
import {HnGeneratedDocEntity} from '../core/model/entities/hn-generated-doc.entity';
import {HnBrickVersion, HnNewVersionDTO, HnReferenceDTO} from './brick-version/hn-brick-version.entity';
import {HnBrickMajorVersionService} from './brick-major-version/hn-brick-major-version.service';
import {HnBrickVersionService} from './brick-version/hn-brick-version.service';
import {ClPageI, ClStringHelper} from '@monorepo/core-lib';
import {DataSource} from 'typeorm';
import {HnBrickMajorVersion} from './brick-major-version/hn-brick-major-version.entity';
import {CmRichTextI, CmRichTextUploadedImage, CmVersion} from '@monorepo/common-model';
import {HnFolderService} from './folder/hn-folder.service';
import {HnFolder} from './folder/hn-folder.entity';
import {HnDocumentationService} from './documentation/hn-documentation.service';
import {BlFile, BlUnauthorizedException} from '@monorepo/back-core-lib';
import {IncomingMessage} from 'http';
import {HnBrickUserService} from './brick-user/hn-brick-user.service';
import {HnCurrentUserHelper} from '../core/utils/hn-current-user.helper';
import {HnBrickUserInviteService} from './brick-user-invite/hn-brick-user-invite.service';
import {HnBrickUserInvite} from './brick-user-invite/hn-brick-user-invite.entity';
import {HnBrickUser} from './brick-user/hn-brick-user.entity';

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
    private dataSource: DataSource
  ) {
  }

  //------------------------------------- BRICKS -------------------------------------

  async findBricks(): Promise<HnBrickListDTO[]> {
    return this.brickService.findBrickList();
  }

  async findAllMap(): Promise<string[]> {
    const bricks: HnBrick[] = await this.brickService.find();
    let map: string[] = [];
    for(const brick of bricks){
      if(brick.visibility === HnBrickVisibility.PUBLIC){
        const brickMap: string[] = await this.brickMajorVersionService.findBrickMap(brick);
        map = map.concat(brickMap);
      }
    }
    return map;
  }

  async createBrick(body: HnCreateBrickDTO): Promise<HnBrick> {
    let brick: HnBrick;
    const brickVersion: HnBrickVersion = await this.dataSource.transaction(async entityManager => {
      brick = await this.brickService.create(body, entityManager);
      if (!HnCurrentUserHelper.getCurrentUser().isAdmin()) {
        await this.brickUserService.createCreatorBrickUser(brick, HnCurrentUserHelper.getCurrentUser(), entityManager);
      }
      if (body.isBeta) body.version.subPatch = body.subPatch;
      const brickMajorVersion: HnBrickMajorVersion = await this.brickMajorVersionService.create(brick, body, entityManager);
      const version: CmVersion = body.version.subPatch != null ?
        new CmVersion(+body.version.major, +body.version.minor,
          +body.version.patch, +body.version.subPatch) :
        new CmVersion(+body.version.major, +body.version.minor, +body.version.patch);
      const bv: HnBrickVersion = await this.brickVersionService.createNewBrickVersion(brickMajorVersion,
        {
          version: version.toString(),
          brickId: brickMajorVersion.brick.id,
          references: body.references,
          repoType: body.repoType,
          technicalInfo: body.technicalInfo
        }, entityManager);
      await this.folderService.createMainFolders(brickMajorVersion, entityManager);
      return bv;
    });

    await this.brickVersionService.sendBrickVersionIdToTransport(brickVersion.id);
    return brick;
  }

  async updateBrickUsers(brickId: string, email: string): Promise<HnBrick> {
    const brick: HnBrick = await this.brickService.findById(brickId);

    if (!brick || (!HnCurrentUserHelper.getCurrentUser().isAdmin() && brick.createdBy.id !== HnCurrentUserHelper.getCurrentUser().id)) {
      throw new BlUnauthorizedException('You are not authorized to update this brick');
    }


    if (ClStringHelper.isEmail(email)) {
      await this.brickUserInviteService.createBrickUserMail(brick, email);
    }


    return brick;
  }

  async removeBrickUser(brickId: string, userId: string): Promise<boolean> {
    const brick: HnBrick = await this.brickService.findById(brickId);
    return this.brickUserService.checkAndRemoveBrickUser(brick, userId);
  }

  async acceptBrickUserInvite(token: string): Promise<HnBrick> {
    const brickUserInvite: HnBrickUserInvite = await this.brickUserInviteService.getAndCheckInvite(token);
    if (!brickUserInvite)
      throw new BlUnauthorizedException('This invite is not valid');
    const brick: HnBrick = await this.brickService.findBrickForInviteById(brickUserInvite.brick.id);
    await this.brickUserInviteService.acceptBrickUserInvite(brickUserInvite);
    await this.brickUserService.createSimpleBrickUser(brick, HnCurrentUserHelper.getCurrentUser());
    return brick;
  }

  async getBrickUsers(brickId: string): Promise<HnBrickUser[]> {
    const brick: HnBrick = await this.brickService.findById(brickId);
    if (!brick || (!HnCurrentUserHelper.getCurrentUser().isAdmin() && brick.createdBy.id !== HnCurrentUserHelper.getCurrentUser().id)) {
      throw new BlUnauthorizedException('You are not authorized to get users of this brick');
    }
    return this.brickUserService.getBrickUsers(brick);
  }

  async isBrickUserInviteValid(token: string): Promise<HnBrickUserInvite> {
    return await this.brickUserInviteService.getAndCheckInvite(token);
  }

  async editBrick(editedBrick: HnEditBrickDTO): Promise<HnBrick> {
    return this.brickService.editBrick(editedBrick);
  }

  async findBrickByName(name: string): Promise<HnBrick> {
    return this.brickService.findByName(name);
  }

  async findBrickByNameCentral(name: string, version: string, centralApiKey?: string): Promise<HnBrickVersionDownloadDTO> {
    return this.brickService.findByNameCentral(name, version, centralApiKey);
  }

  async isActualBrickAndNewVersion(body: HnIsActualBrickAndNewVersionDTO): Promise<[boolean, boolean]> {
    return this.brickService.isActualBrickAndNewVersion(body);
  }

  //------------------------------------- FOLDERS -------------------------------------

  async checkIfUserHasRightsOnFolder(id: string): Promise<void>{
    const folder: HnFolder = await this.folderService.findById(id);
    const brickMajorVersion: HnBrickMajorVersion = folder.brickMajorVersion;
    const brick: HnBrick = brickMajorVersion.brick;
    this.brickService.checkIfUserHasRightOnTheBrick(brick);
  }

  async createFolder(createFolder: HnNodeDTO): Promise<HnFolder> {
    await this.checkIfUserHasRightsOnFolder(createFolder.folderId);
    return this.folderService.create(createFolder);
  }

  async updateFolder(updatedFolder: HnNodeDTO): Promise<HnFolder> {
    await this.checkIfUserHasRightsOnFolder(updatedFolder.id);
    return this.folderService.update(updatedFolder);
  }

  async updateTree(updatedTree: HnNode[]): Promise<HnNode[]> {
    await this.checkIfUserHasRightsOnFolder(updatedTree[0].parentId);
    return this.folderService.updateTree(updatedTree);
  }

  async findAllFolders(): Promise<HnFolder[]> {
    return this.folderService.findAll();
  }

  async findFolderById(id: string): Promise<HnFolder> {
    return this.folderService.findById(id);
  }

  async findFoldersByParentId(id: string): Promise<HnFolder[]> {
    return this.folderService.findFoldersByParentId(id);
  }

  async removeFolder(id: string): Promise<void> {
    await this.checkIfUserHasRightsOnFolder(id);
    return this.folderService.remove(id);
  }

  //------------------------------------- DOCS -------------------------------------

  async createDoc(createDocumentation: HnNodeDTO): Promise<HnDocumentation> {
    await this.checkIfUserHasRightsOnFolder(createDocumentation.folderId);
    return this.folderService.createDoc(createDocumentation);
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

  async findDocById(id: string): Promise<HnDocumentation> {
    return this.documentationService.findById(id);
  }

  async removeDoc(id: string): Promise<void> {
    await this.checkIfUserHasRightsOnDoc(id);
    return this.documentationService.remove(id);
  }

  async updateDoc(updatedDoc: HnNodeDTO): Promise<HnDocumentation> {
    await this.checkIfUserHasRightsOnDoc(updatedDoc.id);
    return this.documentationService.update(updatedDoc);
  }

  async saveDocImage(file: BlFile): Promise<CmRichTextUploadedImage>{
    return this.documentationService.saveImage(file);
  }

  async getDocImage(id: string): Promise<IncomingMessage>{
    return this.documentationService.getImage(id);
  }

  async updateDocContent(id: string, updateContentDoc: CmRichTextI): Promise<HnDocumentation>{
    await this.checkIfUserHasRightsOnDoc(id);
    return this.documentationService.updateContent(id, updateContentDoc);
  }

  async checkIfUserHasRightsOnDoc(id: string): Promise<void>{
    const doc: HnDocumentation = await this.documentationService.findById(id);
    const folder: HnFolder = doc.folder;
    const brickMajorVersion: HnBrickMajorVersion = folder.brickMajorVersion;
    const brick: HnBrick = brickMajorVersion.brick;
    this.brickService.checkIfUserHasRightOnTheBrick(brick);
  }

  async findDocsByParentId(id: string): Promise<HnDocumentation[]> {
    return this.folderService.findDocsByParentId(id);
  }

  async findDocsByBrick(brickId: string, version: string): Promise<HnNode> {
    return this.brickService.findDocsByBrickAndVersion(await this.brickService.findById(brickId), version);
  }

  async findRootFolderId(brickId: string, version: string): Promise<{id: string }> {
    return {id: await this.brickService.findRootFolderId(await this.brickService.findById(brickId), version)};
  }

  async findCurrentDoc(brickName: string, version: string, body: any): Promise<HnNode | any> {
    return this.brickService.findCurrentDoc(await this.brickService.findByName(brickName), body.path, version);
  }

  async findFirstDoc(brickName: string, version: string): Promise<HnDocumentation> {
    return this.brickService.findFirstDoc(await this.brickService.findByName(brickName), version);
  }

  async getDocsByBrickNameMajor(brickName: string, major: string): Promise<HnDocumentationSearchDTO[]>{
    return this.brickService.getDocsByBrickNameMajor(
      brickName,
      major === 'latest' ? (await this.getLatestBrickVersion(brickName)).version.major : +(major.slice(1)));
  }

  async getDocByLink(link: string): Promise<HnDocumentationSearchDTO>{
    return this.brickService.getDocByLink(link);
  }

  //------------------------------------- TECHNICAL DOCS -------------------------------------

  async createTechnicalDoc(content: HnCreateTechnicalDocContent): Promise<boolean> {
    return this.brickService.createTechnicalDoc(content);
  }

  async findTechnicalDoc(brickId: string, version: string): Promise<HnNode> {
    return this.brickService.findTechnicalDoc(await this.brickService.findById(brickId), version);
  }

  async findTechDocByPath(input: HnTechnicalDocInputDTO): Promise<HnGeneratedDocEntity> {
    return this.brickService.findTechDoc(input);
  }

  //------------------------------------- VERSION -------------------------------------

  async createNewVersion(newVersion: HnNewVersionDTO): Promise<HnNewVersionDTO>{
    return this.brickService.createNewVersion(newVersion);
  }

  async getLatestBrickVersion(brickName: string): Promise<HnBrickVersion> {
    return this.brickService.getLatestBrickVersion(brickName);
  }

  async sendAllBrickVersionToQueue(): Promise<void> {
    return this.brickVersionService.sendAllBrickVersionToQueue();
  }

  async getCurrentBrickVersion(page: number, size: number, brickId: string): Promise<ClPageI<HnBrickVersion>>{
    return this.brickVersionService.getCurrentBrickVersion(page, size, brickId);
  }

  async getAllBrickVersionReferences(brickVersionId: string): Promise<HnReferenceDTO[]>{
    return this.brickVersionService.getAllReferences(brickVersionId);
  }

  async getBrickVersionDirectReferences(brickVersionId: string): Promise<HnReferenceDTO[]>{
    return this.brickVersionService.getDirectReferences(brickVersionId);
  }

}
