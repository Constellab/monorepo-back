import { HnAgentVersionFileInput } from '../agent/hn-agent.dto';
import { HnAgentVersionDto } from './hn-agent-version.dto';

export class HnAgentVersionMigrator {
  // TODO: Not necessary if all labs have a version over 0.10.0
  public migrateAgentVersionFile(agentVersionFile: HnAgentVersionFileInput): HnAgentVersionFileInput {
    if (agentVersionFile.json_version === 2) {
      return agentVersionFile;
    }

    if (agentVersionFile.json_version === 1) {
      agentVersionFile = this.migrateAgentVersionFileFromV1ToV2(agentVersionFile);
    }

    return agentVersionFile;
  }

  private migrateAgentVersionFileFromV1ToV2(
    agentVersionFileInput: HnAgentVersionFileInput
  ): HnAgentVersionFileInput {
    agentVersionFileInput.json_version = 2;
    agentVersionFileInput.params = (agentVersionFileInput.params as string[]).join('\n');
    return agentVersionFileInput;
  }

  public migrateAgentVersionToSpecificVersion(
    agentVersionDto: HnAgentVersionDto,
    version: number
  ): HnAgentVersionDto {
    if (version === 1) {
      if (agentVersionDto.params instanceof Array) {
        return agentVersionDto;
      } else {
        agentVersionDto.params = (agentVersionDto.params as string).split('\n');
        return agentVersionDto;
      }
    }

    if (version === 2) {
      if (agentVersionDto.params instanceof Array) {
        agentVersionDto.params = (agentVersionDto.params as string[]).join('\n');
        return agentVersionDto;
      }
    }

    return agentVersionDto;
  }
}
