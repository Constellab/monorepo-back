import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {EntityManager, Repository} from 'typeorm';
import {HnLiveTaskVersion, HnLiveTaskVersionState} from './hn-live-task-version.entity';
import {HnLiveTask} from '../live-task/hn-live-task.entity';
import {HnLiveTaskVersionFileInput} from '../live-task/hn-live-task.dto';
import {BlQuillMigrator, BlRichTextI} from '@monorepo/back-core-lib';

@Injectable()
export class HnLiveTaskVersionService {
  constructor(
    @InjectRepository(HnLiveTaskVersion)
    private liveTaskVersionRepository: Repository<HnLiveTaskVersion>
  ) {
  }

  public async createFirstVersion(liveTask: HnLiveTask, versionFile: HnLiveTaskVersionFileInput,
                                  entityManager: EntityManager): Promise<HnLiveTaskVersion> {
    const liveTaskVersion = new HnLiveTaskVersion();
    liveTaskVersion.initVersion(liveTask, versionFile);
    return entityManager.save(liveTaskVersion);
  }

  public async createNewDraftVersion(lastLiveTaskVersion: HnLiveTaskVersion,
                                     newLiveTaskVersionFile: HnLiveTaskVersionFileInput,
                                     entityManager: EntityManager): Promise<HnLiveTaskVersion> {
    const liveTaskVersion = new HnLiveTaskVersion();
    liveTaskVersion.initNewDraftVersion(lastLiveTaskVersion, newLiveTaskVersionFile);
    return entityManager.save(liveTaskVersion);
  }

  public async findOne(id: string): Promise<HnLiveTaskVersion> {
    return this.liveTaskVersionRepository.findOneBy({id: id});
  }

  public async findByLiveTaskAndVersionNumber(liveTask: HnLiveTask, version: number): Promise<HnLiveTaskVersion> {
    return this.liveTaskVersionRepository.findOneBy({
      liveTask: {
        id: liveTask.id
      },
      version: version
    });
  }

  public async findLatestByLiveTask(liveTask: HnLiveTask): Promise<HnLiveTaskVersion> {
    return this.liveTaskVersionRepository.findOne({
      where: {
        liveTask: {
          id: liveTask.id
        }
      },
      order: {
        version: 'DESC'
      }
    });
  }

  public async findLatestPublishedByLiveTask(liveTask: HnLiveTask): Promise<HnLiveTaskVersion> {
    return this.liveTaskVersionRepository.findOneBy({
      liveTask: {
        id: liveTask.id
      },
      version: liveTask.latestPublishVersion,
      versionState: HnLiveTaskVersionState.PUBLISHED
    });
  }

  public async findAllByLiveTaskId(liveTaskId: string): Promise<HnLiveTaskVersion[]> {
    return this.liveTaskVersionRepository.find({
      where: {
        liveTask: {
          id: liveTaskId
        }
      },
      order: {
        version: 'DESC'
      }
    });
  }

  public async findPublishedByLiveTaskId(liveTaskId: string): Promise<HnLiveTaskVersion[]> {
    return this.liveTaskVersionRepository.find({
      where: {
        liveTask: {
          id: liveTaskId
        },
        versionState: HnLiveTaskVersionState.PUBLISHED
      },
      order: {
        version: 'DESC'
      }
    });
  }

  public async updateParams(id: string, params: string[]): Promise<HnLiveTaskVersion> {
    const liveTaskVersion = await this.liveTaskVersionRepository.findOneBy({id: id});
    liveTaskVersion.params = params;
    return this.liveTaskVersionRepository.save(liveTaskVersion);
  }

  public async updateCode(id: string, code: string): Promise<HnLiveTaskVersion> {
    const liveTaskVersion = await this.liveTaskVersionRepository.findOneBy({id: id});
    liveTaskVersion.code = code;
    return this.liveTaskVersionRepository.save(liveTaskVersion);
  }

  public async updateEnvironment(id: string, environment: string): Promise<HnLiveTaskVersion> {
    const liveTaskVersion = await this.liveTaskVersionRepository.findOneBy({id: id});
    liveTaskVersion.environment = environment;
    return this.liveTaskVersionRepository.save(liveTaskVersion);
  }

  public async publish(id: string, entityManager: EntityManager): Promise<HnLiveTaskVersion> {
    const liveTaskVersion = await this.liveTaskVersionRepository.findOneBy({id: id});
    if (liveTaskVersion.versionState === HnLiveTaskVersionState.PUBLISHED) {
      throw new Error('Cannot publish a live task version already published');
    }
    if(liveTaskVersion.code == null || liveTaskVersion.code.trim() === '') {
      throw new Error('Cannot publish a live task version without code');
    }
    liveTaskVersion.versionState = HnLiveTaskVersionState.PUBLISHED;
    return entityManager.save(liveTaskVersion);
  }

  public async updateVersionInfos(liveTaskVersionId: string, versionInfos: Record<string, any>): Promise<HnLiveTaskVersion> {
    const liveTaskVersion = await this.liveTaskVersionRepository.findOneBy({id: liveTaskVersionId});
    liveTaskVersion.versionInfos = versionInfos;
    return this.liveTaskVersionRepository.save(liveTaskVersion);
  }

  public async migrateLiveTaskVersion(liveTaskVersion: HnLiveTaskVersion): Promise<void> {
    liveTaskVersion.versionInfosBackup = liveTaskVersion.versionInfos;
    liveTaskVersion.versionInfos = new BlQuillMigrator(liveTaskVersion.versionInfos as BlRichTextI).migrate();
    await this.liveTaskVersionRepository.save(liveTaskVersion);
  }
}
