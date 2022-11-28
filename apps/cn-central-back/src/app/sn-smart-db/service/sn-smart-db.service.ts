import {Injectable} from '@nestjs/common';
import {BlAbstractService, BlFile} from '@monorepo/back-core-lib';
import {SnSmartDbEntity} from '../model/sn-smart-db.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {DeleteResult, EntityManager, In, Repository} from 'typeorm';
import {SnDocSearchResult, SnDocument, SnSmartDbExport} from '../model/sn-document.class';
import {ClPageI, ClStringHelper} from '@monorepo/core-lib';
import {SnDocService} from './sn-doc.service';
import {CnCurrentUserHelper} from '../../cn-core/utils/cn-current-user.helper';
import {CnGroupsAggregateService} from '../../cn-groups/cn-groups-aggregate.service';
import {SnSmartDbSecurity} from './sn-smart-db.security';


@Injectable()
export class SnSmartDbService extends BlAbstractService<SnSmartDbEntity> {

  constructor(@InjectRepository(SnSmartDbEntity) private repository: Repository<SnSmartDbEntity>,
              private groupAggregateService: CnGroupsAggregateService,
              private docService: SnDocService,
              private smartDbSecurity: SnSmartDbSecurity) {
    super(repository, SnSmartDbEntity);
  }


  async create(entity: SnSmartDbEntity, entityManager?: EntityManager): Promise<SnSmartDbEntity> {
    await this.smartDbSecurity.checkAuthorizationToCreate(CnCurrentUserHelper.getAndCheckUserSpaceInfo());

    entity.dbIndex = ClStringHelper.generateUUID();
    entity.space = CnCurrentUserHelper.getCurrentSpace();
    return super.create(entity, entityManager);
  }


  protected async updateWithCompare(newEntity: SnSmartDbEntity, dbEntity: SnSmartDbEntity,
                                    entityManager?: EntityManager): Promise<SnSmartDbEntity> {
    await this.smartDbSecurity.checkAuthorizationToUpdate(dbEntity, CnCurrentUserHelper.getAndCheckUserSpaceInfo());
    return super.updateWithCompare(newEntity, dbEntity, entityManager);
  }


  async deleteById(id: string, entityManager?: EntityManager): Promise<DeleteResult> {
    const smartDb = await this.findByIdAndCheck(id);
    await this.smartDbSecurity.checkAuthorizationToUpdate(smartDb, CnCurrentUserHelper.getAndCheckUserSpaceInfo());

    await this.docService.deleteIndexIfExist(smartDb.dbIndex);

    return super.deleteById(id, entityManager);
  }

  /**
   * Return the SnSmartDbEntity only if user is admin or one of his group has access to smart DB
   * @param id
   */
  async getAndCheckAuthorizationToFindOne(id: string): Promise<SnSmartDbEntity> {
    const smartDb = await this.findByIdAndCheck(id);

    await this.smartDbSecurity.checkAuthorizationToFindOne(smartDb, CnCurrentUserHelper.getAndCheckUserSpaceInfo());

    return smartDb;
  }

  /**
   * Return the SnSmartDbEntity only if user is admin
   * @param id
   */
  async getAndCheckAuthorizationToUpdate(id: string): Promise<SnSmartDbEntity> {
    const smartDb = await this.findByIdAndCheck(id);

    await this.smartDbSecurity.checkAuthorizationToUpdate(smartDb, CnCurrentUserHelper.getAndCheckUserSpaceInfo());

    return smartDb;
  }

  public async getCurrentSmartDb(page: number, size: number): Promise<ClPageI<SnSmartDbEntity>> {
    const userGroups = await this.groupAggregateService.getAllGroupIdsByUserAndSpace(CnCurrentUserHelper.getAndCheckCurrentUser().id,
      CnCurrentUserHelper.getCurrentSpace().id);

    return this.findPaginated(page, size, {
      where: {
        groupId: In(userGroups)
      }
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
