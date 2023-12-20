import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {EntityManager, Repository} from 'typeorm';
import {HnLiveTaskVersionBrickDependencies} from './hn-live-task-version-brick-dependencies.entity';
import {HnLiveTaskVersion} from '../live-task-version/hn-live-task-version.entity';
import {HnBrickVersion} from '../../brick-aggregate/brick-version/hn-brick-version.entity';

@Injectable()
export class HnLiveTaskVersionBrickDependenciesService {

  constructor(
    @InjectRepository(HnLiveTaskVersionBrickDependencies)
    private liveTaskVersionBrickDependenciesRepository: Repository<HnLiveTaskVersionBrickDependencies>,
  ) {
  }

  public async create(liveTaskVersion: HnLiveTaskVersion, brickVersion: HnBrickVersion,
                      entityManager: EntityManager): Promise<HnLiveTaskVersionBrickDependencies> {
    const liveTaskVersionBrickDependencies = new HnLiveTaskVersionBrickDependencies();
    liveTaskVersionBrickDependencies.init(liveTaskVersion, brickVersion);
    return entityManager.save(liveTaskVersionBrickDependencies);
  }

  public async getBrickVersionDependencies(liveTaskVersionId: string): Promise<HnLiveTaskVersionBrickDependencies[]> {
    return this.liveTaskVersionBrickDependenciesRepository.findBy({
      liveTaskVersionId: liveTaskVersionId
    });
  }
}
