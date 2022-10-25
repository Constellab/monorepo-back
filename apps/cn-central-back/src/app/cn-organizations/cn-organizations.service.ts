import {Injectable} from '@nestjs/common';
import {CnOrganization} from './cn-organization.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {DeleteResult, EntityManager, Repository} from 'typeorm';
import {BlAbstractService, BlFile, BlObjectStorageService} from '@monorepo/back-core-lib';
import {ClPage} from '@monorepo/core-lib';
import {CnCoreConfigService} from '../cn-core/modules/cn-core-config/cn-core-config.service';
import {IncomingMessage} from 'http';

@Injectable()
export class CnOrganizationsService extends BlAbstractService<CnOrganization> {

  constructor(@InjectRepository(CnOrganization) private repository: Repository<CnOrganization>,
              private objectStorageService: BlObjectStorageService,
              private configService: CnCoreConfigService) {
    super(repository, CnOrganization);
  }


  public async getAll(page: number, size: number): Promise<ClPage<CnOrganization>> {
    return this.findPaginated(page, size, {order: {label: 'ASC'}});
  }


  public findByDomain(domain: string): Promise<CnOrganization | null> {
    return this.repository.findOneBy({domain});
  }


  async deleteById(id: string, entityManager?: EntityManager): Promise<DeleteResult> {
    const organization = await this.findByIdAndCheck(id, null, entityManager);
    await this.deleteOrganizationPhoto(organization);
    return super.deleteById(id, entityManager);
  }

  public async uploadPhoto(organization: CnOrganization, file: BlFile): Promise<CnOrganization> {

    await this.deleteOrganizationPhoto(organization);

    organization.photo = await this.objectStorageService.uploadObject(file, this.getReportImageBucket(),
      true);
    return this.update(organization);
  }

  private async deleteOrganizationPhoto(organization: CnOrganization): Promise<void> {
    if (organization.photo) {
      // use the same filename to overwrite the previous file
      await this.objectStorageService.deleteObject(organization.photo, this.getReportImageBucket());
    }
  }

  async getPhoto(filename: string): Promise<IncomingMessage> {
    return await this.objectStorageService.getObject(filename, this.getReportImageBucket());
  }

  private getReportImageBucket(): string {
    return this.configService.getOrganizationBucket();
  }
}
