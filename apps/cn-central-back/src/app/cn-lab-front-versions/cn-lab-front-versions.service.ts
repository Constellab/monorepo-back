import {BadRequestException, Injectable} from '@nestjs/common';
import {CnLabFrontVersion} from './cn-lab-front-version.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {CnSaveLabFrontVersionDTO} from './cn-lab-front-version.dto';
import {CmVersion} from '@monorepo/common-model';
import {ClPageI} from '@monorepo/core-lib';
import {CnBricksService} from '../cn-bricks/cn-bricks.service';
import {CnBrickGWS} from '../cn-bricks/cn-brick.dto';
import {BlAbstractService} from '@monorepo/back-core-lib';

@Injectable()
export class CnLabFrontVersionsService extends BlAbstractService<CnLabFrontVersion> {

  constructor(@InjectRepository(CnLabFrontVersion) private repository: Repository<CnLabFrontVersion>,
              private brickService: CnBricksService) {
    super(repository, CnLabFrontVersion);
  }

  public async saveVersion(versionDTO: CnSaveLabFrontVersionDTO): Promise<CnLabFrontVersion> {
    const version = CmVersion.fromString(versionDTO.version);
    const gwsCoreVersion = CmVersion.fromString(versionDTO.gwsCoreBrickVersion);
    const frontVersion = new CnLabFrontVersion();
    frontVersion.id = versionDTO.id ? versionDTO.id : undefined;

    frontVersion.gwsCoreBrickVersion = await this.brickService.getBrickVersionAndCheck(CnBrickGWS.GWS_CORE, gwsCoreVersion);
    frontVersion.version = version;
    return this.save(frontVersion);
  }


  private async save(entity: CnLabFrontVersion): Promise<CnLabFrontVersion> {
    await this.checkBeforeSave(entity);
    return this.repository.save(entity);
  }

  private async checkBeforeSave(entity: CnLabFrontVersion): Promise<void> {
    const existing = await this.findByGwsCoreVersionId(entity.gwsCoreBrickVersion.id);
    if (existing && entity.id !== existing.id) {
      // eslint-disable-next-line max-len
      throw new BadRequestException(`The gws core version '${entity.gwsCoreBrickVersion.version}' is already attached to the front '${existing.version}'`);
    }
  }

  private findByGwsCoreVersionId(gwsCoreBrickVersionId: string): Promise<CnLabFrontVersion | null> {
    return this.repository.findOne({
      where: {
        gwsCoreBrickVersion: gwsCoreBrickVersionId,
      }
    });
  }

  public findByGwsCoreVersion(version: CmVersion): Promise<CnLabFrontVersion | null> {
    return this.repository.findOne({
      where: {
        gwsCoreBrickVersion: {
          major: version.major,
          minor: version.minor,
          patch: version.patch,
          subPatch: version.subPatch
        },
      },
      relations: ['gwsCoreBrickVersion']
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
