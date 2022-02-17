import {Injectable} from '@nestjs/common';
import {CnLabFrontVersion} from './cn-lab-front-version.entity';
import {CnLabFrontVersionsService} from './cn-lab-front-versions.service';
import {CnAdminAuthorization} from '../cn-core/security/cn-admin.authorization';
import {CnSaveLabFrontVersionDTO} from './cn-lab-front-version.dto';
import {ClPageI} from '@monorepo/core-lib';

@Injectable()
export class CnLabFrontVersionsSecurityLayer {

  constructor(private service: CnLabFrontVersionsService) {
  }

  public async save(versionDTO: CnSaveLabFrontVersionDTO): Promise<CnLabFrontVersion> {
    this.checkModifyAuthorization();
    return this.service.saveVersion(versionDTO);
  }

  public async delete(versionId: string): Promise<void> {
    this.checkModifyAuthorization();
    await this.service.deleteById(versionId);
  }

  public getAll(page: number, size: number): Promise<ClPageI<CnLabFrontVersion>> {
    // need update access to get all
    this.checkModifyAuthorization();
    return this.service.getAllVersion(page, size);
  }

  private checkModifyAuthorization(): void {
    new CnAdminAuthorization().checkAuthorization();
  }

}
