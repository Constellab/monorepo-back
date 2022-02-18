import {BadRequestException, Injectable} from '@nestjs/common';
import {CnAbstractService} from '../cn-core/class/cn-abstract.service';
import {CnLabFrontVersion} from './cn-lab-front-version.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {CnSaveLabFrontVersionDTO} from './cn-lab-front-version.dto';
import {CmVersion} from '@monorepo/common-model';
import {ClPageI} from '@monorepo/core-lib';

@Injectable()
export class CnLabFrontVersionsService extends CnAbstractService<CnLabFrontVersion> {

  constructor(@InjectRepository(CnLabFrontVersion) private repository: Repository<CnLabFrontVersion>) {
    super(repository, CnLabFrontVersion);
  }

  public async saveVersion(versionDTO: CnSaveLabFrontVersionDTO): Promise<CnLabFrontVersion> {
    const version = CmVersion.fromString(versionDTO.version);
    const frontVersion = new CnLabFrontVersion();
    frontVersion.id = versionDTO.id ? versionDTO.id: undefined;
    frontVersion.gwsCoreBrickVersion = versionDTO.gwsCoreBrickVersion;
    frontVersion.version = version;
    return this.save(frontVersion);
  }


  private async save(entity: CnLabFrontVersion): Promise<CnLabFrontVersion> {
    await this.checkBeforeSave(entity);
    return this.repository.save(entity);
  }

  private async checkBeforeSave(entity: CnLabFrontVersion): Promise<void> {
    const existing = await this.findByVersion(entity.major, entity.minor, entity.patch);
    if (existing && entity.id !== existing.id) {
      throw new BadRequestException(`The front version '${entity.version}' already exists`);
    }

    const existing2 = await this.findByGwsCoreVersion(entity.gwsCoreBrickVersion.id);
    if (existing2 && entity.id !== existing2.id) {
      // eslint-disable-next-line max-len
      throw new BadRequestException(`The gws core version '${entity.gwsCoreBrickVersion.version}' is already attached to the front '${existing2.version}'`);
    }
  }

  private findByVersion(major: number, minor: number, patch: number): Promise<CnLabFrontVersion | null> {
    return this.repository.findOne({
      where: {
        major: major,
        minor: minor,
        patch: patch
      }
    });
  }

  public findByGwsCoreVersion(gwsCoreBrickVersionId: string): Promise<CnLabFrontVersion | null> {
    return this.repository.findOne({
      where: {
        gwsCoreBrickVersion: gwsCoreBrickVersionId,
      }
    });
  }

  public getAllVersion(page: number, size: number): Promise<ClPageI<CnLabFrontVersion>> {
    return this.findPaginated(page, size, {
      order: {
        major: 'DESC',
        minor: 'DESC',
        patch: 'DESC'
      }
    });
  }
}
