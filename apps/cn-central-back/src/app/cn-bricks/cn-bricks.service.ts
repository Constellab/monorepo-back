import {Injectable} from '@nestjs/common';
import {CnAbstractService} from '../cn-core/class/cn-abstract.service';
import {CnBrick} from './cn-brick.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {EntityManager, Repository} from 'typeorm';
import {CnBrickVersion, CnRepoType} from './cn-brick-version.entity';
import {CmVersion} from '@monorepo/common-model';
import {CnBrickVersionDto} from './cn-brick.dto';

@Injectable()
export class CnBricksService extends CnAbstractService<CnBrick> {

  constructor(@InjectRepository(CnBrick) private brickRepo: Repository<CnBrick>,
              @InjectRepository(CnBrickVersion) private brickVersionRepo: Repository<CnBrickVersion>) {
    super(brickRepo, CnBrick);
  }

  public findByName(name: string): Promise<CnBrick> {
    return this.brickRepo.findOne({where: {name: name}});
  }

  public async getOrCreateByName(name: string, entityManager: EntityManager): Promise<CnBrick> {
    const brick = await this.findByName(name);

    if (brick) return brick;

    return this.createBrick(name, entityManager);
  }

  private createBrick(name: string, entityManager: EntityManager): Promise<CnBrick> {
    const brick = new CnBrick();
    brick.name = name;
    return entityManager.save(brick);
  }

  public async getOrCreateVersion(brickVersionDto: CnBrickVersionDto, entityManager: EntityManager): Promise<CnBrickVersion> {
    // check if the brick version exists
    const version = CmVersion.fromString(brickVersionDto.version);
    const brickVersion = await this.getBrickVersion(brickVersionDto.name, version);
    if (brickVersion) return brickVersion;

    return this.createBrickVersion(brickVersionDto, entityManager);
  }

  private async createBrickVersion(brickVersionDto: CnBrickVersionDto, entityManager: EntityManager): Promise<CnBrickVersion> {
    const version = CmVersion.fromString(brickVersionDto.version);

    const brick = await this.getOrCreateByName(brickVersionDto.name, entityManager);
    const brickVersion = new CnBrickVersion();
    brickVersion.brick = brick;
    brickVersion.isLatest = false;
    brickVersion.major = version.major;
    brickVersion.minor = version.minor;
    brickVersion.patch = version.patch;
    brickVersion.commitRef = brickVersionDto.repo_commit;
    brickVersion.repoType = brickVersionDto.repo_type === 'git' ? CnRepoType.GIT : CnRepoType.PIP;

    return entityManager.save(brickVersion);
  }

  private getBrickVersion(name: string, version: CmVersion): Promise<CnBrickVersion | null> {

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
}
