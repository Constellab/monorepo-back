import { HnLiveTaskVersionFileInput } from '../live-task/hn-live-task.dto';
import { HnLiveTaskVersionDto } from './hn-live-task-version.dto';

export class HnLiveTaskVersionMigrator {
  public migrateLiveTaskVersionFile(
    LiveTaskVersionFile: HnLiveTaskVersionFileInput
  ): HnLiveTaskVersionFileInput {
    if (LiveTaskVersionFile.json_version === 2) {
      return LiveTaskVersionFile;
    }

    if (LiveTaskVersionFile.json_version === 1) {
      LiveTaskVersionFile = this.migrateLiveTaskVersionFileFromV1ToV2(LiveTaskVersionFile);
    }

    return LiveTaskVersionFile;
  }

  private migrateLiveTaskVersionFileFromV1ToV2(
    LiveTaskVersionFile: HnLiveTaskVersionFileInput
  ): HnLiveTaskVersionFileInput {
    LiveTaskVersionFile.json_version = 2;
    LiveTaskVersionFile.params = (LiveTaskVersionFile.params as string[]).join('\n');
    return LiveTaskVersionFile;
  }

  public migrateLiveTaskVersion(liveTaskVersion: HnLiveTaskVersionDto): HnLiveTaskVersionDto {
    if (liveTaskVersion.version === 2) {
      return liveTaskVersion;
    }

    if (liveTaskVersion.version === 1) {
      liveTaskVersion = this.migrateLiveTaskVersionFromV1ToV2(liveTaskVersion);
    }

    return liveTaskVersion;
  }


  public migrateLiveTaskVersionToSpecificVersion(
    liveTaskVersion: HnLiveTaskVersionDto,
    version: number
  ): HnLiveTaskVersionDto {
    if (liveTaskVersion.version === version) {
      return liveTaskVersion;
    }

    if (liveTaskVersion.version === 2 && version === 1) {
      liveTaskVersion = this.migrateLiveTaskVersionFromV2ToV1(liveTaskVersion);
    }

    if (liveTaskVersion.version === 1 && version === 2) {
      liveTaskVersion = this.migrateLiveTaskVersionFromV1ToV2(liveTaskVersion);
    }

    return liveTaskVersion;
  }

  private migrateLiveTaskVersionFromV1ToV2(
    liveTaskVersion: HnLiveTaskVersionDto
  ): HnLiveTaskVersionDto {
    liveTaskVersion.version = 2;
    liveTaskVersion.params = (liveTaskVersion.params as string[]).join('\n');
    return liveTaskVersion;
  }

  private migrateLiveTaskVersionFromV2ToV1(
    liveTaskVersion: HnLiveTaskVersionDto
  ): HnLiveTaskVersionDto {
    liveTaskVersion.version = 1;
    liveTaskVersion.params = (liveTaskVersion.params as string).split('\n');
    return liveTaskVersion;
  }
}
