import {BadRequestException, Injectable} from '@nestjs/common';
import {CnAbstractService} from '../cn-core/class/cn-abstract.service';
import {CnBrick} from './cn-brick.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {CnBrickVersion} from './cn-brick-version.entity';
import {CmVersion} from '@monorepo/common-model';

@Injectable()
export class CnBricksService extends CnAbstractService<CnBrick> {

  constructor(@InjectRepository(CnBrick) private brickRepo: Repository<CnBrick>,
              @InjectRepository(CnBrickVersion) private brickVersionRepo: Repository<CnBrickVersion>) {
    super(brickRepo, CnBrick);
  }

  public findByName(name: string): Promise<CnBrick> {
    return this.brickRepo.findOne({where: {name: name}});
  }

  public getBrickVersion(name: string, version: CmVersion): Promise<CnBrickVersion | null> {
    return this.brickVersionRepo.findOne(
      {
        where: {
          brick: {name: name},
          major: version.major,
          minor: version.minor,
          patch: version.patch
        },
        relations: ['brick']
      });
  }

  public async getBrickVersionAndCheck(name: string, version: CmVersion): Promise<CnBrickVersion> {
    const brickVersion = await this.getBrickVersion(name, version);

    if (brickVersion == null) {
      // eslint-disable-next-line max-len
      throw new BadRequestException(`The version '${version.toString()}' does not exist on brick '${name}'. Please register the version on the hub.`);
    }

    return brickVersion;
  }

  public getAllBricks(): Promise<CnBrick[]> {
    return this.brickRepo.find({relations: ['versions']});
  }

  public getBrickVersions(brickName: string): Promise<CnBrickVersion[]> {
    return this.brickVersionRepo.find({
      where: {
        brick: {name: brickName},
      },
      order: {
        major: 'DESC',
        minor: 'DESC',
        patch: 'DESC'
      },
      relations: ['brick']
    });
  }
}
