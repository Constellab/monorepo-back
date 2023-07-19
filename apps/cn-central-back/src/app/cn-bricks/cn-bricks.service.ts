import {Injectable} from '@nestjs/common';
import {CnBrick, CnBrickVisibility} from './cn-brick.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {FindOptionsWhere, IsNull, Repository} from 'typeorm';
import {CnBrickVersion, CnVersionType} from './cn-brick-version.entity';
import {CnBrickSaveDTO} from './cn-brick.dto';
import {BlAbstractService, BlBadRequestException, BlVersion} from '@monorepo/back-core-lib';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';

@Injectable()
export class CnBricksService extends BlAbstractService<CnBrick> {

  constructor(@InjectRepository(CnBrick) private brickRepo: Repository<CnBrick>,
              @InjectRepository(CnBrickVersion) private brickVersionRepo: Repository<CnBrickVersion>) {
    super(brickRepo, CnBrick);
  }


  public async saveBrick(brickSaveDTO: CnBrickSaveDTO): Promise<void> {
    // create or update the brick
    let brick: CnBrick = new CnBrick();
    brick.id = brickSaveDTO.id;
    brick.name = brickSaveDTO.name;
    brick.pipRepo = brickSaveDTO.pipRepo;
    brick.gitRepo = brickSaveDTO.gitRepo;
    brick.visibility = brickSaveDTO.visibility;
    brick = await this.brickRepo.save(brick);

    // create or update brick version
    for (const versionDTO of brickSaveDTO.versions) {
      const brickVersion = new CnBrickVersion();
      brickVersion.id = versionDTO.id;
      brickVersion.major = versionDTO.major;
      brickVersion.minor = versionDTO.minor;
      brickVersion.patch = versionDTO.patch;
      brickVersion.subPatch = versionDTO.subPatch;
      brickVersion.versionType = versionDTO.versionType;
      brickVersion.versionState = versionDTO.versionState;
      brickVersion.repoType = versionDTO.repoType;
      brickVersion.technicalInfo = versionDTO.technicalInfo;
      brickVersion.brick = brick;
      await this.brickVersionRepo.save(brickVersion);
    }
  }

  public findByName(name: string): Promise<CnBrick> {
    return this.brickRepo.findOne({where: {name: name}});
  }

  public getBrickVersion(name: string, version: BlVersion): Promise<CnBrickVersion | null> {
    return this.brickVersionRepo.findOne(
      {
        where: {
          brick: {name: name},
          major: version.major,
          minor: version.minor,
          patch: version.patch,
          versionType: version.isBeta() ? CnVersionType.BETA : CnVersionType.NORMAL,
          subPatch: version.isBeta() ? version.subPatch : IsNull()
        },
        relations: ['brick']
      });
  }

  public async getBrickVersionAndCheck(name: string, version: BlVersion): Promise<CnBrickVersion> {
    const brickVersion = await this.getBrickVersion(name, version);

    if (brickVersion == null) {
      // eslint-disable-next-line max-len
      throw new BlBadRequestException(`The version '${version.toString()}' does not exist on brick '${name}'. Please register the version on the hub.`);
    }

    return brickVersion;
  }

  public getAllBricks(): Promise<CnBrick[]> {
    // for non admin, only return public bricks
    const where: FindOptionsWhere<CnBrick> = {};
    if (!CnCurrentUserHelper.isAdmin()) {
      where.visibility = CnBrickVisibility.PUBLIC;
    }
    return this.brickRepo.find({
      where: where,
      relations: ['versions'],
      order: {name: 'ASC'}
    });
  }

  public async getBrickVersions(brickName: string): Promise<CnBrickVersion[]> {
    const brickVersions = await this.brickVersionRepo.find({
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

    // useful to sort with sub patch
    return brickVersions.sort((a, b) => b.version.getDif(a.version));
  }

  public async getByBrickVersionId(brickVersionId: string): Promise<CnBrick> {
    return (await this.brickVersionRepo.findOne({
      where: {id: brickVersionId},
      relations: ['brick']
    })).brick;
  }

  public async getBrickLatestVersion(brickName: string): Promise<CnBrickVersion | null> {
    const brickVersion = await this.brickVersionRepo.findOne({
      where: {
        brick: {name: brickName},
        versionType: CnVersionType.NORMAL,
      },
      order: {
        major: 'DESC',
        minor: 'DESC',
        patch: 'DESC'
      },
      relations: ['brick']
    });

    if(brickVersion) return brickVersion;
    // return the last version including beta
    return this.getBrickVersions(brickName).then(brickVersions => brickVersions[0]);
  }
}
