import {Injectable, UnauthorizedException} from '@nestjs/common';
import {BlAbstractService, BlFile} from '@monorepo/back-core-lib';
import {SnSmartDbEntity, SnSmartDbType} from '../model/sn-smart-db.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {In, Repository} from 'typeorm';
import {CnGroupsService} from '../../cn-groups/cn-groups.service';
import {CnAdminAuthorization} from '../../cn-core/security/cn-admin.authorization';
import {SnDocSearchResult, SnDocument, SnSmartDbExport} from '../model/sn-document.class';
import {ClPageI} from '@monorepo/core-lib';
import {SnDocService} from './sn-doc.service';


@Injectable()
export class SnSmartDbService extends BlAbstractService<SnSmartDbEntity> {

  constructor(@InjectRepository(SnSmartDbEntity) private repository: Repository<SnSmartDbEntity>,
              private groupService: CnGroupsService,
              private docService: SnDocService) {
    super(repository, SnSmartDbEntity);
  }

  /**
   * Return the SnSmartDbEntity only if user is admin or one of his group has access to smart DB
   * @param id
   */
  async getAndCheckAuthorizationToFindOne(id: string): Promise<SnSmartDbEntity> {
    const smartDb = await this.findByIdAndCheck(id);

    if (smartDb.type === SnSmartDbType.PUBLIC) {
      return smartDb;
    }

    if (!(new CnAdminAuthorization().isAuthorized()) && !await this.groupService.currentUserIsInGroup(smartDb.group.id)) {
      throw new UnauthorizedException();
    }

    return smartDb;
  }

  /**
   * Return the SnSmartDbEntity only if user is admin
   * @param id
   */
  async getAndCheckAuthorizationToUpdate(id: string): Promise<SnSmartDbEntity> {
    const smartDb = await this.findByIdAndCheck(id);

    if (!(new CnAdminAuthorization().isAuthorized())) {
      throw new UnauthorizedException();
    }

    return smartDb;
  }

  public async getCurrentSmartDb(page: number, size: number): Promise<ClPageI<SnSmartDbEntity>> {
    const userGroups = await this.groupService.getCurrentUserGroupIds();

    return this.findPaginated(page, size, {
      where: {
        groupId: In(userGroups)
      },
      relations: ['group']
    });
  }

  public async findByIdSecure(id: string): Promise<SnSmartDbEntity> {
    return this.getAndCheckAuthorizationToFindOne(id);
  }

  ///////////////////////////////// METHODS ON DOCS ////////////////////////////////

  async search(smartDbId: string, text: string, page: number, pageSize: number): Promise<ClPageI<SnDocSearchResult>> {
    const smartDb = await this.getAndCheckAuthorizationToFindOne(smartDbId);

    return this.docService.search(smartDb.dbIndex, text, page, pageSize);
  }

  async findDocByIdAndCheck(smartDbId: string, docId: string): Promise<SnDocument> {
    const smartDb = await this.getAndCheckAuthorizationToFindOne(smartDbId);

    return this.docService.findByIdAndCheck(smartDb.dbIndex, docId);
  }

  async validateDoc(smartDbId: string, doc: SnDocument): Promise<SnDocument> {
    const smartDb = await this.getAndCheckAuthorizationToUpdate(smartDbId);

    return this.docService.validateDoc(smartDb.dbIndex, doc);
  }


  async findNotValidated(smartDbId: string, page: number, pageSize: number): Promise<ClPageI<SnDocument>> {
    const smartDb = await this.getAndCheckAuthorizationToFindOne(smartDbId);

    return this.docService.findNotValidated(smartDb.dbIndex, page, pageSize);
  }


  async getIndex(smartDbId: string): Promise<any> {
    const smartDb = await this.getAndCheckAuthorizationToUpdate(smartDbId);

    return this.docService.getIndex(smartDb.dbIndex);
  }

  public async importDataFromFile(smartDbId: string, file: BlFile): Promise<SnDocument[]> {
    const smartDb = await this.getAndCheckAuthorizationToUpdate(smartDbId);

    return this.docService.importDataFromFile(smartDb.dbIndex, file);
  }

  public async init(smartDbId: string, file: BlFile): Promise<any> {
    const smartDb = await this.getAndCheckAuthorizationToUpdate(smartDbId);

    return this.docService.init(smartDb.dbIndex, file);
  }

  public async exportData(smartDbId: string): Promise<SnSmartDbExport> {
    const smartDb = await this.getAndCheckAuthorizationToUpdate(smartDbId);

    return this.docService.exportData(smartDb.dbIndex);

  }

}
