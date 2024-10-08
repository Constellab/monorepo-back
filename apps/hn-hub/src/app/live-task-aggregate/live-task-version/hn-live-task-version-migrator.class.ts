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


  public migrateLiveTaskVersionToSpecificVersion(
    liveTaskVersion: HnLiveTaskVersionDto,
    version: number
  ): HnLiveTaskVersionDto {

    if (version === 1) {
      if (liveTaskVersion.params instanceof Array) {
        return liveTaskVersion;
      } else {
        liveTaskVersion.params = (liveTaskVersion.params as string).split('\n');
        return liveTaskVersion;
      }
    }

    if (version === 2) {
      if (liveTaskVersion.params instanceof Array) {
        liveTaskVersion.params = (liveTaskVersion.params as string[]).join('\n');
        return liveTaskVersion;
      }
    }

    return liveTaskVersion;
  }


}
