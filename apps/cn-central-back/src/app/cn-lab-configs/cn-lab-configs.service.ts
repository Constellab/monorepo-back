import {Injectable} from '@nestjs/common';
import {CnAbstractService} from '../cn-core/class/cn-abstract.service';
import {CnLabConfig} from './cn-lab-config.entity';
import {InjectRepository} from '@nestjs/typeorm';
import {getManager, Repository} from 'typeorm';
import {CnUser} from '../cn-users/cn-user.entity';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';
import {CnLabConfigDto} from './cn-lab-config.dto';
import {ClHelpService} from '@monorepo/core-lib';
import {CnBricksService} from '../cn-bricks/cn-bricks.service';
import {CnBrickVersionDto} from '../cn-bricks/cn-brick.dto';
import {CnRepoType} from '../cn-bricks/cn-brick-version.entity';

@Injectable()
export class CnLabConfigsService extends CnAbstractService<CnLabConfig> {

  constructor(@InjectRepository(CnLabConfig) private repository: Repository<CnLabConfig>,
              private brickService: CnBricksService) {
    super(repository, CnLabConfig);
  }


  public getCurrentLabs(): Promise<CnLabConfig[]> {
    const user: CnUser = CnCurrentUserHelper.getAndCheckCurrentUser();

    return this.repository.find({
      where: {
        createdBy: {id: user.id},
      },
      order: {label: 'ASC'}
    });
  }

  public findAll(): Promise<CnLabConfig[]> {
    return this.repository.find({
      order: {label: 'ASC'}
    });
  }

  public async getOrCreateLabConfig(labConfigDto: CnLabConfigDto): Promise<CnLabConfig> {
    const hash = await this.hashBrickVersion(labConfigDto.brick_versions);

    const labConfig = await this.findByBrickVersionHash(hash);

    if (labConfig) {
      return labConfig;
    }

    return this.createLabConfig(labConfigDto, hash);
  }

  private async createLabConfig(labConfigDto: CnLabConfigDto, hash: number): Promise<CnLabConfig> {
    const labConfig: CnLabConfig = new CnLabConfig();
    labConfig.brickVersionsHash = hash;
    labConfig.label = '';
    labConfig.brickVersions = [];
    return await getManager().transaction(async entityManager => {

      for (const version of labConfigDto.brick_versions) {
        const brickVersion = await this.brickService.getOrCreateVersion(version, entityManager);
        labConfig.brickVersions.push(brickVersion);
      }

      await entityManager.save(labConfig);


      return labConfig;
    });
  }

  private findByBrickVersionHash(brickVersionHash: number): Promise<CnLabConfig | null> {
    return this.repository.findOne({
      where: {brickVersionsHash: brickVersionHash}
    });
  }

  private async hashBrickVersion(brickVersions: CnBrickVersionDto[]): Promise<number> {
    // create an object that is always formatted the same to create a hash
    const sortedVersions = ClHelpService.sortAlphabeticalOrder(brickVersions, a => a.name).map(
      version => ({
        name: version.name,
        version: version.version,
        repoType: version.repo_type,
        commit: version.repo_type === CnRepoType.GIT ? version.repo_commit : undefined
      })
    );

    return this.hash(JSON.stringify(sortedVersions));
  }


  private hash(str: string): number {
    let h = 0;
    for (let i = 0; i < str.length; i++)
      h = Math.imul(31, h) + str.charCodeAt(i) | 0;

    return h;
  }

}
